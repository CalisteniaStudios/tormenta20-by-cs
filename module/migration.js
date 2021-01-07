/**
* Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
* @return {Promise}      A Promise which resolves once the migration is completed
*/
export const migrateWorld = async function() {
	ui.notifications.info(`Applying Tormenta20 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

	// Migrate World Actors
	// TODO migrate npcs
	// for ( let a of game.actors.entities ) {
	for ( let a of game.actors.entities.filter(ac=> ac.data.type=="character") ) {
		try {
			const updateData = migrateActorData(a.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrating Actor entity ${a.name}`);
				await a.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Failed tormenta20 system migration for Actor ${a.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Items
	for ( let i of game.items.entities ) {
		try {
			const updateData = migrateItemData(i.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrating Item entity ${i.name}`);
				await i.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Failed tormenta20 system migration for Item ${i.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Compendium Packs
	for ( let p of game.packs ) {
		if ( p.metadata.package !== "world" ) continue;
		if ( !["Actor", "Item", "Scene"].includes(p.metadata.entity) ) continue;
		await migrateCompendium(p);
	}

	// Set the migration as complete
	game.settings.set("tormenta20", "systemMigrationVersion", game.system.data.version);
	ui.notifications.info(`Tormenta20 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
};

/* -------------------------------------------- */

/**
* Apply migration rules to all Entities within a single Compendium pack
* @param pack
* @return {Promise}
*/
export const migrateCompendium = async function(pack) {
	const entity = pack.metadata.entity;
	if ( !["Item"].includes(entity) ) return;

	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({locked: false});

	// Begin by requesting server-side data model migration and get the migrated content
	await pack.migrate();
	const content = await pack.getContent();

	// Iterate over compendium entries - applying fine-tuned migration functions
	for ( let ent of content ) {
		let updateData = {};
		try {
			switch (entity) {
				case "Item":
				updateData = migrateItemData(ent.data);
				break;
			}
			if ( isObjectEmpty(updateData) ) continue;

			// Save the entry, if data was changed
			updateData["_id"] = ent._id;
			await pack.updateEntity(updateData);
			console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
		}

		// Handle migration failures
		catch(err) {
			err.message = `Failed tormenta20 system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
		}
	}

	// Apply the original locked status for the pack
	pack.configure({locked: wasLocked});
	console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function(actor) {
	const updateData = {};
	console.log(actor);
	// Actor Data Updates
	_migrateActorSkills(actor, updateData);

	// Migrate Owned Items
	if ( !actor.items ) return updateData;
	let hasItemUpdates = false;
	const items = actor.items.map(i => {

		// Migrate the Owned Item
		// Descomentar para migrar os itens nos personagens
		// let itemUpdate = migrateItemData(i);
		let itemUpdate = {};
		// Prepared, Equipped, and Proficient for NPC actors
		if ( actor.type === "npc" ) {
			
		}

		// Update the Owned Item
		if ( !isObjectEmpty(itemUpdate) ) {
			hasItemUpdates = true;
			return mergeObject(i, itemUpdate, {enforceTypes: false, inplace: false});
		} else return i;
	});
	if ( hasItemUpdates ) updateData.items = items;
	return updateData;
};

/* -------------------------------------------- */

	// TODO clean actor data

/* -------------------------------------------- */

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Migrate the actor speed string to movement object
 * @private
 */
function _migrateActorSkills(actor, updateData) {
	const ad = actor.data;

	let skillsArrays = [];
	skillsArrays.push(ad.pericias);
	skillsArrays.push(ad.pericias.ofi.mais);
	skillsArrays.push(ad.periciasCustom);
	let ar = ["data.pericias", "data.pericias.ofi.mais", "data.periciasCustom"];
	for (let [k, arr] of Object.entries(skillsArrays)) {
		for (let [key, pericia] of Object.entries(arr)) {
			
			let temp = ["true",true,"1",1].includes(pericia.treinado) ? 1:0;
			if(pericia.treinado !== temp){
				console.log(`${ar[k]}.${key}.treinado`);
				updateData[`${ar[k]}.${key}.treinado`] = temp;
			}
		}
	}
	return updateData;
}

/* -------------------------------------------- */

/**
* Migrate a single Item entity to incorporate latest data model changes
* @param item
*/
export const migrateItemData = function(item) {
	const updateData = {};
	_migrateItemArmor(item, updateData);
	return updateData;
};

/**
* Replaces Armadura to Equip
* @private
*/
function _migrateItemArmor(item, updateData) {
	if ( item.type != "armadura" ) return;
	console.log(item);
	updateData["type"] = "equip";
	updateData["data.tipo"] = item.data.subtipo != "outros" ? item.data.subtipo : "acessorio";
	updateData["data.-=subtipo"] = null;
	return updateData;
}
