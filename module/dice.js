import ConjurarDialog from "./apps/conjurar-dialog.js";
/* Standardized Roll Script */
export async function prepRoll(event, item, actor = null, extra = {}) {
  actor = !actor ? this.actor : actor;
  const actorData = actor.data.data;
  // Initialize variables.
  event.preventDefault();

  // const a = event.currentTarget;
  // const itemId = $(a).parents('.item').attr('data-item-id');
  // const item = actor.getOwnedItem(itemId);

  let formula = null;
  let titleText = null;
  let flavorText = null;
  let flavorDesc = null;
  let detailText = null;
  let danoFormula = null;
  let spellHeader = null;
  let templateData = {};
  let danoText = null;
  let templateRollDialog = "systems/tormenta20/templates/chat/roll-dialog.html";

  let rollMode = game.settings.get("core", "rollMode");

  if (["gmroll", "blindroll"].includes(rollMode))
  chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
  if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
  if (rollMode === "blindroll") chatData["blind"] = true;

  // Handle rolls coming directly from the ability score.  && data.mod

  if (item.type == "poder") {
    formula = `${item.data.data.roll}`;
    formula = formula.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });

    flavorText = item.name;
    detailText = item.data.data.description.replace("\n", "<br/>");

    templateData = {
      title: flavorText,
      details: detailText,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes
    };
    if (item.data.data.custo > 0) {
      templateData.custo = item.data.data.custo;
    }

    if (!event.shiftKey || !item.data.data.custo) {
      rollT20(formula, actor, templateData);
    } else {

      let dialogCallback = (html) => {
        rollMode = html.find('[name="rollMode"]').val();
        if (item.data.data.custo > 0) {
          let custoAdic = html.find('[name="ajustecusto"]').val();
          if (
            custoAdic.length > 0 &&
            custoAdic.trim().charAt(0) != "+" &&
            custoAdic.trim().charAt(0) != "-"
          )
            custoAdic += "+";
          templateData.custo =
            parseInt(templateData.custo) + parseInt(custoAdic);
        }

        rollT20(formula, actor, templateData);
      };

      return new Promise((resolve) => {
        renderTemplate(templateRollDialog, templateData).then((dlg) => {
          new Dialog({
            title: "Uso de Poder: " + flavorText,
            content: dlg,
            buttons: {
              normal: {
                label: "Confirmar",
                callback: (html) => {
                  resolve(dialogCallback(html));
                },
              },
            },
            default: "normal",
            close: () => {
              // noop
            },
          }).render(true);
        });
      });
    }   
  } else if (item.type == "atributo") {
    formula = item.roll;
    if (event.altKey) {
      formula = formula.replace("1d20", "2d20kh");
    }
    if (event.ctrlKey) {
      formula = formula.replace("1d20", "2d20kl");
    }
    formula = formula.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });
    flavorText = item.label;

    templateData = {
      title: flavorText,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes
    };
    if (!event.shiftKey ){
    rollT20(formula, actor, templateData);
    }
    else
    {
      templateData.formula = formula;
      let dialogCallback = (html) => {
        rollMode = html.find('[name="rollMode"]').val();
        let rollBonus = html.find('[name="bonus"]').val();
        if (
          rollBonus.length > 0 &&
          rollBonus.trim().charAt(0) != "+" &&
          rollBonus.trim().charAt(0) != "-"
        )
          rollBonus += "+";
          formula = formula + rollBonus;
          rollT20(formula, actor, templateData);
      };
      return new Promise((resolve) => {
        renderTemplate(templateRollDialog, templateData).then((dlg) => {
          new Dialog({
            title: "Teste de Atributo: " + flavorText,
            content: dlg,
            buttons: {
              normal: {
                label: "Rolar",
                callback: (html) => {
                  resolve(dialogCallback(html));
                },
              },
            },
            default: "normal",
            close: () => {
              // noop
            },
          }).render(true);
        });
      });
    }
  } else if (item.type == "pericia") {
    formula = item.roll;
    if (event.altKey) {
      formula = formula.replace("1d20", "2d20kh");
    }
    if (event.ctrlKey) {
      formula = formula.replace("1d20", "2d20kl");
    }
    formula = formula.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });
    flavorText = item.label;
    templateData = {
      title: flavorText,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes
    };
    if (!event.shiftKey) {
    rollT20(formula, actor, templateData);
    }
    else{
      templateData.formula = formula;
      let dialogCallback = (html) => {
        rollMode = html.find('[name="rollMode"]').val();
        let rollBonus = html.find('[name="bonus"]').val();
        if (
          rollBonus.length > 0 &&
          rollBonus.trim().charAt(0) != "+" &&
          rollBonus.trim().charAt(0) != "-"
        )
          rollBonus += "+";
          formula = formula + rollBonus;
          rollT20(formula, actor, templateData);
      };
      return new Promise((resolve) => {
        renderTemplate(templateRollDialog, templateData).then((dlg) => {
          new Dialog({
            title: "Teste de Perícia: " + flavorText,
            content: dlg,
            buttons: {
              normal: {
                label: "Rolar",
                callback: (html) => {
                  resolve(dialogCallback(html));
                },
              },
            },
            default: "normal",
            close: () => {
              // noop
            },
          }).render(true);
        });
      });
    }
  } else if (item.type == "ataque" || item.type == "arma") {
    formula = {};
    formula.atq = `1d20+ ${actorData.pericias[item.data.data.pericia].value}+ ${
      item.data.data._bonusAtq
    }`;
    formula.atq =
      `1d20+ ${actorData.pericias[item.data.data.pericia].value}` +
      (item.data.data.bonusAtq != undefined && item.data.data.bonusAtq != 0
        ? `+${item.data.data.bonusAtq}`
        : ``) +
      (item.data.data._bonusAtq != undefined && item.data.data._bonusAtq != 0
        ? `+${item.data.data._bonusAtq}`
        : ``);
    if (event.altKey) {
      formula.atq = formula.atq.replace("1d20", "2d20kh");
    }
    if (event.ctrlKey) {
      formula.atq = formula.atq.replace("1d20", "2d20kl");
    }
    formula.atq = formula.atq.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });

    let atributoDano =
      item.data.data.atrDan != "0"
        ? actorData.atributos[item.data.data.atrDan].mod
        : 0;
    if (item.data.data.dano.match(/(\d*)d\d+/g)) {
      // formula.dano = `${item.data.data.dano} + ${atributoDano} + ${item.data.data._bonusDano}`;
      formula.dano =
        `${item.data.data.dano}` +
        (atributoDano != undefined && atributoDano != 0
          ? `+ ${atributoDano}`
          : ``) +
        (item.data.data.bonusDano != undefined && item.data.data.bonusDano != 0
          ? `+ ${item.data.data.bonusDano}`
          : ``) +
        (item.data.data._bonusDano != undefined &&
        item.data.data._bonusDano != 0
          ? `+ ${item.data.data._bonusDano}`
          : ``);
      let baseroll = item.data.data.dano.match(/(\d*)d\d+/g)
        ? item.data.data.dano.match(/(\d*)d\d+/g)[0]
        : "";
      let multiroll = item.data.data.dano.match(/(\d*)d\d+/g)
        ? item.data.data.dano.match(/(\d*)d\d+/g)[0].split("d")[0] *
            item.data.data.criticoX +
          "d" +
          item.data.data.dano.match(/(\d*)d\d+/g)[0].split("d")[1]
        : "";
      let newdano = item.data.data.dano.replace(baseroll, multiroll);
      // formula.crit = `${newdano} + ${atributoDano} + ${item.data.data._bonusDano}`;
      formula.crit =
        `${newdano}` +
        (atributoDano != undefined && atributoDano != 0
          ? `+ ${atributoDano}`
          : ``) +
        (item.data.data.bonusDano != undefined && item.data.data.bonusDano != 0
          ? `+ ${item.data.data.bonusDano}`
          : ``) +
        (item.data.data._bonusDano != undefined &&
        item.data.data._bonusDano != 0
          ? `+ ${item.data.data._bonusDano}`
          : ``);
      if (item.data.data.lancinante) {
        let lacinante = formula.crit
          .replace(/\s/g, "")
          .replace(/(\b\d+\b)/g, "($& * " + item.data.data.criticoX + ")");
        formula.crit = `${lacinante}`;
      }

      formula.dano = formula.dano.replace(/\@\w+\b/g, function (match) {
        return "(" + T20Utility.short(match, actorData) + ")";
      });
      formula.crit = formula.crit.replace(/\@\w+\b/g, function (match) {
        return "(" + T20Utility.short(match, actorData) + ")";
      });
    } else {
      formula.dano = null;
      formula.crit = null;
    }

    flavorText = item.name;
    detailText = item.data.data.description;

    flavorDesc = "";
    flavorDesc +=
      actorData.pericias[item.data.data.pericia].value > 0
        ? "(" +
          actorData.pericias[item.data.data.pericia].label +
          " +" +
          actorData.pericias[item.data.data.pericia].value +
          ")"
        : "";
    flavorDesc +=
      item.data.data.bonusAtq > 0
        ? " + (Bonus Ataque +" + item.data.data.bonusAtq + ")"
        : "";

    danoText = "";
    danoText +=
      item.data.data.atrDan != "0"
        ? "(" + item.data.data.atrDan + " +" + atributoDano + ")"
        : "";
    danoText +=
      item.data.data.bonusDano > 0
        ? " + (Bonus Dano +" + item.data.data.bonusDano + ")"
        : "";

    templateData = {
      title: flavorText,
      flavor: flavorDesc,
      danosDesc: danoText,
      details: detailText,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes
    };

    if (item.data.data.custo > 0) {
      templateData.custo = item.data.data.custo;
    }
    if (!event.shiftKey) {
    rollT20(formula, actor, templateData, item.data.data.criticoM);
    }
    else
    {
      templateData.formula = formula.atq;
      templateData.formuladano = formula.dano;
      templateData.formuladanocritico = formula.crit;

      let dialogCallback = (html) => {
        rollMode = html.find('[name="rollMode"]').val();
        let rollBonus = html.find('[name="bonus"]').val();
        if (
          rollBonus.length > 0 &&
          rollBonus.trim().charAt(0) != "+" &&
          rollBonus.trim().charAt(0) != "-"
        )
          rollBonus += "+";
        let rollBonusDano = html.find('[name="bonusdano"]').val();
        if (
          rollBonusDano.length > 0 &&
          rollBonusDano.trim().charAt(0) != "+" &&
          rollBonusDano.trim().charAt(0) != "-"
        )
          rollBonusDano += "+";
        if (item.data.data.custo > 0) {
          let custoAdic = html.find('[name="ajustecusto"]').val();
          if (
            custoAdic.length > 0 &&
            custoAdic.trim().charAt(0) != "+" &&
            custoAdic.trim().charAt(0) != "-"
          )
            custoAdic += "+";
          templateData.custo =
            parseInt(templateData.custo) + parseInt(custoAdic);
        }
        formula.atq += rollBonus;
        formula.dano += rollBonusDano;
        formula.crit += rollBonusDano;
        rollT20(formula, actor, templateData, item.data.data.criticoM);;
      };

      return new Promise((resolve) => {
        renderTemplate(templateRollDialog, templateData).then((dlg) => {
          new Dialog({
            title: "Ataque - " + flavorText + " " + flavorDesc,
            content: dlg,
            buttons: {
              normal: {
                label: "Rolar",
                callback: (html) => {
                  resolve(dialogCallback(html));
                },
              },
            },
            default: "normal",
            close: () => {
              // noop
            },
          }).render(true);
        });
      });
    }
  } else if (item.type == "magia") {
    /* -------------------------------------------- */
    /*  APRIMORAMENTOS                              */
    /* -------------------------------------------- */
    let semFormula;
    let newFormula;
    let newDado;
    let PMTotal = 0;
    let eTruque = false;
    let aprimoramentos = [];
    if (event.shiftKey) {
      let aprimoramentoData = await ConjurarDialog.create(actor, item);
      let aplicados = aprimoramentoData.getAll("aplica[]");
      let custo = aprimoramentoData.getAll("custo[]");
      let tipos = aprimoramentoData.getAll("tipo[]");
      let descriptions = aprimoramentoData.getAll("description[]");
      let formulas = aprimoramentoData.getAll("formula[]");
      for (var i = 0; i < aplicados.length; i++) {
        // console.log(i);
        if (aplicados[i] > 0) {
          let ap = {};
          PMTotal = PMTotal + parseInt(custo[i]) * aplicados[i];
          ap.gasto = aplicados[i];
          ap.qtd = aplicados[i] / custo[i];
          ap.tipo = tipos[i];
          ap.custo = custo[i];
          ap.description = descriptions[i].replace(/§/g, ap.qtd);
          if (formulas[i].match(/^d\d+$/)) {
            newDado = formulas[i].match(/.*/)[0];
          } else if (ap.tipo === "Aumenta" && formulas[i] !== "") {
            // ap.dado = formulas[i].replace(/?/g, ap.qtd).replace(/\([\d()+*-/]*\)/g, function(match){ return eval(match)});
            // newFormula = ap.dado.replace(/^\+/,'');
            let neoFormula = {
              qtd:
                parseInt(
                  (item.data.data.efeito.match(/^\d+d/) ?? [0])[0].replace(
                    "d",
                    ""
                  )
                ) +
                parseInt(
                  (formulas[i].match(/^\d+d/) ?? [0])[0].replace("d", "")
                ) *
                  ap.qtd,
              bonus:
                parseInt((item.data.data.efeito.match(/\+\d+/) ?? [0])[0]) +
                parseInt((formulas[i].match(/\+\d+/) ?? [0])[0]) * ap.qtd,
            };
            // console.log(parseInt((item.data.data.efeito.match(/\+\d+/)??[0])[0]));
            // console.log(parseInt((formulas[i].match(/\+\d+/)??[0])[0]));
            let fnlFormula = item.data.data.efeito
              .replace(/^\d+d/, neoFormula["qtd"] + "d")
              .replace(/\+\d+/, "+" + neoFormula["bonus"]);
            newFormula = fnlFormula;

            if (
              newFormula.match(
                /(\d+d\d+)([+-][\d]+|[+-]@[\w]{3}|(r|r<|x|x<|xo)[\d]+)*/
              )
            ) {
              //ok
            } else {
              newFormula = null;
              console.log("Algo de errado com a formula inserida");
              //Show error: Algo de errado com a formula inserida (newFormula).
            }
          } else if (formulas[i] === "-") {
            semFormula = 1;
          } else if (formulas[i] !== "") {
            newFormula = formulas[i];
          }
          if (tipos[i] === "Truque") {
            eTruque = true;
          }

          aprimoramentos.push(ap);
        }
      }
    }
    /* -------------------------------------------- */
    /*  //APRIMORAMENTOS                            */
    /* -------------------------------------------- */
    formula = !newFormula ? item.data.data.efeito : newFormula;
    formula = !semFormula ? formula : "";
    formula = !newDado ? formula : formula.replace(/d\d+/, newDado);
    formula = formula.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });

    flavorText = item.name;
    spellHeader = {};
    spellHeader.tipo = item.data.data.tipo;
    spellHeader.circulo = item.data.data.circulo;
    spellHeader.escola = item.data.data.escola;
    spellHeader.custo = eTruque ? 0 : parseInt(item.data.data.custo) + PMTotal;
    spellHeader.execucao = item.data.data.execucao;
    spellHeader.alcance = item.data.data.alcance;
    spellHeader.alvo = item.data.data.alvo;
    spellHeader.area = item.data.data.area;
    spellHeader.duracao = item.data.data.duracao;
    spellHeader.resistencia = item.data.data.resistencia;
    detailText = item.data.data.description;

    templateData = {
      title: flavorText,
      flavor: flavorDesc,
      spell: spellHeader,
      details: detailText,
      aprimoramentos: aprimoramentos,
    };

    if (!eTruque && item.data.data.custo > 0) {
      templateData.custo = parseInt(item.data.data.custo) + PMTotal;
    } else if (eTruque) {
      templateData.custo = 0;
      templateData.truque = 1;
    }
    rollT20(formula, actor, templateData);
  } else if (itemId != undefined) {
    data.roll();
  }
}

