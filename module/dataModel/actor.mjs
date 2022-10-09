import { T20, SYSTEMRULES } from '../config.js';
const fields = foundry.data.fields;

import {
	ActorSkillsField,
	SkillData,
  AbilitiesSchema,
	ResistanceSchema,
	_resourceSchema
} from './helpers.js';

/** @TODO */
/** Find a way to deal with the following:
 * BaseActor level SchemaField {value: #NUM}
 * Chacrater level SchemaField {value: #NUM, xp: {value: #, next: #, pct: #}}
 * NPC level SchemaField {value: #NUM, cr: #,  xp: {value: #}}
 */
class systemActorBaseData extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.StringField(),
					des: new fields.StringField(),
					con: new fields.StringField(),
					int: new fields.StringField(),
					sab: new fields.StringField(),
					car: new fields.StringField(),
					fisicos: new fields.StringField(),
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
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({ choices: Object.keys(T20.atributos), initial: 'int' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des'}),
					pda: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.StringField({ required: true, nullable:false, initial: '' }),
				}),
				nivel: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, max:20 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
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
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ choices: Object.keys(T20.creatureTypes), initial: 'hum' }),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				idiomas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmaduras: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
			viz: new fields.StringField({initial:'viz'}),
			vizo: new fields.SchemaField({
				value: new fields.StringField({initial:'viz'}),
			})
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}
		return super.migrateData(data);
	}
}

class systemActorCharacterData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField()),
					des: new fields.ArrayField(new fields.StringField()),
					con: new fields.ArrayField(new fields.StringField()),
					int: new fields.ArrayField(new fields.StringField()),
					sab: new fields.ArrayField(new fields.StringField()),
					car: new fields.ArrayField(new fields.StringField()),
					fisicos: new fields.ArrayField(new fields.StringField()),
					mentais: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
				}),
				dano: new fields.SchemaField({
					ad: new fields.ArrayField(new fields.StringField()),
					alq: new fields.ArrayField(new fields.StringField()),
					cac: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
					mag: new fields.ArrayField(new fields.StringField()),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.ArrayField(new fields.StringField()),
					resistencia: new fields.ArrayField(new fields.StringField()),
					semataque: new fields.ArrayField(new fields.StringField()),
					ataque: new fields.ArrayField(new fields.StringField()),
					atr: new fields.SchemaField({
						for: new fields.ArrayField(new fields.StringField()),
						des: new fields.ArrayField(new fields.StringField()),
						con: new fields.ArrayField(new fields.StringField()),
						int: new fields.ArrayField(new fields.StringField()),
						sab: new fields.ArrayField(new fields.StringField()),
						car: new fields.ArrayField(new fields.StringField()),
					}),
				}),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({ choices: Object.keys(T20.atributos), initial: 'int' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des'}),
					pda: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
				}),
				nivel: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, max:20 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
						pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
						proximo: new fields.NumberField({ initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
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
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				origem: new fields.StringField({ initial: '' }),
				info: new fields.StringField({ initial: '' }),
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ required:true, choices: Object.keys(T20.creatureTypes), initial: 'hum' }),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
				diario: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
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
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				idiomas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmaduras: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
			teste: new fields.ArrayField(new fields.StringField()),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}
		return super.migrateData(data);
	}
}

class systemActorNPCData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField()),
					des: new fields.ArrayField(new fields.StringField()),
					con: new fields.ArrayField(new fields.StringField()),
					int: new fields.ArrayField(new fields.StringField()),
					sab: new fields.ArrayField(new fields.StringField()),
					car: new fields.ArrayField(new fields.StringField()),
					fisicos: new fields.ArrayField(new fields.StringField()),
					mentais: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
				}),
				dano: new fields.SchemaField({
					ad: new fields.ArrayField(new fields.StringField()),
					alq: new fields.ArrayField(new fields.StringField()),
					cac: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
					mag: new fields.ArrayField(new fields.StringField()),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.ArrayField(new fields.StringField()),
					resistencia: new fields.ArrayField(new fields.StringField()),
					semataque: new fields.ArrayField(new fields.StringField()),
					ataque: new fields.ArrayField(new fields.StringField()),
					atr: new fields.SchemaField({
						for: new fields.ArrayField(new fields.StringField()),
						des: new fields.ArrayField(new fields.StringField()),
						con: new fields.ArrayField(new fields.StringField()),
						int: new fields.ArrayField(new fields.StringField()),
						sab: new fields.ArrayField(new fields.StringField()),
						car: new fields.ArrayField(new fields.StringField()),
					}),
				}),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({ choices: Object.keys(T20.atributos), initial: 'int' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des'}),
					pda: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
				}),
				nd: new fields.StringField({ required:true, initial: '1'}),
				nivel: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:1, min:0 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
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
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			builder: new fields.SchemaField({
				attributes: new fields.SchemaField({
					cr: new fields.StringField({ initial: '' }),
					size: new fields.StringField({ initial: 'med' }),
					attack: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					botsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					damage: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					dc: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					defense: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					fort: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					hp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					midsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					mp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					refl: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					topsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					vont: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable: false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
				}),
				details: new fields.SchemaField({
					concept: new fields.StringField({ initial: '' }),
					creatureType: new fields.StringField({ initial: '' }),
					role: new fields.StringField({ initial: '' }),
					treasure: new fields.StringField({ initial: '' }),
				}),
			}),
			detalhes: new fields.SchemaField({
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ required:true, choices: Object.keys(T20.creatureTypes), initial: 'hum' }),
				nd: new fields.StringField({required:true, initial: '1'}),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
				equipamento: new fields.StringField({ initial: '' }),
				resistencias: new fields.StringField({ initial: '' }),
				tesouro: new fields.StringField({ initial: '' }),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				idiomas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmaduras: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}

		if( isNaN(data.attributes.nivel.value) || !isFinite( data.attributes.nivel.value ) ){
			data.attributes.nivel.value = 1;
		}
		return super.migrateData(data);
	}
}

class systemActorVehicleData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			attributes: new fields.SchemaField({
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
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
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				category: new fields.StringField({ required:true, initial: '' }),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}
	
	/** @inheritdoc */
	static migrateData(data) {
		return super.migrateData(data);
	}
}

class systemActorSimpleData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
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
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		return super.migrateData(data);
	}
}


export {
	systemActorCharacterData,
	systemActorNPCData,
	systemActorVehicleData,
	systemActorSimpleData,
}