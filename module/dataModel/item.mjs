import { T20, SYSTEMRULES } from '../config.mjs';
const fields = foundry.data.fields;

import {
	getObjectBaseData,
	getObjectItemData,
	getActivationItemData,
	getSaveItemData,
	RollData,
} from './helpers.mjs';

/* Item Base */

class systemItemBaseData extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			description: new fields.SchemaField({
				value: new fields.HTMLField({ required: true, nullable:false, initial:'', label:"T20.ItemDescription", hint:"T20.ItemDescriptionHint" }),
				unidentified: new fields.HTMLField({ initial:'', label:"T20.ItemUnidentifiedDescription", hint:"T20.ItemUnidentifiedDescriptionHint" }),
			}),
			source: new fields.StringField({ initial: '', label:"T20.ItemSourceReference", hint:"T20.ItemSourceReferenceHint" }),
			origin: new fields.StringField({ initial: '', label:"T20.ItemOrigin", hint:"T20.ItemOriginHint" }),
			tags: new fields.ArrayField(new fields.StringField(), {label:"T20.ItemTagsList", hint:"T20.ItemTagsListHint" }),
			chatFlavor: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemChatFlavor", hint:"T20.ItemChatFlavorHint" }),
			chatGif: new fields.StringField({ initial: '', label:"T20.ItemChatGif", hint:"T20.ItemChatGifHint" }),
			rolls: new fields.ArrayField( new fields.EmbeddedDataField(RollData) ),
		}
	}

	/* ITEM SCHEMAS */
	static schemaPhysicalItem(type="arma"){
		let schema = {
			carregado: new fields.BooleanField({ required: true, nullable:false, initial: true, label:"T20.ItemCarrying", hint:"T20.ItemCarryingHint"}),
			espacos: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label:"T20.ItemSlot", hint:"T20.ItemSlotsHint"}),
			peso: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label:"T20.ItemWeight", hint:"T20.ItemWeightHint"}),
			qtd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label:"T20.ItemQuantity", hint:"T20.ItemQuantityHint"}),
			preco: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label:"T20.ItemPrice", hint:"T20.ItemPriceHint"}),
			pv: new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true, label:"T20.ItemHitPoints", hint:"T20.ItemHitPointsHint" }),
				min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true, label:"T20.ItemHitPointsMin", hint:"T20.ItemHitPointsMinHint" }),
				max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true, label:"T20.ItemHitPointsMax", hint:"T20.ItemHitPointsMaxHint" }),
			}),
			rd: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label:"T20.ItemDamageReduction", hint:"T20.ItemDamageReductionHint" }),
		}

		if( type == 'arma' ) {
		}
		return schema;
	}

	static schemaActivation(type="arma"){
		let schema = {
			// ativacao
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({  required:true, initial:0, label:"T20.ItemActivationCost", hint:"T20.ItemActivationCostHint" }),
				condicao: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemActivationCondition", hint:"T20.ItemActivationConditionHint" }),
				execucao: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemActivationAction", hint:"T20.ItemActivationActionHint" }),
				qtd: new fields.StringField({ initial: '', label:"T20.ItemActivationActionQuantity", hint:"T20.ItemActivationActionQuantityHint" }),
				special: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemActivationSpecial", hint:"T20.ItemActivationSpecialHint" }),
			}),
			// consume 
			consume: new fields.SchemaField({
				amount: new fields.NumberField({ initial:0, label:"T20.ItemConsuptionQuantity", hint:"T20.ItemConsuptionQuantityHint" }),
				mpMultiplier: new fields.BooleanField({ required:true, initial:false, label:"T20.ItemConsuptionMultiplier", hint:"T20.ItemConsuptionMultiplierHint" }),
				target: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemConsuptionTarget", hint:"T20.ItemConsuptionTargetHint" }),
				type: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemConsuptionType", hint:"T20.ItemConsuptionTypeHint" }),
			}),
			// duracao 
			duracao: new fields.SchemaField({
				units: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemDurationUnit", hint:"T20.ItemDurationUnitHint" }),
				value: new fields.NumberField({ required: true, nullable:false, initial:0, label:"T20.ItemDurationValue", hint:"T20.ItemDurationValueHint" }),
				special: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemDurationSpecial", hint:"T20.ItemDurationSpecialHint" }),
			}),
			// range 
			range: new fields.SchemaField({
				units: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemRangeUnits", hint:"T20.ItemRangeUnitsHint" }),
				value: new fields.NumberField({ initial:0, label:"T20.ItemRangeValue", hint:"T20.ItemRangeValueHint" }),
			}),
			// target
			target: new fields.SchemaField({
				type: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemTargetType", hint:"T20.ItemTargetTypeHint" }),
				value: new fields.NumberField({ initial:0, label:"T20.ItemTargeValue", hint:"T20.ItemTargeValueHint" }),
				width: new fields.NumberField({ initial:0, label:"T20.ItemTargeWidth", hint:"T20.ItemTargeWidthHint" }),
			}),
			
			alcance: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemRangeDescription", hint:"T20.ItemRangeDescriptionHint" }),
			alvo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemTargetDescription", hint:"T20.ItemTargetDescriptionHint" }),
			area: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemAreaOfEffectDescription", hint:"T20.ItemAreaOfEffectDescriptionHint" }),
			efeito: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemEffectDescription", hint:"T20.ItemEffectDescriptionHint" }),
		}

		if( type == 'arma' ) {
			delete schema.duracao;
			delete schema.range;
			delete schema.target;
			delete schema.alvo;
			delete schema.area;
			delete schema.efeito;
			delete schema.ativacao.condicao;
			delete schema.ativacao.execucao;
			delete schema.ativacao.qtd;
			delete schema.ativacao.special;
		} else if( type == 'equipamento' ) {
			delete schema.duracao;
			delete schema.range;
			delete schema.target;
			delete schema.alvo;
			delete schema.area;
			delete schema.alcance;
			delete schema.efeito;
			delete schema.consume;
			delete schema.ativacao.condicao;
			delete schema.ativacao.execucao;
			delete schema.ativacao.qtd;
			delete schema.ativacao.special;
		}
		return schema;
	}

	static schemaSavingThrow(type="arma"){
		let schema = {
			resistencia: new fields.SchemaField({
				txt: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSavingThrowDescription", hint:"T20.ItemSavingThrowDescriptionHint" }),
				pericia: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSavingThrowSkill", hint:"T20.ItemSavingThrowSkillHint" }),
				atributo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSavingThrowDCAbility", hint:"T20.ItemSavingThrowDCAbilityHint" }),
				bonus: new fields.NumberField({ required: true, initial:0, label:"T20.ItemSavingThrowDCBonus", hint:"T20.ItemSavingThrowDCBonusHint" }),
			})
		}

		if( type == 'arma' ) {
		}
		return schema;
	}

	static schemaUpgrades(type="arma"){
		let schema = {
			upgrades: new fields.SchemaField({
				melhoria1: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemSuperiorUpgrades", hint:"T20.ItemSuperiorUpgradesHint" }),
				melhoria2: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemSuperiorUpgrades", hint:"T20.ItemSuperiorUpgradesHint" }),
				melhoria3: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemSuperiorUpgrades", hint:"T20.ItemSuperiorUpgradesHint" }),
				melhoria4: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemSuperiorUpgrades", hint:"T20.ItemSuperiorUpgradesHint" }),
				material: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemSpecialMaterial", hint:"T20.ItemSpecialMaterialHint" }),
				encanto1: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemEnchantmentUpgrade", hint:"T20.ItemEnchantmentUpgradeHint" }),
				encanto2: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemEnchantmentUpgrade", hint:"T20.ItemEnchantmentUpgradeHint" }),
				encanto3: new fields.StringField({ required: true, blank:true, initial: '', label:"T20.ItemEnchantmentUpgrade", hint:"T20.ItemEnchantmentUpgradeHint" }),
			}),
		}

		if( type == 'arma' ) {
		}
		return schema;
	}
}


