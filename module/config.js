// Namespace SFRPG Configuration Values
export const T20Config = {};

T20Config.statusEffectIcons = [
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
    { "id": "em-chamas", "label": "Em Chamas", "icon": "systems/tormenta20/icons/conditions/em-chamas.svg" },
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
    { "id": "surdo", "label": "Surdo", "icon": "systems/tormenta20/icons/conditions/surdo.svg" },
    { "id": "surpreendido", "label": "Surpreendido", "icon": "systems/tormenta20/icons/conditions/surpreendido.svg" },
    { "id": "vulneravel", "label": "Vulnerável", "icon": "systems/tormenta20/icons/conditions/vulneravel.svg" }
];

T20Config.conditions = {
    "abalado": {
        "modifiers": [ { "modificadores.pericias.penalidade" : 2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Abalado</strong><br><br>O personagem sofre –2 em testes de perícia. Se ficar abalado novamente, em vez disso fica apavorado. <i>Condição de medo.</i>",
        "durationType": "cena"
    },
    "agarrado": {
        "modifiers": [ { "modificadores.ataques.penalidade" : 2 }],
        "childrenConditions": ["desprevenido", "imovel"],
        "tooltip": "<strong>Agarrado</strong><br><br>O personagem fica desprevenido e imóvel, sofre –2 em testes de ataque e só pode atacar com armas leves. Um personagem fazendo um ataque à distância contra um alvo envolvido na manobra agarrar tem 50% de chance de acertar o alvo errado. <i>Condição de paralisia.</i>",
        "durationType": "cena"
    },
    "alquebrado": {
        "modifiers": [ { "modificadores.custosPM.bonus" : +1 }],
        "childrenConditions": [],
        "tooltip": "<strong>Alquebrado</strong><br><br> O custo em pontos de mana das habilidades e magias do personagem aumenta em +1. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "apavorado": {
        "modifiers": [ { "modificadores.pericias.penalidade" : 5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Apavorado</strong><br><br>O personagem sofre –5 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível. Se não puder, poderá agir, mas não poderá se aproximar voluntariamente da fonte do medo. <i>Condição de medo.</i>",
        "durationType": "cena"
    },
    "atordoado": {
        "modifiers": [],
        "childrenConditions": ["desprevenido"],
        "tooltip": "<strong>Atordoado</strong><br><br> O personagem fica desprevenido e não pode fazer ações. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "caido": {
        "modifiers": [ { "modificadores.ataques.penalidade" : 5, "deslocamento.subst": 1.5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Caído</strong><br><br> Deitado no chão. O personagem sofre –5 em ataques corpo a corpo e seu deslocamento é reduzido a 1,5m. Além disso, sofre –5 de Defesa contra ataques corpo a corpo, mas recebe +5 de Defesa contra ataques à distância.",
        "durationType": "cena"
    },
    "cego": {
        "modifiers": [ { "atributos.for.penalidade": 5, "atributos.des.penalidade": 5 }],
        "childrenConditions": ["desprevenido", "lento"],
        "tooltip": "<strong>Cego</strong><br><br> O personagem fica desprevenido e lento, não pode fazer testes de Percepção para observar e sofre –5 em testes de perícias baseadas em Força ou Destreza. Todos os alvos de seus ataques recebem camuflagem total. <i>Condição de sentidos.</i>",
        "durationType": "cena"
    },
    "confuso": {
        "modifiers": [ ],
        "childrenConditions": [],
        "tooltip": "<strong>Confuso</strong><br><br> O personagem comporta-se de modo aleatório. Role 1d6 no início de seus turnos: 1) Movimenta-se em uma direção escolhida por uma rolagem de 1d8; 2-3) Não pode fazer ações, exceto reações, e fica balbuciando incoerentemente; 4-5) Usa a arma que estiver empunhando para atacar a criatura mais próxima, ou a si mesmo se estiver sozinho (nesse caso, apenas role o dano); 6) A condição termina e pode agir normalmente. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "debilitado": {
        "modifiers": [ { "atributos.for.penalidade": 5, "atributos.des.penalidade": 5, "atributos.con.penalidade": 5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Debilitado</strong><br><br> O personagem sofre –5 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se o personagem ficar debilitado novamente, em vez disso fica inconsciente.",
        "durationType": "cena"
    },
    "desprevenido": {
        "modifiers": [ { "defesa.penalidade" : 5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Desprevenido</strong><br><br> Despreparado para reagir. O personagem sofre –5 na Defesa e em Reflexos. Você fica desprevenido contra inimigos que não possa ver.",
        "durationType": "cena"
    },
    "doente": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Doente</strong><br><br> Sob efeito de uma doença.",
        "durationType": "special"
    },
    "em-chamas": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Em Chamas</strong><br><br> O personagem está pegando fogo. No início de seus turnos, sofre 1d6 pontos de dano de fogo. O personagem pode gastar uma ação padrão para apagar o fogo com as mãos. Imersão em água também apaga as chamas.",
        "durationType": "cena"
    },
    "enjoado": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Enjoado</strong><br><br> O personagem só pode realizar uma ação padrão ou de movimento (não ambas) por rodada. Ele pode gastar uma ação padrão para fazer uma investida, mas pode avançar no máximo seu deslocamento (e não o dobro).",
        "durationType": "cena"
    },
    "enredado": {
        "modifiers": [ { "modificadores.ataques.penalidade" : 2 }],
        "childrenConditions": ["lento", "vulneravel"],
        "tooltip": "<strong>Enredado</strong><br><br> O personagem fica lento, vulnerável e sofre –2 em testes de ataque. <i>Condição de paralisia.</i>",
        "durationType": "cena"
    },
    "envenenado": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Envenenado</strong><br><br> O efeito desta condição varia de acordo com o veneno. Pode ser outra condição (por exemplo, fraco ou enjoado) ou dano recorrente (por exemplo, 1d12 pontos de dano por rodada). A descrição do veneno determina a duração dele (caso nada seja dito, a condição dura pela cena).",
        "durationType": "cena"
    },
    "esmorecido": {
        "modifiers": [ { "atributos.int.penalidade": 5, "atributos.sab.penalidade": 5, "atributos.car.penalidade": 5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Esmorecido</strong><br><br> O personagem sofre –5 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "exausto": {
        "modifiers": [],
        "childrenConditions": ["debilitado", "lento", "vulneravel"],
        "tooltip": "<strong>Exausto</strong><br><br> O personagem fica debilitado, lento e vulnerável. Se ficar exausto novamente, em vez disso fica inconsciente. <i>Condição de fadiga.</i>",
        "durationType": "cena"
    },
    "fascinado": {
        "modifiers": [ {"pericias.per.penalidade" : 5}],
        "childrenConditions": [],
        "tooltip": "<strong>Fascinado</strong><br><br> Com a atenção presa em alguma coisa. O personagem sofre –5 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou. Qualquer ação hostil contra o personagem anula esta condição. Balançar uma criatura fascinada para tirá-la desse estado gasta uma ação padrão. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "fatigado": {
        "modifiers": [],
        "childrenConditions": ["fraco","vulneravel"],
        "tooltip": "<strong>Fatigado</strong><br><br> O personagem fica fraco e vulnerável. Se o personagem ficar fatigado novamente, em vez disso fica exausto. <i>Condição de fadiga.</i>",
        "durationType": "cena"
    },
    "fraco": {
        "modifiers": [ { "atributos.for.penalidade": 2, "atributos.des.penalidade": 2, "atributos.con.penalidade": 2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Fraco</strong><br><br>  O personagem sofre –2 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se ficar fraco novamente, em vez disso fica debilitado.",
        "durationType": "cena"
    },
    "frustrado": {
        "modifiers": [ { "atributos.int.penalidade": 2, "atributos.sab.penalidade": 2, "atributos.car.penalidade": 2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Frustrado</strong><br><br> O personagem sofre –2 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos. Se ficar frustrado novamente, em vez disso fica esmorecido. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "imovel": {
        "modifiers": [ { "deslocamento.cond" : "zerado" }],
        "childrenConditions": [],
        "tooltip": "<strong>Imóvel</strong><br><br> Todas as formas de deslocamento do personagem são reduzidas a 0m. <i>Condição de paralisia.</i>",
        "durationType": "cena"
    },
    "inconsciente": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Inconsciente</strong><br><br> O personagem fica indefeso e não pode fazer ações. Balançar uma criatura para acordá-la gasta uma ação padrão.",
        "durationType": "cena"
    },
    "indefeso": {
        "modifiers": [ { "defesa.penalidade" : 10, "pericias.ref.penalidade": 99 }],
        "childrenConditions": ["desprevenido"],
        "tooltip": "<strong>Indefeso</strong><br><br> O personagem é considerado desprevenido, mas sofre –10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.",
        "durationType": "cena"
    },
    "lento": {
        "modifiers": [ { "deslocamento.cond" : "metade" }],
        "childrenConditions": [],
        "tooltip": "<strong>Lento</strong><br><br> Todas as formas de deslocamento do personagem são reduzidas à metade (arredonde para baixo para o primeiro incremento de 1,5m) e ele não pode correr ou fazer investidas. <i>Condição de paralisia.</i>",
        "durationType": "cena"
    },
    "morto": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Morto</strong><br><br> O personagem está morto!",
        "durationType": "special"
    },
    "ofuscado": {
        "modifiers": [ { "modificadores.ataques.penalidade" : 2, "pericias.per.penalidade": 2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Ofuscado</strong><br><br> O personagem sofre –2 em testes de ataque e de Percepção. <i>Condição de sentidos.</i>",
        "durationType": "cena"
    },
    "paralisado": {
        "modifiers": [],
        "childrenConditions": ["imovel","indefeso"],
        "tooltip": "<strong>Paralisado</strong><br><br> O personagem fica imóvel e indefeso e só pode realizar ações puramente mentais. <i>Condição de paralisia.</i>",
        "durationType": "cena"
    },
    "pasmo": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Pasmo</strong><br><br> O personagem não pode fazer ações, exceto reações. <i>Condição mental.</i>",
        "durationType": "cena"
    },
    "petrificado": {
        "modifiers": [ { "rd.bonus" : 8 }],
        "childrenConditions": ["inconsciente"],
        "tooltip": "<strong>Petrificado</strong><br><br> O personagem fica inconsciente e recebe resistência a dano 8.",
        "durationType": "cena"
    },
    "sangrando": {
        "modifiers": [],
        "childrenConditions": [],
        "tooltip": "<strong>Sangrando</strong><br><br> Com um ferimento aberto. No início de seus turnos, o personagem deve fazer um teste de Constituição (CD 15). Se passar, estabiliza e remove essa condição. Se falhar, sofre 1d6 pontos de dano e continua sangrando.",
        "durationType": "cena"
    },
    "surdo": {
        "modifiers": [ { "pericias.ini.penalidade": 5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Surdo</strong><br><br> O personagem não pode fazer testes de Percepção para ouvir e sofre –5 em testes de Iniciativa. Além disso, é considerado em condição ruim para lançar magias. <i>Condição de sentidos.</i>",
        "durationType": "cena"
    },
    "surpreendido": {
        "modifiers": [],
        "childrenConditions": ["desprevenido"],
        "tooltip": "<strong>Surpreendido</strong><br><br> Não ciente de seus inimigos. O personagem fica desprevenido e não pode fazer ações, exceto reações.",
        "durationType": "cena"
    },
    "vulneravel": {
        "modifiers": [ { "defesa.penalidade" : 2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Vulnerável</strong><br><br> O personagem sofre –2 na Defesa.",
        "durationType": "cena"
    }
}

/**
 * Define the set of types which a weapon item can take
 * @type {Object}
 */
T20Config.weaponTypes = {
  "simples": "Simples",
  "marcial": "Marcial",
  "exotica": "Exótica",
  "armaDeFogo": "Arma de Fogo",
  "natural": "Natural",
  "improvisada": "Improvisada"
};

/**
 * Define the set of weapon property flags which can exist on a weapon
 * @type {Object}
 */
T20Config.weaponProperties = {
  "adaptavel": "Adaptável",
  "agil": "Ágil",
  "alongada": "Alongada",
  "arremesso": "Arremesso",
  "ataqueDistancia": "Ataque à Distância",
  "duasMaos": "Duas Mãos",
  "dupla": "Dupla",
  "leve": "Leve",
  "municao": "Munição",
  "versatil": "Versátil"
};

T20Config.encantosArmas = { //Não Implementado
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
}
