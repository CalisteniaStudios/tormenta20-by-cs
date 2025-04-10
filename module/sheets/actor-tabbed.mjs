
import ActorSheetT20Character from "./actor-character.mjs";

export default class ActorSheetT20CharacterTabbed extends ActorSheetT20Character {
	/** @override */
	get template() {
		return "systems/tormenta20/templates/actor/actor-sheet-tabbed.html";
	}
	async getData() {
		const sheetData = await super.getData();
		sheetData['layout'] = 'tabbed';
		const { poderes } = sheetData.actor;
		for (const tipo of Object.keys(CONFIG.T20.powerType)) {
			sheetData.actor[`poderes${tipo.capitalize()}`] = poderes.filter((p) => p.system.tipo === tipo);
		}
		return sheetData;
	}
}