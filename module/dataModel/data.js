import { DataModel } from "/common/abstract/data.mjs";
import * as fields from "/common/data/fields.mjs";
import { lists } from './lists.js';
import { T20 } from '../config.js';




/* ---------------------------------------- */
/*  Helpers                                 */
/* ---------------------------------------- */

function getObjectItemData() {
	return {
		pv: _resource2Schema(),
		rd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		equipado: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		carregado: new fields.BooleanField({ required: true, nullable:false, initial: true }),
		peso: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		qtd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		preco: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		espacos: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
	}
}

function getSaveItemData() {
	return {
		resistencia: new fields.SchemaField({
			atributo: new fields.StringField({ required: true, nullable:false, choices: lists['abilities'], initial: '' }),
			bonus: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			pericia: new fields.StringField({ required: true, nullable:false, initial: '' }),
			txt: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
	}
}

function getActivationItemData() {
	return {
		//efeitoAtivado
		// target
		target: new fields.SchemaField({
			type: new fields.StringField({ required: true, nullable:false, initial: '' }),
			unidades: new fields.StringField({ required: true, nullable:false, initial: '' }),
			units: new fields.StringField({ required: true, nullable:false, initial: '' }),
			comprimento: new fields.NumberField({ initial:0 }),
			value: new fields.NumberField({ initial:0 }),
			width: new fields.NumberField({ initial:0 }),
		}),
		// range
		range: new fields.SchemaField({
			units: new fields.StringField({ required: true, nullable:false, initial: '' }),
			value: new fields.NumberField({ initial:0 }),
		}),
		// duracao
		duracao: new fields.SchemaField({
			units: new fields.StringField({ required: true, nullable:false, initial: '' }),
			unidade: new fields.StringField({ required: true, nullable:false, initial: '' }),
			value: new fields.NumberField({ initial:0 }),
			valor: new fields.StringField({ required: true, nullable:false, initial: '' }),
			special: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		// consume
		consume: new fields.SchemaField({
			type: new fields.StringField({ required: true, nullable:false, initial: '' }),
			target: new fields.StringField({ required: true, nullable:false, initial: '' }),
			amount: new fields.NumberField({ initial:0 }),
		}),
		// ativacao
		ativacao: new fields.SchemaField({
			custo: new fields.NumberField({  requirede:true, initial:0 }),
			condicao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			execucao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			qtd: new fields.StringField({ initial: '' }),
			special: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		alcance: new fields.StringField({ required: true, nullable:false, initial: '' }),
		alvo: new fields.StringField({ required: true, nullable:false, initial: '' }),
		area: new fields.StringField({ required: true, nullable:false, initial: '' }),
		efeito: new fields.StringField({ required: true, nullable:false, initial: '' }),
	}
}

/* ---------------------------------------- */
/*  PropertiesDataModel                     */
/* ---------------------------------------- */

/* -------------------------------------------- */

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataModel type.
 * @extends ObjectField
 * @param {DataModel} type                 The class of DataModel which should be embedded in this field
 * @param {DataFieldOptions} [options={}]  Options which configure the behavior of the field
 */
export class MappingField extends fields.ObjectField {

	constructor(model, options) {
		// TODO: Should this also allow the validation of keys?
		super(options);
		if ( !isSubclass(model, DataModel) ) {
			throw new Error("An EmbeddedDataField must specify a DataModel class as its type");
		}
		/**
		 * The embedded DataModel definition which is contained in this field.
		 * @type {*}
		 */
		this.model = model;
	}

	/** @inheritdoc */
	clean(value, data, options) {
		value = super.clean(value, data, options);
		for ( let v of Object.values(value) ) {
			if ( this.options.clean instanceof Function ) v = this.options.clean.call(this, v);
			v = this.model.cleanData(v, options);
		}
		return value;
	}

	/** @inheritdoc */
	getInitialValue(data) {
		let keys = this.options.initialKeys;
		if ( !keys || !foundry.utils.isEmpty(this.initial) ) return super.getInitialValue(data);
		if ( !(keys instanceof Array) ) keys = Object.keys(keys);
		const initial = {};
		for ( const key of keys ) {
			initial[key] = {};
		}
		return initial;
	}

	/** @override */
	validate(value, options={}) {
		const errors = {};
		for ( const [k, v] of Object.entries(value) ) {
			const err = SchemaField.validateSchema(this.model.schema, v, options);
			if ( !isEmpty(err) ) errors[k] = err;
		}
		if ( !isEmpty(errors) ) throw new Error(DataModel.formatValidationErrors(errors));
		return super.validate(value, options);
	}

	/** @override */
	initialize(model, name, value) {
		if ( !value ) return value;
		value = foundry.utils.deepClone(value);
		for ( let v of Object.values(value) ) {
			v = new this.model(v, {parent: model});
		}
		return value;
	}

}

class PartsData extends DataModel {

}

class RollData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			key: new fields.StringField({ required: true, nullable:false, initial:'roll'}),
			name: new fields.StringField({ required: true, nullable:false, initial:'Roll' }),
			// parts: new fields.ArrayField(new fields.ObjectField({initial: {0:'1d4',1:'acido'}})),
			// parts: new fields.ArrayField(new fields.ObjectField({initial: ['1d4','acido']})),
			parts: new fields.ObjectField({ initial:{ 0:['1d4','ac'] } }),
			type: new fields.StringField({ required: true, nullable:false, choices:['ataque','dano','formula'], initial:'dano'}),
			versatil: new fields.StringField({ nullable:false, initial:'' }),
		};
	}
}

class AbilityData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
			bonus: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			mod: new fields.NumberField({ required: true, nullable:false, initial:0 })
		};
	}
}

