import ItemT20 from "../documents/item.mjs";
import ActiveEffectT20 from "../documents/active-effects.mjs";
import TraitSelector from "../apps/trait-selector.mjs";

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
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
			dragDrop: [
				{dragSelector: "[data-effect-id]", dropSelector: ".effects-list"},
				{dropSelector: '.opt-drop'}
			],
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
		const formData = foundry.utils.expandObject(super._getSubmitData(updateData));
		// Create the expanded update data object
		// const fd = new FormDataExtended(this.form, {editors: this.editors});
		// let tdata = fd.object;
		// let data = fd.object;//{};
		// for (let key of Object.keys( tdata ) ){
		// 	let nkey = key.replace(/^system./, 'data.');
		// 	data[ nkey ] = tdata[key];
		// }
		// if ( updateData ) formData = foundry.utils.mergeObject(formData, updateData);
		// else data = foundry.utils.expandObject(data);

		// Handle rolls array
		if ( formData.system?.rolls ) {
			formData.system.rolls = Object.values(formData.system.rolls || []);
			let rolls = Object.entries(formData.system?.rolls || []);
			for (let [key, roll] of rolls){
				if ( roll ) roll.parts = Object.values(roll?.parts || {}).map(d => [d[0] || "", d[1] || ""]);
				if ( roll ) roll.key = roll.type + key;
			}
		}

		// Handle progression array
		// formData.system.progression = Object.values(formData.system.progression || []);
		// let progression = Object.entries(formData.system?.progression || []);
		// for (let [key, prog] of progression){
		// 	if ( prog.list ) {
		// 		prog.list = Object.values(prog.list);
		// 	} else prog.list = [];
		// }
		// Return the flattened submission data
		return foundry.utils.flattenObject(formData);
	}
	
	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	async getData(options) {
		const sheetData = await super.getData(options);
		const item = sheetData.item;
		const source = item.toObject();
		const itemData =  this.item.system;

		foundry.utils.mergeObject(sheetData, {
			source: source.system,
			system: item.system,
			labels: this.item.labels,
			isOwned: item.isOwned,
			isCharacterOwned: item.isOwned && item.parent.type==="character",
			isNPCOwned: item.isOwned && item.parent.type==="npc",
			isSimpleOwned: item.isOwned && item.parent.type==="simle",

			config: CONFIG.T20,
			// itemType: sheetData.item.type.capitalize(),
			itemType: game.i18n.localize(`Types.Item.${item.type}`),
			itemStatus: this._getItemStatus(),
			itemProperties: this._getItemProperties(),
			isPhysical: item.system.hasOwnProperty("qtd"),
			// TextEditors
			htmlFields: {
				description: await TextEditor.enrichHTML(item.system.description.value, {
					secrets: item.isOwner,
					async: true,
					relativeTo: this.item
				})
			},
			
			// Prepare Active Effects
			effects: ActiveEffectT20.prepareActiveEffectCategories(item.effects),
			// Resource to Consume
			abilityConsumptionTargets: this._getItemConsumptionTargets(item.system),
		});
		
		

		sheetData.documentName = "Item";
		return sheetData;
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

			html.find(".tag-input").keydown(this._onTagChange.bind(this));
			html.find(".tag-delete").click(this._onTagDelete.bind(this));
			
			// Progression Tab
			// html.find(".progression-control").click(this._onProgressionControl.bind(this));
			// html.find(".progression-option-control").click(this._onProgressionOptionControl.bind(this));

			html.find(".trait-selector").click(this._onConfigureTraits.bind(this));
			
			html.find(".effect-control-list").click(ev => {
				let parent = ev.currentTarget.closest('.effect-controls');
				let list = $(parent).find('.add-status-effects');
				$(list).addClass('active');
			});
			html.find(".effect-control-status").click(ev => {
				ActiveEffectT20.onManageActiveEffect(ev, this.item)
			});
			html.find(".effect-control").click(ev => {
				ActiveEffectT20.onManageActiveEffect(ev, this.item)
			});
		}
		html.mousemove(ev => this._moveTooltips(ev));
	}
	
	/* -------------------------------------------- */
	/*  Interactions                                */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onSubmit(event, options = {}) {
		// Process the form data
		const formData = this._getSubmitData(null);
		if ( formData.rolltags ){
			let rolltags = [...this.item.system.rolltags, formData.rolltags];
			rolltags = rolltags.map(m=> m.capitalize());
			formData[`system.rolltags`] = rolltags;
			delete formData.rolltags;
			options.updateData = formData;
		}
		await super._onSubmit(event, options);
	}

	async _onTagChange(event) {
		const key = event.key;
		// Valid entries
		if ( !key.match(/([A-z]|\d|-|:)/) ) {
			event.preventDefault();
		}
		if ( key.match(/(Enter|;|,|\s)/) ){
			return this._onSubmit(event);
		}
	}

	async _onTagDelete(event) {
		const tag = event.currentTarget;
		const idx = tag.dataset.tagId;
		const rolltags = this.item.system.rolltags;
		rolltags.splice(idx,1);
		this.item.update({[`system.rolltags`]:rolltags});
	}

	/** @inheritdoc */
	async _onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		// const actor = this.actor;
		// console.log(data);
		// console.log(this);
		// Handle different data types
		switch ( data.type ) {
			case "ActiveEffect":
				// return this._onDropActiveEffect(event, data);
			case "Item":
				return this._onDropItem(event, data);
		}
	}

	/* -------------------------------------------- */

	_onDropItem(event, data){
		let tgt = event.target;
		if( !tgt.classList.contains('opt-uuid') ){
			tgt = tgt.closest('li').querySelector('.opt-uuid');
		}
		let pIndex = Number(tgt.dataset.pIndex);
		let oIndex = Number(tgt.dataset.oIndex);
		if( pIndex>=0 && oIndex>=0 && data.uuid ){
			let progression = foundry.utils.deepClone(this.item.system.progression);
			progression[pIndex]['list'][oIndex] = {
				type: "item",
				value: data.uuid,
				selected: false
			}

			return this.item.update({
				[`system.progression`]: progression
			});
		}
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
	_getItemStatus() {
		if( this.item.type == 'classe' ){
			return game.i18n.localize(this.item.system.inicial ? "T20.ClassOriginal" : "");
		} else if( this.item.type === "magia" ){
			return game.i18n.localize(this.item.system.preparada ? "T20.SpellPrepPrepared" : "");
		} else if ( ["arma"].includes(this.item.type) ){
			if ( game.settings.get("tormenta20", "equipmentSlots") ) {
				return game.i18n.localize(this.item.system.equipado2.slot ? ( parseInt(this.item.system.equipado2.slot) == 12 ? "T20.WieldedDual" : "T20.Wielded" ) : "");
			} else {
				return game.i18n.localize(this.item.system.equipado ? ( this.item.system.equipado == 2 ? "T20.WieldedDual" : "T20.Wielded" ) : "");
			}
		} else if ( ["equipamento"].includes(this.item.type) ){
			if ( game.settings.get("tormenta20", "equipmentSlots") ) {
				return game.i18n.localize(this.item.system.equipado2.slot ? "T20.Weared" : "");
			} else {
				return game.i18n.localize(this.item.system.equipado ? "T20.Weared" : "");
			}
		} else {
			return '';
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
			const rolls = this.item.system.toObject().rolls;
			rolls[key].parts.push(["","",""]);
			return await this.item.update({"system.rolls": rolls });
		}

		// Remove a damage component
		if ( a.classList.contains("delete-part") && a.dataset.rollId ) {
			await this._onSubmit(event);  // Submit any unsaved changes
			const key = a.dataset.rollId;
			const li = a.closest(".roll-part");
			const rolls = this.item.system.toObject().rolls;
			rolls[key].parts.splice(Number(li.dataset.rollPart), 1);
			return this.item.update({ [`system.rolls`]: rolls });
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
		let itemData = this.object.toObject();
		delete itemData._id;
		delete itemData.stats;
		
		itemData.type = "consumivel";
		itemData.name = game.i18n.format('T20.ConsumableSpellName',{
			item: game.i18n.localize('T20.ConsumableSubtypeScroll'),
			name:this.object.name
		}),
		itemData.img = "systems/tormenta20/icons/itens/itens-magicos/pergaminho.webp",
		itemData.flags.core.sourceId = this.object.uuid;
		itemData.system.qtd = 1;
		itemData.system.espacos = 0.5;
		itemData.system.preco = 30 * (itemData.system.ativacao.custo**2);
		itemData.system.ativacao.custo = 0; 
		itemData.system.tipo = "scroll";
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