import { T20Conditions } from "../conditions/conditions.js";
import { T20 } from '../config.js';

const C = T20;

/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

/** 
 * Regular Expressions to find roll Modifiers
 */
const re = {
	faces: /^d\d+$/,
	die: /\d+d\d+[\+|\-]?[\d+]?/,
	split: /(d)|([\+|\-])|(\d+)|(\@\w+)/g,
	perd: /d\*\d+/
}

/**
 * Search a value by its translation;
 * @param {String} value       Object Key or Text Translated
 * @param {Object} configKey   Object CONFIG.T20
 */
const itemKey = (value, configKey) => {
	const lang = game.i18n.translations.T20;
	value = value.toLowerCase().capitalize();
	let temp = Object.entries(lang).find(t=> t[1] == value);
	value = temp ? "T20." + temp[0] : value;
	if ( Object.entries(configKey).find(t=> t[1]==value) ){
		return Object.entries(configKey).find(t=> t[1]==value)[0];
	} else if( configKey[value.toLowerCase()] ){
		return configKey[value.toLowerCase()];
	}
	return null;
}

const rollFields = {
	roll: [],
	ataque: [],
	dano: [],
	passos: [],
	atributoDano: [],
	tipoDano: [],
	pericia: [],
	atributoAtq: [],
}
/** 
 * Regular Expressions to find
 * @param {Object} rollMods   Objeto com os valores a serem modificados;
 */
