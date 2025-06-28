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
		if (waypoint.actionConfig.teleport) return style;
		const colors = [0x33bc4e, 0xf1d836, 0xe72124];
		const dtColors = [0x5d9b6a, 0xb3a85f, 0xae5557];

		const movement = foundry.utils.getProperty(this, "token.actor.system.attributes.movement");
		const { cost } = waypoint.measurement;
		if (movement) {
			let speed = movement[waypoint.action];
			if ((!speed && ["climb", "swim"].includes(waypoint.action)) || waypoint.action === "jump") {
				speed = movement.walk;
			} else if (waypoint.action === "hover") {
				speed = Math.max(movement.walk, movement.fly);
			}
			const index = Math.clamp(Math.floor((cost - 1) / speed), 0, 2);
			style.color = waypoint.terrain?.difficulty > 1 ? dtColors[index] : colors[index];
		}
	}

	static applyMovementConfig() {
		foundry.utils.mergeObject(
			CONFIG.Token.movement.actions,
			{
				"-=crawl": null,
				blink: {
					label: "T20.MovementTeleport"
				},
				burrow: {
					// canSelect: (token) => token.hasStatusEffect("burrow")
					canSelect: (token) => token.movementTypes.has("burrow")
				},
				climb: {
					canSelect: (token) => !token.hasStatusEffect("caido"),
					getCostFunction: (token, _options) => {
						if (token.movementTypes.has("climb")) return (cost) => cost;
						return (cost) => cost * 2;
					}
				},
				fly: {
					canSelect: (token) => token.movementTypes.has("fly") && !token.hasStatusEffect("caido")
				},
				hover: {
					label: "T20.MovementHover",
					icon: "fa-solid fa-person-fairy",
					img: "systems/tormenta20/icons/svg/fairy.svg",
					order: 1,
					canSelect: (token) => token.movementTypes.has("hover") && !token.hasStatusEffect("caido"),
					deriveTerrainDifficulty: ({ fly }) => Math.max(fly)
				},
				jump: {
					canSelect: (token) => !token.hasStatusEffect("caido")
				},
				swim: {
					canSelect: (token) => !token.hasStatusEffect("caido"),
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
