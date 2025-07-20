import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class SpellData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = "magia";
		return {
			...super.defineSchema(),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaRolls(),
			circulo: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 1,
				choices: CONFIG.T20.spellLevels,
				label: "T20.ItemSpellCircle",
				hint: "T20.ItemSpellCircleHint"
			}),
			escola: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: Object.keys(CONFIG.T20.spellSchools)[0],
				choices: CONFIG.T20.spellSchools,
				label: "T20.ItemSpellSchool",
				hint: "T20.ItemSpellSchoolHint"
			}),
			tipo: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: Object.keys(CONFIG.T20.spellType)[0],
				choices: CONFIG.T20.spellType,
				label: "T20.ItemType",
				hint: "T20.ItemTypeHint"
			}),
			preparada: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "T20.ItemSpellPrepared",
				hint: "T20.ItemSpellPreparedHint"
			}),
			equipado2: new fields.SchemaField({
				slot: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.ItemSlot",
					hint: "T20.ItemSlotHint"
				}),
				type: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					choices: ["hand", "body", "both"],
					label: "T20.ItemSlotType",
					hint: "T20.ItemSlotTypeHint"
				})
			})
		};
	}
}
