import ActorSheetT20Character from "./character.js";

export default class ActorSheetT20Vehicle extends ActorSheetT20Character {
	/** @override */
	get template() {
		return "systems/tormenta20/templates/actor/vehicle-sheet.html";
	}
	
	getData() {
		const sheetData = super.getData();
		
		return sheetData;
	}
}