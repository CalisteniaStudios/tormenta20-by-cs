import { prepRoll } from "../../dice.js";
import { T20Utility } from '../../utility.js';
import ActorSheetT20 from "./base.js";
/**
 * An Actor sheet for NPC type characters.
 * Extends the base ActorSheetT20 class.
 * @extends {ActorSheetT20}
 */
export default class ActorSheetT20NPC extends ActorSheetT20 {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "npc"],
			template: "systems/tormenta20/templates/actor/npc-sheet.html",
			width: 500,
			height: 700
		});
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		const sheetData = super.getData();
		// FLAGS
		sheetData["statblock"] = this.actor.data.flags.editing ? "statfields" : "";
		sheetData["editing"] = this.actor.data.flags.editing;
		
		// data.teste = false;
		// TODO find something to do here
		// parse ND?

		return sheetData;
	}

	/* -------------------------------------------- */

	/**
	* Organize Owned Items for rendering the NPC sheet
	* @private
	*/

	_prepareItems(data) {
		const actorData = data.actor;

		// Initialize containers.
		const poderes = [];
		const equipamentos = [];
		const ataques = [];
		const armas = [];
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
		let temMagias = false;
		for (let i of data.items) {
			let item = i.data;
			i.img = i.img || DEFAULT_TOKEN;
			// Sort into various arrays.
			if (i.type === 'poder') {
				poderes.push(i);
			}
			else if (i.type === 'magia') {
				if (i.data.circulo != undefined) {
					magias[i.data.circulo].spells.push(i);
					temMagias = true;
				}
			}
			// If this is equipment, we currently lump it together.
			else if (i.type === 'equip') {
				equipamentos.push(i);
				// carga = [];
				// carga.push(i.peso);
				// carga.reduce((a,b) => a+b,0);
				// actorData.data.detalhes.carga = carga;
			} else if (i.type === 'arma') {
				let tempatq = `${actorData.data.pericias[i.data.pericia].value} + ${i.data.atqBns}`;
				tempatq = tempatq.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').replace(/\@\w+\b/g, function (match) {
					return "(" + T20Utility.short(match, actorData.data) + ")";
				});
				let tempdmg = '';
				tempdmg = i.data.dano != '' ? tempdmg + `${i.data.dano}` : tempdmg;
				tempdmg = i.data.atrDan != '0' && actorData.data.atributos[i.data.atrDan].mod != 0 ? tempdmg + `+ ${actorData.data.atributos[i.data.atrDan].mod}` : tempdmg;
				tempdmg = i.data.danoBns != '' ? tempdmg + ` + ${i.data.danoBns}` : tempdmg;
				tempdmg = tempdmg.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '').replace(/\@\w+\b/g, function (match) {
					return "(" + T20Utility.short(match, actorData.data) + ")";
				});

				i.data.atq = (tempatq.match(/(\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1) + (b * 1), 0) + (tempatq.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '');

				i.data.dmg = (tempdmg.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '') + ((tempdmg.match(/(\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1 + b * 1 >= 0 ? '+' + (a * 1 + b * 1) : '' + (a * 1 + b * 1)), '') || '');
				armas.push(i);
			} else if (i.type === 'ataque') {
				let tempatq = `${i.data.bonusAtq}`;
				tempatq = tempatq.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '');
				// let tempdmg = `${i.data.dano} + ${actorData.data.atributos[i.data.atrDan].mod} + ${i.data.bonusDano}`;
				let tempdmg = '';
				if(i.data._bonusAtq == undefined || i.data._bonusAtq == ""){
					i.data._bonusAtq = "0";
				}

				if(i.data._bonusDano == undefined || i.data._bonusDano == ""){
					i.data._bonusDano = "0";
				}
				tempdmg = i.data.dano !='' ? tempdmg+`${i.data.dano}` : tempdmg;
				tempdmg = i.data.atrDan != '0' && actorData.data.atributos[i.data.atrDan].mod != 0 ? tempdmg+`+ ${actorData.data.atributos[i.data.atrDan].mod}` : tempdmg;
				tempdmg = i.data.bonusDano!='' ? tempdmg+` + ${i.data.bonusDano}` : tempdmg;
				tempdmg = tempdmg.replace(/(\s)/g, '').replace(/\b[\+\-]?0+\b/g, '').replace(/[\+\-]$/g, '');

				i.data.atq = (tempatq.match(/(\b[\+\-]?\d+\b)/g)||[]).reduce((a, b) => (a*1) + (b*1), 0) + (tempatq.match(/([\+\-]?\d+d\d+\b)/g)||[]).reduce((a, b) => a + b, '');

				i.data.dmg = (tempdmg.match(/([\+\-]?\d+d\d+\b)/g)||[]).reduce((a, b) => a + b, '') +((tempdmg.match(/(\b[\+\-]?\d+\b)/g)||[]).reduce((a, b) => (a*1+b*1>=0 ? '+'+(a*1+b*1) : ''+(a*1+b*1)), '') || '');



				ataques.push(i);
			}
		}

		// Assign and return powers
		actorData.poderes = poderes.length ? poderes : null;
		// Spells
		actorData.magias = temMagias ? magias : null;
		// Equipment
		actorData.equipamentos = equipamentos;
		// Attacks
		actorData.ataques = ataques.length ? ataques : null;
		actorData.armas = armas.length ? armas : null;
	}



	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// // Tooltips TODO DEBUG
		// html.mousemove(ev => this._moveTooltips(ev));

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if(this.object.data.flags.editing){
			html.find('.npc-line').addClass("flexrow");
		} else {
			html.find('.npc-line').removeClass("flexrow");
		}
		html.find('.magia-rollable').on("contextmenu", this._onItemEdit.bind(this));
		html.find('.arma-rollable').on("contextmenu", this._onItemEdit.bind(this));
		html.find('.poder-rollable').on("contextmenu", this._onItemEdit.bind(this));
		// if ( this.actor.owner ) {
		// 	html.find('.rollable').each((i, el) => el.setAttribute("draggable", true));
		// } else {
		// 	html.find('.rollable').each((i, el) => el.removeAttribute("draggable"));
		// }

		// Drag events for macros.
		let handler = ev => this._onDragStart(ev);
		html.find('.pericia-rollable').each((i, li) => {
			// if (li.classList.contains("inventory-header")) return;
			// if (li.id === "atributo") return;
			if (!li.hasAttribute("data-item-id")) return;
			if (!li.hasAttribute("data-type")) return;
			li.setAttribute("draggable", true);
			li.addEventListener("dragstart", handler, false);
		});

	}

	/* -------------------------------------------- */

	/** @override */
	// _onDragStart(event) {
	// 	const li = event.currentTarget;
	// 	if ( event.target.classList.contains("entity-link") ) return;

	// 	// Create drag data
	// 	const dragData = {
	// 		actorId: this.actor.id,
	// 		sceneId: this.actor.isToken ? canvas.scene?.id : null,
	// 		tokenId: this.actor.isToken ? this.actor.token.id : null
	// 	};

	// 	// Owned Items
	// 	if ( li.dataset.itemId ) {
	// 		const item = this.actor.items.get(li.dataset.itemId);
	// 		dragData.type = "Item";
	// 		dragData.data = item.data;
	// 	}

	// 	// Active Effect
	// 	if ( li.dataset.effectId ) {
	// 		const effect = this.actor.effects.get(li.dataset.effectId);
	// 		dragData.type = "ActiveEffect";
	// 		dragData.data = effect.data;
	// 	}
	// 	// Template Skills
	// 	if ( li.dataset.skill ) {
	// 		let skill;
	// 		if(li.dataset.ofi) {
	// 			skill = this.actor.data.data.pericias["ofi"].mais[li.dataset.ofi];
	// 			dragData.subtype = "oficios";
	// 		} else if(li.dataset.custom) {
	// 			skill = this.actor.data.data.periciasCustom[li.dataset.custom];
	// 			dragData.subtype = "custom";
	// 		} else {
	// 			skill = this.actor.data.data.pericias[li.dataset.skill];
	// 		}
	// 		dragData.type = "Pericia";
	// 		dragData.data = skill;
	// 		dragData.roll = li.dataset.roll;
	// 	}
	// 	// Set data transfer
	// 	event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	// }

	/* -------------------------------------------- */

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
	* Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	* @private
	*/
	async _onRoll(event, actor = null) {
		actor = !actor ? this.actor : actor;
		if (!actor.data) {
			return;
		}
		const actorData = actor.data.data;
		const a = event.currentTarget;
		const data = a.dataset;
		const id = a.dataset.itemId;
		let item = {};
		if($(a).hasClass('atributo-rollable') && Object.keys(actorData.atributos).includes(id)){
			item.type = "atributo";
			item.roll = "1d20 +"+ actorData.atributos[id].mod;
			item.label = { 'for': "Força", 'des': "Destreza", 'con': "Constituição", 'int': "Inteligência", 'sab': "Sabedoria", 'car': "Carisma" }[id];
		}
		// Roll pericias
		else if ($(a).hasClass('pericia-rollable')) {
			let skillData = {padrao: actorData.pericias, oficios: actorData.pericias.ofi.mais, custom: actorData.periciasCustom}[data.type];
			item = {
				type: 'pericia',
				roll: "1d20+" + skillData[id].value,
				label: skillData[id].label
			}
		}
		// Roll items
		else if (actor.items.get(id)){
			item = actor.items.get(id);
		}

		if(!isObjectEmpty(item)){
			await prepRoll(event, item, actor);
		}
	}

}
