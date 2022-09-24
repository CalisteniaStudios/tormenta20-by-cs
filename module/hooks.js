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
		
		// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
		Hooks.on("hotbarDrop", (bar, data, slot) => {
			if ( ["Item", "ActiveEffect"].includes(data.type) ) {
				macros.createT20Macro(data, slot);
				return false;
			}
		});

		// Determine whether a system migration is required and feasible
		if ( !game.user.isGM ) return;
		const currentVersion = game.settings.get("tormenta20", "systemMigrationVersion");
		const NEEDS_MIGRATION_VERSION = "1.2.0.21";
		const COMPATIBLE_MIGRATION_VERSION = "1.2.0.0";
		const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
		if ( !currentVersion && totalDocuments === 0 ) return game.settings.set("tormenta20", "systemMigrationVersion", game.system.data.version);

		const needsMigration = !currentVersion || isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
		if ( !needsMigration ) return;

		// Perform the migration
		if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
			const warning = `Seu mundo tem uma versão muito antiga do sistema. A migração será feita, mas erros podem ocorrer.`;
			ui.notifications.error(warning, {permanent: true});
		}
		
		new Dialog({
			"title": `Atualizar Sistema`,
			"content": `<h2>Atualização 0.8.8 <i class="fas fa-exclamation-triangle"></i></h2>
			<p style="text-align:center">O sistema será migrado para a versão v0.8.8 do Foundry, o processo não pode ser desfeito. <b>É recomendável que faça um backup de seu mundo antes antes de prosseguir</b></p>
			<p style="text-align:center">Realizar a atualização do Sistema?</p>`,
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