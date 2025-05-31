import CreatureData from "./templates/creature.mjs";

import { ActorSkillsField, SkillData } from "../helpers.mjs";
import AttributesFields from "./templates/attributes.mjs";

export default class SimpleData extends CreatureData {
	/** @override */
	static defineSchema() {
		const fields = foundry.data.fields;
		const type = "simple";
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
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type)
		};
	}

	prepareBaseData() {
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
	}
}
