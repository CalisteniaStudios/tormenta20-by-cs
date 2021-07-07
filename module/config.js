import { T20Conditions } from "./conditions/conditions.js";
export const T20 = {};

T20.statusEffectIcons = Object.values(T20Conditions);

T20.conditionTypes = T20.statusEffectIcons.reduce(function(o, s) { o[s.id] = s.label; return o;}, {});

T20.atributos = {
	"for": "T20.AbilityStr",
	"des": "T20.AbilityDex",
	"con": "T20.AbilityCon",
	"int": "T20.AbilityInt",
	"sab": "T20.AbilityWis",
	"car": "T20.AbilityCha"
};

T20.atributosAbr = {
	"for": "For",
	"des": "Des",
	"con": "Con",
	"int": "Int",
	"sab": "Sab",
	"car": "Car"
};

/* ------------------ Classes ----------------- */

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

/* -------------------------------------------- */

// Spell Schools
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
/**
 * The set of possible sensory perception types which an Actor may have
 * @enum {string}
 */
  T20.senses = {
    "penumbra": "Visão na Penumbra",
    "escuro": "Visão no Escuro",
    // "verdadeira": "Visão Verdadeira",
    "cegas": "Percepção as Cegas",
    "faro": "Faro"
  };

  

/* -------------------------------------------- */


// Damage Types
T20.damageTypes = {
  "acido": "Ácido",
  "corte": "Corte",
  "eletricidade": "Eletricidade",
  "essencia": "Essência",
  "fogo": "Fogo",
  "frio": "Frio",
  "impacto": "Impacto",
  "luz": "Luz",
  "mental": "Mental",
  "perfuracao": "Perfuração",
  "trevas": "Trevas",
  "veneno": "Veneno"
};

T20.healingTypes = {
  "curapv": "Cura",
  "curatpv": "PV Temporário",
  "curapm": "Recuperação de Mana",
  "curatpm": "PM Temporário"
}

T20.customTypes = {
  "spl": ""
}

// Damage Resistance Types
T20.damageResistanceTypes = mergeObject(foundry.utils.deepClone(T20.damageTypes), {
"fisico": "Físico"
});
  
/* ------------------ Perícias ---------------- */

T20.pericias = {
    "acro": "Acrobacia",
    "ades": "Adestramento",
    "atle": "Atletismo",
    "atua": "Atuação",
    "cava": "Cavalgar",
    "conh": "Conhecimento",
    "cura": "Cura",
    "defe": "Defesa",
    "dipl": "Diplomacia",
    "enga": "Enganação",
    "fort": "Fortitude",
    "furt": "Furtividade",
    "guer": "Guerra",
    "inic": "Iniciativa",
    "inti": "Intimidação",
    "intu": "Intuição",
    "inve": "Investigação",
    "joga": "Jogatina",
    "ladi": "Ladinagem",
    "luta": "Luta",
    "mist": "Misticismo",
    "ocul": "Ocultismo",
    "nobr": "Nobreza",
    "ofic": "Ofício",
    "perc": "Percepção",
    "pilo": "Pilotagem",
    "pont": "Pontaria",
    "refl": "Reflexos",
    "reli": "Religião",
    "sobr": "Sobrevivência",
    "vont": "Vontade"
};

T20.resistencias = {
	"fort": "Fortitude",
	"refl": "Reflexos",
	"vont": "Vontade"
}

/* ------------------- Níveis ----------------- */

T20.xpPorNivel = [
  0, 1000, 3000, 6000, 10000, 15000, 21000, 28000, 36000, 45000, 55000, 66000, 78000, 91000, 105000, 120000, 136000, 153000, 171000, 190000, 
];

/* ---------------- Proficiências ------------- */

T20.actorSizes = {
    "min": "Minúsculo",
    "peq": "Pequeno",
    "med": "Médio",
    "gra": "Grande",
    "eno": "Enorme",
    "col": "Colossal"
};

T20.tokenSizes = {
    "min": 1,
    "peq": 1,
    "med": 1,
    "gra": 2,
    "eno": 3,
    "col": 4
};

/**
 * Colors used to visualize temporary and temporary maximum HP in token health bars
 * @enum {number}
 */
T20.tokenHPColors = {
    temp: 0xFF0000,
    tempmax: 0x440066,
    negmax: 0x550000
}

T20.creatureTypes = {
    "hum": "Humanóide",
    "mon": "Monstro",
    "ani": "Animal",
    "con": "Construto",
    "esp": "Espírito",
    "mor": "Morto-Vivo"
}

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
  "sim": "Armas Simples",
  "mar": "Armas Marciais",
  "exo": "Armas Exóticas",
  "fog": "Armas de Fogo"
};

/**
 * The set of Armor Proficiencies which a character may have
 * @type {Object}
 */
T20.profArmaduras = {
  "lev": "Armaduras Leves",
  "pes": "Armaduras Pesadas",
  "esc": "Escudos"
};

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


/* -------------------------------------------- */

T20.abilityConsumptionTypes = {
  "ammo": "T20.ConsumeAmmunition",
  "attribute": "T20.ConsumeAttribute",
  "material": "T20.ConsumeMaterial"
};

/* -------------------------------------------- */

/**
 * The valid units of measure for movement distances in the game system.
 * By default this uses the imperial units of feet and miles.
 * @type {Object<string,string>}
 */
 T20.movementTypes = {
    "burrow": "Escavar",
    "climb": "Escalada",
    "fly": "Voo",
    "swim": "Natação",
    "walk": "Deslocamento",
  };
  
  /**
   * The valid units of measure for movement distances in the game system.
   * By default this uses the imperial units of feet and miles.
   * @type {Object<string,string>}
   */
   T20.movementUnits = {
    "m": "Metros",
    "km": "Kilômetros"
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

/*---------------------------------------------*/

T20.spellType = {
    "arc": "T20.SpellArc",
    "div": "T20.SpellDiv",
    "uni": "T20.SpellUni"
}

T20.spellLevels = {
  1: "T20.SpellLevel1",
  2: "T20.SpellLevel2",
  3: "T20.SpellLevel3",
  4: "T20.SpellLevel4",
  5: "T20.SpellLevel5"
};

/*------------------- Itens -------------------*/

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

/*------------------- Armas -------------------*/

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
T20.weaponTypes = {
  "sim": "Simples",
  "mar": "Marcial",
  "exo": "Exótica",
  "fog": "Arma de Fogo",
  "nat": "Natural",
  "imp": "Improvisada"
};

/* -------------------------------------------- */



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

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
T20.weaponProperties = {
  "ada": "Adaptável",
  "agi": "Ágil",
  "alo": "Alongada",
  "arr": "Arremesso",
  "dst": "Ataque à Distância",
  "dms": "Duas Mãos",
  "dup": "Dupla",
  "lev": "Leve",
  "mun": "Munição",
  "ver": "Versátil"
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


T20.characterFlags ={
    
}