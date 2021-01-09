// Import Modules
import { T20Config } from "./config.js";
import { SystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { _getInitiativeFormula } from "./combat.js";
import { measureDistances, getBarAttribute } from "./canvas.js";

// Import Entities
import ActorT20 from "./actor/entity.js";
import ItemT20 from "./item/entity.js";

// Import Applications
import ActorSettings from "./apps/actor-settings.js";
import AbilityUseDialog from "./apps/ability-use-dialog.js";
import ConjurarDialog from "./apps/conjurar-dialog.js";
import { T20Utility } from "./utility.js";
import ActorSheetT20Character from "./actor/sheet/character.js";
import ActorSheetT20NPC from "./actor/sheet/npc.js";
import ItemSheetT20 from "./item/sheet.js";
import { toggleEffect } from "./actor/condicoes.js";
import { endSegment } from "./apps/time-segment.js";

// Import Helpers
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
    dice: dice,
    entities: {
      ActorT20,
      ItemT20
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

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper("concat", function () {
    var outStr = "";Chat
    for (var arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("toJSONString", function (str) {
    return JSON.stringify(str);
  });

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifNotEquals", function (arg1, arg2, options) {
    return arg1 != arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("ifGreater", function (arg1, arg2, options) {
    if (arg1 > arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifEGreater", function (arg1, arg2, options) {
    if (arg1 >= arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifOr", function (arg1, arg2, options) {
    if (arg1 || arg2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper("ifAny", function (arg1, arg2, arg3, options) {
    if (arg1 || arg2 || arg3) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper(
    "conditionTip",
    function (context, condition, options) {
      var ret = "";
      for (var prop in context) {
        if (condition == prop) {
          ret = ret + " " + context[prop].tooltip;
        }
      }
      return ret;
    }
  );
  preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Foundry VTT Setup                           */
/* -------------------------------------------- */
  
  // localization && sort

/* -------------------------------------------- */

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
 */
Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => macros.createT20Macro(data, slot));

  // TODO implement Migration
  // Determine whether a system migration is required and feasible
  if ( !game.user.isGM ) return;
  if (!game.settings.get("tormenta20", "systemMigrationVersion")) game.settings.set("tormenta20", "systemMigrationVersion", "1.0.02");
  
  const currentVersion = game.settings.get("tormenta20", "systemMigrationVersion") ? game.settings.get("tormenta20", "systemMigrationVersion") : "1.0.02";
  
  const NEEDS_MIGRATION_VERSION = "1.0.3";
  const COMPATIBLE_MIGRATION_VERSION = "1.0.0";
  const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
  if ( !needsMigration ) return;
  // Perform the migration
  if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
    const warning = `Your Tormenta20 system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
    ui.notifications.error(warning, {permanent: true});
  }
  migrations.migrateWorld();
});


/* -------------------------------------------- */
/*  Canvas Initialization                       */
/* -------------------------------------------- */

Hooks.on("canvasInit", function () {
  // Extend Diagonal Measurement
  canvas.grid.diagonalRule = game.settings.get("tormenta20", "diagonalMovement");
  SquareGrid.prototype.measureDistances = measureDistances;

  Token.prototype.getBarAttribute = getBarAttribute;
  Token.prototype.toggleEffect = toggleEffect;
});


/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (app, html, data) => {

  // Display action buttons
  //chat.displayChatActionButtons(app, html, data);

  // Highlight critical success or failure die
  //chat.highlightCriticalSuccessFailure(app, html, data);

  // Optionally collapse the content
  if (game.settings.get("tormenta20", "autoCollapseItemCards")) html.find(".card-content").hide();
  if (game.settings.get("tormenta20", "applyButtonsInsideChat"))
  {
    chat.ApplyButtons(app, html, data);
  }
  
});

/* Add hook for the context menu over the rolled damage */
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
// Hooks.on("renderChatLog", (app, html, data) => T20Item.chatListeners(html));
// Hooks.on("renderChatPopout", (app, html, data) => T20Item.chatListeners(html));
Hooks.on("renderChatLog", (app, html, data) => ItemT20.chatListeners(html));
Hooks.on("renderChatPopout", (app, html, data) => ItemT20.chatListeners(html));

/* Add hook for End of Cena */
Hooks.on("renderSidebarTab", async (app, html) => endSegment(app,html)) ;

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

