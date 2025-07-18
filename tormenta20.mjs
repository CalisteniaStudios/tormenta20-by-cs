import "./less/tormenta20.less";
// Import Config
import { T20 } from "./module/config/T20.js";
globalThis.T20 = T20;

// Import Modules
import { _getInitiativeFormula } from "./module/combat.mjs";
import { registerHandlebarsHelpers } from "./module/handlebars.mjs";
import { SystemSettings } from "./module/settings.mjs";
import { preloadHandlebarsTemplates } from "./module/templates.mjs";

// Import Documents
import ActiveEffectT20 from "./module/documents/active-effects.mjs";
import ActorT20 from "./module/documents/actor.mjs";
import ChatMessageTormenta20 from "./module/documents/chat-message.mjs";
import ItemT20 from "./module/documents/item.mjs";
import RollT20 from "./module/documents/roll.mjs";
import TokenDocumentT20 from "./module/documents/token.mjs";

// Import Canvas
import AbilityTemplate from "./module/canvas/ability-template.mjs";
import TokenRulerT20 from "./module/canvas/token-ruler.mjs";
import TokenT20 from "./module/canvas/token.mjs";

// Import Sheets
import ActiveEffectConfigT20 from "./module/sheets/active-effects.mjs";
import ActorSheetT20Bases from "./module/sheets/actor-bases.mjs";
import ActorSheetT20Character from "./module/sheets/actor-character.mjs";
import HazardSheetT20 from "./module/sheets/actor-hazard.mjs";
import ActorSheetT20NPC from "./module/sheets/actor-npc.mjs";
import ActorSheetT20Simple from "./module/sheets/actor-simple.mjs";
import ActorSheetT20CharacterTabbed from "./module/sheets/actor-tabbed.mjs";
import RaceSheetT20 from "./module/sheets/item-race-sheet.mjs";
import ItemSheetT20 from "./module/sheets/item-sheet.mjs";

// Import Applications
import AbilityUseDialog from "./module/apps/ability-use-dialog.mjs";
import ActorSettings from "./module/apps/actor-settings.mjs";
import CharacterProgression from "./module/apps/character-progression.mjs";
import CompendiumT20 from "./module/apps/compendium.mjs";
import ResourceConfig from "./module/apps/resource-config.mjs";
import RestConfigDialog from "./module/apps/rest-config.mjs";
import StatblockParser from "./module/apps/statblock-parser.mjs";
import TokenHUDT20 from "./module/apps/token-hud.mjs";
import TraitSelector from "./module/apps/trait-selector.mjs";
// import CombatTrackerT20 from "./module/apps/combat.mjs";

// Import Helpers
import * as models from "./module/dataModel/_module.mjs";
import * as fields from "./module/dataModel/fields/_module.mjs";
import * as dice from "./module/dice/dice.mjs";
import * as hooks from "./module/hooks.mjs";
import * as macros from "./module/macros.mjs";
import "./module/modules.mjs";
import * as utils from "./module/utils.mjs";

// import {getSystemActorData,  getSystemItemData} from "./dataModel/data.mjs";
import TemplateLayerT20 from "./module/canvas/template-layer.mjs";
import ActorDirectoryTormenta20 from "./module/sidebar/actor-directory.mjs";
import ChatLogTormenta20 from "./module/sidebar/chat-log.mjs";
import CompendiumDirectoryT20 from "./module/sidebar/compendium-directory.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
globalThis.tormenta20 = {
	applications: {
		AbilityUseDialog,
		ActorSheetT20Character,
		ActorSheetT20CharacterTabbed,
		ActorSheetT20NPC,
		ItemSheetT20,
		TraitSelector,
		ActorSettings,
		StatblockParser,
		RestConfigDialog,
		ResourceConfig,
		CompendiumT20,
		CharacterProgression
	},
	data: {
		fields,
		models
	},
	canvas: {
		AbilityTemplate,
		TemplateLayerT20,
		TokenT20
	},
	config: T20,
	dice: dice,
	conditions: T20.conditions,
	entities: {
		ActorT20,
		ItemT20
	},
	macros: macros,
	utils,
	rollItemMacro: macros.rollItemMacro,
	rollSkillMacro: macros.rollSkillMacro
};

