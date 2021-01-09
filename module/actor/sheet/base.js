import { prepRoll } from "../../dice.js";
import { T20Utility } from '../../utility.js';
import ConjurarDialog from "../../apps/conjurar-dialog.js";

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
		return mergeObject(super.defaultOptions, {
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes"}]
		});
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
		let isOwner = this.entity.owner;
		const data = {
			owner: isOwner,
			limited: this.entity.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: this.entity.data.type === "character",
			isNPC: this.entity.data.type === "npc"
		};
		
		// The Actor and its Items
		data.actor = duplicate(this.actor.data);
		data.items = this.actor.items.map(i => {
			i.data.labels = i.labels;
			return i.data;
		});
		data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		
		data.data = data.actor.data;
		// Ability Scores
		// Add icon, hover, label to Scores

		// Skills
		// Add icon, hover, label to Scores

		// Movement speeds
		// TODO Implement Movement Here?

		// Senses
		// TODO Implement Senses Here?

		// Prepare owned items
		this._prepareItems(data);

		// Prepare active effects
		// TODO Implement Active Effects

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
	// _getMovementSpeed(actorData) {
	// }


	/* -------------------------------------------- */

	// TODO Implement Senses
	// _getSenses(actorData) {
	// }

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

			// TODO input Deltas

			// Skills management
			html.find('.training-toggle').click(this._onToggleSkillTraining.bind(this));
			html.find('.skill-create').click(this._onPericiaCustomCreate.bind(this));
			html.find('.skill-delete').click(this._onPericiaCustomDelete.bind(this));
			html.find('.show-controls').click(this._toggleControls.bind(this));
		

			// Owned Item management
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));

			// Configure Special Flags
			html.find("#configure-actor").click(ev => {
				new game.tormenta20.applications.ActorSettings(this.actor).render(true);
			});
		}

		if ( this.actor.owner ) {
			// Rollable abilities.
			html.find('.rollable').click(this._onRoll.bind(this));

			// Update item
			// html.find('.upItem').change(this._onUpdateItem.bind(this));

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
	// TODO Implement Senses / Refactor Movement
	// _onConfigMenu(event) {
	// 	event.preventDefault();
	// }

	/* -------------------------------------------- */

	/** @override */
	// TODO Implement scroll consumable and onDrop creation
	// async _onDropItemCreate(itemData) {
	// 	// Create the owned item as normal
	// 	return super._onDropItemCreate(itemData);
	// }
	

	/* -------------------------------------------- */

	/** @override */
	_onDragStart(event) {
		const li = event.currentTarget;
		console.log(li);
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
			console.log(dragData);
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

	/**
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
	async _onRoll(event, actor = null) {
		actor = !actor ? this.actor : actor;
		if (!actor.data) {
			return;
		}
		const actorData = actor.data.data;
		const a = event.currentTarget;
		const data = a.dataset;
		const id = a.parentElement.dataset.itemId;
		let item = {};
		if(Object.keys(actorData.atributos).includes(id)){
			item.type = "atributo";
			item.roll = "1d20 +"+ actorData.atributos[id].mod;
			item.label = { 'for': "Força", 'des': "Destreza", 'con': "Constituição", 'int': "Inteligência", 'sab': "Sabedoria", 'car': "Carisma" }[id];
		}
		// Roll pericias
		else if ($(a).hasClass('pericia-rollable')) {
			let skillData = {padrao: actorData.pericias, oficios: actorData.pericias.ofi.mais, custom: actorData.periciasCustom}[data.type];
			console.log(data);
			console.log(id);
			console.log(skillData[id]);
			item = {
				type: 'pericia',
				roll: "1d20+" + skillData[id].value,
				label: skillData[id].nome ?? skillData[id].label
			}
		}
		// Roll items
		else if (actor.items.get(id)){
			item = actor.items.get(id);
		}

		if(!isObjectEmpty(item)){
			await prepRoll(event, item, actor);
		}
	}

	/* -------------------------------------------- */

	/**
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
	// TODO Implement summary [needed?]
	// _onItemSummary(event) {
	// 	event.preventDefault();
	// }

	/* -------------------------------------------- */

	/**
	* Handle creating a Skill for the actor
	* @param {Event} event   The originating click event
	* @private
	*/
	_onPericiaCustomCreate(event) {
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
			pericia.label = "Oficio";
			pericia.atributo = 'int';

			oficios.push(pericia);
			this.actor.update({
				"data.pericias.ofi.mais": oficios
			});
		} else {
			periciasCustom.push(pericia);
			this.actor.update({
				"data.periciasCustom": periciasCustom
			});
		}
		this.render();
	}

	async _onPericiaCustomDelete(event) {
		const id = event.currentTarget.dataset.itemId;
		const a = event.currentTarget;
		const tipo = a.dataset.type;
		console.log(tipo);
		console.log(id);
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
		this.actor.update({[field.name]: 1 - parseInt(field.value)});
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
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `Novo ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			data: data
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.data["type"];

		// Finally, create the item!
		return this.actor.createOwnedItem(itemData);
	}

	/* -------------------------------------------- */

	/**
	* Handle editing an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	_onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.getOwnedItem(li.dataset.itemId);
		item.sheet.render(true);
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

		// const item = this.actor.getOwnedItem(li.data("itemId"));
		const item = this.actor.items.get(li.dataset.itemId);
		if(item.data.type === "armadura" && item.data.data.equipado) {
			const armadura = {
				nome: "",
				defesa:  0,
				penalidade: 0,
				equipado: false
			};
			if (item.data.data.tipo === "armadura") {
				this.actor.update({
					"data.armadura": armadura,
					"data.defesa.des": true
				});
			}
			else if (item.data.data.tipo === "escudo") {
				this.actor.update({
					"data.escudo": armadura,
				});
			}
		}
		this.actor.deleteOwnedItem(li.dataset.itemId);
	}

	/* -------------------------------------------- */

	/**
	* Handle rolling an Ability check, either a test or a saving throw
	* @param {Event} event   The originating click event
	* @private
	*/
	// TODO refactor and standarize html listeners
	// _onRollAbilityTest(event) {
	// 	event.preventDefault();
	// 	let ability = event.currentTarget.parentElement.dataset.ability;
	// 	this.actor.rollAbility(ability, {event: event});
	// }

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