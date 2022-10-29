import { T20, SYSTEMRULES } from '../config.mjs';
const fields = foundry.data.fields;

import {
	ActorSkillsField,
	SkillData,
  AbilitiesSchema,
	ResistanceSchema,
	_resourceSchema
} from './helpers.mjs';

/** @TODO */
/** Find a way to deal with the following:
 * BaseActor level SchemaField {value: #NUM}
 * Chacrater level SchemaField {value: #NUM, xp: {value: #, next: #, pct: #}}
 * NPC level SchemaField {value: #NUM, cr: #,  xp: {value: #}}
 */
/* **/
class systemActorBaseData extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			atributos: this.schemaAbilities(),
			attributes: this.schemaAttributes(),
			detalhes: this.schemaDetails(),
			dinheiro: this.schemaCurrency(),
			modificadores: this.schemaModifiers(),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			resources: new fields.ObjectField(), //this.schemaResources(),
			tracos: this.schemaTraits(),
		}
	}

	/* ACTOR SCHEMAS */
	static schemaAbilities(type="character"){
		let getSchema = () => {
			return new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable:false, initial:0, min:-5, label: "T20.AbilityValue", hint: "T20.AbilityValueHint"}),
				base: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.AbilityBaseValue", hint: "T20.AbilityBaseValueHint"}),
				racial: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.AbilityRacialValue", hint: "T20.AbilityRacialValueHint"}),
				bonus: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.AbilityBonusValue", hint: "T20.AbilityBonusValueHint"}),
			});
		}
		
		let schema = {};
		Object.keys(T20.atributos).forEach( abl => schema[abl] = getSchema());
		return new fields.SchemaField(schema);
		return schema;
	}

	static schemaDefense(type="character"){
		let schema = {
			atributo: new fields.StringField({required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des', label: "T20.DefenseAbilityBonus", hint: "T20.DefenseAbilityBonusHint"}),
			pda: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.DefenseArmorPenalty", hint: "T20.DefenseArmorPenaltyHint" }),
			value: new fields.NumberField({ required: true, nullable:false, initial:10, label: "T20.DefenseValue", hint: "T20.DefenseValueHint" }),
			base: new fields.NumberField({ required: true, nullable:false, initial:10, label: "T20.DefenseBaseValue", hint: "T20.DefenseBaseValueHint" }),
			outros: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.DefenseOtherValue", hint: "T20.DefenseOtherValueHint" }),
			condi: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.DefenseStatusEffectsValue", hint: "T20.DefenseStatusEffectsValueHint" }),
			bonus: new fields.ArrayField(new fields.StringField(), {label: "T20.DefenseEffectValues", hint: "T20.DefenseEffectValuesHint"}),
		};
		if ( type == 'npc' ) {

		} else if ( type == 'simple' ) {
			delete schema.atributo;
			delete schema.pda.atributo;
			delete schema.base.atributo;
			delete schema.outros.atributo;
			delete schema.condi.atributo;
		}
		return new fields.SchemaField(schema);
	}

	static schemaEncumbrance(type="character"){
		return new fields.SchemaField({
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.EncumbranceValue", hint: "T20.EncumbranceValueHint" }),
			base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0, label: "T20.EncumbranceBase", hint: "T20.EncumbranceBaseHint" }),
			bonus: new fields.ArrayField(new fields.StringField(), {label: "T20.EncumbranceEffectsValues", hint: "T20.EncumbranceEffectsValuesHint"}),
			max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.EncumbranceMax", hint: "T20.EncumbranceMaxHint" }),
			pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.EncumbrancePercentage", hint: "T20.EncumbrancePercentageHint" }),
			encumbered: new fields.BooleanField({ initial: false, label: "T20.EncumbranceStatus", hint: "T20.EncumbranceStatusHint" }),
		});
	}
	
	static schemaLevel(type="character"){
		let schema = {
			value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, max:20, label: "T20.LevelValue", hint: "T20.LevelValueHint" }),
			xp: new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true, label: "T20.ExperienceValue", hint: "T20.ExperienceValueHint" }),
				pct: new fields.NumberField({ initial:0, integer:true, max:100, label: "T20.ExperiencePercentege", hint: "T20.ExperiencePercentegeHint" }),
				proximo: new fields.NumberField({ initial:0, integer:true, label: "T20.ExperienceToNextLevel", hint: "T20.ExperienceToNextLevelHint" }),
			}),
		}
		if ( type == 'npc' ){
			delete schema.pct;
			delete schema.proximo;
		} else if ( type == 'simple' ){

		}
		return new fields.SchemaField(schema);
	}

	static schemaMovement(type="character"){
		return new fields.SchemaField({
			burrow: new fields.NumberField({ initial:0, min:0, integer:true, label: "T20.MovementBurrowValue", hint: "T20.MovementBurrowValueHint" }),
			climb: new fields.NumberField({ initial:0, min:0, integer:true, label: "T20.MovementClimbValue", hint: "T20.MovementClimbValueHint" }),
			fly: new fields.NumberField({ initial:0, min:0, integer:true, label: "T20.MovementFlyValue", hint: "T20.MovementFlyValueHint" }),
			swim: new fields.NumberField({ initial:0, min:0, integer:true, label: "T20.MovementSwimValue", hint: "T20.MovementSwimValueHint" }),
			walk: new fields.NumberField({ initial:9, min:0, integer:true, label: "T20.MovementWalkValue", hint: "T20.MovementWalkValueHint" }),
			hover: new fields.BooleanField({ initial: false, label: "T20.MovementHoverStatus", hint: "T20.MovementHoverStatusHint" }),
			unit: new fields.StringField({ initial: 'm', label: "T20.MovementUnitType", hint: "T20.MovementUnitTypeHint" }),
		});
	}
	
	static schemaSenses(type="character"){
		return new fields.SchemaField({
			value: new fields.ArrayField(new fields.StringField(), {label: "T20.SensesList", hint: "T20.SensesListHint"}),
			custom: new fields.StringField({label: "T20.SensesCustom", hint: "T20.SensesCustomHint"}),
		});
	}
	
	// label: "T20.Value", hint: "T20.Hint"
	static schemaResources(type="character"){
		return new fields.SchemaField({
			value: new fields.NumberField({ required: true, nullable:false, initial:0, step:1, integer:true, label: "T20.ResourceValue", hint: "T20.ResourceValueHint" }),
			temp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, step:1, integer:true, label: "T20.ResourceTemporaryValue", hint: "T20.ResourceTemporaryHint" }),
			min: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true, label: "T20.ResourceMinValue", hint: "T20.ResourceMinValueHint" }),
			max: new fields.NumberField({ required: true, nullable:false, initial:3, integer:true, label: "T20.ResourceMaxValue", hint: "T20.ResourceMaxValueHint" }),
		});
	}

	static schemaAttributes(type="character"){
		let schema = {
			carga: this.schemaEncumbrance(),
			cd: new fields.NumberField({ required: true, nullable:false, initial:10, label: "T20.AttributeDCValue", hint: "T20.AttributeDCValueHint" }),
			conjuracao: new fields.StringField({blank:true, choices: ['', ...Object.keys(T20.atributos)], initial: 'int', label: "T20.AttributeSpellcastingAbl", hint: "T20.AttributeSpellcastingAblHint" }),
			defesa: this.schemaDefense(),
			movement: this.schemaMovement(),
			nivel: this.schemaLevel(type),
			pv: this.schemaResources(),
			pm: this.schemaResources(),
			sentidos: this.schemaSenses(),
			treino: new fields.NumberField({ required: true, nullable:false, initial:0, label: "T20.AttributeTrainingValue", hint: "T20.AttributeTrainingValueHint" }),
		}
		if ( type == 'npc' ){
			schema["nd"] = new fields.StringField({ required:true, initial: '1', label: "T20.FoeCRValue", hint: "T20.FoeCRValueHint" });
		} else if ( type == 'simple' ){
			delete schema.cd;
			delete schema.conjuracao;
			delete schema.nivel;
			delete schema.treino;
		}
		
		return new fields.SchemaField(schema);
	}

	static schemaCurrency(type="character"){
		return new fields.SchemaField({
			tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.CurrencyCopperValue", hint: "T20.CurrencyCopperValueHint" }),
			tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.CurrencyPlatinumValue", hint: "T20.CurrencyPlatinumValueHint" }),
			to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.CurrencyGoldValue", hint: "T20.CurrencyGoldValueHint" }),
			tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.CurrencySilverValue", hint: "T20.CurrencySilverValueHint" }),
		});
	}
	
	static schemaDetails(type = 'character'){
		let schema = {
			origem: new fields.StringField({ initial: '', label: "T20.DetailsBackground", hint: "T20.DetailsBackgroundHint" }),
			info: new fields.StringField({ initial: '', label: "T20.DetailsNotes", hint: "T20.DetailsNotesHint" }),
			divindade: new fields.StringField({ initial: '', label: "T20.DetailsDeity", hint: "T20.DetailsDeityHint" }),
			raca: new fields.StringField({ initial: '', label: "T20.DetailsRace", hint: "T20.DetailsRaceHint" }),
			tipo: new fields.StringField({ required:true, choices: Object.keys(T20.creatureTypes), initial: 'hum', label: "T20.DetailsCreatureType", hint: "T20.DetailsCreatureTypeHint" }),
			biography: new fields.SchemaField({
				value: new fields.HTMLField({ required: true, nullable:false, initial:'', label: "T20.DetailsBiography", hint: "T20.DetailsBiographyHint" }),
				public: new fields.HTMLField({ initial:'', label: "T20.DetailsBiographyPublic", hint: "T20.DetailsBiographyPublicHint" }),
			}),
			diario: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
			diario1: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
			diario2: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
			diario3: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
			diario4: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
			diario5: new fields.SchemaField({
				name: new fields.StringField({ initial:'', label: "T20.DetailsJournalName", hint: "T20.DetailsJournalNameHint" }),
				value: new fields.HTMLField({ initial:'', label: "T20.DetailsJournal", hint: "T20.DetailsJournalHint" }),
			}),
		}
		
		if ( type == 'npc' ){
			schema["equipamento"] = new fields.StringField({ initial: '', label: "T20.FoeEquipment", hint: "T20.T20.FoeEquipmentHint" });
			schema["resistencias"] = new fields.StringField({ initial: '', label: "T20.FoeResistances", hint: "T20.T20.FoeResistancesHint" });
			schema["tesouro"] = new fields.StringField({ initial: '', label: "T20.FoeTreasure", hint: "T20.T20.FoeTreasureHint" });
			schema["role"] = new fields.StringField({ initial: '', label: "T20.FoeRole", hint: "T20.T20.FoeRoleHint" });
			delete schema.info;
			delete schema.diario;
			delete schema.diario1;
			delete schema.diario2;
			delete schema.diario3;
			delete schema.diario4;
			delete schema.diario5;
		} else if ( type == 'simple' ){
			delete schema.origem;
			delete schema.info;
			delete schema.divindade;
			delete schema.raca;
			delete schema.tipo;
			delete schema.diario;
			delete schema.diario1;
			delete schema.diario2;
			delete schema.diario3;
			delete schema.diario4;
			delete schema.diario5;
		}
		
		return new fields.SchemaField(schema);
	}

	static schemaModifiers(type="character"){
		return new fields.SchemaField({
			custoPM: new fields.StringField({label: "T20.ModsMPExtraValue", hint: "T20.ModsMPExtraValueHint"}),
			atributos: new fields.SchemaField({
				for: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityStrEffectsValues", hint: "T20.ModsAbilityStrEffectsValuesHint"}),
				des: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityDexEffectsValues", hint: "T20.ModsAbilityDexEffectsValuesHint"}),
				con: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityConEffectsValues", hint: "T20.ModsAbilityConEffectsValuesHint"}),
				int: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityIntEffectsValues", hint: "T20.ModsAbilityIntEffectsValuesHint"}),
				sab: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityWisEffectsValues", hint: "T20.ModsAbilityWisEffectsValuesHint"}),
				car: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityChaEffectsValues", hint: "T20.ModsAbilityChaEffectsValuesHint"}),
				fisicos: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityPhysicalEffectsValues", hint: "T20.ModsAbilityPhysicalEffectsValuesHint"}),
				mentais: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityMentalEffectsValues", hint: "T20.ModsAbilityMentalEffectsValuesHint"}),
				geral: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsAbilityGeneralEffectsValues", hint: "T20.ModsAbilityGeneralEffectsValuesHint"}),
			}),
			dano: new fields.SchemaField({
				ad: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsDamageRangedEffectsValues", hint: "T20.ModsDamageRangedEffectsValuesHint"}),
				alq: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsDamageAlchemyEffectsValues", hint: "T20.ModsDamageAlchemyEffectsValuesHint"}),
				cac: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsDamageMeleeEffectsValues", hint: "T20.ModsDamageMeleeEffectsValuesHint"}),
				geral: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsDamageGeneralEffectsValues", hint: "T20.ModsDamageGeneralEffectsValuesHint"}),
				mag: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsDamageSpellEffectsValues", hint: "T20.ModsDamageSpellEffectsValuesHint"}),
			}),
			pericias: new fields.SchemaField({
				geral: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsGeneralEffectsValues", hint: "T20.ModsSkillsGeneralEffectsValuesHint"}),
				resistencia: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsSavesEffectsValues", hint: "T20.ModsSkillsSavesEffectsValuesHint"}),
				semataque: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsNotAttackEffectsValues", hint: "T20.ModsSkillsNotAttackEffectsValuesHint"}),
				ataque: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsAttackEffectsValues", hint: "T20.ModsSkillsAttackEffectsValuesHint"}),
				atr: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsStrEffectsValues", hint: "T20.ModsSkillsStrEffectsValuesHint"}),
					des: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsDexEffectsValues", hint: "T20.ModsSkillsDexEffectsValuesHint"}),
					con: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsConEffectsValues", hint: "T20.ModsSkillsConEffectsValuesHint"}),
					int: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsIntEffectsValues", hint: "T20.ModsSkillsIntEffectsValuesHint"}),
					sab: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsWisEffectsValues", hint: "T20.ModsSkillsWisEffectsValuesHint"}),
					car: new fields.ArrayField(new fields.StringField(), {label: "T20.ModsSkillsChaEffectsValues", hint: "T20.ModsSkillsChaEffectsValuesHint"}),
				}),
			}),
		});
	}
	
	
	static schemaResistances(type="character"){
		let getSchema = () => {
			return new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, label: "T20.DamageReductionValue", hint: "T20.DamageReductionValueHint" }),
				imunidade: new fields.BooleanField({ required: true, nullable:false, initial: false, label: "T20.DamageReductionImunity", hint: "T20.DamageReductionImunityHint" }),
				vulnerabilidade: new fields.BooleanField({ required: true, nullable:false, initial: false, label: "T20.DamageReductionVulnerability", hint: "T20.DamageReductionVulnerabilityHint" }),
			});
		}
		
		let schema = {};
		Object.keys(T20.damageTypes).forEach( dmg => schema[dmg] = getSchema());
		return new fields.SchemaField(schema);
		return schema;
	}
	
	static schemaTraits(type="character"){
		let schema = {
			ic: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {label: "T20.TraitsConditionsImunitiesList", hint: "T20.TraitsConditionsImunitiesListHint"}),
				custom: new fields.StringField( {label: "T20.TraitsConditionsImunitiesCustom", hint: "T20.TraitsConditionsImunitiesCustomHint"}),
			}),
			idiomas: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {label: "T20.TraitsLangaguesProficienciesList", hint: "T20.TraitsLangaguesProficienciesListHint"}),
				custom: new fields.StringField({label: "T20.TraitsLangaguesProficienciesCustom", hint: "T20.TraitsLangaguesProficienciesCustomHint"}),
			}),
			profArmaduras: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {label: "T20.TraitsArmorProficienciesList", hint: "T20.TraitsArmorProficienciesListHint"}),
				custom: new fields.StringField({label: "T20.TraitsArmorProficienciesCustom", hint: "T20.TraitsArmorProficienciesCustomHint"}),
			}),
			profArmas: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {label: "T20.TraitsWeaponProficienciesList", hint: "T20.TraitsWeaponProficienciesListHint"}),
				custom: new fields.StringField({label: "T20.TraitsWeaponProficienciesCustom", hint: "T20.TraitsWeaponProficienciesCustomHint"}),
			}),
			resistencias: this.schemaResistances(),
			tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med', label: "T20.TraitActorSize", hint: "T20.TraitActorSizeHint" }),
		}
		if ( type !== 'character' ){
			delete schema.idiomas;
			delete schema.profArmaduras;
			delete schema.profArmas;
		} else if ( type == 'npc' ){
		} else if ( type == 'simple' ){
		}

		return new fields.SchemaField(schema);
	}
	
}

