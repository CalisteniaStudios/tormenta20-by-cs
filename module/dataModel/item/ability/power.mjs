import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;

export default class PowerData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = 'poder';
		return {
			...super.defineSchema(),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaRolls(),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemType", hint:"T20.ItemTypeHint" }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSubType", hint:"T20.ItemSubTypeHint" }),
		}
	}


	/** @inheritdoc */
	static migrateData(data) {
		if ( isNaN(data.duracao.value) || !isFinite(data.duracao.value) ){
			data.duracao.value = 0;
		}
		return super.migrateData(data);
	}
}
