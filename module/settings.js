
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
    },
    onChange: rule => canvas.grid.diagonalRule = rule
  });
}