class systemActorCharacterData extends systemActorBaseData {
	/** @override */
	static defineSchema() {
		const type = 'character';
		return {
			atributos: this.schemaAbilities(type),
			attributes: this.schemaAttributes(type),
			detalhes: this.schemaDetails(type),
			dinheiro: this.schemaCurrency(type),
			modificadores: this.schemaModifiers(type),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}
		return super.migrateData(data);
	}
}

class systemActorNPCData extends systemActorBaseData {
	/** @override */
	static defineSchema() {
		const type = 'npc';
		return {
			atributos: this.schemaAbilities(type),
			attributes: this.schemaAttributes(type),
			detalhes: this.schemaDetails(type),
			dinheiro: this.schemaCurrency(type),
			modificadores: this.schemaModifiers(type),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type),
		}
	}
	
	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}

		if( data.detalhes.nd && data.detalhes.nd > data.attributes.nd ){
			data.attributes.nd = data.detalhes.nd;
		}
		
		if( isNaN(data.attributes.nivel.value) || !isFinite( data.attributes.nivel.value ) ){
			data.attributes.nivel.value = 1;
		}
		return super.migrateData(data);
	}
}

class systemActorSimpleData extends systemActorBaseData {
	/** @override */
	static defineSchema() {
		const type = 'simple';
		return {
			atributos: this.schemaAbilities(type),
			attributes: this.schemaAttributes(type),
			detalhes: this.schemaDetails(type),
			dinheiro: this.schemaCurrency(type),
			modificadores: this.schemaModifiers(type),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			resources: new fields.ObjectField(),
			tracos: this.schemaTraits(type),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		return super.migrateData(data);
	}
}

// Old lazy way
class systemActorCharacterDataLazy extends foundry.abstract.DataModel {
	
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField()),
					des: new fields.ArrayField(new fields.StringField()),
					con: new fields.ArrayField(new fields.StringField()),
					int: new fields.ArrayField(new fields.StringField()),
					sab: new fields.ArrayField(new fields.StringField()),
					car: new fields.ArrayField(new fields.StringField()),
					fisicos: new fields.ArrayField(new fields.StringField()),
					mentais: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
				}),
				dano: new fields.SchemaField({
					ad: new fields.ArrayField(new fields.StringField()),
					alq: new fields.ArrayField(new fields.StringField()),
					cac: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
					mag: new fields.ArrayField(new fields.StringField()),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.ArrayField(new fields.StringField()),
					resistencia: new fields.ArrayField(new fields.StringField()),
					semataque: new fields.ArrayField(new fields.StringField()),
					ataque: new fields.ArrayField(new fields.StringField()),
					atr: new fields.SchemaField({
						for: new fields.ArrayField(new fields.StringField()),
						des: new fields.ArrayField(new fields.StringField()),
						con: new fields.ArrayField(new fields.StringField()),
						int: new fields.ArrayField(new fields.StringField()),
						sab: new fields.ArrayField(new fields.StringField()),
						car: new fields.ArrayField(new fields.StringField()),
					}),
				}),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({blank:true, choices: ['', ...Object.keys(T20.atributos)], initial: 'int' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des'}),
					pda: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
				}),
				nivel: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0, max:20 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
						pct: new fields.NumberField({ initial:0, integer:true, max:100 }),
						proximo: new fields.NumberField({ initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					encumbered: new fields.BooleanField({ initial: false }),
				}),
				movement: new fields.SchemaField({
					burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
					climb: new fields.NumberField({ initial:0, min:0, integer:true }),
					fly: new fields.NumberField({ initial:0, min:0, integer:true }),
					swim: new fields.NumberField({ initial:0, min:0, integer:true }),
					walk: new fields.NumberField({ initial:9, min:0, integer:true }),
					hover: new fields.BooleanField({ initial: false }),
					unit: new fields.StringField({ initial: 'm' }),
				}),
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				origem: new fields.StringField({ initial: '' }),
				info: new fields.StringField({ initial: '' }),
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ required:true, choices: Object.keys(T20.creatureTypes), initial: 'hum' }),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
				diario: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario1: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario2: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario3: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario4: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
				diario5: new fields.SchemaField({
					name: new fields.StringField({ initial:'' }),
					value: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				idiomas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmaduras: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}
		return super.migrateData(data);
	}
}

