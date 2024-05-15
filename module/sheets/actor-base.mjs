import ItemT20 from '../documents/item.mjs';
import ActiveEffectT20 from "../documents/active-effects.mjs";
// import { T20 } from '../config.mjs';

import TraitSelector from "../apps/trait-selector.mjs";
import ActorSettings from "../apps/actor-settings.mjs";
import ActorMovementConfig from "../apps/movement-config.mjs";
import ActorResistanceConfig from "../apps/resistance-config.mjs";
import LevelSettings from "../apps/level-settings.mjs";
import AbilityCalculator from "../apps/ability-calculator.mjs";
import RestConfigDialog from "../apps/rest-config.mjs";
import CharacterProgression from '../apps/character-progression.mjs';
import ActorSync from '../apps/actor-sync.mjs';

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
		return foundry.utils.mergeObject(super.defaultOptions,
			{
				scrollY: [
					".tormenta20.base .sheet-body",
					".tormenta20.builder .tab.attributes",
					".tab.skills", ".tab.attributes", ".tab.spells", ".tab.inventory", ".tab.journal", ".tab.effects", ".tab.powers"
				],
				tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes"}],
				height: 700
			}
		);
	}

	/* -------------------------------------------- */

	/** @override */
	get template() {
		if ( !game.user.isGM && this.actor.limited ) return "systems/tormenta20/templates/actors/limited-sheet.html";
		return `systems/tormenta20/templates/actor/${this.actor.type}-sheet.html`;
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
	async getData() {
		// The Actor's data
		const source = this.actor.toObject();
		const actorData = this.actor.toObject(false);
		
		// Basic data
		const sheetData = {
			actor: actorData,
			source: source.system,
			system: actorData.system,
			// data: actorData.system.toObject(false),
			skills: actorData.system.pericias,
			items: actorData.items,
			movement: this._prepareMovementSpeed(actorData),
			senses: this._prepareSenses(actorData),
			effects: ActiveEffectT20.prepareActiveEffectCategories(this.actor.effects),
			owner: this.actor.isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: this.actor.isOwner ? "editable" : "locked",
			isCharacter: this.actor.type === "character",
			isNPC: this.actor.type === "npc",
			config: CONFIG.T20,
			rollData: this.actor.getRollData.bind(this.actor),
			// TextEditors
			htmlFields: {},
			//Flags
			mostrarDivindade: true,//this.actor.getFlag("tormenta20", "sheet.mostrarDivindade"),
			mostrarAtributoRacial: this.actor.getFlag("tormenta20", "sheet.mostrarAtributoRacial"),
			mostrarAtributoTemp: this.actor.getFlag("tormenta20", "sheet.mostrarAtributoTemp"),
			botaoEditarItens: true, //this.actor.getFlag("tormenta20", "sheet.botaoEditarItens"),
			mostrarPlatina: this.actor.getFlag("tormenta20", "sheet.mostrarPlatina"),
			editarPericias: true, //this.actor.getFlag("tormenta20", "sheet.editarPericias"),
			enableLanguages: game.settings.get("tormenta20", "enableLanguages"),
			equipmentSlots: game.settings.get("tormenta20", "equipmentSlots"),
			gameSystem: game.settings.get("tormenta20", "gameSystem"),
		};
		
		// Sort Owned Items
		for ( let i of sheetData.items ) {
			const item = this.actor.items.get(i._id);
			i.labels = item.labels;
		}
		sheetData.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		
		// Ability Scores
		for ( let [a, abl] of Object.entries(sheetData.system.atributos)) {
			abl.label = CONFIG.T20.atributos[a];
		}

		// Skills
		if (sheetData.skills) {
			for (let [s, skl] of Object.entries(sheetData.skills)) {
				if( sheetData.isNPC && s == 'inic' ) skl.order = -5;
				else if( sheetData.isNPC && s == 'perc' ) skl.order = -4;
				else if( sheetData.isNPC && s == 'fort' ) skl.order = -3;
				else if( sheetData.isNPC && s == 'refl' ) skl.order = -2;
				else if( sheetData.isNPC && s == 'vont' ) skl.order = -1;
				else if( s.match(/_pc[1-9]/) ) skl.order = 6;
				else if( s == "_pc0" ) skl.order = 5;
				else if( s > "ofi9" ) skl.order = 4;
				else if( s.match(/ofi[1-9]/) ) skl.order = 3;
				else if( s == "ofi0" ) skl.order = 2;
				else if( s < "ofi0" ) skl.order = 1;
				skl.key = s;
				skl.symbol = skl.treinado ? "fas fa-check" : "far fa-circle";
			}
		}
		sheetData.skills = Object.values(sheetData.skills).sort((a,b)=>{return a.order-b.order});
		
		// Update traits
		this._prepareTraits(sheetData.system.tracos);
		// Update bonuses
		sheetData.modificadores = []; //this._prepareModificadores();

		// Prepare owned items
		await this._prepareItems(sheetData);

		// Enrich HTML text
		sheetData.htmlFields.biography = await this.enrichHTML(sheetData.system.detalhes.biography.value, sheetData);
		
		sheetData.documentName = "Actor";
		// Return data to the sheet
		return sheetData;
	}

	async enrichHTML( text, data ){
		return await TextEditor.enrichHTML(text, {
			secrets: this.actor.isOwner,
			rollData: data.rollData,
			async: true,
			relativeTo: this.actor
		});
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

			// html.find("#ability-calculator").click(ev => {
			// 	new AbilityCalculator(this.actor).render(true);
			// });

			
			
			html.find('.update-cd').click(this._onUpdateCD.bind(this));

			// Item management
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item .item-name').on("contextmenu", this._onItemEdit.bind(this));
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));
			html.find('.item-qty input').click(ev => ev.target.select()).change(this._onQtyChange.bind(this));
			
			
			// Active Effect management
			html.find(".effect-control").click(ev => ActiveEffectT20.onManageActiveEffect(ev, this.actor));
			html.find('.effect').on("contextmenu", ev => ActiveEffectT20.onManageActiveEffect(ev, this.actor));
			// html.find('li.effect').on("dragstart", ev => this._onDragStart.bind(ev, this));
			let handler = ev => this._onDragStart(ev);
			html.find('li.effect').each((i, li) => {
				if (!li.hasAttribute("data-effect-id")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
			
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

			if ( game.settings.get("tormenta20", "equipmentSlots") ) {
				// Item Equip Context Menu
				html.find(".toggle-armor,.toggle-weapon").on('click', this._contextMenu.bind(this));
				new ContextMenu(html, ".toggle-armor,.toggle-weapon", [], {onOpen: this._onItemToggleContext.bind(this)});
			} else {
				// Update Inventory Item
				html.find('.toggle-armor').click(this._onToggleArmor.bind(this));
				html.find('.toggle-weapon').on('click',this._onCicleWeapon.bind(this));
				html.find('.toggle-weapon').on('contextmenu',this._onCicleWeapon.bind(this));
			}
		}

		// Otherwise remove rollable classes
		else {
			html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		}
		
		// Handle default listeners last so system listeners are triggered first
		super.activateListeners(html);
	}
	
	/* -------------------------------------------- */

	_contextMenu(event) {
		event.preventDefault();
		event.stopPropagation();
		$(event.currentTarget).trigger('contextmenu');
  }
	/**
   * Handle activation of a context menu for an embedded Item document.
   * Dynamically populate the array of context menu options.
   * Reuse the item context options provided by the base ActorSheetT20 class.
   * @param {HTMLElement} element       The HTML element for which the context menu is activated
   * @protected
   */
  _onItemToggleContext(element) {
		const item = this.actor.items.get(element.closest('li').dataset.itemId);
    if ( !item ) return;
    ui.context.menuItems = ActorSheetT20.prototype._getItemToggleContextOptions.call(this, item);
    Hooks.call("tormenta20.getItemToggleContextOptions", item, ui.context.menuItems);
  }

	/**
	 * Prepare an array of context menu options which are available for owned Item documents.
	 * @param {ItemT20} item                   The Item for which the context menu is activated
	 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the Item
	 * @protected
	 */
	_getItemToggleContextOptions(item) {
		const actor = this.actor;
		const equips = this.actor.system.equipamentos;
		const options = [];
		let equipados = actor.items.filter( (it) =>  (it.system.equipado2?.slot > 0) );
		const img = (image) => "<img src='"+image+"' width='20px' height='20px' style='vertical-align: middle;'>";
		const dec = (number) => ((number % 1).toFixed(1) * 10);
		
		if ( ['hand','both'].includes(item.system.equipado2.type) ) {
			options.push({name: ("T20.Handling"), icon: '<i class="fa-solid fa-sort-down"></i>'}); //SECTION
			let twoHanded = equipados.find( it => it.system.equipado2.slot == 12.1);
			options.push({
				name: ( twoHanded?.name ?? 'T20.Empty' ),
				icon: "<i class='fa-solid fa-hand-back-fist'></i><i class='fa-solid fa-hand-back-fist'></i>" + (twoHanded ? img(twoHanded.img) : ''),
				callback: () => this._onToggleItem(item, 'hand', 12, twoHanded?.id)
			});
			for ( let slot=1; slot <= equips.limiteEmpunhado; slot++ ){
				let slotItem = twoHanded && [1,2].includes(slot) ? null :
				equipados.find( it => dec(it.system.equipado2.slot) == 1 && Math.floor(it.system.equipado2.slot) == slot );
				options.push({
					name: ( (twoHanded && [1,2].includes(slot) ? `${slot}` : null) ?? slotItem?.name ?? 'T20.Empty' ),
					icon: '<i class="fa-solid fa-hand-back-fist"></i>' + ( (twoHanded && [1,2].includes(slot) ? img(twoHanded.img) : null) ?? (slotItem ? img(slotItem.img) : '')),
					callback: () => this._onToggleItem(item, 'hand', slot, slotItem?.id)
				});
			}
			
		}
		if ( ['body','both'].includes(item.system.equipado2.type) ) {
			options.push({name: ("T20.Wearing"), icon: '<i class="fa-solid fa-sort-down"></i>'}); //SECTION
			for ( let slot=1; slot <= equips.limiteVestido; slot++ ){
				let slotItem = equipados.find( it => dec(it.system.equipado2.slot) == 2 && Math.floor(it.system.equipado2.slot) == slot );
				// && (it.system.preparada == slot || it.system.equipado == slot) 
				options.push({
					name: ( slotItem?.name ?? 'T20.Empty' ),
					icon: '<i class="fa-solid fa-shirt"></i>' + (slotItem ? img(slotItem.img) : ''),
					callback: () => this._onToggleItem(item, 'body', slot, slotItem?.id)
				});
			}
		}
		return options;
	}

	_onToggleItem(item, context, index, currentId) {
		const updateItems = [];
		if ( currentId ) {
			updateItems.push({
				_id: currentId, "system.equipado2.slot": 0
			});
		}
		if ( item.id == currentId ) {
			// When same just remove;
		} else if ( context == 'hand' ){
			updateItems.push({
				_id: item.id, "system.equipado2.slot": index + 0.1
			});
			let oldItems = [];
			if ( index > 2 ) { // Remove only current // Cant TwoHand
			} else if ( index == 12 ){ // Remove one handed if equipping two handed
				oldItems = this.actor.items.filter( it => item.id != it.id && ([1.1,2.1].includes(it.system.equipado2?.slot)) );
			} else { // Remove two handed if equipping one handed
				oldItems = this.actor.items.filter( it => item.id != it.id && ([12.1].includes(it.system.equipado2?.slot)) );
			}
			
			for (const oldItem of oldItems) {
				updateItems.push({
					_id: oldItem.id, "system.equipado2.slot": 0
				})
			}
			
		} else if ( context == 'body' ){
			updateItems.push({
				_id: item.id, "system.equipado2.slot": index + 0.2
			});
			let oldItems = this.actor.items.filter( it => item.id != it.id && (['leve','pesada'].includes(item.system.tipo) && ['leve','pesada'].includes(it.system.tipo)) );
			// it.system.tipo == item.system.tipo
			for (const oldItem of oldItems) {
				updateItems.push({
					_id: oldItem.id, "system.equipado2.slot": 0
				})
			}
		}
		this.actor.updateEmbeddedDocuments("Item", updateItems);
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
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
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
			b.value = foundry.utils.getProperty(this.object._source, b.name) || [];
		}
		return modificadores;
	}
	
	/* -------------------------------------------- */
	/*  Interactions                                */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onSubmit(...args) {
		await super._onSubmit(...args);
	}

	_moveTooltips(event) {
		$(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
	}
	
	/* -------------------------------------------- */

	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		// Add button for help
		// buttons.unshift({
		// 	label: game.i18n.localize('T20.ActorSync'),
		// 	class: "actor-sync",
		// 	icon: "fa-solid fa-rotate",
		// 	onclick: () => (new ActorSync(this.actor)).render(true)
		// });
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
				tokenId: this.actor.isToken ? this.actor.getActiveTokens()[0] : null
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
		if ( game.settings.get('tormenta20','invertUsageConfig') ) {
			rollConfigs.configureDialog = !event.shiftKey;
		} else {
			rollConfigs.configureDialog = event.shiftKey;
		}
		rollConfigs.event = event;
		const ignoreList = [];
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
			case "ability":
				app = new AbilityCalculator(this.object).render(true);
				break;
			case "rest":
				RestConfigDialog.create([this.object]);
				break;
			case "progression":
				return;
				app = new CharacterProgression(this.object);
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
		let choices = {};
		if ( a.dataset.options == 'conditionTypes' ){
			let cdtypes = CONFIG.T20.conditions;
			let eftypes = CONFIG.T20.effectTypes;
			let ftypes = CONFIG.T20.conditionTypes;
			let done = [];
			for ( let [fk, fv] of Object.entries(ftypes)) {
				if( done.includes(fk) ) continue;
				if( Object.keys(eftypes).includes(fk) ){
					choices[fk] = {label:fv, choices: {}};
					let ch = Object.values(cdtypes).filter( (i) => i.flags?.tormenta20?.category==fk);
					if ( ch ){
						ch.map( i=> choices[fk]['choices'][i.id] = {label:i.name} );
						//  ch.map(i => {return {label:i.label}}) };
						done = [...done, ...(ch.map(i => i.id))];
					}
				} else if( Object.keys(cdtypes).includes(fk) && !fv.flags?.tormenta20?.category ){
					choices[fk] = {label:fv, choices: []};
				}
			}
		} else {
			choices = CONFIG.T20[a.dataset.options];
		}
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
			system: {}
		};
		delete itemData.system.type;
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
			return {_id: i.id, "system.resistencia.atributo": atrRes};
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
	// TODO slotSytem [lhand, rhand, thand, body1, body2, body3, body4, body5, body5]
	async _onToggleArmor(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		const id = item.system;
		id.equipado = !id.equipado;
		const items = this.actor.items;
		let updateItems = [];
		updateItems.push({_id: item.id, "system.equipado": id.equipado});
		const armor = ["leve", "pesada"];
		const exclusiveSlot = ["leve", "pesada", "escudo"];
		if (id.equipado && exclusiveSlot.includes(id.tipo)) {
			let unequipped = items.some(element => { //some() === forEach() with a return
				if(element.type === "equipamento" && element.system.equipado && element.id != item.id) {
					if (element.system.tipo === id.tipo || (armor.includes(element.system.tipo) && armor.includes(id.tipo))) {
						updateItems.push({_id: element.id, "system.equipado": false});
						return true;
					}
				}
			});
		}
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	async _onCicleWeapon(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		const id = item.system;
		const items = this.actor.items;
		let updateItems = [];
		let step = ev.type == 'click' ? 1 : -1;
		let status = (id.equipado + step < 0 ? 2 : (id.equipado + step > 2 ? 0 : id.equipado + step));
		updateItems.push({_id: item.id, "system.equipado": status});
		
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
		let updateData = {};
		updateData[`system.pericias.-=${id}`] = null;
		this.actor.update(updateData);
		await this.render();
	}

	_onToggleSkillTraining(event){
		event.preventDefault();
		// const field = event.currentTarget.previousElementSibling;
		const li = event.currentTarget.closest('li');
		const id = li.dataset.itemId;
		if ( !this.actor.system.pericias[id] ) return;
		const trained = this.actor.system.pericias[id].treinado;
		const ability = this.actor.system.pericias[id].atributo;
		const treinado = `system.pericias.${id}.treinado`;
		const atributo = `system.pericias.${id}.atributo`;
		this.actor.update({[treinado]: !trained, [atributo]: ability});
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
		const parent = event.currentTarget.closest('li') ?? event.currentTarget;
		const skill = parent.dataset.itemId ?? null;
		if ( !skill || !T20.skillCompendiumEntries[skill] ) return;
		const entryKey = T20.skillCompendiumEntries[skill];
		await Journal._showEntry(entryKey, true);
	}

}
