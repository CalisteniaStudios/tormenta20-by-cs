
// class MySystemActorData extends DataModel {
// 	/* @override */
// 	static defineSchema() {
// 		return {
// 			skill: new fields.SchemaField({
// 				acr: new fields.SchemaField({
// 					value: new fields.NumberField({required: true, initial: 0}),
// 					trained: new fields.BooleanField({required: true, initial: false}),
// 					ability: new fields.StringField({required: true, blank: false, choices: ['str','dex','...'], initial: 'dex'})
// 				}),
// 			})
// 		}
// 	}
// }

// class MySystemActor extends Actor {
// 	/* @override */
// 	static defineSchema() {
// 		return mergeObject( this.super.defineSchema() , {
// 			system: new fields.EmbeddedDataField(MySystemActorData),
// 		});
// 	}
// }

// let m = new myClass()
// console.log( m );


import { lists } from './lists.js';
import { T20 } from '../config.js';
const fields = foundry.data.fields;
//name: new fields.StringField({required: true, blank: false, choices: Object.values(T20.atributos), initial: T20.atributos[abl]}),
/* ---------------------------------------- */
/*  Helpers                                 */
/* ---------------------------------------- */


/* ---------------------------------------- */
/*  PropertiesDataModel                     */
/* ---------------------------------------- */
class AbilityData extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, initial:10, min:0 }),
			bonus: new fields.NumberField({ required: true, initial:0 }),
			mod: new fields.NumberField({ required: true, initial:0 })
		};
	}
}

function _abilitySchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, initial:10, min:0 }),
		bonus: new fields.NumberField({ required: true, initial:0 }),
		mod: new fields.NumberField({ required: true, initial:0 })
	});
}

function _abilitySchema3(){
	return new fields.ObjectField({initial:{
	// return {
		value: new fields.NumberField({ required: true, initial:10, min:0 }),
		bonus: new fields.NumberField({ required: true, initial:0 }),
		mod: new fields.NumberField({ required: true, initial:0 })
	// }
		}})
}


function _abilitySchema2(){
	return {
		value: new fields.NumberField({ required: true, initial:10, min:0 }),
		bonus: new fields.NumberField({ required: true, initial:0 }),
		mod: new fields.NumberField({ required: true, initial:0 })
	}
}

class SkillData extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
			atributo: new fields.StringField({ required: true, blank: false, choices: lists['abilities'], initial: 'for'}),
			treinado: new fields.BooleanField({ required: true, initial: false }),
			st: new fields.BooleanField({ required: true, initial: false }),
			pda: new fields.BooleanField({ required: true, initial: false }),
			size: new fields.BooleanField({ required: true, initial: false }),
			value: new fields.NumberField({ required: true, initial:0, min:0 }),
			outros: new fields.NumberField({ required: true, initial:0 }),
			condi: new fields.NumberField({ required: true, initial:0 }),
			bonus: new fields.StringField({ required: true, initial: '' }),
		};
	}
}

function _skillSchema(){
	return new fields.ObjectField({initial:{
		atributo: new fields.StringField({ required: true, blank: false, choices: lists['abilities'], initial: 'for'}),
		treinado: new fields.BooleanField({ required: true, initial: false }),
		st: new fields.BooleanField({ required: true, initial: false }),
		pda: new fields.BooleanField({ required: true, initial: false }),
		size: new fields.BooleanField({ required: true, initial: false }),
		value: new fields.NumberField({ required: true, initial:0, min:0 }),
		outros: new fields.NumberField({ required: true, initial:0 }),
		condi: new fields.NumberField({ required: true, initial:0 }),
		bonus: new fields.StringField({ required: true, initial: '' }),
	}})
}

class DamageResistanceData extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, initial:0, min:0 }),
			imunidade: new fields.BooleanField({ required: true, initial: false }),
			vulnerabilidade: new fields.BooleanField({ required: true, initial: false }),
		};
	}
}

class ResourceData extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, initial:0, step:1, integer:true }),
			temp: new fields.NumberField({ required: true, initial:0, min:0, step:1, integer:true }),
			min: new fields.NumberField({ required: true, initial:0, integer:true }),
			max: new fields.NumberField({ required: true, initial:3, integer:true }),
		};
	}
}

