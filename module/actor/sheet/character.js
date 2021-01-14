import { prepRoll } from "../../dice.js";
import ActorSheetT20 from "./base.js";
import ActorT20 from "../entity.js";
import { T20Utility } from "../../utility.js";
/**
 * An Actor sheet for player character type actors.
 * Extends the base ActorSheetT20 class.
 * @type {ActorSheetT20}
 */
export default class ActorSheetT20Character extends ActorSheetT20 {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "character"],
			width: 900,
			height: 600
		});
	}

	/* @override */
	get template() {
		let layout = game.settings.get("tormenta20", "sheetTemplate");
		if ( !game.user.isGM && this.actor.limited ) {
			return "systems/tormenta20/templates/actor/actor-sheet-limited.html";
		} else if(layout == 'base'){
			return "systems/tormenta20/templates/actor/actor-sheet-base.html" ;
		} else if(layout == 'tabbed') {
			return "systems/tormenta20/templates/actor/actor-sheet-tabbed.html";
		}
	}

	/* -------------------------------------------- */
	
	/** @override */
	getData() {
		const sheetData = super.getData();
		// Experience Tracking
		sheetData["disableExperience"] = game.settings.get("tormenta20", "disableExperience");

		// TODO Understand this
		for (let [pc, per] of Object.entries(this.actor.data.data.atributos)) {
			if(per.bonus === undefined || per.penalidade === undefined) {
				let perB ="data.atributos." + pc + ".bonus";
				let perP ="data.atributos." + pc + ".penalidade";
				this.actor.update({ [perB] : 0, [perP]: 0});
			}
		}

		// FLAGS
		sheetData["isCaster"] = this.actor.data.flags.conjurador;
		sheetData["isPreparationCaster"] = this.actor.data.flags.mago;

		/* Template SKILLS */
		// TODO Migration function to enforce template data
		if(this.actor.data.data.pericias !== undefined){
			for (let [pc, per] of Object.entries(this.actor.data.data.pericias)) {
				if(per.bonus === undefined || per.penalidade === undefined) {
					let perB ="data.pericias." + pc + ".bonus";
					let perP ="data.pericias." + pc + ".penalidade";
					this.actor.update({ [perB] : 0, [perP]: 0});
				}
			}
		}

		return sheetData;
	}

	/* -------------------------------------------- */

	/**
	* Organize and classify Owned Items for Character sheets
	* @private
	*/
	_prepareItems(data) {
		const actorData = data.actor;
		// Initialize containers.
		const poderes = [];
		const equipamentos = [];
		const inventario = [];
		const ataques = [];
		const armas = [];
		let carga = 0;
		const skills = [];
		const skillset = [];
		// actorData.data.detalhes.cargaa.medio = actorData.data.atributos.for.value * 3;
		// actorData.data.detalhes.cargaa.max = actorData.data.atributos.for.value * 10;
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
		for (let i of data.items) {
			let item = i.data;
			i.img = i.img || DEFAULT_TOKEN;
			// Sort into various arrays.
			if (i.type === 'poder') {
				poderes.push(i);
			}
			else if (i.type === 'skill') {

				let halfLevel = Math.floor(actorData.data.attributes.nivel.value/2);

				let training = !i.data.trained ? 0 : (actorData.data.attributes.nivel.value > 14 ? 6 : (actorData.data.attributes.nivel.value > 6 ? 4 : 2));
				let abilityMod = actorData.data.atributos[i.data.ability].mod;
				let armorPen = false ? 0 : 0;

				i.data.total = halfLevel + training + abilityMod + i.data.bonus + armorPen;

				skills.push(i);
			}
			else if (i.type === 'magia') {
				if (i.data.circulo != undefined) {
					magias[i.data.circulo].spells.push(i);
				}
				this.actor.data.flags.conjurador = true;
			}
			// If this is equipment, we currently lump it together.
			else if (i.type === 'consumivel' || i.type === 'tesouro') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				inventario.push(i);
				carga += i.peso;
			}
			else if (i.type === 'equip' || i.type === 'armadura') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				inventario.push(i);
				equipamentos.push(i);
				carga += i.peso;

			}
			else if (i.type === 'arma') {
				let atqSkill;
				if(actorData.data.pericias){
					atqSkill = actorData.data.pericias[i.data.pericia].value;
				}
				/*NEW SKILL*/
				else if (i.data.skill) {
					atqSkill = this.actor.getOwnedItem(i.data.skill)?.data.data.total ?? 0;
				}
				let tempatq = `${atqSkill} + ${i.data.atqBns}`;
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

				i.data.atq = (tempatq.match(/(-?\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1) + (b * 1), 0) + (tempatq.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '');

				i.data.dmg = (tempdmg.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '') + ((tempdmg.match(/(-?\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1 + b * 1 >= 0 ? '+' + (a * 1 + b * 1) : '' + (a * 1 + b * 1)), '') || '');


				armas.push(i);
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				carga += i.peso;
			}
		}

		// Group skills in one array
		const basicSkills = actorData.data.pericias;
		const oficSkills = actorData.data.pericias.ofi.mais;
		const customSkills = actorData.data.periciasCustom;
		for (let [key, sk] of Object.entries(basicSkills)){
			if(key == 'ofi'){
				// skillset[key] = "ofi";
				skillset.push("ofi");
				for (let [id, ofi] of Object.entries(oficSkills)){
					ofi.path = "data.pericias.ofi.mais";
					ofi.id = id;
					ofi.type = "oficios";
					skillset.push(ofi);
				}
			} else {
				sk.path = "data.pericias";
				sk.id = key;
				// skillset[key] = sk;
				skillset.push(sk);
			}
		}
		// skillset["cstm"] = "cstm";
		skillset.push("cstm");
		for (let [id, cstm] of Object.entries(customSkills)){
			cstm.path = "data.periciasCustom";
			cstm.id = id;
			cstm.type = "custom";
			// skillset["cstm"+id] = cstm;
			skillset.push(cstm);
		}

		// Skillset
		actorData.skillset = skillset;
		// Assign and return powers
		actorData.poderes = poderes;
		// Item Skills [WIP]
		// actorData.skills = skills;
		// Spells
		actorData.magias = magias;
		// Equipment
		actorData.equipamentos = equipamentos;
		actorData.inventario = inventario;
		actorData.data.detalhes.carga = carga;
		// Attacks
		actorData.ataques = ataques;
		actorData.armas = armas;
		actorData.referencias  = data.actor.effects;
	}

	/* -------------------------------------------- */
	/**
	* Listen for click events on spells.
	* @param {MouseEvent} event
	*/
	// TODO Refactoring
	// async _onUpdateItem(event) {
	// 	event.preventDefault();
	// 	const a = event.currentTarget;
	// 	const data = a.dataset;
	// 	const actorData = this.actor.data.data;
	// 	const itemId = $(a).parents('.item').attr('data-item-id');
	// 	const item = this.actor.getOwnedItem(itemId);

	// 	if (item) {
	// 		let value = a.value;
	// 		if (data.campo == "_bonusAtq") {
	// 			item.update({ "data._bonusAtq": value });
	// 		} else if (data.campo == "_bonusDano") {
	// 			item.update({ "data._bonusDano": value });
	// 		}
	// 	}

	// 	this.render();
	// }

	/* -------------------------------------------- */

	async _onPrepareSpell(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const data = a.dataset;
		const actorData = this.actor.data.data;
		const itemId = a.closest("li").dataset.itemId;
		const item = this.actor.getOwnedItem(itemId);
		let updateItems = [];
		if (item) {
			let tempItem = duplicate(item);
			updateItems.push({_id: item.id, "data.preparada": !item.data.data.preparada});
			
			// this.actor.updateOwnedItem(updatedItem);
			this.actor.updateEmbeddedEntity("OwnedItem", updateItems);
			this.render();
		}
	}

	/* -------------------------------------------- */
	//  
	_onToggleArmor(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.getOwnedItem(li.data("itemId"));
		item.data.data.equipado = !item.data.data.equipado;
		let current = $(ev.currentTarget)[0];
		let items = this.actor.data.items;
    
		const exclusiveSlot = item.data.data.tipo != "acessorio" ? item.data.data.tipo != "bonus" ? true : false : false; // exclusiveSlot = (item.data.data.tipo != "acessorio") && (item.data.data.tipo != "bonus"))

		if (item.data.data.equipado && exclusiveSlot) {
			let unequipped = items.some(element => { //some() === forEach() with a return
        if(element.type === "equip" && element.data.equipado && element._id != item.data._id) {
          if (element.data.tipo === item.data.data.tipo || ((element.data.tipo == "leve" || element.data.tipo == "pesada") && (item.data.data.tipo == "leve" || item.data.data.tipo == "pesada"))) {
            element.data.equipado = false;
            return true;
          }
        }
			});
			if (unequipped) {
				this.actor.update({"items": items });
			}
		}

		const armadura = {
			nome: item.data.data.equipado ? item.data.name : "",
			value: item.data.data.equipado ? item.data.data.armadura.value : 0,
			penalidade: item.data.data.equipado ? item.data.data.armadura.penalidade : 0,
			equipado: item.data.data.equipado
		};
		if (item.data.data.tipo === "leve" || item.data.data.tipo === "pesada") {
			this.actor.update({
				"data.defesa.armadura": armadura,
				"data.defesa.des": item.data.data.equipado ? item.data.data.tipo === "leve" ? true : false : true //return ((equipado && leve) || !equipado)
			});
		}
		else if (item.data.data.tipo === "escudo") {
			this.actor.update({ "data.defesa.escudo": armadura });
		}
		else {
			let atual = this.actor.data.data.defesa.outro;
			let nova = item.data.data.equipado ? atual + item.data.data.armadura.value : atual - item.data.data.armadura.value;
			this.actor.update({ "data.defesa.outro": nova });
		}
		item.update({"data.equipado": item.data.data.equipado});
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if (this.actor.owner) {

			// Update Inventory Item
			html.find('.toggle-armor').click(this._onToggleArmor.bind(this));

			// Prepare spells
			html.find('.preparation-toggle').click(this._onPrepareSpell.bind(this));


			// Drag events for macros.
			let handler = ev => this._onDragStart(ev);
			html.find('li.skill').each((i, li) => {
				// if (li.classList.contains("inventory-header")) return;
				// if (li.id === "atributo") return;
				if (!li.hasAttribute("data-item-id")) return;
				if (!li.hasAttribute("data-type")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}

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


}
