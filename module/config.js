import { preLocalize } from "./utils.js";
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
preLocalize("creatureTypes");


T20.creatureRoles = {
	"combatant": "T20.FoeRoleCombatant",
	"caster": "T20.FoeRoleCaster",
	"trickster": "T20.FoeRoleTrickster",
	"lackey": "T20.FoeRoleLackey",
	"captain": "T20.FoeRoleCaptain",
	"boss": "T20.FoeRoleBoss",
}
preLocalize("creatureRoles");

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
preLocalize("armorTypes");

/* ---------------- Damage ---------------- */

T20.damageTypes = {
	"perda": "T20.DamageLoss",
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
preLocalize("damageTypes");


T20.healingTypes = {
	"curapv": "T20.Healing",
	"curatpv": "T20.HealingTemp",
	"curapm": "T20.ManaRecovery",
	"curatpm": "T20.ManaTemp",
}
preLocalize("healingTypes");

T20.damageResistanceTypes = mergeObject(foundry.utils.deepClone(T20.damageTypes), {
"fisico": "T20.DamagePhysical",
});
preLocalize("damageResistanceTypes");


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
preLocalize("timePeriods");

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
preLocalize("abilityActivationTypes");

T20.abilityConsumptionTypes = {
	"ammo": "T20.ConsumeAmmunition",
	"attribute": "T20.ConsumeAttribute",
	"material": "T20.ConsumeMaterial"
};
preLocalize("abilityConsumptionTypes");


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
preLocalize("targetTypes");

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
preLocalize("areaTargetTypes");


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
preLocalize("movementUnits");

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
preLocalize("distanceUnits");

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
preLocalize("atributos");

T20.atributosAbr = {
	"for": "T20.AbilityStrAbbr",
	"des": "T20.AbilityDexAbbr",
	"con": "T20.AbilityConAbbr",
	"int": "T20.AbilityIntAbbr",
	"sab": "T20.AbilityWisAbbr",
	"car": "T20.AbilityChaAbbr"
};
preLocalize("atributosAbr");

/* -------------- Resources --------------- */
T20.resources = {
	"primary": "T20.ResourcePrimary",
	"secondary": "T20.ResourceSecondary",
	"tertiary": "T20.ResourceTertiary",
	"deathsave": "T20SK.ResourceDeathSave",
	"shadow": "T20SK.ResourceShadow",
	"catarse": "T20SK.ResourceCatarse",
}
preLocalize("resources");

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
preLocalize("pericias");

T20.resistencias = {
	"fort": "T20.SkillFort",
	"refl": "T20.SkillRefl",
	"vont": "T20.SkillVont",
}
preLocalize("resistencias");

T20.skillCompendiumEntries = {
  "acro": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.mtIHFUZSK6xBFHqd",
  "ades": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.GGVyGDvqfIQKFLch",
  "atle": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.eMu2uKBn5KV0eRI4",
  "atua": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.ZTsOxj5RZPayHIFX",
  "cava": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.MqOZve8EYE7jIUFw",
  "conh": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.TjjV15fV27nEoWyX",
  "cura": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.wQcNQVpDUvzvmHMY",
  "dipl": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.cPbZCkI3ApOFMTnL",
  "enga": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.SF7OrtCOR5wqLTaH",
  "fort": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.PcT6ZdZqQgsF5xh2",
  "furt": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.bNaCnZBCP78XDpTS",
  "guer": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.Enbe4Cb4SZmTJiE9",
  "inic": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.Wjq09fN74TRjtwaa",
  "inti": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.yFlMv6opj01JYXmu",
  "intu": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.gOxPHHZ9lKpaVA2i",
  "inve": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.FA5Km75yEUsW8hR4",
  "joga": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.WKC0D1EIJLEEqsX1",
  "ladi": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.Ic17BdCyk6Eb4fE5",
  "luta": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.LFvkUhrjgGP9Joqv",
  "mist": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.T5I0dWUuXFEyorJG",
  "nobr": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.oacoimyp8UfMD1o7",
  "ofíc": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.GcfpNnf0qsct6c36",
  "perc": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.IZDwoKmx3sd0MGDv",
  "pilo": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.RZGkvgBj943km7Ux",
  "pont": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.FpCIRhlSUBciPvL1",
  "refl": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.rYJ5YACNaWGrv3f8",
  "reli": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.0GUTcO35fxzma15V",
  "sobr": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.SdS8pxPmbSpjv5Ml",
  "vont": "Compendium.tormenta20.basico.gPPLzgFvC0JKi5UE.JournalEntryPage.YriqYltqs9f00eAb"
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
preLocalize("senses");

/* --------------- Movement --------------- */
/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @type {Object<string,string>}
 */
T20.movementTypes = {
	"walk": "T20.MovementWalk",
	"climb": "T20.MovementClimb",
	"burrow": "T20.MovementBurrow",
	"swim": "T20.MovementSwim",
	"fly": "T20.MovementFly",
};
preLocalize("movementTypes");

/* ----------------- Size ----------------- */

T20.actorSizes = {
	"min": "T20.SizeTiny",
	"peq": "T20.SizeSmall",
	"med": "T20.SizeMedium",
	"gra": "T20.SizeLarge",
	"eno": "T20.SizeHuge",
	"col": "T20.SizeGargantuan"
};
preLocalize("actorSizes");

T20.tokenSizes = {
	"min": 1,
	"peq": 1,
	"med": 1,
	"gra": 2,
	"eno": 3,
	"col": 6
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
preLocalize("profArmas");

/**
 * The set of Armor Proficiencies which a character may have
 * @type {Object}
 */
T20.profArmaduras = {
	"lev": "T20.ArmorLightProficiency",
	"pes": "T20.ArmorHeavyProficiency",
	"esc": "T20.ArmorShieldProficiency",
};
preLocalize("profArmaduras");

/* ---------------------------------------- */
/*  Class Data - TODO: REMOVE               */
/* ---------------------------------------- */

T20.pvPorNivel = [2, 3, 4, 5, 6];
T20.pmPorNivel = [3, 4, 5, 6];

T20.atributoPV = {
	"forPV": "T20.AbilityStr",
	"desPV": "T20.AbilityDex",
	"intPV": "T20.AbilityInt",
	"sabPV": "T20.AbilityWis",
	"carPV": "T20.AbilityCha"
}
preLocalize("atributoPV");
	
T20.atributoPM = {
	"forPM": "T20.AbilityStr",
	"desPM": "T20.AbilityDex",
	"conPM": "T20.AbilityCon",
	"intPM": "T20.AbilityInt",
	"sabPM": "T20.AbilityWis",
	"carPM": "T20.AbilityCha"
}
preLocalize("atributoPM");

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
preLocalize("powerType");

T20.powerSubType = {
	"combate": "T20.PowerSubTypeCombat",
	"concedido": "T20.PowerSubTypeDivine",
	"destino": "T20.PowerSubTypeDestiny",
	"magia": "T20.PowerSubTypeSpell",
	"tormenta": "T20.PowerSubTypeTormenta",
}
preLocalize("powerSubType");

/* ---------------------------------------- */
/*  Spell Data                              */
/* ---------------------------------------- */

/* ------------------ Type ---------------- */

T20.spellType = {
	"arc": "T20.SpellArc",
	"div": "T20.SpellDiv",
	"uni": "T20.SpellUni"
}
preLocalize("spellType");

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
preLocalize("spellSchools");

/* ---------------- Circle --------------- */

T20.spellLevels = {
	1: "T20.SpellLevel1",
	2: "T20.SpellLevel2",
	3: "T20.SpellLevel3",
	4: "T20.SpellLevel4",
	5: "T20.SpellLevel5"
};
preLocalize("spellLevels");

/* ---------------------------------------- */
/*  Weapon Data                             */
/* ---------------------------------------- */

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 * preLocalize("abilities");
 */
T20.weaponTypes = {
	"sim": "T20.WeaponSimple",
	"mar": "T20.WeaponMartial",
	"exo": "T20.WeaponExotic",
	"fog": "T20.WeaponFireArm",
	"nat": "T20.WeaponNatural",
	"imp": "T20.WeaponImprov",
};
preLocalize("weaponTypes");

/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 * preLocalize("abilities");
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
preLocalize("weaponProperties");

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

T20.passosDano = ['1','1d2','1d3','1d4','1d6','1d8','1d10','1d12','3d6','4d6','4d8','4d10','4d12'];

// NPC STATS
T20.tableSize = {
	size: ["min","peq","med","gra","eno","col"],
	grid: [1.5,1.5,1.5,3,4.5,9],
	stealth:  [5,2,0,-2,-5,-10],
	maneuver: [-5,-2,0,2,5,10],
}

T20.tableMovement = {
	type:		['T20.NPCB_Bipedal','T20.NPCB_Bipedal','T20.NPCB_Bipedal',
					 'T20.NPCB_Quadrupedal','T20.NPCB_Quadrupedal','T20.NPCB_Quadrupedal',
					 'T20.NPCB_Flying','T20.NPCB_Flying','T20.NPCB_Flying',
					 'T20.NPCB_Climber','T20.NPCB_Burrower','T20.NPCB_Swimmer'
	],
	size:		["Pequeno ou menor","Médio","Grande ou maior","Pequeno ou maior","Médio","Grande","","",""],
	size2:	[["min","peq"],["med"],["gra","eno","col"]],
	slow:		[4.5,6,9,6,9,12,12,15,18,4.5,4.5,9],
	normal:	[6,9,12,9,12,15,15,18,24,9,6,15],
	fast:		[9,12,15,12,15,18,18,24,36,12,9,24]
}

T20.tableAbilities = {
	'cat': ["Incapaz","Incompetente","Ineficaz","Mediano","Notável","Excelente","Extraordinário","Excepcional"],
	'val': ["1","2-5","6-9","10-13","14-17","18-21","22-25","26+"]
}

T20.RoleMods = {
	"combatant": {good:['attack','damage','defense','hp'], bad:[]},
	"caster": {good:['vont'], bad:['attack','damage','defense','hp']},
	"trickster": {good:['vont'], bad:['attack','damage','defense','hp']},
	"lackey": {good:['attack','hp'], bad:[]},
	"boss": {good:['hp'], bad:[]},
}

T20.NDparams = {
	labels: ['','T20.AbbreviationCR','T20.Attack','T20.Damage','T20.Defense','T20.NPCB_SaveGood','T20.NPCB_SaveNormal','T20.NPCB_SaveBad','T20.HP','T20.AbbreviationDC'],
  pat: ['i','i','i','i','i','i','v','v','v','v','v','v','c','c','c','c','c','c','l','l','l','l'],
  cr: ['1/4','1/2','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
  attack: [6,7,9,12,14,16,17,20,24,26,27,29,34,36,37,39,43,46,47,49,52,54],
  damage: [8,10,15,18,21,24,40,56,62,68,74,80,130,144,158,172,186,200,270,288,306,324],
  defense: [11,14,16,19,21,23,24,27,31,33,34,36,41,43,44,46,50,53,54,56,59,61],
  topsave: [3,6,11,13,15,16,16,18,20,21,21,22,29,30,30,31,31,32,32,33,33,34],
  midsave: [0,3,5,7,9,10,10,12,14,15,15,16,23,24,24,25,25,26,26,27,27,28],
  botsave: [-2,-1,0,2,4,5,5,7,9,10,10,11,18,19,19,20,20,21,21,22,22,23],
  hp: [7,15,35,70,105,140,200,240,280,320,360,400,550,600,650,700,750,800,1020,1080,1140,1200],
  dc: [12,14,15,16,17,18,20,22,24,26,28,30,31,33,35,38,40,42,44,47,47,49]
}

T20.NPCParams = ( cr ) => {
	let idx = T20.NDparams.cr.indexOf(cr.toString());
	if ( idx < 0 ){
		ui.notifications.warn(game.i18n.format("T20.CRInvalid", {cr: cr}));
		idx = 0;
	}
	
	let param = Object.entries(T20.NDparams).reduce(( acc, p )=>{
		acc[p[0]] = p[1][idx];
		return acc;
	},{});
	return param;
}
