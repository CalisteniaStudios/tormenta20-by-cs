import ActorSheetT20 from "./base.js";

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

		// FLAGS
		sheetData["isPreparationCaster"] = this.actor.getFlag("tormenta20", "mago");
		sheetData["mostrarBonusTreino"] = this.actor.getFlag("tormenta20", "sheet.mostrarTreino");
		sheetData["layout"] = game.settings.get("tormenta20", "sheetTemplate");

		this.actor.data.data.attributes.defesa.pda = this.actor.data.data.attributes.defesa.pda ?? 0;

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
				5: {spells: [], custo: 15}
			},
			"qtdMagias": 0
		};

		// Categorize items as inventory
		const inventario = {
			arma: {label: "Armas", items: [], dataset: {type: "arma"} },
			equipamento: {label: "Equipamentos", items: [], dataset: {type: "equipamento"} },
			consumivel: {label: "Consumível", items: [], dataset: {type: "consumivel"} },
			tesouro: {label: "Tesouro", items: [], dataset: {type: "tesouro"} }
		}
		
		// Partition items by category
		let [items, magias, poderes, classes] = data.items.reduce((arr, item) => {
			// Item details
			item.img = item.img || CONST.DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.data.qtd) && (item.data.qtd !== 1);
			
			if ( item.type === "classe" ) {
				item.abbr = item.name.substr(0,4);
			}

			
			let isFav = item.flags.favorito || false;
			if( isFav ) {
				if( item.type === "arma" ){
					favoritos.armas.push(item);
				} else if ( item.type === "poder" ){
					favoritos.poderes.push(item);
				} else if ( item.type === "magia" ){
					favoritos.magias[item.data.circulo].spells.push(item);
					favoritos.qtdMagias++;
				} else if( ["consumivel","equipamento"].includes(item.type) ){
					favoritos.itens.push(item);
				}
			}
			// Classify items into types
			if ( item.type === "magia" ) arr[1].push(item);
			else if ( item.type === "poder" ) arr[2].push(item);
			else if ( item.type === "classe" ) arr[3].push(item);
			else if ( Object.keys(inventario).includes(item.type ) ) arr[0].push(item);
			return arr;
		}, [[], [], [], []]);

		// Apply active item filters
		// TODO

		// Organize items
		for ( let i of items ) {
			i.data.qtd = i.data.qtd || 0;
			i.data.peso = i.data.peso || 0;
			i.pesoTotal = (i.data.qtd * i.data.peso).toNearest(0.1);
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
			maiorCirculo = Math.max(maiorCirculo, m.data.circulo);
			grimorio[m.data.circulo].spells.push(m);
		});
		
		// classes.sort
		classes.sort((a, b) => (b.data.inicial || 0) - (a.data.inicial || 0));

		// Assign and return
		actorData.favoritos = favoritos;
		actorData.classes = classes;
		actorData.poderes = poderes;
		actorData.magias = grimorio;
		actorData.maiorCirculo = maiorCirculo;
		let layout = game.settings.get("tormenta20", "sheetTemplate");
		if( layout == "tabbed"){
			actorData.inventario = inventario;
		} else if( layout == "base"){
			inventario.itens = {label: "Itens", items: items};
			actorData.inventario = inventario;
		}
	}


	/* -------------------------------------------- */

	async _onPrepareSpell(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		const id = item.data.data;
		let updateItems = [];
		updateItems.push({_id: item.id, "data.preparada": !id.preparada});
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	/* -------------------------------------------- */

	async _onUpdateCD(ev){
		const atrRes = $(ev.currentTarget).data("atrres");
		const magias = this.actor.data.items.filter(i => i.type === "magia");
		const updateItems = magias.map(i => {
			return {_id: i.id, "data.resistencia.atributo": atrRes};
		});
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	/* -------------------------------------------- */

	// Update equippament state, unequipping unique ones;
	// TODO weapon version;
	async _onToggleArmor(ev) {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		const id = item.data.data;
		id.equipado = !id.equipado;
		const items = this.actor.data.items;
		let updateItems = [];
		updateItems.push({_id: item.id, "data.equipado": id.equipado});
		const armor = ["leve", "pesada"];
		const exclusiveSlot = ["leve", "pesada", "escudo", "traje"];
		if (id.equipado && exclusiveSlot.includes(id.tipo)) {
			let unequipped = items.some(element => { //some() === forEach() with a return
				if(element.type === "equipamento" && element.data.data.equipado && element.id != item.id) {
					if (element.data.data.tipo === id.tipo || (armor.includes(element.data.data.tipo) && armor.includes(id.tipo))) {
						updateItems.push({_id: element.id, "data.equipado": false});
						return true;
					}
				}
			});
		}
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Item summaries
		html.find('.item .item-name h4').click(event => this._onItemSummary(event));
		
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if (this.actor.isOwner) {
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
			let lvlconfig = this.actor.getFlag("tormenta20", "lvlconfig");
			if ( !lvlconfig ){
				lvlconfig = {
					pv: { for: false, des: false, int: false, sab: false, car: false },
					pm: { for: false, des: false, con: false, int: false, sab: false, car: false },
					pvBonus: ["0","0"],
					pmBonus: ["0","0"]
				}
				this.actor.setFlag("tormenta20", "lvlconfig", lvlconfig);
			}
			// Novo nivel de classe preexistente
			if ( !!cls ) { 
				let priorLevel = cls.data.data.niveis ?? 0;
				const next = Math.min(priorLevel + 1, 20 + priorLevel - actorData.data.attributes.nivel.value);
				await cls.update({"data.niveis": next});
				return this.actor._calcPVPM();
			}
			// Primeiro Nivel do Personagem
			else if ( !this.actor.itemTypes.classe.length ) {
				itemData.data.inicial = true;
			}
			await super._onDropItemCreate(itemData);
			return this.actor._calcPVPM();
		}

		// Default drop handling if levels were not added
		super._onDropItemCreate(itemData);
	}
}
