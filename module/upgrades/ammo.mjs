export const T20AmmoUpgrades = {};

T20AmmoUpgrades.status = {
	accurate: 'DONE',
	pungent: 'DONE',
	cruel: 'DONE',
	atrocious: 'DONE',
	balanced: 'DONE',
	harmonized: 'DONE',
	injection:'MANUAL',
	massive: 'DONE',
	specialmaterial: 'MANUAL',
	scope: 'MANUAL',
	precise: 'DONE',
};

T20AmmoUpgrades.accurate = {
	name: "T20.WeaponUpgradesAccurate",
	description: "T20.WeaponUpgradesTooltipAccurate",
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
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
}

T20AmmoUpgrades.pungent = {
	name: "T20.WeaponUpgradesPungent",
	description: "T20.WeaponUpgradesTooltipPungent",
	tint: "#FFFFFF",
	changes: [
		{
			"key": "ataque",
			"value": "2",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "pungent",
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
};

T20AmmoUpgrades.cruel = {
	name: "T20.WeaponUpgradesCruel",
	description: "T20.WeaponUpgradesTooltipCruel",
	tint: "#FF0000",
	changes: [
		{
			"key": "dano",
			"value": "1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "cruel",
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
};

T20AmmoUpgrades.atrocious = {
	name: "T20.WeaponUpgradesAtrocious",
	description: "T20.WeaponUpgradesTooltipAtrocious",
	tint: "#FF0000",
	changes: [
		{
			"key": "dano",
			"value": "2",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "atrocious",
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
};

T20AmmoUpgrades.balanced = {
	name: "T20.WeaponUpgradesBalanced",
	description: "T20.WeaponUpgradesTooltipBalanced",
	tint: "#00FF00",
	changes: [
		{
			"key": "system.pericias.luta.outros",
			"value": "2",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "balanced",
			self: false,
			skill: true,
			items: "T20.SkillLuta"
		}
	},
	disabled: true,
	isSuppressed: true,
	transfer: true
};

T20AmmoUpgrades.harmonized = {
	name: "T20.WeaponUpgradesHarmonized",
	description: "T20.WeaponUpgradesTooltipHarmonized",
	tint: "#FFFF00",
	changes: [],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "harmonized",
			self: false,
			custo: "-1",
			attack: true
		}
	},
	disabled: false,
	transfer: true
};

T20AmmoUpgrades.massive = {
	name: "T20.WeaponUpgradesMassive",
	description: "T20.WeaponUpgradesTooltipMassive",
	tint: "#800080",
	changes: [
		{
			"key": "criticoX",
			"value": "1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "massive",
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
};

T20AmmoUpgrades.precise = {
	name: "T20.WeaponUpgradesPrecise",
	description: "T20.WeaponUpgradesTooltipPrecise",
	tint: "#808080",
	changes: [
		{
			"key": "criticoM",
			"value": "-1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "precise",
			self: false,
			attack: true
		}
	},
	disabled: false,
	transfer: true
};