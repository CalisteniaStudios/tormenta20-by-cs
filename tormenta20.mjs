// Import Config
import { T20, SYSTEMRULES } from "./module/config/T20.js";
globalThis.T20 = T20;
globalThis.SYSTEMRULES = SYSTEMRULES;

// Import Modules
import { Tormenta20ActorSheetSettings } from "./module/apps/form-apps.mjs";
import { SystemSettings } from "./module/settings.mjs";
import { preloadHandlebarsTemplates } from "./module/templates.mjs";
import { registerHandlebarsHelpers } from './module/handlebars.mjs';
import { _getInitiativeFormula } from "./module/combat.mjs";
import { measureDistances } from "./module/pixi/canvas.mjs";

// Import Documents
import ActorT20 from "./module/documents/actor.mjs";
import ItemT20 from "./module/documents/item.mjs";
import ActiveEffectT20 from "./module/documents/active-effects.mjs";
import RollT20 from "./module/documents/roll.mjs";
import TokenDocumentT20 from "./module/documents/token.mjs";
import TokenT20 from "./module/pixi/token.mjs";

// Import Sheets
import ActorSheetT20Character from "./module/sheets/actor-character.mjs";
import ActorSheetT20CharacterTabbed from "./module/sheets/actor-tabbed.mjs";
import ActorSheetT20Builder from "./module/sheets/actor-builder.mjs";
import ActorSheetT20NPC from "./module/sheets/actor-npc.mjs";
import ActorSheetT20Simple from "./module/sheets/actor-simple.mjs";
import ActiveEffectConfigT20 from "./module/sheets/active-effects.mjs";
import ItemSheetT20 from "./module/sheets/item.mjs";
import JournalSheetT20 from "./module/sheets/journal.mjs";


// Import Applications
import AbilityTemplate from "./module/pixi/ability-template.mjs";
import AbilityUseDialog from "./module/apps/ability-use-dialog.mjs";
import ActorSettings from "./module/apps/actor-settings.mjs";
import TraitSelector from "./module/apps/trait-selector.mjs";
import {applyOnUseEffects} from "./module/apps/ability-use.mjs";
import StatblockParser from "./module/apps/statblock-parser.mjs";
import RestConfigDialog from "./module/apps/rest-config.mjs";
import CompendiumT20 from "./module/apps/compendium.mjs";
import CharacterProgression from "./module/apps/character-progression.mjs";

// Import Helpers
import * as hooks from "./module/hooks.mjs";
import * as chat from "./module/chat.mjs";
import * as dice from "./module/dice/dice.mjs";
import * as macros from "./module/macros.mjs";
import "./module/modules.mjs";
import * as utils from "./module/utils.mjs";

