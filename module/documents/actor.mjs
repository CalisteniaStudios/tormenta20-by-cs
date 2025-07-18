import ItemT20 from "../documents/item.mjs";
// import { T20 } from '../config.mjs';
import AbilityUseDialog from "../apps/ability-use-dialog.mjs";
import { applyOnUseEffects } from "../apps/ability-use.mjs";
import ChoicesDialog from "../apps/choices-dialog.mjs";
import { d20Roll, simplifyRollFormula } from "../dice/dice.mjs";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {
	static getDefaultArtwork(itemData) {
		let img = this.DEFAULT_ICON;
		if (itemData.type === "npc") {
			img = "systems/tormenta20/icons/svg/orc-head.svg";
		} else if (itemData.type === "simple") {
			img = "systems/tormenta20/icons/svg/portrait.svg";
		} else if (itemData.type === "bases") {
			img = "systems/tormenta20/icons/svg/bases.svg";
		} else if (itemData.type === "hazard") {
			img = "icons/svg/hazard.svg";
		}
		return { img, texture: { src: img } };
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get aprimoramentosTypes() {
		const tipos = ["arma", "atributo", "consumivel", "magia", "pericia", "poder"];
		const types = Object.fromEntries(game.system.documentTypes.Item.map((t) => [t, []]));
		for (let i of this.effects.values()) {
			if (!i.getFlag("tormenta20", "onuse")) continue;
			for (let j of tipos) {
				if (i.getFlag("tormenta20", j)) types[i.type].push(i);
			}
		}
		return types;
	}

	get modifiedFields() {
		return this.effects.reduce((acc, ef) => {
			if (ef.modifiesActor) {
				for (let ch of ef.changes) {
					if ([3, 4].includes(ch.value)) continue;
					if (!acc[ch.key]) acc[ch.key] = [];
					acc[ch.key].push({ label: ef.name, value: ch.value, mode: ch.mode });
				}
			}
			return acc;
		}, {});
	}

	/* -------------------------------------------- */

	get defenseFormula() {
		// later ...@bonus
		if (this.type === "character") {
			return ["@base", "@atributo", "@armadura", "@escudo", "@outros", "@condi"];
		}
		return ["@base", "@outros", "@condi"];
	}

	/* -------------------------------------------- */

	get dcFormula() {
		// later ...@bonus
		if (this.type === "character") {
			return ["@base", "@meionivel", "@atributo", "@outros"];
		} else if (this.type === "npc") {
			return ["@base", "@outros"];
		}
		return ["@base", "@outros"];
	}

	/* -------------------------------------------- */

	get encumbranceFormula() {
		// later ...@bonus
		if (this.type === "character") {
			return ["@base", "@atributo"];
		} else if (this.type === "npc") {
			return ["@base"];
		}
		return ["@base"];
	}

	/* -------------------------------------------- */

	get nivel() {
		return this.items.reduce((acc, item) => {
			if (item.type === "classe") {
				const classLevels = parseInt(item.system.niveis) || 1;
				acc += classLevels;
			}
			return acc;
		}, 0);
	}

	/* -------------------------------------------- */

	get pda() {
		return this.itemTypes.equipamento.reduce((acc, item) => {
			if (item.system.equipado) {
				acc += parseInt(item.system.armadura.penalidade);
			}
			return acc;
		}, 0);
	}

	get treino() {
		return this.system.attributes?.treino;
	}

	/* -------------------------------------------- */
	/*  Data Preparation                            */
	/* -------------------------------------------- */

	/** @override */
	prepareData() {
		super.prepareData();

		// Iterate over owned items and recompute attributes that depend on prepared actor data
		this.items.forEach((item) => item.prepareFinalAttributes());
	}

	/* -------------------------------------------- */

	/**
	 * Calculate HP and MP recovery by rest.
	 * @private
	 */
	async descanso(modificador = 1, modPV = 0, modPM = 0, curaCP = false, curaAC = false, toChat = true) {
		let descricao = "";
		const nivel = this.system.attributes.nivel.value;
		let rec = {
			pv: 0,
			pm: 0
		};

		let cp = curaCP ? 2 : 1;
		let ac = curaAC ? 2 : 1;
		let recuperarPV = Math.floor(nivel * (modificador + modPV) * cp);
		rec.pv = recuperarPV;
		await this.modifyTokenAttribute("attributes.pv", recuperarPV, true, true);

		let recuperarPM = Math.floor(nivel * (modificador + modPM) * ac);
		rec.pm = recuperarPM;
		await this.modifyTokenAttribute("attributes.pm", recuperarPM, true, true);

		descricao = `${this.name} recuperou ${rec.pv} PV e ${rec.pm} PM.`;

		if (!toChat) return descricao;

		let content = {
			item: {
				name: game.i18n.localize("T20.Rest"),
				img: "icons/svg/regen.svg"
			},
			system: {
				description: {
					value: `<p>${descricao}</p>`
				}
			}
		};
		let template = "systems/tormenta20/templates/chat/chat-card.hbs";
		const html = await foundry.applications.handlebars.renderTemplate(template, content);
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			content: html
		};
		ChatMessage.create(chatData);
	}

	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/** @inheritdoc */
	getRollData() {
		// const data = foundry.utils.deepClone(super.getRollData());
		const data = { ...this.system };
		// super.getRollData();
		// Set abilities abbreviation
		for (let abl in data.atributos) {
			data[abl] = data.atributos[abl].value;
		}

		// Set level abbreviation
		data.nivel = Number(this.system.attributes?.nivel?.value || 1);
		data.patamar = CONFIG.T20.patamares.findIndex((nivel) => data.nivel <= nivel) + 1;
		data.meionivel = Math.floor(data.nivel / 2) || 0;
		if (this.type === "npc") {
			let nd = data.attributes.nd;
			const crData = T20.NPCParams(nd);
			data.ndtreinado = crData.topskill || 0;
			data.ndsemtreino = crData.botskill || 0;
		}
		// Set class level
		data.nvl = this.items.reduce(function (cn, it) {
			if (it.type === "classe") cn[it.name.slugify()] = it.system.niveis;
			return cn;
		}, {});
		// Set power type modifiers (ie.: tormenta, distinction)
		const powers = {};
		for (const item of this.items.values()) {
			const tags = item.system?.rolltags ?? [];
			for (const tag of tags) {
				const key = tag.capitalize();
				powers[key] = (powers[key] ?? 0) + 1;
			}
		}

		for (const [k, v] of Object.entries(powers)) {
			const slug = k.slugify();
			powers[slug.toLowerCase()] = v;

			for (const divisor of [2, 3, 4]) {
				const val = Math.floor((v - 1) / divisor);
				powers[`${slug.capitalize()}${divisor}`] = val;
				powers[`${slug.toLowerCase()}${divisor}`] = val;
			}
		}
		foundry.utils.mergeObject(data, powers);

		data.circulo = this.items.filter((i) => i.type === "magia").reduce((max, m) => Math.max(max, m.system.circulo), 0);

		// Set casting ability
		/* TODO CLASS SPELLBOOK */
		const atbchave = this.system.attributes.conjuracao;
		if (atbchave) data.atributoChave = this.system.atributos[atbchave]?.value ?? 0;

		// Set defense bonuses modifiers
		if (this.system.defesa) {
			let defMods = this.system.modificadores?.defesa || {};
			data.armadura = defMods.armadura || 0;
			data.armaduraLeve = defMods.armaduraLeve || 0;
			data.armaduraPesada = defMods.armaduraPesada || 0;
			data.escudo = defMods.escudo || 0;
		}

		// Set skill bonuses modifiers
		if (this.system.pericias) {
			let skillMods = this.system.modificadores?.pericias || {};
			const size = this.system.tracos.tamanho;

			data.treino = this.system.attributes?.treino || 0;
			data.tamanho = CONFIG.T20.sizeModifiers[size];
			data.pda = this.system.attributes?.defesa.pda || 0;

			data.pericia = simplifyRollFormula(skillMods.geral?.filter(Boolean).join(" + "), data) || 0;
			data.semataque = simplifyRollFormula(skillMods.semataque?.filter(Boolean).join(" + "), data) || 0;
			data.ataque = simplifyRollFormula(skillMods.ataque?.filter(Boolean).join(" + "), data) || 0;
			data.resistencia = simplifyRollFormula(skillMods.resistencia?.filter(Boolean).join(" + "), data) || 0;

			// Set ability bonuses modifiers
			let ablMods = this.system.modificadores?.atributos || {};
			data.atributo = simplifyRollFormula(ablMods.geral?.filter(Boolean).join(" + "), data) || 0;
			data.fisicos = simplifyRollFormula(ablMods.fisicos?.filter(Boolean).join(" + "), data) || 0;
			data.mentais = simplifyRollFormula(ablMods.mentais?.filter(Boolean).join(" + "), data) || 0;

			// Set damage bonuses modifiers
			let dmgMods = this.system.modificadores?.dano || {};
			data.dano = simplifyRollFormula(dmgMods.geral?.filter(Boolean).join(" + "), data) || 0;
			data.danoMagico = simplifyRollFormula(dmgMods.mag?.filter(Boolean).join(" + "), data) || 0;
			data.danoCAC = simplifyRollFormula(dmgMods.cac?.filter(Boolean).join(" + "), data) || 0;
			data.danoAD = simplifyRollFormula(dmgMods.ad?.filter(Boolean).join(" + "), data) || 0;
			data.danoALQ = simplifyRollFormula(dmgMods.alq?.filter(Boolean).join(" + "), data) || 0;

			let healMods = this.system.modificadores?.cura || {};
			data.curaGeral = simplifyRollFormula(healMods.geral?.filter(Boolean).join(" + "), data) || 0;
			data.curaMagica = simplifyRollFormula(healMods.mag?.filter(Boolean).join(" + "), data) || 0;
		}

		return data;
	}

	/**
	 * Return the amount of experience required to gain a certain character level.
	 * @param level {Number}	The desired level
	 * @return {Number}			 The XP required
	 */
	getLevelExp(nivel) {
		const niveis = T20.xpPorNivel;
		return niveis[Math.min(nivel, niveis.length - 1)];
	}

	/* -------------------------------------------- */

	/**
	 * Add a list of itens to the actor
	 * TODO at Advancement
	 * @param {Array.<ItemT20>} itens - The itens being added to the Actor;
	 * @returns {Promise<ItemT20[]>}
	 **/
	async addEmbeddedItems(items) {
		let itemsToAdd = items;
		if (itemsToAdd.length === 0) return;
		// create the selected items with this actor as parent
		return ItemT20.createDocuments(
			itemsToAdd.map((i) => i.toJSON()),
			{ parent: this }
		);
	}

	/**
	 * Update Actor Attributes following NPC builder guide
	 * @param {String} cr    - The Challenge Rating to get values from;
	 * @param {String} attr  - The attribute being changed;
	 */
	// _setCRAttrs(cr, attr) {
	// 	if (this.type != "npc") return;
	// 	let updateData = {};
	// 	const crData = CONFIG.T20.NPCParams(cr);
	// 	let skills = {};
	// 	skills.fort = this.system.builder.attributes.fort ?? {};
	// 	skills.refl = this.system.builder.attributes.refl ?? {};
	// 	skills.vont = this.system.builder.attributes.vont ?? {};
	// 	const ranks = ["botsave", "midsave", "topsave"];
	// 	const attrs = ["attack", "damage", "defense", "hp", "dc", "topsave", "midsave", "botsave", "skills"];

	// 	if (attr === "all") {
	// 		for (let att of attrs) {
	// 			updateData[`system.builder.attributes.${att}.value`] = crData[att];
	// 			updateData[`system.builder.attributes.${att}.cr`] = cr;
	// 		}
	// 	} else if (attr === "skills") {
	// 		updateData[`system.builder.attributes.${attr}.value`] = crData.topskill;
	// 		updateData[`system.builder.attributes.${attr}.cr`] = cr;
	// 	} else {
	// 		updateData[`system.builder.attributes.${attr}.value`] = crData[attr];
	// 		updateData[`system.builder.attributes.${attr}.cr`] = cr;
	// 	}
	// 	if (["all", "topsave", "midsave", "botsave"].includes(attr)) {
	// 		for (let [key, skill] of Object.entries(skills)) {
	// 			let r = skill.rank ?? 0;
	// 			if (attr === "all" || attr === ranks[r]) {
	// 				updateData[`system.builder.attributes.${key}.value`] = crData[ranks[r]];
	// 				updateData[`system.builder.attributes.${key}.cr`] = cr;
	// 			}
	// 		}
	// 	}
	// 	this.update(updateData);
	// }

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		// console.error("_preCreate");
		// SkillSet
		const system = game.settings.get("tormenta20", "gameSystem");
		const updateData = {};
		switch (system) {
			case "Skyfall":
				// const skills = foundry.utils.mergeObject(this.system.pericias, {
				// 	defe: { value: 0, atributo: "des" },
				// 	ocul: { value: 0, atributo: "int" },
				// });
				// delete skills.mist;

				// this.update({ "system.pericias": skills });
				break;
			default:
				if (!this._stats || this._stats.systemVersion < "1.4.100") {
					// UPDATE ABILITIES TO GOTY
					for (let [key, ability] of Object.entries(this._source.system.atributos)) {
						updateData[`system.atributos.${key}.base`] = Math.floor((ability.value - 10) / 2);
						if (ability.bonus !== 0) updateData[`system.atributos.${key}.bonus`] = ability.bonus / 2;
					}
					// UPDATE NPC DEFENSE TO GOTY
					if (this.type === "npc") {
						updateData["system.attributes.defesa.base"] = 10 + this._source.system.attributes.defesa.outros;
						updateData["system.attributes.defesa.outros"] = 0;
					}
				}
				this.updateSource(updateData);
				break;
		}
		const sourceId = this._stats?.compendiumSource;
		if (!sourceId?.startsWith("Compendium.")) {
			if (["character", "bases"].includes(this.type)) {
				updateData.prototypeToken = { actorLink: true };
			}
		}
		this.updateSource(updateData);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		// console.log(foundry.utils.flattenObject(changed));
		await super._preUpdate(changed, options, user);
		if ("pv" in (this.system.attributes || {})) {
			foundry.utils.setProperty(options, "tormenta20.pv", {
				...this.system.attributes.pv
			});
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, userId) {
		super._onUpdate(changed, options, userId);
		/* Check Encumbered Status and Add/Remove its ActiveEffect */
		if (game.userId === userId) this._checkEncumbered();

		const { pv } = options?.tormenta20 || {};
		if (pv) {
			const curr = this.system.attributes.pv;
			const changes = {
				pv: curr.value - pv.value,
				temp: curr.temp - pv.temp
			};
			changes.total = changes.pv + changes.temp;
			if (Number.isInteger(changes.total) && changes.total !== 0) this._displayTokenEffect(changes);
		}
	}

	_checkEncumbered() {
		if (this.type == "character") {
			const ef = this.effects.find((ef) => ef.statuses.has("sobrecarregado"));
			const wasEncumbered = Boolean(ef);
			const isEncumbered = this.system.attributes?.carga?.encumbered;
			if (isEncumbered != wasEncumbered) {
				if (isEncumbered && !ef) {
					this.createEmbeddedDocuments("ActiveEffect", [T20.conditions.sobrecarregado]);
				} else if (!isEncumbered && ef) {
					this.deleteEmbeddedDocuments("ActiveEffect", [ef._id]);
				}
			}
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateDescendantDocuments(parent, collection, data, options, userId) {
		await super._preCreateDescendantDocuments(parent, collection, data, options, userId);
		if (game.userId !== userId) return;
		// Show chat message if condition;
		options.toChat = options.toChat === undefined ? true : options.toChat;
		if (collection === "effects" && options.toChat) {
			const showCard = game.settings.get("tormenta20", "showStatusCards");
			const effect = data.find((doc) => doc.statuses.length);
			if (showCard && effect) {
				game.tormenta20.macros.msgFromJournal(effect.name, "tormenta20.basico", "Condições");
			}
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
		await super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

		if (collection === "effect") {
			let effs = documents.filter((ef) => ef.changes.find((ch) => ch.key.match(/^\?/)));
			let choices = [];
			for (let ef of effs) {
				let changes = ef.changes.filter((ch) => ch.key.match(/^\?/));
				let choice = {};
				for (let ch of changes) {
					choice.id = ef.id;
					choice.label = ef.name;
					choice.key = ch.key.split(".");
					choice.value = ch.value.split(".");
					choices.push(choice);
				}
			}
			if (!foundry.utils.isEmpty(choices) && userId === game.userId) {
				let chosen = await ChoicesDialog.create(choices, this);
				chosen = foundry.utils.expandObject(chosen);
				for (let [id, c] of Object.entries(chosen)) {
					let ef = this.effects.find((e) => e.id === id);
					for (let [key, value] of Object.entries(c)) {
						ef.setFlag("tormenta20", key, value);
					}
				}
			}
		}
	}

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if (attribute === "attributes.pv" || attribute === "attributes.pm") {
			const hp = foundry.utils.getProperty(this.system, attribute);
			const delta = isDelta ? -1 * value : hp.value + hp.temp - value;
			if (attribute === "attributes.pm") {
				return this.spendMana(delta);
			}
			return this.applyDamage(delta);
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}

	/* -------------------------------------------- */

	/**
	 * Apply a certain amount of damage or healing to the health pool for Actor
	 * @param {number} amount			 An amount of damage (positive) or healing (negative) to sustain
	 * @param {number} multiplier	 A multiplier which allows for resistance, vulnerability, or healing
	 * @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	 */
	async applyDamageV2(roll, multiplier = 1, type = "dano") {
		const { pv, pm } = this.system.attributes;
		const rds = this.system.tracos?.resistencias;
		const rdsEx = Object.entries(rds).reduce((acc, [key, value]) => {
			if (value.excecao) acc[key] = value.excecao;
			return acc;
		}, {});
		const final = {
			damage: 0,
			loss: 0,
			heal: 0,
			tempHP: 0,
			mana: 0,
			manaGain: 0,
			tempMP: 0
		};

		const damage = {};
		for (const { operator, total, options } of roll.terms) {
			if (!operator) {
				const flavor = options?.flavor ?? type;
				damage[flavor] ??= {
					value: 0,
					rd: Number(rds[flavor]?.value) || 0
				};
				damage[flavor].value += total;
			}
		}

		const map = { curapv: "heal", curatpv: "tempHP", curapm: "manaGain", curatpm: "tempMP" };
		Object.entries(map).forEach(([key, value]) => {
			if (damage[key]) {
				final[value] += damage[key].value * -multiplier;
				delete damage[key];
			}
		});
		if (damage.perda) {
			if (multiplier > 0) final.damage += damage.perda.value * multiplier;
			else final.heal += damage.perda.value;
			delete damage.perda;
		}

		let rdIgnorada = Math.abs(roll.options.rd ?? 0);
		function ignoraRD(damageType) {
			const rd = Number(rds[damageType].value);
			rds[damageType].value = Math.max(rd - rdIgnorada, 0);
			rdIgnorada = Math.max(rdIgnorada - rd, 0);
		}

		if (rdIgnorada) ignoraRD("dano");
		if (rds.dano?.value) final.damage -= rds.dano.value;
		for (let [type, dmg] of Object.entries(damage)) {
			let rd = 0;
			// Apply Damage Reduction for each type of damage
			if (type !== "dano") {
				if (rdIgnorada) ignoraRD(type);
				rd = Number(rds[type]?.value ?? 0);
			}

			if (!foundry.utils.isEmpty(rdsEx) && !rdsEx[type]) {
				rd += Number(Object.values(rdsEx)[0]);
			}

			if (multiplier > 0) {
				if (rds[type]?.imunidade) dmg.value = 0;
				else if (rds[type]?.vulnerabilidade) dmg.value = Math.floor(dmg.value * 1.5);
				else if (rds[type]?.danoPorDado) dmg.value += roll.terms[0].number;
				final.damage += Math.max(dmg.value * multiplier - rd, 0);
			} else final.heal += dmg.value;
		}
		final.damage = Math.max(final.damage, 0);

		// Deduct value from temp attr first
		const hpt = Math.min(pv.temp, final.damage + final.loss);
		const mpt = Math.min(pm.temp, final.mana);
		// Remaining goes to attr
		const dhp = Math.clamp(pv.value + final.heal - (final.damage + final.loss - hpt), pv.min, pv.max);
		const dmp = Math.clamp(pm.value + final.manaGain - (final.mana - mpt), pm.min, pm.max);

		// Update the Actor
		const updates = {
			"system.attributes.pv.temp": pv.temp - hpt + final.tempHP,
			"system.attributes.pv.value": dhp,
			"system.attributes.pm.temp": pm.temp - mpt + final.tempMP,
			"system.attributes.pm.value": dmp
		};

		await this.update(updates);
		await this.displayDamageCard(damage, final, multiplier);
	}

	async displayDamageCard(dmgParts, final, multiplier = 1) {
		const show = game.settings.get("tormenta20", "showDamageCards");
		if (show === "none") return;
		multiplier = Math.sign(multiplier);
		const label = {
			damage: "T20.HP",
			mana: "T20.MP",
			tempHP: "T20.HealingTemp",
			tempMP: "T20.ManaTemp"
		};
		const chatDamage = {};
		for (const [type, value] of Object.entries(final)) {
			if (type === "total") chatDamage.total = value * multiplier;
			else if (value) {
				chatDamage.label = label[type];
				chatDamage.type = type;
				chatDamage.value = value * multiplier;
				if (["heal", "damage"].includes(type)) chatDamage.value *= -1;
			}
		}

		let color = "red";
		if (chatDamage.type === "damage" && chatDamage.value <= 0) color = "health";
		else if (["heal", "damage"].includes(chatDamage.type) && chatDamage.value > 0) color = "heal";
		else if (chatDamage.type === "mana" && chatDamage.value != 0) color = "mana";
		else if (chatDamage.type === "tempHP" && chatDamage.value != 0) color = "hptemp";
		else if (chatDamage.type === "tempMP" && chatDamage.value != 0) color = "mptemp";

		const templateData = {
			actor: this,
			damage: dmgParts,
			chatDMG: chatDamage,
			setting: game.settings.get("tormenta20", "showDamageCards")
		};
		const template = "systems/tormenta20/templates/chat/chat-card-damage.hbs";
		const html = await foundry.applications.handlebars.renderTemplate(template, templateData);

		const chatData = {
			user: game.user.id,
			content: html,
			speaker: ChatMessage.getSpeaker({ actor: this }),
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			flags: {
				tormenta20: {
					minimal: true,
					cssClass: `tormenta20 damage-card damage-${color}`
				}
			}
		};

		let rollMode = "publicroll";
		if (this.type === "npc" && show !== "npcs") rollMode = "selfroll";
		ChatMessage.applyRollMode(chatData, rollMode);
		ChatMessage.create(chatData, {});
	}

	async applyDamage(amount = 0, multiplier = 1, applyRD = false) {
		amount = Math.floor(parseInt(amount) * multiplier);
		const pv = this.system.attributes.pv;

		// Prepare Damage Reduction if damage
		const rd = applyRD ? this.system.tracos?.resistencias?.dano?.value || 0 : 0;
		amount = amount > 0 ? Math.max(amount - rd, 0) : amount;

		// Deduct damage from temp HP first
		const tmp = parseInt(pv.temp) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;

		// Remaining goes to health
		const dh = Math.clamp(pv.value - (amount - dt), pv.min, pv.max);

		// Update the Actor
		const updates = {
			"system.attributes.pv.temp": tmp - dt,
			"system.attributes.pv.value": dh
		};

		// Delegate damage application to a hook
		// TODO replace this in the future with a better modifyTokenAttribute function in the core
		const allowed = Hooks.call(
			"modifyTokenAttribute",
			{
				attribute: "attributes.pv",
				value: amount,
				isDelta: false,
				isBar: true
			},
			updates
		);

		return allowed !== false ? this.update(updates) : this;
	}

	/* -------------------------------------------- */

	/**
	 * Spend or recover mana points for Actor
	 * @param {number} amount			 An amount of spent (positive) or recover (negative) mana points
	 * @param {number} adjust			 A adjust for the value due to specific conditions
	 * @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	 */
	async spendMana(amount = 0, adjust = 0, recover) {
		let spendMana = 0;
		let tmpPMspend;
		let chatMessage = "";
		let newSptAmount = amount;

		const pm = this.system.attributes.pm;
		const tmpPM = parseInt(pm.temp) || 0;
		if (recover) {
			tmpPMspend = 0;
			newSptAmount = amount;
			spendMana = Math.clamp(pm.value + newSptAmount, 0, pm.max);
			chatMessage = `<i class="fas fa-user-plus"></i> +${newSptAmount} PM`;
		} else {
			amount = Math.floor(parseInt(amount) + adjust);
			newSptAmount = amount;
			// Deduct damage from temp Mana first
			tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;
			chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} PMs`;
			// Remove Mana
			spendMana = Math.clamp(pm.value - (newSptAmount - tmpPMspend), 0, pm.max);
		}
		// Update the Actor
		await this.update({
			"system.attributes.pm.temp": tmpPM - tmpPMspend,
			"system.attributes.pm.value": spendMana
		});

		await this.displayDamageCard({}, { mana: amount }, -1);
	}

	/* -------------------------------------------- */

	/**
	 * Roll Teste de Perícia
	 * @param {String} key  The skill ID (e.g. "cura")
	 * @param {Object} options    Options which configure how skill tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollPericia(key, options = {}) {
		options.message ??= true;
		const pericia = this.system.pericias[key];
		const event = options.event;
		let consumeMana = 0;
		let rollMode = game.settings.get("core", "rollMode");

		let rConfig = {};
		const itemData = {
			name: pericia.label,
			type: "pericia",
			parts: ["1d20", String(pericia.value)],
			id: key,
			actor: this,
			system: { ativacao: { custo: 0 } },
			isOwned: true,
			...pericia
		};
		let needsConfiguration;

		const UsageConfig = game.settings.get("tormenta20", "UsageConfig");
		if (UsageConfig === "default") needsConfiguration = !(options.event?.shiftKey ?? false);
		else needsConfiguration = options.event?.shiftKey ?? false;

		let configuration = {};
		if (needsConfiguration) {
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = foundry.utils.mergeObject(rConfig, configuration);

			rollMode = configuration.rollMode;
		} else {
			let active = this.effects.filter(
				(ef) => ef.getFlag("tormenta20", "onuse") && ef.getFlag("tormenta20", "pericia") && !ef.disabled
			);
			configuration.aprs = active.reduce((o, ef) => {
				o[ef.id] = { aplica: 1, custo: ef.flags.tormenta20.custo };
				return o;
			}, {});
			rConfig = applyOnUseEffects(itemData, configuration);
		}

		rConfig.itemData = itemData;

		// Compose roll options
		const rollConfig = foundry.utils.mergeObject(
			{
				parts: itemData.parts,
				actor: this,
				event: event,
				data: this.getRollData(),
				title: itemData.label,
				flavor: itemData.label
			},
			rConfig
		);

		let toInitiative = function () {
			let combatente;
			try {
				let combate = game.combats.active;
				if (pericia.label === "Iniciativa" && combate) {
					let roll = rConfig.itemData.rolled;
					let combatente = combate.combatants.find((combatant) => combatant.actor.id === this.id);
					if (combatente && combatente.initiative === null) {
						combate.setInitiative(combatente.id, roll.total);
						console.log(`Foundry VTT | Iniciativa Atualizada para ${combatente._id} (${combatente.actor.name})`);
					}
				}
			} catch (error) {
				console.warn(`Foundry VTT | Erro ao adicionar a Iniciativa, ${combatente._id} (${combatente.actor.name})`);
			}
		};

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if (autoSpendMana && rConfig.itemData?.system?.ativacao?.custo) {
			consumeMana = rConfig.itemData.system.ativacao.custo;
		} else consumeMana = false;

		if (consumeMana) {
			const manaUpdate = rConfig.itemData.system.ativacao.custo;
			if (!foundry.utils.isEmpty(manaUpdate)) {
				this.spendMana(manaUpdate, 0, false);
			}
		}
		// LOGS
		if (options.message) {
			options = rConfig;
			options.itemData.rolled = await d20Roll(rollConfig);
			options.effects = configuration.effects ?? [];
			toInitiative();
			return this.displayCard({ options, rollMode });
		}
		return await d20Roll(rollConfig);
	}

	/* -------------------------------------------- */

	/**
	 * Roll Teste de Atributo
	 * @param {String} abilityId  The ability ID (e.g. "for")
	 * @param {Object} options    Options which configure how ability tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollAtributo(key, options = {}) {
		options.message ??= true;
		const label = CONFIG.T20.atributos[key];
		const abl = this.system.atributos[key];
		const actor = this;
		const event = options.event ?? {};
		let rollMode = game.settings.get("core", "rollMode");

		// Construct parts
		const parts = ["1d20", `@${key}`];

		// Add global actor bonus GERAL | FISICOS | MENTAIS | KEY
		const bonuses = foundry.utils.getProperty(this.system, "modificadores.atributos") || {};
		if (bonuses.geral?.filter(Boolean).length) parts.push("@atributo");
		if (["for", "des", "con"].includes(key) && bonuses.fisicos?.filter(Boolean).length) parts.push("@fisicos");
		if (["int", "sab", "car"].includes(key) && bonuses.mentais?.filter(Boolean).length) parts.push("@mentais");
		if (bonuses[key]?.filter(Boolean).length) parts.push(...bonuses[key]);

		// Add provided extra roll parts
		if (options.parts?.length > 0) {
			parts.push(...options.parts);
		}
		abl.parts = parts;

		let itemData = {
			name: abl.name,
			type: "atributo",
			parts: parts,
			id: key,
			actor: actor,
			system: { ativacao: { custo: 0 } },
			isOwned: true,
			rollData: abl,
			custo: 0
		};

		let rConfig = {};
		let needsConfiguration;
		const UsageConfig = game.settings.get("tormenta20", "UsageConfig");
		if (UsageConfig === "default") {
			needsConfiguration = !(options.event?.shiftKey ?? false);
		} else {
			needsConfiguration = options.event?.shiftKey ?? false;
		}
		let configuration = {};
		if (needsConfiguration) {
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = foundry.utils.mergeObject(rConfig, configuration);

			if (configuration.bonus) parts.push(configuration.bonus);
			rollMode = configuration.rollMode;
		}
		// Aways Active Effect
		else {
			let active = this.effects.filter(
				(ef) => ef.getFlag("tormenta20", "onuse") && ef.getFlag("tormenta20", "atributo") && !ef.disabled
			);
			configuration.aprs = active.reduce((o, ef) => {
				o[ef.id] = { aplica: 1, custo: ef.flags.tormenta20.custo };
				return o;
			}, {});
			rConfig = applyOnUseEffects(itemData, configuration);
		}
		rConfig.itemData = itemData;
		// rollData
		const rollConfig = foundry.utils.mergeObject(
			{
				parts: parts.filter(Boolean),
				data: this.getRollData(),
				event: event,
				title: game.i18n.format("T20.AbilityPromptTitle", { atributo: label }),
				flavor: game.i18n.localize("T20.AbilityCheck"),
				messageData: { "flags.tormenta20.roll": { type: "ability", key } }
			},
			rConfig
		);

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		let consumeMana = 0;
		if (autoSpendMana && rConfig.itemData?.system?.ativacao?.custo) {
			consumeMana = rConfig.itemData.system.ativacao.custo;
		} else consumeMana = false;

		if (consumeMana) {
			const manaUpdate = rConfig.itemData.system.ativacao.custo;
			if (!foundry.utils.isEmpty(manaUpdate)) {
				this.spendMana(manaUpdate, 0, false);
			}
		}

		if (options.message) {
			options = rConfig;
			options.itemData.rolled = await d20Roll(rollConfig);
			return this.displayCard({ options, rollMode });
		}
		return await d20Roll(rollConfig);
	}

	/* -------------------------------------------- */

	/**
	 * Display the chat card for an Item as a Chat Message
	 * @param {object} options          Options which configure the display of the item chat card
	 * @param {string} rollMode         The message visibility mode to apply to the created card
	 * @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	 *                                  the prepared message data (if false)
	 */
	async displayCard({ options, rollMode, createMessage = true } = {}) {
		// Basic template rendering data
		const token = this.getActiveTokens()[0] ?? null;

		let manaCost = Math.max(options.itemData?.system?.ativacao?.custo, 0) || null;
		if (options.truque) manaCost = 0;
		else if (options.halfCost) manaCost = Math.floor(manaCost / 2);

		const templateData = {
			actor: this,
			tokenId: token?.uuid || null,
			item: options.itemData,
			custo: manaCost || null,
			onUseEffects: options.onUseEffects,
			effects: options.effects,
			rolls: []
		};

		// Other Template Data
		if (options.itemData.rolled) {
			let roll = options.itemData.rolled;
			await roll.render().then((r) => {
				templateData.rolls.push({ template: r, roll: roll });
			});
		}

		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.hbs";
		const html = await foundry.applications.handlebars.renderTemplate(template, templateData);

		// Create the ChatMessage data object
		const chatData = {
			user: game.user.id,
			// type: CONST.CHAT_MESSAGE_STYLES.ROLL,
			rolls: [options.itemData.rolled],
			content: html,
			flavor: options.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({ actor: this }),
			flags: {
				"core.canPopout": true,
				"tormenta20.rollTotal": options.itemData.rolled.total,
				"tormenta20.onUseEffects": options.onUseEffects,
				"tormenta20.effects": options.effects
			}
		};
		// chatData.rolls = options.itemData.rolled;

		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

		// Create the Chat Message or return its data
		if (createMessage) {
			return await ChatMessage.create(chatData);
		}
		return chatData;
	}

	/**
	 * Flash ring & display changes to health as scrolling combat text.
	 * @param {object} changes          Object of changes to hit points.
	 * @param {number} changes.pv		Changes to `pv.value`.
	 * @param {number} changes.temp     The change to `pv.temp`.
	 * @param {number} changes.total    The total change to hit points.
	 * @protected
	 */
	_displayTokenEffect(changes) {
		let key;
		let value;
		if (changes.pv < 0) {
			key = "damage";
			value = changes.total;
		} else if (changes.pv > 0) {
			key = "healing";
			value = changes.total;
		} else if (changes.temp) {
			value = changes.temp;
		}
		if (!value) return;

		const tokens = this.isToken ? [this.token] : this.getActiveTokens(true, true);
		if (!tokens.length) return;

		const pct = Math.clamp(Math.abs(value) / this.system.attributes.pv.max, 0, 1);
		const fill = CONFIG.T20.tokenHPColors[key] ?? "#ffffff";

		for (const token of tokens) {
			if (!token.object?.visible || token.isSecret) continue;
			const t = token.object;
			canvas.interface.createScrollingText(t.center, value.signedString(), {
				anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
				// Adapt the font size relative to the Actor's HP total to emphasize more significant blows
				fontSize: 16 + 32 * pct, // Range between [16, 48]
				fill,
				stroke: 0x000000,
				strokeThickness: 4,
				jitter: 0.25
			});
		}
	}
}
