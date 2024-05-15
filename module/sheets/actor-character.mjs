import ActorSheetT20 from "./actor-base.mjs";

/**
 * An Actor sheet for player character type actors.
 * Extends the base ActorSheetT20 class.
 * @type {ActorSheetT20}
 */
export default class ActorSheetT20Character extends ActorSheetT20 {
	
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "character"],
			width: 900,
			height: 600
		});
	}

	/** @override */
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
	/*  SheetPreparation                            */
	/* -------------------------------------------- */
	
	/** @override */
	async getData() {
		const sheetData = await super.getData();
		// Experience Tracking
		sheetData["disableExperience"] = game.settings.get("tormenta20", "disableExperience");
		sheetData["disableJournal"] = game.settings.get("tormenta20", "disableJournal");

		// FLAGS
		sheetData["isPreparationCaster"] = this.actor.getFlag("tormenta20", "mago");
		sheetData["mostrarBonusTreino"] = this.actor.getFlag("tormenta20", "sheet.mostrarTreino");
		sheetData["botaoEditarItens"] = this.actor.getFlag("tormenta20", "sheet.botaoEditarItens");

		sheetData["showResources"] = this.actor.getFlag("tormenta20", "sheet.showResources");
		const levelConfig = this.actor.getFlag("tormenta20", "lvlconfig");
		sheetData["autoCalcResources"] = levelConfig ? !levelConfig.manual : true;
		
		sheetData["layout"] = game.settings.get("tormenta20", "sheetTemplate");

		this.actor.system.attributes.defesa.pda = this.actor.system.attributes.defesa.pda ?? 0;
		
		sheetData.htmlFields.diario = await this.enrichHTML(sheetData.system.detalhes.diario.value, sheetData);
		sheetData.htmlFields.diario1 = await this.enrichHTML(sheetData.system.detalhes.diario1.value, sheetData);
		sheetData.htmlFields.diario2 = await this.enrichHTML(sheetData.system.detalhes.diario2.value, sheetData);
		sheetData.htmlFields.diario3 = await this.enrichHTML(sheetData.system.detalhes.diario3.value, sheetData);
		sheetData.htmlFields.diario4 = await this.enrichHTML(sheetData.system.detalhes.diario4.value, sheetData);
		return sheetData;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Item summaries
		html.find('.item .item-name label').click(event => this._onItemSummary(event));
		
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if (this.actor.isOwner) {
			html.find('.item-fav').click(ev => {
				const li = $(ev.currentTarget).parents(".item");
				const item = this.actor.items.get(li.data("itemId"));
				item.update({ "flags.favorito": !item.flags.favorito });
			});
			
			// Prepare spells
			html.find('.preparation-toggle').click(this._onPrepareSpell.bind(this));
			
			// Drag events for macros.
			let handler = ev => this._onDragStart(ev);
			html.find('li.skill').each((i, li) => {
				if (!li.hasAttribute("data-item-id")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}
	
	/* -------------------------------------------- */
	/*  Interactions                                */
	/* -------------------------------------------- */
	
	/** @override */
	async _onDropItemCreate(itemData) {
		// Increment the number of class levels a character instead of creating a new item
		if ( itemData.type === "classe" ) {
			const cls = this.actor.itemTypes.classe.find(c => c.name === itemData.name);
			const actorData = this.actor.system;
			let lvlconfig = this.actor.getFlag("tormenta20", "lvlconfig");
			if ( !lvlconfig ){
				lvlconfig = {
					pv: { for: false, des: false, int: false, sab: false, car: false },
					pm: { for: false, des: false, con: false, int: false, sab: false, car: false },
					pvBonus: ["0","0"],
					pmBonus: ["0","0"],
					manual: false
				}
				this.actor.setFlag("tormenta20", "lvlconfig", lvlconfig);
			}
			// Novo nivel de classe preexistente
			if ( !!cls ) { 
				let priorLevel = cls.system.niveis ?? 0;
				const next = Math.min(priorLevel + 1, 20 + priorLevel - actorData.attributes.nivel.value);
				await cls.update({"system.niveis": next});
				return;
			}
			// Primeiro Nivel do Personagem
			else if ( !this.actor.itemTypes.classe.length ) {
				itemData.system.inicial = true;
			}
			await super._onDropItemCreate(itemData);
			return;
		}

		// Default drop handling if levels were not added
		super._onDropItemCreate(itemData);
	}
	
	/* -------------------------------------------- */

	/**
	* Organize and classify Owned Items for Character sheets
	* @private
	*/
	async _prepareItems(data) {
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
		let [items, magias, poderes, classes] = await data.items.reduce(async (arr, item) => {
			// Item details
			item.img = item.img || CONST.DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.qtd) && (item.system.qtd !== 1);
			try {
				if ( typeof item.system.description === 'string' || item.system.description instanceof String ) {
					item.system.description = {value: item.system.description};
				}

				item.system.description.value = await TextEditor.enrichHTML(item.system.description.value, {
					secrets: item.isOwner,
					async: true,
					relativeTo: item
				});
			} catch (err) {
				ui.notifications.error('Falha ao carregar descrição', {permanent: false});
			}


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
					favoritos.magias[item.system.circulo].spells.push(item);
					favoritos.qtdMagias++;
				} else if( ["consumivel","equipamento"].includes(item.type) ){
					favoritos.itens.push(item);
				}
			}
			
			if ( !Array.isArray(arr) ) arr = await arr;
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
			i.system.qtd = i.system.qtd || 0;
			i.system.espacos = i.system.espacos || 0;
			i.espacosTotal = Number((i.system.qtd * i.system.espacos).toFixed(2));
			// Equipament Slots.
			if ( game.settings.get("tormenta20", "equipmentSlots") ) {
				this._itemSlotIcon(i);
			}
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
		for (let m of magias) {
			maiorCirculo = Math.max(maiorCirculo, m.system.circulo);
			if ( m.system.tipo == 'eng' ) this._itemSlotIcon(m);
			grimorio[m.system.circulo].spells.push(m);
		}
		
		// classes.sort
		classes.sort((a, b) => (b.system.inicial || 0) - (a.system.inicial || 0));

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
		const id = item.system;
		let updateItems = [];
		updateItems.push({_id: item.id, "system.preparada": !id.preparada});
		await this.actor.updateEmbeddedDocuments("Item", updateItems);
	}

	_itemSlotIcon(i){
		// Font Awesome Stacked. icon1 = back | icon2 = front
		i.equipado = i.system.equipado2;
		if ( !i.equipado ) return;
		// i.equipado.icon2 = parseInt(i.equipado.slot) == 12 ? 2 : '';
		i.equipado.icon2 = '<b class="fa-stack-1x" style="color:white;font-size:10px;">'+(parseInt(i.equipado.slot) == 12 ? 2 : '')+'</b>'
		if ( i.equipado.type == 'hand' ) {
			i.equipado.icon1 = '<i class="fa-solid fa-hand-back-fist fa-stack-1x"></i>'
		} else if ( i.equipado.type == 'body' ) {
			i.equipado.icon1 = '<i class="fa-solid fa-shirt fa-stack-1x"></i>'
		} else if ( i.equipado.type == 'both' ) {
			if ( i.equipado.slot == 0 ) {
				i.equipado.icon1 = '<i class="fa-solid fa-shield fa-stack-1x"></i>'
			} else if ( i.equipado.slot.toString().split('.')[1] == 1 ) {
				i.equipado.icon1 = '<i class="fa-solid fa-hand-back-fist fa-stack-1x"></i>'
			} else if ( i.equipado.slot.toString().split('.')[1] == 2 ) {
				i.equipado.icon1 = '<i class="fa-solid fa-shirt fa-stack-1x"></i>'
			}
		}
	}
}
