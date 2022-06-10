import { T20Conditions } from "../conditions/conditions.js";
import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import AbilityTemplate from "../pixi/ability-template.js";
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
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a damage roll as part of its usage
	 * @type {boolean}
	 */
	get hasDamage() {
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a versatile damage roll as part of its usage
	 * @type {boolean}
	 */
	get isVersatile() {
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a saving throw as part of its usage
	 * @type {boolean}
	 */
	get hasSave() {
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have a target
	 * @type {boolean}
	 */
	get hasTarget() {
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have an area of effect target
	 * @type {boolean}
	 */
	get hasAreaTarget() {
	}

	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get aprimoramentosValidos() {
	}

	/* -------------------------------------------- */
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	/**
	* Augment the basic Item data model with additional dynamic data.
	*/
	prepareDerivedData() {
	}

	/* -------------------------------------------- */

	/**
	 * Compute item attributes which might depend on prepared actor data.
	 */
	prepareFinalAttributes() {
	}



	/* -------------------------------------------- */
	/*  Data Preparation Helpers                    */
	/* -------------------------------------------- */

	/**
	 * Populate a label with the compiled and simplified damage formula
	 * based on owned item actor data. This is only used for display
	 * 
	 * @returns {Array} array of objects with `formula` and `damageType`
	 */
	getDerivedDamageLabel() {
	}
	
	/* -------------------------------------------- */

	/**
	 * Update the derived spell DC for an item that requires a saving throw
	 * @returns {number|null}
	 */
	getSaveDC() {
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
	}


	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData() {
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, user){
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDelete(options, userId) {
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned equipment type Items
	 * @private
	 */
	_onCreateOwnedEquipment(data, actorData, isNPC) {
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned spell type Items
	 * @private
	 */
	_onCreateOwnedSpell(data, actorData, isNPC) {
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned weapon type Items
	 * @private
	 */
	_onCreateOwnedWeapon(data, actorData, isNPC) {
	}

	/* -------------------------------------------- */

	/**
	 * Create a consumable spell scroll Item from a spell Item.
	 * @param {ItemT20} spell      The spell to be made into a scroll
	 * @return {ItemT20}           The created scroll consumable item
	 * @private
	 */
	static async createScrollFromSpell(magia) {
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
	}

	/* -------------------------------------------- */

	getChatData(htmlOptions={}) {
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
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollDamage({critical=false, event=null,  versatile=false, options={}}={}) {
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollFormula(options={}) {
	}

	/* -------------------------------------------- */

	/* MIGRATE TO ACTIVE EFFECTS */
	applyAprimoramentos(configuration=null){
	}

	/* -------------------------------------------- */

	/** 
	 * Realiza as modificações nas formulas de rolagens como alteração de dado, adição de dados
	 * e bônus e aumento de passo;
	 * @param {Object} rollMods   Objeto com os valores a serem modificados;
	 */
	/* MIGRATE TO ACTIVE EFFECTS */
	applyRollChanges(rollMods){
	}

	/* -------------------------------------------- */

	/* MIGRATE TO ACTIVE EFFECTS */
	static itemKey(value, configKey){
	}

}