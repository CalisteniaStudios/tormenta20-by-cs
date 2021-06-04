/**
 * A simple form to set actor movement speeds
 * @implements {BaseEntitySheet}
 */
export default class ActorMovementConfig extends BaseEntitySheet {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20"],
			template: "systems/tormenta20/templates/apps/movement-config.html",
			width: 300,
			height: "auto"
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get title() {
		return `Deslocamento: ${this.entity.name}`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const sourceMovement = foundry.utils.getProperty(this.document.data._source, "data.attributes.movement") || {};
		const data = {
			movement: foundry.utils.deepClone(sourceMovement)
		}
		for ( let [k, v] of Object.entries(data.movement) ) {
			if ( ["hover"].includes(k) ) continue;
			data.movement[k] = Number.isNumeric(v) ? v.toNearest(0.1) : 0;
		}
		return data;
	}
}
