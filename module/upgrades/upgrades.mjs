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
	disabled: false,
	transfer: false
}

T20Upgrades.pungent = {
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

T20Upgrades.cruel = {
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

T20Upgrades.atrocious = {
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

T20Upgrades.balanced = {
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

T20Upgrades.harmonized = {
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

// TODO
T20Upgrades.alchemicalInjection = {
	name: "T20.WeaponUpgradesAlchemicalInjection",
	tint: "#FFA500",
	changes: [],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: true,
			upgrade: "alchemicalInjection",
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20Upgrades.massive = {
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

// TODO
T20Upgrades.specialMaterial = {
	name: "T20.WeaponUpgradesSpecialMaterial",
	tint: "#00FFFF",
	changes: [],
	flags: { 
		tormenta20: { 
			onuse: false,
			durationScene: false,
			upgrade: "specialMaterial",
			self: false
		}
	},
	disabled: false,
	transfer: false
};

// TODO
T20Upgrades.telescopicSight = {
	name: "T20.WeaponUpgradesTelescopicSight",
	tint: "#A52A2A",
	changes: [
		{
			"key": "alcance",
			"value": "1",
			"mode": 2,
			"priority": 0
		}
	],
	flags: { 
		tormenta20: { 
			onuse: true,
			durationScene: false,
			upgrade: "telescopicSight",
			self: true
		}
	},
	disabled: false,
	transfer: false
};

T20Upgrades.precise = {
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