const applyRollChanges = (ch, qty, ef, item, id, rollMods) => {
	// ROLLS ARRAY
	let rolls = id.rolls.filter(r=> (( (ch.key == "roll" && item.type!=="arma") || r.key == ch.key || r.key.match(new RegExp(ch.key)) || ["pericia", "atributoAtq", "atributoDano", "tipoDano", "passos"].includes(ch.key)) ) );
	ch.key = ch.key.toString();
	for(let r of rolls){
		// CUSTOM CHANGES
		let p = ef._sourceName ? Math.max( rollMods[r.key].findIndex(i=> i.src == ef._sourceName), 0) : 0;
		if( ch.mode == 0 ) {
			// Target another onUseEffect ie.: @some#roll
			if (ch.key.match(/\@([^\#]+)\#/)){
				r.key = ch.key.match(/\@([^\#]+)\#/)[1];
				ch.key = ch.key.split("#")[1];
			}
			// To Change die => d12 (d#NUMBEROFFACES)
			if( ch.value.match(re.faces) ){
				rollMods[r.key][p].die = ch.value;
			}
			// To add Roll Modifiers => kh
			else if( Die.MODIFIERS[ch.value.replace(/\d+|\>|\<|\+|\-|\=/, "")] && !["min","max"].includes(ch.value) ){
				if( ch.value.match(/k|kh|kl/) ){
					r.parts[p][0] = r.parts[p][0].replace("1d","2d")+ch.value;
				} else r.parts[p][0] = r.parts[p][0]+ch.value;
			}
			// To add more dice => 1d8+1
			else if( ch.value.match(re.die)
						&& (r.parts[p][0].match(re.die) || rollMods[r.key][p].match(re.die)) ){
				let tempAp = [];
				ch.value.match(re.split).forEach(rt => tempAp.push(Number(rt) * qty||rt));
				if( tempAp[0] ) rollMods[r.key][p].addDie += tempAp[0];
				if( tempAp[4] ) rollMods[r.key][p].addNum += tempAp[4];
			}
			// To add per dice => d*1 ie.: 2d8+2 => 2d8+2+2
			else if( ch.value.match(re.perd) ){
				rollMods[r.key][p].perDie += Number(ch.value.match(/\d+/)[0]) || 0;
			}
			// To Maximize/Minimazie a roll => max/min
			else if( ["max","min"].includes(ch.value) ){
				options.minmax = ch.value;
			}
			// To modify a weapon damage step => passos 1
			else if( r.type == "dano" && ch.key=="passos" ){
				if( Number(ch.value) ){
					rollMods[r.key][p].dmgStep += Number(ch.value) * qty;
				} else {
					try {
						let x = ch.value.replace("@","");
						ch.value = item.getRollData()[x];
						rollMods[r.key][p].dmgStep += Number(ch.value) * qty;
					} catch (error) {
						
					}
				}
			}
		}
		// MULTIPLY CHANGES
		else if( ch.mode == 1 ) {
			// Only multiply from the same src
			if( rollMods[r.key].find(m=> m.src == ef._sourceName ) ){
				let temp = r.parts.pop();
				r.parts.push([temp[0]*(Number(ch.value)+qty-1), ""]);
			}
		}
		// ADD CHANGES
		else if( ch.mode == 2 ) {
			// ADD ROLL FROM ITEM
			if (ch.value == "roll"){
				const itr = item.actor.items.get(ef.origin.split(".")[3])
													.system.rolls.find(r=>r.type=="dano");
				r.parts.push(itr.parts[0]);
			} else if(item.type == "pericia"){
				_campos.bonus = item.bonus? 
									item.bonus + "+" + (Number(ch.value * qty) || ch.value)
									:	(Number(ch.value * qty) || ch.value);
			} else if(item.type == "atributo"){
				r.parts.push( Number(ch.value * qty) || ch.value )
			} else {
				r.parts.push([Number(ch.value * qty) || ch.value,""]);
			}
			
			if( ef._sourceName ){
				rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, src: ef._sourceName } );
			}
		}
		// OVERRIDE CHANGES
		else if( ch.mode == 5 ){
			if( r.type=="dano" ){
				if( item.type == "arma" && ch.key == "atributoDano" ) {
					r.parts[1][0] = ch.value.charAt(0) == "@" ? ch.value : `@${ch.value}`;
				} else if( item.type == "arma" && ch.key == "tipoDano" ) {
					r.parts[0][1] = ch.value;
				} else if( ["","-"].includes(ch.value) ) {
					r.parts = [];
				} else if(Number(ch.value) || ch.value.charAt(0) == "@" || ch.value.match(re.die)) {
					rollMods[r.key][p].override = ch.value;
				}
			}
			else if(r.type=="ataque"){
				if( item.type == "arma" && ch.key == "pericia" ) {
					r.parts[1][0] = ch.value;
				} else if( item.type == "arma" && ch.key == "atributoAtq" ) {
					r.parts[1][1] = ch.value;
				}
			}
		}
	}
}

const itemFields = {
	// ARMA
	// pericia:			["rolls.0.parts.1.0", null ],//C.pericias
	// atributoAtq:	["rolls.0.parts.1.1", C.atributos ],
	// atributoDano:	["rolls.1.parts.1.0", C.atributos ],
	// tipoDano:			["rolls.1.parts.1.1", C.damageTypes ],
	criticoM:			["criticoM", null ],
	criticoX:			["criticoX", null ],
	// ARMA / MAGIA / PODER / CONSUMIVEL
	alcance:			["alcance", C.distanceUnits ],
	// MAGIA / PODER / CONSUMIVEL
	alvo:					["alvo", null ],
	area:					["area", null ],
	execucao:			["ativacao.execucao", C.abilityActivationTypes ],
	duracao:			["duracao.value", C.timePeriods ],
	resistencia:	["resistencia.value", null ],
	atributoCD:		["resistencia.atributo", C.atributos ],
	cd:						["resistencia.bonus", null ],
	efeito: 			["efeito", null ],
	// PERICIA
	atributo:			["atributo", null],
	treino:				["treino", null],
	treinado:			["treinado", null]
}

/** 
 * Modify data from item
 * @param {Object} ch             ActiveEffect change object
 * @param {Array} optEffectList   List of ActiveEffect from Item
 * @param {Array} effectList      List of ActiveEffect that will go to be applied
 */
const applyItemChanges = (ch, qty, ef, item, id) => {
	const campos = itemFields;
	const _campos = {};
	// CUSTOM CHANGES
	if( ch.mode == 0 ) _campos;
	// MULTIPLY CHANGES
	else if( ch.mode == 1 ) {
		if( Number(ch.value) ){
			let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
			if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)* (Number(ch.value)*qty);
			else if ( temp ) {
				temp.replace(/\d+/, (match) => Number(match)*(Number(ch.value)*qty) );
			}
		}
	}
	// ADD CHANGES
	else if( ch.mode == 2 ) {
		re.float = /[\d+]?[,]?\d+/;
		if( Number(ch.value) ){
			let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
			if( Number.isNumeric(Number(temp)) ) {
				_campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qty);
			}
			else if ( temp !== false ) {
				temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qty) );
			}
		} else if( ch.value.match(re.float) && ch.key == "area" ){
			let n1 = id.area.match(re.float)[0].replace(",",".");
			let n2 = ch.value.toString().match(re.float)[0].replace(",",".");
			let n3 = Number(n1) + ( Number(n2) * qty ) + "";
			_campos[ch.key] = id.area.replace(n1.replace(".",",") , n3);
		}
	}
	// OVERRIDE CHANGES
	else if( ch.mode == 5 ) {
		if( campos[ch.key][1] ) {
			_campos[campos[ch.key][0]] = itemKey( ch.value , campos[ch.key][1]);
		} else _campos[campos[ch.key][0]] = ch.value;
	}
	
	mergeObject(id, expandObject(_campos));
}