/* ITEM TYPES */
class systemItemWeaponData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'arma';
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaUpgrades(type),
			equipado: new fields.NumberField({ required: true, nullable:false, initial: 0, min:0, max:2, label:"T20.ItemEquipped", hint:"T20.ItemEquippedHint" }),
			proficiencia: new fields.StringField({ required: true, nullable:false, choices:Object.keys(T20.weaponTypes), initial: 'simples', label:"T20.ItemWeaponProficiency", hint:"T20.ItemWeaponProficiencyHint" }),
			proposito: new fields.StringField({ required: true, nullable:false, choices:Object.keys(T20.weaponPurposeTypes), initial: 'cac', label:"T20.ItemWeaponPurpose", hint:"T20.ItemWeaponPurposeHint" }),
			empunhadura: new fields.StringField({ required: true, nullable:false, choices:Object.keys(T20.weaponWieldingTypes), initial: 'leve', label:"T20.ItemWeaponWielding", hint:"T20.ItemWeaponWieldingHint" }),
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
		if( hasProperty(data, 'tipoUso') ){
			let proficiencia = {
				sim: "simples",
				mar: "marcial",
				exo: "exotica",
				fog: "fogo",
				nat: "natural",
				imp: "improvisada",
			}
			data.proficiencia = proficiencia[data.tipoUso];
			delete data.tipoUso;
		}

		if ( hasProperty(data.propriedades, 'arr') && hasProperty(data.propriedades, 'mun') && hasProperty(data.propriedades, 'dst') ){
			let proposito = data.propriedades.arr ? 'arremesso' : (data.propriedades.mun ? 'disparo' : (data.propriedades.dst ? 'disparo' : 'corpo-a-corpo' ) );
			data.proposito = proposito;
			delete data.propriedades.arr;
			delete data.propriedades.mun;
			delete data.propriedades.dst;
		}
		if( hasProperty(data.propriedades, 'lev') && hasProperty(data.propriedades, 'dms') ){
			let empunhadura = data.propriedades.lev ? 'leve' : (data.propriedades.dms ? 'duas' : 'uma' );
			data.empunhadura = empunhadura;
			delete data.propriedades.lev;
			delete data.propriedades.dms;
		}

		if( data.melhorias ){
			/* old >> new */
			let i = 1;
			for (let [key, value] of Object.entries(data.melhorias)) {
				if ( i > 4 ) break;
				if ( value ) {
					data.upgrades[`melhoria${i}`] = key;
					i++;
				}
			}
			delete data.melhorias;
		}
		
		if(hasProperty(data.encantos, 'lancinante') ){
			data.encantos.lancinating = Boolean(data.encantos.lancinante);
			delete data.encantos.lancinante;
		}
		
		if( data.encantos ){
			let i = 1;
			for (let [key, value] of Object.entries(data.encantos)) {
				if ( i > 3 ) break;
				if ( value ) {
					data.upgrades[`encanto${i}`] = key;
					i++;
				}
			}
			delete data.encantos;
		}

		return super.migrateData(data);
	}
}


