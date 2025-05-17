import IdentityData from "./identity.mjs";

const fields = foundry.data.fields;
export default class RaceData extends IdentityData {
	/** @inheritDoc */
	static defineSchema() {
		const _fields = tormenta20.data.fields;
		return {
			...super.defineSchema(),
			atributos: new fields.SchemaField(
				Object.fromEntries(
					Object.keys(T20.atributos).map((abl) => [
						abl,
						new fields.NumberField({
							required: true,
							nullable: false,
							initial: 0,
							min: -5
						})
					])
				)
			),
			atributosDinamicos: new fields.SchemaField({
				value: new fields.SetField(new fields.StringField({ required: true, blank: false })),
				description: new fields.StringField({
					required: true,
					nullable: false,
					initial: game.i18n.localize("T20.DynamicAbilitiesDesc")
				})
			}),
			movement: new fields.EmbeddedDataField(_fields.MovementData),
			tamanho: new fields.SetField(
				new fields.StringField({
					required: true,
					nullable: false,
					initial: "med",
					label: "T20.TraitActorSize",
					hint: "T20.TraitActorSizeHint"
				}),
				{
					initial: ["med"]
				}
			)
			// progressao: new _fields.MappingField(),
		};
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
	async toEmbed(config, options = {}) {
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