const actorFields = {
	atributo:			["atributo", null],
	treinado:			["treinado", null],
	treino:				["treino", null]
}
/** 
 * Modify data from actor
 * @param {Object} ch             ActiveEffect change object
 * @param {Array} optEffectList   List of ActiveEffect from Item
 * @param {Array} effectList      List of ActiveEffect that will go to be applied
 */
const applyActorChanges = (ch, qty, ef, item, id, ad) => {
	const campos = actorFields;
	const _campos = {};
	// CUSTOM CHANGES
	if( ch.mode == 0 ) ch;
	// MULTIPLY CHANGES
	else if( ch.mode == 1 ) {
		if( Number(ch.value) ){
			let temp = eval(`item.${campos[ch.key][0]}`) ?? false;
			if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)* (Number(ch.value)*qty);
			else if ( temp ) {
				temp.replace(/\d+/, (match) => Number(match)*(Number(ch.value)*qty) );
			}
		}
	}
	// ADD CHANGES
	else if( ch.mode == 2 ) {
		if( Number(ch.value) ){
			let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
			if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qty);
			else if ( temp ) {
				temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qty) );
			}
		}
	}
	// OVERRIDE CHANGES
	else if( ch.mode == 5 ) {
		if( ch.key == "treinado" ){
			_campos["treino"] = !eval(ch.value)? 0 : ad.attributes.treino;
		}
		else if(campos[ch.key]) _campos[campos[ch.key][0]] = ch.value;
		
	}
	mergeObject(item, expandObject(_campos));
}

const effectFields = {
	efeito:			[],
	condicao:		[],
	treino:			[]
}
/** 
 * Retrieve Active Effects from the Item or from System Status
 * @param {Object} ch             ActiveEffect change object
 * @param {Array} optEffectList   List of ActiveEffect from Item
 * @param {Array} effectList      List of ActiveEffect that will go to be applied
 */
const applyEffectChanges = (ch, qty, ef, optEffectList, effectList) => {
	// include effect from the item
	if( ch.key === "efeito"){
		let tef = optEffectList.find(ef => ef.label === ch.value );
		if ( tef ) effectList.push(tef);
	}
	// include condition
	else if( ch.key === "condicao"){
		let tef = game.tormenta20.conditions[ch.value.toLowerCase().trim()];
		if ( tef ) effectList.push(new ActiveEffect(tef));
	}
}


/** 
 * TODO
 * @param {Object} item      TODO
 * @param {Array} rollMods   TODO
 */
