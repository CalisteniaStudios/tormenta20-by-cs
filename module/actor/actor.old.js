import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import { T20 } from '../config.js';
// import SelectItemsPrompt from "../apps/select-items-prompt.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import ItemT20 from "../item/entity.js";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get aprimoramentosTypes() {
	}

	/* -------------------------------------------- */
	/* -------------------------------------------- */
	

	/* -------------------------------------------- */
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	/** @override */
	prepareData() {
		// super.prepareData();
	}

	/* -------------------------------------------- */

	/** @override */
	prepareBaseData() {
	}

	/* -------------------------------------------- */

	/** @override */
	prepareDerivedData() {
	}

	/* -------------------------------------------- */
	/*  Data Preparation Helpers                    */
	/* -------------------------------------------- */

	/**
	* Prepare Character type specific data
	*/
	_prepareCharacterData() {
	}

	/* -------------------------------------------- */

	_prepareNPCData() {
	}

	/* -------------------------------------------- */

	/**
	* Prepare defense value.
	* @private
	*/
	_prepareDefense(){
	}

	/* -------------------------------------------- */

	/**
	* Prepare skill value.
	* @private
	*/
	_prepareSkills(key, pericia, data, rollData, roll = false) {
	}

	/* -------------------------------------------- */

	/**
	* Prepare HP and MP max value.
	* @private
	*/
	_calcPVPM() {
	}

	/* -------------------------------------------- */

	/**
	* Calculate HP and MP recovery by rest.
	* @private
	*/
	async descanso(modificador=1, modPV=0, modPM=0, curaCP=false, toChat=true) {
	}

	/* -------------------------------------------- */

	/**
	* Compute the level and percentage of encumbrance for an Actor.
	* @param {Object} actorData			The data object for the Actor being rendered
	* @returns {{max: number, value: number, pct: number}}	An object describing the character's encumbrance level
	* @private
	*/
	_computeEncumbrance(actorData) {
	}

	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/** @inheritdoc */
	getRollData() {
	}

	/**
	 * Return the amount of experience required to gain a certain character level.
	 * @param level {Number}	The desired level
	 * @return {Number}			 The XP required
	 */
	getLevelExp(nivel) {
	}

	/* -------------------------------------------- */

	/**
	* Return the amount of experience granted by killing a creature of a certain CR.
	* @param cr {Number}		 The creature's challenge rating
	* @return {Number}			 The amount of experience granted per kill
	*/
	getCDExp(cr) {
	}

	/* -------------------------------------------- */

	/**
	* Add a list of itens to the actor
	DEPRECATED?
	* @param {Array.<ItemT20>} itens - The itens being added to the Actor;
	* @returns {Promise<ItemT20[]>}
	**/
	async addEmbeddedItems(items) {
	}


	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateEmbeddedDocuments(embeddedName, result, options, userId){
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId){
	}

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
	}

	/* -------------------------------------------- */

	/**
	* Apply a certain amount of damage or healing to the health pool for Actor
	* @param {number} amount			 An amount of damage (positive) or healing (negative) to sustain
	* @param {number} multiplier	 A multiplier which allows for resistance, vulnerability, or healing
	* @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	*/
	async applyDamage(amount = 0, multiplier = 1, applyRD = false) {
	}

	/* -------------------------------------------- */

	/**
	* Spend or recover mana points for Actor
	* @param {number} amount			 An amount of spent (positive) or recover (negative) mana points
	* @param {number} adjust			 A adjust for the value due to specific conditions
	* @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	*/
	async spendMana(amount = 0, adjust = 0, recover) {
	}

	/* -------------------------------------------- */

	/**
	* Roll Teste de Perícia
	* @param {String} key  The skill ID (e.g. "cur")
	* @param {Object} options    Options which configure how skill tests are rolled
	* @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	*/
	async rollPericia(key, options = {message: true}) {
	}

	/* -------------------------------------------- */

	/**
	* Roll Teste de Atributo
	* @param {String} abilityId  The ability ID (e.g. "for")
	* @param {Object} options    Options which configure how ability tests are rolled
	* @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	*/
	async rollAtributo(key, options = {message: true}) {
	}

	/* -------------------------------------------- */

	/* MIGRATE TO ACTIVE EFFECTS */
	applyAprimoramentos(item, configuration=null){
	}

	/* -------------------------------------------- */

	/** @override */
	applyActiveEffects() {
	}

	/* -------------------------------------------- */

	/**
	* Display the chat card for an Item as a Chat Message
	* @param {object} options          Options which configure the display of the item chat card
	* @param {string} rollMode         The message visibility mode to apply to the created card
	* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	*                                  the prepared message data (if false)
	*/
	async displayCard({ options, rollMode, createMessage = true } = {}) {
	}

}