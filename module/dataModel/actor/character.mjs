import CreatureData from "./creature.mjs";

import { ActorSkillsField, SkillData, _resourceSchema } from "../helpers.mjs";

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
}
