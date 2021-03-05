import TraitSelector from "../apps/trait-selector.js";
import { T20Utility } from '../utility.js';
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";

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
			if (data.item.type == "magia") {
				data.data.actorCD = this.object.options.actor.data.data.attributes.cd ? this.object.options.actor.data.data.attributes.cd : 0 ;
			}
			else {
				data.data.actorCD = 10 + Math.floor(this.object.options.actor.data.data.attributes.nivel.value/2);
			}
			let atrRes = this.object.options.actor.data.data.atributos[data.data.atrRes]?.mod || 0; 
			data.data.totalCD = data.data.actorCD + atrRes + data.data.cd;
		}
		if (data.item.type == "arma") {
			// data.atkSkills = this.actor.data.items.filter(i => i.type == "skill" && i.data.groups.attack);

			if(data.data.atrAtq == undefined) {
				switch (data.data.pericia) {
					case "atu":
						data.data.atrAtq = "car";
						break;
					case "pon":
						data.data.atrAtq = "des";
						break;
					case "lut":
					default:
						data.data.atrAtq = "for";
				}
			}
			if(data.data.atqBns == "") data.data.atqBns = 0;
			if(data.data.danoBns == "") data.data.danoBns = 0;
			data["propriedades"] = this._getItemProperties(data.item);
			data["npc"] = this.object.options.actor?.data.type == "npc";
		}
		if (data.item.type == "classe") {
			data.isGM = game.user.isGM;
		}
		data["itemFisico"] = data.item.data.hasOwnProperty("qtd");
		if (data.item.data.hasOwnProperty("duracao")) {
			const unidade = data.item.data.duracao.unidade;
			const mostrarValorDuracao = unidade == "turno" ? true : unidade == "rodada" ? true : unidade == "outra" ? true : false;
			if (mostrarValorDuracao && Number(data.item.data.duracao.valor) > 1) {
				data["mostrarPluralDuracao"] = true;
			}
			data["mostrarValorDuracao"] = mostrarValorDuracao;
		}
		// Prepare Active Effects
		data.effects = prepareActiveEffectCategories(this.entity.effects);
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

			html.find(".effect-control").click(ev => {
				if ( this.item.isOwned ) return ui.notifications.warn("Alteração de Efeitos em itens possuidos por Personagens não é suportada atualmente.")
				onManageActiveEffect(ev, this.item)
			});
		}

		// Controle de Aprimoramentos
		html.find('.aprimoramento-create').click(this._onAprimoramentoCreate.bind(this));
		html.find('.aprimoramento-delete').click(this._onAprimoramentoDelete.bind(this));
		html.find('.aprimoramento-edit').click(this._onAprimoramentoEdit.bind(this));
		html.find('.aprimoramento-toggle').click(this._onAprimoramentoToggle.bind(this));
		html.find('.convert').click(this._onAprimoramentoToEffect.bind(this));
	}

	async _onAprimoramentoToEffect(event){
		event.preventDefault();
		let item = this.object;
		let effects = [];
		item.data.data.aprimoramentos.forEach(function(ap){
			let changes = [];
			let desc = ap.description.match(/[^.]+/i)[0].split(/\,|\se\s/);
			desc.forEach(function(d){
				let matches = d.match(/(alvo|alcance|duração|[a|á]rea|execução|resist[e|ê]ncia) para (.+)/);
				if ( matches ) changes.push({key:matches[1].slugify(),"mode":5,value: matches[2]});
			});

if (ap.tipo==="Aumenta" && ap.formula.match(/\+?(\d+d\d+\+?\d?)/i)) {
	changes.push({key:"roll","mode":0,value: ap.formula});
}
if (ap.tipo==="Muda" && ap.formula) {
	if (ap.formula == "-") ap.formula = "";
	let modo = ap.formula.match(/d\d+/i) ? 0 : 5;
	changes.push({key:"roll",mode:modo,value: ap.formula});
}
ap.description.match(/abalado|agarrado|alquebrado|apavorado|atordoado|ca[i|í]ido|cego|confuso|debilitado|desprevenido|doente|em chamas|enjoado|enredado|envenenado|esmorecido|exausto|fascinado|fatigado|fraco|frustrado|im[o|ó]vel|inconsciente|indefeso|lento|ofuscado|paralisado|pasmo|petrificado|sangrando|surdo|surpreendido|vulner[a|á]vel/gi)?.forEach(function(c){
			changes.push({key:"condicao","mode":0,value: c});
		})


			effects.push({
				label: ap.description.replace(/(\d)(o) círculo/,"$1º círculo"),
				icon: "icons/svg/upgrade.svg",
				origin: item.uuid,
				changes: changes,
				flags: { t20: { onuse: true, self: true, custo:ap.custo, aumenta: ap.tipo=="Aumenta" } },
				"duration.rounds": undefined,
				"duration.seconds": undefined,
				disabled: true,
				transfer: false
			});
		});
		await item.createEmbeddedEntity("ActiveEffect", effects);
	}

	async _createEffect(item, ap){
		return ActiveEffect.create({
				label: ap.description,
				icon: "icons/svg/upgrade.svg",
				origin: item.uuid,
				flags: { t20: { onuse: true, self: true, custo:ap.custo } },
				"duration.rounds": undefined,
				"duration.seconds": undefined,
				disabled: true,
				transfer: false
			}, item);
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
    const choices = skills.escolhas;
    const a = event.currentTarget;
    const label = a.parentElement;

    // Render the Trait Selector dialog
    new TraitSelector(this.item, {
      name: a.dataset.target,
      title: label.innerText,
      choices: Object.entries(CONFIG.T20.pericias).reduce((obj, e) => {
        if (choices[e[0]]) obj[e[0]] = e[1];
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
// C:/Users/victo/AppData/Local/FoundryVTT