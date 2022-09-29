export const T20Conditions = {};

T20Conditions.abalado = {
	type: "T20.StatusTypeFear",
	description: "O personagem sofre -2 em testes de perícia. Se ficar abalado novamente, em vez disso fica @Compendium[tormenta20.condicoes.U1BOZrcRg61GVDoI]{Apavorado}.",
	flavor: "<li>-2 em Perícias</li>"
}
T20Conditions.agarrado = {
	type: "T20.StatusTypeParalyze",
	description: "O personagem fica @Compendium[tormenta20.condicoes.QBpAB16MIn9BVLNw]{Desprevenido} e @Compendium[tormenta20.condicoes.c89adU33GuvjELLp]{Imóvel}, sofre -2 em testes de ataque e só pode atacar com armas leves. Um personagem fazendo um ataque à distância contra um alvo envolvido na manobra agarrar tem 50% de chance de acertar o alvo errado.",
	flavor: "<li>-2 em Ataques</li><li>Só pode usar Arma Leve</li><li>Desprevenido e Imóvel</li>"
}
T20Conditions.alquebrado = {
	type: "",
	description: "O custo em pontos de mana das habilidades e magias do personagem aumenta em +1.",
	flavor: "<li>Habilidades custam +1 PM</li>"
}
T20Conditions.apavorado = {
	type: "T20.StatusTypeFear",
	description: "O personagem sofre -5 em testes de perícia e deve fugir da fonte do medo da maneira mais eficiente possível. Se não puder, poderá agir, mas não poderá se aproximar voluntariamente da fonte do medo.",
	flavor: "<li>-5 em Perícias</li><li>Deve fugir da fonte do medo.</li>"
}
T20Conditions.atordoado = {
	type: "",
	description: "O personagem fica @UUID[JournalEntry.eGLqZ0eR1GQyNXiC.JournalEntryPage.my1HxIcUGVr2Mbii]{Desprevenido} e não pode fazer ações.",
	flavor: "<li>Não pode fazer ações</li><li>Desprevenido</li>"
}
T20Conditions.caido = {
	type: "",
	description: "Deitado no chão. O personagem sofre -5 em ataques corpo a corpo e seu deslocamento é reduzido a 1,5m. Além disso, sofre -5 de Defesa contra ataques corpo a corpo, mas recebe +5 de Defesa contra ataques à distância.",
	flavor: "<li>-5 em Ataques Corpo a Corpos e na Defesa</li><li>Desprevenido</li>"
}
T20Conditions.cego = {
	type: "T20.StatusTypeSenses",
	description: "",
	flavor: "<li>-5 em testes Percepção (visual) e perícias de For ou Des</li><li>Desprevenido e Lento</li><li>Lento: movimento reduzido a metade e não pode correr ou fazer investidas.</li>"
}
T20Conditions.confuso = {
	type: "",
	description: "<li>1) Movimenta-se em uma direção escolhida por uma rolagem de 1d8;</li><li>2-3) Não pode fazer ações, exceto reações, e fica balbuciando incoerentemente;</li><li>4-5) Usa a arma que estiver empunhando para atacar a criatura mais próxima, ou a si mesmo se estiver sozinho (nesse caso, apenas role o dano);</li><li>6) A condição termina e pode agir normalmente.</li>",
	flavor: ""
}
T20Conditions.debilitado = {
	type: "",
	description: "O personagem sofre -5 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se o personagem ficar debilitado novamente, em vez disso fica @Compendium[tormenta20.condicoes.DovEM4vhiVzIKLfF]{Inconsciente}.",
	flavor: ""
}
T20Conditions.desprevenido = {
	type: "",
	description: "Despreparado para reagir. O personagem sofre -5 na Defesa e em Reflexos. Você fica desprevenido contra inimigos que não possa ver.",
	flavor: "<li>-5 em Defesa e Reflexos.</li>"
}
T20Conditions.doente = {
	type: "",
	description: "Sob efeito de uma doença.",
	flavor: ""
}
T20Conditions.emchamas = {
	type: "",
	description: "O personagem está pegando fogo. No início de seus turnos, sofre [[/r 1d6]] pontos de dano de fogo. O personagem pode gastar uma ação padrão para apagar o fogo com as mãos. Imersão em água também apaga as chamas.",
	flavor: ""
}
T20Conditions.enjoado = {
	type: "",
	description: "O personagem só pode realizar uma ação padrão ou de movimento (não ambas) por rodada. Ele ainda pode fazer ações livres ou extras, como o normal. Ele pode gastar uma ação padrão para fazer uma investida, mas pode avançar no máximo seu deslocamento (e não o dobro).",
	flavor: ""
}
T20Conditions.enredado = {
	type: "T20.StatusTypeParalyze",
	description: "<li>Lento: Movimento reduzido a metade e não pode correr ou fazer investidas.</li><li>Vúlnerável: Defesa -2.</li>",
	flavor: ""
}
T20Conditions.envenenado = {
	type: "",
	description: "O efeito desta condição varia de acordo com o veneno. Pode ser outra condição (por exemplo, fraco ou enjoado) ou dano recorrente (por exemplo, 1d12 pontos de dano por rodada). A descrição do veneno determina a duração dele (caso nada seja dito, a condição dura pela cena).",
	flavor: ""
}
T20Conditions.esmorecido = {
	type: "",
	description: "O personagem sofre -5 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos.",
	flavor: ""
}
T20Conditions.exausto = {
	type: "T20.StatusTypeFatigue",
	description: "O personagem fica debilitado, lento e vulnerável. Se ficar exausto novamente, em vez disso fica inconsciente.",
	flavor: "<li>Debilitado: -5 em testes de atributos físicos e de perícias baseadas nestes atributos.</li><li>Lento: Movimento reduzido a metade e não pode correr ou fazer investidas.</li><li>Vulnerável: Sofre Defesa -2.</li>"
}
T20Conditions.fascinado = {
	type: "",
	description: "Com a atenção presa em alguma coisa. O personagem sofre -5 em Percepção e não pode fazer ações, exceto observar aquilo que o fascinou. Qualquer ação hostil contra o personagem anula esta condição. Balançar uma criatura fascinada para tirá-la desse estado gasta uma ação padrão.",
	flavor: ""
}
T20Conditions.fatigado = {
	type: "T20.StatusTypeFatigue",
	description: "O personagem fica fraco e vulnerável. Se ficar fatigado novamente, em vez disso fica exausto.",
	flavor: "<li>Fraco: -2 em testes de perícias e atributos físicos (Força, Destreza e Constituição)</li><li>Vulnerável: -2 na Defesa.</li>"
}
T20Conditions.fraco = {
	type: "",
	description: "O personagem sofre -2 em testes de atributos físicos (Força, Destreza e Constituição) e de perícias baseadas nesses atributos. Se ficar fraco novamente, em vez disso fica @Compendium[tormenta20.condicoes.Cz1LbBckjCtxTtoa]{Debilitado}.",
	flavor: "-2 em testes de perícias e atributos físicos (Força, Destreza e Constituição)"
}
T20Conditions.frustrado = {
	type: "",
	description: "O personagem sofre -2 em testes de atributos mentais (Inteligência, Sabedoria e Carisma) e de perícias baseadas nesses atributos. Se ficar frustrado novamente, em vez disso fica @Compendium[tormenta20.condicoes.DxFMP1b3g7PVX0iB]{Esmorecido}.",
	flavor: ""
}
T20Conditions.imovel = {
	type: "T20.StatusTypeParalyze",
	description: "Todas as formas de deslocamento do personagem são reduzidas a 0m.",
	flavor: ""
}
T20Conditions.inconsciente = {
	type: "",
	description: "<li>Indefeso: É considerado @Compendium[tormenta20.condicoes.QBpAB16MIn9BVLNw]{Desprevenido}, sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.</li>",
	flavor: ""
}
T20Conditions.indefeso = {
	type: "",
	description: "O personagem é considerado @Compendium[tormenta20.condicoes.QBpAB16MIn9BVLNw]{Desprevenido}, mas sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.",
	flavor: ""
}
T20Conditions.lento = {
	type: "T20.StatusTypeParalyze",
	description: "Todas as formas de deslocamento do personagem são reduzidas à metade (arredonde para baixo para o primeiro incremento de 1,5m) e ele não pode correr ou fazer investidas.",
	flavor: "<li>metade do movimento e não pode correr ou fazer investidas.</li>"
}
T20Conditions,morto = {
	type: "",
	description: "",
	flavor: "",
}
T20Conditions.ofuscado = {
	type: "T20.StatusTypeSenses",
	description: "Sofre –2 em testes de ataque e Percepção.",
	flavor: "-2 teste de Ataque e Percepção"
}
T20Conditions.paralisado = {
	type: "T20.StatusTypeParalyze",
	description: "<li>Imóvel: todas as formas de deslocamento são reduzidas a 0m.</li><li>Indefeso: É considerado desprevinido, sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de miseridórdia.</li>",
	flavor: ""
}
T20Conditions.pasmo = {
	type: "",
	description: "O personagem não pode fazer ações, exceto reações.",
	flavor: ""
}
T20Conditions.petrificado = {
	type: "",
	description: "<li>Incosciente: O personagem fica @Compendium[tormenta20.condicoes.lNc0QRNCvTGa7t2P]{Indefeso} e não pode fazer ações.</li><li>Indefeso: É considerado @Compendium[tormenta20.condicoes.QBpAB16MIn9BVLNw]{Desprevenido}, sofre -10 na Defesa, falha automaticamente em testes de Reflexos e pode sofrer golpes de misericórdia.</li>",
	flavor: ""
}
T20Conditions.sangrando = {
	type: "",
	description: "Com um ferimento aberto. No início de seus turnos, o personagem deve fazer um teste de Constituição (CD 15). Se passar, estabiliza e remove essa condição. Se falhar, perde [[/r 1d6]] pontos de vida e continua sangrando.",
	flavor: ""
}
T20Conditions.surdo = {
	type: "T20.StatusTypeSenses",
	description: "O personagem não pode fazer testes de Percepção para ouvir e sofre -5 em testes de Iniciativa. Além disso, é considerado em condição ruim para lançar magias.",
	flavor: ""
}
T20Conditions.surpreendido = {
	type: "",
	description: "<li>Desprevenido: Sofre -5 na Defesa e em Reflexos.</li>",
	flavor: ""
}
T20Conditions.vulneravel = {
	type: "",
	description: "O personagem sofre -2 na Defesa.",
	flavor: ""
}
T20Conditions,sobrecarregado = {
	type: "",
	description: "",
	flavor: "",
}