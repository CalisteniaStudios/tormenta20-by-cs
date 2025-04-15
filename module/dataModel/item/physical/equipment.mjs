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
			equipado: new fields.BooleanField({ required: true, nullable: false, initial: false, label: "T20.ItemEquipped", hint: "T20.ItemEquippedHint" }),
			equipado2: new fields.SchemaField({
				slot: new fields.NumberField({ required: true, nullable: false, initial: 0, label: "T20.ItemSlot", hint: "T20.ItemSlotHint" }),
				type: new fields.StringField({ required: true, blank: true, initial: "", choices: ["hand", "body", "both"], label: "T20.ItemSlotType", hint: "T20.ItemSlotTypeHint" })
			}),
			armadura: new fields.SchemaField({
				maxAtr: new fields.NumberField({ required: true, nullable: false, initial: 0, label: "T20.ItemEquipmentDefenseMaxAbility", hint: "T20.ItemEquipmentDefenseMaxAbilityHint" }),
				penalidade: new fields.NumberField({ required: true, nullable: false, initial: 0, label: "T20.ItemEquipmentArmorPenalty", hint: "T20.ItemEquipmentArmorPenaltyHint" }),
				value: new fields.NumberField({ required: true, nullable: false, initial: 0, label: "T20.ItemEquipmentDefenseValue", hint: "T20.ItemEquipmentDefenseValueHint" })
			}),
			tipo: new fields.StringField({ required: true, nullable: false, initial: "leve", label: "T20.ItemType", hint: "T20.ItemTypeHint" })
		};
	}

	/** @inheritdoc */
	static migrateData(data) {
		if (!data.equipado2) {
			data.equipado2 = {};
			if (data.empunhadura || ["escudo", "esoterico", "ferramenta"].includes(data.tipo)) {
				data.equipado2.type = "hand";
			} else if (["leve", "pesada", "traje", "acessorio"].includes(data.tipo)) {
				data.equipado2.type = "body";
			} else if ((["eng"].includes(data.tipo) && data.escola)) {
				data.equipado2.type = "both";
			}
			// data.equipado2.slot = data.equipado ?
		}
		return super.migrateData(data);
	}
}

