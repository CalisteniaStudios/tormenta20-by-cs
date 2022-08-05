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
		console.error(value);
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

/* ---------------------------------------- */
/*  Object Key Assigns                      */
/* ---------------------------------------- */

/* Abilities */
function _abilitySchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
		bonus: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		mod: new fields.NumberField({ required: true, nullable:false, initial:0 })
	});
}
const AbilitiesSchema = {};
Object.keys(T20.atributos).forEach( abl => AbilitiesSchema[abl] = _abilitySchema());

/* ---------------------------- */

/* Skills */
function _skillSchema(){
	// TODO: get initial value for atributo, st, pda, size
	return new fields.SchemaField({
		atributo: new fields.StringField({ required: true, nullable:false, blank: false, choices: Object.keys(T20.atributos), initial: 'for'}),
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
const SkillsSchema = {};
Object.keys(T20.pericias).forEach( skl => SkillsSchema[skl] = _skillSchema());

/*  */

function _damageResistanceSchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
		imunidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
		vulnerabilidade: new fields.BooleanField({ required: true, nullable:false, initial: false }),
	});
}

const ResistanceSchema = {};
Object.keys(T20.damageTypes).forEach( dmg => ResistanceSchema[dmg] = _damageResistanceSchema());

function _resourceSchema () {
	return new fields.SchemaField({
		value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true }),
		temp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, step:1, integer:true }),
		min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
		max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true }),
	});
}

export {
	MappingField,
	ActorSkillsField,
	SkillData,
	AbilitiesSchema,
	SkillsSchema,
	ResistanceSchema,
	_resourceSchema,
}