class systemActorNPCDataLazy extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			pericias: new ActorSkillsField(SkillData, {initialKeys: Object.keys(SYSTEMRULES.skills)}),
			modificadores: new fields.SchemaField({
				custoPM: new fields.StringField(),
				atributos: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField()),
					des: new fields.ArrayField(new fields.StringField()),
					con: new fields.ArrayField(new fields.StringField()),
					int: new fields.ArrayField(new fields.StringField()),
					sab: new fields.ArrayField(new fields.StringField()),
					car: new fields.ArrayField(new fields.StringField()),
					fisicos: new fields.ArrayField(new fields.StringField()),
					mentais: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
				}),
				dano: new fields.SchemaField({
					ad: new fields.ArrayField(new fields.StringField()),
					alq: new fields.ArrayField(new fields.StringField()),
					cac: new fields.ArrayField(new fields.StringField()),
					geral: new fields.ArrayField(new fields.StringField()),
					mag: new fields.ArrayField(new fields.StringField()),
				}),
				pericias: new fields.SchemaField({
					geral: new fields.ArrayField(new fields.StringField()),
					resistencia: new fields.ArrayField(new fields.StringField()),
					semataque: new fields.ArrayField(new fields.StringField()),
					ataque: new fields.ArrayField(new fields.StringField()),
					atr: new fields.SchemaField({
						for: new fields.ArrayField(new fields.StringField()),
						des: new fields.ArrayField(new fields.StringField()),
						con: new fields.ArrayField(new fields.StringField()),
						int: new fields.ArrayField(new fields.StringField()),
						sab: new fields.ArrayField(new fields.StringField()),
						car: new fields.ArrayField(new fields.StringField()),
					}),
				}),
			}),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				cd: new fields.NumberField({ required: true, nullable:false, initial:10 }),
				conjuracao: new fields.StringField({blank:true, choices: ['', ...Object.keys(T20.atributos)], initial: '' }),
				treino: new fields.NumberField({ required: true, nullable:false, initial:0 }),
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					atributo: new fields.StringField({ required:true, blank:false, choices: Object.keys(T20.atributos), initial:'des'}),
					pda: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					value: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10 }),
					outros: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					condi: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
				}),
				nd: new fields.StringField({ required:true, initial: '1'}),
				nivel: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:1, min:0 }),
					xp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0, integer:true }),
					}),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					encumbered: new fields.BooleanField({ initial: false }),
				}),
				movement: new fields.SchemaField({
					burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
					climb: new fields.NumberField({ initial:0, min:0, integer:true }),
					fly: new fields.NumberField({ initial:0, min:0, integer:true }),
					swim: new fields.NumberField({ initial:0, min:0, integer:true }),
					walk: new fields.NumberField({ initial:9, min:0, integer:true }),
					hover: new fields.BooleanField({ initial: false }),
					unit: new fields.StringField({ initial: 'm' }),
				}),
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			builder: new fields.SchemaField({
				attributes: new fields.SchemaField({
					cr: new fields.StringField({ initial: '' }),
					size: new fields.StringField({ initial: 'med' }),
					attack: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					botsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					damage: new fields.SchemaField({
						value: new fields.StringField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					dc: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					defense: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					skills: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					fort: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					hp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					midsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					mp: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
					}),
					refl: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					topsave: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable:false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
					vont: new fields.SchemaField({
						value: new fields.NumberField({ required: true, nullable: false, initial:0}),
						cr: new fields.StringField({ initial: '' }),
						rank: new fields.StringField({ initial: '' }),
					}),
				}),
				details: new fields.SchemaField({
					concept: new fields.StringField({ initial: '' }),
					creatureType: new fields.StringField({ initial: '' }),
					role: new fields.StringField({ initial: '' }),
					treasure: new fields.StringField({ initial: '' }),
				}),
			}),
			detalhes: new fields.SchemaField({
				divindade: new fields.StringField({ initial: '' }),
				raca: new fields.StringField({ initial: '' }),
				tipo: new fields.StringField({ required:true, choices: Object.keys(T20.creatureTypes), initial: 'hum' }),
				nd: new fields.StringField({required:true, initial: '1'}),
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
				equipamento: new fields.StringField({ initial: '' }),
				resistencias: new fields.StringField({ initial: '' }),
				tesouro: new fields.StringField({ initial: '' }),
				role: new fields.StringField({ initial: '' }),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				idiomas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmaduras: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				profArmas: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		if( !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo) ){
			let cType = Object.keys(T20.creatureTypes).find( c => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? 'hum';
		}

		if( data.detalhes.nd && data.detalhes.nd > data.attributes.nd ){
			data.attributes.nd = data.detalhes.nd;
		}
		
		if( isNaN(data.attributes.nivel.value) || !isFinite( data.attributes.nivel.value ) ){
			data.attributes.nivel.value = 1;
		}
		return super.migrateData(data);
	}
}

