import { T20Conditions } from "./conditions/conditions.js";
import { toggleEffect } from "./actor/condicoes.js";
import { endSegment } from "./apps/time-segment.js";
import { measureDistances, getBarAttribute } from "./canvas.js";
import { T20Config } from "./config.js";
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


		const NEEDS_MIGRATION_VERSION = "1.1.57";
		const COMPATIBLE_MIGRATION_VERSION = "1.1.30";
		const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);

		let buttons = {ok: {label: "Ok" }};
		let readyToMigrate = true;
		let msg = "<br><br><br>";
		
		if (needsMigration){
			buttons =  {sair: {label:"Ignorar", callback: () => {readyToMigrate=false} },
				atualizar: {label:"Atualizar", callback: ()=> {
					if ( !needsMigration || !readyToMigrate ) return;
					// Perform the migration
					if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
						const warning = `Sua versão do sistema Tormenta20 é muito antiga. A migração será feita, mas erros podem ocorrer.`;
						ui.notifications.error(warning, {permanent: true});
					}
					migrations.migrateWorld();
				} } };
			msg = "<p><b>É necessário atualizar, recomenda-se fazer backup antes de continuar. Se optar por não atualizar o sistema pode não funcionar corretamente.</b></p>"
		}
		if( !game.user.getFlag("tormenta20","startMsg") || game.user.getFlag("tormenta20","startMsg") < game.system.data.version ) {
			new Dialog({
				title: "Aviso",
				content: `<h2>Atualização 1.2.0.0</h2><p>Esta versão trás novidades! <ul><li>Efeitos: condições, efeitos temporários, buffs. Tudo aquilo que altera características de personagem;</li><li>Nem tudo foi adaptado ainda (são cerca de 800 itens entre poderes e magias). Alguns poderes iniciais das classes foram adaptados, e as magias iniciadas com A;</li><li>Aprimoramentos foram migrados para um tipo especial de efeito;</li><li>Condições foram refeitas;</li><li>Acesse <a href="https://vizael.gitlab.io/tormenta20-fvtt/" target="_blank">https://vizael.gitlab.io/tormenta20-fvtt/</a> para mais informações!</li></ul>${msg}<br>Vizael</p>`,
				buttons: buttons,
			}, {height: 400, width: 450, resizable: false }).render(true);
			game.user.setFlag("tormenta20","startMsg",game.system.data.version)
		}
	});	


	/* -------------------------------------------- */
	/*  Canvas Initialization                       */
	/* -------------------------------------------- */

	Hooks.on("canvasInit", function () {
		// Extend Diagonal Measurement
		canvas.grid.diagonalRule = game.settings.get("tormenta20", "diagonalMovement");
		SquareGrid.prototype.measureDistances = measureDistances;

		Token.prototype.getBarAttribute = getBarAttribute;
		Token.prototype.toggleEffect  = toggleEffect;
	});


	/* -------------------------------------------- */
	/*  Other Hooks                                 */
	/* -------------------------------------------- */

	// Render Sidebar
	Hooks.on("renderSidebarTab", (app, html) => {
		if (app instanceof Settings) {
			// Add changelog button
			let button = $(`<button>Ajuda</button>`);
			html.find("#game-details").append(button);
			button.click(() => {
				window.open("https://vizael.gitlab.io/tormenta20-fvtt/");
			});
		}
	});

	/* Effects/Conditions Hooks*/
	// Hooks.on("preCreateActiveEffect", async (actor, effect, options) => {
	// 	let condi = effect["flags.core.statusId"] ?? false;
		
	// 	if(condi && !effect.flags?.t20?.condition){
	// 		effect = T20Conditions[effect["flags.core.statusId"]] || effect;
	// 		options.temporary = true;
	// 		ActiveEffect.create(effect,actor).create();
	// 	}

	// 	if(effect.changes && effect.changes.find(ch => ch.key === "data.tamanho")){
	// 		let _changes = effect.changes.map(function(ch){
	// 			if (ch.key === "data.tamanho" && ch.mode === 0 ) {
	// 				const sizes = Object.keys( T20Config.tamanhos );
	// 				let teste = sizes.indexOf(actor.data.data.tamanho) + ch.value;
	// 				ch.mode = 5;
	// 				ch.value = sizes[teste];
	// 			}
	// 			return ch;
	// 		});
	// 		effect.changes = _changes;
	// 	}
		
	// 	if(actor && effect && effect.flags?.t20?.condition){
	// 		// ignore condi if already applyed
	// 		let find = actor.effects.find(i => i.data.label === effect.label);
	// 		let user = actor.owner;
	// 		if(actor.effects.find(i => i.data.label === effect.label)){
	// 			if( effect.flags?.t20?.stack ){
	// 				ActiveEffect.create(T20Conditions[effect.flags.t20.stack],actor).create();
	// 				let aes = actor.effects.filter(i => i.data.label === effect.label);
	// 				aes.forEach(ae => actor.deleteEmbeddedEntity("ActiveEffect", ae.id));
	// 			}
	// 			options.temporary = true;
	// 		}
	// 	}
	// });
	// Hooks.on("createActiveEffect", async (actor, effect, options) => {
	// 	console.log(actor.effects.find(i => i.data.label === effect.label))
	// 	if(actor.effects.find(i => i.data.label === effect.label)) return false;
	// 	if(actor && effect && effect.flags?.t20?.condition){
	// 		// apply child conditions
	// 		if (effect.flags?.t20?.childEffect?.length ) {
	// 			effect.flags.t20.childEffect.forEach(function(ef){
	// 				if (T20Conditions[ef]){
	// 					ActiveEffect.create(T20Conditions[ef],actor).create();
	// 				}
	// 			});
	// 		}
	// 	}
	// });
	// Hooks.on("deleteActiveEffect", async (actor, effect, options) => {
	// 	if(actor && effect && effect.flags?.t20?.condition){
	// 		if ( effect.flags?.t20?.childEffect?.length) {
	// 			effect.flags.t20.childEffect.forEach(function(ef){
	// 				let label = T20Conditions[ef].label;
	// 				let ae = actor.effects.find(i => i.data.label === label);
	// 				if (ae) actor.deleteEmbeddedEntity("ActiveEffect", ae.id);
	// 			})
	// 		}
	// 	}
	// });

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
}