class systemItemEquipmentData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'equipamento';
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaUpgrades(type),
			equipado: new fields.BooleanField({ required: true, nullable:false, initial: false, label:"T20.ItemEquipped", hint:"T20.ItemEquippedHint"}),
			armadura: new fields.SchemaField({
				maxAtr: new fields.NumberField({ required:true, nullable:false, initial:0, label:"T20.ItemEquipmentDefenseMaxAbility", hint:"T20.ItemEquipmentDefenseMaxAbilityHint" }),
				penalidade: new fields.NumberField({ required:true, nullable:false, initial:0, label:"T20.ItemEquipmentArmorPenalty", hint:"T20.ItemEquipmentArmorPenaltyHint" }),
				value: new fields.NumberField({ required:true, nullable:false, initial:0, label:"T20.ItemEquipmentDefenseValue", hint:"T20.ItemEquipmentDefenseValueHint" }),
			}),
			tipo: new fields.StringField({ required: true, nullable:false, initial:'leve', label:"T20.ItemType", hint:"T20.ItemTypeHint" }),
		}
	}
	
	/** @inheritdoc */
	static migrateData(data) {
		if( data.melhorias ){
			/* old >> new */
			let i = 1;
			for (let [key, value] of Object.entries(data.melhorias)) {
				if ( i > 4 ) break;
				if ( value ) {
					data.upgrades[`melhoria${i}`] = key;
					i++;
				}
			}
		}
		
		if( data.encantos ){
			/* old >> new */
			let i = 1;
			for (let [key, value] of Object.entries(data.encantos)) {
				if ( i > 3 ) break;
				if ( value ) {
					data.upgrades[`encanto${i}`] = key;
					i++;
				}
			}
		}
		return super.migrateData(data);
	}
}

