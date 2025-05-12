import CreatureData from "./creature.mjs";

import { ActorSkillsField, SkillData, _resourceSchema } from "../helpers.mjs";

export default class MenaceData extends CreatureData {
	/** @override */
	static defineSchema() {
		const fields = foundry.data.fields;
		const type = "npc";
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
			// pericias: new MappingField(new SkillData(), {required: true, initialKeys: SYSTEMRULES.skills, initialValue: this._initialSkillValue, initialKeysOnly: false}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type)
		};
	}

	/** @inheritdoc */
	static migrateData(data) {
		if (data.detalhes?.tipo && !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo)) {
			let cType = Object.keys(T20.creatureTypes).find((c) => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? "hum";
		}

		if (data.detalhes?.nd && data.detalhes.nd > data.attributes.nd) {
			data.attributes.nd = data.detalhes.nd;
		}

		if (data.attributes?.nivel && (isNaN(data.attributes?.nivel.value) || !isFinite(data.attributes?.nivel.value))) {
			data.attributes.nivel.value = 1;
		}
		return super.migrateData(data);
	}
}
