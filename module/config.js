import { T20Conditions } from "./conditions/conditions.js";
export const T20 = {};

/* ---------------------------------------- */
/*  Template Overwrites                     */
/* ---------------------------------------- */

CONFIG.ChatMessage.template = "systems/tormenta20/templates/chat/chat-message.html"
CONFIG.Dice.rolls[0].CHAT_TEMPLATE = 'systems/tormenta20/templates/chat/roll.html';

/* ---------------------------------------- */
/*  Effect Data                             */
/* ---------------------------------------- */

T20.statusEffectIcons = Object.values(T20Conditions);

T20.conditionTypes = T20.statusEffectIcons.reduce(function(o, s) { o[s.id] = s.label; return o;}, {});

/* ---------------------------------------- */
/*  System Data                             */
/* ---------------------------------------- */
/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars
 * @enum {number}
 */
 T20.tokenHPColors = {
	temp: 0xFF0000,
	tempmax: 0x440066,
	negmax: 0xAA0000
};

/**
 * Colors used to visualize temporary and temporary maximum MP in token mana bars
 * @enum {number}
 */
T20.tokenMPColors = {
	temp: 0x0000FF,
	tempmax: 0x440066,
	negmax: 0x550000
};


/* ---------------------------------------- */
/*  Tormenta20 Types                        */
/* ---------------------------------------- */

/* --------------- Creature --------------- */

T20.creatureTypes = {
	"ani": "T20.CreatureBeast",
	"con": "T20.CreatureConstruct",
	"esp": "T20.CreatureSpirit",
	"hum": "T20.CreatureHumanoid",
	"mon": "T20.CreatureMonstrosity",
	"mor": "T20.CreatureUndead",
}

/* ---------------- Armour ---------------- */

T20.armorTypes = {
	"leve": "T20.ArmorLight",
	"pesada": "T20.ArmorHeavy",
	"escudo": "T20.ArmorShield",
	"traje": "T20.ArmorCloth",
	"bonus": "T20.ArmorMagicBonus",
	"natural": "T20.ArmorNatural",
	"acessorio": "T20.ArmorAccessory",
}

/* ---------------- Damage ---------------- */
// TODO TRANSLATE

T20.damageTypes = {
	"acido": "T20.DamageAcid",
	"corte": "T20.DamageSlashing",
	"eletricidade": "T20.DamageLightning",
	"essencia": "T20.DamageForce",
	"fogo": "T20.DamageFire",
	"frio": "T20.DamageCold",
	"impacto": "T20.DamageBludgeoning",
	"luz": "T20.DamageRadiant",
	"mental": "T20.DamagePsychic",
	"perfuracao": "T20.DamagePiercing",
	"trevas": "T20.DamageNecrotic",
	"veneno": "T20.DamagePoison",
};


T20.healingTypes = {
	"curapv": "T20.Healing",
	"curatpv": "T20.HealingTemp",
	"curapm": "T20.ManaRecovery",
	"curatpm": "T20.ManaTemp",
}

T20.damageResistanceTypes = mergeObject(foundry.utils.deepClone(T20.damageTypes), {
"fisico": "T20.DamagePhysical",
});


/* ----------------- Time ----------------- */
/**
 * This Object defines the various lengths of time which can occur
 * @type {Object}
 */
 T20.timePeriods = {
	"inst": "T20.TimeInst",
	"scene": "T20.TimeScene",
	"turn": "T20.TimeTurn",
	"round": "T20.TimeRound",
	"sust": "T20.TimeSust",
	"minute": "T20.TimeMinute",
	"hour": "T20.TimeHour",
	"day": "T20.TimeDay",
	"month": "T20.TimeMonth",
	"year": "T20.TimeYear",
	"perm": "T20.TimePerm",
	"special": "T20.Special"
};

/* ---------------- Usage ----------------- */

/**
 * This describes the ways that an ability can be activated
 * @type {Object}
 */
 T20.abilityActivationTypes = {
	"none": "T20.None",
	"passive": "T20.ActionPassive",
	"action": "T20.ActionNormal",
	"move": "T20.ActionMove",
	"full": "T20.ActionFull",
	"reaction": "T20.ActionReaction",
	"free": "T20.ActionFree",
	"minute": T20.timePeriods.minute,
	"hour": T20.timePeriods.hour,
	"day": T20.timePeriods.day,
	"special": T20.timePeriods.special
};

T20.abilityConsumptionTypes = {
	"ammo": "T20.ConsumeAmmunition",
	"attribute": "T20.ConsumeAttribute",
	"material": "T20.ConsumeMaterial"
};


