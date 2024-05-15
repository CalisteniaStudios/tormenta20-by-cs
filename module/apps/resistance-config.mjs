/**
 * A form to set actor damage and condition resistances
 * @extends {DocumentSheet}
 */
 export default class ActorResistanceConfig extends DocumentSheet {

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20"],
			template: "systems/tormenta20/templates/apps/resistance-config.html",
			width: 300,
			height: "auto"
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get title() {
		return `Resistências: ${this.document.name}`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const sourceResistance = foundry.utils.getProperty(this.document._source, "system.tracos.resistencias") || {};
		
		const resist = Object.keys(CONFIG.T20.damageTypes).reduce((o, k)=> {
			o[k] = {value:0, base:0, bonus:[], excecao: 0, imunidade:false, vulnerabilidade:false};
			return o;
		}, {});
		
		const data = {
			resistance: foundry.utils.mergeObject(resist, sourceResistance),
			//foundry.utils.deepClone(sourceResistance),
			config: CONFIG.T20
		}
		return data;
	}
}
