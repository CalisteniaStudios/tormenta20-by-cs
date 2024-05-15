export default class AbilityCalculator extends FormApplication {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "ability-calculator",
			classes: ["tormenta20"],
			title: game.i18n.localize('T20.AbilityCalculator'),
			template: "systems/tormenta20/templates/apps/ability-calculator.html",
			width: 500,
			height: "auto",
		});
	}

	getData() {
		let sheetData = super.getData();
		// ACTORDATA
		sheetData['actor'] = this.object;
		sheetData['system'] = this.object.system;
		sheetData['flags'] = this.object.flags.tormenta20;
		// SETTINGS
		sheetData['AbilityRule'] = 'pointbuy'; //[pointbuy, roll4d6, array]
		sheetData['AbilityRacialRule'] = 'tormenta20'; // ['default','flex']
		sheetData['AbilityPoints'] = 10;
		sheetData['AbilityArray'] = [4, 2, 1, 1, 0, -1]; //[3, 3, 1, 1, 0, 0] [3, 2, 2, 1, 1, 0]
		sheetData['config'] = CONFIG.T20;
		
		return sheetData;
	}

	async _updateObject(event, formData) {
		const data = foundry.utils.expandObject(formData);
		return;
	}
}
