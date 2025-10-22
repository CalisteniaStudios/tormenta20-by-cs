import TraitSelector from "../apps/trait-selector.mjs";
import ActiveEffectT20 from "../documents/active-effects.mjs";
import ItemT20 from "../documents/item.mjs";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export default class ItemSheetT20 extends foundry.appv1.sheets.ItemSheet {
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
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "description"
				}
			],
			dragDrop: [{ dragSelector: "[data-effect-id]", dropSelector: ".effects-list" }, { dropSelector: ".opt-drop" }]
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	get template() {
		const path = "systems/tormenta20/templates/item";
		if (["consumivel", "tesouro"].includes(this.item.type)) {
			return `${path}/item-sheet.hbs`;
		} else if (this.item.type === "armadura") {
			return `${path}/equip-sheet.hbs`;
		} else if (["comodo", "mobilia"].includes(this.item.type)) {
			return `${path}/room-furniture-sheet.hbs`;
		}
		return `${path}/${this.item.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	setPosition(position = {}) {
		if (!(this._minimized || position.height)) {
			position.height = this._tabs[0].active === "details" ? "auto" : this.options.height;
		}
		return super.setPosition(position);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getSubmitData(updateData = {}) {
		const formData = foundry.utils.expandObject(super._getSubmitData(updateData));
		// Create the expanded update data object
		// const fd = new foundry.applications.ux.FormDataExtended(this.form, {editors: this.editors});
		// let tdata = fd.object;
		// let data = fd.object;//{};
		// for (let key of Object.keys( tdata ) ){
		// 	let nkey = key.replace(/^system./, 'data.');
		// 	data[ nkey ] = tdata[key];
		// }
		// if ( updateData ) formData = foundry.utils.mergeObject(formData, updateData);
		// else data = foundry.utils.expandObject(data);

		// Handle rolls array
		if (formData.system?.rolls) {
			formData.system.rolls = Object.values(formData.system.rolls || []);
			let rolls = Object.entries(formData.system?.rolls || []);
			for (let [key, roll] of rolls) {
				if (roll) roll.parts = Object.values(roll?.parts || {}).map((d) => [d[0] || "", d[1] || ""]);
				if (roll) roll.key = roll.type + key;
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
		const rollOptions = {};
		rollOptions.pericias = Object.entries(T20.pericias).reduce((acc, [k, v]) => {
			const data = { value: k, label: v.label };
			if (["atua", "luta", "pont"].includes(k)) {
				data.group = "T20.DefaultPlural";
				acc[0].push(data);
			} else {
				data.group = "Outras Perícias";
				acc[1].push(data);
			}
			return acc;
		}, [[], []]).flat();
		rollOptions.atributos = Object.entries(T20.atributos).reduce((acc, [value, label]) => {
			acc.push({ value, label });
			return acc;
		}, []);
		rollOptions.atributosDano = rollOptions.atributos.map(i => {
			i.value = `@${i.value}`
			return i;
		});
		rollOptions.atributosDano.unshift({ value: 'padrao', label: 'T20.Default' });

		const dT = [
			"dano", "perda",
			"corte", "impacto", "perfuracao",
			"acido", "eletricidade", "essencia", "fogo", "frio", "luz", "psiquico", "trevas",
			"curapv", "curatpv", "curapm", "curatpm"
		];
		rollOptions.damageTypes = dT.reduce((acc, value) => {
			let group = "T20.DamageElementalPlural";
			if (['dano', 'perda'].includes(value))
				group = "T20.DefaultPlural";
			else if (['curapv', 'curatpv', 'curapm', 'curatpm'].includes(value))
				group = "T20.HealingPlural";
			else if (['corte', 'impacto', 'perfuracao'].includes(value))
				group = "T20.DamagePhysicalPlural";
			acc.push({
				value, group,
				label: T20.damageTypes[value] ?? T20.healingTypes[value],
			})
			return acc;
		}, []);

		foundry.utils.mergeObject(sheetData, {
			rootId: this.id,
			source: source.system,
			schema: item.system.schema,
			system: item.system,
			labels: this.item.labels,
			isOwned: item.isOwned,
			isCharacterOwned: item.isOwned && item.parent.type === "character",
			isNPCOwned: item.isOwned && item.parent.type === "npc",
			isSimpleOwned: item.isOwned && item.parent.type === "simple",

			itemUpgradeStatus: this._itemUpgradeStatus,
			rollOptions,
			config: CONFIG.T20,
			// itemType: sheetData.item.type.capitalize(),
			itemType: game.i18n.localize(`TYPES.Item.${item.type}`),
			itemStatus: this._getItemStatus(),
			itemProperties: this._getItemProperties(),
			isPhysical: foundry.utils.hasProperty(item.system, "qtd"),
			// TextEditors
			htmlFields: {
				description: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description.value, {
					secrets: item.isOwner,
					async: true,
					relativeTo: this.item
				})
			},

			// Prepare Active Effects
			effects: ActiveEffectT20.prepareActiveEffectCategories(item.effects),
			// Resource to Consume
			abilityConsumptionTargets: this._getItemConsumptionTargets(item.system),
			rolltags: foundry.applications.elements.HTMLStringTagsElement.create({
				localize: true,
				name: "system.rolltags",
				placeholder: "Tags",
				value: item.system.rolltags
			}).outerHTML
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
		if (!consume.type) return [];
		const actor = this.item.actor;
		if (!actor) return {};

		// Ammunition
		if (consume.type === "ammo") {
			return actor.itemTypes.consumivel.reduce((ammo, i) => {
				if (i.system.tipo === "ammo") {
					ammo[i.id] = `${i.name} (${i.system.qtd})`;
				}
				return ammo;
			}, {});
			// {[i._id]: `${i.name} (${item.qtd})`}
		}

		// Resources
		else if (consume.type === "attribute") {
			const resources = this.item.actor?.system.resources ?? {};
			return Object.entries(resources).reduce((object, r) => {
				object[r[0]] = r[1].label;
				return object;
			}, {});
		}
		// Materials
		else if (consume.type === "material") {
			return actor.items.reduce((obj, i) => {
				if (["consumivel", "tesouro"].includes(i.type) && !i.ativacao) {
					obj[i.id] = `${i.name} (${i.system.qtd})`;
				}
				return obj;
			}, {});
		}
		return {};
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	activateListeners(html) {
		super.activateListeners(html);
		if (this.isEditable) {
			html.find(".rolls-control").click(this._onRollsControl.bind(this));
			html.find(".parts-control").click(this._onPartsControl.bind(this));

			html.find(".trait-selector").click(this._onConfigureTraits.bind(this));

			html.find(".effect-control-list").click((ev) => {
				let parent = ev.currentTarget.closest(".effect-controls");
				let list = $(parent).find(".add-status-effects");
				$(list).toggleClass("active");
			});
			html.find(".effect-control-status").click((ev) => {
				ActiveEffectT20.onManageActiveEffect(ev, this.item);
			});
			html.find(".effect-control").on("click contextmenu", (ev) => ActiveEffectT20.onManageActiveEffect(ev, this.item));
			if (this.item.system.enableAutoUpgrades) {
				html.find(".tab.enhancements .updateUpgrades").change(async (ev) => {
					const { value } = ev.currentTarget;
					const { name } = ev.currentTarget.dataset;
					const key = name.replace("system.upgrades.", "");
					// TODO: Refactoring. Isso ta fazendo 5 updates em sequência.
					if (this.item.system.upgrades[key]) await this._deleteEffect(this.item.system.upgrades[key]);
					if (value) await this._createEffect(value);
					await this.item.update({ [name]: value });
				});
			}

			// Progression Tab
			// html.find(".progression-control").click(this._onProgressionControl.bind(this));
			// html.find(".progression-option-control").click(this._onProgressionOptionControl.bind(this));
		}
	}

	/* -------------------------------------------- */
	/*  Interactions                                */
	/* -------------------------------------------- */

	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
		const item = this.item;
		const allowed = Hooks.call("dropItemSheetData", item, this, data);
		if (allowed === false) return;

		// Dropped Documents
		const documentClass = foundry.utils.getDocumentClass(data.type);
		if (documentClass) {
			const document = await documentClass.fromDropData(data);
			await this._onDropDocument(event, document);
		}
	}

	async _onDropDocument(event, document) {
		switch (document.documentName) {
			case "ActiveEffect":
				return (await this._onDropActiveEffect(event, document)) ?? null;
			case "Item":
				return (await this._onDropItem(event, document)) ?? null;
			default:
				return null;
		}
	}

	async _onDropActiveEffect(event, data) {
		const effect = await ActiveEffect.implementation.fromDropData(data);
		if (!this.item.isOwner || !effect) return false;
		if (effect.target === this.item) return false;
		return ActiveEffect.implementation.create(effect.toObject(), { parent: this.item });
	}

	// /** @override */
	// _onDragStart(event) {
	// 	console.log("onDragStart");
	// 	super._onDragStart(event);
	// }

	/**
	 * An event that occurs when a drag workflow begins for a draggable item on the sheet.
	 * @param {DragEvent} event       The initiating drag start event
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _onDragStart(event) {
		const target = event.currentTarget;
		if ("link" in event.target.dataset) return;
		let dragData;

		// Active Effect
		if (target.dataset.effectId) {
			const effect = this.item.effects.get(target.dataset.effectId);
			dragData = effect.toDragData();
		}

		// Set data transfer
		if (!dragData) return;
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	/** @inheritdoc */
	// async _onDrop(event) {
	// 	const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
	// 	// Handle different data types
	// 	switch (data.type) {
	// 		case "ActiveEffect":
	// 			// return this._onDropActiveEffect(event, data);
	// 		case "Item":
	// 			return this._onDropItem(event, data);
	// 	}
	// }

	/* -------------------------------------------- */

	_onDropItem(event, data) {
		let tgt = event.target;
		if (!tgt.classList.contains("opt-uuid")) {
			tgt = tgt.closest("li").querySelector(".opt-uuid");
		}
		let pIndex = Number(tgt.dataset.pIndex);
		let oIndex = Number(tgt.dataset.oIndex);
		if (pIndex >= 0 && oIndex >= 0 && data.uuid) {
			let progression = foundry.utils.deepClone(this.item.system.progression);
			progression[pIndex].list[oIndex] = {
				type: "item",
				value: data.uuid,
				selected: false
			};

			return this.item.update({
				"system.progression": progression
			});
		}
	}

	/* -------------------------------------------- */

	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		if (this.object.type === "magia" && (this.actor?.getFlag("tormenta20", "createScroll") || game.user.isGM)) {
			buttons.unshift({
				label: game.i18n.localize("T20.WriteScroll"),
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
		if (this.item.type === "classe") {
			return game.i18n.localize(this.item.system.inicial ? "T20.ClassOriginal" : "");
		} else if (this.item.type === "magia") {
			return game.i18n.localize(this.item.system.preparada ? "T20.SpellPrepPrepared" : "");
		} else if (["arma"].includes(this.item.type)) {
			if (game.settings.get("tormenta20", "equipmentSlots")) {
				return game.i18n.localize(
					this.item.system.equipado2.slot
						? parseInt(this.item.system.equipado2.slot) === 12
							? "T20.WieldedDual"
							: "T20.Wielded"
						: ""
				);
			}
			return game.i18n.localize(
				this.item.system.equipado ? (this.item.system.equipado === 2 ? "T20.WieldedDual" : "T20.Wielded") : ""
			);
		} else if (["equipamento"].includes(this.item.type)) {
			if (game.settings.get("tormenta20", "equipmentSlots")) {
				return game.i18n.localize(this.item.system.equipado2.slot ? "T20.Weared" : "");
			}
			return game.i18n.localize(this.item.system.equipado ? "T20.Weared" : "");
		}
		return "";
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
		if (this.item.type === "arma") {
			props.push(
				...Object.entries(this.item.system.propriedades)
					.filter((e) => e[1] === true)
					.map((e) => CONFIG.T20.weaponProperties[e[0]])
			);
		} else if (this.item.type === "magia") {
			let hTags = {
				ativacao: "T20.ActivationCost",
				range: "T20.Range",
				target: "T20.Target",
				area: "T20.Area",
				effect: "T20.Effect",
				duration: "T20.Duration",
				save: "T20.Resistance"
			};

			for (let [h, tag] of Object.entries(hTags)) {
				hTags[h] = game.i18n.localize(tag);
			}
			props.push(
				labels.ativacao ? `<b>${hTags.ativacao}:</b> ${labels.ativacao}` : null,
				labels.range ? `<b>${hTags.range}:</b> ${labels.range}` : null,
				labels.alvo ? `<b>${hTags.target}:</b> ${labels.alvo}` : null,
				labels.area ? `<b>${hTags.area}:</b> ${labels.area}` : null,
				labels.effect ? `<b>${hTags.effect}:</b> ${labels.effect}` : null,
				labels.duration ? `<b>${hTags.duration}:</b> ${labels.duration}` : null,
				labels.save ? `<b>${hTags.save}:</b> ${labels.save}` : null
			);
		}
		return props.filter(Boolean);
	}

	/* -------------------------------------------- */

	/**
	 *	Get consummable resources;
	 * @param {Object} item		Item being displayed
	 * @returns {{string: string}} An object of valid consummable resources;
	 */
	_getConsummableResources(item) {
		const consume = item.system.consume || {};
		if (!consume.type) return [];
		const actor = this.item.actor;
		if (!actor) return {};

		// Ammunition
		if (consume.type === "ammo") {
			return actor.itemTypes.consumivel.reduce(
				(ammo, i) => {
					if (i.system.consumableType === "ammo") {
						ammo[i.id] = `${i.name} (${i.system.quantidade})`;
					}
					return ammo;
				},
				{ [item._id]: `${item.name} (${item.system.quantidade})` }
			);
		}

		// Attributes
		else if (consume.type === "attribute") {
			const attributes = Object.values(CombatTrackerConfig.prototype.getAttributeChoices())[0]; // Bit of a hack
			return attributes.reduce((obj, a) => {
				obj[a] = a;
				return obj;
			}, {});
		}

		// Materials
		else if (consume.type === "material") {
			return actor.items.reduce((obj, i) => {
				if (["consumivel", "tesouro"].includes(i.type) && !i.system.ativacao) {
					obj[i.id] = `${i.name} (${i.system.consumivel})`;
				}
				return obj;
			}, {});
		}
		return {};
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
		if (a.classList.contains("add-part") && a.dataset.rollId) {
			await this._onSubmit(event); // Submit any unsaved changes
			const key = a.dataset.rollId;
			const rolls = this.item.system.toObject().rolls;
			rolls[key].parts.push(["", "", ""]);
			return await this.item.update({ "system.rolls": rolls });
		}

		// Remove a damage component
		if (a.classList.contains("delete-part") && a.dataset.rollId) {
			await this._onSubmit(event); // Submit any unsaved changes
			const key = a.dataset.rollId;
			const li = a.closest(".roll-part");
			const rolls = this.item.system.toObject().rolls;
			rolls[key].parts.splice(Number(li.dataset.rollPart), 1);
			return this.item.update({ "system.rolls": rolls });
		}
	}

	async _onRollsControl(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// Add new roll component
		if (a.classList.contains("add-roll")) {
			// await this._onSubmit(event);  // Submit any unsaved changes
			let rolltype = a.dataset.rollType;
			let roll = foundry.utils.deepClone(this.item.system.rolls);
			const r = {
				parts: [],
				name: rolltype.capitalize(),
				type: rolltype,
				key: rolltype
			};
			if (rolltype === "dano") {
				r.parts = [["1d6", "dano"], [""]];
				r.adaptavel = "";
			}
			roll.push(r);
			return this.item.update({ "system.rolls": roll });
		}

		// Remove a roll component
		if (a.classList.contains("delete-roll") && a.dataset.rollId) {
			let rolls = foundry.utils.deepClone(this.item.system.rolls);
			rolls.splice(Number(a.dataset.rollId), 1);
			return this.item.update({ "system.rolls": rolls });
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

		switch (a.dataset.options) {
			case "pericias": {
				const skills = this.item.system.pericias;
				const choiceSet = skills.escolhas?.length ? skills.escolhas : Object.keys(CONFIG.T20.pericias);
				options.choices = Object.fromEntries(
					Object.entries(CONFIG.T20.pericias).filter(([skill]) => choiceSet.includes(skill))
				);
				options.allowCustom = true;
				options.minimum = skills.numero;
				options.maximum = skills.numero;
				break;
			}
		}

		new TraitSelector(this.item, options).render(true);
	}

	/* -------------------------------------------- */

	/**
	 * Replicate the spell as a consumable scroll item.
	 * @param {Event} event   The click event which originated the selection
	 * @private
	 */
	_createScroll() {
		let itemData = this.object.toObject();
		delete itemData._id;
		delete itemData.stats;

		itemData.type = "consumivel";
		itemData.name = game.i18n.format("T20.ConsumableSpellName", {
			item: game.i18n.localize("T20.ConsumableSubtypeScroll"),
			name: this.object.name
		});
		itemData.img = "systems/tormenta20/icons/itens/itens-magicos/pergaminho.webp";
		itemData.flags = {
			core: {
				sourceId: this.object.uuid
			}
		};
		itemData.system.qtd = 1;
		itemData.system.espacos = 0.5;
		itemData.system.preco = 30 * itemData.system.ativacao.custo ** 2;
		itemData.system.ativacao.custo = 0;
		itemData.system.tipo = "scroll";
		if (this.actor) {
			this.actor.createEmbeddedDocuments("Item", [itemData]);
			if (this.actor.type === "character") {
				let msg = game.i18n.format("T20.ConsumableCreated", {
					actor: this.actor.name,
					name: itemData.name
				});
				ChatMessage.create({ content: msg });
			}
		} else {
			ItemT20.create(itemData);
		}
	}

	async _createEffect(upgrade) {
		const availableEffects = this._availableEffects;
		if (!availableEffects || !availableEffects[upgrade]) return;

		const effect = {
			...availableEffects[upgrade],
			name: game.i18n.localize(availableEffects[upgrade].name),
			description: game.i18n.localize(availableEffects[upgrade].description ?? ""),
			icon: this.item.img,
			origin: this.item.uuid,
			// We need to internationalize the items list
			flags: {
				...availableEffects[upgrade].flags,
				tormenta20: {
					...availableEffects[upgrade].flags.tormenta20,
					items: (availableEffects[upgrade].flags.tormenta20.items || "")
						.split(";")
						.map((i) => i.trim())
						.filter((i) => !!i)
						.map((i) => game.i18n.localize(i))
						.join(";")
				}
			}
		};

		if (!effect) return;

		if (effect.transfer) await this.item.actor?.createEmbeddedDocuments("ActiveEffect", [effect], { render: false });
		await this.item.createEmbeddedDocuments("ActiveEffect", [effect], { render: false });
	}

	async _deleteEffect(upgrade) {
		const effectsToDelete = [
			this.item.getEmbeddedCollection("ActiveEffect").contents,
			this.item.actor?.getEmbeddedCollection("ActiveEffect").contents
		]
			.flat()
			.filter((e) => !!e && e.flags?.tormenta20?.upgrade === upgrade && e.origin === this.item.uuid);

		// Delete old effects
		if (effectsToDelete.length) {
			const actorEffectsToDelete = effectsToDelete.filter((e) => e.parent.id === this.item.actor?.id).map((e) => e.id);
			const itemEffectsToDelete = effectsToDelete.filter((e) => e.parent.id === this.item.id).map((e) => e.id);

			await this.item.actor?.deleteEmbeddedDocuments("ActiveEffect", actorEffectsToDelete, { render: false });
			await this.item.deleteEmbeddedDocuments("ActiveEffect", itemEffectsToDelete, { render: false });
		}
	}

	get _itemUpgradeStatus() {
		const status = this._upgradeStatus;
		if (!status || !this.item.system?.upgrades) return "";

		const statusByType = {};

		Object.values(this.item.system.upgrades).forEach((v) => {
			if (!v || !v.length) return;
			statusByType[v] = status[v] === "DONE" ? "implemented" : "not-implemented";
		});

		return statusByType;
	}

	get _availableEffects() {
		if (!this._isUpgradable) return null;

		const upgrades = { ...T20.upgrades.general };

		if (this.item.type === "arma") {
			return Object.assign(upgrades, T20.upgrades.weapon);
		}

		if (this.item.system.tipo === "ammo") {
			return Object.assign(upgrades, T20.upgrades.ammo);
		}

		if (this.item.system.tipo === "esoterico") {
			return Object.assign(upgrades, T20.upgrades.esoteric);
		}

		if (["traje", "ferramenta"].includes(this.item.system.tipo)) {
			return Object.assign(upgrades, T20.upgrades.tools);
		}

		return Object.assign(upgrades, T20.upgrades.armor.general, T20.upgrades.armor[this.item.system.tipo]);
	}

	get _upgradeStatus() {
		if (!this._isUpgradable) return null;

		const status = { ...T20.upgrades.general.status };

		if (this.item.type === "arma") {
			return Object.assign(status, T20.upgrades.weapon.status);
		}

		if (this.item.system.tipo === "ammo") {
			return Object.assign(status, T20.upgrades.ammo.status);
		}

		if (this.item.system.tipo === "esoterico") {
			return Object.assign(status, T20.upgrades.esoteric.status);
		}

		if (["traje", "ferramenta"].includes(this.item.system.tipo)) {
			return Object.assign(status, T20.upgrades.tools.status);
		}

		return Object.assign(status, T20.upgrades.armor.status);
	}

	get _isUpgradable() {
		if (!["arma", "equipamento", "consumivel"].includes(this.item.type)) return false;
		if (
			this.item.system.tipo
			&& !["esoterico", "pesada", "leve", "escudo", "ferramenta", "traje", "ammo"].includes(this.item.system.tipo)
		)
			return false;

		return true;
	}
}