/**
 * This Object defines the types of single or area targets which can be applied
 * @type {Object}
 */
 T20.targetTypes = {
	"none": "T20.None",
	"self": "T20.TargetSelf",
	"creature": "T20.TargetCreature",
	"ally": "T20.TargetAlly",
	"enemy": "T20.TargetEnemy",
	"object": "T20.TargetObject",
	"space": "T20.TargetSpace",
	"radius": "T20.TargetRadius",
	"sphere": "T20.TargetSphere",
	"cylinder": "T20.TargetCylinder",
	"cone": "T20.TargetCone",
	"square": "T20.TargetSquare",
	"cube": "T20.TargetCube",
	"line": "T20.TargetLine",
	"wall": "T20.TargetWall"
};

/* -------------------------------------------- */

/**
 * Map the subset of target types which produce a template area of effect
 * The keys are T20 target types and the values are MeasuredTemplate shape types
 * @type {Object}
 */
T20.areaTargetTypes = {
	cone: "cone",
	cube: "rect",
	cylinder: "circle",
	line: "ray",
	radius: "circle",
	sphere: "circle",
	square: "rect",
	wall: "ray"
};


/* --------------- Distance --------------- */

/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @type {Object<string,string>}
 */
 T20.movementUnits = {
	"m": "T20.DistM",
	"km": "T20.DistKM",
};

/**
 * The valid units of measure for the range of an action or effect.
 * This object automatically includes the movement units from T20.movementUnits
 * @type {Object<string,string>}
 */
	T20.distanceUnits = {
	"none": "T20.None",
	"self": "T20.DistSelf",
	"touch": "T20.DistTouch",
	"short": "T20.DistShort",
	"medium": "T20.DistMedium",
	"long": "T20.DistLong",
	"spec": "T20.Special",
	"any": "T20.DistAny"
};
for ( let [k, v] of Object.entries(T20.movementUnits) ) {
	T20.distanceUnits[k] = v;
}


/* ---------------------------------------- */
/*  Character Data                          */
/* ---------------------------------------- */

/* -------------- Abilities --------------- */
T20.atributos = {
	"for": "T20.AbilityStr",
	"des": "T20.AbilityDex",
	"con": "T20.AbilityCon",
	"int": "T20.AbilityInt",
	"sab": "T20.AbilityWis",
	"car": "T20.AbilityCha"
};

T20.atributosAbr = {
	"for": "T20.AbilityStrAbbr",
	"des": "T20.AbilityDexAbbr",
	"con": "T20.AbilityConAbbr",
	"int": "T20.AbilityIntAbbr",
	"sab": "T20.AbilityWisAbbr",
	"car": "T20.AbilityChaAbbr"
};

/* -------------- Resources --------------- */
T20.resources = {
	"deathsave": "T20SK.ResourceDeathSave",
	"shadow": "T20SK.ResourceShadow",
	"inspiration": "T20SK.ResourceInspiration",
}
/* ---------------- Skills ---------------- */

T20.pericias = {
	"acro": "T20.SkillAcro",
	"ades": "T20.SkillAdes",
	"atle": "T20.SkillAtle",
	"atua": "T20.SkillAtua",
	"cava": "T20.SkillCava",
	"conh": "T20.SkillConh",
	"cura": "T20.SkillCura",
	"defe": "T20.SkillDefe",
	"dipl": "T20.SkillDipl",
	"enga": "T20.SkillEnga",
	"fort": "T20.SkillFort",
	"furt": "T20.SkillFurt",
	"guer": "T20.SkillGuer",
	"inic": "T20.SkillInic",
	"inti": "T20.SkillInti",
	"intu": "T20.SkillIntu",
	"inve": "T20.SkillInve",
	"joga": "T20.SkillJoga",
	"ladi": "T20.SkillLadi",
	"luta": "T20.SkillLuta",
	"mist": "T20.SkillMist",
	"ocul": "T20.SkillOcul",
	"nobr": "T20.SkillNobr",
	"ofic": "T20.SkillOfic",
	"perc": "T20.SkillPerc",
	"pilo": "T20.SkillPilo",
	"pont": "T20.SkillPont",
	"refl": "T20.SkillRefl",
	"reli": "T20.SkillReli",
	"sobr": "T20.SkillSobr",
	"vont": "T20.SkillVont",
};

T20.resistencias = {
	"fort": "T20.SkillFort",
	"refl": "T20.SkillRefl",
	"vont": "T20.SkillVont",
}

