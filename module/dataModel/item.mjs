// import { T20, SYSTEMRULES } from '../config.mjs';
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
				value: new fields.HTMLField({ required: true, nullable:false, initial:'', label:"T20.ItemDescription", hint:"T20.ItemDescriptionHint"}),
				unidentified: new fields.HTMLField({ initial:'', label:"T20.ItemUnidentifiedDescription", hint:"T20.ItemUnidentifiedDescriptionHint" }),
			}),
			source: new fields.StringField({ initial: '', label:"T20.ItemSourceReference", hint:"T20.ItemSourceReferenceHint" }),
			origin: new fields.StringField({ initial: '', label:"T20.ItemOrigin", hint:"T20.ItemOriginHint" }),
			tags: new fields.ArrayField(new fields.StringField(), {label:"T20.ItemTagsList", hint:"T20.ItemTagsListHint" }),
			rolltags: new fields.ArrayField(new fields.StringField(), {label:"T20.ItemTagsList", hint:"T20.ItemTagsListHint" }),
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
			melhorias: new fields.ObjectField(),
			encantos: new fields.ObjectField(),
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
			equipado2: new fields.SchemaField({
				slot: new fields.NumberField({ required: true, nullable:false, initial: 0, label:"T20.ItemSlot", hint:"T20.ItemSlotHint" }),
				type: new fields.StringField({ required: true, blank:true, initial: '', choices: ['hand','body','both'], label:"T20.ItemSlotType", hint:"T20.ItemSlotTypeHint" })
			}),
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

class systemItemConsumableData extends systemItemBaseData {
	/** @override */
	static defineSchema() {
		let type = 'consumivel';
		let schema = {
			...super.defineSchema(),
			...this.schemaPhysicalItem(type),
			...this.schemaActivation(type),
			...this.schemaSavingThrow(type),
			...this.schemaUpgrades(type),
			tipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemType", hint:"T20.ItemTypeHint" }),
			subtipo: new fields.StringField({ required: true, nullable:false, initial: '', label:"T20.ItemSubType", hint:"T20.ItemSubTypeHint" }),
		}

		return schema;
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !isFinite(data.duracao.value) || data.duracao.value == null ){
			data.duracao.value = 0;
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
			equipado2: new fields.SchemaField({
				slot: new fields.NumberField({ required: true, nullable:false, initial: 0, label:"T20.ItemSlot", hint:"T20.ItemSlotHint" }),
				type: new fields.StringField({ required: true, blank:true, initial: '', choices: ['hand','body','both'], label:"T20.ItemSlotType", hint:"T20.ItemSlotTypeHint" })
			}),
		}
	}
	
	/** @inheritdoc */
	static migrateData(data) {
		if ( data.duracao && (isNaN(data.duracao?.value) || !isFinite(data.duracao?.value)) ){
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


export {
	systemItemWeaponData,
	systemItemEquipmentData,
	systemItemConsumableData,
	systemItemLootData,
	systemItemClassData,
	systemItemSpellData,
	systemItemPowerData,
}