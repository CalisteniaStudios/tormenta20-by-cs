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
		sheetData["disableJournal"] = game.settings.get("tormenta20", "disableJournal");

		// TODO Understand this
		for (let [pc, per] of Object.entries(this.actor.data.data.atributos)) {
			if(per.bonus === undefined || per.penalidade === undefined) {
				let perB ="data.atributos." + pc + ".bonus";
				let perP ="data.atributos." + pc + ".penalidade";
				this.actor.update({ [perB] : 0, [perP]: 0});
			}
		}

		// FLAGS
		sheetData["isPreparationCaster"] = this.actor.data.flags.mago;
		sheetData["mostrarBonusTreino"] = this.actor.data.flags.mostrarTreino;
		sheetData["layout"] = game.settings.get("tormenta20", "sheetTemplate");

		this.actor.data.data.defesa.pda = this.actor.data.data.defesa.pda ?? 0;
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
		const favoritos = {
			"armas": [],
			"itens": [],
			"poderes": [],
			"magias": {
        1: {spells: [], custo: 1},
				2: {spells: [], custo: 3},
				3: {spells: [], custo: 6},
				4: {spells: [], custo: 10},
				5: { spells: [], custo: 15}
			},
			"qtdMagias": 0
		};
		const poderes = [];
		const equipamentos = [];
		const inventario = [];
		const ataques = [];
		const armas = [];
		let carga = 0;
		const skills = [];
		const skillset = [];
		const classes = [];
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
		let maiorCirculo = 0;
		// Iterate through items, allocating to containers
		for (let i of data.items) {
			let itemData = i.data;
			i.img = i.img || DEFAULT_TOKEN;
			let isFav = i.flags.favorito ?? false;
			// Sort into various arrays.
			if (i.type === 'poder') {
				poderes.push(i);
					if (isFav) favoritos.poderes.push(i);
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
					if (i.data.circulo > maiorCirculo) {
						maiorCirculo = i.data.circulo;
					}
				}
				if (isFav) {
					favoritos.magias[i.data.circulo].spells.push(i);
					favoritos["qtdMagias"] += 1;
				}
			}
			// If this is equipment, we currently lump it together.
			else if (i.type === 'consumivel' || i.type === 'tesouro') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				inventario.push(i);
				carga += i.peso;
				if (isFav) favoritos.itens.push(i);
			}
			else if (i.type === 'equip' || i.type === 'armadura') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				inventario.push(i);
				equipamentos.push(i);
				carga += i.peso;
				if (isFav) favoritos.itens.push(i);
			}
			else if (i.type === "classe") {
				classes.push(i);
			}
			else if (i.type === 'arma') {
				let atqSkill;
				if(actorData.data.pericias){
					if (i.data.atrAtq && i.data.atrAtq !== "0" && actorData.data.atributos[i.data.atrAtq].mod && actorData.data.pericias[i.data.pericia].atributo != i.data.atrAtq) {
						let periciaMod = actorData.data.atributos[actorData.data.pericias[i.data.pericia].atributo].mod;
						atqSkill = actorData.data.atributos[i.data.atrAtq].mod + actorData.data.pericias[i.data.pericia].value - periciaMod;
					}
					else {
						atqSkill = actorData.data.pericias[i.data.pericia]?.value ?? 0;
					}
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

				// i.data.dmg = (tempdmg.match(/([\+\-]?\d+d\d+\b)/g) || []).reduce((a, b) => a + b, '') + ((tempdmg.match(/(-?\b[\+\-]?\d+\b)/g) || []).reduce((a, b) => (a * 1 + b * 1 >= 0 ? '+' + (a * 1 + b * 1) : '' + (a * 1 + b * 1)), '') || '');
				i.data.dmg = new Roll(tempdmg).formula;


				armas.push(i);
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				carga += i.peso;
				if (isFav) favoritos.armas.push(i);
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

		actorData.favoritos = favoritos;
		// Skillset
		actorData.skillset = skillset;
		// Assign and return powers
		actorData.classes = classes;
		actorData.poderes = poderes;
		// Item Skills [WIP]
		// actorData.skills = skills;
		// Spells
		actorData.magias = magias;
		actorData.maiorCirculo = maiorCirculo;
		// Equipment
		actorData.equipamentos = equipamentos;
		actorData.inventario = inventario;
		actorData.data.detalhes.carga = this._computeEncumbrance(actorData, carga);
		// Attacks
		actorData.ataques = ataques;
		actorData.armas = armas;
		// actorData.referencias  = data.actor.effects.filter(i=>i.isTemporary);
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
	
	/**
   * Compute the level and percentage of encumbrance for an Actor.
   *
   * Optionally include the weight of carried currency across all denominations by applying the standard rule
   * from the PHB pg. 143
   * @param {Object} actorData      The data object for the Actor being rendered
   * @returns {{max: number, value: number, pct: number}}  An object describing the character's encumbrance level
   * @private
   */
  _computeEncumbrance(actorData, carga) {
    // Compute Encumbrance percentage
    const max = actorData.data.atributos.for.value * 10;
    const pct = Math.clamped((carga * 100) / max, 0, 100);
    return { "value": carga, "pct": pct };
  }

	/* -------------------------------------------- */
	_onUpdateCD(ev){
		const atrRes = $(ev.currentTarget).data("atrres");
		const magias = this.actor.data.items.filter(i => i.type === "magia");
		const updates = magias.map(i => {
  		return {_id: i._id, "data.atrRes": atrRes};
		});
		this.actor.updateEmbeddedEntity("OwnedItem", updates);
	}
	
	//  
	_onToggleArmor(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.getOwnedItem(li.data("itemId"));
		item.data.data.equipado = !item.data.data.equipado;
		const items = this.actor.data.items;
    
		const armor = ["leve", "pesada"];
		const exclusiveSlot = ["leve", "pesada", "escudo", "traje"];

		if (item.data.data.equipado && exclusiveSlot.includes(item.data.data.tipo)) {
			let unequipped = items.some(element => { //some() === forEach() with a return
        if(element.type === "equip" && element.data.equipado && element._id != item.data._id) {
					if (element.data.tipo === item.data.data.tipo || (armor.includes(element.data.tipo) && armor.includes(item.data.data.tipo))) {
						if (item.data.data.tipo == "traje") {
							this.actor.data.data.defesa.outro -= element.data.armadura.value;
						}
            element.data.equipado = false;
            return true;
          }
        }
			});
			if (unequipped) {
				this.actor.update({"items": items });
			}
		}
		if (armor.includes(item.data.data.tipo)) {
			this.actor.update({ "data.defesa.des": item.data.data.equipado ? item.data.data.tipo === "leve" ? true : false : true });
		}
		item.update({"data.equipado": item.data.data.equipado});
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Item summaries
    // html.find('.item .item-name.rollable h4').click(event => this._onItemSummary(event));
    html.find('.item .item-name h4').click(event => this._onItemSummary(event));
		
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if (this.actor.owner) {
			html.find('.item .item-image').click(event => this._onItemRoll(event));

			html.find('.item-fav').click(ev => {
				const li = $(ev.currentTarget).parents(".item");
				const item = this.actor.getOwnedItem(li.data("itemId"));
				item.update({ "flags.favorito": !item.data.flags.favorito });
			});
			
			// Update Inventory Item
			html.find('.toggle-armor').click(this._onToggleArmor.bind(this));
			html.find('.update-cd').click(this._onUpdateCD.bind(this));
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

	/** @override */
  async _onDropItemCreate(itemData) {
    // Increment the number of class levels a character instead of creating a new item
    if ( itemData.type === "classe" ) {
      const cls = this.actor.itemTypes.classe.find(c => c.name === itemData.name);
			const actorData = this.actor.data;
			if (actorData.flags.pvBonus === undefined || actorData.flags.pmBonus === undefined) {
				actorData.flags.pvBonus = [0,0];
				actorData.flags.pmBonus = [0,0];
				this.actor.update({"flags.pvBonus": [0, 0], "flags.pmBonus": [0, 0]});
			}
      let priorLevel = cls?.data.data.niveis ?? 0;
			if ( !!cls ) { // Novo nivel de classe preexistente
				const next = Math.min(priorLevel + 1, 20 + priorLevel - actorData.data.attributes.nivel.value);
	        	if ( next > priorLevel ) {
					const pvMax = actorData.data.attributes.pv.max + parseInt(itemData.data.pvPorNivel) + actorData.data.atributos.con.mod + (actorData.flags.pvBonus[1] ? parseInt(actorData.flags.pvBonus[1]) : 0);
					const pmMax = actorData.data.attributes.pm.max +  parseInt(itemData.data.pmPorNivel) + (actorData.flags.pmBonus[1] ? parseInt(actorData.flags.pmBonus[1]) : 0);
					this.actor.update({"data.attributes.pv.max": pvMax, "data.attributes.pm.max": pmMax});
	          itemData.niveis = next;
	          		return cls.update({"data.niveis": next});
				}
			}
			else if (actorData.data.attributes.nivel.value) { // Novo nivel de classe
				const pvMax = actorData.data.attributes.pv.max + parseInt(itemData.data.pvPorNivel) + actorData.data.atributos.con.mod + (actorData.flags.pvBonus[1] ? parseInt(actorData.flags.pvBonus[1]) : 0);
				const pmMax = actorData.data.attributes.pm.max +  parseInt(itemData.data.pmPorNivel) + (actorData.flags.pmBonus[1] ? parseInt(actorData.flags.pmBonus[1]) : 0);
				this.actor.update({"data.attributes.pv.max": pvMax, "data.attributes.pm.max": pmMax});
			}
			else { // Primeiro Nivel do Personagem
				const somaPV = (actorData.flags.pvBonus[0] ? parseInt(actorData.flags.pvBonus[0]) : 0) + (actorData.flags.forPV ? actorData.data.atributos.for.mod : 0) + (actorData.flags.desPV ? actorData.data.atributos.des.mod : 0) + (actorData.flags.intPV ? actorData.data.atributos.int.mod : 0) + (actorData.flags.sabPV ? actorData.data.atributos.sab.mod : 0) + (actorData.flags.carPV ? actorData.data.atributos.car.mod : 0);
				const somaPM = (actorData.flags.pmBonus[0] ? parseInt(actorData.flags.pmBonus[0]) : 0) + (actorData.flags.forPM ? actorData.data.atributos.for.mod : 0) + (actorData.flags.desPM ? actorData.data.atributos.des.mod : 0) + (actorData.flags.conPM ? actorData.data.atributos.con.mod : 0) + (actorData.flags.intPM ? actorData.data.atributos.int.mod : 0) + (actorData.flags.sabPM ? actorData.data.atributos.sab.mod : 0) + (actorData.flags.carPM ? actorData.data.atributos.car.mod : 0);
				const pvMax = somaPV + 4 * parseInt(itemData.data.pvPorNivel) + actorData.data.atributos.con.mod + (actorData.flags.pvBonus[1] ? parseInt(actorData.flags.pvBonus[1]) : 0);
				const pmMax = somaPM +  parseInt(itemData.data.pmPorNivel) + (actorData.flags.pmBonus[1] ? parseInt(actorData.flags.pmBonus[1]) : 0);
				this.actor.update({"data.attributes.pv.max": pvMax, "data.attributes.pm.max": pmMax});
			}
    }

    // Default drop handling if levels were not added
    super._onDropItemCreate(itemData);
  }
}
