// Namespace SFRPG Configuration Values
export const T20 = {};

T20.statusEffectIcons = [
    { "id": "abalado", "label": "Abalado", "icon": "systems/tormenta20/icons/conditions/abalado.svg" },
    { "id": "agarrado", "label": "Agarrado", "icon": "systems/tormenta20/icons/conditions/agarrado.svg" },
    { "id": "alquebrado", "label": "Alquebrado", "icon": "systems/tormenta20/icons/conditions/alquebrado.svg" },
    { "id": "apavorado", "label": "Apavorado", "icon": "systems/tormenta20/icons/conditions/apavorado.svg" },
    { "id": "atordoado", "label": "Atordoado", "icon": "systems/tormenta20/icons/conditions/atordoado.svg" },
    { "id": "caido", "label": "Caído", "icon": "systems/tormenta20/icons/conditions/caido.svg" },
    { "id": "cego", "label": "Cego", "icon": "systems/tormenta20/icons/conditions/cego.svg" },
    { "id": "confuso", "label": "Confuso", "icon": "systems/tormenta20/icons/conditions/confuso.svg" },
    { "id": "debilitado", "label": "Debilitado", "icon": "systems/tormenta20/icons/conditions/debilitado.svg" },
    { "id": "desprevenido", "label": "Desprevenido", "icon": "systems/tormenta20/icons/conditions/desprevenido.svg" },
    { "id": "doente", "label": "Doente", "icon": "systems/tormenta20/icons/conditions/doente.svg" },
    { "id": "emchamas", "label": "Em Chamas", "icon": "systems/tormenta20/icons/conditions/em-chamas.svg" },
    { "id": "enjoado", "label": "Enjoado", "icon": "systems/tormenta20/icons/conditions/enjoado.svg" },
    { "id": "enredado", "label": "Enredado", "icon": "systems/tormenta20/icons/conditions/enredado.svg" },
    { "id": "envenenado", "label": "Envenenado", "icon": "systems/tormenta20/icons/conditions/envenenado.svg" },
    { "id": "esmorecido", "label": "Esmorecido", "icon": "systems/tormenta20/icons/conditions/esmorecido.svg" },
    { "id": "exausto", "label": "Exausto", "icon": "systems/tormenta20/icons/conditions/exausto.svg" },
    { "id": "fascinado", "label": "Fascinado", "icon": "systems/tormenta20/icons/conditions/fascinado.svg" },
    { "id": "fatigado", "label": "Fatigado", "icon": "systems/tormenta20/icons/conditions/fatigado.svg" },
    { "id": "fraco", "label": "Fraco", "icon": "systems/tormenta20/icons/conditions/fraco.svg" },
    { "id": "frustrado", "label": "Frustrado", "icon": "systems/tormenta20/icons/conditions/frustrado.svg" },
    { "id": "imovel", "label": "Imóvel", "icon": "systems/tormenta20/icons/conditions/imovel.svg" },
    { "id": "inconsciente", "label": "Inconsciente", "icon": "systems/tormenta20/icons/conditions/inconsciente.svg" },
    { "id": "indefeso", "label": "Indefeso", "icon": "systems/tormenta20/icons/conditions/indefeso.svg" },
    { "id": "lento", "label": "Lento", "icon": "systems/tormenta20/icons/conditions/lento.svg" },
    { "id": "morto", "label": "Morto", "icon": "systems/tormenta20/icons/conditions/morto.svg" },
    { "id": "ofuscado", "label": "Ofuscado", "icon": "systems/tormenta20/icons/conditions/ofuscado.svg" },
    { "id": "paralisado", "label": "Paralisado", "icon": "systems/tormenta20/icons/conditions/paralisado.svg" },
    { "id": "pasmo", "label": "Pasmo", "icon": "systems/tormenta20/icons/conditions/pasmo.svg" },
    { "id": "petrificado", "label": "Petrificado", "icon": "systems/tormenta20/icons/conditions/petrificado.svg" },
    { "id": "sangrando", "label": "Sangrando", "icon": "systems/tormenta20/icons/conditions/sangrando.svg" },
    { "id": "sobrecarregado", "label": "Sobrecarregado", "icon": "systems/tormenta20/icons/conditions/sobrecarregado.svg" },
    { "id": "surdo", "label": "Surdo", "icon": "systems/tormenta20/icons/conditions/surdo.svg" },
    { "id": "surpreendido", "label": "Surpreendido", "icon": "systems/tormenta20/icons/conditions/surpreendido.svg" },
    { "id": "vulneravel", "label": "Vulnerável", "icon": "systems/tormenta20/icons/conditions/vulneravel.svg" }
];

