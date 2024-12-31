export const T20ToolsUpgrades = {};

T20ToolsUpgrades.status = {
	enhanced: 'DONE',
};

T20ToolsUpgrades.enhanced = {
	name: "T20.ToolUpgradesEnhanced",
	tint: "#00FF00",
	changes: [
		{
			"key": "system.modificadores.pericias.geral",
			"value": "1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: false,
			durationScene: false,
			upgrade: "enhanced",
			self: false,
			skill: true
		}
	},
	disabled: false,
	isSuppressed: true,
	transfer: true
};