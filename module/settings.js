
/*Classe para configurar opções do sistema*/
export const SystemSettings = function() {
  game.settings.register("tormenta20", "sheetTemplate", {
    name: "Ficha",
    hint: "Opção de layout da ficha, padrão ou com abas",
    scope: "user",
    config: true,
    default: "base",
    type: String,
    choices: {
      "base": "Layout T20 (padrão)",
      "tabbed": "Layout VTT (abas)"
    }
  });

  /**
   * Gasto Automático de Mana
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
   * Option to disable XP bar for session-based or story-based advancement.
   */
  game.settings.register("tormenta20", "disableExperience", {
    name: "Avanço por Marcos",
    hint: "Os personagens não recebem pontos de experiência. Em vez disso, sobem de nível sempre que alcançam um determinado marco na história.",
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

}
