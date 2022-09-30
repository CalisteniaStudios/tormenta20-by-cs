import { T20, SYSTEMRULES } from '../config.js';
const fields = foundry.data.fields;

/* ---------------------------------------- */
/*  Custom DataFields                       */
/* ---------------------------------------- */

/**
 * A subclass of ObjectField that represents a mapping of keys to the provided DataModel type.
 * @extends ObjectField
 * @param {DataModel} type                 The class of DataModel which should be embedded in this field
 * @param {DataFieldOptions} [options={}]  Options which configure the behavior of the field
 */
class MappingField extends fields.ObjectField {

	constructor(model, options) {
		// TODO: Should this also allow the validation of keys?
		super(options);
		if ( !isSubclass(model, foundry.abstract.DataModel) ) {
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
			const err = this.model.schema.validate(v, options);
			if ( !isEmpty(err) ) errors[k] = err;
		}
		if ( !isEmpty(errors) ) throw new Error(foundry.abstract.DataModel.formatValidationErrors(errors));
		return super.validate(value, options);
	}

	/** @override */
	initialize(value, model, name) {
		if ( !value ) return value;
		value = foundry.utils.deepClone(value);
		for ( let v of Object.values(value) ) {
			v = new this.model(v, {parent: model});
		}
		return value;
	}
}

class ActorSkillsField extends MappingField {

	/** @override */
	getInitialValue(data) {
		let keys = this.options.initialKeys;
		if ( !keys ) return super.getInitialValue(data);
		if ( !(keys instanceof Array) ) keys = Object.keys(keys);
		const initial = {};
		for ( const key of keys ) {
			initial[key] = {};
		}
		if ( !foundry.utils.isEmpty(this.initial) ) this.initial = initial;
		return this.initial instanceof Function ? this.initial(data) : this.initial;
	}
	
	/** @override */
	initialize(value, model, name) {
		if ( !value ) return value;
		value = foundry.utils.deepClone(value);
		const skills = SYSTEMRULES.skills;
		const gameSystem = game.settings.get('tormenta20', 'gameSystem');
		for ( let [k, v] of Object.entries(value) ) {
			if( !skills[k]?.systems.includes('core', gameSystem) ) continue;
			v.atributo = v.atributo ?? skills[k].abl;
			v.pda = v.pda ?? skills[k].armorPenalty;
			v.st = v.st ?? skills[k].trainedOnly;
			v.size = v.size ?? skills[k].sizeMod;
			v = new this.model(v, {parent: model});
		}
		return value;
	}

	/** @override */
	validate(value, options={}) {
		const errors = {};
		for ( const [k, v] of Object.entries(value) ) {
			const err = this.model.schema.validate(v, options);
			if ( !isEmpty(err) ) errors[k] = err;
		}
		if ( !isEmpty(errors) ) throw new Error(foundry.abstract.DataModel.formatValidationErrors(errors));
		return super.validate(value, options);
	}
}

/* ----------------------------- */

class SkillData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributo: new fields.StringField({ required: true, nullable:false, blank: false, choices: Object.keys(T20.atributos), initial: 'for'}),
			treinado: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			st: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			pda: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			size: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			bonus: new fields.StringField({ required: true, nullable:false, initial: '' }),
			custom: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			label: new fields.StringField({ required: true, nullable:false, initial: '' }),
			nome: new fields.StringField({ required: true, nullable:false, initial: '' }),
			// order: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		}
	};
}

/* ----------- Items ----------- */

class PartData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
		}
	}
}

class RollData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			key: new fields.StringField({ required: true, nullable:false, initial:'roll'}),
			name: new fields.StringField({ required: true, nullable:false, initial:'Roll' }),
			parts: new fields.ArrayField(new fields.ArrayField(
				new fields.StringField({ required: true, nullable:false, initial:''}),
				{
					// validate: r => (r.length === 3),
					// validationError: "must be a length-3 array",
					initial: ['','','']
				}
			)),
			// parts: new fields.ArrayField(new PartData)),
			// parts: new fields.ObjectField({ initial:{ 0:['1d4','ac'] } }),
			type: new fields.StringField({ required: true, nullable:false, choices:['ataque','dano','formula'], initial:'dano'}),
			versatil: new fields.StringField({ nullable:false, initial:'' }),
		};
	}

	/** @override */
	validate(value, options={}) {
		return super.validate(value, options);
	}

	/** @override */
	_validateType(value, options={}) {
		return super._validateType(value, options);
	}

	/** @inheritdoc */
	static migrateData(data) {
		for ( let [k, v] of Object.entries(data.parts) ){
			if( v.length !== 3 ){
				data.parts[k] = [ v[0] ?? '', v[1] ?? '', v[2] ?? '' ];
			}
		}
		return super.migrateData(data);
	}
}

