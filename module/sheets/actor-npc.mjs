import ActorSheetT20 from "./actor-base.mjs";
import StatblockParser from "../apps/statblock-parser.mjs";
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
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "npc"],
			tabs: [
				{navSelector: ".primary", contentSelector: ".sheet-body.primary", initial: "statblock"},
				{navSelector: ".secondary", contentSelector: ".sheet-body.secondary", initial: "sheet"}
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
	async getData() {
		const sheetData = await super.getData();
		
		// FLAGS
		sheetData.isReformed = this.actor.type === "npc" && this.actor.getFlag("tormenta20", "npcReform");
		if ( false && sheetData.isReformed ) {
			sheetData.skills = sheetData.skills.filter( s => !['luta','pont','fort','refl','vont'].includes(s.key) );

			let builder = this.actor.system.builder || {};
			sheetData.unbuilded = false;
			for ( let [ key, attr ] of Object.entries( builder.attributes ) ){
				if ( key == 'mp' && getType( attr ) != 'Object' ) continue;
				if ( attr.cr == '' ) sheetData.unbuilded = true;
			}
		}
		sheetData.compactSpells = game.settings.get("tormenta20", "foeSheetCompactSpell");
		
		let resText = {
			imu: [],
			imuTxt: '',
			res: [],
			resTxt: '',
			vul: [],
			vulTxt: '',
		}
		const res = this.actor.system.tracos.resistencias;
		const ics = this.actor.system.tracos.ic;
		
		Object.entries(res).map(function(r) {
			if ( r[1].imunidade ) resText.imu.push(r[0]);
			else if ( r[1].vulnerabilidade ) resText.vul.push(r[0]);
			else if ( r[1].value > 0 ) resText.res.push(`${r[0]} ${r[1].value}`);
		});
		if ( ics.value && !foundry.utils.isEmpty(ics.value) ) {
			resText.imu.push( ...ics.value );
		}
		if ( ics.custom ) {
			resText.imu.push( ics.custom );
		}
		sheetData['resistencias'] = '';
		if ( !foundry.utils.isEmpty(resText.imu) ) {
			resText.imu = resText.imu.map( i => CONFIG.T20.conditionTypes[i] ?? i );
			resText.imuTxt += 'imunidade a ' + resText.imu.join(', ');
			sheetData['resistencias'] += resText.imuTxt;
		}
		if ( !foundry.utils.isEmpty(resText.res) ) {
			resText.resTxt += 'resistência a ' + resText.res.join(', ');
			if (sheetData['resistencias']) sheetData['resistencias'] += ', '+resText.resTxt;
			else sheetData['resistencias'] += resText.resTxt;
		}
		if ( !foundry.utils.isEmpty(resText.vul) ) {
			resText.vulTxt += 'vulnerabilidade a ' + resText.vul.join(', ');
			if (sheetData['resistencias']) sheetData['resistencias'] += ', '+resText.vulTxt;
			else sheetData['resistencias'] += resText.vulTxt;
		}
		sheetData.manualSkills = ["luta","pont","fort","refl","vont"];
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
			// html.find('.pericia-rollable').click(event => this._onRollPericia(event)); super
			
			html.find('.toggleNPCSheet').click(event => this._toggleNPCSheet(event));
			html.find("#parse-statblock").click(ev => {
				new StatblockParser({
					actor: this.actor,
					statblock:'', schema:{}, items:[], log:[],
				}).render(true);
			});
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

	/* -------------------------------------------- */

	/**
	 * Toggle NPC Sheet
	 */
	async _toggleNPCSheet(){
		// De-register the current sheet class
		const sheet = this.object.sheet;
		await sheet.close();
		this.object._sheet = null;
		delete this.object.apps?.[sheet.appId];
		
		const sheetName = sheet.name == "ActorSheetT20NPC" ? "ActorSheetT20NPC" : "ActorSheetT20Builder";
		const newSheet = Actors.registeredSheets?.map( s => s )?.find( s => s.name == sheetName );
		if ( !newSheet ) return;
		this.object._sheet = new newSheet( this.object, {editable: this.object.isOwner} );
		this.object.sheet.render(true);
	}
	/**
	 * 
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
	async _prepareItems(data) {
		const actorData = data.actor;
		// Initialize containers.
		// Categorize items as inventory
		const inventario = {
			arma: {label: "Armas", items: [], dataset: {type: "arma"}, melee:0, ranged:0 },
			equipamento: {label: "Equipamentos", items: [], dataset: {type: "equipamento"} },
			consumivel: {label: "Consumível", items: [], dataset: {type: "consumivel"} },
			tesouro: {label: "Tesouro", items: [], dataset: {type: "tesouro"} }
		}
		
		// Partition items by category
		let [items, magias, poderes] = await data.items.reduce( async (arr, item) => {
			// Item details
			item.img = item.img || CONST.DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.qtd) && (item.system.qtd !== 1);
			item.system.description.value = await TextEditor.enrichHTML(item.system.description.value, {
				secrets: true,
				async: true,
				relativeTo: item
			});
			if ( item.type == 'magia' ) {
				let element = document.createElement('div');
				element.innerHTML = item.system.description.value;
				if ( element.querySelector('.secret') ) {
					let description = element.querySelector('.secret').innerText;
					description = description.replace(item.name, '');
					item.system.description.value = `<span>${description}</span>`;
				}
			}
			
			if ( !Array.isArray(arr) ) arr = await arr;
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
			i.espacosTotal = (i.system.qtd * i.system.espacos).toFixed(2);
			if ( i.type == 'arma' ) {
				i.melee = ['corpo-a-corpo','corpo-a-corpo-arremesso'].includes(i.system.proposito);
				i.ranged = ['arremesso','disparo'].includes(i.system.proposito);
			}
			inventario[i.type].items.push(i);
		}

		// Weapon Types
		inventario.arma.melee = inventario.arma.items.filter(f => f.type=='arma' && f.melee ).length;
		inventario.arma.ranged = inventario.arma.items.filter(f => f.type=='arma' && f.ranged ).length;
		// console.log(inventario.arma);
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