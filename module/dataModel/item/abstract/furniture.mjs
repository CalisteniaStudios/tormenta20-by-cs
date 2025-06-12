import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class FurnitureData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		return {
			...super.defineSchema(),
			preco: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ItemPrice",
				hint: "T20.ItemPriceHint"
			}),
			residentes: new fields.BooleanField({ initial: true })
		};
	}
}
