import ConjurarDialog from "./apps/conjurar-dialog.js";
import AbilityUseDialog from "./apps/ability-use-dialog.js";
import { T20Utility } from "./utility.js";
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

  // Handle rolls coming directly from the ability score.  && data.mod

  if (item.type == "poder") {
    formula = `${item.data.data.roll}`;
    formula = formula.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });

    flavorText = item.name;
    detailText = item.data.data.description.replace("\n", "<br/>");
    let poder = {
      resistencia: item.data.data.resistencia,
      cd: actor.data.data.attributes.cd + (actor.data.data.atributos[item.data.data.atrRes]?.mod ?? 0) + item.data.data.cd
    }
    templateData = {
      actor: actor,
      item: item,
      title: flavorText,
      power: poder,
      details: detailText,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };
    if (item.data.data.custo > 0) {
      templateData.custo = item.data.data.custo + (actorData.modificadores.custosPM.bonus ?? 0) + (actorData.modificadores.custosPM.penalidades ?? 0);
      if (templateData.custo <= 0)
      {
        templateData.custo = 1;
      }
    }
    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    if (!event.shiftKey) {
      rollT20(formula, actor, templateData);
    } else {
      const configuration = await AbilityUseDialog.create(item);
      templateData.rollMode = configuration.rollMode;
      templateData.custo = (parseInt(templateData.custo) ?? 0) + parseInt(configuration.ajustecusto);
      formula = `${formula} + ${configuration.bonus}`;
      rollT20(formula, actor, templateData);
    }
  } else if (item.type == "atributo") {
    /* GAMBIARRA */
    item.isOwned = true;
    item.name = item.label;
    item.actor = actor;
    item.data = {
      data: item
    }
    /* GAMBIARRA */

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
      actor: actor,
      item: item,
      title: item.label,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };
    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    if (!event.shiftKey) {
      rollT20(formula, actor, templateData);
    } else {
      // TODO Atributo não é item
      const configuration = await AbilityUseDialog.create(item);
      templateData.rollMode = configuration.rollMode;
      formula = `${formula} + ${configuration.bonus}`;
      rollT20(formula, actor, templateData);
    }
  } else if (item.type == "skill") {
    let formula = `1d20+${item.data.data.total}`;
    if (event.altKey) {
      formula = formula.replace("1d20", "2d20kh");
    }
    if (event.ctrlKey) {
      formula = formula.replace("1d20", "2d20kl");
    }

    templateData = {
      actor: actor,
      item: item,
      title: item.data.name,
      toIniciative: item.data.data.toIniciative,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };
    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");

    if (!event.shiftKey) {
      rollT20(formula, actor, templateData);
    } else {
      const configuration = await AbilityUseDialog.create(item);
      templateData.rollMode = configuration.rollMode;
      formula = `${formula} + ${configuration.bonus}`;
      rollT20(formula, actor, templateData);
    }
  } else if (item.type == "pericia") {
    /* GAMBIARRA */
    item.isOwned = true;
    item.name = item.label;
    item.actor = actor;
    item.data = {
      data: item
    }
    /* GAMBIARRA */
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
      actor: actor,
      item: item,
      title: item.label,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };
    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    if (!event.shiftKey) {
      rollT20(formula, actor, templateData);
    } else {
      const configuration = await AbilityUseDialog.create(item);
      templateData.rollMode = configuration.rollMode;
      formula = `${formula} + ${configuration.bonus}`;
      rollT20(formula, actor, templateData);
    }
  } else if (item.type == "arma") {
    let ex = {
      atq: "0",
      dadoDano: "",
      dano: "0",
      margemCritico: "0",
      multCritico: "0",
      pericia: "",
      atributo: "",
      tipo: "",
      alcance: "",
      custo: "",
      nome: "",
      descricao:"",
    };

    extra = mergeObject(ex, extra);
    // let periciaAtq = (actorData.pericias[extra.pericia].value ?? actorData.pericias[item.data.data.pericia].value);
    extra.atributo = extra.atributo.toLowerCase();
    let periciaAtq = "0";
    if(actorData.pericias){
      extra.pericia = extra.pericia.toLowerCase();
      periciaAtq = actorData.pericias[extra.pericia]
        ? actorData.pericias[extra.pericia].value
        : actorData.pericias[item.data.data.pericia].value;
    } else {
      extra.pericia = extra.pericia.charAt(0).toUpperCase() + extra.pericia.slice(1);
      periciaAtq = extra.pericia ? actor.items.filter(s=> s.type==="skill" && s.name === extra.pericia)[0] : actor.getOwnedItem(item.data.data.skill)?.data.data.total ?? 0;
    }
    
    let bonusAtq = extra.atq.match(/^\=/)
      ? extra.atq.replace("=", "")
      : `${item.data.data.atqBns} + ${extra.atq}`;

    let modificadorAtq =
      (actorData.modificadores.ataques.bonus ?? 0) +
      (actorData.modificadores.ataques.penalidade ?? 0);

    formula = {};
    formula.atq = `1d20+ ${periciaAtq}+ ${bonusAtq}+ ${modificadorAtq}`;

    if (event.altKey) {
      formula.atq = formula.atq.replace("1d20", "2d20kh");
    }
    if (event.ctrlKey) {
      formula.atq = formula.atq.replace("1d20", "2d20kl");
    }
    formula.atq = formula.atq.replace(/\@\w+\b/g, function (match) {
      return "(" + T20Utility.short(match, actorData) + ")";
    });

    let atributoDano = extra.atributo
      ? `@${extra.atributo}`
      : item.data.data.atrDan
      ? `@${item.data.data.atrDan}`
      : 0;
    let danoBonus =
      extra.dano && extra.dano.match(/^\=/)
        ? extra.dano.replace("=", "")
        : `${item.data.data.danoBns}+ ${extra.dano}`;
    let danoBase =
      extra.dadoDano != ""
        ? extra.dadoDano.replace("=", "")
        : item.data.data.dano;
    let critX = extra.multCritico.match(/^\=/)
      ? extra.multCritico.replace("=", "")
      : Number(item.data.data.criticoX) + Number(extra.multCritico);

    if (danoBase.match(/(\d*)d\d+/g)) {
      formula.dano = `${danoBase}  + ${atributoDano} +  ${danoBonus}`;
      let baseroll = danoBase.match(/(\d*)d\d+/g)
        ? danoBase.match(/(\d*)d\d+/g)[0]
        : "";
      let multiroll = danoBase.match(/(\d*)d\d+/g)
        ? Number(danoBase.match(/(\d*)d\d+/g)[0].split("d")[0]) *
            Number(critX) +
          "d" +
          danoBase.match(/(\d*)d\d+/g)[0].split("d")[1]
        : "";
      let newdano = danoBase.replace(baseroll, multiroll);
      // formula.crit = `${newdano} + ${atributoDano} + ${item.data.data._bonusDano}`;
      formula.crit = `${newdano} + ${atributoDano} + ${danoBonus}`;

      formula.dano = formula.dano.replace(/\@\w+\b/g, function (match) {
        return "(" + T20Utility.short(match, actorData) + ")";
      });
      formula.crit = formula.crit.replace(/\@\w+\b/g, function (match) {
        return "(" + T20Utility.short(match, actorData) + ")";
      });

      if (item.data.data.lancinante) {
        let lancinante = formula.crit
          .replace(/\s/g, "")
          .replace(/(\b\d+\b)/g, "($& * " + critX + ")");
        formula.crit = `${lancinante}`;
      }
    } else {
      formula.dano = null;
      formula.crit = null;
    }

    if(!ex.nome){
      flavorText = item.name;
    } else {
      flavorText = ex.nome; 
    }

    if(!ex.descricao){
      detailText = item.data.data.description;
    } else {
      detailText = ex.descricao;
    }

    flavorDesc = "";
    danoText = "";

    let properties = [];
    extra.tipo
      ? properties.push(extra.tipo)
      : item.data.data.tipo
      ? properties.push(item.data.data.tipo)
      : undefined;
    extra.alcance
      ? properties.push(extra.alcance)
      : item.data.data.alcance
      ? properties.push(item.data.data.alcance)
      : undefined;
    item.data.data.municao
      ? properties.push(item.data.data.municao)
      : undefined;

    templateData = {
      actor: actor,
      item: item,
      title: flavorText,
      flavor: flavorDesc,
      danosDesc: danoText,
      details: detailText,
      properties: properties,
      rollMode: rollMode,
      rollModes: CONFIG.Dice.rollModes,
    };

    if (item.data.data.custo > 0 || (extra.custo && extra.custo != "0")) {
      templateData.custo = extra.custo.match(/^\=/)
        ? extra.custo.replace("=", "")
        : Number(item.data.data.custo) + Number(extra.custo);
    }
    let margemCrit = extra.margemCritico.match(/^\=/)
      ? extra.margemCritico.replace("=", "")
      : Number(item.data.data.criticoM) - Number(extra.margemCritico);
    formula.atq = formula.atq
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    formula.dano = formula.dano
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    formula.crit = formula.crit
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    if (!event.shiftKey) {
      rollT20(formula, actor, templateData, margemCrit);
    } else {
      templateData.formula = formula.atq;
      templateData.formuladano = formula.dano;
      templateData.formuladanocritico = formula.crit;

      const configuration = await AbilityUseDialog.create(item);
      templateData.rollMode = configuration.rollMode;
      templateData.custo = (parseInt(templateData.custo) ?? 0) + parseInt(configuration.ajustecusto);
      formula.atq = `${formula.atq} + ${configuration.bonus}`;
      formula.dano = `${formula.dano} + ${configuration.bonusdano}`;
      formula.crit = `${formula.crit} + ${configuration.bonusdano}`;
      rollT20(formula, actor, templateData);
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
    let aplicados = [];
    let aprimoramentoData = null;
    if (event.shiftKey) {
      aprimoramentoData = await ConjurarDialog.create(actor, item);
      let aplicas = aprimoramentoData.getAll("aplica[]");
      let ids = aprimoramentoData.getAll("id[]");
      aprimoramentoData = {};
      for (var i = 0; i < aplicas.length; i++) {
        if (aplicas[i] > 0) {
          aprimoramentoData[ids[i]] = aplicas[i];
        }
      }
      if (
        item.data.data.aprimoramentos !== undefined &&
        Array.isArray(item.data.data.aprimoramentos)
      ) {
        aplicados = item.data.data.aprimoramentos.filter(
          (ap) => Object.keys(aprimoramentoData).indexOf(ap.id) !== -1
        );
      }
    } else if (
      item.data.data.aprimoramentos !== undefined &&
      Array.isArray(item.data.data.aprimoramentos)
    ) {
      aplicados = item.data.data.aprimoramentos.filter(
        (ap) => ap.ativo === true
      );
    }

    aplicados.forEach(function (apr) {
      let ap = {};
      if (aprimoramentoData) {
        ap.gasto = aprimoramentoData[apr.id];
      } else {
        ap.gasto = apr.custo;
      }
      ap.qtd = apr.tipo === "Aumenta" ? ap.gasto / apr.custo : 1;
      PMTotal = PMTotal + parseInt(apr.custo * ap.qtd);
      ap.custo = apr.custo;
      ap.tipo = apr.tipo;
      ap.description = apr.description.replace(/§/g, ap.qtd);

      if (apr.formula.match(/^d\d+$/)) {
        newDado = apr.formula.match(/.*/)[0];
      } else if (ap.tipo === "Aumenta" && apr.formula !== "") {
        let neoFormula = {
          qtd:
            parseInt(
              (item.data.data.efeito.match(/^\d+d/) ?? [0])[0].replace("d", "")
            ) +
            parseInt((apr.formula.match(/^\d+d/) ?? [0])[0].replace("d", "")) *
              ap.qtd,
          bonus:
            parseInt((item.data.data.efeito.match(/\+\d+/) ?? [0])[0]) +
            parseInt((apr.formula.match(/\+\d+/) ?? [0])[0]) * ap.qtd,
        };
        let fnlFormula = item.data.data.efeito
          .replace(/^\d+d/, neoFormula["qtd"] + "d")
          .replace(/\+\d+/, "+" + neoFormula["bonus"]);
        newFormula = fnlFormula;
      } else if (apr.formula === "-") {
        semFormula = 1;
      } else if (apr.formula !== "") {
        newFormula = apr.formula;
      }
      if (newFormula) {
        if (
          newFormula.match(
            /(\d+d\d+)([+-][\d]+|[+-]@[\w]{3}|(r|r<|x|x<|xo)[\d]+)*/
          )
        ) {
          //ok
        } else {
          newFormula = null;
          console.log("Algo de errado com a formula inserida");
        }
      }
      if (apr.tipo === "Truque") {
        eTruque = true;
      }
      aprimoramentos.push(ap);
    });
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
    spellHeader.custo = eTruque
      ? 0
      : Math.max(parseInt(item.data.data.custo) + PMTotal, 1);
    spellHeader.execucao = item.data.data.execucao;
    spellHeader.alcance = item.data.data.alcance;
    spellHeader.alvo = item.data.data.alvo;
    spellHeader.area = item.data.data.area;
    spellHeader.duracao = item.data.data.duracao;
    spellHeader.resistencia = item.data.data.resistencia;
    spellHeader.cd = actor.data.data.attributes.cd + (actor.data.data.atributos[item.data.data.atrRes]?.mod ?? 0) + item.data.data.cd ;
    detailText = item.data.data.description;

    templateData = {
      actor: actor,
      item: item,
      title: flavorText,
      flavor: flavorDesc,
      spell: spellHeader,
      details: detailText,
      aprimoramentos: aprimoramentos,
    };

    if (!eTruque && item.data.data.custo > 0) {
      templateData.custo = Math.max(parseInt(item.data.data.custo) + PMTotal + (actorData.modificadores.custosPM.bonus ?? 0) + (actorData.modificadores.custosPM.penalidades ?? 0), 1);
      } else if (eTruque) {
        templateData.custo = 0;
        templateData.truque = 1;
        //templateData.custo = item.data.data.custo + (actorData.modificadores.custosPM.bonus ?? 0) + (actorData.modificadores.custosPM.penalidades ?? 0);
    }

    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");

    rollT20(formula, actor, templateData);
  } else if (item.type == "consumivel") {
    formula = item.data.data.efeito;
    templateData = {
      actor: actor,
      item: item,
      title: item.name,
      details: item.description,
    };
    formula = formula
      .replace(/ /g, "")
      .replace(/\+0/g, "")
      .replace(/\-0/g, "")
      .replace(/\++/g, "+");
    rollT20(formula, actor, templateData);
  } else if (itemId != undefined) {
    data.roll();
  }
}

