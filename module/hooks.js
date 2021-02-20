import { T20Conditions } from "./conditions/conditions.js";
import { endSegment } from "./apps/time-segment.js";
import { measureDistances, getBarAttribute } from "./canvas.js";
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
		Hooks.on("hotbarDrop", (bar, data, slot) => macros.createT20Macro(data, slot));

		// Determine whether a system migration is required and feasible
		if ( !game.user.isGM ) return;
		if (!game.settings.get("tormenta20", "systemMigrationVersion")) game.settings.set("tormenta20", "systemMigrationVersion", "1.0.02");

		const currentVersion = game.settings.get("tormenta20", "systemMigrationVersion") ? game.settings.get("tormenta20", "systemMigrationVersion") : "1.0.02";

		const NEEDS_MIGRATION_VERSION = "1.1.32";
		const COMPATIBLE_MIGRATION_VERSION = "1.1.30";
		const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
		if ( !needsMigration ) return;
		// Perform the migration
		if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
			const warning = `Sua versão do sistema Tormenta20 é muito antiga. A migração será feita, mas erros podem ocorrer.`;
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
		// Token.prototype.trueggleEffect = toggleEffect;
	});


	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	/* Effects/Conditions Hooks*/
	Hooks.on("preCreateActiveEffect", async (actor, effect, options) => {
		if(actor && effect && effect.flags?.t20?.condition){
			// ignore condi if already applyed
			if(actor.effects.find(i => i.data.label === effect.label)){
				if( effect.flags?.t20?.stack ){
					ActiveEffect.create(T20Conditions[effect.flags.t20.stack],actor).create();
					let aes = actor.effects.filter(i => i.data.label === effect.label);
					aes.forEach(ae => actor.deleteEmbeddedEntity("ActiveEffect", ae.id));
				}
				options.temporary = true;
			}
		}
	});
	Hooks.on("createActiveEffect", async (actor, effect, options) => {
		if(actor.effects.find(i => i.data.label === effect.label)) return false;
		if(actor && effect && effect.flags?.t20?.condition){
			// apply child conditions
			if (effect.flags?.t20?.childEffect?.length ) {
				effect.flags.t20.childEffect.forEach(function(ef){
					if (T20Conditions[ef]){
						ActiveEffect.create(T20Conditions[ef],actor).create();
					}
				});
			}
		}
	});
	Hooks.on("deleteActiveEffect", async (actor, effect, options) => {
		if(actor && effect && effect.flags?.t20?.condition){
			if ( effect.flags?.t20?.childEffect?.length) {
				effect.flags.t20.childEffect.forEach(function(ef){
					let label = T20Conditions[ef].label;
					let ae = actor.effects.find(i => i.data.label === label);
					if (ae) actor.deleteEmbeddedEntity("ActiveEffect", ae.id);
				})
			}
		}
	});

	/* Chat Hooks */
	Hooks.on("renderChatMessage", (app, html, data) => {
		// Optionally collapse the content
		if (game.settings.get("tormenta20", "autoCollapseItemCards")) html.find(".card-content").hide();
		if (game.settings.get("tormenta20", "applyButtonsInsideChat")){
			chat.ApplyButtons(app, html, data);
		}
	});
	/* Add hook for the context menu over the rolled damage */
	Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);

	Hooks.on("renderChatLog", (app, html, data) => ItemT20.chatListeners(html));
	Hooks.on("renderChatPopout", (app, html, data) => ItemT20.chatListeners(html));

	/* Add hook for End of Scene */
	Hooks.on("renderSidebarTab", async (app, html) => endSegment(app,html)) ;

	/* Measured Templates*/
	Hooks.on("createMeasuredTemplate", async (scene, template) => {
		console.log(scene);
		console.log(template);
		console.log(event);
		console.log(isCtrl(event));
		if( event.ctrlKey ){
			console.log("keep placing");
		}
	});
	// Hooks.on("_onClickLeft", async (scene, template) => {
	// 	console.log(scene);
	// 	console.log(template);
	// 	console.log(event);
	// 	console.log(isCtrl(event));
	// 	if( event.ctrlKey ){
	// 		console.log("keep placing");
	// 	}
	// });
}