function applyRollModifiers(item, rollMods) {
	let rolls = item.system.rolls;
	let roll;
	for ( let r of rolls ){
		for ( let [i, p] of r.parts.entries() ){
			let dano = p[0] //r.parts[rollMods][0];
			if( rollMods[r.key][i]?.override == "" ){
				r.parts[i] = [];
				continue;
			} else if ( rollMods[r.key][i]?.override ){
				dano = rollMods[r.key][i].override;
			}
	
			if ( typeof rollMods[r.key][i]?.die === "string" ) {
				dano = dano.replace(/d\d+/, rollMods[r.key][i].die);
			}
	
			if ( rollMods[r.key][i]?.dmgStep ) {
				let indx = -1;
				let danoBase = dano.match(/^\d+d\d+/)[0];

				if( danoBase == '2d4' ) danoBase = '1d8';
				if( danoBase == '2d6' || danoBase == '3d4' ) danoBase = '1d12';

				indx = C.passosDano.indexOf(danoBase);
				if ( indx != -1 ) {
					danoBase = C.passosDano[ indx + rollMods[r.key][i].dmgStep ];
					dano = dano.replace(/^\d+d\d+/, danoBase)
				}
			}
		
			if ( rollMods[r.key][i]?.addDie ){
				dano = new Roll(dano).alter(1, rollMods[r.key][i].addDie).formula;
			}
	
			if ( rollMods[r.key][i]?.addNum ) {
				roll = new Roll(dano);
				if ( roll.terms[2] ) roll.terms[2].number += rollMods[r.key][i].addNum;
				else roll = new Roll( dano + "+" + rollMods[r.key][i].addNum ) || roll;
				dano = roll.formula;
			}
			
			if ( rollMods[r.key][i]?.perDie ) {
				let pd = parseInt(dano.match(/\d+d/ )[0]) * Number(rollMods[r.key][i].perDie) || 0;
				if ( pd ) dano = `${dano} + ${pd}`;
			}
			r.parts[i][0] = dano;
		}
	}
	return rolls;
}

/* -------------------------------------------- */
/*  Apply                                       */
/* -------------------------------------------- */

/**
 * Perform modifications to the Roll and its cloned Item/Actor
 * @param {Object} rolledItem     Item being used;
 * @param {Object} configuration  Submited data from Ability Use Dialog.
 */
