import ActorSheetT20 from "./base.js";
/**
 * An Actor sheet for NPC type characters.
 * Extends the base ActorSheetT20 class.
 * @extends {ActorSheetT20}
 */
export default class ActorSheetT20NPC extends ActorSheetT20 {
	
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "npc"],
			tabs: [
				{navSelector: ".primary", contentSelector: ".sheet-body", initial: "statblock"},
				{navSelector: ".secondary", contentSelector: ".sheet-body2", initial: "dados"}
			],
			template: "systems/tormenta20/templates/actor/npc-sheet.html",
			width: 500,
			height: 700
		});
	}

	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	getData() {
		const sheetData = super.getData();
		// FLAGS
		if( this.isEditable ) {
			sheetData["editarPericias"] = true;
			//this.actor.getFlag("tormenta20", "sheet.editarPericias");
			sheetData["botaoEditarItens"] = true;
			//this.actor.getFlag("tormenta20", "sheet.botaoEditarItens");
		}
		return sheetData;
	}

	/* -------------------------------------------- */
	
	/** @override */
	activateListeners(html) {
		// super.activateListeners(html);

		// // Tooltips TODO DEBUG
		// html.mousemove(ev => this._moveTooltips(ev));

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		if ( this.actor.isOwner ) {
			// Rollable abilities.
			html.find('.magia-rollable').click(event => this._onItemRoll(event));
			html.find('.arma-rollable').click(event => this._onItemRoll(event));
			html.find('.poder-rollable').click(event => this._onItemRoll(event));
			
			html.find('.magia-rollable').on("contextmenu", this._onItemEdit.bind(this));
			html.find('.arma-rollable').on("contextmenu", this._onItemEdit.bind(this));
			html.find('.poder-rollable').on("contextmenu", this._onItemEdit.bind(this));
		}

		// Drag events for macros.
		let handler = ev => this._onDragStart(ev);
		html.find('.pericia-rollable').each((i, li) => {
			if (!li.hasAttribute("data-item-id")) return;
			li.setAttribute("draggable", true);
			li.addEventListener("dragstart", handler, false);
		});

		super.activateListeners(html);
	}
	
	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/**
	 * TODO Analisar se deve ser incluido
	 * A linha de resistência inclui:
	 * "cura acelerada 10/fogo";
	 * "+5 resistência a magia" (bônus em teste de resistência);
	 * imunidades a xyz / vulnerabilidade a xyz
	 * resistência a dano X
	 * resistência a dano 10/luz (elemento capaz de atravessar a RD)
	 */
	_getResistencias(){
		const resistencias = this.actor.system.tracos.resistencias;
		sheetData["resistencias"] = Object.entries(resistencias).reduce( (o, r) => {
			if(r[1].imunidade) o.imu.push(r[0]);
			else if(r[1].vulnerabilidade) o.vul.push(r[0]);
			else if(r[1].value && o.rd[r[1].value]) o.rd[r[1].value].push(r[0]);
			else if(r[1].value && !o.rd[r[1].value]) o.rd[r[1].value] = [r[0]];
			return o;
		}, {imu: [], vul: [], rd: []});
		let x = {};
		x.imu = sheetData["resistencias"].imu.join(", ");
		x.vul = sheetData["resistencias"].vul.join(", ");
	}

	/* -------------------------------------------- */

	/**
	* Organize Owned Items for rendering the NPC sheet
	* @private
	*/
	_prepareItems(data) {
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
			i.system.peso = i.system.peso || 0;
			i.pesoTotal = (i.system.qtd * i.system.peso).toNearest(0.1);
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
		
		actorData.inventario = inventario;
		// inventario.itens = {label: "Itens", items: items};
		// actorData.inventario = inventario;

	}

}