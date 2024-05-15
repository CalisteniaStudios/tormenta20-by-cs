import { preLocalize } from "../utils.mjs";
import { T20Conditions } from "../conditions/conditions.mjs";
import { CHALLENGELEVEL, AMEACATYPES } from "./ameaca.js";
export const T20 = {};
export const SYSTEMRULES = {};

/* ---------------------------------------- */
/*  Compendium Indexing                     */
/* ---------------------------------------- */

CONFIG.Actor.compendiumIndexFields.push('system.attributes.nd');

CONFIG.Item.compendiumIndexFields.push('type');
CONFIG.Item.compendiumIndexFields.push('system.description.value');

CONFIG.Item.compendiumIndexFields.push('system.tags');
CONFIG.Item.compendiumIndexFields.push('system.tipo');
CONFIG.Item.compendiumIndexFields.push('system.subtipo');

// await compendium.getDocuments({'system.subtipo':{$in:['Bardo']}});


/* ---------------------------------------- */
/*  Template Overwrites                     */
/* ---------------------------------------- */



CONFIG.ChatMessage.template = "systems/tormenta20/templates/chat/chat-message.html"
CONFIG.Dice.rolls[0].CHAT_TEMPLATE = 'systems/tormenta20/templates/chat/roll.html';

/* ---------------------------------------- */
/*  Effect Data                             */
/* ---------------------------------------- */
T20.conditions = T20Conditions;
T20.statusEffectIcons = Object.values(T20Conditions);

T20.effectTypes = {
	"arcano":"T20.EffectTypeArcane",
	"atordoamento":"T20.EffectTypeStun",
	"cansaco":"T20.EffectTypeWeariness",
	"climatico":"T20.EffectTypeClimatic",
	"cura":"T20.EffectTypeHealing",
	"dano":"T20.EffectTypeDamage",
	"divino":"T20.EffectTypeHoly",
	"luz":"T20.EffectTypeLight",
	"magico":"T20.EffectTypeMagic",
	"medo":"T20.EffectTypeFear",
	"mental":"T20.EffectTypeMental",
	"metabolismo":"T20.EffectTypeMetabolism",
	"metamorfose":"T20.EffectTypePolymorph",
	"movimento":"T20.EffectTypeMovement",
	"sentidos":"T20.EffectTypeSenses",
	"trevas":"T20.EffectTypeDarkness",
	"veneno":"T20.EffectTypePoison",
}
preLocalize("effectTypes");
T20.conditionTypes = foundry.utils.mergeObject( Object.assign({},T20.effectTypes),
	T20.statusEffectIcons.reduce(function(o, s) { o[s.id] = s.name; return o;}, {})
)
preLocalize("conditionTypes");
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

/* --------------- Character --------------- */

T20.characterFlags = {
	inventarioOrganizado: {
		type: Boolean
	},
	createPotion: {
		type: Boolean
	},
	createScroll: {
		type: Boolean
	},
	mago: {
		type: Boolean
	},
	teste: {
		type: Number
	},
}

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
	"special": "T20.FoeRoleSpecial",
	"lackey": "T20.FoeRoleLackey",
	"solo": "T20.FoeRoleSolo",
}
preLocalize("creatureRoles");

T20.DBcreatureRoles = {
	"combatant": "T20.FoeRoleCombatant",
	"caster": "T20.FoeRoleCaster",
	"trickster": "T20.FoeRoleTrickster",
	"lackey": "T20.FoeRoleLackey",
	"captain": "T20.FoeRoleCaptain",
	"boss": "T20.FoeRoleBoss",
}
preLocalize("creatureRoles");

/* ---------------- Armour ---------------- */
/* TODO change to equipment type */
T20.armorTypes = {
	"leve": "T20.EquipmentLight",
	"pesada": "T20.EquipmentHeavy",
	"escudo": "T20.EquipmentShield",
	"bonus": "T20.EquipmentMagicBonus",
	"natural": "T20.EquipmentNatural",
	"acessorio": "T20.EquipmentAccessory",
	"traje": "T20.EquipmentClothing",
	"ferramenta": "T20.EquipmentTool",
	"esoterico": "T20.EquipmentEsoteric",
}
preLocalize("armorTypes");