function applyOnUseEffects( rolledItem, configuration=null ) {
	if( !configuration ) return {};

	const item = rolledItem, id = item.system
	const actor = item.actor, ad = actor.system;
	const hasMPCost = id.ativacao?.custo > 0 ?? false;
	
	const options = {};
	options.onUseEffects = [];
	options.effects = [];
	
	let rollMods;
	if( item.type != 'pericia' && item.type != 'atributo' ){
		rollMods = id.rolls.reduce(function(acc, r){ 
			acc[r.key] = r.parts.map(i=> ({die:null, dmgStep:0, override:null,
				addDie:0, addNum:0, perDie:0 }) );
			return acc;
		}, {});
	} else {
		item.validOnUseEffects = [];
		item.effects = [];
	}
	
	// Get Applied On Use Effects
	const applied = expandObject(configuration).aprs;
	const onUseEffects = item.validOnUseEffects.filter(ef => applied[ef.id]?.aplica );

	// Get Active Effects From Item
	const effectList = item.effects.filter( ef => !ef.flags.tormenta20.onuse && !ef.disabled);
	const optEffectList = item.effects.filter( ef => !ef.flags.tormenta20.onuse && ef.disabled);

	// 
	const changes = [];
	[effectList,optEffectList].forEach(function(list){
		list.forEach(function(ef, index){
			changes.push([]);
			ef.changes.forEach(function(ch){
				changes[index].push({
					key: ch.key,
					value: Number(ch.value) || ch.value,
					mode: ch.mode
				});
			});
		});
	});
	
	// SORT
	onUseEffects.sort((a,b)=> (
		(a.changes.some(ch=>ch.mode == 5) && !b.changes.some(ch=>ch.mode == 5)) ? -1 : (b.changes.some(ch=>ch.mode == 5) && !a.changes.some(ch=>ch.mode == 5)) ? 1 : 0 
		)
	);

	// Prepare chatData and rollModifiers for onUseEffects
	for ( let ef of onUseEffects ){
		// Prepare onUseEffects chat content;
		let ouEff = {};
		ouEff.description = item.type !== "arma"? ef.label : ( item.id == ef.parent.id ? `${ef.parent.name} - ${ef.label}` : ef._sourceName );
		ouEff.cost = Number(applied[ef.id]?.custo) * applied[ef.id]?.aplica || applied[ef.id]?.custo;
		// Number(aplicados[ef.id]?.custo) * aplicados[ef.id]?.aplica || aplicados[ef.id]?.custo;
		ouEff.qty = Number(applied[ef.id]?.aplica) || 1;

		// If an onUseEffects from the same source was applied before, sum its cost and quantity
		if( options.onUseEffects.find(i=> i.description == ouEff.description ) ){
			let apl = options.onUseEffects.find(i=> i.description == ouEff.description );
			apl.qty += ouEff.qty-1 || 0;
			apl.cost += ouEff.cost || 0;
		} else {
			options.onUseEffects.push(ouEff);
		}
		
		id.ativacao.custo += Number(ouEff.cost) || 0;
		if( !Number(applied[ef.id]?.custo+1) && item.type == "magia" ) options.truque = true;

		// Prepare onUseEffects rollModifiers
		for ( let ch of ef.changes ){
			if (itemFields[ch.key]) applyItemChanges( ch, ouEff.qty, ef, item, id );
			else if (actorFields[ch.key]) applyActorChanges( ch, ouEff.qty, ef, item, id, ad );
			else if (effectFields[ch.key]) applyEffectChanges( ch, ouEff.qty, ef, optEffectList, effectList );
			else applyRollChanges( ch, ouEff.qty, ef, item, id, rollMods );
			
			if( ch.key.match(/^(data|system)./) ){
				changes.forEach(function(efch){
					if( !ef.flags.tormenta20.aumenta || ( ef.flags.tormenta20.aumenta && efch.map(i => i.key).includes(ch.key) ) ) {
						if( ch.key == "system.tamanho" && efch.findIndex(i => i.key=="system.tamanho")){
							efch.splice(efch.findIndex(i => i.key=="system.tamanho"),1);
						}
						// Push the change to the changes list
						efch.push({
							key: ch.key,
							value: Number(ch.value * ouEff.qty)  || ch.value,
							mode: ch.mode
						});
					}
				});
			}
		}
	}

	// Prepare data from the item to update labels
	if( item.type != 'pericia' && item.type != 'atributo' ){
		item.prepareDerivedData();
		// Apply the modifications to the rolls data
		id.rolls = applyRollModifiers( item, rollMods );
	} else if ( item.type != 'pericia' ) {
		item.parts = actor._prepareSkills(item.id, item, ad, actor.getRollData(), true );
		if ( configuration.bonus ) item.parts.push( configuration.bonus );
	}

	if ( hasMPCost ) Math.min(id.ativacao?.custo || 1);
	
	// Generate a list of effects that will appear in the chat-card
	effectList.forEach(function(ef, index){
		let tempEffect = ef.toObject();
		
		let efl = ef.label.slugify().replace("-","");
		if(T20Conditions[efl]){
			tempEffect = new ActiveEffect(T20Conditions[efl]);
			tempEffect = tempEffect.toObject();
		} else {
			tempEffect.label ??= this.name;
			tempEffect.icon ??= this.img;
			tempEffect.flags = mergeObject(ef.flags, { temp: true });
			tempEffect.duration ??= undefined;
			tempEffect.disabled = false;
			tempEffect.changes = changes[index] ?? ef.changes;
			tempEffect.changes = tempEffect.changes.filter(ch => ch.key.match(/^system./i));
		}
		// Set Origin as the Actor who caused the effects
		// Determine which turn it will be proc an effect over time
		// tempEffect.origin = ef.uuid ?? item.uuid ?? actor.uuid;
		tempEffect.origin = item.uuid ?? actor.uuid;
		tempEffect.origin = tempEffect.origin?.replace(/.?ActiveEffect.\w+/,'');
		options.effects.push(tempEffect);
	});
	
	// Logs
	// console.log(rollMods, changes, options);
	return options;
	// return true;
}

export {
	applyOnUseEffects
}