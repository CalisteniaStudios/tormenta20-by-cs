import { T20Utility } from "../utility.js";
import { T20Config } from '../config.js';

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {

	/** @override */	
	prepareBaseData() {
		switch ( this.data.type ) {
			case "character":
				return this._prepareCharacterData(this.data);
			case "npc":
				return this._prepareNPCData(this.data);
			}
	}

	/* -------------------------------------------- */

	/** @override */
	prepareDerivedData() {
		const actorData = this.data;
		const data = actorData.data;
		
		const nivel = data.attributes.nivel.value;

		// Base CD
		data.attributes.cd = data.attributes.cd ? data.attributes.cd : 10 + Math.floor(data.attributes.nivel.value/2);
		
		// Loop through ability scores, and add their modifiers to our sheet output.
		for (let [key, ability] of Object.entries(data.atributos)) {
			// Calculate the modifier using d20 rules.
			ability.ttl = ability.value + (ability.temp ?? 0);
			ability.mod =
			Math.floor((ability.value + (ability.temp ?? 0) - 10) / 2) +
			(ability.bonus ?? 0) -
			(ability.penalidade ?? 0) +
			Number(data.modificadores?.atributos?.bonus ?? 0) -
			Number(data.modificadores?.atributos?.penalidade ?? 0);
		}

		/* Template Skills */
		if(data.pericias !== undefined && this.data.type !== "npc"){
			let skillsArrays = [];
			skillsArrays.push(data.pericias);
			skillsArrays.push(data.pericias.ofi.mais);
			skillsArrays.push(data.periciasCustom);
			for (let [k, arr] of Object.entries(skillsArrays)) {
				for (let [key, pericia] of Object.entries(arr)) {
				// Calculate the skill values .
				pericia.treino = !pericia.treinado ? 0 : (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2)) ;

				// segunda e terceira array
				if(k > 0){
					pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
					pericia.st = pericia.label.match(/\*/g) ? true : false;
					pericia.pda = pericia.label.match(/\+/g) ? true : false;
				}

				var atributo = pericia.atributo;
				pericia.mod = data.atributos[atributo].mod;
				pericia.value =
					Math.floor(nivel / 2) +
					Number(pericia.treino) +
					Number(pericia.mod) +
					Number(pericia.temp ?? 0) +
					Number(data.modificadores?.pericias?.bonus ?? 0) -
					Number(data.modificadores?.pericias?.penalidade ?? 0) +
					Number(pericia.outros) -
					Number(pericia.pda ? (data.defesa.armadura.equipado ? Math.abs(data.defesa.armadura.penalidade) : 0) +
						(data.defesa.escudo.equipado ? Math.abs(data.defesa.escudo.penalidade) : 0)
					: 0
					);
				}
			}
		}
		/* Template SKILLS */
		
		/* Item SKILLS [WIP] */
			// TEST THIS CALLING _UPDATESKILLS
		/* Item SKILLS [WIP] */
		
		if (isNaN(data.deslocamento)) {
			data.deslocamento.total =
				parseInt(data.deslocamento.base ?? 9, 10) +
				(data.deslocamento.bonus ?? 0) -
				(data.deslocamento.penalidade ?? 0);
		}
		else {
			let deslocamento = {
				base: data.deslocamento,
				bonus: 0,
				penalidade: 0,
				subst: 0,
				cond: "nao",
				total: data.deslocamento + (data.deslocamento.bonus ?? 0) - (data.deslocamento.penalidade ?? 0),
			};
			data.deslocamento = deslocamento;
		}
		if (data.deslocamento.cond == "metade") {
			data.deslocamento.total = data.deslocamento.total / 2;
		}
		else if (data.deslocamento.cond == "zerado") {
			data.deslocamento.total = 0;
		}
		if (data.deslocamento.subst > 0) {
			data.deslocamento.total = data.deslocamento.subst;
		}
		if (data.deslocamento.total < 0) {
			data.deslocamento.total = 0;
		}

		if(data.defesa !== undefined && this.data.type !== "npc"){
			data.defesa.value =
			10 +
			Number(data.defesa.des ? data.atributos.des.mod : data.atributos.des.mod < 0 ? data.atributos.des.mod : 0) +
			Number(data.defesa.armadura != undefined ? data.defesa.armadura.value : 0) +
			Number(data.defesa.escudo != undefined ? data.defesa.escudo.value : 0) +
			Number(data.defesa.outro) +
			Number(data.defesa.temp) +
			Number(data.defesa.bonus ?? 0) -
			Number(data.defesa.penalidade ?? 0);
		}

	}

	/* -------------------------------------------- */

	/**
	 * Return the amount of experience required to gain a certain character level.
	 * @param level {Number}	The desired level
	 * @return {Number}			 The XP required
	 */
	getLevelExp(nivel) {
		const niveis = T20Config.xpPorNivel;
		return niveis[Math.min(nivel, niveis.length - 1)];
	}
	/**/

	/* -------------------------------------------- */

	/**
	* Return the amount of experience granted by killing a creature of a certain CR.
	* @param cr {Number}		 The creature's challenge rating
	* @return {Number}			 The amount of experience granted per kill
	*/
	/*/ TODO IMPLEMENT CONFIG T20
	getCRExp(cr) {
		if (cr < 1.0) return Math.max(200 * cr, 10);
		return CONFIG.T20.CR_EXP_LEVELS[cr];
	}
	/**/

	/* -------------------------------------------- */

	/** @override */
	getRollData() {
		const data = super.getRollData();
		return data;
	}

	/* -------------------------------------------- */

	/**
	* IF EVER CREATED INLCUDE METHODS FOR CLASS FEATURES HERE 
	**/

	/* -------------------------------------------- */
	/*	Data Preparation Helpers										*/
	/* -------------------------------------------- */

	/**
	* Prepare Character type specific data
	*/
	_prepareCharacterData(actorData){
		const data = actorData.data;

		/* TODO IMPLEMENT GET FROM ITEM */
		const classes = [];
		/* 
		* Set data that requires other data to be prepared
		* ie.: Encumbrance, Abl Mod, Skills Bonus, Defense
		*/
		this._EvaluateConditions();
		const nivel = actorData.items.reduce((arr, item) => {
			if ( item.type === "classe" ) {
				const classLevels = parseInt(item.data.niveis) || 1;
				arr += classLevels;
				classes.push(item.name + " " + item.data.niveis);
			}
			return arr;
		}, 0);
		data.attributes.nivel.value = nivel;

		data.rd.value =
			data.rd.base +
			data.rd.temp +
			(data.rd.bonus ?? 0) +
			(data.rd.penalidade ?? 0);

		// for compatibility with dnd modules
		data.attributes.hp = data.attributes.pv.value;

		// Experience required for next level
		// const nivel = data.attributes.nivel.value;
		data.attributes.nivel.value = nivel;
		const xp = data.attributes.nivel.xp;
		xp.proximo = this.getLevelExp(nivel || 1);
		const anterior = this.getLevelExp(nivel - 1 || 0);
		const necessario = xp.proximo - anterior;
		const pct = Math.round((xp.value - anterior) * 100 / necessario);
		xp.pct = Math.clamped(pct, 0, 100);
	}

	/* -------------------------------------------- */

	/**
	* Prepare NPC type specific data
	*/
	_prepareNPCData(actorData){
		const data = actorData.data;

		this._EvaluateConditions();

		// Make modifications to data here. For example:
		var nivel = data.attributes.nivel.value;

		data.defesa.final =
			Number(data.defesa.value) +
			Number(data.defesa.bonus ?? 0) -
			Number(data.defesa.penalidade ?? 0);

		// for compatibility with dnd modules
		data.attributes.hp = data.attributes.pv.value;

		// Experience required for next level
		/* TODO IMPLEMENT AFTER CONFIG */
	}

	/* -------------------------------------------- */

	/**
	* Prepare skill checks.
	* @param actorData
	* @private
	*/
	/*/
	_prepareSkill(actorData, skill){
		let halfLevel = Math.floor(actorData.data.attributes.nivel.value/2);

		let training = !skill.data.trained ? 0 : (actorData.data.attributes.nivel.value > 14 ? 6 : (actorData.data.attributes.nivel.value > 6 ? 4 : 2));
		let abilityMod = actorData.data.atributos[skill.data.ability].mod;
		let armorPen = false ? 0 : 0;
		skill.data.total = halfLevel + training + abilityMod + skill.data.bonus + armorPen;
		return skill;
	}
	/**/

	/* -------------------------------------------- */

	/**
	* Compute the level and percentage of encumbrance for an Actor.
	*
	* Optionally include the weight of carried currency across all denominations by applying the standard rule
	* from the PHB pg. 143
	* @param {Object} actorData			The data object for the Actor being rendered
	* @returns {{max: number, value: number, pct: number}}	An object describing the character's encumbrance level
	* @private
	*/
	/*/
	_computeEncumbrance(actorData) {
		// Get the total weight from items

	}
	/**/

	/* -------------------------------------------- */
	/*	Socket Listeners and Handlers							 */
	/* -------------------------------------------- */

	/** @override */
	static async create(data, options={}) {

		data.items = data.items || [];
		data.token = data.token || {};
		/*/
		// Item Skills [WIP]
		if ( data.type === "character" ) {
			// Add Basic Skills Items on creation
			let basicSkills = await this.allBasicSkills("basic") || [];
			data.items = data.items.concat(basicSkills);
			// Senses TODO
		}
		/**/

		return super.create(data, options);
	}

	/* -------------------------------------------- */

	/** @override */
	/*/
	async update(data, options={}) {
		
		// Get size and scale token

		return super.update(data, options={});
	}
	/**/

	/* -------------------------------------------- */
	/*/
	// Item Skills [WIP]
	static async allBasicSkills(group) {
		let returnSkills = [];

		const packs = game.packs.filter(p => p.metadata.tags && p.metadata.tags.includes("skill"))

		if (!packs.length)
			return ui.notifications.error("Conteúdo não encontrado")

		for (let pack of packs){
			let items;
			await pack.getContent().then(content => items = content.filter( i => i.data.type == "skill"));
			for (let i of items){
				if (i.data.data.groups[group]) {
					returnSkills.push(i.data)
				}
			}
		}
		return returnSkills;
	}
	/**/
	/* -------------------------------------------- */

	/** @override */
	/*
	*	Methods for precreate owned item
	*/

	/* -------------------------------------------- */


	/**
	 * Apply a certain amount of damage or healing to the health pool for Actor
	 * @param {number} amount			 An amount of damage (positive) or healing (negative) to sustain
	 * @param {number} multiplier	 A multiplier which allows for resistance, vulnerability, or healing
	 * @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	 */
	async applyDamage(amount = 0, multiplier = 1, heal) {
			let toChat = (speaker, message) => {
				let chatData = {
				user: game.user.id,
				content: message,
				speaker: ChatMessage.getSpeaker(speaker),
				type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			};
			ChatMessage.create(chatData, {});
		};

		let damageHealth = 0;
		let tmpPVDamage;
		let chatMessage = "";
		let newDmgAmount = Number(amount);

		const pv = this.data.data.attributes.pv;
		const totalRd = this.data.data.rd.value;
		const tmpPV = parseInt(pv.temp) || 0;
		if (heal) {
			tmpPVDamage = 0;
			damageHealth = Math.clamped(pv.value + newDmgAmount, pv.min, pv.max);
			chatMessage = `<i class="fas fa-user-plus"></i> +${newDmgAmount} pontos PV`;
		} else {
			newDmgAmount = Math.floor(parseInt(amount) * multiplier);
			if (totalRd > 0) {
				newDmgAmount = Math.max(newDmgAmount - totalRd, 0);
			}

			// Deduct damage from temp HP first

			tmpPVDamage = newDmgAmount > 0 ? Math.min(tmpPV, newDmgAmount) : 0;

			chatMessage = `<i class="fas fa-user-minus"></i> ${newDmgAmount} pontos PV`;
			if (totalRd > 0) {
				chatMessage += `<br/>(${amount} - RD${totalRd})`;
			}

			// Remaining goes to health
			damageHealth = Math.clamped(
				pv.value - (newDmgAmount - tmpPVDamage),
				pv.min,
				pv.max
			);
		}
		//toChat(this, chatMessage);

		// Update the Actor
		return this.update({
			"data.attributes.pv.temp": tmpPV - tmpPVDamage,
			"data.attributes.pv.value": damageHealth,
		});
	}

	/**
	* Spend or recover mana points for Actor
	* @param {number} amount			 An amount of spent (positive) or recover (negative) mana points
	* @param {number} adjust			 A adjust for the value due to specific conditions
	* @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	*/
	async spendMana(amount = 0, adjust = 0, recover) {
		let toChat = (speaker, message) => {
			let chatData = {
				user: game.user.id,
				content: message,
				speaker: ChatMessage.getSpeaker(speaker),
				type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			};
			ChatMessage.create(chatData, {});
		};

		let spendMana = 0;
		let tmpPMspend;
		let chatMessage = "";
		let newSptAmount = amount;

		const pm = this.data.data.attributes.pm;
		const tmpPM = parseInt(pm.temp) || 0;
		if (recover) {
			tmpPMspend = 0;
			newSptAmount = amount;
			spendMana = Math.clamped(pm.value + newSptAmount, 0, pm.max);
			chatMessage = `<i class="fas fa-recover-mana"></i> +${newSptAmount} pontos PM`;
		} else {
			amount = Math.floor(parseInt(amount) + adjust);
			newSptAmount = amount;

			// Deduct damage from temp Mana first

			tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;

			chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} pontos PM`;

			// Remaining goes to health
			spendMana = Math.clamped(
				pm.value - (newSptAmount - tmpPMspend),
				0,
				pm.max
			);
		}
		toChat(this, chatMessage);
		// Update the Actor
		return this.update({
			"data.attributes.pm.temp": tmpPM - tmpPMspend,
			"data.attributes.pm.value": spendMana,
		});
	}

	/**/

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta=false, isBar=true) {
		const current = getProperty(this.data.data, attribute);
		// Determine the updates to make to the actor data
		let updates;
		let remainingValue;
		if ( isBar ) {
			if (isDelta) {
				if (current.temp > 0 && value < 0) {
					let newTemp = Math.clamped(current.temp + value, 0, current.temp)
					remainingValue = current.temp + value;
					value = Math.clamped(Number(current.value) + Math.min(0, remainingValue), current.min, current.max);
					updates = {
						[`data.${attribute}.temp`]: newTemp,
						[`data.${attribute}.value`]: value
					};
				}
				else {
					value = Math.clamped(Number(current.value) + value, current.min, current.max);
					updates = {[`data.${attribute}.value`]: value};
				}
			}
			else {
				updates = {[`data.${attribute}.value`]: value};
			}
		}
		else {
			if ( isDelta ) {
				value = Number(current) + value;
			}
			updates = {[`data.${attribute}`]: value};
		}

		// Call a hook to handle token resource bar updates
		const allowed = Hooks.call("modifyTokenAttribute", {attribute, value, isDelta, isBar}, updates);
		return allowed !== false ? this.update(updates) : this;
	}

	/**/


	_EvaluateConditions() {
		const data = this.data.data;
		let condicoesDet = [];

		//Zerar Condições
		data.modificadores = {
			atributos: {
				bonus: 0,
				penalidade: 0,
			},
			pericias: {
				bonus: 0,
				penalidade: 0,
			},
			ataques: {
				bonus: 0,
				penalidade: 0,
			},
			custosPM: {
				bonus: 0,
				penalidade: 0,
			},
		};
		if (typeof data.deslocamento !== "object" || data.deslocamento === null) {
			data.deslocamento = {
				value: data.deslocamento,
				base: data.deslocamento,
				bonus: 0,
				penalidade: 0,
				total: data.deslocamento,
				cond: "nao",
				subst: 0,
				descricao: ""
			};
		} else {
			data.deslocamento.bonus = 0;
			data.deslocamento.penalidade = 0;
			data.deslocamento.subst = 0;
			data.deslocamento.cond = "nao";
		}
		data.defesa.bonus = 0;
		data.defesa.penalidade = 0;
		data.rd.bonus = 0;
		data.rd.penalidade = 0;
		data.referencias = this.data.effects;

		for (let [key, atrib] of Object.entries(data.atributos)) {
			atrib.bonus = 0;
			atrib.penalidade = 0;
		}
		if(data.pericias !== undefined){
			for (let [key, atrib] of Object.entries(data.pericias)) {
				atrib.bonus = 0;
				atrib.penalidade = 0;
			}
		}

		const condicoes = this.data.effects;

		//Aplicar Condições
		condicoes.forEach((condicao) => {
			let condicaoDados = CONFIG.conditions[condicao.flags.core.statusId];
			if (condicaoDados != undefined) {
				let condicaoDet = condicao;
				condicaoDet.tooltip = condicaoDados.tooltip;
				condicaoDet.durationType = condicaoDados.durationType;
				condicoesDet.push(condicaoDet);
				let modificadores = condicaoDados.modifiers;
				CONFIG.conditions[
				condicao.flags.core.statusId
				].childrenConditions.forEach((cond) => {
					modificadores.push(CONFIG.conditions[cond].modifiers);
				});
				modificadores = [].concat.apply([], modificadores);
				modificadores.forEach((modif) => {
					for (var i in modif) {
						let prop = i;
						let value = modif[i];
						var valuePath = prop.split("."),
						last = valuePath.pop(),
						temp = data;
						for (let ii = 0; ii < valuePath.length; ii++) {
							temp = temp[valuePath[ii]];
						}
						if (
							((last == "bonus" || last == "penalidade") && temp[last] < value) ||
							(last != "bonus" && last != "penalidade")
							) {
								temp[last] = value;
						}
					}
				});
			}
		});
		data.referencias = condicoesDet;
	}
}
