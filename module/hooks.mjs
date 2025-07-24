import { endSegment } from "./apps/time-segment.mjs";
import * as chat from "./chat.mjs";
import * as macros from "./macros.mjs";

export default function () {
	/**
	 * Once the entire VTT framework is initialized, check to see if we should perform a data migration
	 */
	Hooks.once("ready", async function () {
		// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
		Hooks.on("hotbarDrop", (bar, data, slot) => {
			if (["Item", "ActiveEffect"].includes(data.type)) {
				macros.createT20Macro(data, slot);
				return false;
			}
		});

		ui.compendium.compileSearchIndex();

		if (game.user.isGM) {
			const systemMigrationVersion = game.settings.get("tormenta20", "systemMigrationVersion");
			// Define o padrão dos token de PJ
			if (systemMigrationVersion < "1.5.000") {
				const prototypeTokenOverrides = game.settings.get("core", "prototypeTokenOverrides");
				await game.settings.set(
					"core",
					"prototypeTokenOverrides",
					foundry.utils.mergeObject(prototypeTokenOverrides.toObject(), {
						character: { disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, sight: { enabled: true } }
					})
				);
			}
			if (systemMigrationVersion && systemMigrationVersion < "1.5.006") {
				const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
				const consertaAtores = async (actors, pack) => {
					for (const actor of actors) {
						if (actor.type !== "npc") continue;
						const treino = actor.treino;
						const changes = {};
						try {
							for (const pericia of Object.keys(CONFIG.T20.resistencias)) {
								const { outros, value } = actor.system.pericias[pericia];
								const newBonus = 2 * outros - value;
								changes[`system.pericias.${pericia}.outros`] = newBonus;
							}
							if (actor.items.size) {
								const pericias = new Set();
								const bonus = {};

								for (const arma of actor.itemTypes.arma) {
									const rolls = arma.toObject().system.rolls;
									const index = rolls.findIndex((r) => r.type === "ataque");
									if (index === -1) continue;
									const ataque = rolls[index];
									const pericia = ataque.parts[1][0];
									pericias.add(pericia);
									if (!bonus[pericia]) bonus[pericia] = [];
									bonus[pericia].push(ataque.parts[2][0]);
								}
								for (const pericia of pericias) {
									const value = actor.system.pericias[pericia].value;
									const menorBonus = Math.min(...bonus[pericia]);
									const newBonus = menorBonus - value - treino;
									changes[`system.pericias.${pericia}.treinado`] = true;
									changes[`system.pericias.${pericia}.outros`] = newBonus;
								}
								for (const arma of actor.itemTypes.arma) {
									const rolls = arma.toObject().system.rolls;

									const index = rolls.findIndex((r) => r.type === "ataque");
									if (index === -1) continue;
									const ataque = rolls[index];
									const pericia = ataque.parts[1][0];
									ataque.parts[2][0] = Number(ataque.parts[2][0]) - Math.min(...bonus[pericia]);
									await arma.update({ [`system.rolls`]: rolls });
								}
							}
							await actor.update(changes);
						} catch (err) {
							if (pack) {
								err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
							} else err.message = `Falha ao migrar o ator ${actor.name}`;
							console.error(err);
						}
					}
				};
				ui.notifications.info(
					"Iniciando conserto de resistências e ataques em Ameaças. Espere um momento e não feche o jogo",
					{
						console: false,
						permanent: true
					}
				);
				for (const pack of packs) {
					const wasLocked = pack.locked;
					try {
						await pack.configure({ locked: false });
						const actors = await pack.getDocuments();
						consertaAtores(actors, pack);
					} finally {
						await pack.configure({ locked: wasLocked });
					}
				}
				consertaAtores(game.actors.filter((a) => a.type === "npc"));
				ui.notifications.info("Conserto concluído", { console: false, permanent: true });
			}
			if (systemMigrationVersion && systemMigrationVersion < "1.5.007") {
				const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
				const consertaAtores = async (actors, pack) => {
					for (const actor of actors) {
						if (actor.type !== "npc") continue;
						const changes = {};
						try {
							if (actor.system.atributos.des.value !== 0) {
								const defBase = actor.system.attributes.defesa.base;
								changes["system.attributes.defesa.base"] = defBase - actor.system.atributos.des.value;
							}
							await actor.update(changes);
						} catch (err) {
							if (pack) {
								err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
							} else err.message = `Falha ao migrar o ator ${actor.name}`;
							console.error(err);
						}
					}
				};
				ui.notifications.info("Iniciando conserto de defesas em Ameaças. Espere um momento e não feche o jogo", {
					console: false,
					permanent: true
				});
				for (const pack of packs) {
					const wasLocked = pack.locked;
					try {
						await pack.configure({ locked: false });
						const actors = await pack.getDocuments();
						consertaAtores(actors, pack);
					} finally {
						await pack.configure({ locked: wasLocked });
					}
				}
				consertaAtores(game.actors.filter((a) => a.type === "npc"));
				ui.notifications.info("Conserto concluído", { console: false, permanent: true });
			}
			if (systemMigrationVersion && systemMigrationVersion < "1.5.010") {
				const packs = game.packs.filter((p) => p.metadata.type === "Actor" && p.metadata.packageType !== "system");
				const consertaAtores = async (actors, pack) => {
					for (const actor of actors) {
						if (!actor.system.pericias) continue;
						const changes = {};
						try {
							const initial = new tormenta20.data.fields.SkillData();
							const cls = CONFIG.Actor.dataModels[actor.type];
							if (actor.system.pericias.ofi0) changes["system.pericias.-=ofi0"] = null;
							if (actor.system.pericias._pc0) changes["system.pericias.-=_pc0"] = null;
							if (
								actor.system.pericias.acro?.st
								&& actor.system.pericias.reli?.pda
								&& actor.system.pericias.guer?.pda
							) {
								for (const [key, value] of Object.entries(actor.system.pericias)) {
									changes[`system.pericias.${key}`] = cls._initialSkillValue(key, initial, value);
								}
							}
							for (const key of CONFIG.T20.oficios) {
								if (!actor.system.pericias[key]) {
									changes[`system.pericias.${key}`] = cls._initialSkillValue(key, initial, CONFIG.T20.pericias[key]);
								}
							}
							await actor.update(changes);
						} catch (err) {
							if (pack) {
								err.message = `Falha ao migrar o ator ${actor.name} no compêndio ${pack.collection}: ${err.message}`;
							} else err.message = `Falha ao migrar o ator ${actor.name}`;
							console.error(err);
						}
					}
				};
				ui.notifications.info(
					"Iniciando migração do sistema Tormenta20 1.5.010. Espere um momento e não feche o jogo",
					{
						console: false,
						permanent: true
					}
				);
				for (const pack of packs) {
					const wasLocked = pack.locked;
					try {
						await pack.configure({ locked: false });
						const actors = await pack.getDocuments();
						consertaAtores(actors, pack);
					} finally {
						await pack.configure({ locked: wasLocked });
					}
				}
				consertaAtores(game.actors.filter((a) => !!a.system.pericias));
				ui.notifications.info("Migração concluída", { console: false, permanent: true });
			}
			game.actors
				.filter((f) => !f._stats.systemVersion || f._stats.systemVersion < "1.5.000")
				.forEach((actor) => {
					actor.items
						.filter((item) => item.flags?.favorito)
						.forEach((item) => item.setFlag("tormenta20", "favorito", true));
				});
			let oldActors = game.actors.filter((f) => !f._stats.systemVersion || f._stats.systemVersion < "1.4.100");
			// Migration
			for (const actor of oldActors) {
				let updateData = {};
				for (let [key, ability] of Object.entries(actor._source.system.atributos)) {
					updateData[`system.atributos.${key}.base`] = Math.floor((ability.value - 10) / 2);
					updateData[`system.atributos.${key}.bonus`] = ability.bonus !== 0 ? ability.bonus / 2 : 0;
				}

				if (actor.type === "npc") {
					updateData["system.attributes.defesa.base"] = 10 + actor._source.system.attributes.defesa.outros;
					updateData["system.attributes.defesa.outros"] = 0;
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
	Hooks.on("renderSettings", (app, html) => {
		const documentation = html.querySelector(".documentation.flexcol");
		const section = document.createElement("section");
		section.classList.add("flexcol");

		const divider = document.createElement("h4");
		divider.classList.add("divider");
		divider.textContent = "Visite";

		const jambo = document.createElement("a");
		jambo.classList.add("button");
		jambo.href = "https://jamboeditora.com.br/";
		jambo.rel = "nofollow noopener";
		jambo.target = "_blank";
		jambo.textContent = "Jambô Editora";

		documentation.insertAdjacentElement("afterend", section);
		section.appendChild(divider);
		section.appendChild(jambo);
	});

	/* Chat Hooks */
	Hooks.on("renderChatMessageHTML", (app, html, data) => {
		chat.hideDieFlavor(app, html, data);
		chat.ApplyButtons(app, html, data);
		// Highlight critical success or failure die
		// chat.highlightCriticalSuccessFailure(app, html, data);

		// Optionally collapse the content
		const cardContent = html.querySelector(".card-content");
		const cardDamageDetails = html.querySelector(".card-damage-details");
		if (cardContent && (!cardContent.textContent.trim() || game.settings.get("tormenta20", "autoCollapseItemCards"))) {
			cardContent.style.display = "none";
		}

		if (cardDamageDetails) cardDamageDetails.style.display = "none";

		html
			.querySelectorAll(".item-name")
			.forEach((el) => el.addEventListener("click", chat._onChatCardToggleContent.bind(this)));
		html
			.querySelectorAll(".chat-message")
			.forEach((el) => el.addEventListener("click", chat._onChatCardToggleDamage.bind(this)));
		html
			.querySelectorAll(".chat-apply-ae")
			.forEach((el) => el.addEventListener("click", chat._onChatCardApplyEffect.bind(this)));
		html
			.querySelectorAll(".chat-place-template")
			.forEach((el) => el.addEventListener("click", chat._onChatPlaceTemplate.bind(this)));

		html
			.querySelectorAll(".apply-dmg")
			.forEach((el) => el.addEventListener("click", chat._onChatApplyDamage.bind(this)));
		html
			.querySelectorAll(".chat-spend-mana")
			.forEach((el) => el.addEventListener("click", chat._onChatSpendMana.bind(this)));
	});

	// Disabling the setting with a tooltip instead of removing it so we don't get users asking in core support why these core settings can't be found anywhere
	Hooks.on("renderSettingsConfig", (app, html) => {
		const disableSetting = (s) => {
			const element = html.querySelector(`[name="core.${s}"]`);
			element.disabled = true;
			element.closest(".form-group").dataset.tooltipText =
				"Configuração desativada porque o sistema não usa esta configuração.";
			element.closest(".form-group").dataset.tooltipDirection = "CENTER";
		};
		disableSetting("gridTemplates");
		disableSetting("coneTemplateType");
	});

	/* Add hook for End of Scene */
	Hooks.on("renderCombatTracker", async (app, html) => endSegment(app, html));

	/* Debug hook */
	// Hooks.on("modifyTokenAttribute", async (attribute, value, isDelta, isBar) => {
	// console.log("Debug hook: Debug hook");
	// }) ;
	/* Measured Templates*/
	// Hooks.on("preCreateActiveEffect", (ActiveEffect, object, options, userId) => {

	// });

	Hooks.on("closeCompendiumT20", (compendium, html) => {
		compendium.collection.apps = [new Compendium(compendium.collection)];
	});

	Hooks.on("renderDialogV2", (_dialog, html) => {
		if (html.classList.contains("dialog-item-create")) {
			const select = html.querySelector("select[name=type]");
			const option = select?.querySelector("option");
			if (select && option) {
				const localize = (str) => game.i18n.localize(`T20.Item.CreationDialog.Categories.${str}`);
				select.append(extractOptGroup(select, localize("Physical"), ["arma", "equipamento", "consumivel", "tesouro"]));
				select.append(extractOptGroup(select, localize("Character"), ["classe", "poder", "race"]));
				select.append(extractOptGroup(select, localize("Other")));
				option.selected = true;
			}
		}
	});
}

function extractOptGroup(select, label, types) {
	const options = select.querySelectorAll(":scope > option");
	const filtered = [...options.values()].filter((option) => !types || types.includes(option.value));
	const optgroup = document.createElement("optgroup");
	optgroup.label = label;
	for (const physicalElement of filtered) {
		optgroup.appendChild(physicalElement);
	}

	return optgroup;
}