function rollT20(roll, actor, templateData, criticoM = null) {

  let actorData = actor.data.data;
    // Render the roll.
    let template = 'systems/tormenta20/templates/chat/chat-card.html';
    let dmgroll = null;
    // GM rolls.
    let combate = game.combats.active;

    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({
        actor: actor
      }),
      flags: {"core.canPopout": true}
    };
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

    // Handle dice rolls.
    let danoFormula = false;
    let critFormula = false;
    let tipoCritico = "";
    let tipoFalha = "";

    if (typeof roll === 'object') {
      // remove signs from end of sting
      if (roll.dano != null) {
        danoFormula = roll.dano.trim().replace(/([\+\-]+$)/g, '');
        critFormula = roll.crit.trim().replace(/([\+\-]+$)/g, '');
      }
      roll = roll.atq.trim().replace(/([\+\-]+$)/g, '');
    }

    if (roll) {
      // Roll can be either a formula like `2d6+3` or a raw stat like `str`.
      let formula = '';

      if (roll.match(/(\d*)d\d+/g)) {

        formula = roll;
      }

      if (formula != null) {
        let roll = new Roll(`${formula}`);
        roll.roll();
        let result = roll.results[0];

        if(result == 20)
        {
          tipoCritico = "critico";
        }
        else if(result == 1)
        {
          tipoFalha = "falha";
        }
        if(templateData.title == "Iniciativa" && combate){
          let combatente = combate.combatants.find(combatant => combatant.actor.id === actor.id);
          if(combatente && combatente.iniciative == null){
            combate.setInitiative(combatente._id,result);
            console.log("Foundry VTT | Iniciativa Atualizada para "+combatente._id+" ("+combatente.actor.name+")");
          }
        }
        let rollTemplate = {
            template: "systems/tormenta20/templates/chat/t20roll.html"
          };
        // Check if there are dmg rolls and what critical math to use
        if (danoFormula) {
          if (result >= criticoM) {
            dmgroll = new Roll(`${critFormula}`);
            tipoCritico = "critico";
          } else {
            dmgroll = new Roll(`${danoFormula}`);
          }
          dmgroll.roll();
          dmgroll.render(rollTemplate).then(r => {
            templateData.rollDano = r;
            templateData.critico = tipoCritico;
            templateData.falha = tipoFalha;
          });

        }
        // Render it.

        roll.render(rollTemplate).then(r => {
          templateData.roll = r;
          templateData.critico = tipoCritico;
          templateData.falha = tipoFalha;

          renderTemplate(template, templateData).then(content => {
            chatData.content = content;
            if (game.dice3d) {
              game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));
              if(dmgroll){
                game.dice3d.showForRoll(dmgroll, game.user, true, chatData.whisper, chatData.blind);
              }
            } else {
              chatData.sound = CONFIG.sounds.dice;
              ChatMessage.create(chatData);
            }
          });
        });
      }
    } else {
      renderTemplate(template, templateData).then(content => {
        chatData.content = content;
        ChatMessage.create(chatData);
      });
    }
}