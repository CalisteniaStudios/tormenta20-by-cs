import { T20Conditions } from "./conditions/conditions.js";
import { toggleEffect } from "./actor/condicoes.js";
import { endSegment } from "./apps/time-segment.js";
import { measureDistances } from "./canvas.js";
import ItemT20 from "./item/entity.js";
import * as chat from "./chat.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";

export default function () {

	/**
	* Once the entire VTT framework is initialized, check to see if we should perform a data migration
	*/
	Hooks.once("ready", async function () {
		console.log(Date.now());
		// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
		Hooks.on("hotbarDrop", (bar, data, slot) => macros.createT20Macro(data, slot));

		// Determine whether a system migration is required and feasible
		if ( !game.user.isGM ) return;
		new Dialog({
			"title": `Atualizar Sistema`,
			"content": `<p style="text-align:center">Realizar a atualização do Sistema? (Não é possível desfazer)</p>`,
			"buttons": {
				"no": {
					"icon": '<i class="fas fa-times"></i>',
					"label": 'Cancelar'
				},
				"yes": {
					"icon": '<i class="fas fa-check"></i>',
					"label": 'Atualizar',
					"callback": (html) => {
						migrations.migrateWorld();
					}
				},
			},
			"default": 'yes',
		}).render(true);
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
		// Display action buttons
		if (game.settings.get("tormenta20", "applyButtonsInsideChat")){
			chat.ApplyButtons(app, html, data);
		}

		// Highlight critical success or failure die
		chat.highlightCriticalSuccessFailure(app, html, data);

		// Optionally collapse the content
		if (game.settings.get("tormenta20", "autoCollapseItemCards")) html.find(".card-content").hide();
	});
	
	/* Add hook for the context menu over the rolled damage */
	Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);

	Hooks.on("renderChatLog", (app, html, data) => ItemT20.chatListeners(html));
	Hooks.on("renderChatPopout", (app, html, data) => ItemT20.chatListeners(html));

	/* Add hook for End of Scene */
	Hooks.on("renderSidebarTab", async (app, html) => endSegment(app,html)) ;

	/* Measured Templates*/
}