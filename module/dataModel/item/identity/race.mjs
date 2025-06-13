import IdentityData from "./identity.mjs";

const fields = foundry.data.fields;
export default class RaceData extends IdentityData {
	/** @inheritDoc */
	static defineSchema() {
		const _fields = tormenta20.data.fields;
		return {
			...super.defineSchema(),
			...this.schemaItemGrants("race"),
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
			})
			// progressao: new _fields.MappingField(),
		};
	}
}
