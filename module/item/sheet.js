import TraitSelector from "../apps/trait-selector.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ItemT20 from "./entity.js";

/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/
export default class ItemSheetT20 extends ItemSheet {

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

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
		else if (this.item.type == "armadura") {
			return `${path}/equip-sheet.html`;
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

	/** @inheritdoc */
	_getSubmitData(updateData={}) {
		// Create the expanded update data object
		const fd = new FormDataExtended(this.form, {editors: this.editors});
		let tdata = fd.object;
		let data = {};
		for (let key of Object.keys( tdata ) ){
			let nkey = key.replace(/^system./, 'data.');
			data[ nkey ] = tdata[key];
		}
		if ( updateData ) data = mergeObject(data, updateData);
		else data = expandObject(data);

		// Handle rolls array
		data.data.rolls = Object.values(data.data.rolls || []);
		let rolls = Object.entries(data.data?.rolls || []);
		for (let [key, roll] of rolls){
			if ( roll ) roll.parts = Object.values(roll?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
			if ( roll ) roll.key = roll.type + key;
		}
		// Return the flattened submission data
		return flattenObject(data);
	}
	
	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	getData(options) {
		const data = super.getData(options);
		const itemData =  this.item.system;
		data.labels = this.item.labels;
		data.config = CONFIG.T20;

		data.itemType = data.item.type.capitalize();
		if( this.item.type == 'classe' ){
			data.itemStatus = itemData.inicial ? game.i18n.localize('T20.ClassOriginal') : "";
		} else if ( this.item.type == 'equipamento' ) {
			data.itemStatus = itemData.equipado ? game.i18n.localize('T20.Equipped') : "";
		} else if ( this.item.type == 'magia' ){
			data.itemStatus = itemData.preparada ? game.i18n.localize('T20.Prepared') : "";
		}

		data.itemProperties = this._getItemProperties();
		data.isPhysical = itemData.hasOwnProperty("qtd");
		data.weightRule = game.settings.get("tormenta20", "weightRule");
		data.isOwned = data.item.isOwned;
		// Resource to Consume
		// method
		data.abilityConsumptionTargets = this._getItemConsumptionTargets(itemData);
		// Prepare Active Effects
		data.effects = prepareActiveEffectCategories(this.item.effects);

		// Re-define the template data references (backwards compatible)
		// data.item = itemData;
		// data.item.system = itemData;
		data.system = itemData;
		data.documentName = "Item";
		return data;
	}

	/* -------------------------------------------- */

	/**
	 * Get the valid item consumption targets which exist on the actor
	 * @param {object} item         Item data for the item being displayed
	 * @returns {{string: string}}   An object of potential consumption targets
	 * @private
	 */
	_getItemConsumptionTargets(item) {
		const consume = item.consume || {};
		if ( !consume.type ) return [];
		const actor = this.item.actor;
		if ( !actor ) return {};

		// Ammunition
		if ( consume.type === "ammo" ) {
			return actor.itemTypes.consumivel.reduce((ammo, i) => {
				if ( i.system.tipo === "ammo" ) {
					ammo[i.id] = `${i.name} (${i.system.qtd})`;
				}
				return ammo;
			}, {});
			// {[i._id]: `${i.name} (${item.qtd})`}
		}

		// Resources
		else if ( consume.type === "attribute" ) {
			const resources = this.item.actor?.system.resources ?? {};
			return Object.entries(resources).reduce((object, r) => {
				object[r[0]] = r[1].label;
				return object;
			}, {});
		}
		// Materials
		else if ( consume.type === "material" ) {
			return actor.items.reduce((obj, i) => {
				if ( ["consumivel", "tesouro"].includes(i.type) && !i.ativacao ) {
					obj[i.id] = `${i.name} (${i.system.qtd})`;
				}
				return obj;
			}, {});
		}
		else return {};
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	activateListeners(html) {
		super.activateListeners(html);
		if ( this.isEditable ) {
			html.find(".rolls-control").click(this._onRollsControl.bind(this));
			html.find(".parts-control").click(this._onPartsControl.bind(this));
			html.find('.trait-selector').click(this._onConfigureTraits.bind(this));
			html.find(".effect-control").click(ev => {
				if ( this.item.isOwned ) return ui.notifications.warn(game.i18n.localize('T20.WarningEditOwnedItemEffect'))
				onManageActiveEffect(ev, this.item)
			});
		}
		html.mousemove(ev => this._moveTooltips(ev));
	}
	
	/* -------------------------------------------- */
	/*  Interactions                                */
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
				label: game.i18n.localize('T20.WriteScroll'),
				class: "create-scroll",
				icon: "fas fa-scroll",
				onclick: () => this._createScroll()
			});
		}
		return buttons;
	}
	
	/* -------------------------------------------- */

	/**
	* Get status text for itens;
	* @retun {string}
	*/
	_getItemStatus(item) {
		if( item.type === "magia" ){
			return game.i18n.localize(item.system.preparada ? "T20.SpellPrepPrepared" : "");
		}
		else if ( ["arma", "equipamento"] .includes(item.type) ){
			return game.i18n.localize(item.system.equipado ? "T20.Equipped" : "");
		}
	}

	/* -------------------------------------------- */

	/**
	 * Get the Array of item properties which are used in the small sidebar of the description tab
	 * @return {Array}
	 * @private
	 */
	 _getItemProperties() {
		const props = [];
		const labels = this.item.labels;
		if ( this.item.type === "arma" ) {
			props.push(...Object.entries(this.item.system.propriedades)
				.filter(e => e[1] === true)
				.map(e => CONFIG.T20.weaponProperties[e[0]]));
		} else if ( this.item.type === "magia" ) {
			let hTags = { ativacao: "T20.ActivationCost", range:"T20.Range", target:"T20.Target", area: 'T20.Area', effect: 'T20.Effect', duration:"T20.Duration", save:"T20.Resistance" };
			
			for ( let [h, tag] of Object.entries(hTags) ){
				hTags[h] = game.i18n.localize(tag);
			}
			props.push(
				labels.ativacao? `<b>${hTags['ativacao']}:</b> ${labels.ativacao}; ` : null,
				labels.range? `<b>${hTags['range']}:</b> ${labels.range}; ` : null,
				labels.alvo? `<b>${hTags['target']}:</b> ${labels.alvo}; ` : null,
				labels.area? `<b>${hTags['area']}:</b> ${labels.area}; ` : null,
				labels.effect? `<b>${hTags['effect']}:</b> ${labels.effect}; ` : null,
				labels.duration? `<b>${hTags['duration']}:</b> ${labels.duration}; ` : null,
				labels.save? `<b>${hTags['save']}:</b> ${labels.save}; ` : null
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
			return actor.itemTypes.consumivel.reduce((ammo, i) =>  {
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
	* Add or remove a roll part from the roll formula
	* @param {Event} event     The original click event
	* @return {Promise}
	* @private
	*/
	async _onPartsControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// Add new damage component
		if ( a.classList.contains("add-part") && a.dataset.rollId ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const key = a.dataset.rollId;
			const rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls[key].parts = rolls[key].parts.concat([["",""]]);
			return this.item.update({ [`data.rolls`]: rolls });
		}

		// Remove a damage component
		if ( a.classList.contains("delete-part") && a.dataset.rollId ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const key = a.dataset.rollId;
			const li = a.closest(".roll-part");
			const rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls[key].parts.splice(Number(li.dataset.rollPart), 1);
			return this.item.update({ [`data.rolls`]: rolls });
		}
	}

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
			r.parts = [["", ""]];
			r.name = rolltype.capitalize();
			r.type = rolltype;
			r.key = "ataque";
			if( rolltype == "ataque" ) r.versatil = "";
			roll.push(r);
			return this.item.update({[`data.rolls`]:roll});
		}

		// Remove a roll component
		if ( a.classList.contains("delete-roll") && a.dataset.rollId ) {
			// await this._onSubmit(event);  // Submit any unsaved changes
			const rolltype = a.dataset.rollType;
			let rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls.splice(Number(a.dataset.rollId), 1);
			return this.item.update({[`data.rolls`]:rolls});
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

	/**
	 * Replicate the spell as a consumable scroll item.
	 * @param {Event} event   The click event which originated the selection
	 * @private
	 */
	_createScroll(){
		let itemData = {};
		itemData.data = deepClone( this.object.system );
		itemData.type = "consumivel";
		itemData.name = game.i18n.format('T20.ConsumableSpellName',{
			item: game.i18n.localize('T20.ConsumableSubtypeScroll'),
			name:this.object.name
		}),
		itemData.img = "icons/sundries/scrolls/scroll-bound-black-tan.webp",
		itemData.data.ativacao.custo = 0; 
		itemData.data.tipo = "scroll";
		if( this.actor ){
			this.actor.createEmbeddedDocuments("Item", [itemData]);
			if( this.actor.type == "character" ){
				let msg = game.i18n.format('T20.ConsumableCreated', {actor:this.actor.name, name:itemData.name} );
				ChatMessage.create({content:msg});
			}
		} else {
			ItemT20.create(itemData);
		}
	}

}