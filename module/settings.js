export class Tormenta20ChatSettings extends FormApplication {

	constructor (object, options = {}) {
		super(object, options)
	}

	/**
	 * Default Options for this FormApplication
	 */
	static get defaultOptions () {
		return mergeObject(super.defaultOptions, {
			id : 'tormenta20-chat-form',
			title : 'Configurações do Chat',
			template : './systems/tormenta20/templates/apps/settings.hbs',
			classes : ['sheet'],
			width : 640,
			height : "auto",
			closeOnSubmit: true
		})
	}

	getData (options) {
		function prepSetting (key) {
			let data = game.settings.settings.get(`tormenta20.${key}`)
			return {
				value: game.settings.get('tormenta20', key),
				name : data.name,
				hint : data.hint
			}
		}

		return {
			forceSheetTemplate : prepSetting('forceSheetTemplate'),
			disableExperience : prepSetting('disableExperience'),
			enableLanguages : prepSetting('enableLanguages'),
			disableJournal : prepSetting('disableJournal')
		}
	}

	/**
	 * Executes on form submission
	 * @param {Event} e - the form submission event
	 * @param {Object} d - the form data
	 */
	async _updateObject(e,d) {
		const iterableSettings = Object.keys(d);
		for (let key of iterableSettings) {
			game.settings.set('tormenta20', key, d[key]);
		}
	}
}

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
		type: Tormenta20ChatSettings,
		restricted: true
	});
	

	
	/**
	* Option to disable XP bar for session-based or story-based advancement.
	*/
	game.settings.register("tormenta20", "disableExperience", {
		name: "Avanço por Marcos",
		hint: "Os personagens não recebem pontos de experiência. Em vez disso, sobem de nível sempre que alcançam um determinado marco na história.",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
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
		onChange: s => {
			location.reload();
		}
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
		onChange: s => {
			location.reload();
		}
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
		onChange: s => {
			location.reload();
		}
	});
}
