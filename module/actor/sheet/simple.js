import ActorSheetT20Character from "./character.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../../effects.js";

export default class ActorSheetT20Simple extends ActorSheetT20Character {
	
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "simple"],
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes"}],
			scrollY: [".sheet-body"],
			width: 600,
			height: 600,
		});
	}

	/** @override */
	get template() {
		return "systems/tormenta20/templates/actor/simple-sheet.html";
	}
	
	async getData() {
		let isOwner = this.actor.isOwner;
		const sheetData = {
			owner: isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: this.actor.type === "character",
			isNPC: this.actor.type === "npc",
			isSimple: this.actor.type === "simple",
			isVehicle: this.actor.type === "vehicle",
			config: CONFIG.T20,
		};
		// The Actor and its Items
		sheetData.actor = this.actor.toObject(false);
		//foundry.utils.deepClone(this.actor.system);
		sheetData.items = this.actor.items.map(i => {
			i.labels = i.labels;
			return i;
		});
		sheetData.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		sheetData.system = deepClone(sheetData.actor.system);

		// Ability Scores
		for ( let [a, abl] of Object.entries(sheetData.system.atributos)) {
			abl.label = CONFIG.T20.atributos[a];
		}
		// Movement speeds
		sheetData.movement = this._prepareMovementSpeed(sheetData.actor);
		// Senses
		sheetData.senses = this._prepareSenses(sheetData.actor);
		// Update traits
		this._prepareTraits(sheetData.system.tracos);
		
		// Prepare owned items
		await this._prepareItems(sheetData);

		// Prepare active effects
		sheetData.effects = prepareActiveEffectCategories(this.actor.effects);

		sheetData.documentName = "Actor";
		return sheetData;
	}


	/**
	* Organize Owned Items for rendering the NPC sheet
	* @private
	*/
	async _prepareItems(data) {
		const actorData = data.actor;
		// Initialize containers.

		// Categorize items as inventory
		const inventario = {
			arma: {label: "Armas", items: [], dataset: {type: "arma"} },
			equipamento: {label: "Equipamentos", items: [], dataset: {type: "equipamento"} },
			consumivel: {label: "Consumível", items: [], dataset: {type: "consumivel"} },
			tesouro: {label: "Tesouro", items: [], dataset: {type: "tesouro"} }
		}
		
		// Partition items by category
		let [items, magias, poderes] = data.items.reduce((arr, item) => {
			// Item details
			item.img = item.img || CONST.DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.qtd) && (item.system.qtd !== 1);
			
			// Classify items into types
			if ( item.type === "magia" ) arr[1].push(item);
			else if ( item.type === "poder" ) arr[2].push(item);
			else if ( Object.keys(inventario).includes(item.type ) ) arr[0].push(item);
			return arr;
		}, [[], [], []]);

		// Organize items
		for ( let i of items ) {
			i.system.qtd = i.system.qtd || 0;
			i.system.espacos = i.system.espacos || 0;
			i.espacosTotal = (i.system.qtd * i.system.espacos);
			inventario[i.type].items.push(i);
		}

		// Organize spells and count the number of prepared spells
		const grimorio = {
			1: { spells: [], custo: 1 },
			2: { spells: [], custo: 3 },
			3: { spells: [], custo: 6 },
			4: { spells: [], custo: 10 },
			5: { spells: [], custo: 15 }
		};
		const nPreparadas = 0;
		let maiorCirculo = 0;
		magias.forEach(function(m){
			maiorCirculo = Math.max(maiorCirculo, m.system.circulo);
			grimorio[m.system.circulo].spells.push(m);
		});
		

		// Assign and return
		actorData.poderes = poderes;
		actorData.magias = grimorio;
		actorData.maiorCirculo = maiorCirculo;
		inventario.itens = {label: "Itens", items: items};
		actorData.inventario = inventario;

	}
}