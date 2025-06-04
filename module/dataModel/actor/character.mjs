import CreatureData from "./templates/creature.mjs";

import AttributesFields from "./templates/attributes.mjs";

export default class CharacterData extends CreatureData {
	static actorType = "character";

	/** @override */
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			...super.defineSchema(),
			equipamentos: new fields.SchemaField({
				limiteEmpunhado: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 2,
					min: 1
				}),
				limiteVestido: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 4,
					min: 1
				})
			})
		};
	}

	/** @inheritdoc */
	static migrateData(data) {
		// console.warn('migrateData', data);
		if (data.detalhes?.tipo && !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo)) {
			let cType = Object.keys(T20.creatureTypes).find((c) => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? "hum";
		}
		return super.migrateData(data);
	}

	prepareBaseData() {
		const nivel = this.parent.nivel;
		this.attributes.nivel.value = nivel;
		this.attributes.treino = nivel > 14 ? 6 : nivel > 6 ? 4 : 2;
		// Experience required for next level
		const xp = this.attributes.nivel.xp;
		xp.proximo = this.parent.getLevelExp(nivel || 1);
		const anterior = this.parent.getLevelExp(nivel - 1 || 0);
		const necessario = xp.proximo - anterior;
		const pct = Math.round(((xp.value - anterior) * 100) / necessario);
		xp.pct = Math.clamp(pct, 0, 100);
	}

	prepareDerivedData() {
		const rollData = this.parent.getRollData();
		this.prepareAtributos({ rollData });
		AttributesFields.prepareDefense.call(this, rollData);
		this.prepareSkills({ rollData });

		AttributesFields.prepareSpellcastingAbility.call(this);
		AttributesFields.prepareMovement.call(this);
		AttributesFields.prepareEncumbrance.call(this, rollData);
		AttributesFields.prepareDamageResistances.call(this, rollData);
		AttributesFields.preparePVPM.call(this, rollData);
	}
}
