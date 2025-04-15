import CreatureData from "./creature.mjs";

import {
	ActorSkillsField,
	SkillData,
	_resourceSchema
} from "../helpers.mjs";

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
				initialKeys: SYSTEMRULES.skills, initialValue: super._initialSkillValue.bind(this), initialKeysOnly: false
			}),
			// pericias: new MappingField(new SkillData(),{required: true, initialKeys: SYSTEMRULES.skills, initialValue: this._initialSkillValue, initialKeysOnly: false}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type)
		};
	}

	/** @inheritdoc */
	static migrateData(data) {
		return super.migrateData(data);
	}
}