T20.conditions = {
    "abalado": {
        "tooltip": "<strong>Abalado</strong><br><br>O personagem sofre –2 em testes de perícia. Se ficar abalado novamente, em vez disso fica apavorado. <i>Condição de medo.</i>"
    },
    "agarrado": {
        "tooltip": "<strong>Agarrado</strong><br><br>O personagem fica desprevenido e imóvel, sofre –2 em testes de ataque e só pode atacar com armas leves. Um personagem fazendo um ataque à distância contra um alvo envolvido na manobra agarrar tem 50% de chance de acertar o alvo errado. <i>Condição de paralisia.</i>"
    },
    "alquebrado": {
        "tooltip": "<strong>Alquebrado</strong><br><br> O custo em pontos de mana das habilidades e magias do personagem aumenta em +1. <i>Condição mental.</i>"
    },
    "apavorado": {
        "tooltip": "<strong>Apavorado</strong><br><br>O personagem sofre –5 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível. Se não puder, poderá agir, mas não poderá se aproximar voluntariamente da fonte do medo. <i>Condição de medo.</i>"
    },
    "atordoado": {
        "tooltip": "<strong>Atordoado</strong><br><br> O personagem fica desprevenido e não pode fazer ações. <i>Condição mental.</i>"
    },
    "caido": {
        "tooltip": "<strong>Caído</strong><br><br> Deitado no chão. O personagem sofre –5 em ataques corpo a corpo e seu deslocamento é reduzido a 1,5m. Além disso, sofre –5 de Defesa contra ataques corpo a corpo, mas recebe +5 de Defesa contra ataques à distância."
    },
    "cego": {
        "tooltip": "<strong>Cego</strong><br><br> O personagem fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre –5 em testes de perícias baseadas em Força ou Destreza. Todos os alvos de seus ataques recebem camuflagem total. <i>Condição de sentidos.</i>"
    },
    "confuso": {
        "tooltip": "<strong>Confuso</strong><br><br> O personagem comporta-se de modo aleatório. Role 1d6 no início de seus turnos: 1) Movimenta-se em uma direção escolhida por uma rolagem de 1d8; 2-3) Não pode fazer ações, exceto reações, e fica balbuciando incoerentemente; 4-5) Usa a arma que estiver empunhando para atacar a criatura mais próxima, ou a si mesmo se estiver sozinho (nesse caso, apenas role o dano); 6) A condição termina e pode agir normalmente. <i>Condição mental.</i>"
    },
    "debilitado": {
        "tooltip": "<strong>Debilitado</strong><br><br> O personagem sofre –5 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se o personagem ficar debilitado novamente, em vez disso fica inconsciente."
    },
    "desprevenido": {
        "tooltip": "<strong>Desprevenido</strong><br><br> Despreparado para reagir. O personagem sofre –5 na Defesa e em Reflexos. Você fica desprevenido contra inimigos que não possa ver."
    },
    "doente": {
        "tooltip": "<strong>Doente</strong><br><br> Sob efeito de uma doença."
    },
    "em-chamas": {
        "tooltip": "<strong>Em Chamas</strong><br><br> O personagem está pegando fogo. No início de seus turnos, sofre 1d6 pontos de dano de fogo. O personagem pode gastar uma ação padrão para apagar o fogo com as mãos. Imersão em água também apaga as chamas."
    },
    "enjoado": {
        "tooltip": "<strong>Enjoado</strong><br><br> O personagem só pode realizar uma ação padrão ou de movimento (não ambas) por rodada. Ele pode gastar uma ação padrão para fazer uma investida, mas pode avançar no máximo seu deslocamento (e não o dobro)."
    },
    "enredado": {
        "tooltip": "<strong>Enredado</strong><br><br> O personagem fica lento, vulnerável e sofre –2 em testes de ataque. <i>Condição de paralisia.</i>"
    },
    "envenenado": {
        "tooltip": "<strong>Envenenado</strong><br><br> O efeito desta condição varia de acordo com o veneno. Pode ser outra condição (por exemplo, fraco ou enjoado) ou dano recorrente (por exemplo, 1d12 pontos de dano por rodada). A descrição do veneno determina a duração dele (caso nada seja dito, a condição dura pela cena)."
    },
    "esmorecido": {
        "tooltip": "<strong>Esmorecido</strong><br><br> O personagem sofre –5 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos. <i>Condição mental.</i>"
    },
    "exausto": {
        "modifiers": [],
        "childrenConditions": ["debilitado", "lento", "vulneravel"],
        "tooltip": "<strong>Exausto</strong><br><br> O personagem fica debilitado, lento e vulnerável. Se ficar exausto novamente, em vez disso fica inconsciente. <i>Condição de fadiga.</i>",
        "durationType": "cena"
    },
    "fascinado": {
        "tooltip": "<strong>Fascinado</strong><br><br> Com a atenção presa em alguma coisa. O personagem sofre –5 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou. Qualquer ação hostil contra o personagem anula esta condição. Balançar uma criatura fascinada para tirá-la desse estado gasta uma ação padrão. <i>Condição mental.</i>"
    },
    "fatigado": {
        "tooltip": "<strong>Fatigado</strong><br><br> O personagem fica fraco e vulnerável. Se o personagem ficar fatigado novamente, em vez disso fica exausto. <i>Condição de fadiga.</i>"
    },
    "fraco": {
        "tooltip": "<strong>Fraco</strong><br><br>  O personagem sofre –2 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se ficar fraco novamente, em vez disso fica debilitado."
    },
    "frustrado": {
        "tooltip": "<strong>Frustrado</strong><br><br> O personagem sofre –2 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos. Se ficar frustrado novamente, em vez disso fica esmorecido. <i>Condição mental.</i>"
    },
    "imovel": {
        "tooltip": "<strong>Imóvel</strong><br><br> Todas as formas de deslocamento do personagem são reduzidas a 0m. <i>Condição de paralisia.</i>"
    },
    "inconsciente": {
        "tooltip": "<strong>Inconsciente</strong><br><br> O personagem fica indefeso e não pode fazer ações. Balançar uma criatura para acordá-la gasta uma ação padrão."
    },
    "indefeso": {
        "tooltip": "<strong>Indefeso</strong><br><br> O personagem é considerado desprevenido, mas sofre –10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia."
    },
    "lento": {
        "tooltip": "<strong>Lento</strong><br><br> Todas as formas de deslocamento do personagem são reduzidas à metade (arredonde para baixo para o primeiro incremento de 1,5m) e ele não pode correr ou fazer investidas. <i>Condição de paralisia.</i>"
    },
    "morto": {
        "tooltip": "<strong>Morto</strong><br><br> O personagem está morto!"
    },
    "ofuscado": {
        "tooltip": "<strong>Ofuscado</strong><br><br> O personagem sofre –2 em testes de ataque e de Percepção. <i>Condição de sentidos.</i>"
    },
    "paralisado": {
        "tooltip": "<strong>Paralisado</strong><br><br> O personagem fica imóvel e indefeso e só pode realizar ações puramente mentais. <i>Condição de paralisia.</i>"
    },
    "pasmo": {
        "tooltip": "<strong>Pasmo</strong><br><br> O personagem não pode fazer ações, exceto reações. <i>Condição mental.</i>"
    },
    "petrificado": {
        "tooltip": "<strong>Petrificado</strong><br><br> O personagem fica inconsciente e recebe resistência a dano 8."
    },
    "sangrando": {
        "tooltip": "<strong>Sangrando</strong><br><br> Com um ferimento aberto. No início de seus turnos, o personagem deve fazer um teste de Constituição (CD 15). Se passar, estabiliza e remove essa condição. Se falhar, sofre 1d6 pontos de dano e continua sangrando."
    },
    "surdo": {
        "tooltip": "<strong>Surdo</strong><br><br> O personagem não pode fazer testes de Percepção para ouvir e sofre –5 em testes de Iniciativa. Além disso, é considerado em condição ruim para lançar magias. <i>Condição de sentidos.</i>"
    },
    "surpreendido": {
        "tooltip": "<strong>Surpreendido</strong><br><br> Não ciente de seus inimigos. O personagem fica desprevenido e não pode fazer ações, exceto reações."
    },
    "vulneravel": {
        "tooltip": "<strong>Vulnerável</strong><br><br> O personagem sofre –2 na Defesa."
    },
    "sobrecarregado": {
        "tooltip": "<strong>Sobrecarregado</strong><br><br> O personagem sobre -2 de penalidade de armadura e tem seu deslocamento reduzido em 3m."
    }
}

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
    "und": "Morto-Vivo"
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
  "ata": "Ataque à Distância",
  "dua": "Duas Mãos",
  "dup": "Dupla",
  "lev": "Leve",
  "mun": "Munição",
  "ver": "Versátil"
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


T20.characterFlags ={
    
}