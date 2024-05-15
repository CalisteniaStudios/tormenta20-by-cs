export default class CharacterProgression extends FormApplication {
	constructor(object={}, options={}) {
		super(object,options);
	}
	
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "character-progression",
			classes: ["tormenta20"],
			title: game.i18n.localize('T20.CharacterProgression'),
			template: "systems/tormenta20/templates/apps/character-progression.hbs",
			width: 700,
			height: 700, //"auto",
			choices: {},
			allowCustom: true,
			minimum: 0,
			maximum: null
		});
	}

	getData() {
		const actor = this.object;
		return {
			race: {},
			devotion: {},
			background: {},
			levels: {
				1: {
					class: "",
					items: []
				}
			},
			config: CONFIG.T20
		};
	}

	async _updateObject(event, formData) {
		// const data = foundry.utils.expandObject(formData);
		// delete data.classes;
		// await this.object.setFlag("tormenta20", "lvlconfig", data);
		return;
	}
}