Hooks.once("init", async function () {
	console.log("T20 | Initializing the Tormenta20 Game System");
	game.tormenta20 = tormenta20;
	CONFIG.ActiveEffect.legacyTransferral = true;
	// Record Cnfiguration Values
	CONFIG.T20 = T20;
	CONFIG.Actor.documentClass = ActorT20;
	CONFIG.Item.documentClass = ItemT20;
	CONFIG.ActiveEffect.documentClass = ActiveEffectT20;

	CONFIG.Token.documentClass = TokenDocumentT20;
	CONFIG.Token.objectClass = TokenT20;
	CONFIG.Token.rulerClass = TokenRulerT20;
	CONFIG.Token.hudClass = TokenHUDT20;
	TokenRulerT20.applyMovementConfig();
	CONFIG.time.roundTime = 6;

	CONFIG.Canvas.layers.templates.layerClass = TemplateLayerT20;
	CONFIG.MeasuredTemplate.defaults.angle = 90;
	CONFIG.MeasuredTemplate.objectClass = AbilityTemplate;

	// Register T20 stuff
	CONFIG.statusEffects = T20.statusEffectIcons;
	CONFIG.conditions = T20.conditions;

	CONFIG.controlIcons.defeated = CONFIG.statusEffects.filter((x) => x.id === "inconsciente")[0].icon;
	CONFIG.specialStatusEffects.BLIND = "cego";
	CONFIG.specialStatusEffects.DEFEATED = "morto";
	CONFIG.specialStatusEffects.INVISIBLE = "invisivel";

	// T20 cone RAW should be 53.13 degrees
	// CONFIG.MeasuredTemplate.defaults.angle = 53.13;

	// Register System Settings
	SystemSettings();

	// Patch Core Functions
	CONFIG.ui.actors = ActorDirectoryTormenta20;
	CONFIG.ui.chat = ChatLogTormenta20;
	// CONFIG.ui.combat = CombatTrackerT20;
	CONFIG.ui.compendium = CompendiumDirectoryT20;

	CONFIG.ChatMessage.documentClass = ChatMessageTormenta20;
	CONFIG.Combat.initiative = {
		formula: "1d20 + @pericias.inic.value",
		decimals: 2
	};
	Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

	// Register Roll Extensions
	Roll.TOOLTIP_TEMPLATE = "systems/tormenta20/templates/chat/roll-breakdown.hbs";
	CONFIG.Dice.rolls.D20Roll = dice.d20Roll;
	CONFIG.Dice.rolls.DamageRoll = dice.damageRoll;
	CONFIG.Dice.rolls.RollT20 = RollT20;

	// DATA MODEL

	CONFIG.Actor.dataModels.bases = tormenta20.data.models.BasesData;
	CONFIG.Actor.dataModels.character = tormenta20.data.models.CharacterData;
	CONFIG.Actor.dataModels.npc = tormenta20.data.models.MenaceData;
	CONFIG.Actor.dataModels.simple = tormenta20.data.models.SimpleData;
	CONFIG.Actor.dataModels.hazard = tormenta20.data.models.HazardData;

	CONFIG.Item.dataModels.arma = tormenta20.data.models.WeaponData;
	CONFIG.Item.dataModels.classe = tormenta20.data.models.ClassData;
	CONFIG.Item.dataModels.comodo = tormenta20.data.models.RoomData;
	CONFIG.Item.dataModels.consumivel = tormenta20.data.models.ConsumableData;
	CONFIG.Item.dataModels.equipamento = tormenta20.data.models.EquipmentData;
	CONFIG.Item.dataModels.magia = tormenta20.data.models.SpellData;
	CONFIG.Item.dataModels.mobilia = tormenta20.data.models.FurnitureData;
	CONFIG.Item.dataModels.poder = tormenta20.data.models.PowerData;
	CONFIG.Item.dataModels.race = tormenta20.data.models.RaceData;
	CONFIG.Item.dataModels.tesouro = tormenta20.data.models.LootData;

	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Bases, {
		types: ["bases"],
		makeDefault: true,
		label: "T20.BasesSheet" // "Ficha de Bases"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Character, {
		types: ["character"],
		makeDefault: true,
		label: "T20.CharacterSheet" // "Ficha de Personagem"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20CharacterTabbed, {
		types: ["character"],
		makeDefault: false,
		label: "T20.CharacterSheetTabbed" // "Ficha de Personagem - Abas"
	});
	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20NPC, {
		types: ["npc"],
		makeDefault: true,
		label: "T20.NPCSheet"
	});

	foundry.documents.collections.Actors.registerSheet("tormenta20", ActorSheetT20Simple, {
		types: ["simple"],
		makeDefault: true,
		label: "T20.SimpleActorSheet" // "Ficha de Simple"
	});

	foundry.documents.collections.Actors.registerSheet("tormenta20", HazardSheetT20, {
		types: ["hazard"],
		makeDefault: true,
		label: "T20.HazardSheet" // "Ficha de Perigos Complexos"
	});

	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
	foundry.documents.collections.Items.registerSheet("tormenta20", ItemSheetT20, {
		makeDefault: true,
		label: "T20.ItemSheet"
	});
	foundry.documents.collections.Items.unregisterSheet("tormenta20", ItemSheetT20, { types: ["race"] });
	foundry.documents.collections.Items.registerSheet("tormenta20", RaceSheetT20, {
		makeDefault: true,
		types: ["race"],
		label: "T20.ItemSheet"
	});

	foundry.applications.apps.DocumentSheetConfig.unregisterSheet(
		ActiveEffect,
		"core",
		foundry.applications.sheets.ActiveEffectConfig
	);
	foundry.applications.apps.DocumentSheetConfig.registerSheet(ActiveEffect, "tormenta20", ActiveEffectConfigT20, {
		makeDefault: true,
		label: "T20.ActiveEffectSheet"
	});

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