/* ---------------------------------------- */
/*  DocumentsDataModel                      */
/* ---------------------------------------- */
class ActorT20Data extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		// Set default abilities
		console.log( this );
		// let schemaDetalhes = {
		// 	divindade: new fields.StringField({ initial: '' }),
		// 	raca: new fields.StringField({ initial: '' }),
		// 	tipo: new fields.StringField({ initial: 'humanoide' }), //TODO: choices
		// 	biography: new fields.SchemaField({
		// 		value: new fields.HTMLField({ required: true, initial:'' }),
		// 		public: new fields.HTMLField({ initial:'' }),
		// 	}),
		// }
		// let schemaXP = {
		// 	value: new fields.NumberField({ required: true, initial:0, integer:true})
		// }
		console.warn(this.parent);
		console.warn(this.parent);
		// if ( this.parent.type === 'character' ){
		// 	let schemaActorType = {
		// 		attributes: new fields.SchemaField({
		// 			nivel: new fields.SchemaField({ //TODO: PC <> NPC
		// 				xp: new fields.SchemaField({
		// 					pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
		// 					proximo: new fields.NumberField({ initial:0, integer:true }),
		// 				}),
		// 			}),
		// 		}),
		// 		detalhes: new fields.SchemaField({
		// 			origem: new fields.StringField({ initial: '' }),
		// 			info: new fields.StringField({ initial: '' }),
		// 			diario1: new fields.SchemaField({
		// 				name: new fields.StringField({ initial:'' }),
		// 				value: new fields.HTMLField({ initial:'' }),
		// 			}),
		// 			diario2: new fields.SchemaField({
		// 				name: new fields.StringField({ initial:'' }),
		// 				value: new fields.HTMLField({ initial:'' }),
		// 			}),
		// 			diario3: new fields.SchemaField({
		// 				name: new fields.StringField({ initial:'' }),
		// 				value: new fields.HTMLField({ initial:'' }),
		// 			}),
		// 			diario4: new fields.SchemaField({
		// 				name: new fields.StringField({ initial:'' }),
		// 				value: new fields.HTMLField({ initial:'' }),
		// 			}),
		// 			diario5: new fields.SchemaField({
		// 				name: new fields.StringField({ initial:'' }),
		// 				value: new fields.HTMLField({ initial:'' }),
		// 			}),
		// 		}),
		// 	}
		// 	/* /
		// 	mergeObject(schemaDetalhes, {
		// 		origem: new fields.StringField({ initial: '' }),
		// 		info: new fields.StringField({ initial: '' }),
		// 		diario1: new fields.SchemaField({
		// 			name: new fields.StringField({ initial:'' }),
		// 			value: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 		diario2: new fields.SchemaField({
		// 			name: new fields.StringField({ initial:'' }),
		// 			value: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 		diario3: new fields.SchemaField({
		// 			name: new fields.StringField({ initial:'' }),
		// 			value: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 		diario4: new fields.SchemaField({
		// 			name: new fields.StringField({ initial:'' }),
		// 			value: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 		diario5: new fields.SchemaField({
		// 			name: new fields.StringField({ initial:'' }),
		// 			value: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 	});
		// 	mergeObject(schemaDetalhes, {
		// 		pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
		// 		proximo: new fields.NumberField({ initial:0, integer:true }),
		// 	});
		// 	/*  */
		// } else if( this.parent.type === 'npc' ) {
		// 	let schemaActorType = {
		// 		attributes: new fields.SchemaField({
		// 			nivel: new fields.SchemaField({ //TODO: PC <> NPC
		// 				nd: new fields.NumberField({ required: true, initial:0, integer:true }),
		// 				value: new fields.NumberField({ required: true, initial:0, min:0}),
		// 			}),
		// 		}),
		// 		detalhes: new fields.SchemaField({
		// 			resistencias: new fields.StringField({ initial: '' }),
		// 			equipamento: new fields.StringField({ initial: '' }),
		// 			tesouro: new fields.StringField({ initial: 'Padrão' }),
		// 		}),
		// 	}
		// 	/* /
		// 	mergeObject(schemaDetalhes, {
		// 		resistencias: new fields.StringField({ initial: '' }),
		// 		equipamento: new fields.StringField({ initial: '' }),
		// 		tesouro: new fields.StringField({ initial: 'Padrão' }),
		// 	});
		// 	/*  */
		// }
		let abilities = {};
		lists['abilities'].forEach( abl => abilities[abl] = new fields.EmbeddedDataField(AbilityData) );
		// TODO: Set default skill list according to campaign setting
		let skills = {};
		lists['skills']['core'].forEach( skl => skills[skl] = new fields.EmbeddedDataField(SkillData) );
		// TODO: Set default statusEffect list according to campaign setting
		let statusEffectsChoices = lists['statusEffects']['core'];
		// TODO: Set default damage resistances list according to campaign setting
		let dresist = {};
		lists['damageTypes']['core'].forEach( dr => dresist[dr] = new fields.EmbeddedDataField(DamageResistanceData) );

		
		// TODO: DIFFERENT FIELDS FROM NPC
		// let schema = {
		// 	atributos: new fields.ObjectField({initial:abilities}),
		// 	pericias: new fields.ObjectField({initial:skills}),
		// 	attributes: new fields.SchemaField({
		// 		cd: new fields.NumberField({ required: true, initial:10 }),
		// 		conjuracao: new fields.StringField({ choices: lists['abilities'], initial: 'int' }),
		// 		treino: new fields.NumberField({ required: true, initial:0 }),
		// 		pv: new fields.EmbeddedDataField(ResourceData),
		// 		pm: new fields.EmbeddedDataField(ResourceData),
		// 		defesa: new fields.SchemaField({
		// 			atributo: new fields.StringField({ required:true, blank:false, choices: lists['abilities'], initial:'des'}),
		// 			pda: new fields.NumberField({ required: true, initial:0 }),
		// 			value: new fields.NumberField({ required: true, initial:10 }),
		// 			outros: new fields.NumberField({ required: true, initial:0 }),
		// 			condi: new fields.NumberField({ required: true, initial:0 }),
		// 			bonus: new fields.StringField({ required: true, initial: '' }),
		// 		}),
		// 		nivel: new fields.SchemaField({ //TODO: PC <> NPC
		// 			value: new fields.NumberField({ required: true, initial:0, min:0, max:20 }),
		// 			xp: new fields.SchemaField({
		// 				value: new fields.NumberField({ required: true, initial:0, integer:true }),
		// 			}),
		// 		}),
		// 		carga: new fields.SchemaField({
		// 			value: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 			max: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 			pct: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 			encumbered: new fields.BooleanField({ initial: false }),
		// 		}),
		// 		movement: new fields.SchemaField({
		// 			burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
		// 			climb: new fields.NumberField({ initial:0, min:0, integer:true }),
		// 			fly: new fields.NumberField({ initial:0, min:0, integer:true }),
		// 			swim: new fields.NumberField({ initial:0, min:0, integer:true }),
		// 			walk: new fields.NumberField({ initial:9, min:0, integer:true }),
		// 			hover: new fields.BooleanField({ initial: false }),
		// 			unit: new fields.StringField({ initial: 'm' }),
		// 		}),
		// 		sentidos: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
		// 	}),
		// 	modificadores: new fields.SchemaField({
		// 		custoPM: new fields.StringField(),
		// 		atributos: new fields.SchemaField({
		// 			for: new fields.StringField(),
		// 			des: new fields.StringField(),
		// 			con: new fields.StringField(),
		// 			int: new fields.StringField(),
		// 			sab: new fields.StringField(),
		// 			car: new fields.StringField(),
		// 			fisiscos: new fields.StringField(),
		// 			mentais: new fields.StringField(),
		// 			geral: new fields.StringField(),
		// 		}),
		// 		dano: new fields.SchemaField({
		// 			ad: new fields.StringField(),
		// 			alq: new fields.StringField(),
		// 			cac: new fields.StringField(),
		// 			geral: new fields.StringField(),
		// 			mag: new fields.StringField(),
		// 		}),
		// 		pericias: new fields.SchemaField({
		// 			geral: new fields.StringField(),
		// 			resistencia: new fields.StringField(),
		// 			semataque: new fields.StringField(),
		// 			atr: new fields.SchemaField({
		// 				for: new fields.StringField(),
		// 				des: new fields.StringField(),
		// 				con: new fields.StringField(),
		// 				int: new fields.StringField(),
		// 				sab: new fields.StringField(),
		// 				car: new fields.StringField(),
		// 			}),
		// 		}),
		// 	}),
		// 	resources: new fields.ObjectField(),
		// 	detalhes: new fields.SchemaField({
		// 		divindade: new fields.StringField({ initial: '' }),
		// 		raca: new fields.StringField({ initial: '' }),
		// 		tipo: new fields.StringField({ initial: 'humanoide' }), //TODO: choices
		// 		biography: new fields.SchemaField({
		// 			value: new fields.HTMLField({ required: true, initial:'' }),
		// 			public: new fields.HTMLField({ initial:'' }),
		// 		}),
		// 	}),
		// 	tracos: new fields.SchemaField({
		// 		ic: new fields.ArrayField(new fields.StringField()), //TODO: custom field
		// 		idiomas: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
		// 		profArmaduras: new fields.ArrayField(new fields.StringField()), //TODO: choices
		// 		profArmas: new fields.ArrayField(new fields.StringField()), //TODO: choices
		// 		resistencias: new fields.ObjectField({initial:dresist}),
		// 		tamanho: new fields.StringField({ required: true, initial: 'med' }),
		// 	}),
		// 	dinheiro: new fields.SchemaField({
		// 		tc: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 		tl: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 		to: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 		tp: new fields.NumberField({ required: true, initial:0, min:0 }),
		// 	}),
		// };
		// return mergeObjects( schema, schemaActorType );
		return {
			atributos: new fields.ObjectField({initial:abilities}),
			pericias: new fields.ObjectField({initial:skills}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, initial:10 }),
				conjuracao: new fields.StringField({ choices: lists['abilities'], initial: 'int' }),
				treino: new fields.NumberField({ required: true, initial:0 }),
				pv: new fields.EmbeddedDataField(ResourceData),
				pm: new fields.EmbeddedDataField(ResourceData),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: lists['abilities'], initial:'des'}),
					pda: new fields.NumberField({ required: true, initial:0 }),
					value: new fields.NumberField({ required: true, initial:10 }),
					outros: new fields.NumberField({ required: true, initial:0 }),
					condi: new fields.NumberField({ required: true, initial:0 }),
					bonus: new fields.StringField({ required: true, initial: '' }),
				}),
				nivel: new fields.SchemaField({ //TODO: PC <> NPC
					value: new fields.NumberField({ required: true, initial:0, min:0, max:20 }),
					xp: new fields.SchemaField({
						pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
						proximo: new fields.NumberField({ initial:0, integer:true }),
						value: new fields.NumberField({ required: true, initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:0, min:0 }),
					max: new fields.NumberField({ required: true, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, initial:0, min:0 }),
					encumbered: new fields.BooleanField({ initial: false }),
				}),
				movement: new fields.SchemaField({
					burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
					climb: new fields.NumberField({ initial:0, min:0, integer:true }),
					fly: new fields.NumberField({ initial:0, min:0, integer:true }),
					swim: new fields.NumberField({ initial:0, min:0, integer:true }),
					walk: new fields.NumberField({ initial:9, min:0, integer:true }),
					hover: new fields.BooleanField({ initial: false }),
					unit: new fields.StringField({ initial: 'm' }),
				}),
				sentidos: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
			}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.StringField(),
					des: new fields.StringField(),
					con: new fields.StringField(),
					int: new fields.StringField(),
					sab: new fields.StringField(),
					car: new fields.StringField(),
					fisiscos: new fields.StringField(),
					mentais: new fields.StringField(),
					geral: new fields.StringField(),
				}),
				dano: new fields.SchemaField({
					ad: new fields.StringField(),
					alq: new fields.StringField(),
					cac: new fields.StringField(),
					geral: new fields.StringField(),
					mag: new fields.StringField(),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.StringField(),
					resistencia: new fields.StringField(),
					semataque: new fields.StringField(),
					atr: new fields.SchemaField({
						for: new fields.StringField(),
						des: new fields.StringField(),
						con: new fields.StringField(),
						int: new fields.StringField(),
						sab: new fields.StringField(),
						car: new fields.StringField(),
					}),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				divindade: new fields.StringField({ initial: '' }),
				origem: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ initial: 'humanoide' }), //TODO: choices
				info: new fields.StringField({ initial: '' }),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
				diario1: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario2: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario3: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario4: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario5: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.ArrayField(new fields.StringField()), //TODO: custom field
				idiomas: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
				profArmaduras: new fields.ArrayField(new fields.StringField()), //TODO: choices
				profArmas: new fields.ArrayField(new fields.StringField()), //TODO: choices
				resistencias: new fields.ObjectField({initial:dresist}),
				tamanho: new fields.StringField({ required: true, initial: 'med' }),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, initial:0, min:0 }),
			}),
		};
	}
}


