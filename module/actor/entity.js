import { T20Utility } from "../utility.js";
import { T20Config } from '../config.js';
import { d20Roll, damageRoll } from '../dice.js';
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
			(ability.penalidade ?? 0)
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
					Number(pericia.outros) +
					Number(pericia.temp ?? 0) +
					Number(data.modificadores?.pericias?.geral ?? 0) +
					Number(data.modificadores?.pericias?.semataque ?? 0) +
					Number(data.modificadores?.pericias?.ataque ?? 0) +
					Number(data.modificadores?.pericias?.resistencia ?? 0) +
					Number(pericia.pda ? (data.defesa.pda ? Math.abs(data.defesa.pda) : 0) : 0);
				}
			}
		}
		/* Template SKILLS */
		
		/* Item SKILLS [WIP] */
			// TEST THIS CALLING _UPDATESKILLS
		/* Item SKILLS [WIP] */

		if(data.defesa !== undefined && this.data.type !== "npc"){
			let bonus;
			let armadura = 0;
			let pda = 0;
			if(data.defesa.bonus && typeof data.defesa.bonus === 'string'){
				bonus = new Roll(data.defesa.bonus,this.getRollData());
				bonus = bonus.evaluate().total;
			}
			for (let [key, data] of Object.entries(actorData.items)) {
				if (data.type == "equip" && data.data.equipado) {
					armadura += data.data.armadura.value;
					pda += Math.abs(data.data.armadura.penalidade);
				}
			}
			data.defesa.value =
				10 +
				Number(data.defesa.des ? data.atributos.des.mod : data.atributos.des.mod < 0 ? data.atributos.des.mod : 0) +
				armadura +
				Number(data.defesa.outro) +
				Number(data.defesa.temp) +
				(Number(bonus) || 0);
			data.defesa.pda = -pda;
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
		for ( let abl in data.atributos ) {
			data[abl] = data.atributos[abl].mod
		}

		return data;
	}

	/* -------------------------------------------- */

	/**
	* IF EVER CREATED INLCUDE METHODS FOR CLASS FEATURES HERE 
	**/

	/* -------------------------------------------- */
	/*	Data Preparation Helpers					*/
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
		if ( data.type === "character" ) {
			data.flags = {"editarPericias": true};
			mergeObject(data.token, {
				vision: true,
				actorLink: true,
				disposition: 1,
				displayName: 50,
				displayBars: 40,
				bar1: {attribute: "attributes.pv"},
				bar2: {attribute: "attributes.pm"}
			}, {overwrite: false});
		/*/
		// Item Skills [WIP]
			// Add Basic Skills Items on creation
			let basicSkills = await this.allBasicSkills("basic") || [];
			data.items = data.items.concat(basicSkills);
			// Senses TODO
		/**/
		}
		if ( data.type === "npc" ) {
			mergeObject(data.token, {
				vision: true,
				actorLink: false,
				disposition: 0,
				displayName: 40,
				displayBars: 40,
				bar1: {attribute: "attributes.pv"},
				bar2: {attribute: "attributes.pm"}
			}, {overwrite: false});
			data.img = data.img ?? "systems/Tormenta20/icons/ameaças/Monstro.webp";
			data.token.img = data.token.img ?? "systems/Tormenta20/icons/ameaças/Monstro_token.webp";
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

	/* -------------------------------------------- */
	/*	Roll Preparation							*/
	/* -------------------------------------------- */

	/**
	 * Roll Teste de Atributo
	 * @param {String} abilityId  The ability ID (e.g. "str")
	 * @param {Object} options    Options which configure how ability tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollAtributo(atributoId, options={}) {
		const label = T20Config.atributos[atributoId];
		const abl = this.data.data.atributos[atributoId];
		
		// Construct parts
		const parts = ["@mod"];
		const data = mergeObject({mod: abl.mod}, this.getRollData());
		// Add global actor bonus GERAL | FISICOS | MENTAIS | KEY
		const bonuses = getProperty(this.data.data, "modificadores.atributos") || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( ["for","des","con"].includes(atributoId) && bonuses.fisicos ) parts.push(bonuses.fisicos);
		if ( ["int","sab","car"].includes(atributoId) && bonuses.mentais ) parts.push(bonuses.mentais);
		if ( Object.keys(bonuses).includes(atributoId) && bonuses[atributoId] ) parts.push(bonuses[atributoId]);

		// Add provided extra roll parts now because they will get clobbered by mergeObject below
		if (options.parts?.length > 0) {
			parts.push(...options.parts);
		}
		// Roll and return
		const rollData = mergeObject(options, {
		  parts: parts,
		  data: data,
		  flavor: "Teste de Atributo",
		  messageData: {"flags.tormenta20.roll": {type: "ability", atributoId }}
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
		return d20Roll(rollData);
	}

	/**
	 * Roll Teste de Perícia
	 * @param {String} skillId  The skill ID (e.g. "cur")
	 * @param {Object} options    Options which configure how skill tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollPericia(skillData, options={}) {
		const label = skillData.name;// T20Config.atributos[skillId];
		const skill = skillData.id;
		// Construct parts
		const parts = ["@value"];
		const data = mergeObject({value: skillData.data.value}, this.getRollData());
		// Add global actor bonus GERAL | ATQ | !ATQ | SAVES | KEY
		const bonuses = getProperty(this.data.data, "modificadores.pericias") || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( !["lut","pon"].includes(skillData.id) && bonuses.semataque ) parts.push(bonuses.semataque);
		if ( ["lut","pon"].includes(skillData.id) && bonuses.ataque ) parts.push(bonuses.ataque);
		if ( ["for","ref","von"].includes(skillData.id) && bonuses.resistencia ) parts.push(bonuses.resistencia);
		if ( bonuses.atr && bonuses.atr[skillData.data.atributo] ) parts.push(bonuses.atr[skillData.data.atributo]);
		if( skillData.data.condi ) parts.push(skillData.data.condi);

		// Add provided extra roll parts now because they will get clobbered by mergeObject below
		if (options.parts?.length > 0) {
			parts.push(...options.parts);
		}
		// Roll and return
		const rollData = mergeObject(options, {
		  parts: parts,
		  data: data,
		  title: "Teste de Perícia",
		  messageData: {"flags.tormenta20.roll": {type: "skill", skill }}
		});
		rollData.speaker = options.speaker || ChatMessage.getSpeaker({actor: this});
		// Invoke the d20 roll helper
		const roll = await d20Roll(rollData);
		if ( roll === false ) return null;

		let combate = game.combats.active;
		if (label == "Iniciativa" && combate) {
			let combatente = combate.combatants.find(
				(combatant) => combatant.actor.id === this.id
			);
			if (combatente && combatente.initiative === null) {
				combate.setInitiative(combatente._id, roll.total);
				console.log(`Foundry VTT | Iniciativa Atualizada para ${combatente._id} (${combatente.actor.name})`);
			}
		}
		return roll;
	}

	_onItemRoll(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		return item.roll();
	}

	/* -------------------------------------------- */

	/**
	* Display the chat card for an Item as a Chat Message
	* @param {object} options          Options which configure the display of the item chat card
	* @param {string} rollMode         The message visibility mode to apply to the created card
	* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	*                                  the prepared message data (if false)
	*/
	async displayCard({rolls, itemData, rollMode, createMessage=true}={}) {
		// Basic template rendering data
		rollMode = rollMode || game.settings.get("core", "rollMode");
		const token = this.token;
		const templateData = {
			actor: this,
			tokenId: token ? `${token.scene._id}.${token.id}` : null,
			item: itemData,
			_rolls: [],
			rolls: [rolls]
		};
		// Other Template Data

		if(rolls) {
			await rolls.render().then((r)=> {templateData._rolls.push(r)});
		}
		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, templateData);
		
		// Create the ChatMessage data object
		const chatData = {
			user: game.user._id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: html,
			flavor: this.data.data.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this.actor, token}),
			flags: {"core.canPopout": true}
		};
		
		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode);

		if (game?.dice3d?.show) {
			let wd = {
				whisper:	(["gmroll", "blindroll"].includes(rollMode) ? ChatMessage.getWhisperRecipients("GM") 
															: (rollMode === "selfroll" ? [game.user._id] : null)),
				blind: rollMode === "blindroll"
			}
			if(rolls) game.dice3d.showForRoll(rolls, game.user, true, wd.whisper, wd.blind);
		}
		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}
}