function _abilitySchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
		bonus: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		mod: new fields.NumberField({ required: true, nullable:false, initial:0 })
	});
}


class SkillData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			atributo: new fields.StringField({ required: true, nullable:false, blank: false, choices: lists['abilities'], initial: 'for'}),
			treinado: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			st: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			pda: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			size: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			bonus: new fields.StringField({ required: true, nullable:false, initial: '' }),
		};
	}
}

function _skillSchema(){
	// TODO: get initial value for atributo, st, pda, size
	return new fields.SchemaField({
		atributo: new fields.StringField({ required: true, nullable:false, blank: false, choices: lists['abilities'], initial: 'for'}),
		treinado: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		st: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		pda: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		size: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		bonus: new fields.StringField({ required: true, nullable:false, initial: '' }),
	})
}

class DamageResistanceData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			imunidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			vulnerabilidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		};
	}
}


function _damageResistanceSchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		imunidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		vulnerabilidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
	});
}

class ResourceData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
			temp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, step:1, integer:true }),
			min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
			max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
		};
	}
}


function _resourceSchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
		temp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, step:1, integer:true }),
		min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
		max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
	});
}


function _resource2Schema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
		min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
		max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
	});
}

/* ---------------------------------------- */
/*  DocumentsDataModel                      */
/* ---------------------------------------- */

class systemActorBaseData extends DataModel {
	/* @override */
	static defineSchema() {
		// Dinamically set repetitive structures
		let abilities = {};
		lists['abilities'].forEach( abl => abilities[abl] = _abilitySchema());
		// TODO: Set default skill list according to campaign setting
		let skills = {};
		lists['skills']['core'].forEach( skl => skills[skl] = _skillSchema() );
		// TODO: Set default statusEffect list according to campaign setting
		let statusEffectsChoices = lists['statusEffects']['core'];
		// TODO: Set default damage resistances list according to campaign setting
		let dresist = {};
		lists['damageTypes']['core'].forEach( dr => dresist[dr] = _damageResistanceSchema() );
		let schema = {
			atributos: new fields.SchemaField(abilities),
			pericias: new fields.SchemaField(skills),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({ choices: lists['abilities'], initial: 'int' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),//new fields.SchemaField(_resourceSchema()),
				pm: _resourceSchema(),//new fields.SchemaField(_resourceSchema()),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: lists['abilities'], initial:'des'}),
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
				resistencias: new fields.SchemaField(dresist),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
		};
		
		return schema;
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
		// let schema = mergeObject( super.defineSchema() , {
		let schema = {
			...super.defineSchema(),
			attributes: new fields.SchemaField({
				nivel: new fields.SchemaField({
					xp: new fields.SchemaField({
						pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
						proximo: new fields.NumberField({ initial:0, integer:true }),
					}),
				}),
			}),
			detalhes: new fields.SchemaField({
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
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
		};
		console.warn(schema);
		return schema;
		return mergeObject( super.defineSchema() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
	}

	
}

class systemActorNPCData extends systemActorBaseData {
	/* @override */
	static defineSchema() {
		return mergeObject( super.defineSchema() , {
			attributes: new fields.SchemaField({
				nivel: new fields.SchemaField({
					nd: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0}),
				}),
			}),
			detalhes: new fields.SchemaField({
				resistencias: new fields.StringField({ initial: '' }),
				equipamento: new fields.StringField({ initial: '' }),
				tesouro: new fields.StringField({ initial: 'Padrão' }),
			}),
		}, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
	}
}

function getSystemActorData(type) {
	switch (type) {
		case 'character':
			return systemActorCharacterData;
			break;
		case 'npc':
			return systemActorNPCData;
			break;
		default:
			// TODO: Veiculo, SimpleNPC?
			return systemActorBaseData;
			break;
	}
}

/* ---------------------------------------- */

class systemItemBaseData extends DataModel {
	/* @override */
	static defineSchema() {
		return {
			description: new fields.SchemaField({
				value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
				chat: new fields.HTMLField({ initial:'' }),
				unidentified: new fields.HTMLField({ initial:'' }),
			}),
			source: new fields.StringField({ initial: '' }),
			chatFlavor: new fields.StringField({ required: true, nullable:false, initial: '' }),
			tag1: new fields.StringField({ initial: '' }),
			tag2: new fields.ArrayField(new fields.StringField()),
		}
	}
}

class systemItemWeaponData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({ required:true, nullable:false, initial:0 }),
			}),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			equipado: new fields.NumberField({ required: true, nullable:false, initial: 0, min:0, max:2 }),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			tipoUso: new fields.StringField({ required: true, nullable:false, initial: 'simples' }),
			alcance: new fields.StringField({ required: true, nullable:false, initial: '' }),
			criticoM: new fields.NumberField({ required:true, nullable:false, initial:20 }),
			criticoX: new fields.NumberField({ required:true, nullable:false, initial:2 }),
			lancinante: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			propriedades: new fields.ObjectField(),
			encantos: new fields.ObjectField(),
		}

		mergeObject( schema, getObjectItemData() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		return mergeObject( super.defineSchema() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		return mergeObject( super.defineSchema() , schema );
	}
}

