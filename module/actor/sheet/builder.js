import ActorSheetT20 from "./base.js";

/**
 * An Actor sheet for player character type actors.
 * Extends the base ActorSheetT20 class.
 * @type {ActorSheetT20}
 */

export default class ActorSheetT20Builder extends ActorSheetT20 {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "character"],
			scrollY: [".sheet-body"],
			width: 600,
			height: 700
		});
	}

	/* @override */
	get template() {
		let layout = game.settings.get("tormenta20", "sheetTemplate");
		if ( this.actor.type == 'character' ) {
			return "systems/tormenta20/templates/actor/actor-sheet-builder.html" ;
		} else if( this.actor.type == 'npc' ) {
			return "systems/tormenta20/templates/actor/actor-sheet-builder.html";
		}
	}

	/* -------------------------------------------- */
	
	/** @override */
	getData() {
		const sheetData = super.getData();
		
		let arrOption = ['raca', 'origem', 'desvantagem'];
		for (let i = 1; i <= 20; i++) {
			arrOption.push('nivel'+i);
		}
		// arrOption.forEach( e => {
		// 	1
		// });
		sheetData['choices'] = arrOption;

		return sheetData;
	}

	/**
	* Organize and classify Owned Items for Character sheets
	* @private
	*/
	_prepareItems(data) {

	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
	}

	/** @override */
	// TODO 
	async _onDropItemCreate(itemData) {
		return super._onDropItemCreate(itemData);
	}
}