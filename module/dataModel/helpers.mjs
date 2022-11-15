import { T20, SYSTEMRULES } from '../config.mjs';
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
		if ( !(model instanceof foundry.data.fields.DataField) ) {
			console.warn(model.constructor.name );
			throw new Error("MappingField must have a DataField as its contained element");
		}
		super(options);

		/**
		 * The embedded DataField definition which is contained in this field.
		 * @type {DataField}
		 */
		this.model = model;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	static get _defaults() {
		return foundry.utils.mergeObject(super._defaults, {
			initialKeys: null,
			initialValue: null
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_cleanType(value, options) {
		Object.values(value).forEach(v => this.model.clean(v, options));
		return value;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	getInitialValue(data) {
		let keys = this.options.initialKeys;
		if ( !keys || !foundry.utils.isEmpty(this.initial()) ) return super.getInitialValue(data);
		if ( !(keys instanceof Array) ) keys = Object.keys(keys);
		const initial = {};
		for ( const key of keys ) {
			const modelInitial = this.model.getInitialValue();
			initial[key] = this.initialValue?.(key, modelInitial) ?? modelInitial;
		}
		return initial;
	}

	/* -------------------------------------------- */

	/** @override */
	_validateType(value, options={}) {
		if ( typeof value !== "object" ) throw new Error("must by an Object");
		const errors = this._validateValues(value, options);
		if ( !foundry.utils.isEmpty(errors) ) throw new foundry.data.fields.ModelValidationError(errors);
	}

	/* -------------------------------------------- */

	/**
	 * Validate each value of the object.
	 * @param {object} value    The object to validate.
	 * @param {object} options  Validation options.
	 * @returns {object}        An object of value-specific errors by key.
	 */
	_validateValues(value, options) {
		const errors = {};
		for ( const [k, v] of Object.entries(value) ) {
			const error = this.model.validate(v, options);
			if ( error ) errors[k] = error;
		}
		return errors;
	}

	/* -------------------------------------------- */

	/** @override */
	initialize(value, model) {
		if ( !value ) return value;
		Object.values(value).forEach(v => this.model.initialize(v, model));
		return value;
	}
}

class ActorSkillsField extends MappingField {
	/** @inheritdoc */
	getInitialValue(data) {
		let keys = this.options.initialKeys;
		if ( !keys || !foundry.utils.isEmpty(this.initial()) ) return super.getInitialValue(data);
		if ( !(keys instanceof Array) ) {
			const gameSystem = game.settings.get('tormenta20', 'gameSystem');
			keys = Object.entries(keys).filter((f)=> f[1].systems.some(s=>['core',gameSystem].includes(s))).map(m=>m[0]);
		}
		const initial = {};
		for ( const key of keys ) {
			const modelInitial = this.model.getInitialValue();
			initial[key] = this.initialValue?.(key, modelInitial) ?? modelInitial;
		}
		return initial;
	}
}

/* ----------------------------- */

class SkillData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributo: new fields.StringField({ required: true, nullable:false, blank: false, choices: Object.keys(T20.atributos), initial: 'for', label: "T20.SkillAbility", hint: "T20.SkillAbilityHint"}),
			treinado: new fields.BooleanField({ required: true, nullable:false, initial: false , label: "T20.SkillTrained", hint: "T20.SkillTrainedHint"}),
			st: new fields.BooleanField({ required: true, nullable:false, initial: false , label: "T20.SkillTrainedOnly", hint: "T20.SkillTrainedOnlyHint"}),
			pda: new fields.BooleanField({ required: true, nullable:false, initial: false , label: "T20.SkillArmorPenalty", hint: "T20.SkillArmorPenaltyHint"}),
			size: new fields.BooleanField({ required: true, nullable:false, initial: false , label: "T20.SkillSizeModifier", hint: "T20.SkillSizeModifierHint"}),
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 , label: "T20.SkillValue", hint: "T20.SkillValueHint"}),
			outros: new fields.NumberField({ required: true, nullable:false, initial:0 , label: "T20.SkillOtherValue", hint: "T20.SkillOtherValueHint"}),
			condi: new fields.NumberField({ required: true, nullable:false, initial:0 , label: "T20.SkillStatusEffectValue", hint: "T20.SkillStatusEffectValueHint"}),
			bonus: new fields.ArrayField(new fields.StringField(), {label: "T20.SkillEffectsValues", hint: "T20.SkillEffectsValuesHint"}),
			custom: new fields.BooleanField({ required: true, nullable:false, initial: false , label: "T20.SkillCustom", hint: "T20.SkillCustomHint"}),
			label: new fields.StringField({ required: true, nullable:false, initial: '' , label: "T20.SkillLabel", hint: "T20.SkillLabelHint"}),
			nome: new fields.StringField({ required: true, nullable:false, initial: '' , label: "T20.SkillNameValue", hint: "T20.SkillNameHint"}),
			// order: new fields.NumberField({ required: true, nullable:false, initial:0 }),
		}
	};
	
	static migrateData(data) {
		if ( data.bonus?.length > 0 ) data.bonus = [];
		return super.migrateData(data);
	}
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
		tags: new fields.ArrayField(new fields.StringField()),
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
			custo: new fields.NumberField({  required:true, initial:0 }),
			condicao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			execucao: new fields.StringField({ required: true, nullable:false, initial: '' }),
			qtd: new fields.StringField({ initial: '' }),
			special: new fields.StringField({ required: true, nullable:false, initial: '' }),
		}),
		// consume
		consume: new fields.SchemaField({
			amount: new fields.NumberField({ initial:0 }),
			mpMultiplier: new fields.BooleanField({ required:true, initial:false }),
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