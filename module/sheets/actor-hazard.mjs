import ActorSheetT20 from "./actor-base.mjs";

/**
 * An Actor sheet for Complex Hazard type characters.
 * Extends the base ActorSheetT20 class.
 * @extends {ActorSheetT20}
 */
export default class HazardSheetT20 extends ActorSheetT20 {
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "hazard"],
			template: "systems/tormenta20/templates/actor/hazard-sheet.hbs",
			width: 550,
			height: 700
		});
	}

	get unsupportedItemTypes() {
		return new Set(Item.TYPES);
	}

	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	async getData() {
		const sheetData = await super.getData();
		sheetData.htmlFields ??= {};
		sheetData.htmlFields.actions = await this.enrichHTML(sheetData.system.detalhes.actions, sheetData);
		sheetData.htmlFields.goal = await this.enrichHTML(sheetData.system.detalhes.goal, sheetData);
		sheetData.htmlFields.effects = await this.enrichHTML(sheetData.system.detalhes.effects, sheetData);

		return sheetData;
	}
}
