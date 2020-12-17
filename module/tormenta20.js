// Import Modules
import { SystemSettings } from "./settings.js";
import { T20Actor } from "./actor/actor.js";
import { T20ActorSheet } from "./actor/actor-sheet.js";
import { T20ActorNPCSheet } from "./actor/actor-npc-sheet.js";
import { T20Item } from "./item/item.js";
import { T20ItemSheet } from "./item/item-sheet.js";
import { T20Utility } from "./utility.js";
import { measureDistances, getBarAttribute } from "./canvas.js";
import ConjurarDialog from "./apps/conjurar-dialog.js";
import * as chat from "./chat.js";
import * as dice from "./dice.js";

Hooks.once('init', async function () {

  game.tormenta20 = {
    T20Actor,
    T20Item,
    rollItemMacro,
    rollSkillMacro,
    ConjurarDialog,
    dice
  };

  // Register System Settings
  SystemSettings();


  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: "1d20 + @pericias.ini.value",
    decimals: 2
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = T20Actor;
  CONFIG.Item.entityClass = T20Item;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("tormenta20", T20ActorSheet, {
    types: ['character'],
    makeDefault: true
  });

  Actors.registerSheet("tormenta20", T20ActorNPCSheet, {
    types: ['npc'],
    makeDefault: true
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("tormenta20", T20ItemSheet, {
    makeDefault: true
  });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
    return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('ifGreater', function (arg1, arg2, options) {
    if (arg1 > arg2) {
        return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper('ifEGreater', function (arg1, arg2, options) {
    if (arg1 >= arg2) {
        return options.fn(this);
    }
    return options.inverse(this);
  });
});

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createT20Macro(data, slot));
});

Hooks.on('renderDialog', (dialog, html, options) => {
  if (dialog.title == 'Create New Item' || dialog.title == 'Criar Novo Item') {
    $(html[0]).find('option[value=pericia]').remove();
  }
});

/* -------------------------------------------- */
/*  Canvas Initialization                       */
/* -------------------------------------------- */

Hooks.on("canvasInit", function() {

  // Extend Diagonal Measurement
  SquareGrid.prototype.measureDistances = measureDistances;

  Token.prototype.getBarAttribute = getBarAttribute;
});

/* Add hook for the context menu over the rolled damage */
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

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
    return game.actors.entities.filter(o => {
      return o.items.filter(i => i._id === item._id).length > 0;
    })[0];
  }
  return null;
};


async function createT20Macro(data, slot) {
  console.log(data);
  if (data.type === "Pericia") {
    const item = data.data;
    const command = `game.tormenta20.rollSkillMacro("${item.label}","${data.subtype}");`;
    let macro = game.macros.entities.find(m => (m.name === item.label) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
        name: item.label,
        type: "script",
        command: command
      });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
  }
  if (data.type === "Item") {
    if (!("data" in data)) return ui.notifications.warn("Você só pode criar Macros para Ataques, Magias e Poderes. Você pode referenciar atributos e perícias com @. Ex.: @for ou @luta");
    const item = data.data;
    // const actor = getItemOwner(item);
    // Create the macro command
    const command = `game.tormenta20.rollItemMacro("${item.name}");`;

    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command: command,
        flags: {
          "tormenta20.itemMacro": true
        }
      });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
  }

}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
async function rollItemMacro(itemName, extra) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!actor) return ui.notifications.warn(`Selecione um personagem.`);
  if (!item) return ui.notifications.warn(`O personagem selecionado não possui um Item chamado ${itemName}`);
  // console.log(item);
  // Trigger the item roll
  await dice.prepRoll(event, item, actor);
}

async function rollSkillMacro(skillName, subtype) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  let skill;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  if (!actor) return ui.notifications.warn(`Selecione um personagem.`);
  if(subtype == "oficios" ){
    for ( let [t, sk] of Object.entries(actor.data.data.pericias["ofi"].mais) ) {
      if(sk.label === skillName){
        skill = sk;
        break;
      }
    }
  } else if(subtype == "custom" ) {
    for ( let [t, sk] of Object.entries(actor.data.data.periciasCustom) ) {
      if(sk.label === skillName){
        skill = sk;
        break;
      }
    }
  } else {
    for ( let [t, sk] of Object.entries(actor.data.data.pericias) ) {
      if(sk.label === skillName){
        skill = sk;
        break;
      }
    }
  }
  const item = {
    type:"pericia",
    label: skill.label,
    roll: `1d20+${skill.value}`
  }
  // Trigger the item roll
  await dice.prepRoll(event, item, actor);
}
