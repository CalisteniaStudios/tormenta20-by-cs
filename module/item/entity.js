import { T20Utility } from '../utility.js';
import { d20Roll, damageRoll } from '../dice.js';
import AprimoramentoApplication from "../apps/aprimoramento-app.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemT20 extends Item {
	/**
	* Augment the basic Item data model with additional dynamic data.
	*/
	prepareData() {
		super.prepareData();
		const data = this.data;

		if (this.data.type == "skill"){
			this.prepareSkill();
		}
	}

	prepareSkill(){
		if (this.data.type != "skill"){
			return;
		}

		const data = this.data;

		if (this.isOwned)
		{
			if (!data.data.total){
				data.data.total = 0;
			}
			let actorData = this.actor.data.data;
			let halfLevel = Math.floor(actorData.attributes.nivel.value/2);

			let training = !data.data.trained ? 0 : (actorData.attributes.nivel.value > 14 ? 6 : (actorData.attributes.nivel.value > 6 ? 4 : 2));
			let abilityMod = actorData.atributos[data.data.ability].mod;
			let armorPen = false ? 0 : 0;

			data.data.total = halfLevel + training + abilityMod + data.data.bonus + armorPen;
		}
	}

	async addAprimoramento({custo = 0, tipo = "Truque", ativo = false, formula = "", description = "", id = null } = {}) {
		const data = duplicate(this.data.data);
		const aprimoramentos = data.aprimoramentos;
		id  = id ?? ([1e7] + -1e3 + -4e3 + - 8e3 + -1e11).replace(/[018]/g, c => (
			c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
		aprimoramentos.push({
			transferir: "self",
			custo,
			tipo,
			ativo,
			formula,
			description,
			id
		});

		console.log("Adicionando aprimoramento ao item");

		await this.update({["data.aprimoramentos"]: aprimoramentos});
	}

	async deleteAprimoramento(id) {
		const aprimoramentos = this.data.data.aprimoramentos.filter(mod => mod.id !== id);
		await this.update({"data.aprimoramentos": aprimoramentos});
	}

	editAprimoramento(id) {
		const aprimoramentos = duplicate(this.data.data.aprimoramentos);
		const aprimoramento = aprimoramentos.find(mod => mod.id === id);
		new AprimoramentoApplication(aprimoramento, this, {}, this.actor).render(true);
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */

	static chatListeners(html) {
		html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
	}

	/* -------------------------------------------- */

	/**
	* Handle toggling the visibility of chat card content when the name is clicked
	* @param {Event} event   The originating click event
	* @private
	*/
	static _onChatCardToggleContent(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const card = header.closest(".chat-card");
		const content = card.querySelector(".card-content");
		content.style.display = content.style.display === "none" ? "block" : "none";
	}

	/* -------------------------------------------- */

	/**
	* Roll the item to Chat, creating a chat card
	* @param {string} [rollMode]             The roll display mode with which to display (or not) the card
	* @return {Promise<ChatMessage|object|void>}
	*/
	async roll({rollMode,createMessage=true}={}) {
		let item = this;
		let copy = duplicate(this);
		const actor = this.actor;
		let options = {};
		options.rolls = {};
		// Reference aspects of the item data necessary for usage
		const id = this.data.data;                // Item data
		const actorData = actor.data.data;
		// const hasArea = this.hasAreaTarget;       // Is the ability usage an AoE? TODO
		// const resource = id.consume || {};        // Resource consumption TODO
		const isSpell = this.type === "magia";    // Is the item a spell?
		const requireMana = id.ativacao?.custo > 0 ;

		// Define follow-up actions resulting from the item usage
		// let createMeasuredTemplate = hasArea;       // Trigger a template creation TODO
		// let consumeResource = !!resource.target && (resource.type !== "ammo") // Consume a linked (non-ammo) resource TODO
		let consumeMana = requireMana;    // Consume a spell slot

		// Display a configuration dialog to customize the usage
		const needsConfiguration = event.shiftKey;
		let configuration;
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(this);
			if(!configuration) return;
			
			// Determine configuration preferences
			// createMeasuredTemplate = Boolean(configuration.placeTemplate); TODO
			// consumeResource = Boolean(configuration.consumeResource); TODO
			consumeMana = Boolean(configuration.consumeMana);
			rollMode = configuration.rollMode;
		}
		// Handle type specific 
		// TODO
		// arma {ataque,dano,pericia,atributo,critico,multiplicador}
		if(item.type === "arma"){
			options.pericia = "";
			options.atqBns = "";
			options.dano = "";
			options.atributo = "";
			options.critico = "";
			options.multiplicador = "";
			options.custo = "";
		}
		if(item.type === "poder"){
			options.custo = item.data.data.ativacao.custo
		}
		if(item.type === "magia"){
			options = mergeObject( options, this.getSpellData( id, actorData, configuration ) );
			item.data.data.efeito = options.newFormula.trim();
		}

		// Determine whether the item can be used by testing for resource consumption
		// Commit pending data updates

		// Execute Rolls
		switch ( item.type ) {
			case "arma":
				options.rolls.atq = await item.rollAttack({event});
				options.rolls.dmg = await item.rollDamage({critical: options.rolls.atq._critical, event});
				break; 
			case "magia":
			case "poder":
			case "consumivel":
				options.rolls.dmg = await item.rollFormula({event});
				break;
		}
		
		item.data = copy;
		// Create or return the Chat Message data
		return item.displayCard({options, rollMode, createMessage});
	}

	async rollAttack(options={}) {
		const itemData = this.data.data;
		const actorData = this.actor.data.data;
		// const flags = 

		let title = this.name;
		const rollData = this.getRollData();

		// Define Roll bonuses
		const parts = [];
		if( actorData.pericias[itemData.pericia].value ) parts.push(actorData.pericias[itemData.pericia].value);
		if( itemData.atqBns ) parts.push(itemData.atqBns);
		
		const actorBonusPericia = actorData?.bonuses?.pericias || {};
		if ( actorBonusPericia.geral ) parts.push(actorBonusPericia.geral);
		if ( actorBonusPericia.ataque ) parts.push(actorBonusPericia.ataque);
		const actorBonusAtaque = actorData?.bonuses?.ataque || {};
		if ( actorBonusAtaque.ataque ) parts.push(actorBonusAtaque.ataque);

		// Ammunition Bonus TODO
		

		// Compose roll options
		const rollConfig = mergeObject({
			parts: parts,
			actor: this.actor,
			data: rollData,
			title: title,
			flavor: title
		}, options);
		rollConfig.event = options.event;

		// Weapon Critical
		rollConfig.critical = itemData.criticoM; //TODO mods
		// Invoke the d20 roll helper
		const roll = await d20Roll(rollConfig);
		if ( roll === false ) return null;

		// Commit ammunition consumption
		// TODO

		roll._critical = roll.results[0] >= itemData.criticoM;
		return roll;
	}

	async rollDamage({critical=false, event=null, versatil=false, options={}}={}) {
		const itemData = this.data.data;
		const actorData = this.actor.data.data;
		// Get roll data
		//Refactor item to have part : itemData.damage.parts.map(d => d[0]);
		const parts = [itemData.dano, `@${itemData.atrDan}`, itemData.danoBns];
		const rollData = this.getRollData();

		// Configure the damage roll
		const title = this.name;
		const rollConfig = {
			actor: this.actor,
			critical: critical ?? event?.altKey ?? false,
			criticalMultiplier: itemData.criticoX,
			lancinante: itemData.lancinante,
			data: rollData,
			event: event,
			parts: parts,
			title: title,
			flavor: title
		}
		// TODO adjust versatil

		// Add damage bonus formula
		const actorBonus = actorData.bonuses?.ataque || {};
		if ( actorBonus.dano ) {
			parts.push(actorBonus.dano);
		}

		// Add ammunition damage
		// TODO

		// critical hit damage
		// TODO?

		// Call the roll helper utility
		return damageRoll(mergeObject(rollConfig, options));
	}

	async rollFormula(options={}) {
		const formula = this.data.data.efeito ?? this.data.data.roll;
		if ( !formula ) return false;
		// Define Roll Data
		const rollData = this.getRollData();
		const title = this.name;
		// Invoke the roll and submit it to chat
		const roll = new Roll(formula, rollData).roll();
		if ( roll === false ) return null;
		return roll;
	}

	/* -------------------------------------------- */

	getRollData() {
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = duplicate(this.data.data);

		// Include an ability score modifier if one exists
		const atr = this.data.data.atrBns;
		if ( atr ) {
			const atributo = rollData.atributos[atr];
			rollData["mod"] = atributo.mod || 0;
		}
		return rollData;
	}

	getWeaponData(){
		
	}
	getPowerData(){
		
	}

	getSpellData(id, actorData, configuration=null){
		const options = {};
		const rollData = this.getRollData();
		/* ------------------------ */
		/*		APRIMORAMENTOS		*/
		/* ------------------------ */
		let aplicados = [];
		let aprimoramentos = [];
		let PMTotal = 0;
		let eTruque = false;
		if( configuration ) {
			let aplica = configuration?.aplica ?? false;
			let ids = configuration?.id ?? false;
			configuration = {};

			for (let i = 0; i < aplica.length; i++) {
				if(aplica[i] > 0) {
					configuration[ids[i]] = aplica[i];
				}
			}
			if( id.aprimoramentos && Array.isArray(id.aprimoramentos)) {
				aplicados = id.aprimoramentos.filter( (ap) => Object.keys(configuration).indexOf(ap.id) !== -1 );
			}

		} else if( id.aprimoramentos && Array.isArray(id.aprimoramentos)) {
			aplicados = id.aprimoramentos.filter( (ap) => ap.ativo === true);
		}

		let tempRoll = new Roll(id.efeito, rollData);
		let tempForm = id.efeito.match(/[\+|\-]?((\w+)|[\+|\-]?(\@\w+))/g) ?? [];
		let formula = {};
		aplicados.forEach(function(apr){
			let ap = {};
			ap.gasto = configuration[apr.id] ?? apr.gasto;
			ap.qtd = apr.tipo === "Aumenta" ? ap.gasto / apr.custo : 1;
			PMTotal = PMTotal + parseInt(apr.custo * ap.qtd);
			ap.custo = apr.custo;
			ap.tipo = apr.tipo;
			ap.description = apr.description.replace(/§/g, ap.qtd);
			eTruque = apr.tipo==="Truque";

			
			if (apr.formula.match(/^d\d+$/)) {
				tempRoll.terms[0].faces = apr.formula.match(/\d+/)[0];
				tempForm[0] = tempForm[0].replace(/d\d+/,apr.formula);
			} else if (ap.tipo === "Aumenta" && apr.formula !== "") {
				formula.qtdDados = parseInt(apr.formula.match(/\d+/)) * ap.qtd;
				formula.qtdBonus = parseInt(apr.formula.match(/\+\d/)) * ap.qtd;

				tempRoll.alter(1,formula.qtdDados);
				tempRoll.terms[2] = formula.qtdBonus ? tempRoll.terms[2] + formula.qtdBonus : tempRoll.terms[2];

				tempForm[0] = Die.fromExpression(tempForm[0]).alter(1,formula.qtdDados).formula;
				tempForm[1] = tempForm[1].replace( /\d+/, (parseInt(tempForm[1].match(/\d+/)[0]) + formula.qtdBonus) );
			} else if (apr.formula === "-") {
				formula.override = " ";
			} else if (apr.formula !== "") {
				formula.override = apr.formula;
			}
			aprimoramentos.push(ap);
		});
		options.newFormula = formula.override ? formula.override : tempForm.join("");

		/* ------------------------ */
		/*		APRIMORAMENTOS		*/
		/* ------------------------ */
		
		
		const valorDuracao = id.duracao.unidade != "turno" && id.duracao.unidade != "rodada" ? "" : id.duracao.valor;
		const unidadeDuracao = CONFIG.T20.listaDuracoes[id.duracao.unidade];
		options.spell = {
			tipo: id.tipo,
			circulo: id.circulo,
			escola: id.escola,
			execucao: CONFIG.T20.listaAtivacao[id.ativacao.execucao] || "Duas rodadas",
			alcance: id.alcance,
			alvo: id.alvo,
			area: id.area,
			duracao: valorDuracao ? valorDuracao + " " + unidadeDuracao + (valorDuracao != 1 ? "s" : "") : unidadeDuracao,
			resistencia: id.resistencia,
			cd: actorData.attributes.cd + (actorData.atributos[id.atrRes]?.mod ?? 0) + id.cd
		};
		options.aprimoramentos = aprimoramentos;
		options.custo = !eTruque && id.ativacao.custo > 0
							? Math.max(parseInt(id.ativacao.custo) + PMTotal + (actorData.modificadores.custosPM.bonus ?? 0) - (actorData.modificadores.custosPM.penalidades ?? 0), 1)
							: 0;
		options.truque = eTruque;
		return options;
	}
	
	/* -------------------------------------------- */

	/**
	* Display the chat card for an Item as a Chat Message
	* @param {object} options          Options which configure the display of the item chat card
	* @param {string} rollMode         The message visibility mode to apply to the created card
	* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	*                                  the prepared message data (if false)
	*/
	async displayCard({options, rollMode, createMessage=true}={}) {
		
		// Basic template rendering data
		const token = this.actor.token;
		const templateData = {
			actor: this.actor,
			tokenId: token ? `${token.scene._id}.${token.id}` : null,
			item: this.data,
			data: this.getChatData(),
			labels: this.labels
		};
		// Other Template Data
		if(options.rolls.atq) await options.rolls.atq.render().then((r)=> {templateData.roll = r});
		if(options.rolls.dmg) await options.rolls.dmg.render().then((r)=> {templateData.rollDano = r});

		let teste = mergeObject(templateData,options);
		
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
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}

	getChatData(htmlOptions={}) {
		const data = duplicate(this.data.data);
		const labels = this.labels;

		// Rich text description
		data.description = TextEditor.enrichHTML(data.description, htmlOptions);

		return data;
	}
}