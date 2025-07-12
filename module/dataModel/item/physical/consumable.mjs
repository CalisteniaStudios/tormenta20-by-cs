import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class ConsumableData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = "consumivel";
		let schema = {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaUpgrades(type),
			...this.schemaRolls(),
			tipo: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemType",
				hint: "T20.ItemTypeHint"
			}),
			subtipo: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemSubType",
				hint: "T20.ItemSubTypeHint"
			})
		};

		return schema;
	}
}
