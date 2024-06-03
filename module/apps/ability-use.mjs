import { T20 } from '../config/T20.js';
import { simplifyRollFormula } from '../dice/dice.mjs';
const C = T20;
const CHANGEMODES = CONST.ACTIVE_EFFECT_MODES;
/* -------------------------------------------- */
/*  Helpers                                     */
/* -------------------------------------------- */

/**
 * /(?<die>(?<qty>\d+)(d)(?<faces>\d+)(?<bonus>[\+|\-]\d+)?(?<dmgType>\[\w+\]))|(?<perDie>(d)(\*)(?<pdbonus>\d+))/
 * */ 

/** 
 * Regular Expressions to find roll Modifiers
 */
const re = {
	faces: /^d\d+$/,
	die: /\d+d\d+[\+|\-]?[\d+]?/,
	split: /(d)|([\+|\-])|(\d+)|(\@\w+)|\[(\w+)\]/g,
	perd: /d\*\d+/,
	dieGroup: /(?<die>(?<qty>\d+)(d)(?<faces>\d+)(?<bonus>[\+|\-]\d+)?(?<dmgType>\[\w+\]))?/,
	dmgType: /(?<die>\d+d\d+)\s?\[?(?<dtype>\w+)?\]?/
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
	let valueUnlocalized = temp ? "T20." + temp[0] : value;
	
	if ( Object.entries(configKey).find(t=> t[1]==value) ){
		return Object.entries(configKey).find(t=> t[1]==value)[0];
	} else if( configKey[value.toLowerCase()] ){
		return configKey[value.toLowerCase()];
	} else if ( Object.entries(configKey).find(t=> t[1]==valueUnlocalized) ){
		return Object.entries(configKey).find(t=> t[1]==valueUnlocalized)[0];
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
const applyRollChanges = (ch, qty, ef, item, id, rollMods, options) => {
	// ROLLS ARRAY
	const _chkey = ch.key;
	const _campos = {};
	let rolls = [];
	let damageTypeTarget;
	if ( ['atributo','pericia'].includes(item.type) ) {
		item.key = 'roll';// item.id;
		rolls = [item];
	} else {
		if ( ch.key.match(/dano\:\w+/) ) {
			[ch.key, damageTypeTarget] = ch.key.split(':');
		}
		rolls = id.rolls.filter(r=> (( (ch.key == "roll" && item.type!=="arma") || r.key == ch.key || r.key.match(new RegExp(ch.key)) || ["pericia", "atributoAtq", "atributoDano", "tipoDano", "passos","danoCritico","critico"].includes(ch.key) || ch.key.match(/\@([^\#]+)\#/) ) ) );
	}
	ch.key = ch.key.toString();
	if( ch.value.toString().match(/^:/) ){
		ch.value = ch.value.replace(':',';').split(';')[qty];
		ef.flags.tormenta20.aumenta = false;
	}
	for(let r of rolls){
		let sourceName = ef.sourceName;
		// Target another onUseEffect ie.: @some#roll
		if (ch.key.match(/\@([^\#]+)\#/)){
			let m = ch.key.match(/@(.*)#(.*)/);
			if( m[1] && m[2] ){
				sourceName = m[1];
				if ( m[2] != r.type ) continue;
				ch.key = m[2];
			}
		}
		let p = 0;
		if ( rollMods && sourceName ){
			p = Math.max( rollMods[r.key].findIndex(i=> i.src == sourceName ), 0);
			// p-=1;
		} else if ( damageTypeTarget ){
			// p = Math.max( rollMods[r.key].findIndex( part => part.dmgType == damageTypeTarget ), 0);
			p = rollMods[r.key].findIndex( part => part.dmgType == damageTypeTarget );
			if ( p == -1) continue;
		}
		// CUSTOM CHANGES
		if( ch.mode == CHANGEMODES.CUSTOM ) {
			// To Change die => d12 (d#NUMBEROFFACES)
			if( ch.value.match(re.faces) ){
				rollMods[r.key][p].die = ch.value;
			}
			// To add Roll Modifiers => kh
			else if( !ch.value.match(re.die) && foundry.dice.terms.Die.MODIFIERS[ch.value.replace(/\d+|\>|\<|\+|\-|\=/g, "")] && !["min","max"].includes(ch.value) ){
				if( ch.value.match(/k|kh|kl/) ){
					if ( r.parts[p][0] == '1d20' ) {
						r.parts[p][0] = r.parts[p][0].replace("1d","2d")+ch.value;
					} else if ( r.parts[0][0] == '1d20' ){
						r.parts[0][0] = r.parts[0][0].replace("1d","2d")+ch.value;
					} else if ( r.parts[0] == '1d20' ){
						r.parts[0] = r.parts[0].replace("1d","2d")+ch.value;
					}
				} else r.parts[p][0] = r.parts[p][0]+ch.value;
			}
			// To add more dice => 1d8+1
			else if( ch.value.match(re.die) && (r.parts[p][0].toString().match(re.die)) ){
				// match at object? || rollMods[r.key][p].match(re.die)
				let tempAp = [];
				ch.value.match(re.split).forEach(rt => tempAp.push(Number(rt) * qty||rt));
				if( tempAp[0] ) rollMods[r.key][p].addDie += tempAp[0];
				if( tempAp[4] ) rollMods[r.key][p].addNum += tempAp[4];
			}
			// To add per dice => d*1 ie.: 2d8+2 => 2d8+2+2
			else if( ch.value.match(re.perd) ){
				rollMods[r.key][p].perDie += Number(ch.value.match(/\d+/)[0]) || 0;
			}
			// To Maximize/Minimize a roll => max/min
			else if( ["max","min"].includes(ch.value) ){
				options.minmax = ch.value;
			}
			// To modify a weapon damage step => passos 1
			else if( r.type == "dano" && ch.key=="passos" ){
				if( Number(ch.value) ){
					rollMods[r.key][p].dmgStep += Number(ch.value) * qty;
				} else {
					try {
						ch.value = simplifyRollFormula(ch.value, item.getRollData());
						rollMods[r.key][p].dmgStep += Number(ch.value) * qty;
					} catch (error) {
						console.warn(error);
					}
				}
			}
		}
		// MULTIPLY CHANGES
		else if( ch.mode == 1 ) {
			// Only multiply from the same src
			if( rollMods[r.key].find(m=> m.src == sourceName ) ){
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
				item.bonus.push( (Number(ch.value * qty) || ch.value) );
			} else if(item.type == "atributo"){
				r.parts.push( Number(ch.value * qty) || ch.value )
			} // To add one extra dice from source 1d => 2d6 + 1d6
			else if ( ch.key == "dano" && ch.value.match(/^1d$/)){
				let n = parseInt(ch.value) ?? 0;
				if( n ) rollMods[r.key][p].extraDie = n;
			} // To add one extra dice from source 1d => 2d6 + 1d6
			else if ( ch.key == "danoCritico" ){
				if( r.type != 'dano' ) continue;
				const dmgTypeG = ch.value.match(re.dmgType);
				// ch.value = dmgTypeG?.groups?.die ?? ch.value;
				r.parts.push([Number(ch.value * qty) || ch.value,"danoCritico",]);
				rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, extraDie:0, dmgType: (dmgTypeG?.groups?.dtype ?? ''), src: (sourceName ?? '') } );
				continue;
			} else {
				const dmgTypeG = ch.value.match(re.dmgType);
				// ch.value = dmgTypeG?.groups?.die ?? ch.value;
				r.parts.push([Number(ch.value * qty) || ch.value,""]);
				rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, extraDie:0, dmgType: (dmgTypeG?.groups?.dtype ?? ''), src: (sourceName ?? '') } );
				continue;
			}
			
			if( rollMods && sourceName ){
				rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, extraDie:0, src: sourceName } );
			}
		}
		// OVERRIDE CHANGES
		else if( ch.mode == 5 ){
			if( r.type=="dano" ){
				if( item.type == "arma" && ch.key == "atributoDano" ) {
					r.parts[1][0] = ch.value.charAt(0) == "@" ? ch.value : `@${ch.value}`;
				} else if( item.type == "arma" && ch.key == "tipoDano" ) {
					r.parts[0][1] = ch.value;
				} else if( ch.key == "tipoDano" ) {
					r.parts[p][1] = ch.value;
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
	if ( ['atributo','pericia'].includes(item.type) ) {
		foundry.utils.mergeObject(item, _campos);
	}
	ch.key = _chkey;
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
	duracao:			["duracao.units", C.timePeriods ],
	resistencia:	["resistencia.txt", null ],
	atributoCD:		["resistencia.atributo", C.atributos ],
	cd:						["resistencia.bonus", null ],

	// efeito: 			["efeito", null ],
	// PERICIA
	// atributo:			["atributo", null],
	// treino:				["treino", null],
	// treinado:			["treinado", null]
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
		re.float = /[\d+]?[.|,]?\d+/;
		if( ch.value.match(re.float) && ch.key == "area" ){
			let n1 = id.area.match(re.float)[0].replace(",",".");
			let n2 = ch.value.toString().match(re.float)[0].replace(",",".");
			let n3 = Number(n1) + ( Number(n2) * qty ) + "";
			_campos[ch.key] = id.area.replace(n1.replace(".",",") , n3);
		} else if( Number(ch.value) ){
			let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
			if( Number.isNumeric(Number(temp)) ) {
				_campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qty);
			}
			else if ( temp !== false ) {
				temp = temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qty) );
				_campos[campos[ch.key][0]] = temp;
			}
		}
	}
	// OVERRIDE CHANGES
	else if( ch.mode == 5 ) {
		if( campos[ch.key][1] ) {
			if ( ch.key == 'duracao' ) {
				let str = ch.value.match(/[A-z]+/);
				let num = ch.value.match(/\d+/);
				_campos[campos[ch.key][0]] = str ? itemKey( str[0] , campos[ch.key][1]) : '';
				_campos['duracao.value'] = num ? num[0] : '';
			} else {
				_campos[campos[ch.key][0]] = itemKey( ch.value , campos[ch.key][1]);
			}
		} else if ( ch.key.match(/consume.target/) ) {
			let it = item.actor.items.find( i => i.name == ch.value );
			_campos[campos[ch.key][0]] = ch.value;
		} else _campos[campos[ch.key][0]] = ch.value;
	}
	
	foundry.utils.mergeObject(id, foundry.utils.expandObject(_campos));
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
	
	foundry.utils.mergeObject(item, foundry.utils.expandObject(_campos));
}

const effectFields = (key) => {
	if( ['efeito','condicao','treino'].includes(key) ) return true;
	else if ( key.startsWith('$') ) return true;
	return false;
}
const effectFields2 = {
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
const applyEffectChanges = (ch, qty, ef, optEffectList, effectList, effectChanges) => {
	if( ch.key === "efeito"){
		let tef = optEffectList.find( e => e.name === ch.value );
		// include effect from the item
		if ( !tef && ef.origin.match(/Item.[A-Za-z0-9]+/) ) {
			let itemId = ef.origin.match(/Item.[A-Za-z0-9]+/)[0].split('.')[1] ?? false;
			let it = ef.parent?.items?.find(i => i.id == itemId);
			if( it ) tef = it.effects.find( e => e.name == ch.value );
		}
		if ( tef ) effectList.push(tef);
	}
	// include condition
	else if( ch.key === "condicao"){
		let tef = game.tormenta20.conditions[ch.value.toLowerCase().trim()];
		if ( tef ) effectList.push(new ActiveEffect(tef));
	}
	// Modify effect
	else if (false && ch.key.match(/\$([^\#]+)\#/)){
		if ( qty && !ch.value.startsWith("@") ) {
			ch.value = new Roll(ch.value).alter(qty,0,{multiplyNumeric:true}).formula;
		}
		effectChanges.push(ch);
		return;
		let m = ch.key.match(/\$(.*)#(.*)/);
		console.warn(m, optEffectList, effectList);
		let _ef = effectList.find(eff => eff.name == m[1]);
		let index = effectList.map(eff => eff.name ).indexOf(m[1]);
		// for (const iterator of Object.entries( effectList ) ) {
			
		// }
		for (const _ch of _ef.changes) {
			if( _ch.key != m[2] ) continue;
			if( ch.mode == CHANGEMODES.CUSTOM ) {
			} else if( ch.mode == CHANGEMODES.MULTIPLY ) {
			} else if( ch.mode == CHANGEMODES.ADD ) {
			} else if( ch.mode == CHANGEMODES.DOWNGRADE ) {
			} else if( ch.mode == CHANGEMODES.UPGRADE ) {
			} else if( ch.mode == CHANGEMODES.OVERRIDE ) {
				_ch.value = ch.value;
				console.log(ch.value);
			}
		}
		// effectList = effectList.filter(eff => eff.name != m[1]);
		effectList.pop();
		effectList.push(_ef);
		
		// effectList[index] = _ef;
		console.log(effectList.find(ef => ef.name == m[1]));
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
			
			if ( typeof dano === "string" && typeof rollMods[r.key][i]?.die === "string" ) {
				dano = dano.replace(/d\d+/, rollMods[r.key][i].die);
			}
			
			if ( dano.toString().match(re.die) && rollMods[r.key][i]?.dmgStep ) {
				let indx = -1;
				let passosIndx = 0;
				let danoBase = dano.match(/^\d+d\d+/)[0];
				if( danoBase == '2d4' ) danoBase = '1d8';
				if( danoBase == '2d6' || danoBase == '3d4' ) danoBase = '1d12';

				for (passosIndx = 0; passosIndx < C.passosDano.length; passosIndx++) {
					indx = C.passosDano[passosIndx].indexOf(danoBase);
					if (indx != -1) break;
				}

				if (passosIndx < C.passosDano.length) {
					if (indx + rollMods[r.key][i].dmgStep < 0) rollMods[r.key][i].dmgStep = -indx;
					else if (indx + rollMods[r.key][i].dmgStep >= C.passosDano[passosIndx].length) rollMods[r.key][i].dmgStep = C.passosDano[passosIndx].length - 1 - indx;
					danoBase = C.passosDano[passosIndx][ indx + rollMods[r.key][i].dmgStep ];
					dano = dano.replace(/^\d+d\d+/, danoBase);
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
			
			if ( dano.toString().match(re.die) && rollMods[r.key][i]?.perDie ) {
				let pd = parseInt(dano.match(/\d+d/ )[0]) * Number(rollMods[r.key][i].perDie) || 0;
				if ( pd ) dano = `${dano}+${pd}`;
			}

			if ( dano.toString().match(re.die) && rollMods[r.key][i]?.extraDie ) {
				let danoBase = dano.match(/^\d+d\d+/)[0];
				let ed = danoBase.replace(/\d+/, Number(rollMods[r.key][i].extraDie));
				if ( ed.match(re.die) ) dano = `${dano}+${ed}`;
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
	const item = rolledItem, id = item.system;
	const actor = item.actor, ad = actor.system;
	const hasMPCost = id.ativacao?.custo > 0 ?? false;
	
	const options = {};
	options.onUseEffects = [];
	options.effects = [];
	
	let rollMods;
	if( item.type != 'pericia' && item.type != 'atributo' ){
	rollMods = id.rolls.reduce(function(acc, r){ 
		acc[r.key] = r.parts.map(i=> ({die:null, dmgStep:0, override:null,
			addDie:0, addNum:0, extraDie:0, perDie:0, dmgType: i[1], src:i[2] }) );
			return acc;
		}, {});
	} else {
		item.validOnUseEffects = item.validOnUseEffects ?? [];
		item.effects = [];
	}
	
	// Get Applied On Use Effects
	const applied = foundry.utils.expandObject(configuration).aprs ?? {};
	const onUseEffects = item.validOnUseEffects.filter(ef => applied[ef.id]?.aplica );
	// Get Active Effects From Item
	const effectList = item.effects.filter( ef => (ef.flags.tormenta20.onuse && ef.flags.tormenta20.durationScene && !ef.disabled) || (!ef.flags.tormenta20.onuse && !ef.disabled) );
	const optEffectList = item.effects.filter( ef => (ef.flags.tormenta20.onuse && ef.flags.tormenta20.durationScene && ef.disabled) || (!ef.flags.tormenta20.onuse && ef.disabled));

	// 
	const effectChanges = [];
	const changes = [];
	[effectList,optEffectList].forEach(function(list){
		list.forEach(function(ef, index){
			changes.push([]);
			ef.changes.forEach(function(ch){
				changes[index].push({
					key: ch.key,
					value: Number(ch.value) || ch.value,
					mode: ch.mode,
					priority: ch.priority,
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
		ouEff.description = item.type !== "arma"? ef.name : ( item.id == ef.parent.id ? `${ef.parent.name} - ${ef.name}` : (ef.sourceName) );
		if ( ["Unknown",actor.name].includes(ouEff.description) ) ouEff.description = ef.name;
		ouEff.cost = Number(applied[ef.id]?.custo) * applied[ef.id]?.aplica || applied[ef.id]?.custo;
		// Number(aplicados[ef.id]?.custo) * aplicados[ef.id]?.aplica || aplicados[ef.id]?.custo;
		ouEff.qty = Number(applied[ef.id]?.aplica) || 1;

		// If an onUseEffects from the same source was applied before, sum its cost and quantity
		if( options.onUseEffects.find(i=> i.description == ouEff.description ) ){
			let apl = options.onUseEffects.find(i=> i.description == ouEff.description );
			apl.qty += ouEff.qty-1 || 0;
			// apl.cost = Number(apl.cost) + Number(ouEff.cost) ?? Number(apl.cost) + Number(0);
			apl.cost = apl.cost == '' ? apl.cost : Number(apl.cost)
			if ( ouEff.cost != '' && Number(ouEff.cost) ) apl.cost += Number(ouEff.cost);
		} else {
			options.onUseEffects.push(ouEff);
		}
		
		id.ativacao.custo += Number(ouEff.cost) || 0;
		if( !Number(applied[ef.id]?.custo+1) && item.type == "magia" ) options.truque = true;

		// Prepare onUseEffects rollModifiers
		for ( let ch of ef.changes ){
			if( ch.key == 'custo' ){
				if( ch.value == '/2' ) options.halfCost = true;
			}
			if( ch.key.match(/^\?/) ) continue;
			if (itemFields[ch.key]) applyItemChanges( ch, ouEff.qty, ef, item, id );
			else if (actorFields[ch.key]) applyActorChanges( ch, ouEff.qty, ef, item, id, ad );
			else if (effectFields(ch.key)) applyEffectChanges( ch, ouEff.qty, ef, optEffectList, effectList, effectChanges);
			else applyRollChanges( ch, ouEff.qty, ef, item, id, rollMods, options );
			
			changes.forEach(function(efch){
				if( !ef.flags.tormenta20.aumenta || ( ef.flags.tormenta20.aumenta && efch.map(i => i.key).includes(ch.key) ) ) {
					if( ch.key == "system.tamanho" && efch.findIndex(i => i.key=="system.tamanho")){
						efch.splice(efch.findIndex(i => i.key=="system.tamanho"),1);
					}
					// Push the change to the changes list
					efch.push({
						key: ch.key,
						value: Number(ch.value * ouEff.qty)  || ch.value,
						mode: ch.mode,
						priority: ch.priority
					});
				}
			});
			// if( ch.key.match(/^(data|system|?)./) ){
			// }
		}
	}

	// Prepare data from the item to update labels
	if( item.type != 'pericia' && item.type != 'atributo' ){
		item.prepareDerivedData();
		// Apply the modifications to the rolls data
		id.rolls = applyRollModifiers( item, rollMods );
	} else if ( item.type == 'pericia' ) {
		item.parts = actor._prepareSkills(item.id, item, true );
		if ( configuration.bonus ) item.parts.push( configuration.bonus );
	}

	if ( hasMPCost ) Math.min(id.ativacao?.custo || 1);
	
	// Generate a list of effects that will appear in the chat-card
	let rollData = actor.getRollData();
	effectList.forEach(function(ef, index){
		let tempEffect = ef.toObject();
		let duration = {};
		let children = [];
		let durValue = Number(id.duracao?.value) ?? 1;
		let flags = { temp: true, tormenta20:{ durationScene: false} };
		if ( id.duracao?.units == 'scene' || ef.flags.tormenta20.durationScene) {
			flags.tormenta20.durationScene = ef.flags.tormenta20.durationScene ?? true;
			duration.rounds = 99;
		};
		if ( id.duracao?.units == 'turn' ) duration.turns = durValue;
		if ( id.duracao?.units == 'round' ) duration.rounds = durValue;
		if ( id.duracao?.units == 'minute' ) duration.seconds = durValue * 60;
		if ( id.duracao?.units == 'hour' ) duration.seconds = durValue * 60 * 60;
		if ( id.duracao?.units == 'day' ) duration.seconds = durValue * 60 * 60 * 24;
		if ( id.duracao?.units == 'month' ) duration.seconds = durValue * 60 * 60 * 24 * 30;
		let efl = ef.name.slugify().replace("-","");
		if(T20.conditions[efl]){
			tempEffect = new ActiveEffect(T20.conditions[efl]);
			tempEffect = tempEffect.toObject();
			children = tempEffect.flags?.tormenta20?.childEffect?.map( ch => T20.conditions[ch] ) || [];
		} else {
			tempEffect.name ??= ef?.parent?.name ?? "Efeito";
			if ( game.release.generation < 12 ) {
				tempEffect.icon ??= ef?.parent?.img ?? "icons/svg/aura.svg";
			} else {
				tempEffect.img ??= ef?.parent?.img ?? "icons/svg/aura.svg";
			}

			tempEffect.flags = foundry.utils.mergeObject(ef.flags, flags);
			tempEffect.duration = !foundry.utils.isEmpty(duration) ? duration : ef.duration;
			// tempEffect.duration ??= undefined; foundry.utils.mergeObject(ef.duration, duration);
			tempEffect.disabled = false;
			tempEffect.changes = changes[index] ?? ef.changes;
			for (const efch of effectChanges) {
				let m = efch.key.match(/\$(.*)#(.*)/);
				for (const _ch of tempEffect.changes) {
					if( _ch.key != m[2] ) continue;
					if( efch.mode == CHANGEMODES.CUSTOM ) {
					} else if( efch.mode == CHANGEMODES.MULTIPLY ) {
					} else if( efch.mode == CHANGEMODES.ADD ) {
					} else if( efch.mode == CHANGEMODES.DOWNGRADE ) {
					} else if( efch.mode == CHANGEMODES.UPGRADE ) {
					} else if( efch.mode == CHANGEMODES.OVERRIDE ) {
						_ch.value = efch.value;
					}
				}
			}
			
			if( tempEffect.changes ){
				tempEffect.changes.sort((c,d)=> !Number(c.value) || c.key.match(/efeito.\w+/) ? 1 : -1 );
				tempEffect.changes = tempEffect.changes.reduce((object, ch) => {
					let key = ch.key.match(/efeito.\w+/)? ch.key.toString().split('.')[1] : ch.key;
					let idx = object.map(ob=> ob.key).indexOf(key);
					if( ch.mode == 2 && idx == -1 && ch.key.match(/efeito.\w+/) ){
						ch.key = key;
					}
					if( ch.value.toString().match(/^@[^\s|+|-]+/) ){
						ch.value = simplifyRollFormula(ch.value, rollData);
					}
					
					if (idx >= 0) {
						try {
							if( ch.mode == 5 ){
								if( ch.key.match(/efeito.\w+/) ){
									object[idx].value = ch.value;
								}
							} else if( ch.mode == 1 ){
								if( ch.key.match(/efeito.\w+/) ){
									if( Number(object[idx].value) ){
										object[idx].value = Number(object[idx].value) * Number(ch.value);
									} else if( object[idx].value.match(re.die) ) {
										object[idx].value = object[idx].value.replace(/\d+/, (m) => Number(m*ch.value));
									}
								} else {
									object[idx].value = Number(object[idx].value) + Number(ch.value);
								}
							} else if( ch.mode == 2 ){
								if( ch.key.match(/efeito.\w+/) ){
									object[idx].value = Number(object[idx].value) + Number(ch.value);
								} else {
									object[idx].value = Number(object[idx].value) + Number(ch.value);
								}
							} else if( ch.mode == 0 && ch.value.toString().match(/\*\d+/)  ){
								if( ch.key.match(/efeito.\w+/) ){
									object[idx].value = ch.value;
								} else {
									let value = ch.value.toString().match(/\d+/)[0];
									object[idx].value = Number(object[idx].value) * Number(value);
								}
							}
						} catch (error) {
							if( ch.mode == 2 ){
								if( ch.key.match(/efeito.\w+/) ){
									object[idx].value = ch.value;
								} else {
									object[idx].value += '+' + ch.value;
								}
							} else if( ch.mode == 0 && ch.value.toString().match(/\*\d+/)  ){
								if( ch.key.match(/efeito.\w+/) ){
									object[idx].value = ch.value;
								} else {
									object[idx].value = '('+object[idx].value+') ' + ch.value;
								}
							}
						}
					} else {
						object.push({key:ch.key,mode:ch.mode,value:ch.value,priority:ch.priority})
					}
					return object;
				}, []);
				tempEffect.changes.forEach( m => m.key = m.key.replace(/\&\w+$/,''));
			}
		}
		// Set Origin as the Actor who caused the effects
		// Determine which turn it will be proc an effect over time
		// tempEffect.origin = ef.uuid ?? item.uuid ?? actor.uuid;
		tempEffect.origin = item.uuid ?? actor.uuid;
		tempEffect.origin = tempEffect.origin?.replace(/.?ActiveEffect.\w+/,'');
		options.effects.push([tempEffect, ...children]);

	});

	// Brew Potion
	options.brew = configuration.brew;
	// Logs
	//console.log(item, rollMods, changes, options);
	return options;
}

export {
	applyOnUseEffects
}