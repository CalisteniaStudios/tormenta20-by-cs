// import { T20 } from "../config.mjs";
/* 
// Differences in item data due to applied data migrations
foundry.utils.diffObject(game.doc.items, game.items._source);
Item.updateDocuments(game.items._source, {diff: false, recursive: false, noHook: true});
 */
export const actorMigration = {};
export const itemMigration = {};
export const effectMigration = {};


actorMigration.migrateResistances = function(doc, updateEffectData = {}){
	const resistances = foundry.utils.getProperty(doc, '_source.system.tracos.resistencias') ?? foundry.utils.getProperty(doc, 'system.tracos.resistencias');
	if(!resistances) return;
	const _resistances = Object.entries( resistances );
	const hasDeprecated = _resistances.find((i,r) => Number(r.value) != 0 );
	if ( hasDeprecated ) {
		const updated = {}
		for (const [key, res] of _resistances) {
			res.base = Number(res.value);
			res.value = 0;
			res.bonus = [];
			updated[key] = res;
		}
		updateEffectData['system.tracos.resistencias'] = updated;
		doc.system.tracos.resistencias = updated;
	}
}

actorMigration.migrateCreatureType = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.detalhes.tipo')) return;
	if( !['character', 'npc'].includes(doc.type) ) return;
	if( !doc.system.detalhes.tipo ) return;
	if( !Object.keys(T20.creatureTypes).includes(doc.system.detalhes.tipo) ) return;
	
	let cType = Object.keys(T20.creatureTypes).find( c => doc.system.detalhes.tipo.match(c));
	doc.system.detalhes.tipo = cType ?? 'hum';
}

actorMigration.migrateCRLevel = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.attributes.nivel')) return;
	if ( !['npc'].includes(doc.type) ) return;
	if( isNaN(doc.system.attributes.nivel.value) || !isFinite( doc.system.attributes.nivel.value ) ){
		doc.system.attributes.nivel.value = 1;
	}
	if ( doc.system.attributes.nd ) return;
	if ( doc.system.detalhes.nd ) {
		doc.system.attributes.nd  = doc.system.detalhes.nd;
		doc.system.detalhes.nd = null;
	} else doc.system.attributes.nd = '1';
	updateEffectData['system.attributes.nd'] = doc.system.attributes.nd;
}

itemMigration.migrateDuration = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.duracao.value')) return;
	if ( !['consumivel', 'poder', 'magia'].includes(doc.type) ) return;
	if ( isNaN(doc.system.duracao.value) || !isFinite(doc.system.duracao.value) ){
		doc.system.duracao.value = 0;
	}
}

itemMigration.migrateProficiencyTypes = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.tipoUso') ) return;
	if( !['arma'].includes(doc.type) ) return;
	
	if( !doc.system.proficiencia && doc.system.tipoUso ){
		let proficiencia = {
			sim: "simples", mar: "marcial",
			exo: "exotica", fog: "fogo",
			nat: "natural", imp: "improvisada",
		}
		doc.system.proficiencia = proficiencia[doc.system.tipoUso] ?? 'sim';
		doc.system.tipoUso = null;
	}
}

itemMigration.migratePurposeTypes = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.propriedades') || foundry.utils.getProperty(doc, 'system.proposito') ) return;
	if( !['arma'].includes(doc.type) ) return;
	if( foundry.utils.hasProperty(doc.system.propriedades, 'arr') 
	 && foundry.utils.hasProperty(doc.system.propriedades, 'mun') 
	 && foundry.utils.hasProperty(doc.system.propriedades, 'dst') ){
		let proposito = doc.system.propriedades.arr ? 'arremesso'
								: (doc.system.propriedades.mun || doc.system.propriedades.dst ? 'disparo'
								: 'corpo-a-corpo' );
		doc.system.proposito = proposito;
	}

	if( !doc.system.empunhadura && foundry.utils.hasProperty(doc.system.propriedades, 'lev') && foundry.utils.hasProperty(doc.system.propriedades, 'dms') ){
		let empunhadura = doc.system.propriedades.lev ? 'leve' : (doc.system.propriedades.dms ? 'duas' : 'uma' );
		doc.system.empunhadura = empunhadura;
	}
}

itemMigration.migrateWieldTypes = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.propriedades') || foundry.utils.getProperty(doc, 'system.empunhadura') ) return;
	if( !['arma'].includes(doc.type) ) return;

	if( foundry.utils.hasProperty(doc.system.propriedades, 'lev')
	 && foundry.utils.hasProperty(doc.system.propriedades, 'dms') ){
		let empunhadura = doc.system.propriedades.lev ? 'leve'
									 : (doc.system.propriedades.dms ? 'duas' : 'uma' );
		doc.system.empunhadura = empunhadura;
	}
}

