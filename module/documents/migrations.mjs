import { T20 } from "../config.mjs";
/* 
 * Migration utilities
 * functions names <DocumentName><VersionNumber>
 */

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
export function item14113(data){
	// RollTags: set tags as rolltags
	if ( data.system.tags ){
		data.system.rolltags = data.system.tags;
	}
}

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.112 ------------------ */
/* ---------------------------------------------------- */

/* 
 * Resistances. Value is now derived from base+bonuses
 * [Prototype] Equipped2. Hand/Body slots
 */
export function actor14112(data){
	// Resistances: set base value
	for (const res of Object.values( data.system.tracos.resistencias )) {
		res.base = res.value;
		res.value = 0;
		if ( !Array.isArray(res.bonus) ) res.bonus = [];
	}
}

export function item14112(data){
	if ( ['arma','equipamento'].includes(data.type) ) {
		if ( !data.system.equipado2 ) {
			data.system.equipado2 = {};
		}
		if( !data.system.equipado2.slot ){
			data.system.equipado2.slot = 0;
		}
		if ( data.system.empunhadura || ['escudo','esoterico','ferramenta'].includes(data.system.tipo) ){
			data.system.equipado2.type = 'hand';
		} else if ( ['leve','pesada','traje','acessorio'].includes(data.system.tipo) ){
			data.system.equipado2.type = 'body';
		} else if ( (['eng'].includes(data.system.tipo) && data.system.escola) ) {
			data.system.equipado2.type = 'both';
		}
	}
}

export function effect14112(data){
	// Resistances: replace .value with .bonus
	if ( "changes" in data ) {
		for ( const change of data.changes ) {
			if ( change.key.match(/system\.tracos\.resistencias\.\w+\.value/) ){
				change.key = change.key.replace(/\.value/, ".bonus");
			}
			
			if ( data.label.match(/\w - Atributos|Atributos - \w|Aumento de Atributo - \w/) && change.key.match(/system\.atributos\.\w+\.value/) ){
				change.key = change.key.replace(/\.value/, ".racial");
			}
		}
	}
}

/* ---------------------------------------------------- */
/* ----------------- Update v1.4.101 ------------------ */
/* ---------------------------------------------------- */

/* 
 * Update 1.4.101
 * Moved NPC ND FROM detalhes.nd => attributes.nd
 */
export function actor14101(data){
	if ( ['npc'].includes(data.type) ) {
		if( data.system.detalhes.nd && data.system.detalhes.nd > data.system.attributes.nd ){
			data.system.attributes.nd = data.system.detalhes.nd;
			delete data.system.detalhes.nd;
		}
	}
}

/* 
 * Update 1.4.101
 * Weapon Proficience Type
 * Weapon Upgrades & Enchants
 */
export function item14101(data){
	if ( ['arma'].includes(data.type) ) {
		if( !data.system.proficiencia && hasProperty(data.system, 'tipoUso') && data.system.tipoUso ){
			let proficiencia = {
				sim: "simples",
				mar: "marcial",
				exo: "exotica",
				fog: "fogo",
				nat: "natural",
				imp: "improvisada",
			}
			data.system.proficiencia = proficiencia[data.system.tipoUso];
			data.system.tipoUso = null;
		}
	
		if ( !data.system.proposito && hasProperty(data.system.propriedades, 'arr') && hasProperty(data.system.propriedades, 'mun') && hasProperty(data.system.propriedades, 'dst') ){
			let proposito = data.system.propriedades.arr ? 'arremesso' : (data.system.propriedades.mun ? 'disparo' : (data.system.propriedades.dst ? 'disparo' : 'corpo-a-corpo' ) );
			data.system.proposito = proposito;
			delete data.system.propriedades.arr;
			delete data.system.propriedades.mun;
			delete data.system.propriedades.dst;
		}

		if( !data.system.empunhadura && hasProperty(data.system.propriedades, 'lev') && hasProperty(data.system.propriedades, 'dms') ){
			let empunhadura = data.system.propriedades.lev ? 'leve' : (data.system.propriedades.dms ? 'duas' : 'uma' );
			data.system.empunhadura = empunhadura;
			delete data.system.propriedades.lev;
			delete data.system.propriedades.dms;
		}
	
		if( hasProperty(data.system, 'melhorias') && hasProperty(data.system, 'upgrades') ){
			let i = 1;
			for (let [key, value] of Object.entries(data.system.melhorias)) {
				if ( i > 4 ) break;
				if ( value ) {
					data.system.upgrades[`melhoria${i}`] = key;
					i++;
				}
			}
		}
		
		if(hasProperty(data.system.encantos, 'lancinante') ){
			data.system.encantos.lancinating = Boolean(data.system.encantos.lancinante);
			delete data.system.encantos.lancinante;
		}
		
		if( hasProperty(data.system, 'encantos') && hasProperty(data.system, 'upgrades') ){
			let i = 1;
			for (let [key, value] of Object.entries(data.system.encantos)) {
				if ( i > 3 ) break;
				if ( value ) {
					data.system.upgrades[`encanto${i}`] = key;
					i++;
				}
			}
		}
	}

	if ( ['equipamento','consumivel'].includes(data.type) ) {
		if( data.system.melhorias ){
			let i = 1;
			for (let [key, value] of Object.entries(data.system.melhorias)) {
				if ( i > 4 ) break;
				if ( value ) {
					data.system.upgrades[`melhoria${i}`] = key;
					i++;
				}
			}
		}
		
		if( data.system.encantos ){
			let i = 1;
			for (let [key, value] of Object.entries(data.system.encantos)) {
				if ( i > 3 ) break;
				if ( value ) {
					data.system.upgrades[`encanto${i}`] = key;
					i++;
				}
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


/* 
 * Actor Update 1.4.001
 */
export function actor14001(data){
	if ( ['character', 'npc'].includes(data.type) ) {
		if( !Object.keys(T20.creatureTypes).includes(data.system.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.system.detalhes.tipo.match(c));
			data.system.detalhes.tipo = cType ?? 'hum';
		}
	}
	
	if ( ['npc'].includes(data.type) ) {
		if( isNaN(data.system.attributes.nivel.value) || !isFinite( data.system.attributes.nivel.value ) ){
			data.system.attributes.nivel.value = 1;
		}
	}
}


/* 
 * Item Update 1.4.001
 * Duration base value
 * Support for Two Handing a Weapon. Equipped Status Boolean => Int
 */
export function item14001(data){
	if ( ['consumivel', 'poder', 'magia'].includes(data.type) ) {
		if ( isNaN(data.system.duracao.value) || !isFinite(data.system.duracao.value) ){
			data.system.duracao.value = 0;
		}
	}

	if ( ['arma'].includes(data.type) ) {
		if( typeof data.system.equipado === 'boolean' ){
			data.system.equipado = data.system.equipado ? 1 : 0;
		}
	}
}