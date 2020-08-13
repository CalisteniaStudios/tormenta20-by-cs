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
  async roll() {
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
      formula.atq = `1d20+ ${actorData.pericias[itemData.pericia].value} + ${itemData.bonusAtq}`;

      let atributoDano = itemData.atrDan != '0' ? actorData.atributos[itemData.atrDan].mod : 0;
      if (itemData.dano.match(/(\d*)d\d+/g)) {
        formula.dano = `${itemData.dano} + ${atributoDano} + ${itemData.bonusDano}`;
        let baseroll = itemData.dano.match(/(\d*)d\d+/g) ? itemData.dano.match(/(\d*)d\d+/g)[0] : '';
        let multiroll = itemData.dano.match(/(\d*)d\d+/g) ? (itemData.dano.match(/(\d*)d\d+/g)[0].split('d')[0]) * itemData.criticoX + 'd' + itemData.dano.match(/(\d*)d\d+/g)[0].split('d')[1] : '';
        let newdano = itemData.dano.replace(baseroll, multiroll);
        formula.crit = `${newdano} + ${atributoDano} + ${itemData.bonusDano}`;
        if (itemData.lancinante) {
          let lacinante = formula.crit.replace(/\s/g, '').replace(/(\b\d+\b)/g, "($& * " + itemData.criticoX + ")");
          formula.crit = `${lacinante}`;
        }

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
      formula = itemData.efeito;
      flavorText = item.name;
      spellHeader = {};
      spellHeader.tipo = itemData.tipo;
      spellHeader.circulo = itemData.circulo;
      spellHeader.escola = itemData.escola;
      spellHeader.custo = itemData.custo;
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
        details: detailText
      };

      if (itemData.custo > 0) {
        templateData.custo = itemData.custo;
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
      })
    };
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;

    // Handle dice rolls.
    let danoFormula = false;
    let critFormula = false;
    let rollArr = [];

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
        rollArr.push(roll);
        let result = roll._dice[0].rolls[0].roll;

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

          rollArr.push(dmgroll);
        }
        // Render it.

        roll.render().then(r => {
          templateData.roll = r;

          renderTemplate(template, templateData).then(content => {
            chatData.content = content;
            if (game.dice3d) {
              game.dice3d.showForRoll(rollArr, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));
              // game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));
              // game.dice3d.showForRoll(dmgroll, game.user, true, chatData.whisper, chatData.blind);
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