function getRollData(){
	return {
		key: new fields.StringField({ required: true, nullable:false, initial:'roll'}),
		name: new fields.StringField({ required: true, nullable:false, initial:'Roll' }),
		parts: new fields.ArrayField(new fields.ArrayField(
			new fields.StringField({ required: true, nullable:false, initial:''}),
			{
				validate: r => (r.length === 3),
				validationError: "must be a length-3 array",
				initial: ['','','']
			}
		)),
		type: new fields.StringField({ required: true, nullable:false, choices:['ataque','dano','formula'], initial:'dano'}),
		versatil: new fields.StringField({ nullable:false, initial:'' }),
	};
}

/* ---------------------------------------- */
/*  Object Key Assigns                      */
/* ---------------------------------------- */

/* Abilities */
const AbilitiesSchema = () => {
	let getSchema = () => {
		return new fields.SchemaField({
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:-5 }),
			base: new fields.NumberField({ required: true, nullable:false, initial:0}),
			racial: new fields.NumberField({ required: true, nullable:false, initial:0}),
			bonus: new fields.NumberField({ required: true, nullable:false, initial:0}),
		});
	}
	
	let schema = {};
	Object.keys(T20.atributos).forEach( abl => schema[abl] = getSchema());
	return schema;
}

/* ---------------------------- */

/* Damage Resistances */
const ResistanceSchema = () => {
	let getSchema = () => {
		return new fields.SchemaField({
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			imunidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			vulnerabilidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		});
	}
	
	let schema = {};
	Object.keys(T20.damageTypes).forEach( dmg => schema[dmg] = getSchema());
	return schema;
}


function _resourceSchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
		temp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, step:1, integer:true }),
		min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
		max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
	});
}

/* ITEMS */
// Base Data
function getObjectBaseData() {
	return {
		description: new fields.SchemaField({
			value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
			chat: new fields.HTMLField({ initial:'' }),
			unidentified: new fields.HTMLField({ initial:'' }),
		}),
		source: new fields.StringField({ initial: '' }),
		origin: new fields.StringField({ initial: '' }),
		chatFlavor: new fields.StringField({ required: true, nullable:false, initial: '' }),
	}
}

// Physical Object Data
function getObjectItemData() {
	return {
		carregado: new fields.BooleanField({ required: true, nullable:false, initial: true }),
		espacos: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		peso: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		qtd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		preco: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		pv: new fields.SchemaField({
			value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
			min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
			max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
		}),
		rd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
	}
}

// Acvation Data
function getActivationItemData() {
	return {
		// ativacao
		ativacao: new fields.SchemaField({
			custo: new fields.NumberField({  requirede:true, initial:0 }),
			condicao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			execucao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			qtd: new fields.StringField({ initial: '' }),
			special: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		// consume
		consume: new fields.SchemaField({
			amount: new fields.NumberField({ initial:0 }),
			target: new fields.StringField({ required: true, nullable:false, initial: '' }),
			type: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		// duracao
		duracao: new fields.SchemaField({
			units: new fields.StringField({ required: true, nullable:false, initial: '' }),
			value: new fields.NumberField({ required: true, nullable:false, initial:0 }),
			special: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		// range
		range: new fields.SchemaField({
			units: new fields.StringField({ required: true, nullable:false, initial: '' }),
			value: new fields.NumberField({ initial:0 }),
		}),
		// target
		target: new fields.SchemaField({
			type: new fields.StringField({ required: true, nullable:false, initial: '' }),
			value: new fields.NumberField({ initial:0 }),
			width: new fields.NumberField({ initial:0 }),
		}),
		
		alcance: new fields.StringField({ required: true, nullable:false, initial: '' }),
		alvo: new fields.StringField({ required: true, nullable:false, initial: '' }),
		area: new fields.StringField({ required: true, nullable:false, initial: '' }),
		efeito: new fields.StringField({ required: true, nullable:false, initial: '' }),
	}
}

// Acvation Data
function getSaveItemData() {
	return {
		resistencia: new fields.SchemaField({
			txt: new fields.StringField({ required: true, nullable:false, initial: '' }),
			pericia: new fields.StringField({ required: true, nullable:false, initial: '' }),
			atributo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			bonus: new fields.NumberField({ required: true, initial:0 }),
		})
	}
}

export {
	MappingField,
	ActorSkillsField,
	SkillData,
	AbilitiesSchema,
	ResistanceSchema,
	_resourceSchema,
	getObjectBaseData,
	getObjectItemData,
	getActivationItemData,
	getSaveItemData,
	RollData,
}