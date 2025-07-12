import { PenaltyField } from "../../helpers.mjs";
import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class EquipmentData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = "equipamento";
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaUpgrades(type),
			...this.schemaRolls(),
			equipado: new fields.BooleanField({ label: "T20.ItemEquipped", hint: "T20.ItemEquippedHint" }),
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
					blank: false,
					initial: "body",
					choices: ["hand", "body", "both"],
					label: "T20.ItemSlotType",
					hint: "T20.ItemSlotTypeHint"
				})
			}),
			armadura: new fields.SchemaField({
				maxAtr: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.ItemEquipmentDefenseMaxAbility",
					hint: "T20.ItemEquipmentDefenseMaxAbilityHint"
				}),
				penalidade: new PenaltyField({
					required: true,
					nullable: false,
					initial: 0,
					max: 0,
					label: "T20.ItemEquipmentArmorPenalty",
					hint: "T20.ItemEquipmentArmorPenaltyHint"
				}),
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.ItemEquipmentDefenseValue",
					hint: "T20.ItemEquipmentDefenseValueHint"
				})
			}),
			tipo: new fields.StringField({
				required: true,
				nullable: false,
				initial: "leve",
				label: "T20.ItemType",
				hint: "T20.ItemTypeHint"
			})
		};
	}
}
