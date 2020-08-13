import {
  T20Utility
} from '../utility.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class T20ActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tormenta20", "sheet", "actor"],
      template: "systems/tormenta20/templates/actor/actor-sheet.html",
      width: 900,
      height: 600,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "attributes"
      }]
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

    // TODO Migrate function to initialize new json data;
    // console.log(this.actor.data.data.pericias.ofi.more);
    if (this.actor.data.data.pericias.ofi.mais === undefined) {
      this.actor.update({
        "data.pericias.ofi.mais": {}
      });
    }
    if (this.actor.data.data.periciasCustom === undefined) {
      this.actor.update({
        "data.periciasCustom": {}
      });
    }
    if (this.actor.data.data.armadura.equipado === undefined) {
      this.actor.update({
        "data.armadura.equipado": true
      });
    }
    if (this.actor.data.data.escudo.equipado === undefined) {
      this.actor.update({
        "data.escudo.equipado": true
      });
    }
    if (this.actor.data.data.pericias.atl.pda === true) {
      this.actor.update({
        "data.pericias.atl.pda": false
      });
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
      1: {
        spells: [],
        custo: 1
      },
      2: {
        spells: [],
        custo: 3
      },
      3: {
        spells: [],
        custo: 6
      },
      4: {
        spells: [],
        custo: 10
      },
      5: {
        spells: [],
        custo: 15
      }
    };

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    let x = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      // Sort into various arrays.
      if (i.type === 'poder') {
        poderes.push(i);
      } else if (i.type === 'magia') {
        if (i.data.circulo != undefined) {
          magias[i.data.circulo].spells.push(i);
        }
      }
      // If this is equipment, we currently lump it together.
      else if (i.type === 'equip') {
        equipamentos.push(i);
        // carga = [];
        // carga.push(i.peso);
        // carga.reduce((a,b) => a+b,0);
        // actorData.data.detalhes.carga = carga;
      } else if (i.type === 'ataque') {
        let tempatq = `${actorData.data.pericias[i.data.pericia].value} + ${i.data.bonusAtq}`;
        tempatq = tempatq.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '');
        // let tempdmg = `${i.data.dano} + ${actorData.data.atributos[i.data.atrDan].mod} + ${i.data.bonusDano}`;
        let tempdmg = '';
        tempdmg = i.data.dano != '' ? tempdmg + `${i.data.dano}` : tempdmg;
        tempdmg = i.data.atrDan != '0' && actorData.data.atributos[i.data.atrDan].mod != 0 ? tempdmg + `+ ${actorData.data.atributos[i.data.atrDan].mod}` : tempdmg;
        tempdmg = i.data.bonusDano != '' ? tempdmg + ` + ${i.data.bonusDano}` : tempdmg;
        tempdmg = tempdmg.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '');

        i.data.atq = (tempatq.match(/(\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1) + (b * 1), 0) + (tempatq.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '');

        i.data.dmg = (tempdmg.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '') + ((tempdmg.match(/(\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1 + b * 1 >= 0 ? '+' + (a * 1 + b * 1) : '' + (a * 1 + b * 1)), '') || '');



        ataques.push(i);
      }
    }

    // Assign and return powers
    actorData.poderes = poderes;
    // Spells
    actorData.magias = magias;
    // Equipment
    actorData.equipamentos = equipamentos;
    // Attacks
    actorData.ataques = ataques;

  }

  /**
   * Listen for click events on spells.
   * @param {MouseEvent} event
   */
  async _onPrepareSpell(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const data = a.dataset;
    const actorData = this.actor.data.data;
    const itemId = $(a).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);

    if (item) {
      let $self = $(a);

      let updatedItem = duplicate(item);
      updatedItem.data.preparada = !updatedItem.data.preparada;

      this.actor.updateOwnedItem(updatedItem);
      this.render();
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Tooltips TODO DEBUG
    html.mousemove(ev => this._moveTooltips(ev));

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add pericias/oficios
    html.find('.pericia-create').click(this._onPericiaCustomCreate.bind(this));
    html.find('.oficios-create').click(this._onPericiaCustomCreate.bind(this));

    html.find('.show-controls').click(this._toggleControls.bind(this));

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
    html.find('.skill-delete').click(ev => {
      const t = $(ev.currentTarget);
      const l = ev.currentTarget.dataset.itemId;
      const tipo = ev.currentTarget.dataset.tipo;
      if (tipo == "oficios") {
        // console.log("apagando oficios");
        delete this.actor.data.data.pericias.ofi.mais[l];
      } else {
        // console.log("apagando custom");
        delete this.actor.data.data.periciasCustom[l];
      }

      this.render();
    });


    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Prepare spells
    html.find('.preparada').click(this._onPrepareSpell.bind(this));

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

  /* -------------------------------------------- */
  _moveTooltips(event) {
    $(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
  }

  _toggleControls(event) {
    const target = event.currentTarget;
    const controls = $(target).closest('table').find('.skill-delete');
    const input = $(target).closest('table').find('.skill-outros');
    console.log($(target).closest('table').find('.skill-tr'));
    console.log($(target).closest('table').find('.skill-tr'));
    if ($(target).hasClass('ativo')) {
      $(controls).css('display', 'none');
      $(input).css('display', 'inline');
      $(target).removeClass('ativo');

    } else {
      $(controls).css('display', 'inline');
      $(input).css('display', 'none');
      $(target).addClass('ativo');
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onPericiaCustomCreate(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const tipo = a.dataset.tipo;
    const pericia = {
      label: "",
      nome: "",
      value: 0,
      atributo: "for",
      st: false,
      pda: false,
      treinado: false,
      treino: 0,
      outros: 0,
      mod: 0
    };

    let actorData = duplicate(this.actor);
    let oficios = actorData.data.pericias.ofi.mais;
    let periciasCustom = actorData.data.periciasCustom;


    if (tipo == 'oficio') {
      pericia.label = "Oficio";
      pericia.atributo = 'int';
      let c = Object.keys(this.actor.data.data.pericias.ofi.mais).length;

      oficios[c] = pericia;

      this.actor.update({
        "data.pericias.ofi.mais": oficios
      });
    } else {
      let c = Object.keys(this.actor.data.data.periciasCustom).length;

      periciasCustom[c] = pericia;

      this.actor.update({
        "data.periciasCustom": periciasCustom
      });
      // this.actor.data.data.periciasCustom[] = pericia;
    }

    this.render();
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
   * Create skills as items?
   */
  // _CreateDefaultSkill(){
  //   const pericias = T20Utility.getPericias();

  //   const itemData = {
  //     name: 
  //   }
  // }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event, actor = null) {
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
    let danoText = null;

    // Handle rolls coming directly from the ability score.  && data.mod
    if ($(a).hasClass('poder-rollable')) {
      formula = `${item.data.data.roll}`;
      flavorText = item.name;
      detailText = item.data.data.description.replace("\n", "<br/>");

      templateData = {
        title: flavorText,
        details: detailText
      };
      if (item.data.data.custo > 0) {
        templateData.custo = item.data.data.custo;
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

      let atributoDano = item.data.data.atrDan != '0' ? actorData.atributos[item.data.data.atrDan].mod : 0;
      if (item.data.data.dano.match(/(\d*)d\d+/g)) {
        formula.dano = `${item.data.data.dano} + ${atributoDano} + ${item.data.data.bonusDano}`;
        let baseroll = item.data.data.dano.match(/(\d*)d\d+/g) ? item.data.data.dano.match(/(\d*)d\d+/g)[0] : '';
        let multiroll = item.data.data.dano.match(/(\d*)d\d+/g) ? (item.data.data.dano.match(/(\d*)d\d+/g)[0].split('d')[0]) * item.data.data.criticoX + 'd' + item.data.data.dano.match(/(\d*)d\d+/g)[0].split('d')[1] : '';
        let newdano = item.data.data.dano.replace(baseroll, multiroll);
        formula.crit = `${newdano} + ${atributoDano} + ${item.data.data.bonusDano}`;
        if (item.data.data.lancinante) {
          let lacinante = formula.crit.replace(/\s/g, '').replace(/(\b\d+\b)/g, "($& * " + item.data.data.criticoX + ")");
          formula.crit = `${lacinante}`;
        }

      } else {
        formula.dano = null;
        formula.crit = null;
      }

      flavorText = item.name;
      detailText = item.data.data.description;

      flavorDesc = ""
      flavorDesc += actorData.pericias[item.data.data.pericia].value > 0 ? "(" + actorData.pericias[item.data.data.pericia].label + " +" + actorData.pericias[item.data.data.pericia].value + ")" : "";
      flavorDesc += item.data.data.bonusAtq > 0 ? " + (Bonus Ataque +" + item.data.data.bonusAtq + ")" : "";

      danoText = '';
      danoText += item.data.data.atrDan != '0' ? "(" + item.data.data.atrDan + " +" + atributoDano + ")" : "";
      danoText += item.data.data.bonusDano > 0 ? " + (Bonus Dano +" + item.data.data.bonusDano + ")" : "";

      templateData = {
        title: flavorText,
        flavor: flavorDesc,
        danosDesc: danoText,
        details: detailText
      };

      if (item.data.data.custo > 0) {
        templateData.custo = item.data.data.custo;
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

      if (item.data.data.custo > 0) {
        templateData.custo = item.data.data.custo;
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
  rollMove(roll, actor, dataset, templateData, criticoM = null) {
    let actorData = actor.data.data;
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