/* TODO change to equipment type */
T20.itemSlotTypes = {
	"hand": "T20.ItemSlotHand",
	"body": "T20.ItemSlotBody",
	"both": "T20.ItemSlotBoth",
}
preLocalize("itemSlotTypes");
/* ---------------- Damage ---------------- */

T20.damageTypes = {
	"dano": "T20.Damage",
	"perda": "T20.DamageLoss",
	"acido": "T20.DamageAcid",
	"corte": "T20.DamageSlashing",
	"eletricidade": "T20.DamageLightning",
	"essencia": "T20.DamageForce",
	"fogo": "T20.DamageFire",
	"frio": "T20.DamageCold",
	"impacto": "T20.DamageBludgeoning",
	"luz": "T20.DamageRadiant",
	"psiquico": "T20.DamagePsychic",
	"perfuracao": "T20.DamagePiercing",
	"trevas": "T20.DamageNecrotic",
};
preLocalize("damageTypes");


T20.healingTypes = {
	"curapv": "T20.Healing",
	"curatpv": "T20.HealingTemp",
	"curapm": "T20.ManaRecovery",
	"curatpm": "T20.ManaTemp",
}
preLocalize("healingTypes");


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

SYSTEMRULES.skills = {
  "acro": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: true, sizeMod: false},
  "ades": {abl: 'car', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "atle": {abl: 'for', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "atua": {abl: 'car', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "cava": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "conh": {abl: 'int', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "cura": {abl: 'sab', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  // "defe": {abl: 'con', systems: ['skyfall'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "dipl": {abl: 'car', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "enga": {abl: 'car', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "fort": {abl: 'con', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "furt": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: true, sizeMod: true},
  "guer": {abl: 'int', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "inic": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "inti": {abl: 'car', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "intu": {abl: 'sab', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "inve": {abl: 'int', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "joga": {abl: 'car', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "ladi": {abl: 'des', systems: ['core'], trainedOnly: true, armorPenalty: true, sizeMod: false},
  "luta": {abl: 'for', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "mist": {abl: 'int', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "nobr": {abl: 'int', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  // "ocul": {abl: 'sab', systems: ['skyfall'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  // "ofic": {abl: 'int', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "perc": {abl: 'sab', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "pilo": {abl: 'des', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "pont": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "refl": {abl: 'des', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "reli": {abl: 'sab', systems: ['core'], trainedOnly: true, armorPenalty: false, sizeMod: false},
  "sobr": {abl: 'sab', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
  "vont": {abl: 'sab', systems: ['core'], trainedOnly: false, armorPenalty: false, sizeMod: false},
}

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
	"simples": "T20.WeaponSimpleProficiency",
	"marcial": "T20.WeaponMartialProficiency",
	"exotica": "T20.WeaponExoticProficiency",
	"fogo": "T20.WeaponFireArmProficiency",
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
	"distincao": "T20.PowerTypeDistincao",
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
	"uni": "T20.SpellUni",
	"eng": "T20.SpellEng",
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
	"simples": "T20.WeaponSimple",
	"marcial": "T20.WeaponMartial",
	"exotica": "T20.WeaponExotic",
	"fogo": "T20.WeaponFireArm",
	"natural": "T20.WeaponNatural",
	"improvisada": "T20.WeaponImprovised",
};
preLocalize("weaponTypes");

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 * preLocalize("abilities");
 */
T20.weaponPurposeTypes = {
	"corpo-a-corpo": "T20.WeaponMelee",
	"corpo-a-corpo-arremesso": "T20.WeaponMeleeThrowing",
	"disparo": "T20.WeaponRanged",
	"arremesso": "T20.WeaponThrowing",
};
preLocalize("weaponPurposeTypes");

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 * preLocalize("abilities");
 */
T20.weaponWieldingTypes = {
	"leve": "T20.WeaponLight",
	"uma": "T20.WeaponOneHand",
	"duas": "T20.WeaponTwoHanded",
};
preLocalize("weaponWieldingTypes");

/* -------------------------------------------- */

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 * preLocalize("abilities");
 */
T20.weaponProperties = {
	"ada": "T20.WeaponPropertiesAdaptable",//WeaponPropertiesAda
	"agi": "T20.WeaponPropertiesFinesse",//WeaponPropertiesFin
	"alo": "T20.WeaponPropertiesReach",//WeaponPropertiesRch
	"des": "T20.WeaponPropertiesUnbalanced",
	"dup": "T20.WeaponPropertiesDouble",//WeaponPropertiesDou
	"ver": "T20.WeaponPropertiesVersatile",//WeaponPropertiesVer
	"hib": "T20.WeaponPropertiesHibrid",//WeaponPropertiesVer
};
// "arr": "T20.WeaponPropertiesThr",
// "dst": "T20.WeaponPropertiesRan",
// "dms": "T20.WeaponPropertiesTwo",
// "lev": "T20.WeaponPropertiesLgt",
// "mun": "T20.WeaponPropertiesAmm",
preLocalize("weaponProperties");

T20.weaponSizes = {
	"reduzida": "T20.WeaponSizeReduced",
	"normal": "T20.WeaponSizeNormal",
	"aumentada": "T20.WeaponSizeEnlarged",
	"gigante": "T20.WeaponSizeGiant",
};
preLocalize("weaponSizes");

/* -------------------------------------------- */

/**
 * Define Item Upgrades and Tooltips
 */ 


T20.specialMaterials = {
	"ruby-steel": "T20.SpecialMaterialRubySteel",
	"adamant": "T20.SpecialMaterialAdamant",
	"everlasting-ice": "T20.SpecialMaterialEverlastingIce",
	"dark-wood": "T20.SpecialMaterialDarkWood",
	"red-matter": "T20.SpecialMaterialRedMatter",
	"mithril": "T20.SpecialMaterialMithril",
	"rainbow-metal": "T20.SpecialMaterialRainbowMetal",
	"silver": "T20.SpecialMaterialSilver", 
	"dragon-leather": "T20.SpecialMaterialDragonLeather", 
	"monster-hull": "T20.SpecialMaterialMonsterHull", 
	"kaiju-plating": "T20.SpecialMaterialKaijuPlating", 
	"bulette-leather": "T20.SpecialMaterialBuletteLeather", 
	"sun-crystal": "T20.SpecialMaterialSunCrystal", 
	"iron-coral": "T20.SpecialMaterialIronCoral", 
	"kraken-feather": "T20.SpecialMaterialKrakenFeather", 
	"razza-chitin": "T20.SpecialMaterialRazzaChitin", 
}

T20.itemUpgrades = {
	"golden": "T20.ItemUpgradesGoldPlated",
	"gems": "T20.ItemUpgradesGemsStudded",
	"discreet": "T20.ItemUpgradesDiscreet",
	"macabre": "T20.ItemUpgradesMacabre",
	"multifunctional": "T20.ItemUpgradesMultifunctional",
}
preLocalize("itemUpgrades");

T20.itemUpgradesTooltips = {
	"golden": "T20.ItemUpgradesTooltipGoldPlated",
	"gems": "T20.ItemUpgradesTooltipGemsStudded",
	"discreet": "T20.ItemUpgradesTooltipDiscreet",
	"macabre": "T20.ItemUpgradesTooltipMacabre",
	"multifunctional": "T20.ItemUpgradesTooltipMultifunctional",
}
preLocalize("itemUpgradesTooltips");

T20.toolUpgrades = {
	"enhanced": "T20.ToolUpgradesEnhanced",
}
T20.toolUpgradesTooltips = {
	"enhanced": "T20.ToolUpgradesTooltipEnhanced",
}
for ( let [k, v] of Object.entries(T20.itemUpgrades) ) {
	T20.toolUpgrades[k] = T20.itemUpgrades[k];
	T20.toolUpgradesTooltips[k] = T20.itemUpgradesTooltips[k];
}
preLocalize("toolUpgrades");
preLocalize("toolUpgradesTooltips");

T20.weaponUpgrades = {
	"accurate": "T20.WeaponUpgradesAccurate",
	"pungent": "T20.WeaponUpgradesPungent",
	"cruel": "T20.WeaponUpgradesCruel",
	"atrocious": "T20.WeaponUpgradesAtrocious",
	"balanced": "T20.WeaponUpgradesBalanced",
	"harmonized": "T20.WeaponUpgradesHarmonized",
	"injection": "T20.WeaponUpgradesAlchemicalInjection",
	"massive": "T20.WeaponUpgradesMassive",
	"specialmaterial": "T20.WeaponUpgradesSpecialMaterial",
	"scope": "T20.WeaponUpgradesScope",
	"precise": "T20.WeaponUpgradesPrecise",
	"penetrating": "T20.WeaponUpgradesPenetrating",
}
T20.weaponUpgradesTooltips = {
	"accurate": "T20.WeaponUpgradesTooltipAccurate",
	"pungent": "T20.WeaponUpgradesTooltipPungent",
	"cruel": "T20.WeaponUpgradesTooltipCruel",
	"atrocious": "T20.WeaponUpgradesTooltipAtrocious",
	"balanced": "T20.WeaponUpgradesTooltipBalanced",
	"harmonized": "T20.WeaponUpgradesTooltipHarmonized",
	"injection": "T20.WeaponUpgradesTooltipAlchemicalInjection",
	"massive": "T20.WeaponUpgradesTooltipMassive",
	"specialmaterial": "T20.WeaponUpgradesTooltipSpecialMaterial",
	"scope": "T20.WeaponUpgradesTooltipScope",
	"precise": "T20.WeaponUpgradesTooltipPrecise",
	"penetrating": "T20.ItemUpgradesTooltipPenetrating",
}
for ( let [k, v] of Object.entries(T20.itemUpgrades) ) {
	T20.weaponUpgrades[k] = T20.itemUpgrades[k];
	T20.weaponUpgradesTooltips[k] = T20.itemUpgradesTooltips[k];
}
preLocalize("weaponUpgrades");
preLocalize("weaponUpgradesTooltips");

T20.armorUpgrades = {
	"adjusted": "T20.ArmorUpgradesAdjusted",
	"undermeasure": "T20.ArmorUpgradesUnderMeasure",
	"delicate": "T20.ArmorUpgradesDelicate",
	"thorny": "T20.ArmorUpgradesThorny",
	"specialmaterial": "T20.ArmorUpgradesSpecialMaterial",
	"polished": "T20.ArmorUpgradesPolished",
	"reinforced": "T20.ArmorUpgradesReinforced",
	"sealed": "T20.ArmorUpgradesSealed",
}
T20.armorUpgradesTooltips = {
	"adjusted": "T20.ArmorUpgradesTooltipAdjusted",
	"undermeasure": "T20.ArmorUpgradesTooltipUnderMeasure",
	"delicate": "T20.ArmorUpgradesTooltipDelicate",
	"thorny": "T20.ArmorUpgradesTooltipThorny",
	"specialmaterial": "T20.ArmorUpgradesTooltipSpecialMaterial",
	"polished": "T20.ArmorUpgradesTooltipPolished",
	"reinforced": "T20.ArmorUpgradesTooltipReinforced",
	"sealed": "T20.ArmorUpgradesTooltipSealed",
}

T20.shieldUpgrades = {
	"thorny":"T20.ShieldUpgradesThorny"
}
T20.shieldUpgradesTooltips = {
	"thorny":"T20.ShieldUpgradesTooltipThorny"
}
for ( let [k, v] of Object.entries(T20.armorUpgrades) ) {
	if ( k == 'thorny' ) continue;
	T20.shieldUpgrades[k] = T20.armorUpgrades[k];
	T20.shieldUpgradesTooltips[k] = T20.armorUpgradesTooltips[k];
}
for ( let [k, v] of Object.entries(T20.itemUpgrades) ) {
	T20.armorUpgrades[k] = T20.itemUpgrades[k];
	T20.armorUpgradesTooltips[k] = T20.itemUpgradesTooltips[k];
	T20.shieldUpgrades[k] = T20.itemUpgrades[k];
	T20.shieldUpgradesTooltips[k] = T20.itemUpgradesTooltips[k];
}
preLocalize("armorUpgrades");
preLocalize("armorUpgradesTooltips");
preLocalize("shieldUpgrades");
preLocalize("shieldUpgradesTooltips");

T20.esotericUpgrades = {
	"channeler": "T20.EsotericUpgradesChanneler",
	"energetic": "T20.EsotericUpgradesEnergetic",
	"harmonized": "T20.EsotericUpgradesHarmonized",
	"specialmaterial": "T20.EsotericUpgradesSpecialMaterial",
	"powerful": "T20.EsotericUpgradesPowerful",
	"vigilant": "T20.EsotericUpgradesVigilant",
	"enhancer": "T20.EsotericUpgradesEnhancer",
}

T20.esotericUpgradesTooltips = {
	"channeler": "T20.EsotericUpgradesEnhancer",
	"energetic": "T20.EsotericUpgradesTooltipEnergetic",
	"harmonized": "T20.EsotericUpgradesTooltipHarmonized",
	"specialmaterial": "T20.EsotericUpgradesTooltipSpecialMaterial",
	"powerful": "T20.EsotericUpgradesTooltipPowerful",
	"enhancer": "T20.EsotericUpgradesTooltipEnhancer",
	"vigilant": "T20.EsotericUpgradesTooltipVigilant",
}
for ( let [k, v] of Object.entries(T20.itemUpgrades) ) {
	T20.esotericUpgrades[k] = T20.itemUpgrades[k];
	T20.esotericUpgradesTooltips[k] = T20.itemUpgradesTooltips[k];
}
preLocalize("esotericUpgrades");
preLocalize("esotericUpgradesTooltips");

/* -------------------------------------------- */

/**
 * Define Item Enchantment and Tooltips
 */

T20.weaponEnchantments = {
	"keen": "T20.WeaponEnchantKeen",
	"bane": "T20.WeaponEnchantBane",
	"throwable": "T20.WeaponEnchantThrowable",
	"assassin": "T20.WeaponEnchantAssassin",
	"seeking": "T20.WeaponEnchantSeeking",
	"frost": "T20.WeaponEnchantFrost",
	"caster": "T20.WeaponEnchantCaster",
	"corrosive": "T20.WeaponEnchantCorrosive",
	"dancing": "T20.WeaponEnchantDancing",
	"defending": "T20.WeaponEnchantDefending",
	"destructive": "T20.WeaponEnchantDestructive",
	"lacerating": "T20.WeaponEnchantLacerating",
	"draining": "T20.WeaponEnchantDraining",
	"shock": "T20.WeaponEnchantShock",
	"energy": "T20.WeaponEnchantEnergy",
	"excruciating": "T20.WeaponEnchantExcruciating",
	"flaming": "T20.WeaponEnchantFlaming",
	"formidable": "T20.WeaponEnchantFormidable",
	"lancinating": "T20.WeaponEnchantLancinating",
	"magnificent": "T20.WeaponEnchantMagnificent",
	"merciful": "T20.WeaponEnchantMerciful",
	"unholy": "T20.WeaponEnchantUnholy",
	"holy": "T20.WeaponEnchantHoly",
	"bloodthirsty": "T20.WeaponEnchantBloodthirsty",
	"thundering": "T20.WeaponEnchantThundering",
	"sepulchral": "T20.WeaponEnchantSepulchral",
	"speed": "T20.WeaponEnchantSpeed",
	"poisonous": "T20.WeaponEnchantPoisonous",
}
T20.weaponEnchantmentsTooltips = {
	"keen": "T20.WeaponEnchantTooltipKeen",
	"bane": "T20.WeaponEnchantTooltipBane",
	"throwable": "T20.WeaponEnchantTooltipThrowable",
	"assassin": "T20.WeaponEnchantTooltipAssassin",
	"hunter": "T20.WeaponEnchantTooltipHunter",
	"freezing": "T20.WeaponEnchantTooltipFreezing",
	"caster": "T20.WeaponEnchantTooltipCaster",
	"corrosive": "T20.WeaponEnchantTooltipCorrosive",
	"dancing": "T20.WeaponEnchantTooltipDancing",
	"defender": "T20.WeaponEnchantTooltipDefender",
	"destructive": "T20.WeaponEnchantTooltipDestructive",
	"lacerating": "T20.WeaponEnchantTooltipLacerating",
	"draining": "T20.WeaponEnchantTooltipDraining",
	"eletric": "T20.WeaponEnchantTooltipEletric",
	"energy": "T20.WeaponEnchantTooltipEnergy",
	"excruciating": "T20.WeaponEnchantTooltipExcruciating",
	"flaming": "T20.WeaponEnchantTooltipFlaming",
	"formidable": "T20.WeaponEnchantTooltipFormidable",
	"lancinating": "T20.WeaponEnchantTooltipLancinating",
	"magnificent": "T20.WeaponEnchantTooltipMagnificent",
	"merciful": "T20.WeaponEnchantTooltipMerciful",
	"unholy": "T20.WeaponEnchantTooltipUnholy",
	"holy": "T20.WeaponEnchantTooltipHoly",
	"bloodthirsty": "T20.WeaponEnchantTooltipBloodthirsty",
	"thundering": "T20.WeaponEnchantTooltipThundering",
	"sepulchral": "T20.WeaponEnchantTooltipSepulchral",
	"speed": "T20.WeaponEnchantTooltipSpeed",
	"poisonous": "T20.WeaponEnchantTooltipPoisonous",
}
preLocalize("weaponEnchantments");
preLocalize("weaponEnchantmentsTooltips");

T20.armorEnchantments = {
	"abascanth": "T20.EquipmentEnchantmentAbascanth",
	"blessed": "T20.EquipmentEnchantmentBlessed",
	"acrobatic": "T20.EquipmentEnchantmentAcrobatic",
	"winged": "T20.EquipmentEnchantmentWinged",
	"frightful": "T20.EquipmentEnchantmentFrightful",
	"caustic": "T20.EquipmentEnchantmentCaustic",
	"defending": "T20.EquipmentEnchantmentDefending",
	"slick": "T20.EquipmentEnchantmentSlick",
	"ghostly": "T20.EquipmentEnchantmentGhostly",
	"ortification": "T20.EquipmentEnchantmenFortification",
	"frost": "T20.EquipmentEnchantmentFrost",
	"guardian": "T20.EquipmentEnchantmentGuardian",
	"hypnotic": "T20.EquipmentEnchantmentHypnotic",
	"illusory": "T20.EquipmentEnchantmentIllusory",
	"incandescent": "T20.EquipmentEnchantmentIncandescent",
	"invulnerable": "T20.EquipmentEnchantmentInvulnerable",
	"opaque": "T20.EquipmentEnchantmentOpaque",
	"protector": "T20.EquipmentEnchantmentProtector",
	"reflecting": "T20.EquipmentEnchantmentReflecting",
	"lightning": "T20.EquipmentEnchantmentLightning",
	"blinding": "T20.EquipmentEnchantmentBlinding",
	"shadow": "T20.EquipmentEnchantmentShadow",
	"zealous": "T20.EquipmentEnchantmentZealous",
}
T20.armorEnchantmentsTooltips = {
	"abascanth": "T20.EquipmentEnchantmentTooltipAbascanth",
	"blessed": "T20.EquipmentEnchantmentTooltipBlessed",
	"acrobatic": "T20.EquipmentEnchantmentTooltipAcrobatic",
	"winged": "T20.EquipmentEnchantmentTooltipWinged",
	"frightful": "T20.EquipmentEnchantmentTooltipFrightful",
	"caustic": "T20.EquipmentEnchantmentTooltipCaustic",
	"defending": "T20.EquipmentEnchantmentTooltipDefending",
	"slick": "T20.EquipmentEnchantmentTooltipSlick",
	"ghostly": "T20.EquipmentEnchantmentTooltipGhostly",
	"ortification": "T20.EquipmentEnchantmenFTooltiportification",
	"frost": "T20.EquipmentEnchantmentTooltipFrost",
	"guardian": "T20.EquipmentEnchantmentTooltipGuardian",
	"hypnotic": "T20.EquipmentEnchantmentTooltipHypnotic",
	"illusory": "T20.EquipmentEnchantmentTooltipIllusory",
	"incandescent": "T20.EquipmentEnchantmentTooltipIncandescent",
	"invulnerable": "T20.EquipmentEnchantmentTooltipInvulnerable",
	"opaque": "T20.EquipmentEnchantmentTooltipOpaque",
	"protector": "T20.EquipmentEnchantmentTooltipProtector",
	"reflecting": "T20.EquipmentEnchantmentTooltipReflecting",
	"lightning": "T20.EquipmentEnchantmentTooltipLightning",
	"blinding": "T20.EquipmentEnchantmentTooltipBlinding",
	"shadow": "T20.EquipmentEnchantmentTooltipShadow",
	"zealous": "T20.EquipmentEnchantmentTooltipZealous",
}
preLocalize("armorEnchantments");
preLocalize("armorEnchantmentsTooltips");

T20.shieldEnchantments = {
	"animateed": "T20.EquipmentEnchantmentAnimateed",
	"bashing": "T20.EquipmentEnchantmentBashing",
}
T20.shieldEnchantmentsTooltips = {
	"animateed": "T20.EquipmentEnchantmentTooltipAnimateed",
	"bashing": "T20.EquipmentEnchantmentTooltipBashing",
}
for ( let [k, v] of Object.entries(T20.armorEnchantments) ) {
	T20.shieldEnchantments[k] = T20.armorEnchantments[k];
	T20.shieldEnchantmentsTooltips[k] = T20.armorEnchantmentsTooltips[k];
}
preLocalize("shieldEnchantments");
preLocalize("shieldEnchantmentsTooltips");


T20.passosDano = ['1','1d2','1d3','1d4','1d6','1d8','1d10','1d12','3d6','4d6','4d8','4d10','4d12'];

T20.passosDano = [
	['1','1d2','1d3','1d4','1d6','1d8', '1d10','1d12','3d6','4d6', '4d8', '4d10','4d12'],
	['1','1d2','1d3','1d4','1d6','1d8','1d10','2d6', '2d8', '3d8','4d8', '4d10','4d12'],
	['1','1d2','1d3','1d4','1d6','1d8', '1d10','2d6', '2d8','2d10','3d10','4d10','4d12']
];
/* -------------------------------------------- */



// NPC STATS
T20.tableSize = {
	size: ["min","peq","med","gra","eno","col"],
	grid: [1.5,1.5,1.5,3,4.5,9],
	stealth: [5,2,0,-2,-5,-10],
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
	"special": {good:[], bad:[]},
	"lackey": {good:['attack','damage'], bad:['hp']},
	"boss": {good:['hp'], bad:[]},
}

T20.NDparams = {
	labels: ['','T20.AbbreviationCR','T20.Attack', 'T20.Damage','T20.Defense','T20.HP','T20.Skills','T20.NPCB_SaveGood','T20.NPCB_SaveNormal','T20.NPCB_SaveBad','T20.AbbreviationDC'],
  pat: ['i','i','i','i','i','i','v','v','v','v','v','v','c','c','c','c','c','c','l','l','l','l'],
  cr: ['1/4','1/2','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],
	attack: [7,7,9,11,13,15,18,20,22,24,26,29,32,35,37,40,42,45,47,50,52,55],
	attackqty: [1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4],
	damage: ['1d6+3','1d6+3','1d8+6','1d10+10','1d12+12','2d6+14','1d12+11','2d6+15','2d8+19','2d10+20','2d12+21','3d6+26','3d8+24','3d10+26','3d12+28','4d6+38','4d8+40','4d10+42','4d12+35','4d12+40','4d12+45','4d12+50'],
	defense: [15,15,16,18,21,24,28,31,34,37,40,43,46,48,50,52,54,56,59,61,63,65],
	hp: [10,10,20,40,70,110,150,190,230,270,310,350,400,450,550,600,650,700,750,800,850,900],
	topskill: [4,4,6,8,10,12,14,16,18,20,22,24,25,26,27,28,29,30,32,33,34,35],
	botskill: [0,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
	topsave: [3,6,11,13,15,16,16,18,20,21,21,22,29,30,30,31,31,32,32,33,33,34],
	midsave: [0,3,5,7,9,10,10,12,14,15,15,16,23,24,24,25,25,26,26,27,27,28],
	botsave: [-2,-1,0,2,4,5,5,7,9,10,10,11,18,19,19,20,20,21,21,22,22,23],
	dc: [14,14,15,16,17,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50],
}


T20.NPCParams = ( cr ) => {
	let idx = T20.NDparams.cr.indexOf(cr.toString());
	
	if ( idx < 0 ){
		// ui.notifications.warn(game.i18n.format("T20.CRInvalid", {cr: cr}));
		// console.warn(game.i18n.format("T20.CRInvalid", {cr: cr}));
		idx = 0;
	}
	
	let param = Object.entries(T20.NDparams).reduce(( acc, p )=>{
		acc[p[0]] = p[1][idx];
		return acc;
	},{});
	return param;
}

T20.CHALLENGELEVEL = CHALLENGELEVEL;
T20.AMEACAS = AMEACATYPES;

T20.FoeParams = ( type, cr ) => {
	let params = T20.AMEACAS[type]?.[cr] ?? T20.AMEACAS['solo']['1'];
	return params;
}