class systemItemArmorData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			armadura: new fields.SchemaField({
				value: new fields.NumberField({ required:true , initial:0 }),
				penalidade: new fields.NumberField({ required:true , initial:0 }),
				maxAtr: new fields.NumberField({ required:true , initial:0 }),
			}),
		}
		mergeObject( schema, getObjectItemData(), {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		return mergeObject( super.defineSchema() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
	}
}

class systemItemSpellData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			circulo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			escola: new fields.StringField({ required: true, nullable:false, initial: '' }),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			preparada: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		}
		mergeObject( schema, getActivationItemData(), {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		mergeObject( schema, getSaveItemData(), {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		return mergeObject( super.defineSchema() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
	}
}

class systemItemPowerData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}
		mergeObject( schema, getActivationItemData(), {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		mergeObject( schema, getSaveItemData(), {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
		return mergeObject( super.defineSchema() , schema, {insertKeys: true, insertValues: true, recursive: true, overwrite: false} );
	}
}

class systemItemUtilData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			uses: new fields.SchemaField({
				autoDestroy: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			}),
		}
		mergeObject( schema, getActivationItemData() );
		mergeObject( schema, getSaveItemData() );
		mergeObject( schema, getObjectItemData() );
		return mergeObject( super.defineSchema() , schema );
	}
}

class systemItemClassData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			niveis: new fields.NumberField({ required: true , initial:1 }),
			pvPorNivel: new fields.NumberField({ required: true , initial:1 }),
			pmPorNivel: new fields.NumberField({ required: true , initial:1 }),
			inicial: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			pericias: new fields.SchemaField({
				numero: new fields.NumberField({ required:true , initial:1 }),
				inatas: new fields.StringField({ required: true, nullable:false, initial: '' }),
				escolhas: new fields.ObjectField(),
				value: new fields.ArrayField(new fields.StringField()),
			}),
		}
		return mergeObject( super.defineSchema() , schema );
	}
}

class systemItemLootData extends systemItemBaseData {
	/* @override */
	static defineSchema() {
		let schema = {
			container: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
		}
		mergeObject( schema, getObjectItemData() );
		return mergeObject( super.defineSchema() , schema );
	}
}

function getSystemItemData(type) {
	switch (type) {
		case 'equipamento':
			return systemItemArmorData;
			break;
		case 'arma':
			return systemItemWeaponData;
			break;
		case 'magia':
			return systemItemSpellData;
			break;
		case 'poder':
			return systemItemPowerData;
			break;
		case 'consumivel':
			return systemItemUtilData;
			break;
		case 'classe':
			return systemItemBaseData;
			return systemItemClassData;
			break;
		case 'tesouro':
			return systemItemLootData;
			break;
		default:
			// TODO: RAÇA, ORIGEM, ALIADO
			return systemItemBaseData;
			break;
	}
	return schema
}

/* ---------------------------------------- */

export {
	getSystemActorData,
	getSystemItemData
}