class systemActorBaseData extends foundry.abstract.DataModel {
	/* @ignore */
	static TODO(){
		// USE EmbeddedDataField(Data) OR _abilitySchema
		// lists['abilities'].forEach( abl => abilities[abl] = new fields.EmbeddedDataField(AbilityData) );
		// lists['abilities'].forEach( abl => abilities[abl] = _abilitySchema());
		// lists['abilities'].forEach( abl => abilities[abl] = new fields.SchemaField(_abilitySchema()) );
		// atributos: new fields.ObjectField({initial:abilities}),
		// pericias: new fields.ObjectField({initial:skills}),
	}
	
	
	/* @override */
	static defineSchema() {
		/* ---------------------------------- */
		// A
		let abilities1 = {};
		lists['abilities'].forEach( abl => abilities1[abl] = _abilitySchema());
		let abilities8 = {};
		lists['abilities'].forEach( abl => abilities8[abl] = new fields.EmbeddedDataField(AbilityData) );
		// B
		let abilities2 = {};
		lists['abilities'].forEach( abl => abilities2[abl] = _abilitySchema());
		// C
		let abilities3 = {};
		lists['abilities'].forEach( abl => abilities3[abl] = _abilitySchema2());
		// D
		let abilitiesSchema = {
			abilities11: new fields.SchemaField(abilities1),
			abilities12: new fields.SchemaField(abilities2),
		}
		// E
		let abilities7 = new fields.SchemaField({});
		lists['abilities'].forEach( abl => abilities7[abl] = _abilitySchema2());
		/* ---------------------------------- */
		// TODO: Set default skill list according to campaign setting
		let skills = {};
		lists['skills']['core'].forEach( skl => skills[skl] = _skillSchema() );
		// TODO: Set default statusEffect list according to campaign setting
		let statusEffectsChoices = lists['statusEffects']['core'];
		// TODO: Set default damage resistances list according to campaign setting
		let dresist = {};
		lists['damageTypes']['core'].forEach( dr => dresist[dr] = new fields.EmbeddedDataField(DamageResistanceData) );
		let schema = {
			atributos: new fields.SchemaField({
				for: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
				des: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
				con: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
				int: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
				sab: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
				car: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:10, min:0 }),
					bonus: new fields.NumberField({ required: true, initial:0 }),
					mod: new fields.NumberField({ required: true, initial:0 }),
				}),
			}),
			abilities1: new fields.ObjectField({initial:abilities1}),
			abilities2: new fields.ObjectField({initial:abilities2}),
			abilities3: new fields.ObjectField({initial:abilities3}),
			abilities4: new fields.SchemaField(abilities1),
			abilities5: new fields.SchemaField(abilities2),
			abilities7: abilities7,
			// abilities4: new fields.ObjectField({initial:abilities4}),
			pericias: new fields.SchemaField(skills),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, initial:10 }),
				conjuracao: new fields.StringField({ choices: lists['abilities'], initial: 'int' }),
				treino: new fields.NumberField({ required: true, initial:0 }),
				pv: new fields.EmbeddedDataField(ResourceData),
				pm: new fields.EmbeddedDataField(ResourceData),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: lists['abilities'], initial:'des'}),
					pda: new fields.NumberField({ required: true, initial:0 }),
					value: new fields.NumberField({ required: true, initial:10 }),
					outros: new fields.NumberField({ required: true, initial:0 }),
					condi: new fields.NumberField({ required: true, initial:0 }),
					bonus: new fields.StringField({ required: true, initial: '' }),
				}),
				nivel: new fields.SchemaField({ //TODO: PC <> NPC
					value: new fields.NumberField({ required: true, initial:0, min:0, max:20 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, initial:0, min:0 }),
					max: new fields.NumberField({ required: true, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, initial:0, min:0 }),
					encumbered: new fields.BooleanField({ initial: false }),
				}),
				movement: new fields.SchemaField({
					burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
					climb: new fields.NumberField({ initial:0, min:0, integer:true }),
					fly: new fields.NumberField({ initial:0, min:0, integer:true }),
					swim: new fields.NumberField({ initial:0, min:0, integer:true }),
					walk: new fields.NumberField({ initial:9, min:0, integer:true }),
					hover: new fields.BooleanField({ initial: false }),
					unit: new fields.StringField({ initial: 'm' }),
				}),
				sentidos: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
			}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.StringField(),
					des: new fields.StringField(),
					con: new fields.StringField(),
					int: new fields.StringField(),
					sab: new fields.StringField(),
					car: new fields.StringField(),
					fisiscos: new fields.StringField(),
					mentais: new fields.StringField(),
					geral: new fields.StringField(),
				}),
				dano: new fields.SchemaField({
					ad: new fields.StringField(),
					alq: new fields.StringField(),
					cac: new fields.StringField(),
					geral: new fields.StringField(),
					mag: new fields.StringField(),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.StringField(),
					resistencia: new fields.StringField(),
					semataque: new fields.StringField(),
					atr: new fields.SchemaField({
						for: new fields.StringField(),
						des: new fields.StringField(),
						con: new fields.StringField(),
						int: new fields.StringField(),
						sab: new fields.StringField(),
						car: new fields.StringField(),
					}),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, initial:10 }),
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ initial: 'humanoide' }), //TODO: choices
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.ArrayField(new fields.StringField()), //TODO: custom field
				idiomas: new fields.ArrayField(new fields.StringField()), //TODO: choices / custom field
				profArmaduras: new fields.ArrayField(new fields.StringField()), //TODO: choices
				profArmas: new fields.ArrayField(new fields.StringField()), //TODO: choices
				resistencias: new fields.ObjectField({initial:dresist}),
				tamanho: new fields.StringField({ required: true, initial: 'med' }),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, initial:0, min:0 }),
			}),
		};
		
		return mergeObject(schema, abilitiesSchema);
		return schema;
		return mergeObject(schema, abilities, skills);
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( typeof data.tracos.ic === Object ){
			console.log(data.tracos.ic)
		}
		super.migrateData(data);
	}
}

