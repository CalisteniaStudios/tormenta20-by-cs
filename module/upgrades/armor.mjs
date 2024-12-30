export const T20ArmorUpgrades = {
	general: {},
	leve: {},
	pesada: {},
	escudo: {}
};

T20ArmorUpgrades.status = {
	adjusted: 'DONE',
	undermeasure: 'DONE',
	polished: 'DONE',
	reinforced: 'DONE',
	delicate: 'DONE',
	sealed: 'DONE',
	specialmaterial: 'MANUAL',
	thorny: 'MANUAL',
}

/* GENERAL - Available for all armor */
T20ArmorUpgrades.general.adjusted = {
		name: "T20.ArmorUpgradesAdjusted",
		tint: "#FFFFFF",
		changes: [
				{
						"key": "system.attributes.defesa.pda",
						"value": "-1",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "adjusted"
				}
		},
		disabled: false,
		transfer: true
};

T20ArmorUpgrades.general.undermeasure = {
		name: "T20.ArmorUpgradesUnderMeasure",
		tint: "#AAAAAA",
		changes: [
				{
						"key": "system.attributes.defesa.pda",
						"value": "-2",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "undermeasure",
						self: false,
				}
		},
		disabled: false,
		transfer: true
};

T20ArmorUpgrades.general.polished = {
		name: "T20.ArmorUpgradesPolished",
		tint: "#C0C0C0",
		duration: {
			duration: 1,
			rounds: 1,
			startRound: 1,
			startTurn: 0
		},
		changes: [
				{
						"key": "system.attributes.defesa.bonus",
						"value": "5",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "polished",
						self: true
				}
		},
		disabled: false,
		transfer: true
};

T20ArmorUpgrades.general.reinforced = {
		name: "T20.ArmorUpgradesReinforced",
		tint: "#808080",
		changes: [
				{
						"key": "system.attributes.defesa.bonus",
						"value": "1",
						"mode": 2,
						"priority": 0
				},
				{
						"key": "system.attributes.defesa.pda",
						"value": "1",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "reinforced",
						self: true
				}
		},
		disabled: false,
		transfer: true
};

/** PESADA - Available only for heavy armor */
T20ArmorUpgrades.pesada.delicate = {
		name: "T20.ArmorUpgradesDelicate",
		tint: "#FFDDDD",
		changes: [
				{
						"key": "system.attributes.defesa.bonus",
						"value": "1",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "delicate",
						self: false
				}
		},
		disabled: false,
		transfer: true
};

T20ArmorUpgrades.pesada.sealed = {
		name: "T20.ArmorUpgradesSealed",
		tint: "#0000FF",
		changes: [
				{
						"key": "system.modificadores.pericias.resistencia",
						"value": "1",
						"mode": 2,
						"priority": 0
				}
		],
		flags: { 
				tormenta20: { 
						onuse: false,
						durationScene: false,
						upgrade: "sealed",
						self: false
				}
		},
		disabled: false,
		transfer: true
};
