import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class LootData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = "tesouro";
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaRolls(),
			container: new fields.BooleanField({ label: "T20.ItemIsContainer", hint: "T20.ItemIsContainerHint" })
		};
	}
}
