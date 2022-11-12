import ActorSheetT20Character from "./actor-character.mjs";

export default class ActorSheetT20Vehicle extends ActorSheetT20Character {
	/** @override */
	get template() {
		return "systems/tormenta20/templates/actor/vehicle-sheet.html";
	}
	
	async getData() {
		const sheetData = {
			owner: this.actor.isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: this.actor.isOwner ? "editable" : "locked",
			isCharacter: this.actor.type === "character",
			isNPC: this.actor.type === "npc",
			isSimple: this.actor.type === "simple",
			isVehicle: this.actor.type === "vehicle",
			config: CONFIG.T20,
		};
		return sheetData;
	}
}