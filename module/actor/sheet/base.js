import ItemT20 from '../../item/entity.js';
import AbilityUseDialog from "../../apps/ability-use-dialog.js";
import TraitSelector from "../../apps/trait-selector.js";
import ActorSettings from "../../apps/actor-settings.js";
import ActorMovementConfig from "../../apps/movement-config.js";
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
		return `systems/tormenta20/templates/actor/${this.actor.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Basic data
		console.log(this.actor);
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
			//is this needed?
			enableLanguages: game.settings.get("tormenta20", "enableLanguages")
		};
		
		// The Actor and its Items
		data.actor = foundry.utils.deepClone(this.actor.data);
		data.items = this.actor.items.map(i => {
			i.data.labels = i.labels;
			return i.data;
		});
		data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		data.data = data.actor.data;
		// LABELS?
		
		// Ability Scores
		for ( let [a, abl] of Object.entries(data.actor.data.atributos)) {
			abl.label = CONFIG.T20.atributos[a];
		}

		// Skills
		if (data.actor.data.pericias) {
			for (let [s, skl] of Object.entries(data.actor.data.pericias)) {
				skl.label = CONFIG.T20.pericias[s];
				skl.compendiumEntry = data.config.skillCompendiumEntries[s] ?? null;
			}
		}

		// Movement speeds
		// data.movement = this._getMovementSpeed(data.actor);

		// Senses
		// data.senses = this._getSenses(data.actor);
		
		// Update traits
		this._prepareTraits(data.actor.data.tracos);

		// Prepare owned items
		this._prepareItems(data);

		// Prepare active effects
		data.effects = prepareActiveEffectCategories(this.actor.effects);

		// Return data to the sheet
		return data;
	}

	/* -------------------------------------------- */

	/**
	* Prepare the display of movement speed data for the Actor
	* @param {object} actorData
	* @returns {{primary: string, special: string}}
	* @private
	*/
	// TODO Implement Movement Here?
	_getMovementSpeed(actorData, largestPrimary=false) {
		const movement = actorData.data.attributes.movement || {};
		// Prepare an array of available movement speeds
		let speeds = [
			[movement.burrow, `Escavar ${movement.burrow}`],
			[movement.climb, `Escalada ${movement.climb}`],
			[movement.fly, `Voo ${movement.fly}` + (movement.hover ? ` (Flutuando)` : "")],
			[movement.swim, `Natação ${movement.swim}`]
		]

		if ( largestPrimary ) {
			speeds.push([movement.walk, `Deslocamento ${movement.walk}`]);
		}

		// Filter and sort speeds on their values
		speeds = speeds.filter(s => !!s[0]).sort((a, b) => b[0] - a[0]);

		// Case 1: Largest as primary
		if ( largestPrimary ) {
			let primary = speeds.shift();
			return {
				primary: `${primary ? primary[1] : "0"} ${movement.units}`,
				special: speeds.map(s => s[1]).join(", ")
			}
		}

		// Case 2: Walk as primary
		else {
			return {
				primary: `${movement.walk || 0} ${movement.units}`,
				special: speeds.length ? speeds.map(s => s[1]).join(", ") : ""
			}
		}
	}


	/* -------------------------------------------- */

	_getSenses(actorData) {
		const senses = actorData.data.attributes.sentidos || {};
		const tags = {};
		for ( let [k, label] of Object.entries(CONFIG.T20.senses) ) {
			const v = senses[k] ?? 0
			if ( v === 0 ) continue;
			tags[k] = `${label}`;
		}
		if ( !!senses.special ) tags["special"] = senses.special;
		return tags;
	}
	
	/**
	* Prepare the data structure for traits data like languages, resistances & vulnerabilities, and proficiencies
	* @param {object} traits   The raw traits data object from the actor data
	* @private
	*/
	_prepareTraits(traits) {
		const map = {
			"rd": CONFIG.T20.damageResistanceTypes,
			"id": CONFIG.T20.damageResistanceTypes,
			"vd": CONFIG.T20.damageResistanceTypes,
			// "ic": CONFIG.T20.conditionTypes,
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
			trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
		}
	}

	/* -------------------------------------------- */

	/**
	* Determine whether an Owned Item will be shown based on the current set of filters
	* @return {boolean}
	* @private
	*/
	// TODO Implement filters
	// _filterItems(items, filters) {
	// }

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/**
	* Activate event listeners using the prepared sheet HTML
	* @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
	*/

	// TOTO refactor and standarize html listeners
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
			html.find('.pericia-rollable').on("contextmenu", this._onOpenCompendiumEntry.bind(this)); //TODO

			// Trait Selector
			html.find('.trait-selector').click(this._onTraitSelector.bind(this));

			// Configure Special Flags
			html.find("#configure-actor").click(ev => {
				new ActorSettings(this.actor).render(true);
			});
			html.find('.config-button').click(this._onConfigMenu.bind(this));

			// Configure Special Flags
			html.find('.level-settings').click(this._onLevelSettings.bind(this));

			html.find("#npc-editing").click(ev => {
				let flags = this.actor.data.flags ?? {"flags": {}};
				flags["flags.editing"] = flags.editing ? !flags.editing : true;
				this.actor.update(flags);
			});

			// Owned Item management
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));
			html.find('.item .item-name h4').on("contextmenu", this._onItemEdit.bind(this)); //TODO
			
			// Active Effect management
			html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
			html.find('.effect').on("contextmenu", ev => onManageActiveEffect(ev, this.actor));
			

			html.find('.compendium-entry').on("contextmenu", this._onOpenCompendiumEntry.bind(this));
			
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
				app = new LevelSettings(this.object);
				break;
			case "movement":
				console.error("movement");
				app = new ActorMovementConfig(this.object);
				break;
			case "settings":
				app = new ActorSettings(this.object);
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
	
	/**
	 * Handle opening a skill's compendium entry
	 * @param {Event} event	 The originating click event
	 * @private
	 */
	async _onOpenCompendiumEntry(event) {
		if (["oficios","custom"].includes(event.currentTarget.dataset.type)) return;
		const entryKey = event.currentTarget.dataset.compendiumEntry;
		const parts = entryKey.split(".");
		const packKey = parts.slice(0, 2).join(".");
		const entryId = parts.slice(-1)[0];
		const pack = game.packs.get(packKey);
		const entry = await pack.getEntity(entryId);
		entry.sheet.render(true);
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

	_onLevelSettings(event) {
		event.preventDefault();
		const actorData = this.object.data;
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

	/* -------------------------------------------- */

	/** @override */
	// TODO Implement scroll consumable and onDrop creation
	async _onDropItemCreate(itemData) {
		if (itemData.type === "magia" && this.actor.data.data.atributoChave != undefined) {
			itemData.data.atrRes = this.actor.data.data.atributoChave;
		}
		// stack consumables
		else if ( itemData.type === "consumivel" ){
			const it = this.actor.itemTypes.consumivel.find(c => c.name === itemData.name);
			if (it) {
				const qtd = it.data.data.qtd + 1;
				return it.update({"data.qtd": qtd})
			}
		}

		if( itemData.data ){
			//Ignore
			["equipado","preparado"].forEach(k => delete itemData.data[k]);

		}
		return super._onDropItemCreate(itemData);
	}
	
	/* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
	_onItemRoll(event) {
		event.preventDefault();
		let itemId;
		if (this.actor.data.type === "npc") {
			itemId = event.currentTarget.dataset.itemId;
		}
		else {
			itemId = event.currentTarget.closest(".item").dataset.itemId;
		}
		const rollConfigs = {}
		rollConfigs.configureDialog = event.shiftKey;
		const item = this.actor.items.get(itemId);
		const ignoreList = ["equip", "tesouro"];
		if (ignoreList.includes(item.type)) return;
		return item.roll(rollConfigs);
	}

	/* -------------------------------------------- */

	/**
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
    item = this.actor.items.get(li.data("item-id")),
    chatData = item.getChatData();

    // Toggle summary
    if ( li.hasClass("expanded") ) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
		else {
      let div = $(`<div class="item-summary">${chatData.description}</div>`);
      let props = $(`<div class="item-properties"></div>`);
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
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

		/* -------------------------------------------- */

	/**
	* Handle editing an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	/* DEPRECATED */
	_onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		console.log(item);
		if( item ) return item.sheet.render(true);
	}

	/* -------------------------------------------- */

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
					skill = this.actor.data.data.pericias["ofi"].mais[li.dataset.itemId];
					dragData.subtype = li.dataset.type;
				} else if (li.dataset.type=="custom") {
					skill = this.actor.data.data.periciasCustom[li.dataset.itemId];
					dragData.subtype = li.dataset.type;
				} else {
					skill = this.actor.data.data.pericias[li.dataset.itemId];
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

	_toggleControls(event) {
		const target = event.currentTarget;
		const controls = target.closest('ul').querySelectorAll('li.custom .skill-delete, li.oficios .skill-delete');
		const input = target.closest('ul').querySelectorAll('li.custom .skill-outros, li.oficios .skill-outros');
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

	/* -------------------------------------------- */

	_moveTooltips(event) {
		$(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
	}

	/* -------------------------------------------- */

	async _onRollAtributo(event) {
		event.preventDefault();
		let atributo = event.currentTarget.parentElement.dataset.itemId;
		return await this.actor.rollAtributo(atributo, {event: event});
	}

	async _onRollPericia(event) {
		event.preventDefault();
		const pericia = event.currentTarget.parentElement.dataset.itemId;
		console.log(event);
		return this.actor.rollPericia(pericia, {event:event})

		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(itemData);
			
			rollMode = configuration.rollMode;
		} else {
			let awaysActive = this.actor.effects.filter(ef => ef.data?.flags?.t20?.onuse && ef.data?.flags?.t20?.skill && !ef.data.disabled);
			if(awaysActive){
				configuration.id = awaysActive.map(ef => ef.id);
				configuration.aplica = Array(configuration.id.length).fill(true);
			}
		}

		if ( !isObjectEmpty(configuration) ) {
			let aplica = [].concat(configuration?.aplica) ?? [];
			let ids = [].concat(configuration?.id) ?? [];
			let aplicados = {};
			if (configuration?.bonus) parts.push(configuration?.bonus);
			
			aplica.forEach(function(ap, ind){
				if(ap && ap !== "0"){
					aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
				}
			});
			// get Aprimoramentos from this item
			let aprimoramentos = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
			aprimoramentos = aprimoramentos.sort((a,b) => (a.data.flags.tormenta20.aumenta && !b.data.flags.tormenta20.aumenta) ? 1 : ((b.data.flags.tormenta20.aumenta && !a.data.flags.tormenta20.aumenta) ? -1 : 0));
			options.aprimoramentos = [];
			aprimoramentos.forEach(function(ef){
				ef.data.changes.forEach(function(ch){
					if( ch.key === "roll" && ch.mode === 2 ){
						parts.push(Number(ch.value) * aplicados[ef.id] || ch.value);
					}
				});
				if ( ef.data.flags.tormenta20.custo === "" ){
					options.truque = true;
				} else if ( ef.data.flags.tormenta20.custo ) {
					options.custo += Number(ef.data.flags.tormenta20.custo) * aplicados[ef.id];
				}

				options.aprimoramentos.push({
					description: ef.data.label,
					custo: (Number(ef.data.flags.tormenta20.custo) || 0) * aplicados[ef.id],
					qtd: aplicados[ef.id]
				});
			});
		}
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

		const tipo = a.dataset.tipo;
		const pericia = {
			label: "Nova Pericia",
			nome: "Nova Pericia",
			value: 0,
			atributo: "for",
			st: false,
			pda: false,
			treinado: 0,
			treino: 0,
			outros: 0,
			mod: 0,
			temp: 0
		};

		let actorData = duplicate(this.actor);
		let oficios = Object.values(actorData.data.pericias.ofi.mais);
		let periciasCustom = Object.values(actorData.data.periciasCustom);

		if (tipo == 'oficio') {
			pericia.label = "Oficio +";
			pericia.atributo = 'int';
			pericia.st = true;
			pericia.treinado = 1;

			oficios.push(pericia);
			await this.actor.update({
				"data.pericias.ofi.mais": oficios
			});
		} else {
			periciasCustom.push(pericia);
			await this.actor.update({
				"data.periciasCustom": periciasCustom
			});
		}
		await this.render();
	}

	async _onPericiaCustomDelete(event) {
		const id = event.currentTarget.dataset.itemId;
		const a = event.currentTarget;
		const tipo = a.dataset.type;
		if (tipo == 'oficios') {
			let oficios = Object.values(this.actor.data.data.pericias.ofi.mais);
			oficios.splice(id, 1);

			await this.actor.update({ "data.pericias.ofi.mais": oficios });
		} else {
			let pericias = Object.values(this.actor.data.data.periciasCustom);
			pericias.splice(id, 1);

			await this.actor.update({ "data.periciasCustom": pericias });
		}
		await this.render();
	}

	_onToggleSkillTraining(event){
		event.preventDefault();
		const field = event.currentTarget.previousElementSibling;
		this.actor.update({[field.name]: 1 - parseInt(field.value == "" ? 0 : field.value)});
	}

	/* -------------------------------------------- */

	/**
	* TODO onToggle for Skill Training, Spell Prepared, Item Equiped
	* @param {Event} event   The originating click event
	* @private
	*/
	// TODO refactor and standarize html listeners
	// _onToggleXXX(event) {
	// 	event.preventDefault();
	// }

	/* -------------------------------------------- */

	/** @override */
	// _getHeaderButtons() {
	// 	let buttons = super._getHeaderButtons();
	// 	// Add button for help
	//  // Add button for sheet settings?
	// 	return buttons;
	// }
}
