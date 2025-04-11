import Tormenta20ItemData from "../item.mjs";

const fields = foundry.data.fields;


/* ITEM TYPES */
export default class WeaponData extends Tormenta20ItemData {
	/** @override */
	static defineSchema() {
		let type = 'arma';
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaUpgrades(type),
			...this.schemaRolls(type),
			ataques: new fields.NumberField({initial:0, label:"T20.ItemAttackQuantity", hint:"T20.ItemAttackQuantityHint"}),
			equipado: new fields.NumberField({ required: true, nullable:false, initial: 0, min:0, max:2, label:"T20.ItemEquipped", hint:"T20.ItemEquippedHint" }),
			equipado2: new fields.SchemaField({
				slot: new fields.NumberField({ required: true, nullable:false, initial: 0, label:"T20.ItemSlot", hint:"T20.ItemSlotHint" }),
				type: new fields.StringField({ required: true, blank:true, initial: '', choices: ['hand','body','both'], label:"T20.ItemSlotType", hint:"T20.ItemSlotTypeHint" })
			}),
			tipoUso: new fields.StringField({initial: 'sim' }),
			proficiencia: new fields.StringField({ required: true, nullable:false, blank:true, choices:Object.keys(T20.weaponTypes), initial: '', label:"T20.ItemWeaponProficiency", hint:"T20.ItemWeaponProficiencyHint" }),
			proposito: new fields.StringField({ required: true, nullable:false, blank:true, choices:Object.keys(T20.weaponPurposeTypes), initial: '', label:"T20.ItemWeaponPurpose", hint:"T20.ItemWeaponPurposeHint" }),
			empunhadura: new fields.StringField({ required: true, nullable:false, blank:true, choices:Object.keys(T20.weaponWieldingTypes), initial: '', label:"T20.ItemWeaponWielding", hint:"T20.ItemWeaponWieldingHint" }),
			criticoM: new fields.NumberField({ required:true, nullable:false, initial:20, label:"T20.ItemWeaponCriticalRange", hint:"T20.ItemWeaponCriticalRangeHint" }),
			criticoX: new fields.NumberField({ required:true, nullable:false, initial:2, label:"T20.ItemWeaponCriticalMultiplier", hint:"T20.ItemWeaponCriticalMultiplierHint" }),
			propriedades: new fields.ObjectField(),
			size: new fields.StringField({ required: true, nullable:false, initial: 'normal', label:"T20.ItemWeaponSize", hint:"T20.ItemWeaponSizeHint" }),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( typeof data.equipado === 'boolean' ){
			data.equipado = data.equipado ? 1 : 0;
		}
		if( !data.proficiencia && foundry.utils.hasProperty(data, 'tipoUso') && data.tipoUso ){
			let proficiencia = {
				sim: "simples",
				mar: "marcial",
				exo: "exotica",
				fog: "fogo",
				nat: "natural",
				imp: "improvisada",
			}
			data.proficiencia = proficiencia[data.tipoUso];
			data.tipoUso = null;
		}

		if ( !data.proposito && foundry.utils.hasProperty(data.propriedades, 'arr') && foundry.utils.hasProperty(data.propriedades, 'mun') && foundry.utils.hasProperty(data.propriedades, 'dst') ){
			let proposito = data.propriedades.arr ? 'arremesso' : (data.propriedades.mun ? 'disparo' : (data.propriedades.dst ? 'disparo' : 'corpo-a-corpo' ) );
			data.proposito = proposito;
			delete data.propriedades.arr;
			delete data.propriedades.mun;
			delete data.propriedades.dst;
		}
		if( !data.empunhadura && foundry.utils.hasProperty(data.propriedades, 'lev') && foundry.utils.hasProperty(data.propriedades, 'dms') ){
			let empunhadura = data.propriedades.lev ? 'leve' : (data.propriedades.dms ? 'duas' : 'uma' );
			data.empunhadura = empunhadura;
			delete data.propriedades.lev;
			delete data.propriedades.dms;
		}

		if ( !data.equipado2 ) {
			data.equipado2 = {};
			if ( data.empunhadura || ['escudo','esoterico','ferramenta'].includes(data.tipo) ){
				data.equipado2.type = 'hand';
			} else if ( ['leve','pesada','traje','acessorio'].includes(data.tipo) ){
				data.equipado2.type = 'body';
			} else if ( (['eng'].includes(data.tipo) && data.escola) ) {
				data.equipado2.type = 'both';
			}
			// data.equipado2.slot = data.equipado ?
		}
		return super.migrateData(data);
	}
}