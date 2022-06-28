import ItemT20 from '../../item/entity.js';
import AbilityUseDialog from "../../apps/ability-use-dialog.js";
import TraitSelector from "../../apps/trait-selector.js";
import ActorSettings from "../../apps/actor-settings.js";
import ActorMovementConfig from "../../apps/movement-config.js";
import ActorResistanceConfig from "../../apps/resistance-config.js";
// TODO TYPE ActorTypeConfig
import { T20 } from '../../config.js';
import LevelSettings from "../../apps/level-settings.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../../effects.js";
/**
 * Extend the basic ActorSheet class to suppose system-specific logic and functionality.
 * This sheet is an Abstract layer which is not used.
 * @extends {ActorSheet}
 */
export default class ActorSheetT20 extends ActorSheet {

	constructor(...args) {
		super(...args);

		/**
		* Track the set of item filters which are applied
		* @type {Set}
		*/
		/* TODO IMPLEMENT FILTERS */
		// this._filters = {
		// 		inventory: new Set(),
		// 		spellbook: new Set(),
		// 		features: new Set(),
		// 		effects: new Set()
		// };
	}
	
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions,
			{
				scrollY: [".sheet-body", ".tab.attributes", ".tab.magias", ".tab.inventory", ".tab.journal", ".tab.efeitos", ".tab.poderes"],
				tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes"}],
			}
		);
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return "systems/tormenta20/templates/actors/limited-sheet.html";
		return `systems/tormenta20/templates2/actor/${this.actor.type}-sheet.html`;
	}
	
	/**
	* Determine whether an Owned Item will be shown based on the current set of filters
	* @return {boolean}
	* @private
	*/
	// TODO Implement filters
	// _filterItems(items, filters) {
	// }
	
	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Basic data
		let isOwner = this.actor.isOwner;
		const data = {
			owner: isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: this.actor.type === "character",
			isNPC: this.actor.type === "npc",
			config: CONFIG.T20,
			rollData: this.actor.getRollData.bind(this.actor),
			//Flags
			mostrarDivindade: this.actor.getFlag("tormenta20", "sheet.mostrarDivindade"),
			mostrarAtributoTemp: this.actor.getFlag("tormenta20", "sheet.mostrarAtributoTemp"),
			botaoEditarItens: this.actor.getFlag("tormenta20", "sheet.botaoEditarItens"),
			mostrarPlatina: this.actor.getFlag("tormenta20", "sheet.mostrarPlatina"),
			editarPericias: this.actor.getFlag("tormenta20", "sheet.editarPericias"),
			enableLanguages: game.settings.get("tormenta20", "enableLanguages"),
			gameSystem: game.settings.get("tormenta20", "gameSystem")
		};
		// The Actor and its Items
		data.actor = this.actor.toObject(false);
		//foundry.utils.deepClone(this.actor.system);
		data.items = this.actor.items.map(i => {
			i.labels = i.labels;
			return i;
		});
		data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		data.data = this.actor.system;
		// LABELS?
		
		// Ability Scores
		for ( let [a, abl] of Object.entries(data.data.atributos)) {
			abl.label = CONFIG.T20.atributos[a];
		}

		// Skills
		if (data.data.pericias) {
			for (let [s, skl] of Object.entries(data.data.pericias)) {
				if( s.match(/_pc[1-9]/) ) skl.order = 6;
				else if( s == "_pc0" ) skl.order = 5;
				else if( s > "ofi9" ) skl.order = 4;
				else if( s.match(/ofi[1-9]/) ) skl.order = 3;
				else if( s == "ofi0" ) skl.order = 2;
				else if( s < "ofi0" ) skl.order = 1;
				skl.key = s;
				skl.symbol = skl.treinado ? "fas fa-check" : "far fa-circle";
				skl.compendiumEntry = data.config.skillCompendiumEntries[s] ?? null;
			}
		}
		data.skills = Object.values(data.data.pericias).sort((a,b)=>{return a.order-b.order});
		
		// Movement speeds
		data.movement = this._prepareMovementSpeed(data.actor);
		// Senses
		data.senses = this._prepareSenses(data.actor);
		// Update traits
		this._prepareTraits(data.data.tracos);
		// Update bonuses
		data.modificadores = this._prepareModificadores();

		// Prepare owned items
		this._prepareItems(data);

		// Prepare active effects
		data.effects = prepareActiveEffectCategories(this.actor.effects);

		data.system = data.data
		// Return data to the sheet

		data.documentName = "Actor";
		return data;
	}



	/* -------------------------------------------- */
	
	/**
	* Activate event listeners using the prepared sheet HTML
	* @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	*/
	activateListeners(html) {
		
		// Tooltips
		html.mousemove(ev => this._moveTooltips(ev));

		// Editable Only Listeners
		if ( this.isEditable ) {
			// Input focus and update
			const inputs = html.find("input");
			inputs.focus(ev => ev.currentTarget.select());
			
			// TODO input Deltas
			
			// Skills management
			html.find('.training-toggle').click(this._onToggleSkillTraining.bind(this));
			html.find('.skill-create').click(this._onPericiaCustomCreate.bind(this));
			html.find('.skill-delete').click(this._onPericiaCustomDelete.bind(this));
			html.find('.show-controls').click(this._toggleControls.bind(this));
			html.find('.pericia-rollable').on("contextmenu", this._onOpenCompendiumEntry.bind(this));

			// Classes
			html.find(".add-classe").click(ev => {
				game.packs.get("tormenta20.classes").render(true)
			});
			// Trait Selector
			html.find('.trait-selector').click(this._onTraitSelector.bind(this));

			// Configure Special Flags
			html.find('.config-button').click(this._onConfigMenu.bind(this));
			// html.find('.level-settings').click(this._onLevelSettings.bind(this));
			html.find("#configure-actor").click(ev => {
				new ActorSettings(this.actor).render(true);
			});

			// Update Inventory Item
			html.find('.toggle-armor').click(this._onToggleArmor.bind(this));
			html.find('.update-cd').click(this._onUpdateCD.bind(this));

			// Item management
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item .item-name').on("contextmenu", this._onItemEdit.bind(this));
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));
			html.find('.item-qty input').click(ev => ev.target.select()).change(this._onQtyChange.bind(this));
			
			
			// Active Effect management
			html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
			html.find('.effect').on("contextmenu", ev => onManageActiveEffect(ev, this.actor));
			
			// Open Compendium Entry
			html.find('.compendium-entry').on("contextmenu", this._onOpenCompendiumEntry.bind(this));
			
		} else {
			html.find("[contenteditable=true]").each((i, el) => el.setAttribute("contenteditable", false));
		}

		if ( this.actor.isOwner ) {
			// Rollable abilities.
			html.find('.rollable.atributo-rollable').click(this._onRollAtributo.bind(this));
			// Rollable skills.
			html.find('.rollable.pericia-rollable').click(this._onRollPericia.bind(this));
			// Roll item
			html.find('.item .item-image').click(event => this._onItemRoll(event));

		}

		// Otherwise remove rollable classes
		else {
			html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		}
		
		// Handle default listeners last so system listeners are triggered first
		super.activateListeners(html);
	}
	
	/* -------------------------------------------- */

	/**
	* Prepare the display of movement speed data for the Actor
	* @param {object} actorData
	* @returns {{primary: string, special: string}}
	* @private
	*/
	_prepareMovementSpeed(actorData) {
		const movement = foundry.utils.deepClone(actorData.system.attributes.movement) || {};
		// Prepare an array of available movement speeds
		let u = movement.unit;
		let speeds = {};
		if(movement.walk) speeds.walk = `${movement.walk}${u} (${Math.floor(movement.walk/1.5)}q)`;
		if(movement.burrow) speeds.burrow = `Escavar ${movement.burrow}${u} (${Math.floor(movement.burrow/1.5)}q)`;
		if(movement.climb) speeds.climb = `Escalar ${movement.climb}${u} (${Math.floor(movement.climb/1.5)}q)`;
		if(movement.fly) speeds.fly = `Voo ${movement.fly}${u} (${Math.floor(movement.fly/1.5)}q)`;
		if(movement.hover) speeds.fly += " (Flutuando)";
		if(movement.swim) speeds.swim = `Natação ${movement.swim}${u} (${Math.floor(movement.swim/1.5)}q)`;
		return speeds;
	}

	/* -------------------------------------------- */

	_prepareSenses(actorData) {
		const senses = actorData.system.attributes.sentidos || {value:[],custom:""};
		if( !senses.value ) senses.value = [];
		for ( let [k, label] of Object.entries(CONFIG.T20.senses) ) {
			const v = senses.value?.indexOf(k);
			if ( v === -1 ) continue;
			senses.value[v] = label;
		}
		if ( !!senses.custom ) senses.value.push(senses.custom);
		return senses;
	}
	
	/* -------------------------------------------- */

	/**
	* Prepare the data structure for traits data like languages, resistances & vulnerabilities, and proficiencies
	* @param {object} traits   The raw traits data object from the actor data
	* @private
	*/
	_prepareTraits(traits) {
		const map = {
			"ic": CONFIG.T20.conditionTypes,
			"idiomas": CONFIG.T20.idiomas,
			"profArmas": CONFIG.T20.profArmas,
			"profArmaduras": CONFIG.T20.profArmaduras
		};
		for ( let [t, choices] of Object.entries(map) ) {
			const trait = traits[t];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, t) => {
				obj[t] = choices[t];
				return obj;
			}, {});

			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
		}
	}

	/* -------------------------------------------- */

	_prepareModificadores(){
		const modificadores = [
			{name: "system.modificadores.atributos.for", label: "Testes de Força"},
			{name: "system.modificadores.atributos.des", label: "Testes de Destreza"},
			{name: "system.modificadores.atributos.con", label: "Testes de Constintuição"},
			{name: "system.modificadores.atributos.int", label: "Testes de Inteligência"},
			{name: "system.modificadores.atributos.sab", label: "Testes de Sabedoria"},
			{name: "system.modificadores.atributos.car", label: "Testes de Carisma"},
			{name: "system.modificadores.atributos.geral", label: "Testes de Atributos"},
			{name: "system.modificadores.atributos.fisicos", label: "Testes de Atbs. Fisicos"},
			{name: "system.modificadores.atributos.mentais", label: "Testes de Atbs. Mentais"},
			{name: "system.modificadores.custoPM", label: "Aumento de custo de PM"},
			{name: "system.modificadores.dano.geral", label: "Dano Geral"},
			{name: "system.modificadores.dano.cac", label: "Dano Corpo a Corpo"},
			{name: "system.modificadores.dano.ad", label: "Dano A Distância"},
			{name: "system.modificadores.dano.mag", label: "Dano de Magias"},
			{name: "system.modificadores.pericias.geral", label: "Testes de Perícias"},
			{name: "system.modificadores.pericias.ataque", label:"Testes de Perícias de Ataque"},
			{name: "system.modificadores.pericias.semataque", label: "Testes de Perícias, exceto de Ataque"},
			{name: "system.modificadores.pericias.resistencia", label: "Testes de Perícias de Resitências"},
			{name: "system.modificadores.pericias.atr.for", label: "Testes de Perícias de Força"},
			{name: "system.modificadores.pericias.atr.des", label: "Testes de Perícias de Destreza"},
			{name: "system.modificadores.pericias.atr.con", label: "Testes de Perícias de Constituição"},
			{name: "system.modificadores.pericias.atr.int", label: "Testes de Perícias de Inteligência"},
			{name: "system.modificadores.pericias.atr.sab", label: "Testes de Perícias de Sabedoria"},
			{name: "system.modificadores.pericias.atr.car", label: "Testes de Perícias de Carisma"}
		];
		for ( let b of modificadores ) {
			b.value = getProperty(this.object._source, b.name) || "";
		}
		return modificadores;
	}
	
	/* -------------------------------------------- */
	/*  Interactions                                */
	/* -------------------------------------------- */

	_moveTooltips(event) {
		$(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
	}
	
	/* -------------------------------------------- */

	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		// Add button for help
	 	// Add button for sheet settings?
		return buttons;
	}
	
	/* -------------------------------------------- */

	/** @override */
	async _onDropItemCreate(itemData) {
		if (itemData.type === "magia" && this.actor.system.attributes.conjuracao ) {
			itemData.system.resistencia.atributo = this.actor.system.attributes.conjuracao || "int";
		}
		// Stack consumables
		else if ( itemData.type === "consumivel" ){
			const it = this.actor.itemTypes.consumivel.find(c => c.name === itemData.name);
			if (it) {
				const qtd = it.system.qtd + 1;
				return it.update({"system.qtd": qtd})
			}
		}
		console.info(itemData);
		if( itemData.system ){
			["equipado","preparado"].forEach(k => delete itemData.system[k]);
		}
		
		return super._onDropItemCreate(itemData);
	}

	/* -------------------------------------------- */

	/** @override */
	_onDragStart(event) {
		const li = event.currentTarget;
		if(!$(li).hasClass("skill")){
			super._onDragStart(event);
		} else {
			if (event.target.classList.contains("entity-link")) return;

			// Create drag data
			const dragData = {
				actorId: this.actor.id,
				sceneId: this.actor.isToken ? canvas.scene?.id : null,
				tokenId: this.actor.isToken ? this.actor.token.id : null
			};

			// Pericias
			if (li.dataset.itemId) {
				let skill;
				if (li.dataset.type=="oficios") {
					skill = this.actor.system.pericias["ofi"].mais[li.dataset.itemId];
					dragData.subtype = li.dataset.type;
				} else if (li.dataset.type=="custom") {
					skill = this.actor.system.periciasCustom[li.dataset.itemId];
					dragData.subtype = li.dataset.type;
				} else {
					skill = this.actor.system.pericias[li.dataset.itemId];
					dragData.subtype = "base";
				}
				dragData.type = "Pericia";
				dragData.data = skill;
			}
			// Set data transfer
			event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
		}
	}
	
	/* -------------------------------------------- */

	/*  */
	async _onRollAtributo(event) {
		event.preventDefault();
		let atributo = event.currentTarget.parentElement.dataset.itemId || event.currentTarget.dataset.itemId;
		return await this.actor.rollAtributo(atributo, {event: event, message: true});
	}

	/*  */
	async _onRollPericia(event) {
		event.preventDefault();
		let pericia = event.currentTarget.parentElement.dataset.itemId || event.currentTarget.dataset.itemId;
		return await this.actor.rollPericia(pericia, {event: event, message: true})
	}

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	 * @private
	 */
	_onItemRoll(event) {
		event.preventDefault();
		let itemId;
		if ( event.currentTarget.closest(".item").dataset.itemId ) {
			itemId = event.currentTarget.closest(".item").dataset.itemId;
		} else if ( itemId = event.currentTarget.dataset.itemId ) {
			itemId = event.currentTarget.dataset.itemId;
		}
		const rollConfigs = {}
		rollConfigs.configureDialog = event.shiftKey;
		const ignoreList = ["equipamento", "tesouro"];
		const item = this.actor.items.get(itemId);
		if ( !item || ignoreList.includes(item.type) ) return;
		return item.roll(rollConfigs);
	}
	
	/* -------------------------------------------- */

	/**
	* Handle spawning the application which allows a checkbox of multiple trait options
	* @param {Event} event   The click event which originated the selection
	* @private
	*/
	_onConfigMenu(event) {
		event.preventDefault();
		const button = event.currentTarget;
		let app;
		switch ( button.dataset.action ) {
			case "level":
				this._onLevelSettings(event);
				break;
			case "movement":
				app = new ActorMovementConfig(this.object);
				break;
			case "resistance":
				app = new ActorResistanceConfig(this.object);
				break;
			// case "senses":
			// 	app = new ActorSensesConfig(this.object);
			// 	break;
			// case "type":
			// 	app = new ActorTypeConfig(this.object);
			// 	break;
		}
		app?.render(true);
	}
	
	_onLevelSettings(event) {
		event.preventDefault();
		const actorData = this.object;
		const a = event.currentTarget;
		const config = CONFIG.T20;
		const classes = [];
		actorData.items.forEach(item => {
			if ( item.type === "classe" ) {
				classes.push(item);
			}
		});
		const options = {classes, config};
		new LevelSettings(this.actor, options).render(true);
	}

	/**
	* Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
	* @param {Event} event   The click event which originated the selection
	* @private
	*/
	_onTraitSelector(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("label");
		const choices = CONFIG.T20[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		return new TraitSelector(this.actor, options).render(true);
	}
	
	/* -------------------------------------------- */

	/**
	* Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		let gen = ["arma", "magia"].includes(type) ? "Nova" : "Novo";
		const itemData = {
			name: `${gen} ${type.capitalize()}`,
			type: type,
			data: foundry.utils.deepClone(header.dataset)
		};
		delete itemData.data["type"];
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	/**
	* Handle editing an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if( item ) return item.sheet.render(true);
	}

	/**
	* Handle deleting an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemDelete(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if ( item ) return item.delete();
	}
	
	/**
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
	async _onItemSummary(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents(".item");
		let item = this.actor.items.get(li.data("item-id"));
		if( !item ) return;
		let chatData = await item.getChatData();
		// Toggle summary
		if ( li.hasClass("expanded") ) {
			let summary = li.children(".item-summary");
			summary.slideUp(200, () => summary.remove());
		}
		else {
			let div = $(`<div class="item-summary">${chatData.description.value}</div>`);
			let props = $(`<div class="item-properties"></div>`);
			div.append(props);
			li.append(div.hide());
			div.slideDown(200);
		}
		li.toggleClass("expanded");
	}

	/*  */
	async _onUpdateCD(ev){
		const atrRes = $(ev.currentTarget).data("atrres");
		const magias = this.actor.items.filter(i => i.type === "magia");
		const updateItems = magias.map(i => {
			return {_id: i.id, "data.resistencia.atributo": atrRes};
		});
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	/* -------------------------------------------- */

	/**
	 * Change the quantity of an Owned Item within the Actor
	 * @param {Event} event   The triggering click event
	 * @private
	 */
	async _onQtyChange(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		const qtd = parseInt(event.target.value) || 0;
		event.target.value = qtd;
		return item.update({ 'system.qtd': qtd });
	}

	/* -------------------------------------------- */

	// Update equippament state, unequipping unique ones;
	// TODO weapon version;
	async _onToggleArmor(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		const id = item.system;
		id.equipado = !id.equipado;
		const items = this.actor.items;
		let updateItems = [];
		updateItems.push({_id: item.id, "data.equipado": id.equipado});
		const armor = ["leve", "pesada"];
		const exclusiveSlot = ["leve", "pesada", "escudo", "traje"];
		if (id.equipado && exclusiveSlot.includes(id.tipo)) {
			let unequipped = items.some(element => { //some() === forEach() with a return
				if(element.type === "equipamento" && element.system.equipado && element.id != item.id) {
					if (element.system.tipo === id.tipo || (armor.includes(element.system.tipo) && armor.includes(id.tipo))) {
						updateItems.push({_id: element.id, "data.equipado": false});
						return true;
					}
				}
			});
		}
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	/* -------------------------------------------- */

	/**
	* Handle creating a Skill for the actor
	* @param {Event} event   The originating click event
	* @private
	*/
	async _onPericiaCustomCreate(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// PRONTO
		const tipo = a.dataset.tipo;
		const pericia = {
			label: tipo == 'oficio'? "Oficio +" : "Nova Pericia",
			nome: tipo == 'oficio'? "Oficio" : "Nova Pericia",
			custom: true,
			value: 0,
			atributo: tipo == 'oficio'? "int" : "for",
			st: tipo == 'oficio'? true : false,
			pda: false,
			treinado: tipo == 'oficio'? 1 : 0,
			treino: 0,
			outros: 0,
			mod: 0,
			bonus: 0
		};

		let actorData = foundry.utils.deepClone(this.actor);
		let pericias = actorData.system.pericias;

		let key = tipo == 'oficio'? "ofi" : "_pc";
		const customs = Object.keys(pericias).reduce((t, k) => {
			if( k.match(new RegExp(`${key}[1-9]`))?.length ) t.push( Number( k.replace(key,"") ) );
			return t;
		}, [] );
		
		let keyN = Math.max( ...customs );
		if ( keyN == 9 ) keyN = [1,2,3,4,5,6,7,8,9].find(i => !customs.includes(i) ); 
		else if ( keyN > 0 ) keyN = keyN + 1;
		else keyN = 1;
		
		if ( customs.length == 9 ) {
			// MESSAGE ERROR
			ui.notifications.info("Número limite de pericias");
		} else pericias[`${key}${keyN}`] = pericia;
		pericias = Object.keys(pericias).sort().reduce(
			(obj, key) => { 
				obj[key] = pericias[key]; 
				return obj;
			}, 
			{}
		);
		await this.render();
	}

	async _onPericiaCustomDelete(event) {
		const id = event.currentTarget.dataset.itemId;
		let updateData = [];
		updateData[`system.pericias.-=${id}`] = null;
		this.actor.update(updateData);
		await this.render();
	}

	_onToggleSkillTraining(event){
		event.preventDefault();
		const field = event.currentTarget.previousElementSibling;
		this.actor.update({[field.name]: 1 - parseInt(field.value == "" ? 0 : field.value)});
	}

	_toggleControls(event) {
		const target = event.currentTarget;
		const controls = target.closest('ul').querySelectorAll('li.custom .skill-delete');
		const input = target.closest('ul').querySelectorAll('li.custom .skill-outros');
		if ($(target).hasClass('ativo')) {
			$(controls).css('display', 'none');
			$(input).css('display', 'inline');
			$(target).removeClass('ativo');

		} else {
			$(controls).css('display', 'inline');
			$(input).css('display', 'none');
			$(target).addClass('ativo');
		}
	}
	
	/**
	 * Handle opening a skill's compendium entry
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	async _onOpenCompendiumEntry(event) {
		if (["oficios","custom"].includes(event.currentTarget.dataset.type)) return;
		if (!event.currentTarget.dataset.compendiumEntry) return;
		const entryKey = event.currentTarget.dataset.compendiumEntry;
		const parts = entryKey.split(".");
		const packKey = parts.slice(0, 2).join(".");
		const entryId = parts.slice(-1)[0];
		const pack = game.packs.get(packKey);
		const entry = await pack.getDocument(entryId);
		entry.sheet.render(true);
	}

}
