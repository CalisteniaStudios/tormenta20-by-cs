/**
 * A form to set actor damage and condition resistances
 * @implements {BaseEntitySheet}
 */
 export default class ActorResistanceConfig extends BaseEntitySheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20"],
			template: "systems/tormenta20/templates/apps/resistance-config.html",
			width: 300,
			height: "auto"
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get title() {
		return `Resistências: ${this.entity.name}`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const sourceResistance = foundry.utils.getProperty(this.document.data._source, "data.tracos.resistencias") || {};
		const data = {
			resistance: foundry.utils.deepClone(sourceResistance),
			config: CONFIG.T20
		}
		console.log(sourceResistance);
		// for ( let [v, k] of Object.entries(data.resistance) ) {
		// 	console.log(v);
		// 	console.log(k);
		// 	data.resistance[k] = Number.isNumeric(v) ? v.toNearest(0.1) : 0;
		// }
		console.log(data);
		return data;
	}
}