function rollT20(roll, actor, templateData, criticoM = null) {
  let actorData = actor.data.data;
  // Render the roll
  let template = "systems/tormenta20/templates/chat/chat-card.html";
  let dmgroll = null;
  // GM rolls.
  let combate = game.combats.active;

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({
      actor: actor,
    }),
    flags: { "core.canPopout": true },
  };

  let rollMode = game.settings.get("core", "rollMode");
  if (templateData.rollMode) {
    let rollMode = templateData.rollMode;
  }

  if (["gmroll", "blindroll"].includes(rollMode))
    chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
  if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
  if (rollMode === "blindroll") chatData["blind"] = true;

  // Handle dice rolls.
  let danoFormula = false;
  let critFormula = false;
  let tipoCritico = "";
  let tipoFalha = "";

  if (typeof roll === "object") {
    // remove signs from end of sting
    if (roll.dano != null) {
      danoFormula = roll.dano.trim().replace(/([\+\-]+$)/g, "");
      critFormula = roll.crit.trim().replace(/([\+\-]+$)/g, "");
    }
    roll = roll.atq.trim().replace(/([\+\-]+$)/g, "");
  }

  // Automatic Mana Spend
  if (
    actor &&
    templateData.custo &&
    game.settings.get("tormenta20", "automaticManaSpend")
  ) {
    actor.spendMana(templateData.custo, 0, false);
  }

  if (roll) {
    // Roll can be either a formula like `2d6+3` or a raw stat like `str`.
    let formula = "";
    let result;
    if (roll.match(/(\d*)d\d+/g)) {
      formula = roll;
    } else if (Number(roll) !== NaN) {
      formula = null;
      result = new Roll(roll).roll();
    }
    let rollTemplate = {
      template: "systems/tormenta20/templates/chat/t20roll.html",
    };
    if (formula != null) {
      let roll = new Roll(`${formula}`);
      roll.roll();
      result = roll.results[0];
      
      if (result == 20) {
        tipoCritico = "critico";
      } else if (result == 1) {
        tipoFalha = "falha";
      }
      if ((templateData.toIniciative || templateData.title == "Iniciativa") && combate) {
        let combatente = combate.combatants.find(
          (combatant) => combatant.actor.id === actor.id
        );
        if (combatente && combatente.iniciative == null) {
          combate.setInitiative(combatente._id, roll.total);
          console.log(
            "Foundry VTT | Iniciativa Atualizada para " +
              combatente._id +
              " (" +
              combatente.actor.name +
              ")"
          );
        }
      }

      // Check if there are dmg rolls and what critical math to use
      if (danoFormula) {
        if (result >= criticoM) {
          dmgroll = new Roll(`${critFormula}`);
          tipoCritico = "critico";
        } else {
          dmgroll = new Roll(`${danoFormula}`);
        }
        dmgroll.roll();
        //dmgroll.render(rollTemplate)
        dmgroll.render().then((r) => {
          templateData.rollDano = r;
          templateData.critico = tipoCritico;
          templateData.falha = tipoFalha;
        });
      }
      // Render it.
      roll.render().then((r) => {
        templateData.roll = r;
        templateData.critico = tipoCritico;
        templateData.falha = tipoFalha;
        renderTemplate(template, templateData).then((content) => {
          chatData.content = content;
          if (game.dice3d) {
            game.dice3d
              .showForRoll(
                roll,
                game.user,
                true,
                chatData.whisper,
                chatData.blind
              )
              .then((displayed) => ChatMessage.create(chatData));
            if (dmgroll) {
              game.dice3d.showForRoll(
                dmgroll,
                game.user,
                true,
                chatData.whisper,
                chatData.blind
              );
            }
          } else {
            chatData.sound = CONFIG.sounds.dice;
            ChatMessage.create(chatData);
          }
        });
      });
    } else {
      //result.render(rollTemplate)
      result.render().then((r) => {
        templateData.roll = r;
        renderTemplate(template, templateData).then((content) => {
          chatData.content = content;
          ChatMessage.create(chatData);
        });
      });
    }
  } else {
    renderTemplate(template, templateData).then((content) => {
      chatData.content = content;
      ChatMessage.create(chatData);
    });
  }
}