itemMigration.migrateEquipAugments = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.system.upgrades')) return;
	if( !['equipamento','consumivel','arma'].includes(doc.type) ) return
	if( !foundry.utils.isEmpty(doc.system.upgrades) ) return;
	
	if( doc.system.melhorias ){
		let i = 1;
		for (let [key, value] of Object.entries(doc.system.melhorias)) {
			if ( i > 4 ) break;
			if ( value ) {
				doc.system.upgrades[`melhoria${i}`] = key;
				i++;
			}
		}
	}
	if( doc.system.encantos ){
		if( doc.type == 'arma' ){
			if(foundry.utils.hasProperty(doc.system.encantos, 'lancinante') ){
				doc.system.encantos.lancinating = Boolean(doc.system.encantos.lancinante);
			}
		}
		let i = 1;
		for (let [key, value] of Object.entries(doc.system.encantos)) {
			if ( i > 3 ) break;
			if ( value ) {
				doc.system.upgrades[`encanto${i}`] = key;
				i++;
			}
		}
	}
}

itemMigration.migrateRollTags = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.tags') || foundry.utils.getProperty(doc, 'system.rolltags') ) return;
	if( !foundry.utils.isEmpty(doc.system.rolltags) && foundry.utils.isEmpty(doc.system.tags) ) {
		doc.system.rolltags = doc.system.tags;
		doc.system.tags = [];
	}
}

itemMigration.migrateEquipStatus = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.equipado') ) return;
	if( !['arma'].includes(doc.type) ) return;
	if( typeof doc.system.equipado === 'boolean' ){
		doc.system.equipado = doc.system.equipado ? 1 : 0;
	}
}

itemMigration.migrateEquipSlot = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.equipado2') || !foundry.utils.getProperty(doc, 'system.equipado2.type') ) return;
	if( !['arma','equipamento'].includes(doc.type) ) return;
	
	if( !doc.system.equipado2 ) doc.system.equipado2 = {};
	if( !doc.system.equipado2.slot ) doc.system.equipado2.slot = 0;
	
	if ( doc.system.empunhadura || ['escudo','esoterico','ferramenta'].includes(doc.system.tipo) ){
		doc.system.equipado2.type = 'hand';
	} else if ( ['leve','pesada','traje','acessorio'].includes(doc.system.tipo) ){
		doc.system.equipado2.type = 'body';
	} else if ( (['eng'].includes(doc.system.tipo) && doc.system.escola) ) {
		doc.system.equipado2.type = 'both';
	}
}

effectMigration.migrateResistancesPath = function(doc, updateEffectData={}){
	if ( !foundry.utils.getProperty(doc, 'changes') ) return;
	for ( const change of doc.changes ) {
		if ( !change.key.match(/system\.tracos\.resistencias\.\w+\.value/) ) continue;
		change.key = change.key.replace(/\.value/, ".bonus");
	}
}

effectMigration.migrateAbilitiesPath = function(doc, updateEffectData={}){
	if ( !foundry.utils.getProperty(doc, 'changes') && !foundry.utils.getProperty(doc, 'name') ) return;
	if ( !doc.name.match(/\w - Atributos|Atributos - \w|Aumento de Atributo - \w/) ) return;
	for ( const change of doc.changes ) {
		if ( !change.key.match(/system\.atributos\.\w+\.value/) ) continue;
		change.key = change.key.replace(/\.value/, ".racial");
	}
	console.log(doc.changes);
}


/* -------------------------------------------------------------- */
/* -------------------------------------------------------------- */
/* -------------------------------------------------------------- */

/**
 * Another path for migrating data;
 */

