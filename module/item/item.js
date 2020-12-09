import { T20Utility } from '../utility.js';
import ConjurarDialog from "../apps/conjurar-dialog.js";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class T20Item extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll(ac, extra = {}) {

    // Basic template rendering data
    const token = this.actor.token;
    const item = this.data;
    const actorData = this.actor ? this.actor.data.data : {};
    const itemData = item.data;
    let formula = null;
    let titleText = null;
    let flavorText = null;
    let flavorDesc = null;
    let detailText = null;
    let danoFormula = null;
    let spellHeader = null;
    let templateData = {};
    if (item.type == 'poder') {
      formula = `${itemData.roll}`;
      formula = formula.replace(/\@\w+\b/g, function(match){
                    return "("+T20Utility.short(match, actorData)+")";
                });

      flavorText = item.name;
      detailText = itemData.description.replace("\n", "<br/>");

      templateData = {
        title: flavorText,
        details: detailText
      };
      if (itemData.custo && itemData.custo > 0) {
        templateData.custo = itemData.custo;
      }
      this.rollT20(formula, actorData, templateData);
    } else if (item.type == 'ataque') {
      formula = {};
      formula.atq = `1d20+ ${actorData.pericias[itemData.pericia].value}`
                        + (itemData.bonusAtq!=undefined && itemData.bonusAtq!=0? `+ ${itemData.bonusAtq}`: ``)
                        + (itemData._bonusAtq!=undefined && itemData._bonusAtq!=0? `+ ${itemData._bonusAtq}`: ``);

      formula.atq = formula.atq.replace(/\@\w+\b/g, function(match){
                    return "("+T20Utility.short(match, actorData)+")";
                });

      let atributoDano = itemData.atrDan != '0' ? actorData.atributos[itemData.atrDan].mod : 0;
      if (itemData.dano.match(/(\d*)d\d+/g)) {
        // formula.dano = `${itemData.dano} + ${atributoDano} + ${itemData.bonusDano} + ${itemData._bonusDano}`;
        formula.dano = `${itemData.dano}`
                        + (atributoDano!=undefined && atributoDano!=0? `+ ${atributoDano}`: ``)
                        + (itemData.bonusDano!=undefined && itemData.bonusDano!=0? `+ ${itemData.bonusDano}`: ``)
                        + (itemData._bonusDano!=undefined && itemData._bonusDano!=0? `+ ${itemData._bonusDano}`: ``);
        let baseroll = itemData.dano.match(/(\d*)d\d+/g) ? itemData.dano.match(/(\d*)d\d+/g)[0] : '';
        let multiroll = itemData.dano.match(/(\d*)d\d+/g) ? (itemData.dano.match(/(\d*)d\d+/g)[0].split('d')[0]) * itemData.criticoX + 'd' + itemData.dano.match(/(\d*)d\d+/g)[0].split('d')[1] : '';
        let newdano = itemData.dano.replace(baseroll, multiroll);
        // formula.crit = `${newdano} + ${atributoDano} + ${itemData.bonusDano} + ${itemData._bonusDano}`;
        formula.crit = `${newdano}`
                        + (atributoDano!=undefined && atributoDano!=0? `+ ${atributoDano}`: ``)
                        + (itemData.bonusDano!=undefined && itemData.bonusDano!=0? `+ ${itemData.bonusDano}`: ``)
                        + (itemData._bonusDano!=undefined && itemData._bonusDano!=0? `+ ${itemData._bonusDano}`: ``);
        if (itemData.lancinante) {
          let lacinante = formula.crit.replace(/\s/g, '').replace(/(\b\d+\b)/g, "($& * " + itemData.criticoX + ")");
          formula.crit = `${lacinante}`;
        }

        formula.dano = formula.dano.replace(/\@\w+\b/g, function(match){
                    return "("+T20Utility.short(match, actorData)+")";
                });
        formula.crit = formula.crit.replace(/\@\w+\b/g, function(match){
                    return "("+T20Utility.short(match, actorData)+")";
                });

      } else {
        formula.dano = null;
        formula.crit = null;
      }


      flavorText = item.name;
      detailText = itemData.description;

      templateData = {
        title: flavorText,
        flavor: flavorDesc,
        details: detailText
      };
      if (itemData.custo > 0) {
        templateData.custo = itemData.custo;
      }
      this.rollT20(formula, actorData, templateData, itemData.criticoM);

    } else if (item.type == 'magia') {
      /* -------------------------------------------- */
      /*  APRIMORAMENTOS                              */
      /* -------------------------------------------- */
      let newFormula;
      let newDado;
      let PMTotal = 0;
      let eTruque = false;
      let aprimoramentos = [];
      if(event.ctrlKey){
        let aprimoramentoData = await ConjurarDialog.create(this.actor, this);
        let aplicados = aprimoramentoData.getAll('aplica[]');
        let custo = aprimoramentoData.getAll('custo[]');
        let tipos = aprimoramentoData.getAll('tipo[]');
        let descriptions = aprimoramentoData.getAll('description[]');
        let formulas = aprimoramentoData.getAll('formula[]');
        for (var i = 0; i < aplicados.length; i++) {
          // console.log(i);
          if(aplicados[i]>0){
            let ap = {};
            PMTotal = PMTotal +  parseInt(aplicados[i]);
            ap.gasto = aplicados[i];
            ap.qtd = aplicados[i]/custo[i];
            ap.tipo = tipos[i];
            ap.custo = custo[i];
            ap.description = descriptions[i].replace(/§/g, ap.qtd);
            if(formulas[i].match(/^d\d+$/)) {
              newDado = formulas[i].match(/.*/)[0];
            } else if(formulas[i]!=="") {
              // ap.dado = formulas[i].replace(/§/g, ap.qtd).replace(/\([\d()+*-/]*\)/g, function(match){ return eval(match)});
              // newFormula = ap.dado.replace(/^\+/,'');
              let neoFormula = {
                'qtd': parseInt((itemData.efeito.match(/^\d+d/)??[0])[0].replace('d',''))+parseInt((formulas[i].match(/^\d+d/)??[0])[0].replace('d',''))*ap.qtd,
                'bonus': parseInt((itemData.efeito.match(/\+\d+/)??[0])[0])+parseInt((formulas[i].match(/\+\d+/)??[0])[0])*ap.qtd
              };
              let fnlFormula = itemData.efeito.replace(/^\d+d/, neoFormula['qtd']+'d').replace(/\+\d+/, '+'+neoFormula['bonus']);
              newFormula = fnlFormula;
              
              if(newFormula.match(/(\d+d\d+)([+-][\d]+|[+-]@[\w]{3}|(r|r<|x|x<|xo)[\d]+)*/)){
                //ok
              } else {
                newFormula = null;
                console.log('Algo de errado com a formula inserida');
                //Show error: Algo de errado com a formula inserida (newFormula).
              }
            }
            if(tipos[i] === "Truque") {
              eTruque = true;
            }

            aprimoramentos.push(ap);
          }
        }
      }
      /* -------------------------------------------- */
      /*  //APRIMORAMENTOS                            */
      /* -------------------------------------------- */
      formula = !newFormula? itemData.efeito : newFormula;
      formula = !newDado? formula : formula.replace(/d\d+/, newDado);
      formula = formula.replace(/\@\w+\b/g, function(match){
                    return "("+T20Utility.short(match, actorData)+")";
                });
      flavorText = item.name;
      spellHeader = {};
      spellHeader.tipo = itemData.tipo;
      spellHeader.circulo = itemData.circulo;
      spellHeader.escola = itemData.escola;
      spellHeader.custo = (eTruque? 0: parseInt(itemData.custo) + PMTotal);
      spellHeader.execucao = itemData.execucao;
      spellHeader.alcance = itemData.alcance;
      spellHeader.alvo = itemData.alvo;
      spellHeader.area = itemData.area;
      spellHeader.duracao = itemData.duracao;
      spellHeader.resistencia = itemData.resistencia;
      detailText = itemData.description;

      templateData = {
        title: flavorText,
        flavor: flavorDesc,
        spell: spellHeader,
        details: detailText,
        aprimoramentos: aprimoramentos
      };

      if (!eTruque && itemData.custo > 0) {
        templateData.custo = parseInt(itemData.custo) + PMTotal;
      } else if(eTruque) {
        templateData.custo = 0;
        templateData.truque = 1;
      }
      this.rollT20(formula, actorData, templateData);

    } else {
      let roll = new Roll(itemData.roll, actorData);
      let label = `Rolando ${item.name}`;
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({
          actor: this.actor
        }),
        flavor: label
      });
    }

  }

  rollT20(roll, actor, templateData, criticoM = null) {
    let actorData = actor;
    // Render the roll.
    let template = 'systems/tormenta20/templates/chat/chat-card.html';
    let dmgroll = null;
    // GM rolls.
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

        // Check if there are dmg rolls and what critical math to use
        if (danoFormula) {
          if (result >= criticoM) {
            dmgroll = new Roll(`${critFormula}`);
          } else {
            dmgroll = new Roll(`${danoFormula}`);
          }
          dmgroll.roll();
          dmgroll.render().then(r => {
            templateData.rollDano = r;
          });

        }
        // Render it.

        roll.render().then(r => {
          templateData.roll = r;

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


}