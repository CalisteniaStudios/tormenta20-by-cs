import ActorSheetT20 from "./actor-base.mjs";

/**
 * An Actor sheet for player character type actors.
 * Extends the base ActorSheetT20 class.
 * @type {ActorSheetT20}
 */

export default class ActorSheetT20Builder extends ActorSheetT20 {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "character","npc-builder"],
			scrollY: [
				".sheet-body",
			],
			tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "concept"}],
			width: 600,
			height: 700
		});
	}

	/* @override */
	get template() {
		return "systems/tormenta20/templates/actor/npc-sheet-builder.html";
	}

	/* -------------------------------------------- */
	
	/** @override */
	async getData() {
		const sheetData = await super.getData();
		const actorData = this.actor.system.builder;
		sheetData.builder = {};
		sheetData.isNPCBuilder = true;
		// GET ATTRIBUTE CLOSEST CR
		const cr = this.actor.system.attributes.nd; // actorData.attributes.cr;
		const currAttr = this._getActorAttr(this.actor);
		let closestCR = {};
		for ( let [key, attr] of Object.entries(currAttr) ) {
			closestCR[key] = this._getClosestCR(attr, key, cr);
		}
		sheetData.builder.attrClosestCR = closestCR;
		
		
		// VALIDATE MEAN DAMAGE
		const weapons = this.actor.items.filter( i => i.type=='arma' );
		sheetData.builder.meanDamage = {
			target: actorData.attributes.damage.value,
			current: 0,
		}
		let sum = 0;
		for ( let w of weapons ){
			let roll = w.system.rolls.find( r => r.type == 'dano' );
			if( roll ) {
				let parts = roll.parts.map(p=> p[0].toString() ).filterJoin('+');
				let min = new Roll(parts).evaluate({minimize:true, async:false});
				let max = new Roll(parts).evaluate({maximize:true, async:false});
				sum += ((min.total+max.total)/2) * (w.system.qtd ?? 1);
			}
		}
		sheetData.builder.meanDamage.current = sum;

		// PREPARE SKILL RANK ICON
		const ranksIcons = ["fa-regular fa-circle","fa-solid fa-circle-half-stroke","fa-solid fa-circle"];
		sheetData.builder.saverankicons = {
			fort: ranksIcons[actorData.attributes?.fort?.rank ?? 0],
			refl: ranksIcons[actorData.attributes?.refl?.rank ?? 0],
			vont: ranksIcons[actorData.attributes?.vont?.rank ?? 0],
		};
		const ranksTitle = ['T20.NPCB_SaveGood','T20.NPCB_SaveNormal','T20.NPCB_SaveBad'];
		sheetData.builder.saveranktitle = {
			fort: game.i18n.localize( ranksTitle[actorData.attributes?.fort?.rank ?? 0] ),
			refl: game.i18n.localize( ranksTitle[actorData.attributes?.fort?.rank ?? 0] ),
			vont: game.i18n.localize( ranksTitle[actorData.attributes?.fort?.rank ?? 0] ),
		}
		return sheetData;
	}

	/**
	* Organize and classify Owned Items for Character sheets
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
			i.system.espaco = i.system.espaco || 0;
			i.espacosTotal = (i.system.qtd * i.system.espaco);
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
		// actorData.inventario = inventario;
		inventario.itens = {label: "Itens", items: items};
		actorData.inventario = inventario;

	}

	_getClosestCR(attr, key, ccr) {
		let value = attr.value ?? 0;
		let icons = ['fa-solid fa-angles-down','fa-solid fa-angles-up'];
		let title = ['Abaixo do ND','Acima do ND'];
		if ( ['fort','refl','vont'].includes(key) ) {
			key = ['botsave','midsave','topsave'][attr.rank] ?? 'botsave';
		} else if ( key == 'skills' ) key = 'topskill';

		const params = CONFIG.T20.NDparams[key];
		const closestValue = params.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
		
		const cind = CONFIG.T20.NDparams.cr.indexOf(ccr);
		const ind = params[cind] == value ? cind : params.indexOf(closestValue);
		const closestCR = {
			curr:cind,
			clos:ind,
			diff: (ind - cind),
			icon: ((ind - cind) < 0 ? icons[0] : ((ind - cind) > 0 ? icons[1] : '')),
			title: ((ind - cind) < 0 ? title[0] : ((ind - cind) > 0 ? title[1] : '')),
		}
		return closestCR;
	}

	_getActorAttr(actor){
		const attrPaths = ['attributes.attack', 'attributes.damage', 'attributes.defense', 'attributes.topsave', 'attributes.midsave', 'attributes.botsave', 'attributes.hp', 'attributes.dc', 'attributes.fort','attributes.refl','attributes.vont', 'attributes.skills'];
		const attr = {};
		for (let path of attrPaths ) {
			let key = path.split('.')[1];
			let def = ['fort','refl','vont'].includes(key) ? {value: 0, cr:'1', rank:0} : {value: 0, cr:'1'};
			attr[key] = foundry.utils.getProperty( actor.system.builder , path) ?? def;
		}
		return attr;
	}


	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		html.find('.setParam').click(this._onSetCRAttrs.bind(this));
		html.find('.setSaveRank').click(this._onCicleSaveRank.bind(this));
		html.find('.setSaveRank').on("contextmenu", this._onCicleSaveRank.bind(this));
		
		html.find('.setWeaponRoll').on("change", this._onSetWeaponRoll.bind(this));
		
		html.find('.toggleNPCSheet').click(event => this._toggleNPCSheet(event));
		super.activateListeners(html);
	}

	/**
	 * Toggle NPC Sheet
	 */
	 async _toggleNPCSheet(){
		return;
		// De-register the current sheet class
		const sheet = this.object.sheet;
		await sheet.close();
		this.object._sheet = null;
		delete this.object.apps?.[sheet.appId];
		
		const sheetName = sheet.name == "ActorSheetT20Builder" ? "ActorSheetT20Builder" : "ActorSheetT20NPC";
		const newSheet = Actors.registeredSheets?.map( s => s )?.find( s => s.name == sheetName );
		if ( !newSheet ) return;
		this.object._sheet = new newSheet( this.object, {editable: this.object.isOwner} );
		this.object.sheet.render(true);
	}

	_onCicleSaveRank(event){
		event.preventDefault();
		
		const target = event.currentTarget;
		const skill = target.dataset['skill'];
		let step = event.type == 'click' ? 1 : -1;
		let rank = this.actor.system.builder.attributes[skill].rank;
		rank = Number(rank) ?? 0;
		rank = (rank + step < 0 ? 2 : (rank + step > 2 ? 0 : rank + step));
		let updateData = {};
		updateData['system.builder.attributes.'+skill+'.rank'] = rank;
		
		this.actor.update(updateData);
	}
	
	_onSetCRAttrs(event){
		event.preventDefault();
		const target = event.currentTarget;
		const cr = target.closest('tr').dataset['cr'];
		const attr = target.dataset['param'];
		this.actor._setCRAttrs(cr, attr);
	}

	_onSetWeaponRoll(event){
		event.preventDefault();
		const target = event.currentTarget;
		const itemId = target.closest('li').dataset['itemId'];
		const rollType = target.dataset['type'];
		const value = target.value;
		const item = this.actor.items.get( itemId );
		if( !item ) return;
		const rolls = item.system.rolls;
		if( !rolls || foundry.utils.isEmpty(rolls) ) return ui.notifications.warn('T20.WarnItemHaveNoRolls');

		for ( let [ i, roll ] of Object.entries(rolls) ){
			if ( roll.type != rollType ) continue;
			if( rollType == 'ataque' ){
				roll.parts[1][0] = ''; //skill
				roll.parts[1][1] = ''; //ability
				roll.parts[2][0] = value.toString(); //bonus
				break;
			}
			if( rollType == 'dano' ){
				roll.parts[0][0] = value.toString(); //weapon dice
				roll.parts[1][0] = ''; //ability
				break;
			}
		}
		item.update({'system.rolls':rolls});
	}

	/** @override */
	// TODO 
	async _onDropItemCreate(itemData) {
		return super._onDropItemCreate(itemData);
	}
}