import TraitSelector from "../apps/trait-selector.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ItemT20 from "./entity.js";

/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/
export default class ItemSheetT20 extends ItemSheet {

	/** @inheritdoc */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "item"],
			width: 620,
			height: 480,
			scrollY: [".tab.details"],
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	get template() {
		const path = "systems/tormenta20/templates/item";
		if (this.item.type == "consumivel" || this.item.type == "tesouro") {
			return `${path}/item-sheet.html`;
		}
		return `${path}/${this.item.type}-sheet.html`;
	}
	
	/* -------------------------------------------- */

	/** @inheritdoc */
	setPosition(position = {}) {
		if ( !(this._minimized  || position.height) ) {
			position.height = (this._tabs[0].active === "details") ? "auto" : this.options.height;
		}
		return super.setPosition(position);
	}

	/* -------------------------------------------- */
	/*  Form Render                                 */
	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const data = super.getData(options);
		const itemData = data.item?.system;

		data.labels = this.item.labels;
		data.config = CONFIG.T20;

		data.itemType = data.item.type.capitalize();
		data.itemStatus = this._getItemStatus( data.item );

		data.itemProperties = this._getItemProperties(itemData);
		data.isGM = game.user.isGM;
		data.isPhysical = itemData.hasOwnProperty("qtd");
		data.weightRule = game.settings.get("tormenta20", "weightRule");
		data.isOwned = data.item.isOwned;
		// Resource to Consume
		// method
		// itemData.description.value = await TextEditor.enrichHTML( itemData.description.value );

		// Prepare Active Effects
		data.effects = prepareActiveEffectCategories(this.item.effects);

		// Re-define the template data references (backwards compatible)
		// data.item = itemData;
		data.system = itemData;
		return data;
	}

	
	/* -------------------------------------------- */

	/**
	 * Get the Array of item properties which are used in the small sidebar of the description tab
	 * @return {Array}
	 * @private
	 */
	_getItemProperties(item) {
		const props = [];
		const labels = this.item.labels;

		if ( item.type === "arma" ) {
			props.push(...Object.entries(item.system.propriedades)
				.filter(e => e[1] === true)
				.map(e => CONFIG.T20.weaponProperties[e[0]]));
		} else if ( item.type === "magia" ) {
			
			props.push(
				labels.ativacao? `<b>Execução:</b> ${labels.ativacao}; ` : null,
				labels.range? `<b>Alcance:</b> ${labels.range}; ` : null,
				labels.alvo? `<b>Alvo:</b> ${labels.alvo}; ` : null,
				labels.area? `<b>Área:</b> ${labels.area}; ` : null,
				labels.effect? `<b>Efeito:</b> ${labels.effect}; ` : null,
				labels.duration? `<b>Duração:</b> ${labels.duration}; ` : null,
				labels.save? `<b>Resistência:</b> ${labels.save}; ` : null
			)
		}
		return props.filter(p => !!p);
	}

	/* -------------------------------------------- */

	/**
	*	Get consummable resources;
	* @param {Object} item		Item being displayed
	* @returns {{string: string}} An object of valid consummable resources;
	*/
	_getConsummableResources(item){
		const consume = item.system.consume || {};
		if ( !consume.type ) return [];
		const actor = this.item.actor;
		if ( !actor ) return {};

		// Ammunition
		if ( consume.type === "ammo" ) {
			return actor.consumivel.reduce((ammo, i) =>  {
				if ( i.system.consumableType === "ammo" ) {
					ammo[i.id] = `${i.name} (${i.system.quantidade})`;
				}
				return ammo;
			}, {[item._id]: `${item.name} (${item.system.quantidade})`});
		}

		// Attributes
		else if ( consume.type === "attribute" ) {
			const attributes = Object.values(CombatTrackerConfig.prototype.getAttributeChoices())[0]; // Bit of a hack
			return attributes.reduce((obj, a) => {
				obj[a] = a;
				return obj;
			}, {});
		}

		// Materials
		else if ( consume.type === "material" ) {
			return actor.items.reduce((obj, i) => {
				if ( ["consumivel", "tesouro"].includes(i.type) && !i.system.ativacao ) {
					obj[i.id] = `${i.name} (${i.system.consumivel})`;
				}
				return obj;
			}, {});
		}
		else return {};
	}

	/* -------------------------------------------- */

	/**
	* Get status text for itens;
	* @retun {string}
	*/
	_getItemStatus(item) {
		if( item.type === "magia" ){
			return game.i18n.localize(item.system.preparada ? "T20.SpellPrepPrepared" : "—");
		}
		//  ["arma", "equipamento"] .includes(item.type)
		else if ( item.type === "equipamento" ){
			return game.i18n.localize(item.system.equipado ? "T20.Equipped" : "—");
		}
		else if ( item.type === "arma" ){
			let hand = '<i class="fa-solid fa-hand-back-fist"></i>';
			if( item.system.equipado == 2 ) return game.i18n.localize("T20.Equipped") + hand + hand;
			if( item.system.equipado == 1 ) return game.i18n.localize("T20.Equipped") + hand;
			return "—";
		}
	}

	


	/* -------------------------------------------- */
	/*  Form Interaction                            */
	/* -------------------------------------------- */
	
	/** @inheritdoc */
	activateListeners(html) {
		super.activateListeners(html);
		if ( this.isEditable ) {
			html.find(".rolls-control").click(this._onRollsControl.bind(this));
			html.find(".parts-control").click(this._onPartsControl.bind(this));
			html.find('.trait-selector').click(this._onConfigureTraits.bind(this));
			html.find(".effect-control").click(ev => {
				if ( this.item.isOwned ) return ui.notifications.warn("Alteração de Efeitos em itens possuidos por Personagens não é suportada atualmente.")
				onManageActiveEffect(ev, this.object)
			});
		}
		html.mousemove(ev => this._moveTooltips(ev));
	}
	
	/* -------------------------------------------- */

	/**
	* Add or remove a roll part from the roll formula
	* @param {Event} event     The original click event
	* @return {Promise}
	* @private
	*/
	async _onRollsControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		let itemData = foundry.utils.deepClone(this.item.system);
		// Add new roll component
		if ( a.classList.contains("add-roll") ) {
			// await this._onSubmit(event);  // Submit any unsaved changes
			let rolltype = a.dataset.rollType;
			let roll = foundry.utils.deepClone(this.item.system.rolls);
			let r = {};
			r.parts = ["1d4", "acido"];
			r.name = rolltype.capitalize();
			r.type = rolltype;
			r.key = "ataque";
			if( rolltype == "ataque" ) r.versatil = "";
			roll.push(r);
			return this.item.update({[`system.rolls`]:roll});
		}

		// Remove a roll component
		if ( a.classList.contains("delete-roll") && a.dataset.rollId ) {
			// await this._onSubmit(event);  // Submit any unsaved changes
			const rolltype = a.dataset.rollType;
			let rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls.splice(Number(a.dataset.rollId), 1);
			return this.item.update({[`system.rolls`]:rolls});
		}
	}

	async _onPartsControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// Add new damage component
		if ( a.classList.contains("add-part") && a.dataset.rollId ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const key = a.dataset.rollId;
			const rolls = foundry.utils.deepClone(this.item.system.rolls);
			console.log(this.item.system.rolls);
			rolls[key].parts = rolls[key].parts.concat([["",""]]);
			// rolls[key].parts.push(["",""]);

			console.log(rolls);
			return await this.item.updateSource({ [`system.rolls`]: rolls });
		}

		// Remove a damage component
		if ( a.classList.contains("delete-part") && a.dataset.rollId ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const key = a.dataset.rollId;
			const li = a.closest(".roll-part");
			const rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls[key].parts.splice(Number(li.dataset.rollPart), 1);
			return this.item.update({ [`system.rolls`]: rolls });
		}
	}
	
	/* -------------------------------------------- */

	/**
	 * Handle spawning the TraitSelector application for selection various options.
	 * @param {Event} event   The click event which originated the selection
	 * @private
	 */
	_onConfigureTraits(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement;

		let options = {
			name: a.dataset.target,
			title: label.innerText,
			choices: [],
			allowCustom: false
		};

		switch(a.dataset.options) {
			case 'pericias':
				const skills = this.item.system.pericias;
				const choiceSet = skills.escolhas && skills.escolhas.length ? skills.escolhas : Object.keys(CONFIG.T20.pericias);
				options.choices = Object.fromEntries(Object.entries(CONFIG.T20.pericias).filter(skill => choiceSet.includes(skill[0])));
				options.allowCustom = true;
				options.minimum = skills.numero;
				options.maximum = skills.numero;
				break;
		}

		new TraitSelector(this.item, options).render(true);
	}

	/* -------------------------------------------- */

	_moveTooltips(event) {
		$(event.currentTarget).find(".tooltip:hover .tooltipcontent").css("left", `${event.clientX}px`).css("top", `${event.clientY + 24}px`);
	}

	
	/* -------------------------------------------- */

	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		if ( this.object.type == "magia" && ( this.actor?.getFlag("tormenta20","createScroll") || game.user.isGM ) ) {
			buttons.unshift({
				label: 'Criar Pergaminho',
				class: "create-scroll",
				icon: "fas fa-scroll",
				onclick: () => this._createScroll()
			});
		}
		return buttons;
	}
	
	/* -------------------------------------------- */

	_createScroll(){
		let itemData = {};
		itemData.system = this.object.system.toObject();
		itemData.type = "consumivel";
		itemData.name = `Pergaminho de ${this.object.name}`;
		itemData.img = "icons/sundries/scrolls/scroll-bound-black-tan.webp",
		itemData.system.ativacao.custo = 0; 
		itemData.system.tipo = "scroll";
		if( this.actor ){
			this.actor.createEmbeddedDocuments("Item", [itemData]);
			if( this.actor.type == "character" ){
				let msg = `${this.actor.name} criou ${itemData.name}`;
				ChatMessage.create({content:msg});
			}
		} else {
			ItemT20.create(itemData).then( item => item.sheet.render(true) );
		}
	}

	/* -------------------------------------------- */
  /*  Form Submission                             */
	/* -------------------------------------------- */

	/** @inheritdoc */
	_getSubmitData(updateData={}) {
		// Create the expanded update data object
		const fd = new FormDataExtended(this.form, {editors: this.editors});
		let data = fd.object;
		console.warn('_getSubmitData', data );
		// console.log(data);
		if ( updateData ) data = mergeObject(data, updateData);
		else data = expandObject(data);

		// Handle rolls array
		// console.log(data);
		data.system.rolls = Object.values(data.system.rolls || []);
		let rolls = Object.entries(data.system.rolls || []);
		console.log(rolls);
		for (let [key, roll] of rolls){
			if ( roll ) roll.parts = Object.values(roll?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
			if ( roll ) roll.key = roll.type + key;
		}
		// console.log(rolls);
		// console.log(data);
		console.warn('_getSubmitData', data );
		// Return the flattened submission data
		return flattenObject(data);
	}
}