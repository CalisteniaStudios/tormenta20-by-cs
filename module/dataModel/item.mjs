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
				mpMultiplier: new fields.BooleanField({ required:true, initial:false }),
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
			size: new fields.StringField({ required: true, nullable:false, initial: 'normal' }),
			melhorias: new fields.ObjectField({
				accurate: new fields.BooleanField({required: true, initial:false}),
				pungent: new fields.BooleanField({required: true, initial:false}),
				cruel: new fields.BooleanField({required: true, initial:false}),
				atrocious: new fields.BooleanField({required: true, initial:false}),
				balanced: new fields.BooleanField({required: true, initial:false}),
				harmonized: new fields.BooleanField({required: true, initial:false}),
				injection: new fields.BooleanField({required: true, initial:false}),
				massive: new fields.BooleanField({required: true, initial:false}),
				specialmaterial: new fields.BooleanField({required: true, initial:false}),
				scope: new fields.BooleanField({required: true, initial:false}),
				precise: new fields.BooleanField({required: true, initial:false}),
				golden: new fields.BooleanField({required: true, initial:false}),
				gems: new fields.BooleanField({required: true, initial:false}),
				discreet: new fields.BooleanField({required: true, initial:false}),
				macabre: new fields.BooleanField({required: true, initial:false}),
			}),
			encantos: new fields.ObjectField({
				keen: new fields.BooleanField({required: true, initial:false}),
				bane: new fields.BooleanField({required: true, initial:false}),
				throwable: new fields.BooleanField({required: true, initial:false}),
				assassin: new fields.BooleanField({required: true, initial:false}),
				seeking: new fields.BooleanField({required: true, initial:false}),
				frost: new fields.BooleanField({required: true, initial:false}),
				caster: new fields.BooleanField({required: true, initial:false}),
				corrosive: new fields.BooleanField({required: true, initial:false}),
				dancing: new fields.BooleanField({required: true, initial:false}),
				defending: new fields.BooleanField({required: true, initial:false}),
				destructive: new fields.BooleanField({required: true, initial:false}),
				lacerating: new fields.BooleanField({required: true, initial:false}),
				draining: new fields.BooleanField({required: true, initial:false}),
				shock: new fields.BooleanField({required: true, initial:false}),
				energy: new fields.BooleanField({required: true, initial:false}),
				excruciating: new fields.BooleanField({required: true, initial:false}),
				flaming: new fields.BooleanField({required: true, initial:false}),
				formidable: new fields.BooleanField({required: true, initial:false}),
				lancinating: new fields.BooleanField({required: true, initial:false}),
				magnificent: new fields.BooleanField({required: true, initial:false}),
				merciful: new fields.BooleanField({required: true, initial:false}),
				unholy: new fields.BooleanField({required: true, initial:false}),
				holy: new fields.BooleanField({required: true, initial:false}),
				bloodthirsty: new fields.BooleanField({required: true, initial:false}),
				thundering: new fields.BooleanField({required: true, initial:false}),
				sepulchral: new fields.BooleanField({required: true, initial:false}),
				speed: new fields.BooleanField({required: true, initial:false}),
				poisonous: new fields.BooleanField({required: true, initial:false}),
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
		if( data.encantos.lancinante ){
			data.encantos.lancinating = Boolean(data.encantos.lancinante);
			delete data.encantos.lancinante;
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
			melhorias: new fields.ObjectField(),
			encantos: new fields.ObjectField(),
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
			}),
			melhorias: new fields.ObjectField(),
			encantos: new fields.ObjectField(),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !isFinite(data.duracao.value) || data.duracao.value == null ){
			data.duracao.value = 0;
		}
		return super.migrateData(data);
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