/* TODO PAGES */
T20.skillCompendiumEntries = {
	'acro': 'tormenta20.pericias.hWto9ixrLcAV5Pg9',
	'ades': 'tormenta20.pericias.3vNJgVz4DeSWUr2T',
	'atle': 'tormenta20.pericias.ZMXVeEARJHe4WsWx',
	'atua': 'tormenta20.pericias.eiKvnk0prKaG2rl0',
	'cava': 'tormenta20.pericias.umGf2m2a517affYh',
	'conh': 'tormenta20.pericias.k4BBdUTIFCFMi6Tp',
	'cura': 'tormenta20.pericias.f0Cvg9dhaAgVfjpU',
	'dipl': 'tormenta20.pericias.u3bLZxqLhvqQjlfz',
	'enga': 'tormenta20.pericias.IAzI6D4Xj2vZa4ZK',
	'fort': 'tormenta20.pericias.efy0eGXTMnXZbXED',
	'furt': 'tormenta20.pericias.u2FeyQUF5rSu9ec3',
	'guer': 'tormenta20.pericias.7pA3UiVhl2H091zb',
	'inic': 'tormenta20.pericias.W4V1ObkLtpxgRoBE',
	'inti': 'tormenta20.pericias.tGOSDh0RSh0Qewdv',
	'intu': 'tormenta20.pericias.DLcZCk8c9KUyJ0Qk',
	'inve': 'tormenta20.pericias.ZAS0zJaPRJWg15ib',
	'joga': 'tormenta20.pericias.htoLZR83iKDkmc8j',
	'ladi': 'tormenta20.pericias.lcgrJelGuEGZ96C0',
	'luta': 'tormenta20.pericias.6PwE0u0Nfr5VolzM',
	'mist': 'tormenta20.pericias.oPAtmZ2vXGDjfCyt',
	'nobr': 'tormenta20.pericias.Uw4Edff5CDnPZgIF',
	'ocul': 'tormenta20.pericias.oPAtmZ2vXGDjfCyt',
	'ofic': 'tormenta20.pericias.iviKBc19dNgZYBJ0',
	'perc': 'tormenta20.pericias.hkTML0lqoOopGTLQ',
	'pilo': 'tormenta20.pericias.d7ia26SZqoFGzGrv',
	'pont': 'tormenta20.pericias.rwDmhFebCtNIFzfy',
	'refl': 'tormenta20.pericias.p9JngLpUrPFrqiTU',
	'reli': 'tormenta20.pericias.VYEkUN1ITAQqn5y7',
	'sobr': 'tormenta20.pericias.dyePg3NS95So0yEJ',
	'vont': 'tormenta20.pericias.mBbMbDy7XnbkFzdR'
}


/* -------------- Experience -------------- */

T20.xpPorNivel = [
	0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000, 
];


/* ---------------- Senses ---------------- */

T20.senses = {
	"penumbra": "T20.SenseDimVision",
	"escuro": "T20.SenseDarkVision",
	"cegas": "T20.SenseBlindSight",
	"faro": "T20.SenseScent",
};

/* --------------- Movement --------------- */
/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @type {Object<string,string>}
 */
T20.movementTypes = {
	"burrow": "T20.MovementBurrow",
	"climb": "T20.MovementClimb",
	"fly": "T20.MovementFly",
	"swim": "T20.MovementSwim",
	"walk": "T20.MovementWalk",
};

/* ----------------- Size ----------------- */

T20.actorSizes = {
	"min": "T20.SizeTiny",
	"peq": "T20.SizeSmall",
	"med": "T20.SizeMedium",
	"gra": "T20.SizeLarge",
	"eno": "T20.SizeHuge",
	"col": "T20.SizeGargantuan"
};

T20.tokenSizes = {
	"min": 1,
	"peq": 1,
	"med": 1,
	"gra": 2,
	"eno": 3,
	"col": 4
};

/* -------------- Proficiencies ----------- */

T20.idiomas = {
	"comum": "Comum",
	"anao": "Anão",
	"elfico": "Élfico",
	"goblin": "Goblin",
	"hynne": "Hynne",
	"silvestre": "Silvestre",
	"taurico": "Táurico",
	"abissal": "Abissal",
	"aquan": "Aquan",
	"auran": "Auran",
	"celestial": "Celestial",
	"draconico": "Dracônico",
	"gigante": "Gigante",
	"gnoll": "Gnoll",
	"ignan": "Ignan",
	"infernal": "Infernal",
	"orc": "Orc",
	"terran": "Terran"
};

T20.profArmas = {
	"sim": "T20.WeaponSimpleProficiency",
	"mar": "T20.WeaponMartialProficiency",
	"exo": "T20.WeaponExoticProficiency",
	"fog": "T20.WeaponFireArmProficiency",
};

/**
 * The set of Armor Proficiencies which a character may have
 * @type {Object}
 */
T20.profArmaduras = {
	"lev": "T20.ArmorLightProficiency",
	"pes": "T20.ArmorHeavyProficiency",
	"esc": "T20.ArmorShieldProficiency",
};

/* ---------------------------------------- */
/*  Class Data - TODO: REMOVE               */
/* ---------------------------------------- */

