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
		const ataques = [];
		const armas = [];
		let carga = 0;
		const skills = [];
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
				console.log(this.actor);
				if (i.data.circulo != undefined) {
					magias[i.data.circulo].spells.push(i);
				}
				this.actor.data.flags.conjurador = true;
			}
			// If this is equipment, we currently lump it together.
			else if (i.type === 'equip'  || i.type === 'consumivel' || i.type === 'tesouro') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
				equipamentos.push(i);
				carga += i.peso;
			}
			else if (i.type === 'armadura') {
				i.peso = Number(i.data.peso)*Number(i.data.qtd);
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

		// Assign and return powers
		actorData.poderes = poderes;
		// Item Skills [WIP]
		// actorData.skills = skills;
		// Spells
		actorData.magias = magias;
		// Equipment
		actorData.equipamentos = equipamentos;
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
	async _onUpdateItem(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const data = a.dataset;
		const actorData = this.actor.data.data;
		const itemId = $(a).parents('.item').attr('data-item-id');
		const item = this.actor.getOwnedItem(itemId);

		if (item) {
			let value = a.value;
			if (data.campo == "_bonusAtq") {
				item.update({ "data._bonusAtq": value });
			} else if (data.campo == "_bonusDano") {
				item.update({ "data._bonusDano": value });
			}
		}

		this.render();
	}

	/* -------------------------------------------- */

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
				if(element.type === "equip" && element.data.tipo === item.data.data.tipo && element.data.equipado && element._id != item.data._id) {
					element.data.equipado = false;
					return true;
				}
			});
			if (unequipped) {
				this.actor.update({"items": items });
			}
		}

		const armadura = {
			nome: item.data.data.equipado ? item.data.name : "",
			defesa: item.data.data.equipado ? item.data.data.armadura.value : 0,
			penalidade: item.data.data.equipado ? item.data.data.armadura.penalidade : 0,
			equipado: item.data.data.equipado
		};
		if (item.data.data.tipo === "leve" || item.data.data.tipo === "pesada") {
			this.actor.update({
				"data.armadura": armadura,
				"data.defesa.des": item.data.data.equipado ? item.data.data.tipo === "leve" ? true : false : true //if ((equipado && leve) || desequipado) return true
			});
		}
		else if (item.data.data.tipo === "escudo") {
			this.actor.update({ "data.escudo": armadura });
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

		// Tooltips TODO DEBUG
		html.mousemove(ev => this._moveTooltips(ev));

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		html.find("#configure-actor").click(ev => {
			new game.tormenta20.applications.ActorSettings(this.actor).render(true);
		});

		// Add pericias/oficios
		html.find('.pericia-create').click(this._onPericiaCustomCreate.bind(this));
		html.find('.oficios-create').click(this._onPericiaCustomCreate.bind(this));

		html.find('.skill-tr').find('input,select').change(this._onPericiaCustomUpdate.bind(this));

		html.find('.skill-delete').click(this._onPericiaCustomDelete.bind(this));

		html.find('.show-controls').click(this._toggleControls.bind(this));

		// Add Inventory Item
		html.find('.item-create').click(this._onItemCreate.bind(this));

		// Update Inventory Item
		html.find('.toggle-armor').click(this._onToggleArmor.bind(this));

		// Update Inventory Item
		html.find('.item-edit').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.getOwnedItem(li.data("itemId"));
			item.sheet.render(true);
		});

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.getOwnedItem(li.data("itemId"));
			if(item.data.type === "armadura" && item.data.data.equipado) {
				const armadura = {
					nome: "",
					defesa:  0,
					penalidade: 0,
					equipado: false
				};
				if (item.data.data.tipo === "armadura") {
					this.actor.update({
						"data.armadura": armadura,
						"data.defesa.des": true
					});
				}
				else if (item.data.data.tipo === "escudo") {
					this.actor.update({
						"data.escudo": armadura,
					});
				}
			}
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

	/* -------------------------------------------- */

	/** @override */
	_onDragStart(event) {
		const li = event.currentTarget;
		if (event.target.classList.contains("entity-link")) return;

		// Create drag data
		const dragData = {
			actorId: this.actor.id,
			sceneId: this.actor.isToken ? canvas.scene?.id : null,
			tokenId: this.actor.isToken ? this.actor.token.id : null
		};

		// Owned Items
		if (li.dataset.itemId) {
			const item = this.actor.items.get(li.dataset.itemId);
			dragData.type = "Item";
			dragData.data = item.data;
		}

		// Active Effect
		if (li.dataset.effectId) {
			const effect = this.actor.effects.get(li.dataset.effectId);
			dragData.type = "ActiveEffect";
			dragData.data = effect.data;
		}
		// Pericias
		if (li.dataset.skill) {
			let skill;
			if (li.dataset.ofi) {
				skill = this.actor.data.data.pericias["ofi"].mais[li.dataset.ofi];
				dragData.subtype = "oficios";
			} else if (li.dataset.custom) {
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
	async _onPericiaCustomUpdate(event) {
		let index = $(event.currentTarget).closest('.skill-tr')[0].dataset.itemId;
		let tipo = $(event.currentTarget).closest('.skill-tr')[0].dataset.skill;
		let inputs = $(event.currentTarget).closest('.skill-tr').find('input,textarea,select');
		let pericias;
		let sk;
		if (tipo == "oficios") {
			pericias = this.actor.data.data.pericias.ofi.mais;
			sk = this.actor.data.data.pericias.ofi.mais[index];
		} else if (tipo == "custom") {
			pericias = this.actor.data.data.periciasCustom;
			sk = this.actor.data.data.periciasCustom[index];
		}
		for (let inp of inputs) {
			if (inp.name.match(/treinado/) !== null) {
				sk.treinado = inp.checked;
			} else if (inp.name.match(/label/) !== null) {
				sk.label = inp.value;
			} else if (inp.name.match(/atributo/) !== null) {
				sk.atributo = inp.value;
			} else if (inp.name.match(/treino/) !== null) {
				sk.treino = inp.value;
			} else if (inp.name.match(/outros/) !== null) {
				sk.outros = inp.value;
			} else if (inp.name.match(/temp/) !== null) {
				sk.temp = inp.value;
			}
		}
		if (tipo == "oficios") {
			pericias[index] = sk;
			await this.actor.update({ "data.pericias.ofi.mais": pericias });
		} else if (tipo == "custom") {
			pericias[index] = sk;
			await this.actor.update({ "data.periciasCustom": pericias });
		}
	}
	async _onPericiaCustomDelete(event) {
		const id = event.currentTarget.dataset.itemId;
		const a = event.currentTarget;
		const tipo = a.dataset.tipo;
		let c = 0;
		if (tipo == 'oficios') {
			let oficios = Object.values(this.actor.data.data.pericias.ofi.mais);
			oficios.splice(id, 1);

			await this.actor.update({ "data.pericias.ofi.mais": oficios });
		} else {
			let pericias = Object.values(this.actor.data.data.periciasCustom);
			pericias.splice(id, 1);

			await this.actor.update({ "data.periciasCustom": pericias });
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
			mod: 0,
			temp: 0
		};

		let actorData = duplicate(this.actor);
		let oficios = Object.values(actorData.data.pericias.ofi.mais);
		let periciasCustom = Object.values(actorData.data.periciasCustom);

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
	// TODO move to base.js
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
		if(itemId && ($(a).hasClass('magia-rollable') || $(a).hasClass('arma-rollable') || $(a).hasClass('consumivel-rollable') || $(a).hasClass('ataque-rollable') || $(a).hasClass('poder-rollable') || $(a).hasClass('skill-rollable'))) {
			item = actor.getOwnedItem(itemId);
		} else if ($(a).hasClass('pericia-rollable')) {
			item = {
				type: 'pericia',
				roll: data.roll,
				label: data.label
			}
		} else if ($(a).hasClass('atributo-rollable')) {
			const atrnames = { 'for': "Força", 'des': "Destreza", 'con': "Constituição", 'int': "Inteligência", 'sab': "Sabedoria", 'car': "Carisma" }
			item = {
				type: 'atributo',
				roll: data.roll,
				label: atrnames[data.label]
			}
		}
		await prepRoll(event, item, actor);

	}

}
