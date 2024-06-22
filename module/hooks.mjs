import { toggleEffect } from "./conditions/condicoes.mjs";
import { endSegment } from "./apps/time-segment.mjs";
import { measureDistances } from "./pixi/canvas.mjs";
import ItemT20 from "./documents/item.mjs";
import * as chat from "./chat.mjs";
import * as macros from "./macros.mjs";

export default function () {

	/**
	* Once the entire VTT framework is initialized, check to see if we should perform a data migration
	*/
	Hooks.once("ready", async function () {
		
		// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
		Hooks.on("hotbarDrop", (bar, data, slot) => {
			if ( ["Item", "ActiveEffect"].includes(data.type) ) {
				macros.createT20Macro(data, slot);
				return false;
			}
		});

		
		if ( game.user.isGM ) { 
			let oldActors = game.actors.filter( f => !f._stats.systemVersion || f._stats.systemVersion < '1.4.100' );
			// Migration
			for (const actor of oldActors) {
				let updateData = {};
				for (let [key, ability] of Object.entries(actor._source.system.atributos)) {
					updateData[`system.atributos.${key}.base`] = Math.floor((ability.value - 10) / 2);
					updateData[`system.atributos.${key}.bonus`] = ability.bonus != 0 ? ability.bonus/2 : 0;
				}
				
				if (actor.type == 'npc') {
					updateData['system.attributes.defesa.base'] = 10 + actor._source.system.attributes.defesa.outros;
					updateData['system.attributes.defesa.outros'] = 0;
				}
				await actor.update(updateData);
			}
			return game.settings.set("tormenta20", "systemMigrationVersion", game.system.version);
		}
		
	});

	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	// Render Sidebar
	Hooks.on("renderSidebarTab", (app, html) => {
		if (app instanceof Settings) {
			// Add Butons
			// Wiki
			let wiki = $(`<button>Ajuda T20</button>`);
			html.find("#game-details").append(wiki);
			wiki.click(() => {
				window.open("https://vizael.gitlab.io/tormenta20-fvtt/");
			});
			// JamboEditora
			let jambo = $(`<button>JamboEditora</button>`);
			html.find("#game-details").append(jambo);
			jambo.click(() => {
				window.open("https://jamboeditora.com.br/");
			});
		}
	});

	/* Chat Hooks */
	Hooks.on("renderChatMessage", (app, html, data) => {
		
		chat.hideDieFlavor(app, html, data);
		chat.ApplyButtons(app, html, data);
		// Highlight critical success or failure die
		// chat.highlightCriticalSuccessFailure(app, html, data);

		// Optionally collapse the content
		if (game.settings.get("tormenta20", "autoCollapseItemCards")) html.find(".card-content").hide();

		if ( html.find(".card-damage-details") ) html.find(".card-damage-details").hide();
	});
	
	/* Add hook for the context menu over the rolled damage */
	Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);

	Hooks.on("renderChatLog", (app, html, data) => chat.chatListeners(html));
	Hooks.on("renderChatPopout", (app, html, data) => chat.chatListeners(html));

	/* Add hook for End of Scene */
	Hooks.on("renderSidebarTab", async (app, html) => endSegment(app,html)) ;

	/* Debug hook */
	// Hooks.on("modifyTokenAttribute", async (attribute, value, isDelta, isBar) => {
	//console.log("Debug hook: Debug hook");
	// }) ;
	/* Measured Templates*/
	// Hooks.on("preCreateActiveEffect", (ActiveEffect, object, options, userId) => {
		
	// });

	Hooks.on("closeCompendiumT20", (compendium, html) => {
		compendium.collection.apps = [ new Compendium(compendium.collection) ];
	});
	
	
	/* -------------------------------------------- */
	/*  Canvas Initialization                       */
	/* -------------------------------------------- */

	Hooks.on("canvasInit", function () {
		// Extend Diagonal Measurement
		if ( game.version.startsWith('11.') ) {
			canvas.grid.diagonalRule = game.settings.get("tormenta20", "diagonalMovement");
			SquareGrid.prototype.measureDistances = measureDistances;
		}
	});
}