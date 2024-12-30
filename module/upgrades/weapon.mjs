export const T20WeaponUpgrades = {};

T20WeaponUpgrades.status = {
	accurate: 'DONE',
	pungent: 'DONE',
	cruel: 'DONE',
	atrocious: 'DONE',
	balanced: 'DONE',
	harmonized: 'DONE',
	alchemicalInjection:'MANUAL',
	massive: 'DONE',
	specialMaterial: 'MANUAL',
	telescopicSight: 'MANUAL',
	precise: 'DONE',
};

T20WeaponUpgrades.accurate = {
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
	disabled: false,
	transfer: false
}

T20WeaponUpgrades.pungent = {
	name: "T20.WeaponUpgradesPungent",
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
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20WeaponUpgrades.cruel = {
	name: "T20.WeaponUpgradesCruel",
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
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20WeaponUpgrades.atrocious = {
	name: "T20.WeaponUpgradesAtrocious",
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
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20WeaponUpgrades.balanced = {
	name: "T20.WeaponUpgradesBalanced",
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

T20WeaponUpgrades.harmonized = {
	name: "T20.WeaponUpgradesHarmonized",
	tint: "#FFFF00",
	changes: [],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "harmonized",
			self: true,
			custo: "-1"
		}
	},
	disabled: false,
	transfer: false
};

T20WeaponUpgrades.massive = {
	name: "T20.WeaponUpgradesMassive",
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
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20WeaponUpgrades.precise = {
	name: "T20.WeaponUpgradesPrecise",
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
			self: true
		}
	},
	disabled: false,
	transfer: false
};