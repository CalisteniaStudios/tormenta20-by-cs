import ActorSheetT20Character from "./actor-character.mjs";

export default class ActorSheetT20CharacterTabbed extends ActorSheetT20Character {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "character", "tabbed"],
			height: 850,
			width: 650
		});
	}

	layout = "tabbed";

	async getData() {
		const sheetData = await super.getData();
		const { poderes } = sheetData.actor;
		for (const tipo of Object.keys(CONFIG.T20.powerType)) {
			sheetData.actor[`poderes${tipo.capitalize()}`] = poderes.filter((p) => p.system.tipo === tipo);
		}
		return sheetData;
	}
}
