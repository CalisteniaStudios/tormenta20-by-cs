import { T20Conditions } from "./conditions/conditions.js";
import { toggleEffect } from "./actor/condicoes.js";
import { endSegment } from "./apps/time-segment.js";
import { measureDistances } from "./canvas.js";
import ItemT20 from "./item/entity.js";
import * as chat from "./chat.js";
import * as macros from "./macros.js";

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
	});


	/* -------------------------------------------- */
	/*  Canvas Initialization                       */
	/* -------------------------------------------- */

	Hooks.on("canvasInit", function () {
		// Extend Diagonal Measurement
		canvas.grid.diagonalRule = game.settings.get("tormenta20", "diagonalMovement");
		SquareGrid.prototype.measureDistances = measureDistances;
	});


	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	// Render Sidebar
	Hooks.on("renderSidebarTab", (app, html) => {
		if (app instanceof Settings) {
			// Add changelog button
			let button = $(`<button>Ajuda T20</button>`);
			html.find("#game-details").append(button);
			button.click(() => {
				window.open("https://vizael.gitlab.io/tormenta20-fvtt/");
			});
		}
	});

	/* Chat Hooks */
	Hooks.on("renderChatMessage", (app, html, data) => {
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
	// 	console.log("Debug hook: Debug hook");
	// }) ;
	/* Measured Templates*/
	// Hooks.on("preCreateActiveEffect", (ActiveEffect, object, options, userId) => {
		
	// });
}