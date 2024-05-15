/* 
 * Migration utilities
 * functions names <DocumentName><VersionNumber>
 */
export const actorMigration = {};
export const itemMigration = {};
export const effectMigration = {};

/*  */

export const commitMigration = function(){
	let actorUpdates = foundry.utils.diffObject(game.data.actors, game.actors._source);
	if( !foundry.utils.isEmpty(actorUpdates) ) {
		console.log("ACTOR", actorUpdates);
	}

	let itemUpdates = foundry.utils.diffObject(game.data.items, game.items._source);
	if( !foundry.utils.isEmpty(itemUpdates) ) {
		console.log("ITEM", itemUpdates);
	}

	let sceneUpdates = foundry.utils.diffObject(game.data.scenes, game.scenes._source);
	if( !foundry.utils.isEmpty(sceneUpdates) ) {
		console.log("SCENE", sceneUpdates);
	}

	if ( false ) {
		// Differences in item data due to applied data migrations
		// foundry.utils.diffObject(game.data.items, game.items._source);
		// Actor.updateDocuments(game.items._source, {diff: false, recursive: false, noHook: true});
		// Item.updateDocuments(game.items._source, {diff: false, recursive: false, noHook: true});
		// Scene.updateDocuments(game.items._source, {diff: false, recursive: false, noHook: true});
	}
}

/* ---------------------------------------------------- */
/* ----------------- Tormenta20  JdA ------------------ */
/* ---------------------------------------------------- */

/* 
 * TODO
 * Fix typo upgrades.encanto# "animateed" => "animated"
 */

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.113 ------------------ */
/* ---------------------------------------------------- */


/* 
 * RollTags. Change From Tags, so RollTags for RollData and Tags for future search
 */
export function item14113(data){}
itemMigration.migrateRollTags = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.tags') ) return;
	if( foundry.utils.isEmpty(doc.system.rolltags) && !foundry.utils.isEmpty(doc.system.tags) ) {
		doc.system.rolltags = doc.system.tags;
		doc.system.tags = [];
	}
}

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.112 ------------------ */
/* ---------------------------------------------------- */

/* 
 * Resistances. Value is now derived from base+bonuses
 * [Prototype] Equipped2. Hand/Body slots
 */
export function actor14112(data){}
actorMigration.migrateResistances = function(doc, updateEffectData = {}){
	const resistances = foundry.utils.getProperty(doc, '_source.system.tracos.resistencias') ?? foundry.utils.getProperty(doc, 'system.tracos.resistencias');
	if(!resistances) return;
	const _resistances = Object.entries( resistances );
	const hasDeprecated = _resistances.find((i,r) => Number(r.value) != 0 );
	if ( hasDeprecated ) {
		const updated = {}
		for (const [key, res] of _resistances) {
			if(res.base || !res.value) {
				updated[key] = res;
				continue;
			}
			res.base = Number(res.value) ?? 0;
			res.value = 0;
			res.bonus = [];
			updated[key] = res;
		}

		updateEffectData['system.tracos.resistencias'] = updated;
		doc.system.tracos.resistencias = updated;
	}
}

/**
 * Equipped2. Hand/Body slots
 */
export function item14112(data){}
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


export function effect14112(data){}

// Migrate Resistances Key:  replace .value with .bonus
effectMigration.migrateResistancesPath = function(doc, updateEffectData={}){
	if ( !foundry.utils.getProperty(doc, 'changes') ) return;
	for ( const change of doc.changes ) {
		if ( !change.key.match(/system\.tracos\.resistencias\.\w+\.value/) ) continue;
		change.key = change.key.replace(/\.value/, ".bonus");
	}
}

// Migrate Abilities Key:  replace .value with .racial
effectMigration.migrateAbilitiesPath = function(doc, updateEffectData={}){
	if ( !foundry.utils.getProperty(doc, 'changes') && !foundry.utils.getProperty(doc, 'name') ) return;
	if ( !doc.name.match(/\w - Atributos|Atributos - \w|Aumento de Atributo - \w/) ) return;
	for ( const change of doc.changes ) {
		if ( !change.key.match(/system\.atributos\.\w+\.value/) ) continue;
		change.key = change.key.replace(/\.value/, ".racial");
	}
}

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.101 ------------------ */
/* ---------------------------------------------------- */

/* 
 * Update 1.4.101
 * Moved NPC ND FROM detalhes.nd => attributes.nd
 */
export function actor14101(data){}
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


/* 
 * Update 1.4.101
 * Weapon Proficience Type
 * Weapon Upgrades & Enchants
 */
export function item14101(data){}

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

	if( !doc.system.empunhadura
		&& foundry.utils.hasProperty(doc.system.propriedades, 'lev')
		&& foundry.utils.hasProperty(doc.system.propriedades, 'dms') ){
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


/* ---------------------------------------------------- */
/* --------------------- Pré JdA ---------------------- */
/* ---------------------------------------------------- */

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.001 ------------------ */
/* ---------------------------------------------------- */


/**
 * Actor Update 1.4.001
 * Set creature type for characters;
 */
export function actor14001(data){}

actorMigration.migrateCreatureType = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.detalhes.tipo')) return;
	if( !['character', 'npc'].includes(doc.type) ) return;
	if( !doc.system.detalhes.tipo ) return;
	if( !Object.keys(T20.creatureTypes).includes(doc.system.detalhes.tipo) ) return;
	
	let cType = Object.keys(T20.creatureTypes).find( c => doc.system.detalhes.tipo.match(c));
	doc.system.detalhes.tipo = cType ?? 'hum';
}


/* 
 * Item Update 1.4.001
 * Duration base value
 * Support for Two Handing a Weapon. Equipped Status Boolean => Int
 */
export function item14001(data){}

itemMigration.migrateDuration = function(doc, updateEffectData={}){
	if (!foundry.utils.getProperty(doc, 'system.duracao.value')) return;
	if ( !['consumivel', 'poder', 'magia'].includes(doc.type) ) return;
	if ( isNaN(doc.system.duracao.value) || !isFinite(doc.system.duracao.value) ){
		doc.system.duracao.value = 0;
	}
}

itemMigration.migrateEquipStatus = function(doc, updateEffectData={}){
	if( !foundry.utils.getProperty(doc, 'system.equipado') ) return;
	if( !['arma'].includes(doc.type) ) return;
	if( typeof doc.system.equipado === 'boolean' ){
		doc.system.equipado = doc.system.equipado ? 1 : 0;
	}
}
