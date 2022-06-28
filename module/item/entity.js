import { T20Conditions } from "../conditions/conditions.js";
import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js";
import { T20 } from '../config.js';
// import ActiveEffectT20 from "../_support/active-effects.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemT20 extends Item {

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */
	
	/**
	 * Does the Item implement a attack roll as part of its usage
	 * @type {boolean}
	 */
	get hasAttack() {
		return !!this.system.rolls.find(r=>r.type=="ataque");
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a damage roll as part of its usage
	 * @type {boolean}
	 */
	get hasDamage() {
		return !!this.system.rolls.find(r=>r.type=="dano");
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a versatile damage roll as part of its usage
	 * @type {boolean}
	 */
	get isVersatile() {
		return !!(this.hasDamage && this.system.propriedades.ver);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a saving throw as part of its usage
	 * @type {boolean}
	 */
	get hasSave() {
		const resistencia = this.system?.resistencia || {};
		return !!(resistencia.atributo && resistencia.value);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have a target
	 * @type {boolean}
	 */
	get hasTarget() {
		const target = this.system.target;
		return target && !["none",""].includes(target.type);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have an area of effect target
	 * @type {boolean}
	 */
	get hasAreaTarget() {
		const target = this.system.area;
		return target? true : false;
	}

	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	 get aprimoramentosValidos() {
		console.warn('"aprimoramentosValidos" is Deprecated. Use "validOnUseEffects";');
		return validOnUseEffects();
	 }
	get validOnUseEffects() {
		if( !this.isOwned ) return [];
		const type = this.type;
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
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	/**
	* Augment the basic Item data model with additional dynamic system.
	*/
	prepareDerivedData() {
		const system = this.system;
		const C = CONFIG.T20;
		const labels = this.labels = {};
		const gameSystem = game.settings.get("tormenta20", "gameSystem");
		
		// Classes
		if ( this.type === "classe" ) {
			// TODO Skyfall Class/Archetype
			let maxLvl = gameSystem == "Skyfall" ? 10 : 20;
			system.niveis = Math.clamped(system.niveis, 1, maxLvl);
		}
		// Weapons
		else if ( this.type === "arma" ) {
			labels.critico = `${system.criticoM}/${system.criticoX}x`
		}
		// Spells
		else if ( this.type === "magia" ) {
			labels.tipo = game.i18n.localize(T20.spellType[system.tipo]);
			labels.nivel = game.i18n.format("T20.SpellLevel", {lvl:system.circulo});
			labels.escola = game.i18n.localize(T20.spellSchools[system.escola]);
			labels.materiais = system.meteriais?.value ?? null;
		}
		// Power
		else if ( this.type === "poder" ){
			labels.tipo = game.i18n.localize(T20.powerType[system.tipo]);
			labels.subtipo = system.subtipo;
		}
		// Equipment
		else if ( this.type === "equipamento"){
			labels.armadura = system.armadura.valor ? `${system.armadura.valor} ${game.i18n.localize("T20.Defesa")}` : "";
		}

		// Activation
		if ( system.hasOwnProperty("ativacao") ) {
			let act = system.ativacao || {};
			if ( act ) labels.ativacao = act.qtd
				? [act.qtd, game.i18n.localize(T20.abilityActivationTypes[act.execucao])].join(" ")
				: game.i18n.localize(T20.abilityActivationTypes[act.execucao]);
			if ( act && act.custo > 0) labels.custoPM = act.custo + " PM";

			// Target
			let tgt = system.target || {};
			if (["none", "self"].includes(tgt.unidades)) tgt.value = null;
			if (["none", "self"].includes(tgt.type)) {
				tgt.value = null;
				tgt.unidades = null;
			}
			labels.target = [tgt.value, T20.distanceUnits[tgt.unidades], T20.targetTypes[tgt.type]].filterJoin(" ") ?? "";
			labels.alvo = system.alvo;
			labels.area = system.area;

			// Range
			labels.range = game.i18n.localize(T20.distanceUnits[system.alcance]);

			// Effect
			labels.effect = system.efeito;

			// Duration
			let dur = system.duracao || {};
			if (["inst", "perm", "cena","sust"].includes(dur.units)) dur.value = null;
			labels.duration = dur.value? [dur.value, game.i18n.localize(T20.timePeriods[dur.units])].filterJoin(" ") : game.i18n.localize(T20.timePeriods[dur.units]);
		}

		// Saving Throw
		if ( system.hasOwnProperty("resistencia") ) {
			let save = system.resistencia || {};
			const actorData = this.actor?.system ?? null;
			const actorFlags = this.actor?.flags ?? null;
			const nivel = actorData?.attributes.nivel.value ?? 0;
			const atr = actorData?.atributos[save.atributo]?.mod ?? 0;
			let base = this.isOwned && actorData ? Math.floor(nivel/2) ?? 0 : 0;
			let mod = this.isOwned && atr ? atr : 0;

			let cd = 10 + base + mod + (Number(save.bonus) || 0);
			
			if( this.isOwned && actorFlags) {
				let showCD = actorFlags?.tormenta20?.showCD ?? true;
				if( !showCD ) cd = "??";
			}
			labels.save = save.txt ? save.txt + ` (CD ${cd})` : save.txt;
		}

		// Damage Types
		if( !(system.rolls instanceof Array) ) system.rolls = [];
		if ( system.rolls?.find(r=> r.type == "dano") ) {
			let dano = system.rolls.find(r=> r.type == "dano") || {};
			if ( dano.parts ) {
				labels.dano = dano.parts.map(d => d[0]).join(" + ").replace(/\+ -/g, "- ");
				labels.damageTypes = dano.parts.map(d => T20.damageTypes[d[1]]).join(", ");
			}
		}

		// Spellheader
		if ( this.type === "magia" ) {
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
	 * Compute item attributes which might depend on prepared actor system.
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
	/*  Data Preparation Helpers                    */
	/* -------------------------------------------- */

	/**
	 * Populate a label with the compiled and simplified damage formula
	 * based on owned item actor system. This is only used for display
	 * 
	 * @returns {Array} array of objects with `formula` and `damageType`
	 */
	getDerivedDamageLabel() {
		const system = this.system;
		if ( !this.hasDamage || !system || !this.isOwned ) return [];

		const rollData = this.getRollData();
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
		const resistencia = this.system?.resistencia;

		// Ability-score
		resistencia.cd = null;
		if ( this.isOwned ){
			let atr = getProperty(this.actor.system, `atributos.${resistencia.atributo}.mod`);
			let nvl = Math.floor(getProperty(this.actor.system, `attributes.nivel.value`)/2);
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
		const itemData = this.system;
		const rollData = this.getRollData();
		const roll = itemData.rolls.find(r=>r.type == "ataque");
		if ( !this.hasAttack || !itemData || roll.parts.length < 2 ) return;
		// Define Roll bonuses
		const parts = roll.parts.map(p=> p[0] ?? p);//;
		
		// Take no further action for un-owned items
		if ( !this.isOwned ) return {rollData, parts};
		const actorData = this.actor.system;
		
		// Add skill bonus
		if ( roll.parts[1][0] ) {
			parts[1] = "@skill";
			rollData.skill = actorData.pericias[roll.parts[1][0]].value || 0;
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
		const bonuses = this.actor.system.modificadores?.ataque || {};
		if ( bonuses.geral ) parts.push(bonuses.geral);
		if ( bonuses.cac && roll.parts[1][0] !== "pont"){
			parts.push(bonuses.cac);
		}
		if ( bonuses.ad && roll.parts[1][0] === "pont" ){
			parts.push(bonuses.ad);
		}

		// One-time bonus provided by consumed ammunition
		if ( (itemData.consume?.type === 'ammo') && !!this.actor.items ) {
			const ammoItemData = this.actor.items.get(itemData.consume.target)?.system;

			if (ammoItemData) {
				const ammoItemQuantity = ammoItemData.qtd;
				const ammoCanBeConsumed = ammoItemQuantity && (ammoItemQuantity - (itemData.consume.amount ?? 0) >= 0);
				const ammoAtqBns = ammoItemData.atqBns;
				const ammoIsTypeConsumable = (ammoItemData.type === "consumivel") && (ammoItemData.subtipo === "ammo");
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
	/*  Methods                                     */
	/* -------------------------------------------- */

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData() {
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = foundry.utils.deepClone(this.system);
		if ( this.system.rolled ){
			if ( !rollData.roll ) rollData.roll = {};
			for ( let [key, r] of Object.entries(this.system.rolled) ) {
				rollData.roll[key] = r.total;
			}
		}
		const atributoChave = this.actor.system.attributes.conjuracao;
		rollData["atributoChave"] = 0;
		if( T20.atributos[atributoChave] ){
			rollData["atributoChave"] = this.actor.system.atributos[atributoChave].mod;
		}

		// Include an ability score modifier if one exists
		const atr = this.system.atrBns;
		if ( atr ) {
			const atributo = rollData.atributos[atr];
			rollData["mod"] = atributo.mod || 0;
		}
		for ( let [key, skl] of  Object.entries(this.actor.system.pericias) ){
			rollData[key] = skl.value;
		}
		return rollData;
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		if ( !this.isEmbedded || (this.parent.type === "vehicle") ) return;
		const actorData = this.parent.system;
		const isNPC = this.parent.type === "npc";
		let updates;
		switch (data.type) {
			case "classe":
				/* TODO */
				break;
			case "equipamento":
				updates = this._onCreateOwnedEquipment(data, actorData, isNPC);
				break;
			case "arma":
				updates = this._onCreateOwnedWeapon(data, actorData, isNPC);
				break;
			case "magia":
				updates = this._onCreateOwnedSpell(data, actorData, isNPC);
				break;
		}
		if (updates) return this.updateSource(updates);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, user){
		super._onUpdate(changed, options, user);
		// Set Initial Class
		if( this.parent && this.type === "classe" && changed.system?.hasOwnProperty("inicial") ){
			const classes = this.actor.items.filter(i => i.type === "classe" && i.id != this.id);
			let updateItems;
			// When set as initial, unset other classes
			if( changed.system.inicial ){
				updateItems = classes.map(i => {
					return {_id: i.id, "system.inicial": false};
				});
			}
			// If unseted initial, find first class and set it as initial
			else if( this.actor.items.find(i => i.type === "classe" && !i.system.inicial ) ) {
				let newInicial = this.actor.items.find(i => i.type === "classe" && i.id != this.id);
				updateItems = [{_id: newInicial.id, "system.inicial": true}];
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
			if( this.actor.items.find(i => i.type === "classe" && !i.system.inicial ) ) {
				let newInicial = this.actor.items.find(i => i.type === "classe" );
				const updateItems = [{_id: newInicial.id, "system.inicial": true}];
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
		if ( foundry.utils.getProperty(data, "system.equipado") === undefined ) {
			updates["system.equipado"] = isNPC;       // NPCs automatically equip equipment
		}
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned spell type Items
	 * @private
	 */
	_onCreateOwnedSpell(data, actorData, isNPC) {
		const updates = {};
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned weapon type Items
	 * @private
	 */
	_onCreateOwnedWeapon(data, actorData, isNPC) {
		const updates = {};
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Create a consumable spell scroll Item from a spell Item.
	 * @param {ItemT20} spell      The spell to be made into a scroll
	 * @return {ItemT20}           The created scroll consumable item
	 * @private
	 */
	 static async createScrollFromSpell(magia) {

		// Get spell data
		const itemData = magia instanceof ItemT20 ? magia.system : magia;
		const {description, tipo, circulo, escola, alcance, duracao, resistencia, alvo, area, efeito, aprimoramentos, ativacao} = itemData.system;

		// Get scroll data
		const scrollData = {"permission":{"default":0},"type":"consumivel","system":{"peso":0,"qtd":1,"preco":0}};
		scrollData.img = "systems/tormenta20/icons/itens/pergaminho.webp";

		// Split the scroll description into an intro paragraph and the remaining details
		const scrollDescription = scrollData.system.description;
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

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
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
		rollMode = game.settings.get("core", "rollMode");
		// Hold to check later
		if ( true ) {
			item = this.clone({keepId: true});
			item.prepareFinalAttributes(); // Spell save DC, etc...
			console.log( this.actor.uuid , item.actor.uuid);
		}
		const id = this.system;                // Item system data
		const actor = this.actor;
		const ad = actor.system;               // Actor system data
		
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
			configuration = await AbilityUseDialog.create(item);
			// configuration = await new AbilityUseDialog(item).render(true);
			console.log(configuration);
			if (!configuration) return;
			
			
			// Determine consumption preferences
			// createMeasuredTemplate = Boolean(configuration.placeTemplate);
			consumeUsage = Boolean(configuration.consumeUse);
			consumeResource = Boolean(configuration.consumeResource);
			consumeMana = Boolean(configuration.consumeMana);
			rollMode = configuration.rollMode;
		} else {
			let itActive = this.actor.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.disabled);
			let acActive = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.disabled);
			let active = itActive.concat(acActive);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.flags.tormenta20.custo||"0"};
				return o;
			}, {});
		}

		if ( !isEmpty( extra ) || configuration.bonus || configuration.bonusdano ) {
			item.system.rolls.forEach( r => {
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
					else if ( !["","0",undefined].includes(extra.dano) ) r.parts.push([extra.dano, ""]);
				}
			});

			if ( extra?.multCritico?.match(/^=/) ) item.system.criticoX = 1* extra.multCritico.replace("=","");
			else if ( Number(extra.multCritico) ) item.system.criticoX += Number(extra.multCritico);
			if ( extra?.margemCritico?.match(/^=/) ) item.system.criticoM = extra.margemCritico.replace("=","");
			else if ( Number(extra.margemCritico) ) item.system.criticoM += Number(extra.margemCritico);
		}
		
		// options = item.applyAprimoramentos(configuration);
		options = configuration;

		// Execute Rolls
		options.rolls = [];
		item.system.rolled = {};
		if( item.system.rolls.find(r=>r.type == "ataque" && r.parts.length && r.parts[0][0]) ){
			await item.rollAttack({options:options});
		}
		if( item.system.rolls.find(r=>r.type == "formula" && r.parts.length && r.parts[0][0]) ){
			await item.rollFormula({options:options});
		}
		if( item.system.rolls.find(r=>r.type == "dano" && r.parts.length && r.parts[0][0]) ){
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
			if ( !foundry.utils.isEmpty(itemUpdates) ) await item.update(itemUpdates);
			if ( consumeQuantity && (id.quantity === 0) ) await item.delete();
			if ( !foundry.utils.isEmpty(actorUpdates) ) await actor.update(actorUpdates);
			if ( !foundry.utils.isEmpty(resourceUpdates) ) {
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
					area: item.system.area,
					alcance: item.system.alcance
				}
			}
		}
		
		if( consumeMana ) item.system.ativacao.custo = item.system.ativacao.custo || 1;
		// Create or return the Chat Message data
		if( configuration.brew ){
			let potion = "Poção";
			if( item.system.area ) potion = "Granada";
			if( item.system.alvo.match(/objeto/) ) potion = "Óleo";
			const itemData = {
				name: `${potion} de ${item.name}`,
				type: "consumivel",
				img: "icons/consumables/potions/bottle-bulb-corked-glowing-red.webp",
				system: item.system
			};
			itemData.system.tipo = "potion";
			itemData.system.ativacao.custo = 0;
			actor.createEmbeddedDocuments("Item", [itemData]);
			let msg = `${item.actor.name} criou ${itemData.name}`;
			return ChatMessage.create({content:msg});
		}
		if( id.ativacao.custo && actor.system.modificadores.custoPM ){
			item.system.ativacao.custo += Number(actor.system.modificadores.custoPM);
		}
		
		return item.displayCard({options, rollMode, createMessage});
	}

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
		const id = this.system;
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
				itemUpdates["system.uses.value"] = remaining;
			}

			// Reduce quantity if not reducing usages or if usages hit 0 and we are set to consumeQuantity
			if ( consumeQuantity && (!used || (remaining === 0)) ) {
				const q = Number(id.quantity ?? 1);
				if ( q >= 1 ) {
					used = true;
					itemUpdates["system.quantidade"] = Math.max(q - 1, 0);
					itemUpdates["system.uses.value"] = uses.max ?? 1;
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
		const itemData = this.system;
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
				resource = getProperty(actor.system, consume.target);
				quantity = resource || 0;
				break;
			case "ammo":
			case "material":
				resource = actor.items.get(consume.target);
				quantity = resource ? resource.system.quantidade : 0;
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
				actorUpdates[`system.${consume.target}`] = remaining;
				break;
			case "ammo":
			case "material":
				resourceUpdates["system.quantidade"] = remaining;
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
			item: this,
			system: await this.getChatData(),
			labels: this.labels,
			custo: options.truque? 0 : this.system.ativacao.custo || null,
			truque: options.truque,
			onUseEffects: options.onUseEffects,
			effects: options.effects,
			placeTemplate: options.template,
			_rolls: [],
			rolls: []
		};

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if ( templateData.actor && templateData.custo && autoSpendMana ) {
				this.actor.spendMana(templateData.custo, 0, false);
		}

		
		for( let [key, roll] of Object.entries(this.system.rolled) ) {
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
			rolls:  Object.values( this.system.rolled ),
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			content: html,
			flavor: options.chatFlavor || this.system.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this.actor, token}),
			flags: {
				"core.canPopout": true,
				"tormenta20.onUseEffects": options.onUseEffects,
				"tormenta20.effects": options.effects,
				"tormenta20.itemData": this.system,
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
			try {
				for( let [key, roll] of Object.entries(this.system.rolled) ) {
					await game.dice3d.showForRoll(roll, game.user, true, wd.whisper, wd.blind)
				}
			} catch (error) {
				console.error(error);
			}
		}
		// Create the Chat Message or return its data
		// chatData.rolls = Object.values( this.system.rolled );
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}

	/* -------------------------------------------- */

	async getChatData(htmlOptions={async:true}) {
		const system = foundry.utils.deepClone(this.system);
		const labels = this.labels;

		// Rich text description
		system.description = system.description || {value:"",chat:"",unidentified:""};
		system.description.value = await TextEditor.enrichHTML(system.description.value, htmlOptions)

		if( this.type === "magia" || ( this.type === "consumivel" && ["scroll", "potion"].includes(system.subtipo) ) ){
			const headerTags = { ativacao: "Execução", range:"Alcance", target:"Alvo", duracao:"Duração", save:"Resistência" };

			const r = Object.entries(labels).map(function(t){
				if( headerTags.hasOwnProperty(t[0]) && t[1]){
					return `<b>${headerTags[t[0]]}:</b> ${t[1]};`
				} else return;
			});
			system.spellHeader = r.filter(t => t!=null).join(" ");
			// Exec - Alcn - Alvo - Area - Dura - Resis
		}
		return system;
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
		const itemData = this.system;
		const flags = this.actor.flags.tormenta20 || {};
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
				flavor: title,
				event: event
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
			// if ( ammo && !isEmpty(ammoUpdate) ) await ammo.update(ammoUpdate);
			
			itemData.rolled[r.name] = roll;
		}
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollDamage({critical=false, event=null,  versatile=false, options={}}={}) {
		const itemData = this.system;
		const actorData = this.actor.system;
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
			if ( this.type=="consumivel" && this.system.tipo == "alchemy" && bonuses.alq ) parts.push([bonuses.alq,""]);
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
		const itemData = this.system;
		const actorData = this.actor.system;
		const rollData = this.getRollData();
		// Invoke the roll and submit it to chat
		for (let r of itemData.rolls.filter(i => i.type == "formula")) {
			// rolls[r.name] = 
			let temp = new Roll(r.parts[0][0], rollData);
			itemData.rolled[r.name] = await temp.roll({async:true});
		}
	}
}