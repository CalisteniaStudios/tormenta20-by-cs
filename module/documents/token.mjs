/**
 * Extend the base TokenDocument class to implement system-specific HP bar logic.
 * @extends {TokenDocument}
 */
export default class TokenDocumentT20 extends TokenDocument {
	/** @inheritdoc */
	getBarAttribute(...args) {
		const data = super.getBarAttribute(...args);
		if (data && data.attribute === "attributes.pv") {
			data.value += parseInt(foundry.utils.getProperty(this.actor, "system.attributes.pv.temp") || 0);
		}
		if (data && data.attribute === "attributes.pm") {
			data.value += parseInt(foundry.utils.getProperty(this.actor, "system.attributes.pm.temp") || 0);
		}
		return data;
	}

	_inferMovementAction() {
		const movement = this.actor?.system.attributes?.movement ?? {};
		if (this.hasStatusEffect("caido")) return CONFIG.Token.movement.defaultAction;
		if (this.movementTypes.has("hover")) return "hover";
		if (this.movementTypes.has("fly") && movement.fly > movement.walk) return "fly";
		return CONFIG.Token.movement.defaultAction;
	}

	get movementTypes() {
		const movement = this.actor?.system.attributes.movement ?? {};
		return new Set(Object.keys(movement).filter((key) => key !== "unit" && movement[key]));
	}
}
