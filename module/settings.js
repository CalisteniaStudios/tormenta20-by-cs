import { Tormenta20ActorSheetSettings, Tormenta20ResourceColorsSettings } from "./apps/form-apps.js";
/*Classe para configurar opções do sistema*/
export const SystemSettings = function() {
	/**
	* Track the system version upon which point a migration was last applied
	*/
	game.settings.register("tormenta20", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});
	
	game.settings.registerMenu('tormenta20', 'sheetSettings', {
		name: "Configurações das Fichas",
		label: "Configurações das Fichas",
		icon: 'fas fa-scroll',
		type: Tormenta20ActorSheetSettings,
		restricted: true
	});
	
	// game.settings.registerMenu('tormenta20', 'resourceSettings', {
	// 	name: "Configurar Recursos",
	// 	label: "Configurar Recursos",
	// 	icon: 'fas bars-progress',
	// 	type: Tormenta20ResourceColorsSettings,
	// 	restricted: true
	// });

	
	/**
	* Option to disable XP bar for session-based or story-based advancement.
	*/
	game.settings.register("tormenta20", "disableExperience", {
		name: "Avanço por Marcos",
		hint: "Os personagens não recebem pontos de experiência. Em vez disso, sobem de nível sempre que alcançam um determinado marco na história.",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
		
	/**
	 * Register languages rule (Homebrew)
	 */
	game.settings.register("tormenta20", "enableLanguages", {
		name: "Idiomas",
		hint: "Adiciona uma lista de idiomas à ficha de Personagens de Jogador. Opção cosmética, sem efeitos adicionais.",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/**
	 * Option to disable sheet journals (TODO REMOVE?)
	 */
	game.settings.register("tormenta20", "disableJournal", {
		name: "Desabilitar Diário",
		hint: "Desabilita a aba Diário das fichas de personagem de jogador.",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/*
	* Register sheet templates
	*/
	game.settings.register("tormenta20", "forceSheetTemplate", {
		name: "Forçar Padrão de Ficha",
		hint: "Sobrepõe a opção de Ficha dos jogadores e utiliza a ficha selecionada pelo Mestre. Alterar esta opção irá recarregar a página.",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});
	
	game.settings.register("tormenta20", "sheetTemplate", {
		name: "Ficha",
		hint: "Opção de layout da ficha, padrão ou com abas",
		scope: game.settings.get("tormenta20", "forceSheetTemplate") ? "world" : "user",
		config: true,
		default: "base",
		type: String,
		choices: {
			"base": "Layout T20 (padrão)",
			"tabbed": "Layout VTT (abas)"
		}
	});

	

	/**
	 * Option to automatic spend mana on ability use
	 */
	game.settings.register("tormenta20", "automaticManaSpend", {
		name: "Gasto de Mana",
		hint: "Ao utilizar um poder ou magia, a mana do personagem é gasta automaticamente",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Register diagonal movement rule setting
	 */
	game.settings.register("tormenta20", "diagonalMovement", {
		name: "Movimento Diagonal",
		hint: "Configura qual regra de movimento diagonal será usada no sistema.",
		scope: "world",
		config: true,
		default: "MANHATTAN",
		type: String,
		choices: {
		"MANHATTAN": "Padrão (3m)",
		"EQUIDISTANT": "Equidistante (1,5m)",
		"PATHFINDER": "Pathfinder/3.5 (1,5m/3m/1,5m)",
		},
		onChange: rule => canvas.grid.diagonalRule = rule
	});
	
	/**
	 * Option to automatically collapse Item Card descriptions
	 */
	game.settings.register("tormenta20", "autoCollapseItemCards", {
		name: "Esconder Descrições No Chat",
		hint: "Esconder Descrições No Chat. Alterar esta opção irá recarregar a página.",
		scope: "client",
		config: true,
		default: true,
		type: Boolean,
		onChange: () => location.reload()
	});

	/**
	 * Option to show apply buttons inside chat
	 */
	game.settings.register("tormenta20", "applyButtonsInsideChat", {
		name: "Botões de Dano/Gasto",
		hint: "Ao selecionar esta opção, os botões de aplicar dano, cura, gastar mana, etc, serão exibidos embutidos dentro do chat. Alterar esta opção irá recarregar a página.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});

	/**
	 * Option to show apply buttons inside chat
	 */
	 game.settings.register("tormenta20", "showStatusCards", {
		name: "Exibir Condições no Chat",
		hint: "Quando um personagem recebe uma condição cria uma mensagem com sua descrição no chat.",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		onChange: () => location.reload()
	});

	game.settings.register("tormenta20", "showDamageCards", {
		name: "Exibir Dano/Gasto de Mana no Chat para:",
		hint: "Quando os PVs/PMs de um ator mudam exibe mensagem no chat (Pode ficar poluído)",
		scope: "world",
		config: true,
		default: "none",
		type: String,
		choices: {
			"none": "Nenhum",
			"players": "Personagens dos Jogadores (PJ)",
			"npcs": "Personagens do Mestre (PdM)"
		},
		onChange: () => location.reload()
	});

	/**
	 * Option to define weight Rule calculation
	 */
	 game.settings.register("tormenta20", "weightRule", {
		name: "Regra de Carga",
		hint: "Define a regra para cálculo de carga.",
		scope: "world",
		config: true,
		default: "core",
		type: String,
		choices: {
			"core": "Regra Padrão, Livro Básico Tormenta20",
			"espacos": "Regra de Espaços, Dragão Brasil #171"
		},
		onChange: () => location.reload()
	});

	/**
	 * Option to define mechanics for Campaign Settings
	 */
	//  game.settings.register("tormenta20", "gameSystem", {
	// 	name: "WIP. Cenário de Jogo",
	// 	hint: "Altera regras de acordo com cenários de Jogo.",
	// 	scope: "world",
	// 	config: true,
	// 	default: "Tormenta20",
	// 	type: String,
	// 	choices: {
	// 		"Tormenta20": "Tormenta20",
	// 		"Skyfall": "Skyfall RPG"
	// 	},
	// 	onChange: () => location.reload()
	// });
}
