import IdentityData from "./identity.mjs";

const fields = foundry.data.fields;
export default class RaceData extends IdentityData {

	/** @inheritDoc */
	static defineSchema() {
		const _fields = tormenta20.data.fields;
		return {
			...super.defineSchema(),
			atributos: this.schemaAbilities(),
			movement: new fields.EmbeddedDataField(_fields.MovementData),
			tamanho: new fields.StringField({ required: true, nullable: false, choices: Object.keys(T20.actorSizes), initial: "med", label: "T20.TraitActorSize", hint: "T20.TraitActorSizeHint" })
			// progressao: new _fields.MappingField(),
		};
	}

	static schemaAbilities() {
		let getSchema = () => {
			return new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable: false, initial: 0, min: -5, label: "T20.AbilityValue", hint: "T20.AbilityValueHint" })
			});
		};

		let schema = {};
		Object.keys(T20.atributos).forEach((abl) => schema[abl] = getSchema());
		return new fields.SchemaField(schema);
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Getters/Setters                             */
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  System Operations                           */
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/* Data Preparation                             */
	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareBaseData() {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareDerivedData() {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async toEmbed(config, options={}) {
		return null;
	}

	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preCreate(data, options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onCreate(data, options, userId) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preUpdate(changes, options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onUpdate(changed, options, userId) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preDelete(options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onDelete(options, userId) {}
}
