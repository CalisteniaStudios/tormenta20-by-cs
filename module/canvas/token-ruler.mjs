/**
 * Extend the base TokenRuler class to implement additional system-specific logic.
 * @extends {Token}
 */
export default class TokenRulerT20 extends foundry.canvas.placeables.tokens.TokenRuler {
	/**
	 * @inheritdoc
	 * @param {DeepReadonly<Omit<TokenRulerWaypoint, "index"|"center"|"size"|"ray">>} waypoint
	 * @param {DeepReadonly<foundry.grid.types.GridOffset3D>} offset
	 */
	_getGridHighlightStyle(waypoint, offset) {
		const style = super._getGridHighlightStyle(waypoint, offset);
		this.#actorMovementStyle(style, waypoint);
		return style;
	}

	#actorMovementStyle(style, waypoint) {
		if (waypoint.actionConfig.teleport) return;
		const colors = [0x33bc4e, 0xf1d836, 0xe72124];
		const dtColors = [0x5d9b6a, 0xb3a85f, 0xae5557];

		const movement = foundry.utils.getProperty(this, "token.actor.system.attributes.movement");
		const { cost } = waypoint.measurement;
		if (movement) {
			const action = waypoint.action == "jump" ? "walk" : waypoint.action;
			let speed = movement[action].value;
			if (!speed && ["climb", "swim"].includes(action)) speed = movement.walk.value;
			else if (action === "hover") speed = Math.max(movement.walk.value, movement.fly.value);
			const index = Math.clamp(Math.floor((cost - 1) / speed), 0, 2);
			if (waypoint.terrain?.difficulty > 1) style.color = dtColors[index] ?? 0xbfbfbf;
			else style.color = colors[index] ?? 0xffffff;
		}
	}

	static applyMovementConfig() {
		const sourceActions = CONFIG.Token.movement.actions;
		foundry.utils.mergeObject(
			CONFIG.Token.movement.actions,
			{
				"-=crawl": null,
				blink: {
					label: "T20.MovementTeleport"
				},
				burrow: {
					// canSelect: (token) => token.hasStatusEffect("burrow")
					canSelect: (token) => !(token instanceof TokenDocument) || token.movementTypes.has("burrow")
				},
				climb: {
					canSelect: (token) => !(token instanceof TokenDocument) || !token.hasStatusEffect("caido"),
					getCostFunction: (token, _options) => {
						if (token.movementTypes.has("climb")) return (cost) => cost;
						return (cost) => cost * 2;
					}
				},
				fly: {
					canSelect: (token) =>
						!(token instanceof TokenDocument) || (token.movementTypes.has("fly") && !token.hasStatusEffect("caido"))
				},
				hover: {
					label: "T20.MovementHover",
					icon: sourceActions.fly.icon,
					img: "systems/tormenta20/icons/svg/fairy.svg",
					order: 1,
					canSelect: (token) =>
						!(token instanceof TokenDocument) || (token.movementTypes.has("hover") && !token.hasStatusEffect("caido")),
					deriveTerrainDifficulty: ({ fly }) => fly
				},
				jump: {
					canSelect: (token) => !(token instanceof TokenDocument) || !token.hasStatusEffect("caido"),
					deriveTerrainDifficulty: ({ fly }) => fly,
					getCostFunction: () => (cost) => cost
				},
				swim: {
					canSelect: (token) => !(token instanceof TokenDocument) || !token.hasStatusEffect("caido"),
					getCostFunction: (token, _options) => {
						if (token.movementTypes.has("swim")) return (cost) => cost;
						return (cost) => cost * 2;
					}
				},
				walk: {
					label: "T20.MovementWalk"
				}
			},
			{ performDeletions: true }
		);
	}
}
