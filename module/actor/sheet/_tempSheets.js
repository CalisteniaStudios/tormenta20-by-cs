
import ActorSheetT20Character from "./character.js";

export default class ActorSheetT20CharacterTabbed extends ActorSheetT20Character {
	/** @override */
	get template() {
		let layout = game.settings.get("tormenta20", "sheetTemplate");
		return "systems/tormenta20/templates2/actor/actor-sheet-tabbed.html";
		if ( !game.user.isGM && this.actor.limited ) {
			return "systems/tormenta20/templates2/actor/actor-sheet-limited.html";
		} else if(layout == 'base'){
			return "systems/tormenta20/templates2/actor/actor-sheet-base.html" ;
		} else if(layout == 'tabbed') {
			return "systems/tormenta20/templates2/actor/actor-sheet-tabbed.html";
		}
	}
	getData() {
		const sheetData = super.getData();
		sheetData['layout'] = 'tabbed';
		return sheetData;
	}
}