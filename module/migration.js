/**
* Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
* @return {Promise}      A Promise which resolves once the migration is completed
*/
export const migrateWorld = async function() {
	ui.notifications.info(`Aplicando Migração de Sistema do Tormenta20 para a versão ${game.system.data.version}. Por favor, seja paciente e não feche o seu jogo ou desligue o servidor.`, {permanent: true});

	// Migrate World Actors
	// TODO migrate npcs
	// for ( let a of game.actors.entities.filter(ac=> ac.data.type=="character") ) {
	for ( let a of game.actors.entities ) {
		try {
			const updateData = migrateActorData(a.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Ator ${a.name}`);
				await a.update(updateData, {enforceTypes: false});
			}
			migrateAprimoramentos(a);
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Ator ${a.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Items
	for ( let i of game.items.entities ) {
		try {
			const updateData = migrateItemData(i.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Item ${i.name}`);
				await i.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Item ${i.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate Actor Override Tokens
	for ( let s of game.scenes.entities ) {
		try {
			const updateData = migrateSceneData(s.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Cena ${s.name}`);
				await s.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para a Cena ${s.name}: ${err.message}`;
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
	ui.notifications.info(`Migração de Sistema do Tormenta20 para a versão ${game.system.data.version} concluída!`, {permanent: true});
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
				case "Actor":
					updateData = migrateActorData(ent.data);
					break;
				case "Item":
					updateData = migrateItemData(ent.data);
					break;
				case "Scene":
					updateData = migrateSceneData(ent.data);
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
	// Actor Data Updates
	// _migrateActorSkills(actor, updateData);
	if (actor.type === "character") {
	}
	else if (actor.type === "npc") {
	}
	// Migrate Owned Items
	if ( !actor.items ) return updateData;
	let hasItemUpdates = false;
	const items = actor.items.map(i => {
		// Migrate the Owned Item
		// Descomentar para migrar os itens nos personagens
		let itemUpdate = migrateItemData(i);
		// let itemUpdate = {};
		// NPC Only
		// if ( actor.type === "npc" ) {
		// }
		// Update the Owned Item
		if ( !isObjectEmpty(itemUpdate) ) {
			hasItemUpdates = true;
			return mergeObject(i, itemUpdate, {enforceTypes: false, inplace: false});
		} else return i;
	});
	if ( hasItemUpdates ) updateData.items = items;
	return updateData;
};

export const migrateAprimoramentos = async function (actor) {
	const magias = game.packs.get("tormenta20.magias");
	await magias.getIndex();
	
	const content = actor.items.filter(i=> i.type == "magia");
	for ( let item of content ) {
		let a = {arsenal: "Soco do Mestre", aleph: "Lança Ígnia", talude: "Setas Infalíveis" };
		let n = item.name.match(/Arsenal|Aleph|Talude/i) ?
				a[item.name.match(/Arsenal|Aleph|Talude/i)[0]?.toLowerCase()]
				: item.name;
		const data = magias.index.find(m=>m.name === n);
		if( data ){
			const magia = await magias.getEntry(data._id);
			const effects = magia.effects;
			await actor.updateEmbeddedEntity("OwnedItem", {_id:item._id, effects:effects});
		}
	}
}

/* -------------------------------------------- */

	// TODO clean actor data

/* -------------------------------------------- */

/**
* Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
* Return an Object of updateData to be applied
* @param {Object} scene  The Scene data to Update
* @return {Object}       The updateData to apply
*/
export const migrateSceneData = function(scene) {
	const tokens = duplicate(scene.tokens);
	return {
		tokens: tokens.map(t => {
			if (!t.actorId || t.actorLink || !t.actorData.data) {
				t.actorData = {};
				return t;
			}
			const token = new Token(t);
			if ( !token.actor ) {
				t.actorId = null;
				t.actorData = {};
			} else if ( !t.actorLink ) {
				const updateData = migrateActorData(token.data.actorData);
				t.actorData = mergeObject(token.data.actorData, updateData);
			}
			return t;
		})
	};
};

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
	if (actor.type == "npc") ar = ["data.pericias", "data.periciasCustom"];
	for (let [k, arr] of Object.entries(skillsArrays)) {
		for (let [key, pericia] of Object.entries(arr)) {
			
			let temp = ["true",true,"1",1].includes(pericia.treinado) ? 1:0;
			if(pericia.treinado !== temp){
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
	_migrateClasse(item, updateData);
	if ( item.type == "ataque" ) {
		item.type = "arma";
	}
	return updateData;
};

/* -------------------------------------------- */

function _migrateClasse(item, updateData) {
	if ( item.type != "classe" ) return;
	if (Array.isArray(item.data.pericias.escolhas)) {
		let escolhas = item.data.pericias.escolhas;
		let dictEscolhas = {}
		escolhas.forEach(function(pericia) {
			dictEscolhas[pericia] = true;
		});
		updateData["data.pericias.escolhas"] = dictEscolhas;
	}
	return updateData;
}

function _migrateSpell(item, updateData) {
	if ( item.type != "magia" ) return;
	let duracao = item.data.duracao.toLowerCase();
	if (duracao === "cena") {
		updateData["data.duracao"] = {"valor": null, "unidade": "cena"};
	}
	else {
		if (duracao == "instantânea") {
			updateData["data.duracao"] = {"valor": "", "unidade": "instant"};
		}
		else if (duracao == "instantânea") {
			updateData["data.duracao"] = {"valor": "", "unidade": "verTexto"};
		}
		else {
			duracao = duracao.split(" ");
			if (duracao.length > 2) {
				duracao[0] = Number(duracao[0]);
				duracao[1] = duracao[1].toLowerCase();
				updateData["data.duracao"] = {"valor": duracao[0], "unidade": duracao[1]};
			}
			else {
				updateData["data.duracao"] = {"valor": "", "unidade": duracao[0]};
			}
		}
	}
	if (item.data.ativacao === undefined || (item.data.ativacao.execucao == "" && item.data.ativacao.custo == 0)) {
		if (item.data.execucao != undefined) {
		let execucao = item.data.execucao.toLowerCase();
		if (execucao == "duas rodadas" || execucao == "2 rodadas") {
			execucao = "duasRodadas";
		}
		else if (execucao == "padrão") {
			execucao = "padrao";
		}
		else if (execucao == "reação") {
			execucao = "reacao";
		}
		updateData["data.ativacao"] = {"execucao": execucao, "custo": item.data.custo, "condicao": "" };
		updateData["data.-=execucao"] = null;
		}
		updateData["data.-=custo"] = null;
		let duracao = item.data.duracao.toLowerCase();
		let duracoesSuportadas = ["instantânea", "cena", "sustentada", "ver texto"];
		if (duracoesSuportadas.includes(duracao)) {
			if (duracao == "instantânea") {
				duracao = "instant";
			}
			else if (duracao == "ver texto") {
				duracao = "verTexto";
			}
			updateData["data.duracao"] = {"valor": "", "unidade": duracao};
		}
		else {
			updateData["data.duracao"] = {"valor": duracao, "unidade": "outra"};
		}
	}
}

/**
* Reorganiza os poderes.
* @private
*/
function _migratePower(item, updateData) {
	if ( item.type != "poder" ) return;
	if (item.data.tipo != "") {
		let nome = item.data.tipo.split(" - ");

		if (nome[0].includes("P. ")) {
			nome[0] = nome[0].substring(3)
		}
		updateData["data.tipo"] = nome[0].toLowerCase();
		if (item.data.subtipo == "" || item.data.subtipo === undefined) {
			updateData["data.subtipo"] = nome.length == 2 ? nome[1] : "";
		}
	}
	else if (item.data.subtipo === undefined) {
		updateData["data.subtipo"] = "";
	}

	if(item.data.roll == "" && item.data.efeito) {
		updateData["data.roll"] = item.data.efeito;
		updateData["data.-=efeito"] = null;	
	}
	if (item.data.ativacao === undefined || (item.data.ativacao.execucao == "" && item.data.ativacao.custo == 0)) {
		updateData["data.ativacao"] = {"execucao": "", "custo": item.data.custo ? item.data.custo : 0, "condicao": "" };
		updateData["data.-=custo"] = null;
	}
	return updateData;
}

/**
* Replaces Armadura to Equip
* @private
*/
function _migrateItemArmor(item, updateData) {
	if ( item.type != "armadura" ) return;
	updateData["type"] = "equip";
	if (item.data.tipo.includes("escudo")) {
		updateData["data.tipo"] = "escudo"
	}
	else if (item.data.subtipo == "pesado") {
		updateData["data.tipo"] = "pesada"
	}
	else {
		updateData["data.tipo"] = item.data.subtipo != "outros" ? item.data.subtipo : "acessorio";
	}
	updateData["data.-=subtipo"] = null;
	return updateData;
}

/**
* Adiciona os tipos e propriedades das armas.
* @private
*/
function _migrateItemWeapon(item, updateData) {
	if ( item.type != "arma" ) return;
	if (item.data.tipoUso === undefined) {
		if (item.data.description.includes("Arma Exótica")) {
			updateData["data.tipoUso"] = "exotica"
		}
		else if (item.data.description.includes("Arma de Fogo")) {
			updateData["data.tipoUso"] = "armaDeFogo"
		}
		else if (item.data.description.includes("Arma Marcial")) {
			updateData["data.tipoUso"] = "marcial"
		}
		else { //if (item.data.description.includes("Arma Simples")) {
			updateData["data.tipoUso"] = "simples"
		}
	}

	if (item.data.propriedades === undefined) {
		updateData["data.propriedades"] = {"adaptavel":false,"agil":false,"alongada":false,"arremesso":false,"ataqueDistancia":false,"duasMaos":false,"dupla":false,"leve":false,"municao":false,"versatil":false}
		if(item.data.municao) {
			updateData["data.propriedades.municao"] = true;
		}
		if (item.data.description.includes("arma ágil")) {
			updateData["data.propriedades.agil"] = true;
		}
		else if (item.data.description.includes("arma alongada")) {
			updateData["data.propriedades.alongada"] = true;
		}
		if (item.data.description.includes("Ataque à Distância")) {
			updateData["data.propriedades.ataqueDistancia"] = true;
			if(item.data.pericia === "lut") {
				updateData["data.pericia"] = "pon";
			}
		}
		if (item.data.description.includes("Munição")) {
			updateData["data.propriedades.municao"] = true;
		}
		if (item.data.description.includes("Duas Mãos" || "Exige as duas mãos")) {
			updateData["data.propriedades.duasMaos"] = true;
		}
		else if (item.data.description.includes(" Leve")) {
			updateData["data.propriedades.leve"] = true;
		}
		else if (item.data.description.includes("arma dupla")) {
			updateData["data.propriedades.dupla"] = true;
		}
		if (item.data.description.includes("arma versátil")) {
			updateData["data.propriedades.versatil"] = true;
		}
	}
	if (item.data.municao != undefined) {
		updateData["data.-=municao"] = null;
	}
	return updateData;
}
