import { T20, SYSTEMRULES } from '../config.js';
const fields = foundry.data.fields;

import {
	getObjectBaseData,
	getObjectItemData,
	getActivationItemData,
	getSaveItemData,
	RollData,
} from './helpers.js';

class systemItemWeaponData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			...getObjectItemData(),
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({ required:true }),
			}),
			consume: new fields.SchemaField({
				amount: new fields.NumberField({ required:true }),
				type: new fields.StringField({ required: true, nullable:false, initial: '' }),
				target: new fields.StringField({ required: true, nullable:false, initial: '' }),
			}),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			equipado: new fields.NumberField({ required: true, nullable:false, initial: 0, min:0, max:2 }),
			tipoUso: new fields.StringField({ required: true, nullable:false, initial: 'sim' }),
			alcance: new fields.StringField({ required: true, nullable:false, initial: '' }),
			criticoM: new fields.NumberField({ required:true, nullable:false, initial:20 }),
			criticoX: new fields.NumberField({ required:true, nullable:false, initial:2 }),
			propriedades: new fields.ObjectField(),
			encantos: new fields.ObjectField({
				lancinante: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( typeof data.equipado === 'boolean' ){
			data.equipado = data.equipado ? 1 : 0;
		}
		if( data.propriedades ){
			/* old >> new */
		}
		if( data.encantos ){
			/* old >> new */
		}
		return super.migrateData(data);
	}
}

class systemItemEquipmentData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			...getObjectItemData(),
			armadura: new fields.SchemaField({
				maxAtr: new fields.NumberField({ required:true, nullable:false, initial:0 }),
				penalidade: new fields.NumberField({ required:true, nullable:false, initial:0 }),
				value: new fields.NumberField({ required:true, nullable:false, initial:0 }),
			}),
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({ required:true }),
			}),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			equipado: new fields.BooleanField({ required: true, nullable:false, initial: false}),
			tipo: new fields.StringField({ required: true, nullable:false, initial: 'leve' }),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		
		return super.migrateData(data);
	}
}


class systemItemConsumableData extends foundry.abstract.DataModel {
	
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			...getObjectItemData(),
			...getActivationItemData(),
			...getSaveItemData(),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			uses: new fields.SchemaField({
				autoDestroy: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			})
		}
	}
}

class systemItemLootData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			...getObjectItemData(),
			container: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
		}
	}
}

class systemItemClassData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			niveis: new fields.NumberField({ required: true , initial:1 }),
			pvPorNivel: new fields.NumberField({ required: true , initial:1 }),
			pmPorNivel: new fields.NumberField({ required: true , initial:1 }),
			inicial: new fields.BooleanField({ required: true, nullable:false, initial: false }),
			pericias: new fields.SchemaField({
				numero: new fields.NumberField({ required:true , initial:1 }),
				inatas: new fields.StringField({ required: true, nullable:false, initial: '' }),
				escolhas: new fields.ObjectField(),
				value: new fields.ArrayField(new fields.StringField()),
			}),
			// progression: new fields.ObjectField(),
		}
	}
}

class systemItemSpellData extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			...getObjectBaseData(),
			...getActivationItemData(),
			...getSaveItemData(),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			circulo: new fields.StringField({ required: true, nullable:false, initial: '1' }),
			escola: new fields.StringField({ required: true, nullable:false, initial: '' }),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			preparada: new fields.BooleanField({ required: true, nullable:false, initial: false }),
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

class systemItemPowerData extends foundry.abstract.DataModel {
	/* @override */
	static defineSchema() {

		return {
			...getObjectBaseData(),
			...getActivationItemData(),
			...getSaveItemData(),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '' }),
			// progression: new fields.ObjectField(),
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




export {
	systemItemWeaponData,
	systemItemEquipmentData,
	systemItemConsumableData,
	systemItemLootData,
	systemItemClassData,
	systemItemSpellData,
	systemItemPowerData,
}