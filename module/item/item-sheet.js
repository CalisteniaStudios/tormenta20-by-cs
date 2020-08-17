import { T20Utility } from '../utility.js';
/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class T20ItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["tormenta20", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/tormenta20/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    if (this.item.data.type == "arma" || this.item.data.type == "consumivel" || this.item.data.type == "tesouro") {
      return `${path}/equip-sheet.html`;
    }
    return `${path}/${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.armas = [];
    console.log(data);
    // console.log(this.object.options.actor);
    if (data.item.type == "magia") {
      data.data.actorCD = this.object.options.actor.data.data.attributes.cd >0 ? this.object.options.actor.data.data.attributes.cd : 0 ;
      data.data.totalCD = data.data.actorCD+data.data.cd;
      console.log(data);
    }
    if (data.item.type == "ataque") {
      data.data.dano = data.data.dano + (data.data.bonusDano != ""? "+"+data.data.bonusDano : "");
      data.data.dano = data.data.dano.replace("+undefined","");
      console.log("KAKAK");
      console.log(data.data._bonusAtq == "");
      if(data.data._bonusAtq == ""){
        data.data._bonusAtq = "0";
      }
      console.log(data.data._bonusAtq);
      if(data.data._bonusDano == ""){
        data.data._bonusDano = "0";
      }
      for (let i of this.object.options.actor.items) {
        if(i.type == "arma"){
          data.armas.push(i);
        }
      }
    }
    console.log(data);
    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
    
    html.find('.selArma').change(this._getDataArama.bind(this));
    // (ev => {
      // console.log(this);
      // const li = $(ev.currentTarget).parents(".item");
      // this.actor.deleteOwnedItem(li.data("itemId"));
      // li.slideUp(200, () => this.render(false));
    // });
  }

  _getDataArama(event){
    let arma = $(event.target).find("option:selected")[0];
    let dados = $(arma)[0].dataset;
    let i = $(arma)[0].value;
    console.log(dados);
    console.log($(arma)[0].value);
    console.log(this.item);
    this.item.update({
      "data.arma": i,
      "data.dano": dados.dano,
      "data.bonusAtq": dados.atqbns,
      "data.criticoM": dados.criticom,
      "data.criticoX": dados.criticox,
      "data.lancinante": (dados.lancinante == "true"? true : false),
      "data.tipo": dados.tipo,
      "data.alcance": dados.alcance,
      "data.municao": dados.municao
    });
    /*
      "data.dano": (dados.dano!=""?dados.dano : data.dano),
      "data.bonusAtq": (dados.atqbns!=""?dados.atqbns : data.atqbns),
      "data.criticoM": (dados.criticoM!=""?dados.criticoM : data.criticoM),
      "data.criticoX": (dados.criticoX!=""?dados.criticoX : data.criticoX),
      "data.lancinante": (dados.lancinante!=""?dados.lancinante : data.lancinante),
      "data.tipo": (dados.tipo!=""?dados.tipo : data.tipo),
      "data.alcance": (dados.alcance!=""?dados.alcance : data.alcance),
      "data.municao": (dados.municao!=""?dados.municao : data.municao)
    */
    this.render();
  }
}