// import {getSystemActorData,  getSystemItemData} from "./dataModel/data.mjs";
import {systemActorCharacterData, systemActorNPCData, systemActorSimpleData} from "./module/dataModel/actor.mjs";
import {systemItemWeaponData, systemItemEquipmentData, systemItemSpellData, systemItemPowerData, systemItemConsumableData, systemItemClassData, systemItemLootData} from "./module/dataModel/item.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
	console.log(`T20 | Initializing the Tormenta20 Game System`);
	// Create a namespace within the game global
	game.tormenta20 = {
		applications: {
			AbilityUseDialog,
			ActorSheetT20Character,
			ActorSheetT20NPC,
			ActorSheetT20Builder,
			ItemSheetT20,
			TraitSelector,
			ActorSettings,
			StatblockParser,
			RestConfigDialog,
			CompendiumT20,
			CharacterProgression,
		},
		canvas: {
			AbilityTemplate
		},
		config: T20,
		dice: dice,
		conditions: T20.conditions,
		entities: {
			ActorT20,
			ItemT20
		},
		macros: macros,
		rollItemMacro: macros.rollItemMacro,
		rollSkillMacro: macros.rollSkillMacro,
	}
	if ( game.version.startsWith('11.') ) {
		foundry.dice = {
			terms: {
				Coin: Coin,
				DiceTerm: DiceTerm,
				Die: Die,
				FateDie: FateDie,
				FunctionTerm: MathTerm, // MathTerm was renamed to FunctionTerm in v12
				NumericTerm: NumericTerm,
				OperatorTerm: OperatorTerm,
				ParentheticalTerm: ParentheticalTerm,
				PoolTerm: PoolTerm,
				RollTerm: RollTerm,
				StringTerm: StringTerm
			}
		}
		Math.clamp = Math.clamped;
	}
	// Record Cnfiguration Values
	CONFIG.T20 = T20;
	CONFIG.Actor.documentClass = ActorT20;
	CONFIG.Item.documentClass = ItemT20;
	CONFIG.ActiveEffect.documentClass = ActiveEffectT20;
	
	CONFIG.Token.documentClass = TokenDocumentT20;
	CONFIG.Token.objectClass = TokenT20;
	CONFIG.time.roundTime = 6;

	// Register T20 stuff
	CONFIG.statusEffects = T20.statusEffectIcons;
	CONFIG.conditions = T20.conditions;
	
	CONFIG.controlIcons.defeated = CONFIG.statusEffects.filter(x => x.id === 'inconsciente')[0].icon;
	CONFIG.specialStatusEffects.BLIND = 'cego';
	CONFIG.specialStatusEffects.DEFEATED = 'morto';
	CONFIG.specialStatusEffects.INVISIBLE = 'invisivel';

	// T20 cone RAW should be 53.13 degrees
	// CONFIG.MeasuredTemplate.defaults.angle = 53.13;
	
	// Register System Settings
	SystemSettings();

	// Patch Core Functions
	CONFIG.Combat.initiative = {
		formula: "1d20 + @pericias.inic.value",
		decimals: 2,
	};
	Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

	// Register Roll Extensions
	CONFIG.Dice.rolls.D20Roll = dice.d20Roll;
	CONFIG.Dice.rolls.DamageRoll = dice.damageRoll;
	CONFIG.Dice.rolls.RollT20 = RollT20;
		
	// DATA MODEL
	CONFIG.Actor.dataModels["character"] = systemActorCharacterData;
	CONFIG.Actor.dataModels["npc"] = systemActorNPCData;
	CONFIG.Actor.dataModels["simple"] = systemActorSimpleData;

	CONFIG.Item.dataModels["arma"] = systemItemWeaponData;
	CONFIG.Item.dataModels["classe"] = systemItemClassData;
	CONFIG.Item.dataModels["consumivel"] = systemItemConsumableData;
	CONFIG.Item.dataModels["equipamento"] = systemItemEquipmentData;
	CONFIG.Item.dataModels["magia"] = systemItemSpellData;
	CONFIG.Item.dataModels["poder"] = systemItemPowerData;
	CONFIG.Item.dataModels["tesouro"] = systemItemLootData;
	
	
	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("tormenta20", ActorSheetT20Character, {
		types: ["character"],
		makeDefault: true,
		label: 'T20.CharacterSheet', //"Ficha de Personagem"
	});
	Actors.registerSheet("tormenta20", ActorSheetT20CharacterTabbed, {
		types: ["character"],
		makeDefault: false,
		label: 'T20.CharacterSheetTabbed', //"Ficha de Personagem - Abas"
	});
	Actors.registerSheet("tormenta20", ActorSheetT20NPC, {
		types: ["npc"],
		makeDefault: true,
		label: "T20.NPCSheet"
	});

	// Actors.registerSheet("tormenta20", ActorSheetT20Builder, {
	// 	types: ["npc"],
	// 	makeDefault: false,
	// 	label: 'T20.CharacterBuilderSheet', //"Progressão de Personagem"
	// });
	
	Actors.registerSheet("tormenta20", ActorSheetT20Simple, {
		types: ["simple"],
		makeDefault: true,
		label: 'T20.SimpleActorSheet', //"Ficha de Simple"
	});
	
	
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("tormenta20", ItemSheetT20, {
		makeDefault: true,
	});

	DocumentSheetConfig.registerSheet(ActiveEffect, "tormenta20", ActiveEffectConfigT20, {makeDefault :true});

	// Core Application Overrides
  // CONFIG.ui.compendium = CompendiumDirectoryT20;
	// Preload Handlebars Templates
	preloadHandlebarsTemplates();
	registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
	
	// localization && sort
	Hooks.once("i18nInit", () => utils.performPreLocalization(CONFIG.T20));

/* -------------------------------------------- */

// Load hooks
hooks.default();
