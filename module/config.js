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
        "modifiers": [ { "modificadores.pericias.penalidade" : -2 }],
        "childrenConditions": [],
        "tooltip": "<strong>Abalado</strong><br><br>O personagem sofre –2 em testes de perícia. Se ficar abalado novamente, em vez disso fica apavorado. <i>Condição de medo.</i>"
    },
    "agarrado": {
        "modifiers": [ { "modificadores.ataques.penalidade" : -2 }],
        "childrenConditions": ["desprevenido", "imovel"],
        "tooltip": "<strong>Agarrado</strong><br><br>O personagem fica desprevenido e imóvel, sofre –2 em testes de ataque e só pode atacar com armas leves. Um personagem fazendo um ataque à distância contra um alvo envolvido na manobra agarrar tem 50% de chance de acertar o alvo errado. <i>Condição de paralisia.</i>"
    },
    "alquebrado": {
        "modifiers": [ { "modificadores.custosPM.bonus" : +1 }],
        "childrenConditions": [],
        "tooltip": "<strong>Alquebrado</strong><br><br> O custo em pontos de mana das habilidades e magias do personagem aumenta em +1. <i>Condição mental.</i>"
    },
    "apavorado": {
        "modifiers": [ { "modificadores.pericias.penalidade" : -5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Apavorado</strong><br><br>O personagem sofre –5 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível. Se não puder, poderá agir, mas não poderá se aproximar voluntariamente da fonte do medo. <i>Condição de medo.</i>"
    },
    "atordoado": {
        "modifiers": [],
        "childrenConditions": ["desprevenido"],
        "tooltip": "<strong>Atordoado</strong><br><br> O personagem fica desprevenido e não pode fazer ações. <i>Condição mental.</i>"
    },
    "desprevenido": {
        "modifiers": [ { "defesa.penalidade" : -5 }],
        "childrenConditions": [],
        "tooltip": "<strong>Desprevenido</strong><br><br>Despreparado para reagir. O personagem sofre –5 na Defesa e em Reflexos. Você fica desprevenido contra inimigos que não possa ver."
    },
    "imovel": {
        "modifiers": [ { "deslocamento.penalidade" : -999 }],
        "childrenConditions": [],
        "tooltip": "<strong>Imóvel</strong><br><br>Todas as formas de deslocamento do personagem são reduzidas a 0m. <i>Condição de paralisia.</i>"
    }   
}