class systemActorSimpleDataLazy extends foundry.abstract.DataModel {
	/** @override */
	static defineSchema() {
		return {
			atributos: new fields.SchemaField(AbilitiesSchema()),
			dinheiro: new fields.SchemaField({
				tc: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tl: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				to: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
				tp: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
			}),
			attributes: new fields.SchemaField({
				pv: _resourceSchema(),
				pm: _resourceSchema(),
				defesa: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0 }),
					bonus: new fields.ArrayField(new fields.StringField()),
				}),
				carga: new fields.SchemaField({
					value: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					base: new fields.NumberField({ required: true, nullable:false, initial:10, min:0 }),
					max: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					pct: new fields.NumberField({ required: true, nullable:false, initial:0, min:0 }),
					encumbered: new fields.BooleanField({ initial: false }),
				}),
				movement: new fields.SchemaField({
					burrow: new fields.NumberField({ initial:0, min:0, integer:true }),
					climb: new fields.NumberField({ initial:0, min:0, integer:true }),
					fly: new fields.NumberField({ initial:0, min:0, integer:true }),
					swim: new fields.NumberField({ initial:0, min:0, integer:true }),
					walk: new fields.NumberField({ initial:9, min:0, integer:true }),
					hover: new fields.BooleanField({ initial: false }),
					unit: new fields.StringField({ initial: 'm' }),
				}),
				sentidos: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
			}),
			resources: new fields.ObjectField(),
			detalhes: new fields.SchemaField({
				biography: new fields.SchemaField({
					value: new fields.HTMLField({ required: true, nullable:false, initial:'' }),
					public: new fields.HTMLField({ initial:'' }),
				}),
			}),
			tracos: new fields.SchemaField({
				ic: new fields.SchemaField({
					value: new fields.ArrayField(new fields.StringField()),
					custom: new fields.StringField(),
				}),
				resistencias: new fields.SchemaField(ResistanceSchema()),
				tamanho: new fields.StringField({ required: true, nullable:false, choices: Object.keys(T20.actorSizes), initial: 'med' }),
			}),
		}
	}

	/** @inheritdoc */
	static migrateData(data) {
		return super.migrateData(data);
	}
}


export {
	systemActorCharacterData,
	systemActorNPCData,
	systemActorSimpleData,
}