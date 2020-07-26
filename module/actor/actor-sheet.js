/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class tormenta20ActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tormenta20", "sheet", "actor"],
      template: "systems/tormenta20/templates/actor/actor-sheet.html",
      width: 900,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    // for (let attr of Object.values(data.data.attributes)) {
    //   attr.isCheckbox = attr.dtype === "Boolean";
    // }

    // Prepare items.
    if (this.actor.data.type == 'character') {
      this._prepareCharacterItems(data);
    }

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const poderes = [];
    const equipamentos = [];
    const ataques = [];
    const magias = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // If this is a move, sort into various arrays.
      if (i.type === 'poder') {
        poderes.push(i);
      }
      else if (i.type === 'magia') {
        if (i.data.circulo != undefined) {
          magias[i.data.circulo].push(i);
        }
      }
      // If this is equipment, we currently lump it together.
      else if (i.type === 'equip') {
        equipamentos.push(i);
      }
      else if (i.type === 'ataque') {
        // console.log(i);
        // console.log(actorData);
        let tempatq = `${actorData.data.pericias[i.data.pericia].value} + ${i.data.bonusAtq}`;
        let tempdmg = `${i.data.dano} + ${actorData.data.atributos[i.data.atrDan].mod} + ${i.data.bonusDano}`;
        // console.log(tempatq);
        // console.log(tempdmg);
        i.data.atq = (tempatq.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').match(/(\b[\+\-]?\d+\b)/g)||[]).reduce((a, b) => (a*1) + (b*1), 0) + (tempatq.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').match(/([\+\-]?\d+d\d+\b)/g)||[]).reduce((a, b) => a + b, '');
        i.data.dmg = (tempdmg.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').match(/([\+\-]?\d+d\d+\b)/g)||[]).reduce((a, b) => a + b, '') +((tempdmg.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').match(/(\b[\+\-]?\d+\b)/g)||[]).reduce((a, b) => '+'+(a*1) + (b*1), '') || '');

        // console.log(i.data.atq);
        // console.log(i.data.dmg);
        ataques.push(i);
      }
    }

    // Assign and return
    actorData.poderes = poderes;
    // Spells
    actorData.magias = magias;
    // Equipment
    actorData.equipamentos = equipamentos;
    // Bonds
    actorData.ataques = ataques;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragItemStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `Novo ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }


  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event, actor = null) {
    /*
      event.preventDefault();
      const element = event.currentTarget;
      const dataset = element.dataset;
      let template = 'systems/tormenta20/templates/chat/chat-move.html';

      if (dataset.roll) {
        let roll = new Roll(dataset.roll, this.actor.data.data);
        let label = dataset.label ? `Rolando ${dataset.label}` : '';
        roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label
        });
      }
    */

    actor = !actor ? this.actor : actor;

    // Initialize variables.
    event.preventDefault();

    if (!actor.data) {
      return;
    }
    const a = event.currentTarget;
    const data = a.dataset;
    const actorData = actor.data.data;
    const itemId = $(a).parents('.item').attr('data-item-id');
    const item = actor.getOwnedItem(itemId);
    let formula = null;
    let titleText = null;
    let flavorText = null;
    let flavorDesc = null;
    let detailText = null;
    let danoFormula = null;
    let spellHeader = null;
    let templateData = {};

    // Handle rolls coming directly from the ability score.  && data.mod
    if ($(a).hasClass('poder-rollable')) {
      formula = `${item.data.data.roll}`;
      flavorText = item.name;
      detailText = item.data.data.description.replace("\n", "<br/>");

      templateData = {
        title: flavorText,
        details: detailText
      };
      if(item.data.data.custo > 0){
        templateData.custo  = item.data.data.custo;
      }
      this.rollMove(formula, actor, data, templateData);
    } else if ($(a).hasClass('atributo-rollable')) {
      formula = data.roll;
      flavorText = data.label.toUpperCase();

      templateData = {
        title: flavorText,
      };
      
      this.rollMove(formula, actor, data, templateData);
    
    } else if ($(a).hasClass('pericia-rollable')) {
      formula = data.roll;
      flavorText = data.label;

      templateData = {
        title: flavorText,
      };
      
      this.rollMove(formula, actor, data, templateData);
    
    } else if ($(a).hasClass('ataque-rollable')) {
      formula = {};
      formula.atq = `1d20+ ${actorData.pericias[item.data.data.pericia].value} + ${item.data.data.bonusAtq}`;
      formula.dano = `${item.data.data.dano} + ${actorData.atributos[item.data.data.atrDan].mod} + ${item.data.data.bonusDano}`;
      let baseroll = item.data.data.dano.match(/(\d*)d\d+/g)[0];
      let multiroll = (item.data.data.dano.match(/(\d*)d\d+/g)[0].split('d')[0]) * item.data.data.criticoX + 'd' + item.data.data.dano.match(/(\d*)d\d+/g)[0].split('d')[1];
      let newdano = item.data.data.dano.replace(baseroll, multiroll);
      formula.crit = `${newdano} + ${actorData.atributos[item.data.data.atrDan].mod} + ${item.data.data.bonusDano}`;
      console.log(item.data.data.lancinante);
      if(item.data.data.lancinante) {
        let lacinante = formula.crit.replace(/\s/g, '').replace(/(\b\d+\b)/g, "($& * "+item.data.data.criticoX+")");
        formula.crit = `${lacinante}`;

      }
      flavorText = item.name;
      detailText = item.data.data.description;

      templateData = {
        title: flavorText,
        flavor: flavorDesc,
        details: detailText
      };
      if(item.data.data.custo > 0){
        templateData.custo  = item.data.data.custo;
      }
      this.rollMove(formula, actor, data, templateData, item.data.data.criticoM);
    
    } else if ($(a).hasClass('magia-rollable')) {
      formula = item.data.data.efeito;
      flavorText = item.name;
      spellHeader = {};
      spellHeader.tipo = item.data.data.tipo;
      spellHeader.circulo = item.data.data.circulo;
      spellHeader.escola = item.data.data.escola;
      spellHeader.custo = item.data.data.custo;
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
        details: detailText
      };

      if(item.data.data.custo > 0){
        templateData.custo  = item.data.data.custo;
      }
      this.rollMove(formula, actor, data, templateData);
    
    } else if (itemId != undefined) {
      data.roll();
    }
  }

  /**
   * Roll using the chat card template.
   * @param {Object} templateData
   */
  rollMove(roll, actor, dataset, templateData, criticoM=null) {
    let actorData = actor.data.data;
    // Render the roll.
    let template = 'systems/tormenta20/templates/chat/chat-card.html';
    let dmgroll = null;
    // GM rolls.
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: actor })
    };
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM");
    if (rollMode === "selfroll") chatData["whisper"] = [game.user._id];
    if (rollMode === "blindroll") chatData["blind"] = true;
    
    // Handle dice rolls.
    let danoFormula = false;
    let critFormula = false;
    
    if(typeof roll === 'object'){
      // remove signs from end of sting
      danoFormula = roll.dano.trim().replace(/([\+\-]+$)/g, '');
      critFormula = roll.crit.trim().replace(/([\+\-]+$)/g, '');
      roll = roll.atq.trim().replace(/([\+\-]+$)/g, '');
    }

    if (roll) {
      // Roll can be either a formula like `2d6+3` or a raw stat like `str`.
      let formula = '';
      
      if (roll.match(/(\d*)d\d+/g)) {
        
        formula = roll;
      }

      if (formula != null) {
        // Do the roll.
        let roll = new Roll(`${formula}`);
        roll.roll();
        let result = roll._dice[0].rolls[0].roll;

        // Check if there are dmg rolls and what critical math to use
        if(danoFormula){
          if(result >= criticoM){
            dmgroll = new Roll(`${critFormula}`);
          } else {
            dmgroll = new Roll(`${danoFormula}`);
          }
          dmgroll.roll();
          dmgroll.render().then(r => {
            templateData.rollDano = r;
            if (game.dice3d) {
              game.dice3d.showForRoll(dmgroll, game.user, true, chatData.whisper, chatData.blind);
            }
            else {
              chatData.sound = CONFIG.sounds.dice;
            }
          });
        }
        // Render it.
        roll.render().then(r => {
          templateData.roll = r;
          renderTemplate(template, templateData).then(content => {
            chatData.content = content;
            if (game.dice3d) {
              game.dice3d.showForRoll(roll, game.user, true, chatData.whisper, chatData.blind).then(displayed => ChatMessage.create(chatData));
            }
            else {
              chatData.sound = CONFIG.sounds.dice;
              ChatMessage.create(chatData);
            }
          });
        });
      }
    }
    else {
      renderTemplate(template, templateData).then(content => {
        chatData.content = content;
        ChatMessage.create(chatData);
      });
    }
  }

}
