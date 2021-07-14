import { T20Conditions } from "../conditions/conditions.js";
import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemT20 extends Item {
	/* -------------------------------------------- */
	/*  Item Properties															*/
	/* -------------------------------------------- */

	/**
	 * Does the Item implement a attack roll as part of its usage
	 * @type {boolean}
	 */
	 get hasAttack() {
		return !!this.data.data.rolls.find(r=>r.type=="ataque");;
		!!(this.data.data.rolls?.ataque[0] && this.data.data.rolls.ataque[0].parts.length);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a damage roll as part of its usage
	 * @type {boolean}
	 */
	get hasDamage() {
		return !!this.data.data.rolls.find(r=>r.type=="dano");
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a versatile damage roll as part of its usage
	 * @type {boolean}
	 */
	get isVersatile() {
		return !!(this.hasDamage && this.data.data.propriedades.ver);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a saving throw as part of its usage
	 * @type {boolean}
	 */
	get hasSave() {
		const resistencia = this.data.data?.resistencia || {};
		return !!(resistencia.atributo && resistencia.value);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have a target
	 * @type {boolean}
	 */
	get hasTarget() {
		const target = this.data.data.target;
		return target && !["none",""].includes(target.type);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have an area of effect target
	 * @type {boolean}
	 */
	get hasAreaTarget() {
		const target = this.data.data.area;
		return target? true : false;
	}

	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	 get aprimoramentosValidos() {
		if( !this.isOwned ) return [];
		const type = this.data.type;
		let effects = [];

		const types = {magia:"spell",arma:"attack",pericia:"skill",atributo:"ability",consumivel:"consumable",poder:"power"};

		for ( let i of this.actor.effects.values() ) {
			if( !i.getFlag("tormenta20","onuse") ) continue;
			if( i.getFlag("tormenta20", types[type]) ) effects.push(i);
		}

		for ( let i of this.effects.values() ) {
			if( !i.getFlag("tormenta20","onuse") ) continue;
			if( i.getFlag("tormenta20", "self") ) effects.push(i);
		}
		return effects;
	}

	/* -------------------------------------------- */
	/*	Data Preparation														*/
	/* -------------------------------------------- */
	
	/**
	* Augment the basic Item data model with additional dynamic data.
	*/
	prepareDerivedData() {
		super.prepareDerivedData();
		
		const itemData = this.data;
		const data = itemData.data;
		const C = CONFIG.T20;
		const labels = this.labels = {};
		
		// Classes
		if ( data.type === "classe" ) {
			data.niveis = Math.clamped(data.data.niveis, 1, 20);
		}

		// Armas
		if ( itemData.type === "arma" ) {
			labels.critico = `${data.criticoM}/${data.criticoX}x`
		}
		// Magia
		else if ( itemData.type === "magia" ) {
			//data.modoPreparo = data.modoPreparo || "preparada";
			labels.tipo = game.i18n.localize(C.spellType[data.tipo]);
			labels.nivel = game.i18n.format("T20.SpellLevel", {lvl:data.circulo});
			labels.escola = game.i18n.localize(C.spellSchools[data.escola]);
			labels.materiais = data.meteriais?.value ?? null;
		}
		// Poder
		else if ( itemData.type === "poder" ){
			if(data.ativacao && data.ativacao.execucao){
				
				// labels.tipoPoder = 
				//data.ativacao.execucao;
				//C.abilityActivationTypes[data.ativacao.execucao].replace(/Ação| |de/g, "");
			}
		}
		// Item
		else if ( itemData.type === "equipamento"){
			labels.armadura = data.armadura.valor ? `${data.armadura.valor} ${game.i18n.localize("T20.Defesa")}` : "";
		}

		// Ativavel
		if ( data.hasOwnProperty("ativacao") ) {
			let act = data.ativacao || {};
			if ( act ) labels.ativacao = act.qtd ? [act.qtd, game.i18n.localize(C.abilityActivationTypes[act.execucao])].join(" ") : game.i18n.localize(C.abilityActivationTypes[act.execucao]);
			
			//[act.qtd, C.abilityActivationTypes[act.type]].filterJoin(" ");
			if ( act && act.custo > 0) labels.custoPM = act.custo + " PM";

			// Alvo TODO
			let tgt = data.target || {};
			if (["none", "self"].includes(tgt.unidades)) tgt.value = null;
			if (["none", "self"].includes(tgt.type)) {
				tgt.value = null;
				tgt.unidades = null;
			}
			labels.target = [tgt.value, C.distanceUnits[tgt.unidades], C.targetTypes[tgt.type]].filterJoin(" ") ?? "";
			labels.alvo = data.alvo;
			labels.area = data.area;

			// Alcance
			labels.range = game.i18n.localize(C.distanceUnits[data.alcance]);

			// Efeito
			labels.effect = data.efeito;

			// Duração
			let dur = data.duracao || {};
			if (["inst", "perm", "cena","sust"].includes(dur.units)) dur.value = null;
			labels.duration = dur.value? [dur.value, game.i18n.localize(C.timePeriods[dur.units])].filterJoin(" ") : game.i18n.localize(C.timePeriods[dur.units]);
		}

		if ( data.hasOwnProperty("resistencia") ) {
			let save = data.resistencia || {};
			let cd = 0 + (Number(save.bonus) || 0);
			labels.save = cd ? save.txt + ` (CD ${cd})` : save.txt;
			
			
		}

		// Tipos de Dano
		if( !(data.rolls instanceof Array) ) data.rolls = [];
		if ( data.rolls?.find(r=> r.type == "dano") ) {
			let dano = data.rolls.find(r=> r.type == "dano") || {};
			if ( dano.parts ) {
				labels.dano = dano.parts.map(d => d[0]).join(" + ").replace(/\+ -/g, "- ");
				labels.damageTypes = dano.parts.map(d => C.damageTypes[d[1]]).join(", ");
			}
		}

		if ( itemData.type === "magia" ) {
			//Execução: padrão; Alcance: curto; Alvo: 1 criatura; Area:; Efeito:; Duração: instantânea; Resistência: Vontade parcial.
			labels.header = "";
			labels.header += labels.ativacao? `<b>Execução:</b> ${labels.ativacao}; ` : "";
			labels.header += labels.range? `<b>Alcance:</b> ${labels.range}; ` : "";
			labels.header += labels.alvo? `<b>Alvo:</b> ${labels.alvo}; ` : "";
			labels.header += labels.area? `<b>Área:</b> ${labels.area}; ` : "";
			labels.header += labels.effect? `<b>Efeito:</b> ${labels.effect}; ` : "";
			labels.header += labels.duration? `<b>Duração:</b> ${labels.duration}; ` : "";
			labels.header += labels.save? `<b>Resistência:</b> ${labels.save}; ` : "";
		}

		// if this item is owned, we prepareFinalAttributes() at the end of actor init
		if (!this.isOwned) this.prepareFinalAttributes();
	}

	/* -------------------------------------------- */

	/**
	 * Compute item attributes which might depend on prepared actor data.
	 */
	prepareFinalAttributes() {
		if ( this.hasSave ) {
			// Saving throws
			this.getSaveDC();
		}

		if ( this.hasAttack ) {
			// To Hit
			this.getAttackToHit();
		}

		if ( this.hasDamage ) {
			// Damage Label
			this.getDerivedDamageLabel();
		}
	}

	/* -------------------------------------------- */

	/**
	 * Populate a label with the compiled and simplified damage formula
	 * based on owned item actor data. This is only used for display
	 * 
	 * @returns {Array} array of objects with `formula` and `damageType`
	 */
	getDerivedDamageLabel() {
		const itemData = this.data.data;
		if ( !this.hasDamage || !itemData || !this.isOwned ) return [];

		const rollData = this.getRollData();
		// const derivedDamage = itemData.rolls?.find(r=>r.type=="dano")?.parts?.map((damagePart) => ({
		// 	formula: simplifyRollFormula(damagePart[0], rollData, { constantFirst: false }),
		// 	damageType: damagePart[1],
		// }));
		// this.labels.derivedDamage = derivedDamage;
		this.labels.dano = simplifyRollFormula(this.labels.dano, rollData, { constantFirst: false });
		
		return this.labels.dano;
	}

	/* -------------------------------------------- */

	/**
	 * Update the derived spell DC for an item that requires a saving throw
	 * @returns {number|null}
	 */
	getSaveDC() {
		if ( !this.hasSave ) return;
		const resistencia = this.data.data?.resistencia;

		// Ability-score
		resistencia.cd = null;
		if ( this.isOwned ){
			let atr = getProperty(this.actor.data, `data.atributos.${resistencia.atributo}.mod`);
			let nvl = Math.floor(getProperty(this.actor.data, `data.attributes.nivel.value`)/2);
			resistencia.cd = 10 + nvl + atr + resistencia.bonus;
		}

		// Update labels
		const skill = CONFIG.T20.pericias[resistencia.pericia];
		this.labels.resistencia = game.i18n.format("T20.SaveDC", {cd: resistencia.cd || "", pericia: skill});
		return resistencia.dc;
	}

	/* -------------------------------------------- */

	/**
	 * Update a label to the Item detailing its total to hit bonus.
	 * Sources:
	 * - item entity's innate attack bonus
	 * - item's actor's proficiency bonus if applicable
	 * - item's actor's global bonuses to the given item type
	 * - item's ammunition if applicable
	 *
	 * @returns {Object} returns `rollData` and `parts` to be used in the item's Attack roll
	 */
	getAttackToHit() {
		const itemData = this.data.data;
		const rollData = this.getRollData();
		const roll = itemData.rolls.find(r=>r.type == "ataque");
		if ( !this.hasAttack || !itemData || roll.parts.length < 2 ) return;
		// Define Roll bonuses
		const parts = roll.parts.map(p=> p[0] ?? p);//;
		
		// Take no further action for un-owned items
		if ( !this.isOwned ) return {rollData, parts};
		const actorData = this.actor.data.data;
		
		// Add skill bonus
		if ( roll.parts[1][0] ) {
			// parts.push("@skill");
			parts[1] = "@skill";
			rollData.skill = actorData.pericias[roll.parts[1][0]].value ?? 0;
			// Change Skill Ability modifier
			if( roll.parts[1][1] ){
				const skill = actorData.pericias[roll.parts[1][0]];
				const abls = actorData.atributos;
				rollData.skill = skill.value - abls[skill.atributo].mod + abls[roll.parts[1][1]].mod;
			}
		}

		// Item modifications and enchantments TODO
		// const mods = itemData.modificacoes;
		// if( mods?.pungente ) parts.push(2);
		// else if( mods?.certeira ) parts.push(1);
		// const enchants = itemData.encantos;
		// if( enchants?.magnifica || enchants.energetica ) parts.push(4);
		// else if( enchants?.formidavel ) parts.push(2);

		// Actor-level global bonus to attack rolls
		const bonuses = this.actor.data.data.modificadores?.ataque || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( bonuses.cac && roll.parts[1][0] !== "pont"){
			parts.push(bonuses.cac);
		}
		if ( bonuses.ad && roll.parts[1][0] === "pont" ){
			parts.push(bonuses.ad);
		}

		// One-time bonus provided by consumed ammunition
		if ( (itemData.consume?.type === 'ammo') && !!this.actor.items ) {
			const ammoItemData = this.actor.items.get(itemData.consume.target)?.data;

			if (ammoItemData) {
				const ammoItemQuantity = ammoItemData.data.qtd;
				const ammoCanBeConsumed = ammoItemQuantity && (ammoItemQuantity - (itemData.consume.amount ?? 0) >= 0);
				const ammoAtqBns = ammoItemData.data.atqBns;
				const ammoIsTypeConsumable = (ammoItemData.type === "consumivel") && (ammoItemData.data.subtipo === "ammo");
				if ( ammoCanBeConsumed && ammoAtqBns && ammoIsTypeConsumable ) {
					parts.push("@ammo");
					rollData["ammo"] = ammoAtqBns;
				}
			}
		}

		// Condense the resulting attack bonus formula into a simplified label
		parts.shift();
		let toHitLabel = simplifyRollFormula(parts.filterJoin('+'), rollData).trim();
		if (toHitLabel.charAt(0) !== '-') {
			toHitLabel = '+ ' + toHitLabel
		}
		this.labels.toHit = toHitLabel;
		// Update labels and return the prepared roll data
		return {rollData, parts};
	}

	/* -------------------------------------------- */

	/**
	 * Roll the item to Chat, creating a chat card which contains follow up attack or damage roll options
	 * @param {boolean} [configureDialog]     Display a configuration dialog for the item roll, if applicable?
	 * @param {string} [rollMode]             The roll display mode with which to display (or not) the card
	 * @param {boolean} [createMessage]       Whether to automatically create a chat message (if true) or simply return
	 *                                        the prepared chat message data (if false).
	 * @return {Promise<ChatMessage|object|void>}
	 */
	async roll({configureDialog=true, rollMode, createMessage=true, extra={}}={}) {
		let item = this;
		// Hold to check later
		if ( true ) {
			item = this.clone({keepId: true});
			item.data.update({_id: this.id}); // Retain the original ID (needed until 0.8.2+)
			item.prepareFinalAttributes(); // Spell save DC, etc...
		}
		const id = this.data.data;                // Item system data
		const actor = this.actor;
		const ad = actor.data.data;               // Actor system data

		// Reference aspects of the item data necessary for usage
		const hasArea = this.hasAreaTarget;       // Is the ability usage an AoE?
		const resource = id.consume || {};        // Resource consumption
		const uses = id?.uses ?? {};              // Limited uses

		// Define follow-up actions resulting from the item usage
		let createMeasuredTemplate = hasArea;       // Trigger a template creation
		let consumeResource = !!resource.target && (resource.type !== "ammo") // Consume a linked (non-ammo) resource
		let consumeUsage = !!uses.per;              // Consume limited uses
		let consumeQuantity = uses.autoDestroy;     // Consume quantity of the item in lieu of uses
		
		let consumeMana = id.ativacao?.custo > 0 ;  // Consume mana
		let options = {};                           // 

		// Display a configuration dialog to customize the usage
		const needsConfiguration = createMeasuredTemplate || consumeResource || consumeMana || consumeUsage;
		let configuration = {};
		if (configureDialog) {
			configuration = await AbilityUseDialog.create(this);
			if (!configuration) return;
			
			
			// Determine consumption preferences
			// createMeasuredTemplate = Boolean(configuration.placeTemplate);
			consumeUsage = Boolean(configuration.consumeUse);
			consumeResource = Boolean(configuration.consumeResource);
			consumeMana = Boolean(configuration.consumeMana);
			rollMode = configuration.rollMode;
		} else {
			let itActive = this.actor.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.data.disabled);
			let acActive = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.data.disabled);
			let active = itActive.concat(acActive);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.data.flags.tormenta20.custo||"0"};
				return o;
			}, {});
		}

		if ( !isObjectEmpty( extra ) || configuration.bonus || configuration.bonusdano ) {
			item.data.data.rolls.forEach( r => {
				if( r.type == "ataque" ) {
					if ( !["","0",undefined].includes(configuration.bonus) ) r.parts.push([configuration.bonus, ""]);
					if ( !["","0",undefined].includes(extra.pericia) ) r.parts[1][0] = extra.pericia;
					if ( !["","0",undefined].includes(extra.atributoAtq) ) r.parts[1][1] = extra.atributoAtq;
					if ( extra?.atq?.match(/^=/) ) r.parts = [["1d20",""], [extra.atq.replace("=",""),""]];
					else if ( !["","0",undefined].includes(extra.atq) ) r.parts.push([extra.atq, ""]);
				}
				else if( r.type == "dano" ){
					if ( !["","0",undefined].includes(configuration.bonusdano) ) r.parts.push([configuration.bonusdano, ""]);
					if ( !["","0",undefined].includes(extra.dadoDano) ) r.parts[0][0] = extra.dadoDano;
					if ( !["","0",undefined].includes(extra.atributoDano) ) r.parts[1][0] = "@" + extra.atributoDano;
					if ( extra?.dano?.match(/^=/) ) r.parts = [[extra.dano.replace("=",""),""]];
					else if ( !["","0"].includes(extra.dano) ) r.parts.push([extra.dano, ""]);
				}
			});

			if ( extra?.multCritico?.match(/^=/) ) item.data.data.criticoX = 1* extra.multCritico.replace("=","");
			else if ( Number(extra.multCritico) ) item.data.data.criticoX += Number(extra.multCritico);
			if ( extra?.margemCritico?.match(/^=/) ) item.data.data.criticoM = extra.margemCritico.replace("=","");
			else if ( Number(extra.margemCritico) ) item.data.data.criticoM += Number(extra.margemCritico);
		}
		
		options = item.applyAprimoramentos(configuration);
		options.rolls = [];
		// Execute Rolls
		item.data.data.rolled = {};
		

		if( item.data.data.rolls.find(r=>r.type == "ataque" && r.parts.length && r.parts[0][0]) ){
			await item.rollAttack({options:options});
		}
		if( item.data.data.rolls.find(r=>r.type == "formula" && r.parts.length && r.parts[0][0]) ){
			await item.rollFormula({options:options});
		}
		if( item.data.data.rolls.find(r=>r.type == "dano" && r.parts.length && r.parts[0][0]) ){
			await item.rollDamage({options:options});
		}
		
		// Determine whether the item can be used by testing for resource consumption
		// TODO config auto consume settings;
		const setttings = false;
		if( setttings ){
			const usage = item._getUsageUpdates({consumeResource, consumeMana, consumeUsage, consumeQuantity});
			if ( !usage ) return;
			const {actorUpdates, itemUpdates, resourceUpdates} = usage;

			// Commit pending data updates
			if ( !foundry.utils.isObjectEmpty(itemUpdates) ) await item.update(itemUpdates);
			if ( consumeQuantity && (id.quantity === 0) ) await item.delete();
			if ( !foundry.utils.isObjectEmpty(actorUpdates) ) await actor.update(actorUpdates);
			if ( !foundry.utils.isObjectEmpty(resourceUpdates) ) {
				const resource = actor.items.get(id.consume?.target);
				if ( resource ) await resource.update(resourceUpdates);
			}
		}

		// Initiate measured template creation
		if ( createMeasuredTemplate ) {
			const template = AbilityTemplate.fromItem(item);
			if ( template ) {
				template.drawPreview();
				options.template = {
					area: item.data.data.area,
					alcance: item.data.data.alcance
				}
			}
		}
		
		if( consumeMana ) item.data.data.ativacao.custo = item.data.data.ativacao.custo || 1;
		// Create or return the Chat Message data
		if( configuration.brew ){
			let potion = "Poção";
			if( item.data.data.area ) potion = "Granada";
			if( item.data.data.alvo.match(/objeto/) ) potion = "Óleo";
			const itemData = {
				name: `${potion} de ${item.name}`,
				type: "consumivel",
				img: "icons/consumables/potions/bottle-bulb-corked-glowing-red.webp",
				data: item.data.data
			};
			itemData.data.tipo = "potion";
			itemData.data.ativacao.custo = 0;
			actor.createEmbeddedDocuments("Item", [itemData]);
			let msg = `${item.actor.name} criou ${itemData.name}`;
			return ChatMessage.create({content:msg});
		}
		if( id.ativacao.custo && actor.data.data.modificadores.custoPM ){
			item.data.data.ativacao.custo += Number(actor.data.data.modificadores.custoPM);
		}
		
		return item.displayCard({options, rollMode, createMessage});
	}

	/* -------------------------------------------- */

	/**
	 * Verify that the consumed resources used by an Item are available.
	 * Otherwise display an error and return false.
	 * @param {boolean} consumeQuantity     Consume quantity of the item if other consumption modes are not available?
	 * @param {boolean} consumeRecharge     Whether the item consumes the recharge mechanic
	 * @param {boolean} consumeResource     Whether the item consumes a limited resource
	 * @param {string|null} consumeSpellLevel The category of spell slot to consume, or null
	 * @param {boolean} consumeUsage        Whether the item consumes a limited usage
	 * @returns {object|boolean}            A set of data changes to apply when the item is used, or false
	 * @private
	 */
	_getUsageUpdates({consumeQuantity, consumeResource, consumeMana, consumeUsage}) {

		// Reference item data
		const id = this.data.data;
		const actorUpdates = {};
		const itemUpdates = {};
		const resourceUpdates = {};

		// Consume Limited Resource
		if ( consumeResource ) {
			const canConsume = this._handleConsumeResource(itemUpdates, actorUpdates, resourceUpdates);
			if ( canConsume === false ) return false;
		}

		// Consume Spell Slots
		if ( consumeMana && Number.isNumeric(consumeMana)) {
			this.actor.spendMana(consumeMana, 0, false);
		}

		// Consume Limited Usage
		if ( consumeUsage ) {
			const uses = id.uses || {};
			const available = Number(uses.value ?? 0);
			let used = false;

			// Reduce usages
			const remaining = Math.max(available - 1, 0);
			if ( available >= 1 ) {
				used = true;
				itemUpdates["data.uses.value"] = remaining;
			}

			// Reduce quantity if not reducing usages or if usages hit 0 and we are set to consumeQuantity
			if ( consumeQuantity && (!used || (remaining === 0)) ) {
				const q = Number(id.quantity ?? 1);
				if ( q >= 1 ) {
					used = true;
					itemUpdates["data.quantidade"] = Math.max(q - 1, 0);
					itemUpdates["data.uses.value"] = uses.max ?? 1;
				}
			}

			// If the item was not used, return a warning
			if ( !used ) {
				ui.notifications.warn(game.i18n.format("T20.ItemNoUses", {name: this.name}));
				return false;
			}
		}

		// Return the configured usage
		return {itemUpdates, actorUpdates, resourceUpdates};
	}

	/* -------------------------------------------- */

	/**
	 * Handle update actions required when consuming an external resource
	 * @param {object} itemUpdates        An object of data updates applied to this item
	 * @param {object} actorUpdates       An object of data updates applied to the item owner (Actor)
	 * @param {object} resourceUpdates    An object of data updates applied to a different resource item (Item)
	 * @return {boolean|void}             Return false to block further progress, or return nothing to continue
	 * @private
	 */
	_handleConsumeResource(itemUpdates, actorUpdates, resourceUpdates) {
		const actor = this.actor;
		const itemData = this.data.data;
		const consume = itemData.consume || {};
		if ( !consume.type ) return;

		// No consumed target
		const typeLabel = CONFIG.T20.abilityConsumptionTypes[consume.type];
		if ( !consume.target ) {
			ui.notifications.warn(game.i18n.format("T20.ConsumeWarningNoResource", {name: this.name, type: typeLabel}));
			return false;
		}

		// Identify the consumed resource and its current quantity
		let resource = null;
		let amount = Number(consume.amount ?? 1);
		let quantity = 0;
		switch ( consume.type ) {
			case "attribute":
				resource = getProperty(actor.data.data, consume.target);
				quantity = resource || 0;
				break;
			case "ammo":
			case "material":
				resource = actor.items.get(consume.target);
				quantity = resource ? resource.data.data.quantidade : 0;
				break;
		}

		// Verify that a consumed resource is available
		if ( !resource ) {
			ui.notifications.warn(game.i18n.format("T20.ConsumeWarningNoSource", {name: this.name, type: typeLabel}));
			return false;
		}

		// Verify that the required quantity is available
		let remaining = quantity - amount;
		if ( remaining < 0 ) {
			ui.notifications.warn(game.i18n.format("T20.ConsumeWarningNoQuantity", {name: this.name, type: typeLabel}));
			return false;
		}

		// Define updates to provided data objects
		switch ( consume.type ) {
			case "attribute":
				actorUpdates[`data.${consume.target}`] = remaining;
				break;
			case "ammo":
			case "material":
				resourceUpdates["data.quantidade"] = remaining;
				break;
		}
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
			tokenId: token?.uuid || null,
			item: this.data,
			data: this.getChatData(),
			labels: this.labels,
			custo: options.truque? 0 : this.data.data.ativacao.custo || null,
			truque: options.truque,
			aprimoramentos: options.aprimoramentos,
			effects: options.effects,
			placeTemplate: options.template,
			_rolls: []
		};

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if ( templateData.actor && templateData.custo && autoSpendMana ) {
				this.actor.spendMana(templateData.custo, 0, false);
		}

		for( let [key, roll] of Object.entries(this.data.data.rolled) ) {
			roll.tipo = roll.dice[0]?.faces !== 20 ? "roll--dano" : roll._critical ? "critico" : roll._fumble ? "falha" : "";
			roll.options.title = key || "";
			await roll.render().then((r)=> {templateData._rolls.push({template: r, roll: roll})});
		}
		
		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, templateData);

		// Create the ChatMessage data object
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: html,
			flavor: options.chatFlavor || this.data.data.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this.actor, token}),
			flags: {
				"core.canPopout": true,
				"tormenta20.aprimoramentos": options.aprimoramentos,
				"tormenta20.effects": options.effects,
				"tormenta20.itemData": this.data,
				"tormenta20.template": options.template
			}
		};
		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

		if (game?.dice3d?.show) {
			let wd = {
				whisper: (["gmroll", "blindroll"].includes(rollMode) ? ChatMessage.getWhisperRecipients("GM") 
					: (rollMode === "selfroll" ? [game.user._id] : null)),
				blind: rollMode === "blindroll"
			}
			for( let [key, roll] of Object.entries(this.data.data.rolled) ) {
				game.dice3d.showForRoll(roll, game.user, true, wd.whisper, wd.blind)
			}
		}
		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}

	/* -------------------------------------------- */
	/*  Chat Cards																	*/
	/* -------------------------------------------- */

	getChatData(htmlOptions={}) {
		const data = foundry.utils.deepClone(this.data.data);
		const labels = this.labels;

		// Rich text description
		data.description = data.description || {value:"",chat:"",unidentified:""};
		data.description.value = TextEditor.enrichHTML(data.description.value, htmlOptions)
		//TextEditor.enrichHTML(data.description.value, htmlOptions);

		if( this.data.type === "magia" || ( this.data.type === "consumivel" && ["scroll", "potion"].includes(data.subtipo) ) ){
			const headerTags = { ativacao: "Execução", range:"Alcance", target:"Alvo", duracao:"Duração", save:"Resistência" };

			const r = Object.entries(labels).map(function(t){
				if( headerTags.hasOwnProperty(t[0]) && t[1]){
					return `<b>${headerTags[t[0]]}:</b> ${t[1]};`
				} else return;
			});
			data.spellHeader = r.filter(t => t!=null).join(" ");
			// Exec - Alcn - Alvo - Area - Dura - Resis
		}
		return data;
	}

	/* -------------------------------------------- */
	/*  Item Rolls - Attack, Damage, Saves, Checks  */
	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @param {object} options        Roll options which are configured and provided to the d20Roll function
	 * @return {Promise<Roll|null>}   A Promise which resolves to the created Roll instance
	 */
	async rollAttack(options={}) {
		const itemData = this.data.data;
		const flags = this.actor.data.flags.tormenta20 || {};
		// get the parts and rollData for this item's attack
		for (let r of itemData.rolls.filter(i => i.type == "ataque")) {
			// Get roll data
			const {parts, rollData} = this.getAttackToHit();
			const title = this.name;
			// r.parts = r.parts.map(p=> [p[0] || p])[0].concat(parts);
			parts.unshift(r.parts[0][0]);

			// Handle ammunition consumption
			// TODO

			// Compose roll options
			const rollConfig = mergeObject({
				parts: parts,
				actor: this.actor,
				data: rollData,
				title: title,
				flavor: title
			}, options);

			// Expanded critical hit thresholds
			rollConfig.critical = itemData.criticoM;
			
			// Invoke the d20 roll helper
			const roll = await d20Roll(rollConfig);
			if ( roll === false ) return null;
			roll._critical = roll.terms[0].total >= itemData.criticoM;
			roll._fumble = roll.terms[0].total == 1;

			// Commit ammunition consumption on attack rolls resource consumption if the attack roll was made
			// TODO autoSettings
			// if ( ammo && !isObjectEmpty(ammoUpdate) ) await ammo.update(ammoUpdate);
			
			itemData.rolled[r.name] = roll;
		}
	}

	/**
	 * Place a damage roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the damageRoll logic for the core implementation.
	 * @param {MouseEvent} [event]    An event which triggered this roll, if any
	 * @param {boolean} [critical]    Should damage be rolled as a critical hit?
	 * @param {number} [spellLevel]   If the item is a spell, override the level for damage scaling
	 * @param {boolean} [versatile]   If the item is a weapon, roll damage using the versatile formula
	 * @param {object} [options]      Additional options passed to the damageRoll function
	 * @return {Promise<Roll>}        A Promise which resolves to the created Roll instance
	 */
	async rollDamage({critical=false, event=null,  versatile=false, options={}}={}) {
		const itemData = this.data.data;
		const actorData = this.actor.data.data;
		let pericia;
		if(this.type == "arma") {
			critical = itemData.rolled?.Ataque?._critical || false;
			pericia = itemData.rolls.find(i => i.type == "ataque")?.parts[1][0];
		}
		for (let r of itemData.rolls.filter(i => i.type == "dano")) {
			// Get roll data
			const parts = r.parts;//.map(d => d[0]);
			const rollData = this.getRollData();
			// Configure the damage roll
			const title = this.name;
			
			const rollConfig = {
				actor: this.actor,
				critical: critical ?? false,
				criticalMultiplier: itemData.criticoX,
				lancinante: itemData.encantos?.lancinante,
				data: rollData,
				event: event,
				parts: parts,
				title: title,
				flavor: title
			};
			
			// Adjust damage from versatile usage
			if ( versatile && r.versatil ) {
				parts[0][0] = r.versatil;
			}
			
			// Add damage bonus formula
			const bonuses = getProperty(actorData, "modificadores.dano") || {};
			if ( bonuses.geral ) parts.push([bonuses.geral, ""]);
			if ( pericia=="luta" && bonuses.cac ) parts.push([bonuses.cac, ""]);
			if ( pericia=="pont" && bonuses.ad ) parts.push([bonuses.ad,""]);
			if ( this.type=="magia" && bonuses.mag ) parts.push([bonuses.mag,""]);
			// Handle ammunition damage
			// PREPARE
			
			// only add the ammunition damage if the ammution is a consumable with type 'ammo'
			// PREPARE
			
			// Call the roll helper utility
			// return damageRoll(mergeObject(rollConfig, options));
			// result.push(await damageRoll(mergeObject(rollConfig, options)));
			itemData.rolled[r.name] = await damageRoll(mergeObject(rollConfig, options));
		}
		// return result;
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollFormula(options={}) {
		const itemData = this.data.data;
		const actorData = this.actor.data.data;
		const rollData = this.getRollData();
		// Invoke the roll and submit it to chat
		for (let r of itemData.rolls.filter(i => i.type == "formula")) {
			// rolls[r.name] = 
			let temp = new Roll(r.parts[0][0], rollData).roll();
			itemData.rolled[r.name] = temp;
		}
	}

	/* -------------------------------------------- */

	/**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
	getRollData() {
		if ( !this.actor ) return null;
		const rollData = foundry.utils.deepClone(this.actor.getRollData());
		rollData.item = foundry.utils.deepClone(this.data.data);
		if ( this.data.data.rolled ){
			if ( !rollData.roll ) rollData.roll = {};
			for ( let [key, r] of Object.entries(this.data.data.rolled) ) {
				rollData.roll[key] = r.total;
			}
		}
		const atributoChave = this.actor.data.data.attributes.conjuracao;
		rollData["atributoChave"] = 0;
		if( CONFIG.T20.atributos[atributoChave] ){
			rollData["atributoChave"] = this.actor.data.data.atributos[atributoChave].mod;
		}
		
		
		

		// Include an ability score modifier if one exists
		const atr = this.data.data.atrBns;
		if ( atr ) {
			const atributo = rollData.atributos[atr];
			rollData["mod"] = atributo.mod || 0;
		}
		for ( let [key, skl] of  Object.entries(this.actor.data.data.pericias) ){
			rollData[key] = skl.value;
		}
		return rollData;
	}

	/* -------------------------------------------- */
	
	/* APPLY APRIMORAMENTOS */

	/* -------------------------------------------- */
	
	applyAprimoramentos(configuration=null){
		if( !configuration ) return {};
		const C = CONFIG.T20, item = this, id = this.data.data, actor = this.actor;
		const temCusto = id.ativacao.custo > 0;
		const re = {
			faces: /^d\d+$/,
			die: /\d+d\d+[\+|\-]?[\d+]?/,
			split: /(d)|([\+|\-])|(\d+)|(\@\w+)/g,
			perd: /d\*\d+/
		}
		let changes = [], options = {};
		options.aprimoramentos = [];
		options.effects = [];
		let rollMods = id.rolls.reduce(function(acc, r){ 
			acc[r.key] = r.parts.map(i=> ({die:null, dmgStep:0, override:null,
				addDie:0, addNum:0, perDie:0 }) );
			return acc;
		}, {});
		
		// Aprimoramentos Aplicados
		const aplicados = expandObject(configuration).aprs;
		const aprimoramentos = this.aprimoramentosValidos.filter(ef => aplicados[ef.id]?.aplica );
		// Efeitos temporários
		let effectList = this.effects.filter( ef => !ef.data.flags.tormenta20.onuse && !ef.data.disabled);
		let optEffectList = this.effects.filter( ef => !ef.data.flags.tormenta20.onuse && ef.data.disabled);

		
		[effectList,optEffectList].forEach(function(list){
			list.forEach(function(ef, index){
				changes.push([]);
				ef.data.changes.forEach(function(ch){
					changes[index].push({
						key: ch.key,
						value: Number(ch.value) || ch.value,
						mode: ch.mode
					});
				});
			});
		});

		
		// FUNÇÃO DE INTERNA
		const applyChanges = (ch,qtd,ef) => {
			const campos = {
				// ARMA
				// pericia:			["rolls.0.parts.1.0", null ],//C.pericias
				// atributoAtq:	["rolls.0.parts.1.1", C.atributos ],
				// atributoDano:	["rolls.1.parts.1.0", C.atributos ],
				// tipoDano:			["rolls.1.parts.1.1", C.damageTypes ],
				criticoM:			["criticoM", null ],
				criticoX:			["criticoX", null ],
				// ARMA / MAGIA / PODER / CONSUMIVEL
				alcance:			["alcance", C.distanceUnits ],
				// MAGIA / PODER / CONSUMIVEL
				alvo:					["alvo", null ],
				area:					["area", null ],
				execucao:			["ativacao.execucao", C.abilityActivationTypes ],
				duracao:			["duracao.value", C.timePeriods ],
				resistencia:	["resistencia.value", null ],
				atributoCD:		["resistencia.atributo", C.atributos ],
				bonusCD:			["resistencia.bonus", null ],
				efeito: 			["efeito", null ],
				// PERICIA
				atributo:			["atributo", null],
				treino:				["treino", null],
				treinado:			["treinado", null]
			}
			const _campos = {};
			// ROLLS ARRAY
			let rolls = id.rolls.filter(r=> (( (ch.key == "roll" && item.type!=="arma") || r.key == ch.key || r.key.match(new RegExp(ch.key)) || ["pericia", "atributoAtq", "atributoDano", "tipoDano", "passos"].includes(ch.key))  ) ); //&& r.parts[0][0].match(re.die)
			ch.key = ch.key.toString();
			for(let r of rolls){
				// CUSTOM CHANGES
				let p = ef._sourceName ? Math.max( rollMods[r.key].findIndex(i=> i.src == ef._sourceName), 0) : 0;
				if( ch.mode == 0 ) {
					if (ch.key.match(/\@([^\#]+)\#/)){
						r.key = ch.key.match(/\@([^\#]+)\#/)[1];
						ch.key = ch.key.split("#")[1];
					}
					// d12 => muda o dado
					if( ch.value.match(re.faces) ){
						rollMods[r.key][p].die = ch.value;
					}
					// kh => adic o modifier
					else if( Die.MODIFIERS[ch.value.replace(/\d+|\>|\<|\+|\-|\=/, "")] && !["min","max"].includes(ch.value) ){
						if( ch.value.match(/k|kh|kl/) ){
							r.parts[p][0] = r.parts[p][0].replace("1d","2d")+ch.value;
						} else r.parts[p][0] = r.parts[p][0]+ch.value;
					}
					// 1d8+1 => muda a quantidade
					else if( ch.value.match(re.die)
								&& (r.parts[p][0].match(re.die) || rollMods[r.key][p].match(re.die)) ){
						let tempAp = [];
						ch.value.match(re.split).forEach(rt => tempAp.push(Number(rt) * qtd||rt));
						if( tempAp[0] ) rollMods[r.key][p].addDie += tempAp[0];
						if( tempAp[4] ) rollMods[r.key][p].addNum += tempAp[4];
					}
					// d*1 => +1 por dado ie.: 2d8+2 > 2d8+2+2
					else if( ch.value.match(re.perd) ){
						rollMods[r.key][p].perDie += Number(ch.value.match(/\d+/)[0]) || 0;
					}
					// Max/Min => Maximiza Minimiza a Rollagem
					else if( ["max","min"].includes(ch.value) ){
						options.minmax = ch.value;
					}
					// passos 1 => aumenta o dano em um passo 
					else if( r.type == "dano" && ch.key=="passos" ){
						if( Number(ch.value) ){
							rollMods[r.key][p].dmgStep += Number(ch.value) * qtd;
						} else {
							try {
								let x = ch.value.replace("@","");
								ch.value = this.getRollData()[x];
								rollMods[r.key][p].dmgStep += Number(ch.value) * qtd;
							} catch (error) {
								
							}
						}
					}
				}
				// MULTIPLY CHANGES
				else if( ch.mode == 1 ) {
					// Only multiply from the same src
					if( rollMods[r.key].find(m=> m.src == ef._sourceName ) ){
						let temp = r.parts.pop();
						r.parts.push([temp[0]*(Number(ch.value)+qtd-1), ""]);
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					// ADD ROLL FROM ITEM
					if (ch.value == "roll"){
						const itr = actor.items.get(ef.data.origin.split(".")[3])
                              .data.data.rolls.find(r=>r.type=="dano");//(r=>r.key=="dano0");
						r.parts.push(itr.parts[0]);
					} else {
						r.parts.push([Number(ch.value * qtd) || ch.value,""]);
					}
					if( ef._sourceName ){
						rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, src: ef._sourceName } );
					}
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ){
					if( r.type=="dano" ){
						if( item.type == "arma" && ch.key == "atributoDano" ) {
							r.parts[1][0] = ch.value.charAt(0) == "@" ? ch.value : `@${ch.value}`;
						} else if( item.type == "arma" && ch.key == "tipoDano" ) {
							r.parts[0][1] = ch.value;
						} else if( ["","-"].includes(ch.value) ) {
							r.parts = [];
						} else if(Number(ch.value) || ch.value.charAt(0) == "@" || ch.value.match(re.die)) {
							rollMods[r.key][p].override = ch.value;
						}
					}
					else if(r.type=="ataque"){
						if( item.type == "arma" && ch.key == "pericia" ) {
							r.parts[1][0] = ch.value;
						} else if( item.type == "arma" && ch.key == "atributoAtq" ) {
							r.parts[1][1] = ch.value;
						}
					}
				}
			}
			// ITEM DATA
			if( campos[ch.key] ){
				// CUSTOM CHANGES
				if( ch.mode == 0 ) i = 1;
				// MULTIPLY CHANGES
				else if( ch.mode == 1 ) {
					if( Number(ch.value) ){
						let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
						if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)* (Number(ch.value)*qtd);
						else if ( temp ) {
							temp.replace(/\d+/, (match) => Number(match)*(Number(ch.value)*qtd) );
						}
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					re.float = /[\d+]?[,]?\d+/;
					if( Number(ch.value) ){
						let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
						if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qtd);
						else if ( temp ) {
							temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qtd) );
						}
					} else if( ch.value.match(re.float) && ch.key == "area" ){
						let n1 = id.area.match(re.float)[0].replace(",",".");
						let n2 = ch.value.toString().match(re.float)[0].replace(",",".");
						let n3 = Number(n1) + ( Number(n2) * qtd ) + "";
						_campos[ch.key] = id.area.replace(n1.replace(".",",") , n3);
					}
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ) {
					if( campos[ch.key][1] ) {
						_campos[campos[ch.key][0]] = ItemT20.itemKey( ch.value , campos[ch.key][1]);
					} else _campos[campos[ch.key][0]] = ch.value;
				}
				// TODO test
				foundry.utils.mergeObject(id, expandObject(_campos));
			}
			
			// ACTOR DATA
			// TODO

			// ACTIVE EFFECT
			// include effect from the item
			if( ch.key === "efeito"){
				let tef = optEffectList.find(ef => ef.data.label === ch.value );
				if ( tef ) effectList.push(tef);
			}
			// include condition
			else if( ch.key === "condicao"){
				let tef = T20Conditions[ch.value.toLowerCase().trim()];
				if ( tef ) effectList.push(new ActiveEffect(tef));
				// if ( tef ) effectList.push(ActiveEffect.create(tef));
			}
		}
		
		aprimoramentos.sort((a,b)=> (
			(a.data.changes.some(ch=>ch.mode == 5) && !b.data.changes.some(ch=>ch.mode == 5)) ? -1 : (b.data.changes.some(ch=>ch.mode == 5) && !a.data.changes.some(ch=>ch.mode == 5)) ? 1 : 0 
			)
		);
		aprimoramentos.forEach(function(ef){
			// Prepare chat content;
			let ap = {};
			ap.description = item.type == "arma"? ef._sourceName : ef.data.label;
			ap.custo = Number(aplicados[ef.id]?.custo) * aplicados[ef.id]?.aplica || aplicados[ef.id]?.custo;
			ap.qtd = Number(aplicados[ef.id]?.aplica) || 1;
			if( options.aprimoramentos.find(i=> i.description == ap.description ) ){
				let apl =  options.aprimoramentos.find(i=> i.description == ap.description );
				apl.custo += ap.custo || 0;
				apl.qtd += ap.qtd-1 || 0;
			} else {
				options.aprimoramentos.push(ap);
			}
			
			id.ativacao.custo += Number(ap.custo) || 0;
			if( !Number(aplicados[ef.id]?.custo+1) && item.type == "magia" ) options.truque = true;
			
			ef.data.changes.forEach(function(ch){
				
				applyChanges(ch, ap.qtd, ef);

				if( ch.key.match(/^data./) ){
					changes.forEach(function(efch){
						if( !ef.data.flags.tormenta20.aumenta || ( ef.data.flags.tormenta20.aumenta && efch.map(i => i.key).includes(ch.key) ) ) {
							if( ch.key == "data.tamanho" && efch.findIndex(i => i.key=="data.tamanho")){
								efch.splice(efch.findIndex(i => i.key=="data.tamanho"),1);
							}
							efch.push({
								key: ch.key,
								value: Number(ch.value * ap.qtd)  || ch.value,
								mode: ch.mode
							});
						}
					});
				}
			});

		});
		
		// Prepare data from the item to update labels
		item.prepareDerivedData();
		// Apply the modifications to the rolls data
		id.rolls = this.applyRollChanges(rollMods);
		if ( temCusto ) Math.min(id.ativacao.custo || 1);
		// 
		effectList.forEach(function(ef, index){
			let tempEffect = new ActiveEffect({
				label: ef.data?.label ?? this.data.name,
				icon: ef.data?.icon ?? this.data.img,
				origin: ef.data?.origin ?? undefined,
				flags: mergeObject(ef.data.flags, { temp: true }),
				duration: ef.data?.duration ?? undefined,
				disabled: false,
				changes: changes[index] ?? ef.data.changes
			});
			tempEffect.data.changes = tempEffect.data.changes.filter(ch => ch.key.match(/^data./i));
			let efl = ef.data?.label.slugify().replace("-","");
			if(T20Conditions[efl]){
				tempEffect = new ActiveEffect(T20Conditions[efl]);
			}
			options.effects.push(tempEffect);
		});

		return options;
	}

	/* -------------------------------------------- */

	/** 
	 * Realiza as modificações nas formulas de rolagens como alteração de dado, adição de dados
	 * e bônus e aumento de passo;
	 * @param {Object} rollMods   Objeto com os valores a serem modificados;
	 */
	applyRollChanges(rollMods){
		let rolls = this.data.data.rolls;
		let roll;
		for ( let r of rolls ){
			for ( let [i, p] of r.parts.entries() ){
				let dano = p[0] //r.parts[rollMods][0];
				if( rollMods[r.key][i]?.override == "" ){
					r.parts[i] = [];
					continue;
				} else if ( rollMods[r.key][i]?.override ){
					dano = rollMods[r.key][i].override;
				}
		
				if ( typeof rollMods[r.key][i]?.die === "string" ) {
					dano = dano.replace(/d\d+/, rollMods[r.key][i].die);
				}
		
				if ( rollMods[r.key][i]?.dmgStep ) {
					let indx = -1;
					if( CONFIG.T20.passosDano[dano] && CONFIG.T20.passosDano[dano] !== -1 ){
						indx = CONFIG.T20.passosDano[dano].indexOf(dano);
						dano = CONFIG.T20.passosDano[dano][indx+rollMods[r.key][i].dmgStep] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr1.indexOf(dano)){
						indx = CONFIG.T20.passosDano.arr1.indexOf(dano);
						dano = CONFIG.T20.passosDano.arr1[indx+rollMods[r.key][i].passo] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr2.indexOf(dano)){
						indx = CONFIG.T20.passosDano.arr2.indexOf(dano);
						dano = CONFIG.T20.passosDano.arr2[indx+rollMods[r.key][i].passo] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr3.indexOf(dano)){
						indx = CONFIG.T20.passosDano.arr3.indexOf(dano);
						dano = CONFIG.T20.passosDano.arr3[indx+rollMods[r.key][i].passo] || "4d12";
					}
				}
			
				if ( rollMods[r.key][i]?.addDie ){
					dano = new Roll(dano).alter(1, rollMods[r.key][i].addDie).formula;
				}
		
				if ( rollMods[r.key][i]?.addNum ) {
					roll = new Roll(dano);
					if ( roll.terms[2] ) roll.terms[2].number += rollMods[r.key][i].addNum;
					else roll = new Roll( dano + "+" + rollMods[r.key][i].addNum ) || roll;
					dano = roll.formula;
				}
				
				if ( rollMods[r.key][i]?.perDie ) {
					let pd = parseInt(dano.match(/\d+d/ )[0]) * Number(rollMods[r.key][i].perDie) || 0;
					if ( pd ) dano = `${dano} + ${pd}`;
				}
				r.parts[i][0] = dano;
			}
		}
		return rolls;
	}

	/**
	 * Busca o valor sistêmico de uma configuração a partir de sua tradução ou campo de configuração;
	 * @param {String} value       Texto usado na busca, seja tradução ou chave do objeto;
	 * @param {Object} configKey   Objeto CONFIG.T20 onde encontram-se os valores;
	 */
	static itemKey(value, configKey){
		const lang = game.i18n.translations.T20;
		value = value.toLowerCase().capitalize();
		let temp = Object.entries(lang).find(t=> t[1] == value);
		value = temp ? "T20." + temp[0] : value;
		if ( Object.entries(configKey).find(t=> t[1]==value) ){
			return Object.entries(configKey).find(t=> t[1]==value)[0];
		} else if( configKey[value.toLowerCase()] ){
			return configKey[value.toLowerCase()];
		}
		return null;
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */

	static chatListeners(html) {
		html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
		html.on('click', '.apply-button-ef', this._onChatCardApplyEffect.bind(this));
		html.on('click', '.placeTemplate', this._onPlaceTemplateAction.bind(this));
	}

	/* -------------------------------------------- */

	/* _onChatCardAction */
	/* _getChatCardActor */
	/* _getChatCardTargets */

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

	static _onPlaceTemplateAction(event) {
		event.preventDefault();
		const chatCardId = event.currentTarget.closest(".chat-message").dataset.messageId;
		const chatCard = game.messages.get(chatCardId);
		const button = event.currentTarget;
		const card = button.closest(".chat-card");

		const actor = game.actors.get(card.dataset.actorId);
		if( !actor ) return;

		const storedData = chatCard.getFlag("tormenta20", "itemData");
		const storedTemplate = chatCard.getFlag("tormenta20", "template");
		let item = new this(storedData, {parent: actor});
		if( !item ) return;
		item.data.data.area = storedTemplate.area;
		item.data.data.alcance = storedTemplate.alcance;
		
		const template = AbilityTemplate.fromItem(item);
		if ( template ) {
			template.drawPreview();
		}
	}

	/* -------------------------------------------- */

	static _onChatCardApplyEffect(event) {
		event.preventDefault();
		const chatCardId = event.currentTarget.closest(".chat-message").dataset.messageId;
		const buttonId = event.currentTarget.dataset.effectIndex;
		const actors = canvas.tokens.controlled;
		if ( actors.length && buttonId>=0){
			const chatEffect = game.messages.get(chatCardId).data.flags.tormenta20?.effects[buttonId];
			if(chatEffect.changes){
				chatEffect.changes.sort((c,d)=> !Number(c.value) ? 1 : -1 );
				chatEffect.changes = chatEffect.changes.reduce((object, item) => {
					let idx = object.map(ob=> ob.key).indexOf(item.key);
					if (idx >= 0) {
						object[idx].value = Number(object[idx].value) + Number(item.value) || item.value;
					} else {
						object.push({key:item.key,mode:item.mode,value:item.value})
					}
					return object;
				}, []);
				if( chatEffect.duration.seconds ) {
					chatEffect.duration.startTime = game.time.worldTime;
				}
			}
			actors.forEach(async function(ac){
				await ac.actor.createEmbeddedDocuments("ActiveEffect", [chatEffect]);
			});
		}
		else if (actors.length == 0) {
			ui.notifications.warn("Você precisa selecionar pelo menos um token.");
		}
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		if ( !this.isEmbedded || (this.parent.type === "vehicle") ) return;
		const actorData = this.parent.data;
		const isNPC = this.parent.type === "npc";
		switch (data.type) {
			case "classe":
				/* TODO */
				// const features = await this.parent.getClassFeatures({
				// 	className: this.name,
				// 	level: this.data.data.niveis
				// });
				// return this.parent.addEmbeddedItems(features);
			case "equipmento":
				return this._onCreateOwnedEquipment(data, actorData, isNPC);
			case "arma":
				return this._onCreateOwnedWeapon(data, actorData, isNPC);
			case "magia":
				return this._onCreateOwnedSpell(data, actorData, isNPC);
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);

		// Assign a new primary class
		if ( this.parent && (this.type === "classe") && (userId === game.user.id) )  {
			// const pc = this.parent.items.get(this.parent.data.data.details.originalClass);
			// if ( !pc ) this.parent._assignPrimaryClass();
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
	}

	/** @inheritdoc */
	_onUpdate(changed, options, user){
		super._onUpdate(changed, options, user);
		// Ajusta classe inicial
		if( this.parent && this.type === "classe" && changed.data?.hasOwnProperty("inicial") ){
			const classes = this.actor.data.items.filter(i => i.type === "classe" && i.id != this.id);
			let updateItems;
			// SE VIROU INICIAL, TORNA TODAS AS OUTRAS NÃO INICIAL
			if( changed.data.inicial ){
				updateItems = classes.map(i => {
					return {_id: i.id, "data.inicial": false};
				});
			}
			// SE DEIXOU DE SER INICIAL E NENHUMA OUTRA CLASSE FOI DECIDIDA COMO INICIAL
			// TORNA A PRIMEIRA CLASSE ENCONTRADA
			else if( this.actor.data.items.find(i => i.type === "classe" && !i.data.data.inicial ) ) {
				let newInicial = this.actor.data.items.find(i => i.type === "classe" && i.id != this.id);
				updateItems = [{_id: newInicial.id, "data.inicial": true}];
			}
			if( updateItems ) this.actor.updateEmbeddedDocuments("Item", updateItems);
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		// Assign a new primary class
		if ( this.parent && this.type === "classe" )  {
			if( this.actor.data.items.find(i => i.type === "classe" && !i.data.data.inicial ) ) {
				let newInicial = this.actor.data.items.find(i => i.type === "classe" );
				const updateItems = [{_id: newInicial.id, "data.inicial": true}];
				if( updateItems ) this.actor.updateEmbeddedDocuments("Item", updateItems);
			}
		}
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned equipment type Items
	 * @private
	 */
	_onCreateOwnedEquipment(data, actorData, isNPC) {
		const updates = {};
		if ( foundry.utils.getProperty(data, "data.equipado") === undefined ) {
			updates["data.equipado"] = isNPC;       // NPCs automatically equip equipment
		}
		foundry.utils.mergeObject(data, updates);
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned spell type Items
	 * @private
	 */
	_onCreateOwnedSpell(data, actorData, isNPC) {
		const updates = {};
		/* TODO */
		foundry.utils.mergeObject(data, updates);
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned weapon type Items
	 * @private
	 */
	_onCreateOwnedWeapon(data, actorData, isNPC) {
		const updates = {};
		/* TODO */
		foundry.utils.mergeObject(data, updates);
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Factory Methods                             */
	/* -------------------------------------------- */

	/**
	 * Create a consumable spell scroll Item from a spell Item.
	 * @param {ItemT20} spell      The spell to be made into a scroll
	 * @return {ItemT20}           The created scroll consumable item
	 * @private
	 */
	static async createScrollFromSpell(magia) {

		// Get spell data
		const itemData = magia instanceof ItemT20 ? magia.data : magia;
		const {description, tipo, circulo, escola, alcance, duracao, resistencia, alvo, area, efeito, aprimoramentos, ativacao} = itemData.data;

		// Get scroll data
		const scrollData = {"permission":{"default":0},"type":"consumivel","data":{"peso":0,"qtd":1,"preco":0}};
		scrollData.img = "systems/tormenta20/icons/itens/pergaminho.webp";

		// Split the scroll description into an intro paragraph and the remaining details
		const scrollDescription = scrollData.data.description;
		const pdel = '</p>';
		const scrollIntroEnd = scrollDescription.indexOf(pdel);
		const scrollIntro = scrollDescription.slice(0, scrollIntroEnd + pdel.length);
		const scrollDetails = scrollDescription.slice(scrollIntroEnd + pdel.length);

		// Create a composite description from the scroll description and the spell details
		const desc = `${scrollIntro}<hr/><h3>${itemData.name} (Círculo ${circulo})</h3><hr/>${description}<hr/><h3>Detalhes do Pergaminho</h3><hr/>${scrollDetails}`;

		// Create the spell scroll data
		const spellScrollData = mergeObject(scrollData, {
			name: `Pergaminho: ${itemData.name}`,
			data: {
				"description": desc.trim(),
				circulo,
				tipo,
				circulo,
				escola,
				alcance,
				duracao,
				resistencia,
				alvo,
				area,
				efeito,
				aprimoramentos,
				ativacao
			}
		});
		return new this(spellScrollData);
	}
}