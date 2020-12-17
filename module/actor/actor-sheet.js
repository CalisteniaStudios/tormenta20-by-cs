import { T20Utility } from '../utility.js';
import ConjurarDialog from "../apps/conjurar-dialog.js";
import { prepRoll } from "../dice.js";
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class T20ActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tormenta20", "sheet", "actor"],
      // template: "systems/tormenta20/templates/actor/actor-sheet.html",
      width: 900,
      height: 600,
      tabs: [{
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "attributes"
      }]
    });
  }

  get template() {
    let layout = game.settings.get("tormenta20", "sheetTemplate");
    if(layout == 'base'){
      return "systems/tormenta20/templates/actor/actor-sheet-base.html" ;
    } else if(layout == 'tabbed') {
      return "systems/tormenta20/templates/actor/actor-sheet-tabbed.html";
    }
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
        "data.pericias.ofi.mais": []
      });
    }
    if (this.actor.data.data.periciasCustom === undefined) {
      this.actor.update({
        "data.periciasCustom": []
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
    if (this.actor.data.data.pericias.cur.st === true) {
      this.actor.update({
        "data.pericias.cur.st": false
      });
    }
    if (this.actor.data.data.pericias.jog.st === false) {
      this.actor.update({
        "data.pericias.jog.st": true
      });
    }
    if (this.actor.data.data.attributes.cd === undefined) {
      this.actor.update({
        "data.attributes.cd": 10 + Math.floor(this.actor.data.data.attributes.nivel.value / 2)
      });
    }
    if (this.actor.data.data.periciasCustom.constructor === Object){
      // console.log(this.actor.data.data.periciasCustom);
      let newPericiasCustom = [];
      for (let [pc, per] of Object.entries(this.actor.data.data.periciasCustom) ) {
        newPericiasCustom.push(per);
      }
      // this.actor.data.data.periciasCustom = newPericiasCustom;
      this.actor.update({"data.periciasCustom": newPericiasCustom});
    }
    if (this.actor.data.data.pericias.ofi.mais.constructor === Object){
      // console.log(this.actor.data.data.pericias.ofi.mais);
      let newOficios = [];
      for (let [pc, per] of Object.entries(this.actor.data.data.pericias.ofi.mais) ) {
        newOficios.push(per);
      }
      // this.actor.data.data.pericias.ofi.mais = newOficios;
      this.actor.update({"data.pericias.ofi.mais": newOficios});
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
      else if (i.type === 'equip' || i.type === 'arma' || i.type === 'consumivel' || i.type === 'tesouro') {
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
        if(i.data._bonusAtq == undefined || i.data._bonusAtq == ""){
          i.data._bonusAtq = "0";
        }
        if(i.data._bonusDano == undefined || i.data._bonusDano == ""){
          i.data._bonusDano = "0";
        }
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
  async _onUpdateItem(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const data = a.dataset;
    const actorData = this.actor.data.data;
    const itemId = $(a).parents('.item').attr('data-item-id');
    const item = this.actor.getOwnedItem(itemId);

    if (item) {
      let value = a.value;
      if(data.campo == "_bonusAtq"){
        item.update({
          "data._bonusAtq": value
        });
      } else if(data.campo == "_bonusDano"){
        item.update({
          "data._bonusDano": value
        });
      }
    }
    
    this.render();
  }

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
    
    html.find('.skill-tr').find('input,select').change(this._onPericiaCustomUpdate.bind(this));

    html.find('.skill-delete').click(this._onPericiaCustomDelete.bind(this));

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


    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Prepare spells
    html.find('.preparada').click(this._onPrepareSpell.bind(this));
    // Update item
    html.find('.upItem').change(this._onUpdateItem.bind(this));

    
    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        if (li.id === "atributo") return;
        if (!li.hasAttribute("data-item-id")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }


  /** @override */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("entity-link") ) return;

    // Create drag data
    const dragData = {
      actorId: this.actor.id,
      sceneId: this.actor.isToken ? canvas.scene?.id : null,
      tokenId: this.actor.isToken ? this.actor.token.id : null
    };

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData.type = "Item";
      dragData.data = item.data;
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData.type = "ActiveEffect";
      dragData.data = effect.data;
    }
    // Pericias
    if ( li.dataset.skill ) {
      let skill;
      if(li.dataset.ofi) {
        skill = this.actor.data.data.pericias["ofi"].mais[li.dataset.ofi];
        dragData.subtype = "oficios";
      } else if(li.dataset.custom) {
        skill = this.actor.data.data.periciasCustom[li.dataset.custom];
        dragData.subtype = "custom";
      } else {
        skill = this.actor.data.data.pericias[li.dataset.skill];
        dragData.subtype = "base";
      }
      dragData.type = "Pericia";
      dragData.data = skill;
      dragData.roll = li.dataset.roll;
    }
    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }


  /* -------------------------------------------- */
  _moveTooltips(event) {
    $(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
  }

  _toggleControls(event) {
    const target = event.currentTarget;
    const controls = $(target).closest('table').find('.skill-delete');
    const input = $(target).closest('table').find('.skill-outros');
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
  async _onPericiaCustomUpdate(event){
    let index = $(event.currentTarget).closest('.skill-tr')[0].dataset.itemId;
    let tipo = $(event.currentTarget).closest('.skill-tr')[0].dataset.skill;
    let inputs = $(event.currentTarget).closest('.skill-tr').find('input,textarea,select');
    let pericias;
    let sk;
    if(tipo == "oficios"){
      pericias = this.actor.data.data.pericias.ofi.mais;
      sk = this.actor.data.data.pericias.ofi.mais[index];
    } else if (tipo == "custom") {
      pericias = this.actor.data.data.periciasCustom;
      sk = this.actor.data.data.periciasCustom[index];
    }
    for (let inp of inputs){
      if(inp.name.match(/treinado/)!==null){
        sk.treinado = inp.checked;
      } else if(inp.name.match(/label/)!==null) {
        sk.label = inp.value;
      } else if(inp.name.match(/atributo/)!==null) {
        sk.atributo = inp.value;
      } else if(inp.name.match(/treino/)!==null) {
        sk.treino = inp.value;
      } else if(inp.name.match(/outros/)!==null) {
        sk.outros = inp.value;
      }
    }
    if(tipo == "oficios"){
      pericias[index] = sk;
      await this.actor.update({"data.pericias.ofi.mais":pericias});
    } else if (tipo == "custom") {
      pericias[index] = sk;
      await this.actor.update({"data.periciasCustom":pericias});
    }
  }
  async _onPericiaCustomDelete(event) {
    const id = event.currentTarget.dataset.itemId;
    const a = event.currentTarget;
    const tipo = a.dataset.tipo;
    let c = 0;
    if (tipo == 'oficios') {
      let oficios = this.actor.data.data.pericias.ofi.mais;
      oficios.splice(id,1);
      
      await this.actor.update({"data.pericias.ofi.mais": oficios });
    } else {
      let pericias = this.actor.data.data.periciasCustom;
      pericias.splice(id,1);

      await this.actor.update({"data.periciasCustom": pericias });
    }
    await this.render();
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
      let c = oficios.length;

      oficios.push(pericia);
      this.actor.update({
        "data.pericias.ofi.mais": oficios
      });
    } else {
      let c = periciasCustom.length;

      periciasCustom.push(pericia);
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
  async _onRoll(event, actor = null) {
    actor = !actor ? this.actor : actor;
    if (!actor.data) {
      return;
    }
    const a = event.currentTarget;
    const data = a.dataset;
    const actorData = actor.data.data;
    const itemId = $(a).parents('.item').attr('data-item-id');
    let item = {
        type: 'outros',
        roll: data.roll,
        label: data.label
      };
    if(itemId && ($(a).hasClass('magia-rollable') || $(a).hasClass('ataque-rollable') || $(a).hasClass('poder-rollable'))) {
      item = actor.getOwnedItem(itemId);
    } else if ($(a).hasClass('pericia-rollable')) {
      item = {
        type: 'pericia',
        roll: data.roll,
        label: data.label
      }
    } else if ($(a).hasClass('atributo-rollable')) {
      const atrnames = {'for': "Força", 'des': "Destreza", 'con': "Constituição", 'int': "Inteligência", 'sab': "Sabedoria", 'car': "Carisma"}
      item = {
        type: 'atributo',
        roll: data.roll,
        label: atrnames[data.label]
      }
    }
    await prepRoll(item, actor);

  }

}
