// Import Modules
import { T20Config } from "./config.js";
import { SystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from './handlebars.js';
import { _getInitiativeFormula } from "./combat.js";
import { measureDistances, getBarAttribute } from "./canvas.js";

// Import Entities
import ActorT20 from "./actor/entity.js";
import ItemT20 from "./item/entity.js";

// Import Applications
import AbilityTemplate from "./pixi/ability-template.js";
import ActorSettings from "./apps/actor-settings.js";
import AbilityUseDialog from "./apps/ability-use-dialog.js";
import ConjurarDialog from "./apps/conjurar-dialog.js";
import { T20Utility } from "./utility.js";
import ActorSheetT20Character from "./actor/sheet/character.js";
import ActorSheetT20NPC from "./actor/sheet/npc.js";
import ItemSheetT20 from "./item/sheet.js";
import ActiveEffectConfigT20 from "./apps/ae-config.js";
import { toggleEffect } from "./actor/condicoes.js";
import { endSegment } from "./apps/time-segment.js";

import { T20Conditions } from "./conditions/conditions.js";

// Import Helpers
import * as hooks from "./hooks.js";
import * as chat from "./chat.js";
import * as dice from "./dice.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  // console.log(`T20 | Initializing the Tormenta20 Game System\n T20.ASCII`);
 
  game.tormenta20 = {
    applications: {
      AbilityUseDialog,
      ActorSheetT20Character,
      ActorSheetT20NPC,
      ItemSheetT20,
      ConjurarDialog,
      ActorSettings
    },
    config: T20Config,
    conditions: T20Conditions,
    dice: dice,
    entities: {
      ActorT20,
      ItemT20
    },
    canvas: {
      AbilityTemplate
    },
    macros: macros,
    migrations: migrations,
    rollItemMacro: macros.rollItemMacro,
    rollSkillMacro: macros.rollSkillMacro
  }
  /**/

  // Define custom Entity classes
  CONFIG.Actor.entityClass = ActorT20;
  CONFIG.Item.entityClass = ItemT20;
  CONFIG.T20 = T20Config;
  CONFIG.statusEffects = T20Config.statusEffectIcons;
  CONFIG.conditions = T20Config.conditions;
  CONFIG.ActiveEffect.sheetClass = ActiveEffectConfigT20;

  // Register System Settings
  SystemSettings();

  // Patch Core Functions
  CONFIG.Combat.initiative = {
    formula: "1d20 + @pericias.ini.value",
    decimals: 2,
  };
  Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  CONFIG.controlIcons.defeated = CONFIG.statusEffects.filter(x => x.id === 'inconsciente')[0].icon;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  // Actors.registerSheet("tormenta20", T20ActorSheet, {
  Actors.registerSheet("tormenta20", ActorSheetT20Character, {
    types: ["character"],
    makeDefault: true,
  });

  // Actors.registerSheet("tormenta20", T20ActorNPCSheet, {
  Actors.registerSheet("tormenta20", ActorSheetT20NPC, {
    types: ["npc"],
    makeDefault: true,
  });

  Items.unregisterSheet("core", ItemSheet);
  // Items.registerSheet("tormenta20", T20ItemSheet, {
  Items.registerSheet("tormenta20", ItemSheetT20, {
    makeDefault: true,
  });

  preloadHandlebarsTemplates();
	registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
  
  // localization && sort

/* -------------------------------------------- */

// Load hooks
hooks.default();
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */
// TODO Create macro.js
/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */

export const getItemOwner = function (item) {
  if (item.actor) return item.actor;
  if (item._id) {
    return game.actors.entities.filter((o) => {
      return o.items.filter((i) => i._id === item._id).length > 0;
    })[0];
  }
  return null;
};

