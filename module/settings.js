
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

}