const migrateWorld = async function(force=false){
	console.groupCollapsed('Migrating World');
	// MIGRATION
	const worldVersion = game.settings.get('tormenta20','systemMigrationVersion');
	// const worldVersion = game.world.systemVersion;
	const systemVersion = game.system.version;
	
	if ( !(worldVersion < '1.4.200') && !force ) return;
	console.groupCollapsed('World Collections');
	console.groupCollapsed('Actors');
	const actorsUpdates = [];
	for( let actor of game.actors ) {
		let update = actorMigrate(actor);
		if ( foundry.utils.isEmpty(update) ) continue;
		update._id = actor.id;
		actorsUpdates.push(update);
	}
	await game.actors.documentClass.updateDocuments([actorsUpdates]);
	console.groupEnd();
	
	console.groupCollapsed('Items');
	const itemsUpdates = [];
	for( let item of game.items ) {
		let update = itemMigrate(item);
		if ( foundry.utils.isEmpty(update) ) continue;
		update._id = item.id;
		itemsUpdates.push(update);
	}
	await game.items.documentClass.updateDocuments([itemsUpdates]);
	console.groupEnd();
	
	// V11 Tokens need migration?
	if ( false ) {
		console.groupCollapsed('Tokens');
		const sceneUpdates = []
		for( let scene of game.scenes ) {
			const tokenUpdates = []
			for( let token of scene.tokens ) {
				if ( token.actorLink || !token.actor ) continue;
				let update = actorMigrate(token.delta); // token.delta?
				if ( foundry.utils.isEmpty(update) ) continue;
				update._id = doc.id;
				tokenUpdates.push(update);
			}
			if ( foundry.utils.isEmpty(tokenUpdates) ) continue;
			update._id = doc.id;
			sceneUpdates.push({ tokens: tokenUpdates, _id: doc.id });
			
		}
		// await game.scenes.documentClass.updateDocuments([sceneUpdates]);
		console.groupEnd();
	}

	console.groupEnd();

	console.groupCollapsed('Compendium');
	// Migrate World Compendium Packs
	for ( let pack of game.packs ) {
		if ( pack.metadoc.packageType !== "world" ) continue;
		if ( !["Actor", "Item", "Scene2"].includes(pack.documentName) ) continue;
		
		const wasLocked = pack.locked;
		await pack.configure({locked: false});
		const packUpdates = [];
		const docs = await pack.getDocuments();
		for (let doc of docs) {
			if( doc.documentName == "Actor" ){
				let update = actorMigrate(doc);
				if ( foundry.utils.isEmpty(update) ) continue;
				update._id = doc.id;
				packUpdates.push(update);
			} else if( doc.documentName == "Item" ){
				let update = itemMigrate(doc);
				if ( foundry.utils.isEmpty(update) ) continue;
				update._id = doc.id;
				packUpdates.push(update);
			} else if( doc.documentName == "Scene" ){
				continue;
				const tokenUpdates = [];
				for( let token of doc.collections.tokens ) {
					if ( token.actorLink || !token.actor ) continue;
					let update = actorMigrate(token.delta); // token.delta?
					if ( foundry.utils.isEmpty(update) ) continue;
					update._id = doc.id;
					tokenUpdates.push(update);
				}
				if ( foundry.utils.isEmpty(tokenUpdates) ) continue;
				packUpdates.push({ tokens: tokenUpdates, _id: doc.id });
			}
			if ( foundry.utils.isEmpty(packUpdates) ) continue;
			await pack.documentClass.updateDocuments([packUpdates])
		}
		// Lock the pack if it was unlocked
		await pack.configure({locked: wasLocked});
	}
	console.groupEnd();
	console.groupEnd();
}

const actorMigrate =  function (doc){
	const updateActorData = {};
	migrateResistances(doc, updateActorData);
	migrateCreatureType(doc, updateActorData);
	migrateCRLevel(doc, updateActorData);
	
	const updateItemData = [];
	for( const item of doc.items ){
		let update = itemMigrate(item);
		if ( foundry.utils.isEmpty(update) ) continue;
		update._id = item.id;
		updateItemdoc.push(update);
	}
	if ( !foundry.utils.isEmpty(updateItemData) ) updateActorData["items"] = updateItemData;

	const updateEffectData = [];
	for( const effect of doc.effects ){
		let update = effectMigrate(effect);
		if ( foundry.utils.isEmpty(update) ) continue;
		update._id = effect.id;
		updateEffectdoc.push(update);
	}
	if ( !foundry.utils.isEmpty(updateEffectData={}) ) updateActorData["effects"] = updateEffectData;
	return updateActorData;
}

const itemMigrate =  function (doc){
	const updateItemData = {};
	migrateDuration(doc, updateItemData);
	migrateProficiencyTypes(doc, updateItemData);
	migrateEquipAugments(doc, updateItemData);
	migrateRollTags(doc, updateItemData);
	migrateEquipSlot(doc, updateItemData);

	const updateEffectData = [];
	for( const effect of doc.effects ){
		let docUpdate = effectMigrate(effect);
		if ( foundry.utils.isEmpty(docUpdate) ) continue;
		docUpdate._id = effect.id;
		updateEffectdoc.push(docUpdate);
	}
	if ( !foundry.utils.isEmpty(updateEffectData={}) ) updateItemData["effects"] = updateEffectData;
	return updateItemData;
}

const effectMigrate =  function (doc){
	const updateEffectData = {};
	migrateResistancesPath(doc, updateEffectData={});
	migrateAbilitiesPath(doc, updateEffectData={});
	// migrateUsageEffectsV2(doc, updateEffectData={});
	return updateEffectData;
}