class systemItemConsumableData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'consumivel';
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaUpgrades(type),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemType", hint:"T20.ItemTypeHint" }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSubType", hint:"T20.ItemSubTypeHint" }),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !isFinite(data.duracao.value) || data.duracao.value == null ){
			data.duracao.value = 0;
		}

		if( data.melhorias ){
			/* old >> new */
			let i = 1;
			for (let [key, value] of Object.entries(data.melhorias)) {
				if ( i > 4 ) break;
				if ( value ) {
					data.upgrades[`melhoria${i}`] = key;
					i++;
				}
			}
		}
		
		if( data.encantos ){
			/* old >> new */
			let i = 1;
			for (let [key, value] of Object.entries(data.encantos)) {
				if ( i > 3 ) break;
				if ( value ) {
					data.upgrades[`encanto${i}`] = key;
					i++;
				}
			}
		}
		return super.migrateData(data);
	}
}

class systemItemLootData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'tesouro';
		return {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			container: new fields.BooleanField({ required: true, nullable:false, initial: false, label:"T20.ItemIsContainer", hint:"T20.ItemIsContainerHint" }),
		}
	}
}

// , label:"T20.Value", hint:"T20.Hint"
class systemItemClassData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'classe';
		return {
			...super.defineSchema(),
			niveis: new fields.NumberField({ required: true , initial:1, label:"T20.ItemClassLevels", hint:"T20.ItemClassLevelsHint" }),
			pvPorNivel: new fields.NumberField({ required: true , initial:1, label:"T20.ItemClassHPLevel", hint:"T20.ItemClassHPLevelHint" }),
			pmPorNivel: new fields.NumberField({ required: true , initial:1, label:"T20.ItemClassMPLevel", hint:"T20.ItemClassMPLevelHint" }),
			inicial: new fields.BooleanField({ required: true, nullable:false, initial: false, label:"T20.ItemClassIsInitial", hint:"T20.ItemClassIsInitialHint" }),
		}
	}
}

class systemItemSpellData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'magia';
		return {
			...super.defineSchema(),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			circulo: new fields.StringField({ required: true, nullable:false, initial: '1', label:"T20.ItemSpellCircle", hint:"T20.ItemSpellCircleHint" }),
			escola: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSpellSchool", hint:"T20.ItemSpellSchoolHint" }),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemType", hint:"T20.ItemTypeHint" }),
			preparada: new fields.BooleanField({ required: true, nullable:false, initial: false, label:"T20.ItemSpellPrepared", hint:"T20.ItemSpellPreparedHint" }),
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

class systemItemPowerData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'poder';
		return {
			...super.defineSchema(),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
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

/* ITEM TYPES OLD */
class systemItemWeaponData2 extends foundry.abstract.DataModel {
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
			proficiencia: new fields.StringField({ required: true, nullable:false, initial: 'simples' }),
			proposito: new fields.StringField({ required: true, nullable:false, initial: 'corpo' }),
			empunhadura: new fields.StringField({ required: true, nullable:false, initial: 'leve' }),
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

class systemItemEquipmentData2 extends foundry.abstract.DataModel {
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


class systemItemConsumableData2 extends foundry.abstract.DataModel {
	
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

class systemItemLootData2 extends foundry.abstract.DataModel {
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

class systemItemClassData2 extends foundry.abstract.DataModel {
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

class systemItemSpellData11 extends foundry.abstract.DataModel {
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

class systemItemPowerData11 extends foundry.abstract.DataModel {
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