class systemActorCharacterData extends systemActorBaseData {
	/* @override */
	static defineSchema() {
		return mergeObject( super.defineSchema() , {
			attributes: new fields.SchemaField({
				nivel: new fields.SchemaField({ //TODO: PC <> NPC
					xp: new fields.SchemaField({
						pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
						proximo: new fields.NumberField({ initial:0, integer:true }),
					}),
				}),
			}),
			detalhes: new fields.SchemaField({
				origem: new fields.StringField({ initial: '' }),
				info: new fields.StringField({ initial: '' }),
				diario1: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario2: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario3: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario4: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario5: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
			}),
		});
	}
}

class systemActorNPCData extends systemActorBaseData {
	/* @override */
	static defineSchema() {
		return mergeObject( super.defineSchema() , {
			attributes: new fields.SchemaField({
				nivel: new fields.SchemaField({ //TODO: PC <> NPC
					nd: new fields.NumberField({ required: true, initial:0, integer:true }),
					value: new fields.NumberField({ required: true, initial:0, min:0}),
				}),
			}),
			detalhes: new fields.SchemaField({
				resistencias: new fields.StringField({ initial: '' }),
				equipamento: new fields.StringField({ initial: '' }),
				tesouro: new fields.StringField({ initial: 'Padrão' }),
			}),
		});
	}
}

class ItemT20Data extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
		}
	}
}

export {
	systemActorCharacterData,
	systemActorNPCData,
	ActorT20Data,
	ItemT20Data
}

class SystemActorT20Data extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {
		return {
			v10Test: new foundry.data.fields.SchemaField({
				level: new foundry.data.fields.NumberField({ required: true, initial:0, min:0, max:20 })
			})
		}
	}
}

export {
	SystemActorT20Data
}