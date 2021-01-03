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
		
		// Sort Items?
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
		// Prepare items.
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
	// activateListeners(html) {
		// if ( this.actor.owner ) {

		// }

		// // Otherwise remove rollable classes
		// else {
		// 	html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
		// }
		// Handle default listeners last so system listeners are triggered first
    	// super.activateListeners(html);
	// }

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

	/**
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
	// TODO refactor Roll?
	// _onItemRoll(event) {
	// 	event.preventDefault();
	// 	const itemId = event.currentTarget.closest(".item").dataset.itemId;
	// 	const item = this.actor.getOwnedItem(itemId);
	// 	return item.roll();
	// }

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
	* Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	* @param {Event} event   The originating click event
	* @private
	*/
	// TOTO refactor and standarize html listeners
	// _onItemCreate(event) {
	// }

	/* -------------------------------------------- */

	/**
	* Handle editing an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	// TOTO refactor and standarize html listeners
	// _onItemEdit(event) {
	// 	event.preventDefault();
	// 	const li = event.currentTarget.closest(".item");
	// 	const item = this.actor.getOwnedItem(li.dataset.itemId);
	// 	item.sheet.render(true);
	// }

	/* -------------------------------------------- */

	/**
	* Handle deleting an existing Owned Item for the Actor
	* @param {Event} event   The originating click event
	* @private
	*/
	// TODO refactor and standarize html listeners
	// _onItemDelete(event) {
	// 	event.preventDefault();
	// 	const li = event.currentTarget.closest(".item");
	// 	this.actor.deleteOwnedItem(li.dataset.itemId);
	// }

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