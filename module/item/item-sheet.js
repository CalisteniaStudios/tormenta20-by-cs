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
      width: 620,
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
    // console.log(this.object.options.actor);
    if (data.item.type == "magia" && this.object.options.actor != undefined) {
      data.data.actorCD = this.object.options.actor.data.data.attributes.cd >0 ? this.object.options.actor.data.data.attributes.cd : 0 ;
      data.data.totalCD = data.data.actorCD+data.data.cd;
    }
    if (data.item.type == "ataque") {
      data.data.dano = data.data.dano + (data.data.bonusDano != ""? "+"+data.data.bonusDano : "");
      data.data.dano = data.data.dano.replace("+undefined","");
      if(data.data._bonusAtq == ""){
        data.data._bonusAtq = "0";
      }
      if(data.data._bonusDano == ""){
        data.data._bonusDano = "0";
      }
      for (let i of this.object.options.actor.items) {
        if(i.type == "arma"){
          data.armas.push(i);
        }
      }
    }
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
    // Tooltips TODO DEBUG
    html.mousemove(ev => this._moveTooltips(ev));
    // Roll handlers, click handlers, etc. would go here.
    
    html.find('.selArma').change(this._getDataArma.bind(this));


    // Controle de Aprimoramentos
    html.find('.aprimoramento-create').click(this._onAprimoramentoCreate.bind(this));
    html.find('.aprimoramento-delete').click(this._onAprimoramentoDelete.bind(this));
    html.find('.aprimoramento').find('input,textarea,select').change(this._onAprimoramentoUpdate.bind(this));
  }
  _moveTooltips(event) {
    $(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
  }
  async _onAprimoramentoUpdate(event){
    let index = $(event.currentTarget).closest('li')[0].dataset.itemId;
    let data = "data.aprimoramentos."+index;
    let inputs = $(event.currentTarget).closest('li').find('input,textarea,select');
    
    let aprimoramentos = this.item.data.data.aprimoramentos;
    let ap = this.item.data.data.aprimoramentos[index];
    for (let inp of inputs){
      if(inp.name.match(/custo/)!==null){
        ap.custo = inp.value;
      } else if(inp.name.match(/tipo/)!==null) {
        ap.tipo = inp.value;
      } else if(inp.name.match(/formula/)!==null) {
        ap.formula = inp.value;
      } else if(inp.name.match(/description/)!==null) {
        ap.description = inp.value;
      }
    }
    aprimoramentos[index] = ap;
    await this.item.update({"data.aprimoramentos":aprimoramentos});
  }
  async _onAprimoramentoDelete(event) {
    const id = event.currentTarget.dataset.id;
    let aprimoramentos = this.item.data.data.aprimoramentos;
    aprimoramentos.pop(id);
    await this.item.update({"data.aprimoramentos":aprimoramentos});
  }
  _onAprimoramentoCreate(event) {
    event.preventDefault();

    const a = event.currentTarget;
    const tipo = a.dataset.tipo;
    const aprimoramento = {
          custo: "0",
          tipo: "Truque",
          formula: "",
          description: ""
        };

    let itemData = duplicate(this.item);
    if(!itemData.data.aprimoramentos){
      itemData.data.aprimoramentos = [];
    }
    let aprimoramentos = itemData.data.aprimoramentos;

    let c = itemData.data.aprimoramentos.length;
    aprimoramentos.push(aprimoramento);
    // aprimoramentos[c] = aprimoramento;
    
    this.item.update({"data.aprimoramentos": aprimoramentos});
    // this.actor.data.data.periciasCustom[] = pericia;
    this.render();
  }

  _getDataArma(event){
    let arma = $(event.target).find("option:selected")[0];
    let dados = $(arma)[0].dataset;
    let i = $(arma)[0].value;
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
