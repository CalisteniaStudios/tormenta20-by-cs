import CreatureData from "./templates/creature.mjs";

import { ActorSkillsField, SkillData } from "../helpers.mjs";
import AttributesFields from "./templates/attributes.mjs";

export default class CharacterData extends CreatureData {
	/** @override */
	static defineSchema() {
		const type = "character";
		const fields = foundry.data.fields;
		return {
			atributos: this.schemaAbilities(type),
			attributes: this.schemaAttributes(type),
			detalhes: this.schemaDetails(type),
			dinheiro: this.schemaCurrency(type),
			modificadores: this.schemaModifiers(type),
			pericias: new ActorSkillsField(new fields.EmbeddedDataField(SkillData), {
				initialKeys: SYSTEMRULES.skills,
				initialValue: super._initialSkillValue.bind(this),
				initialKeysOnly: false
			}),
			// pericias: new MappingField(new SkillData(),{required: true, initialKeys: SYSTEMRULES.skills, initialValue: this._initialSkillValue, initialKeysOnly: false}),
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
			}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type)
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

		AttributesFields.prepareBaseDefense.call(this);
	}

	prepareDerivedData() {
		const rollData = this.parent.getRollData();
		this.prepareAtributos({ rollData });
		this.prepareSkills({ rollData });

		AttributesFields.prepareDefense.call(this, rollData);
		AttributesFields.prepareSpellcastingAbility.call(this);
		AttributesFields.prepareMovement.call(this);
		AttributesFields.prepareEncumbrance.call(this, rollData);
		AttributesFields.prepareDamageResistances.call(this, rollData);
		AttributesFields.preparePVPM.call(this, rollData);
	}
}
