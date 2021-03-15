import { T20Utility } from '../utility.js';
import { T20Conditions } from "../conditions/conditions.js";
import { d20Roll, damageRoll } from '../dice.js';
import AprimoramentoApplication from "../apps/aprimoramento-app.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js";

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
		html.on('click', '.apply-button-ef', this._onChatCardApplyEffect.bind(this));
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

	static _onChatCardApplyEffect(event) {
		event.preventDefault();
		const chatCardId = event.currentTarget.closest(".chat-message").dataset.messageId;
		const buttonId = event.currentTarget.dataset.effectIndex;
		const actors = canvas.tokens.controlled;
		if ( actors && buttonId>=0){
			const chatEffect = game.messages.get(chatCardId).data.flags.t20?.effects[buttonId];
			if(chatEffect.data.changes){
				chatEffect.data.changes.sort((c,d)=> typeof c.value === "string" ? 1 : -1 );
				chatEffect.data.changes = chatEffect.data.changes.reduce((object, item) => {
					let idx = object.map(ob=> ob.key).indexOf(item.key);
					if (idx >= 0) {
						object[idx].value += item.value;
					} else {
						object.push({key:item.key,mode:item.mode,value:item.value})
					}
					return object;
				}, []);
			}
			actors.forEach(function(ac){
				ActiveEffect.create(chatEffect.data,ac.actor).create();
			});
		}

	}
	/* -------------------------------------------- */

	/**
	* Roll the item to Chat, creating a chat card
	* @param {string} [rollMode]             The roll display mode with which to display (or not) the card
	* @return {Promise<ChatMessage|object|void>}
	*/
	async roll({rollMode,createMessage=true,extra={}}={}) {
		let item = this;
		let copy = duplicate(this);
		const actor = this.actor;
		let options = {};
		// options.rolls = {};
		options.rolls = [];
		// Reference aspects of the item data necessary for usage
		const id = this.data.data;                // Item data
		if(extra){
			Object.entries(extra).forEach(function(ex){
				ex[0] = {atq:"atqBns", dadoDano: "dano", dano: "danoBns", margemCritico: "criticoM", multCritico: "criticoX", pericia: "pericia", atributoAtq: "atrAtq", atributoDano:"atrDan"}[ex[0]]
				if(ex[1]){
					if(["atqBns","danoBns"].includes(ex[0])){
						ex[1].match(/=/) ? id[ex[0]] = ex[1].replace("=","") : id[ex[0]] += "+"+ex[1];
					} else if(["criticoX","criticoM"].includes(ex[0])){
						ex[1].match(/=/) ? id[ex[0]] = ex[1].replace("=","") : id[ex[0]] += Number(ex[1]);
					} else if(["atrAtq","atrDan", "pericia"].includes(ex[0])){
						id[ex[0]] = ex[1].replace("=","");
					}
				}
			});
		}
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
			options = mergeObject( options, this.getArmaData( id, actorData, configuration ) );
		}
		if(item.type === "poder"){
			options = mergeObject( options, this.getItemData( id, actorData, configuration ) );
		}
		if(item.type === "magia"){
			options = mergeObject( options, this.getItemData( id, actorData, configuration ) );
		}

		// Determine whether the item can be used by testing for resource consumption
		// Commit pending data updates

		// Execute Rolls
		switch ( item.type ) {
			case "arma":
				options.rolls.push(await item.rollAttack({aeparts: options.atqparts, event}));
				options.rolls.push(await item.rollDamage({aeparts: options.dmgparts, critical: options.rolls[0]._critical, options:options, event}))
				break; 
			case "magia":
			case "poder":
			case "consumivel":
				// options.rolls.dmg = await item.rollFormula({options, event});
				let roll = await item.rollFormula({options, event});
				if(roll) options.rolls.push(roll);
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
		if ( itemData.pericia != "0" && (this.actor.data.type != "npc" || actorData.pericias[itemData.pericia].value != 0)) {
			if ( actorData.pericias[itemData.pericia].atributo != itemData.atrAtq ) {
				const atributoOriginal = actorData.atributos[actorData.pericias[itemData.pericia].atributo].mod;
				parts.push(actorData.pericias[itemData.pericia].value - atributoOriginal + (actorData.atributos[itemData.atrAtq].mod ?? 0))
			}
			else if( actorData.pericias[itemData.pericia].value ) {
				parts.push(actorData.pericias[itemData.pericia].value);
			}
		}
		else if ( itemData.atrAtq != "0") parts.push(actorData.atributos[itemData.atrAtq].mod);
		if( itemData.atqBns && itemData.atqBns != "0" ) parts.push(itemData.atqBns);
		
		const bonuses = this.actor.data.data?.modificadores.pericias || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( bonuses.ataque ) parts.push(bonuses.ataque);
		if ( itemData.pericia != "0" && actorData.pericias[itemData.pericia].condi ) parts.push(actorData.pericias[itemData.pericia].condi);

		if( options.aeparts?.length > 0 ) {
			parts.push(...options.aeparts);
		}

		// Ammunition Bonus TODO
		// Compose roll options
		const rollConfig = {
			parts: parts,
			actor: this.actor,
			data: rollData,
			title: title,
			flavor: title
		};
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

	async rollDamage({critical=false, event=null, versatil=false, aeparts=[], options={}}={}) {
		const itemData = this.data.data;
		const actorData = this.actor.data.data;
		// Get roll data
		//Refactor item to have part : itemData.damage.parts.map(d => d[0]);
		const parts = [itemData.dano];
		if (itemData.atrDan != "0") parts.push(`@${itemData.atrDan}`);
		if (itemData.danoBns != "0") parts.push(itemData.danoBns);
		const rollData = this.getRollData();
		// Configure the damage roll
		const title = this.name;

		if( aeparts?.length > 0 ) {
			parts.push(...aeparts);
		}
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
		const bonuses = this.actor.data.data?.modificadores.dano || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( itemData.pericia=="lut" && bonuses.cac ) parts.push(bonuses.cac);
		if ( itemData.pericia=="pon" && bonuses.ad ) parts.push(bonuses.ad);

		// Add ammunition damage
		// TODO

		// Call the roll helper utility
		return damageRoll(mergeObject(rollConfig, options));
	}

	async rollFormula({options={}}) {
		const formula = this.data.data.efeito ?? this.data.data.roll;
		if ( !formula ) return false;
		// Define Roll Data
		const rollData = this.getRollData();
		const title = this.name;
		// Invoke the roll and submit it to chat
		const min = options.minmax && options.minmax == "min" ? true : false;
		const max = options.minmax && options.minmax == "max" ? true : false;
		const roll = new Roll(formula, rollData).evaluate({maximize:max,minimize:min});
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

	getArmaData(id, actorData, configuration=null){
		let options = {};
		const rollData = this.getRollData();
		let ret = {
			atqparts:[],
			dmgparts:[],
			custo:0,
			aprimoramentos: []
		}
		let passos = 0;
		let aplicados = {};

		/*		APRIMORAMENTOS		*/
		if( configuration ) {
			let aplica = [].concat(configuration?.aplica) ?? [];
			let ids = [].concat(configuration?.id) ?? [];

			const ae = this.actor.effects.filter(ef=> ids.includes(ef.id));
			aplica.forEach(function(ap, ind){
				if(ap && ap !== "0"){
					aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
				}
			});
			const actor = this.actor;
			let aprimoramentos = this.effects.filter(ef => Object.keys(aplicados).includes(ef.id) );
			let sae = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
			aprimoramentos = aprimoramentos.concat(sae);
			let mods = {};
			let camposarma = ["criticoM","criticoX","tipo","alcance"]
			let _campos = {};
			aprimoramentos.forEach(function(ef){
				if( !mods[ef.sourceName] ) mods[ef.sourceName] = {ataque:[],dano:""};
				if( Number(ef.data.flags.t20.custo) ) ret.custo += Number(ef.data.flags.t20.custo) * aplicados[ef.id];
				let ap = {
					description: ef._sourceName,
				}
				if (Number(ef.data.flags.t20.custo)) ap.custo = ef.data.flags.t20.custo * aplicados[ef.id];
				if (ret.aprimoramentos.find(i=>i.description == ef._sourceName)) {
					ret.aprimoramentos.map(function(i){if(i.description == ef._sourceName) i.custo += ap.custo});
				} else {
					ret.aprimoramentos.push(ap);
				}
				ef.data.changes.forEach(function(ch){
					let key = ch.key;
					let mode = ch.mode;
					let value = ch.value;
					let sourceName = ef.sourceName;
					if (ch.key.match(/\@([^\#]+)\#/)){
						sourceName = ch.key.match(/\@([^\#]+)\#/)[1];
						key = ch.key.split("#")[1];
						if( !mods[sourceName] ) mods[sourceName] = {ataque:[],dano:""};
					}
					if(camposarma.includes(key)){
						if(mode === 2) _campos[key] = Number(id[key]) + Number(value) || id[key];
						if(mode === 5) _campos[key] = value;
					} else if(["$ataque","ataque"].includes(key)){
						// if(mode === 1 && Number(value)) mods[sourceName].ataque = mods[sourceName].ataque * (Number(value) * aplicados[ef.id]);
						if(mode === 1 && Number(value)) mods[sourceName].ataque = mods[sourceName].ataque.map(n => Number(n) * (Number(value) + aplicados[ef.id]-1) || n);
						if(mode === 2) mods[sourceName].ataque.push(Number(value) * aplicados[ef.id] || value);
						if(mode === 5) mods[sourceName].ataque = [value];
					} else if(["$dano","dano","roll"].includes(key)){
						// custom 1d8 > mods[].aumentadado = X * qtd
						if(mode === 0 && value.match(/\d+d\d+/)){
							let tempAp = [];
							if ( !mods[sourceName].aumentaDado ) mods[sourceName].aumentaDado = 0;
							if ( !mods[sourceName].aumentaNum ) mods[sourceName].aumentaNum = 0;
							
							value.match(/(\d+^[d])|(d)|(^[d]\d+)|([\+|\-])|(\d+)|(\@\w+)/g).forEach(rt => tempAp.push(Number(rt) * aplicados[ef.id]||rt));
							if( tempAp[0] ) mods[sourceName].aumentaDado += tempAp[0];
							if( tempAp[4] ) mods[sourceName].aumentaNum += tempAp[4];
						}
						// custom d12 > mods[].dado = d8
						if(mode === 0 && value.match(/^d\d+$/)) mods[sourceName].dado = value; 
						if ( mode === 0 && ["max","min"].includes(ch.value.toLowerCase().trim()) ){ //make min/max
							options.minmax = ch.value.toLowerCase().trim();
						}
						// adcion 1d8 > mods[sourceName].dano = 1d8
						if(mode === 1 && ( Number(value) )) mods[sourceName].dano = mods[sourceName].dano * (Number(value) + aplicados[ef.id] -1);
						if(mode === 2 && ( Number(value) || value.match(/\d+d\d+|@\w+/))) mods[sourceName].dano = Number(value) * aplicados[ef.id] || value;
						if(mode === 2 && (!Number(value) && value.match(/roll/))) {
							let tempIt = actor.items.get(ef.data.origin.split(".")[3]).data.data;
							mods[sourceName].dano = tempIt.roll ?? tempIt.efeito ?? tempIt.formula;
						}
						// subst 1d6 > mods[sourceName].dano = 1d6
						if(mode === 5 && value.match(/\d+d\d+/)) mods[sourceName].override = value; 
					} else if(["$passos","passos"].includes(key)){
						if(mode === 2) passos += Number(value) * aplicados[ef.id];
					}

				});

			});
			for (var i = 0; i < Object.keys(mods).length; i++) {
				let m = mods[Object.keys(mods)[i]];
				if ( m.ataque.length ) ret.atqparts = ret.atqparts.concat(m.ataque);
				if (m.dano && (m.aumentaDado || m.aumentaNum || m.dado || m.override)){
					m.dano = this.applyRollChanges(m.dano, m);
				} 
				ret.dmgparts.push( m.dano );
			}
			mergeObject(this.data.data, _campos);
			if(Number(passos) && passos!==0){
				this.data.data.dano = this.applyRollChanges(this.data.data.dano, {passo:passos});
			}
			mergeObject(options,ret);
			if(configuration.bonus) options.atqparts.push(configuration.bonus);
			if(configuration.bonusdano) options.dmgparts.push(configuration.bonusdano);
		}
		return options;
	}

	getItemData(id, actorData, configuration=null){
		const options = {};
		const rollData = this.getRollData();
		
		const valorDuracao = id.duracao.unidade != "turno" && id.duracao.unidade != "rodada" ? "" : id.duracao.valor;
		const unidadeDuracao = CONFIG.T20.listaDuracoes[id.duracao.unidade];
		let formula = [];
		formula.push(id.roll ?? id.dano ?? id.efeito);
		let rollMods = {
			dado:null,
			passo:0,
			override:null,
			aumentaDado:0,
			aumentaNum:0
		}
		
		if(this.type === "magia"){
			// set Original spell header
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
		}
		
		options.custo = id.ativacao.custo > 0 ? Number(id.ativacao.custo) + (actorData.modificadores?.custosPM?.bonus ?? 0) : 0;
		options.truque = false;
		options.aprimoramentos = [];
		options.effects = [];

		let aprimoramentos = [];
		let aplicados = {};
		let changes = [];
		let flags = {};
		// get Active Effects from this spell
		let effectList = this.effects.filter( ef => !ef.data.flags.t20.onuse && !ef.data.disabled);
		let optEffectList = this.effects.filter( ef => !ef.data.flags.t20.onuse && ef.data.disabled);
		if ( configuration ) {
			let aplica = [].concat(configuration?.aplica) ?? [];
			let ids = [].concat(configuration?.id) ?? [];
			if (configuration?.bonus) formula.push(configuration?.bonus);
			if (configuration?.bonusdano) formula.push(configuration?.bonusdano);
			// Set obj of applied effects
			// key => ae.uuid	value => amount of aplications
			aplica.forEach(function(ap, ind){
				if(ap && ap !== "0"){
					aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
				}
			});
			// get Aprimoramentos from this item
			aprimoramentos = this.effects.filter(ef => Object.keys(aplicados).includes(ef.id) );
			let ae = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
			if ( ae.length ) aprimoramentos = aprimoramentos.concat(ae);
			
			aprimoramentos = aprimoramentos.sort((a,b) => (a.data.flags.t20.aumenta && !b.data.flags.t20.aumenta) ? 1 : ((b.data.flags.t20.aumenta && !a.data.flags.t20.aumenta) ? -1 : 0));
			
			// create new Active Effect to concatenate changes
			let campos = ["alcance","alvo","area","execucao","duracao","resistencia","atrRes","cd","tipo","escola"];
			[effectList,optEffectList].forEach(function(list){
				list.forEach(function(ef, index){
					changes.push([]);
					ef.data.changes.forEach(function(ch){
						changes[index].push({
							key: ch.key,
							value: Number(ch.value),
							mode: ch.mode
						});
					});
				});
			});


			let _campos = {
				custo: 0
			};
			
			aprimoramentos.forEach(function(ef){
				// if(ef.data.flags.t20?.durationScene) 
				if ( ef.data.flags.ActiveAuras?.isAura ) flags["ActiveAuras"] = ef.data.flags.ActiveAuras;

				ef.data.changes.forEach(function(ch){
					if( campos.includes(ch.key) ){
						if (ch.mode === 5) _campos[ch.key] = ch.value;
						// if (ch.mode === 2) _campos[ch.key] = ch.value;
						if ( ch.mode === 2 && options.spell[ch.key] && ch.value && options.spell[ch.key].match(/[\d+]?[,]?\d+/) && ch.value.toString().match(/[\d+]?[,]?\d+/) ) {
							let n1 = options.spell[ch.key].match(/[\d+]?[,]?\d+/)[0].replace(",",".");
							let n2 = ch.value.toString().match(/[\d+]?[,]?\d+/)[0].replace(",",".");
							let n3 = Number(n1) + ( Number(n2) * aplicados[ef.id] ) + "";
							_campos[ch.key] = options.spell[ch.key].replace(n1 , n3.replace(".",","));
						}
					}
					// include effect from the item
					else if( ch.key === "efeito"){
						let tef = optEffectList.find(ef => ef.data.label === ch.value );
						if ( tef ) effectList.push(tef);
					}
					// include condition
					else if( ch.key === "condicao"){
						let tef = T20Conditions[ch.value.toLowerCase().trim()];
						if ( tef ) effectList.push(ActiveEffect.create(tef));
					}
					// adds new dice
					else if( ch.key === "roll" && ch.mode === 2 ){
						formula.push(ch.value);
					}
					// overwrite main roll
					else if( ch.key === "roll" && ch.mode === 5 ){
						rollMods.override = ch.value;
					}
					// Customizing rolls , change faces, include modifiers
					else if( ch.key === "roll" && ch.mode === 0 ){
						if(formula[0].match(/\d+d\d+/) && ch.value.match(/\d+d\d+/)){ //adds more dice
							let tempAp = [];
							ch.value.match(/(\d+^[d])|(d)|(^[d]\d+)|([\+|\-])|(\d+)|(\@\w+)/g).forEach(rt => tempAp.push(Number(rt) * aplicados[ef.id]||rt));
							if( tempAp[0] ) rollMods.aumentaDado += tempAp[0];
							if( tempAp[4] ) rollMods.aumentaNum += tempAp[4];
						}else if(ch.value.match(/^d\d+$/)){ //change faces
							// formula[0] = formula[0].replace(/d\d+/, ch.value);
							rollMods.dado = ch.value;
						} else if ( ["max","min"].includes(ch.value.toLowerCase().trim()) ){ //make min/max
							options.minmax = ch.value.toLowerCase().trim();
						}
						// TODO MODIFIERS "r" "x" "xo" "k" "kh" "kl" "d" "dh" "dl" "cs" "cf" "df" "sf" "ms"
						// TODO "+1 pra cada dado"
					} else if( ch.key !== "roll" ) {
						changes.forEach(function(efch){
							if( !ef.data.flags.t20.aumenta || ( ef.data.flags.t20.aumenta && efch.map(ch => ch.key).includes(ch.key) ) ) {
								efch.push({
									key: ch.key,
									value: Number(ch.value) * aplicados[ef.id] || ch.value,
									mode: ch.mode
								});
							}
						});

					}
				});
				if ( ef.data.flags.t20.custo === "" ){
					options.truque = true;
				} else if ( ef.data.flags.t20.custo ) {
					options.custo += Number(ef.data.flags.t20.custo) * aplicados[ef.id];
				}

				options.aprimoramentos.push({
					description: ef.data.label,
					custo: (Number(ef.data.flags.t20.custo) || 0) * aplicados[ef.id],
					qtd: aplicados[ef.id]
				});

			}); 
			// Merge objects to overwrite spellHeader data // TODO add header to everything?
			if(this.type == "magia") mergeObject(options.spell, _campos);
		}
		// Create effects to embbed at chat card
		effectList.forEach(function(ef, index){
			let tempEffect = ActiveEffect.create({
				label: ef.data?.label ?? this.data.name,
				icon: ef.data?.icon ?? this.data.img,
				origin: ef.data?.origin ?? undefined,
				flags: mergeObject(ef.data.flags, flags, { temp: true }),
				duration: ef.data?.duration ?? undefined,
				disabled: false,
				changes: changes[index] ?? ef.data.changes
			});
			tempEffect.data.changes = tempEffect.data.changes.filter(ch => ch.key.match(/^data./i));
			let efl = ef.data?.label;
			if(T20Conditions[efl.slugify().replace("-","")])
				tempEffect = ActiveEffect.create(T20Conditions[efl.slugify().replace("-","")]);
			options.effects.push(tempEffect);
		});
		
		options.custo = options.truque || !id.ativacao.custo ? 0 : Math.max(options.custo,1);
		
		// Initiate measured template creation
		let createMeasuredTemplate = true;
		if ( options.spell?.area.match(/(\d+m)|(linha)/i) ) {
			let mtData = {};
			mtData.type = options.spell.area.match(/(\d+m de raio)|(cubo)|(quadrado)|(linha)|(cone)/i)[0];
			mtData.type = mtData.type.toLowerCase();
			if(mtData.type.match(/de raio/i)) mtData.type = "circle";
			if(mtData.type.match(/cubo|quadrado/i)) mtData.type = "rect";
			if ( mtData.type == "linha" ){
				mtData.type = "ray";
				if ( options.spell.alcance.match(/m[eé]dio/i) ) {
					mtData.distance = 30;
				} else if ( options.spell.alcance.match(/longo/i)) {
					mtData.distance = 90;
				} else {
					mtData.distance = 9;
				}
			} else {
				mtData.distance = options.spell.area.match(/((\d+)?[,]?\d+)(m)/i)[1] || 0;
				mtData.distance = mtData.distance.replace(",",".");
				mtData.distance = Number(mtData.distance) || 1.5;
			}
			mtData.actor = this.actor;
			const template = AbilityTemplate.fromData(mtData);
			if ( template ) template.drawPreview();
		}
		formula[0] = this.applyRollChanges(formula[0], rollMods);
		id.efeito = formula.join("+");
		return options;
	}

	/* -------------------------------------------- */
	applyRollChanges(roll, rollMods){
	    let r;
	    if ( rollMods.override || rollMods.override == "" ) roll = rollMods.override;
	    if ( typeof rollMods.dado === "string" ) roll = roll.replace(/d\d+/, rollMods.dado);
	    if ( rollMods.passo ) {
			let indx = -1;
			if( CONFIG.T20.passosDano[roll] && CONFIG.T20.passosDano[roll] !== -1 ){
				 indx = CONFIG.T20.passosDano[roll].indexOf(roll);
				 roll = CONFIG.T20.passosDano[roll][indx+rollMods.passo] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr1.indexOf(roll)){
				 indx = CONFIG.T20.passosDano.arr1.indexOf(roll);
				 roll = CONFIG.T20.passosDano.arr1[indx+rollMods.passo] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr2.indexOf(roll)){
				 indx = CONFIG.T20.passosDano.arr2.indexOf(roll);
				 roll = CONFIG.T20.passosDano.arr2[indx+rollMods.passo] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr3.indexOf(roll)){
				indx = CONFIG.T20.passosDano.arr3.indexOf(roll);
				roll = CONFIG.T20.passosDano.arr3[indx+rollMods.passo] || "4d12";
			}
	    }
	    if ( rollMods.aumentaDado ) roll = new Roll(roll).alter(1, rollMods.aumentaDado).formula;
	    if ( rollMods.aumentaNum ) {
	        r = new Roll(roll);
	        if ( r.terms[2] ) r.terms[2] = r.terms[2] + rollMods.aumentaNum;
	        else r.terms[2] = rollMods.aumentaNum;
	        roll = r.formula
	    };
	    return roll;
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
		rollMode = rollMode || game.settings.get("core", "rollMode");
		const token = this.actor.token;
		const templateData = {
			actor: this.actor,
			tokenId: token ? `${token.scene._id}.${token.id}` : null,
			_rolls: [],
			item: this.data,
			data: this.getChatData(),
			labels: this.labels
		};
		for (const roll of options.rolls){
			roll.tipo = roll.dice[0].faces !== 20 ? "roll--dano" : roll._critical ? "critico" : roll.results[0] == 1 ? "falha" : "";
			roll.title = roll.tipo =="roll--dano"? "Dano" : this.type == "arma" ? "Ataque" : "";
			await roll.render().then((r)=> {templateData._rolls.push(r)});
		}

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if ( this.actor && options.custo && autoSpendMana ) {
			this.actor.spendMana(options.custo, 0, false);
		}

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
			flags: {"core.canPopout": true, "t20.effects": options.effects}
		};

		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode);

		if (game?.dice3d?.show) {
			let wd = {
				whisper: (["gmroll", "blindroll"].includes(rollMode) ? ChatMessage.getWhisperRecipients("GM") 
					: (rollMode === "selfroll" ? [game.user._id] : null)),
				blind: rollMode === "blindroll"
			}
			for (const roll of options.rolls){
				game.dice3d.showForRoll(roll, game.user, true, wd.whisper, wd.blind)
			}
		}
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