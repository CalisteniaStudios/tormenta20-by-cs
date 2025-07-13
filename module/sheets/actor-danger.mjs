import ActorSheetT20 from "./actor-base.mjs";

/**
 * An Actor sheet for Danger (Complex Threat) type characters.
 * Extends the base ActorSheetT20 class.
 * @extends {ActorSheetT20}
 */
export default class DangerSheetT20 extends ActorSheetT20 {
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "danger"],
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "attributes"
				}
			],
			template: "systems/tormenta20/templates/actor/danger-sheet.hbs",
			width: 550,
			height: 700
		});
	}

	get unsupportedItemTypes() {
		return new Set(Item.TYPES.filter((i) => !["base", "poder"].includes(i)));
	}

	/* -------------------------------------------- */
	/*  Helper Functions                            */
	/* -------------------------------------------- */

	/**
	 * Helper function to send messages to chat
	 * @param {string} message - The message content (HTML)
	 * @private
	 */
	_toChat(message) {
		let chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			content: message,
			speaker: ChatMessage.getSpeaker({ actor: this.actor })
		};
		ChatMessage.create(chatData);
	}

	/* -------------------------------------------- */
	/*  SheetPreparation                            */
	/* -------------------------------------------- */

	/** @override */
	async getData() {
		const sheetData = await super.getData();
		sheetData.htmlFields ??= {};
		// sheetData.htmlFields.objetivo = await this.enrichHTML(sheetData.system.attributes.goal || "", sheetData);
		sheetData.htmlFields.efeito = await this.enrichHTML(sheetData.system.detalhes.effects || "", sheetData);
		sheetData.htmlFields.biography = await this.enrichHTML(
			sheetData.system.detalhes?.biography?.value || "",
			sheetData
		);

		if (game.user.isGM) {
			sheetData.htmlFields.biographyGM = await this.enrichHTML(
				sheetData.system.detalhes?.biography?.gm || "",
				sheetData
			);
		}

		await this._prepareItems(sheetData);

		return sheetData;
	}

	/**
	 * Organize and classify Items for Danger sheets
	 * @param {Object} sheetData The actor sheet data object
	 * @private
	 */
	async _prepareItems(sheetData) {
		const poderes = [];
		for (let item of sheetData.items) {
			item.img = item.img || CONST.DEFAULT_TOKEN;

			item.system.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
				item.system.description.value,
				{
					secrets: true,
					async: true,
					relativeTo: item
				}
			);

			if (item.type === "poder") {
				poderes.push(item);
			}
		}

		sheetData.actor.poderes = poderes.sort((a, b) => a.name.localeCompare(b.name));
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".item .item-name > label, .item .item-description").click((event) => this._onItemSummary(event));

		if (!this.options.editable) return;

		html.find(".danger-effects-rollable").click(this._onEffectsRoll.bind(this));
		html.find(".item-create").off("click").on("click", this._onItemCreate.bind(this));
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers               */
	/* -------------------------------------------- */

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		event.stopPropagation();

		const header = event.currentTarget;
		const type = header.dataset.type;
		const name = `Nova ${type === "poder" ? "Ação" : "Item"}`;
		const itemData = {
			name: name,
			type: type,
			system: {}
		};
		return await Item.create(itemData, { parent: this.actor });
	}

	/**
	 * Handle clicking on the Effects rollable area
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onEffectsRoll(event) {
		event.preventDefault();
		const effects = this.actor.system.detalhes.effects;

		if (!effects || effects.trim() === "") {
			ui.notifications.warn("Efeito não definido!");
			return;
		}

		const content = {
			item: {
				name: this.actor.name,
				img: this.actor.img
			},
			system: {
				description: {
					value: effects
				}
			}
		};

		const template = "systems/tormenta20/templates/chat/chat-card.hbs";
		const html = await foundry.applications.handlebars.renderTemplate(template, content);
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_STYLES.OTHER,
			content: html
		};
		ChatMessage.create(chatData);
	}
}
