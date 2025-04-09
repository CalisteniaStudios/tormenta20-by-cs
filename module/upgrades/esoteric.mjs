export const T20EsotericUpgrades = {};

T20EsotericUpgrades.status = {
	channeler: 'MANUAL',
	energetic: 'DONE',
	harmonized: 'DONE',
	specialmaterial: 'MANUAL',
	powerful: 'MANUAL',
	vigilant: 'DONE',
};

T20EsotericUpgrades.energetic = {
		name: "T20.EsotericUpgradesEnergetic",
		description: "T20.EsotericUpgradesTooltipEnergetic",
		tint: "#FFA500",
		changes: [
				{
						key: "dano",
						value: "1d6",
						mode: 2,
						priority: 0
				}
		],
		flags: {
				tormenta20: {
						onuse: true,
						durationScene: false,
						upgrade: "energetic",
						self: false,
						spell: true
				}
		},
		disabled: false,
		transfer: true
};

T20EsotericUpgrades.harmonized = {
		name: "T20.EsotericUpgradesHarmonized",
		description: "T20.EsotericUpgradesHTooltiparmonized",
		tint: "#800080",
		changes: [],
		flags: {
				tormenta20: {
						onuse: true,
						durationScene: false,
						upgrade: "harmonized",
						self: false,
						custo: "-1",
						spell: true
				}
		},
		disabled: false,
		transfer: true
};

T20EsotericUpgrades.vigilant = {
		name: "T20.EsotericUpgradesVigilant",
		description: "T20.EsotericUpgradeTooltipsVigilant",
		tint: "#00FF00",
		changes: [
				{
						"key": "system.attributes.defesa.bonus",
						"value": "2",
						"mode": 2,
						"priority": 0
				}
		],
		flags: {
				tormenta20: {
						onuse: false,
						durationScene: false,
						upgrade: "vigilant",
						self: false
				}
		},
		disabled: false,
		transfer: true
};