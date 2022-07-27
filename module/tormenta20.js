// Import Modules
import { T20 } from "./config.js";
import { Tormenta20ActorSheetSettings } from "./apps/form-apps.js";
import { SystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from './handlebars.js';
import { _getInitiativeFormula } from "./combat.js";
import { measureDistances } from "./canvas.js";

// Import Entities
import ActorT20 from "./actor/entity.js";
import ItemT20 from "./item/entity.js";
// import ActiveEffectT20 from "./_support/active-effects.js";
import { TokenDocumentT20, TokenT20 } from "./token.js";

// Import Applications
import AbilityTemplate from "./pixi/ability-template.js";
import AbilityUseDialog from "./apps/ability-use-dialog.js";
import ActorSettings from "./apps/actor-settings.js";
import ActorSheetT20Character from "./actor/sheet/character.js";
import ActorSheetT20CharacterTabbed from "./actor/sheet/_tempSheets.js";
import ActorSheetT20Builder from "./actor/sheet/builder.js";
import ActorSheetT20NPC from "./actor/sheet/npc.js";
import ItemSheetT20 from "./item/sheet.js";
import TraitSelector from "./apps/trait-selector.js";
import {applyOnUseEffects} from "./apps/ability-use.js";

import { T20Conditions } from "./conditions/conditions.js";
import ActiveEffectConfigT20 from "./apps/ae-config.js";

// Import Helpers
import * as hooks from "./hooks.js";
import * as chat from "./chat.js";
import * as dice from "./dice.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";
import "./modules.js";
import * as utils from "./utils.js";

// import {getSystemActorData,  getSystemItemData} from "./dataModel/data.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
	// console.log(`T20 | Initializing the Tormenta20 Game System\n T20.ASCII`);
	// Create a namespace within the game global
	game.tormenta20 = {
		applications: {
			AbilityUseDialog,
			ActorSheetT20Character,
			ActorSheetT20NPC,
			ActorSheetT20Builder,
			ItemSheetT20,
			TraitSelector,
			ActorSettings
		},
		canvas: {
			AbilityTemplate
		},
		config: T20,
		dice: dice,
		conditions: T20Conditions,
		entities: {
			ActorT20,
			ItemT20
		},
		macros: macros,
		migrations: migrations,
		rollItemMacro: macros.rollItemMacro,
		rollSkillMacro: macros.rollSkillMacro
	}

	// Record Cnfiguration Values
	CONFIG.T20 = T20;
	CONFIG.Actor.documentClass = ActorT20;
	CONFIG.Item.documentClass = ItemT20;
	// CONFIG.ActiveEffect.documentClass = ActiveEffectT20;
	
	CONFIG.Token.documentClass = TokenDocumentT20;
	CONFIG.Token.objectClass = TokenT20;
	CONFIG.time.roundTime = 6;

	// Register T20 stuff
	CONFIG.statusEffects = T20.statusEffectIcons;
	CONFIG.conditions = T20.conditions;
	// console.log(CONFIG.ActiveEffect.sheetClass);
	// CONFIG.ActiveEffect.sheetClass = ActiveEffectConfigT20;
	CONFIG.controlIcons.defeated = CONFIG.statusEffects.filter(x => x.id === 'inconsciente')[0].icon;

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
	CONFIG.Dice.rolls.push(dice.D20Roll);
	CONFIG.Dice.rolls.push(dice.DamageRoll);

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("tormenta20", ActorSheetT20Character, {
		types: ["character"],
		makeDefault: true,
		label: game.i18n.localize("T20.CharacterSheet"), //"Ficha de Personagem"
	});
	Actors.registerSheet("tormenta20", ActorSheetT20CharacterTabbed, {
		types: ["character"],
		makeDefault: false,
		label: game.i18n.localize("T20.CharacterSheetTabbed"), //"Ficha de Personagem - Abas"
	});
	
	Actors.registerSheet("tormenta20", ActorSheetT20NPC, {
		types: ["npc"],
		makeDefault: true,
		label: game.i18n.localize("T20.NPCSheet"), //"Ficha de NPC"
	});

	Actors.registerSheet("tormenta20", ActorSheetT20Builder, {
		types: ["npc"],
		makeDefault: false,
		label: game.i18n.localize("T20.CharacterBuilderSheet"), //"Progressão de Personagem"
	});
	
	// game.documentTypes.Actor.forEach(type => CONFIG.Actor.systemDataModels[type] = getSystemActorData(type));

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("tormenta20", ItemSheetT20, {
		makeDefault: true,
	});

	// game.documentTypes.Item.forEach(type => CONFIG.Item.systemDataModels[type] = getSystemItemData(type));

	DocumentSheetConfig.registerSheet(ActiveEffect, "tormenta20", ActiveEffectConfigT20, {makeDefault :true});

	// SET VISION MODES
	// CONFIG.Canvas.visionModes = 

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
