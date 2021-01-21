import TraitSelector from "../apps/trait-selector.js";
import { T20Utility } from '../utility.js';
/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/
export default class ItemSheetT20 extends ItemSheet {

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
		if (this.item.data.type == "consumivel" || this.item.data.type == "tesouro") {
			return `${path}/item-sheet.html`;
		}
		else if (this.item.data.type == "armadura") {
			return `${path}/equip-sheet.html`;
		}
		return `${path}/${this.item.data.type}-sheet.html`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const data = super.getData();
		data.atkSkills = [];
		data.config = CONFIG.T20;
		if (data.item.data.hasOwnProperty("resistencia") && this.object.options.actor != undefined) {
			data.data.actorCD = this.object.options.actor.data.data.attributes.cd > 0 ? this.object.options.actor.data.data.attributes.cd : 0 ;
			let atrRes = this.object.options.actor.data.data.atributos[data.data.atrRes]?.mod || 0; 
			data.data.totalCD = data.data.actorCD + atrRes + data.data.cd;
		}
		if (data.item.type == "arma") {
			// data.atkSkills = this.actor.data.items.filter(i => i.type == "skill" && i.data.groups.attack);

			if(data.data.atqBns == "") data.data.atqBns = 0;
			if(data.data.danoBns == "") data.data.danoBns = 0;
			data["propriedades"] = this._getItemProperties(data.item);
		}
		data["itemFisico"] = data.item.data.hasOwnProperty("qtd");
		if (data.item.data.hasOwnProperty("ativacao")) {
			data["temAtivacao"] = data.item.data.ativacao.execucao != "";
		}
		if (data.item.data.hasOwnProperty("duracao")) {
			const unidade = data.item.data.duracao.unidade;
			const mostrarValorDuracao = unidade == "turno" ? true : unidade == "rodada" ? true : unidade == "outra" ? true : false;
			if (mostrarValorDuracao && Number(data.item.data.duracao.valor) > 1) {
				data["mostrarPluralDuracao"] = true;
			}
			data["mostrarValorDuracao"] = mostrarValorDuracao;
		}
		return data;
	}

	  /**
	 * Get the Array of item properties which are used in the small sidebar of the description tab
	 * @return {Array}
	 * @private
	 */
	_getItemProperties(item) {
		const props = [];
		const labels = this.item.labels;

		if ( item.type === "arma" ) {
		props.push(...Object.entries(item.data.propriedades)
			.filter(e => e[1] === true)
			.map(e => CONFIG.T20.weaponProperties[e[0]]));
		}
		return props.filter(p => !!p);
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

		//html.find('.selArma').change(this._getDataArma.bind(this));
		if ( this.isEditable ) {
      html.find('.trait-selector.class-skills').click(this._onConfigureClassSkills.bind(this));
    }

		// Controle de Aprimoramentos
		html.find('.aprimoramento-create').click(this._onAprimoramentoCreate.bind(this));
		html.find('.aprimoramento-delete').click(this._onAprimoramentoDelete.bind(this));
		html.find('.aprimoramento-edit').click(this._onAprimoramentoEdit.bind(this));
		html.find('.aprimoramento-toggle').click(this._onAprimoramentoToggle.bind(this));
	}

	/* -------------------------------------------- */

	_moveTooltips(event) {
		$(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
	}

	/* -------------------------------------------- */

	async _onAprimoramentoCreate(event){
		event.preventDefault();
		const target = $(event.currentTarget);

		this.item.addAprimoramento({
			description: "Novo Aprimoramento"
		});
	}

	/* -------------------------------------------- */

	async _onAprimoramentoDelete(event){
		event.preventDefault();
		const target = $(event.currentTarget);
		const aprimoramentoId = target.closest('.item.aprimoramento').data('itemId');
		await this.item.deleteAprimoramento(aprimoramentoId);
	}

	/* -------------------------------------------- */

	async _onAprimoramentoEdit(event){
		event.preventDefault();

		const target = $(event.currentTarget);
		const aprimoramentoId = target.closest('.item.aprimoramento').data('itemId');

		this.item.editAprimoramento(aprimoramentoId);
	}

	/* -------------------------------------------- */

	async _onAprimoramentoToggle(event){
		event.preventDefault();
		const target = $(event.currentTarget);
		const aprimoramentoId = target.closest('.item.aprimoramento').data('itemId');

		const aprimoramentos = duplicate(this.item.data.data.aprimoramentos);
		const aprimoramento = aprimoramentos.find(mod => mod.id === aprimoramentoId);
		aprimoramento.ativo = !aprimoramento.ativo;

		await this.item.update({'data.aprimoramentos': aprimoramentos});
	}

  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
  _onConfigureClassSkills(event) {
    event.preventDefault();
    const skills = this.item.data.data.pericias;
    const choices = skills.escolhas && skills.escolhas.length ? skills.escolhas : Object.keys(CONFIG.T20.pericias);
    const a = event.currentTarget;
    const label = a.parentElement;

    // Render the Trait Selector dialog
    new TraitSelector(this.item, {
      name: a.dataset.target,
      title: label.innerText,
      choices: Object.entries(CONFIG.T20.pericias).reduce((obj, e) => {
        if ( choices.includes(e[0] ) ) obj[e[0]] = e[1]; //.label;
        return obj;
      }, {}),
      minimum: skills.numero,
      maximum: skills.numero
    }).render(true)
  }
	
	/* -------------------------------------------- */

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
		this.render();
	}
}