T20.pvPorNivel = [2, 3, 4, 5, 6];
T20.pmPorNivel = [3, 4, 5, 6];

T20.atributoPV = {
	"forPV": "Força",
	"desPV": "Destreza",
	"intPV": "Inteligência",
	"sabPV": "Sabedoria",
	"carPV": "Carisma"
}

T20.atributoPM = {
	"forPM": "Força",
	"desPM": "Destreza",
	"conPM": "Constituição",
	"intPM": "Inteligência",
	"sabPM": "Sabedoria",
	"carPM": "Carisma"
}

/* ---------------------------------------- */
/*  Power Data                              */
/* ---------------------------------------- */

T20.powerType = {
	"ability": "T20.PowerTypeClassAbility",
	"classe": "T20.PowerTypeClass",
	"concedido": "T20.PowerTypeDivine",
	"geral": "T20.PowerTypeGeneral",
	"origem": "T20.PowerTypeBackground",
	"racial": "T20.PowerTypeRacial",
}

T20.powerSubType = {
	"combate": "T20.PowerSubTypeCombat",
	"concedido": "T20.PowerSubTypeDivine",
	"destino": "T20.PowerSubTypeDestiny",
	"magia": "T20.PowerSubTypeSpell",
	"tormenta": "T20.PowerSubTypeTormenta",
}

/* ---------------------------------------- */
/*  Spell Data                              */
/* ---------------------------------------- */

/* ------------------ Type ---------------- */

T20.spellType = {
	"arc": "T20.SpellArc",
	"div": "T20.SpellDiv",
	"uni": "T20.SpellUni"
}

/* ---------------- Schools --------------- */

T20.spellSchools = {
	"abj": "T20.SchoolAbj",
	"adv": "T20.SchoolAdv",
	"con": "T20.SchoolCon",
	"enc": "T20.SchoolEnc",
	"evo": "T20.SchoolEvo",
	"ilu": "T20.SchoolIlu",
	"nec": "T20.SchoolNec",
	"tra": "T20.SchoolTra"
}

/* ---------------- Circle --------------- */

T20.spellLevels = {
	1: "T20.SpellLevel1",
	2: "T20.SpellLevel2",
	3: "T20.SpellLevel3",
	4: "T20.SpellLevel4",
	5: "T20.SpellLevel5"
};

/* ---------------------------------------- */
/*  Weapon Data                             */
/* ---------------------------------------- */

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
T20.weaponTypes = {
	"sim": "T20.WeaponSimple",
	"mar": "T20.WeaponMartial",
	"exo": "T20.WeaponExotic",
	"fog": "T20.WeaponFireArm",
	"nat": "T20.WeaponNatural",
	"imp": "T20.WeaponImprov",
};

/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
T20.weaponProperties = {
	"ada": "T20.WeaponPropertiesAda",
	"agi": "T20.WeaponPropertiesFin",
	"alo": "T20.WeaponPropertiesRch",
	"arr": "T20.WeaponPropertiesThr",
	"dst": "T20.WeaponPropertiesRan",
	"dms": "T20.WeaponPropertiesTwo",
	"dup": "T20.WeaponPropertiesDou",
	"lev": "T20.WeaponPropertiesLgt",
	"mun": "T20.WeaponPropertiesAmm",
	"ver": "T20.WeaponPropertiesVer",
};

T20.encantosArmas = { //Não Implementado
	"arremesso": {
		"id": "arremesso",
		"name": "Arremesso",
		"tooltip": "A arma pode ser arremessada em alcance curto. Caso já pudesse ser arremessada, seu alcance aumenta em uma categoria. No fim do seu turno, a arma volta voando para você. Pegar a arma é uma ação livre."
	},
	"lancinante": {
			"id": "lancinante",
			"name": "Lancinante",
			"tooltip": "A arma inflige ferimentos mortais. Quando faz um acerto crítico com a arma, além de multiplicar os dados de dano, você também multiplica quaisquer bônus numéricos."
	}
};

T20.passosDano = {
		"1d3": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"1d4": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"1d6": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"1d8": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"2d4": ["1", "1d2", "1d3", "1d4", "1d6", "2d4", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"1d10": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"1d12": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"2d6": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "2d6", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"3d4": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "3d4", "3d6", "4d6", "4d8", "4d10", "4d12"],
		"2d8": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "3d8", "4d8", "4d10", "4d12"],
		"2d10": ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "2d10", "3d10", "4d10", "4d12"],
		arr1: ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "1d12", "3d6", "4d6", "4d8", "4d10", "4d12"],
		arr2: ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "3d8", "4d8", "4d10", "4d12"],
		arr3: ["1", "1d2", "1d3", "1d4", "1d6", "1d8", "1d10", "2d6", "2d8", "2d10", "3d10", "4d10", "4d12"]
}


