export const T20Upgrades = {};

T20Upgrades.accurate = {
	name: "T20.WeaponUpgradesAccurate",
	tint: "#FFFFFF",
	changes: [
		{
			"key": "ataque",
			"value": "1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "accurate",
			self: true
		}
	},
	disabled: false
}
