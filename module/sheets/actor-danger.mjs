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
		sheetData.htmlFields = sheetData.htmlFields || {};
		sheetData.htmlFields.objetivo = await this.enrichHTML(sheetData.system.goal || "", sheetData);
		sheetData.htmlFields.efeito = await this.enrichHTML(sheetData.system.effects || "", sheetData);
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

		sheetData.isGM = game.user.isGM;
		console.log("DangerSheetT20 | getData:", sheetData);

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
		if (!this.options.editable) return;

		if (this.actor.isOwner) {
			html.find(".poder-rollable").click((event) => this._onItemRoll(event));
		}

		html.find(".danger-goal-rollable").click(this._onGoalRoll.bind(this));
		html.find(".danger-effects-rollable").click(this._onEffectsRoll.bind(this));
		html.find(".item-create").off("click").on("click", this._onItemCreate.bind(this));
		html.find(".item-edit").off("click").on("click", this._onItemEdit.bind(this));
		html.find(".item-delete").off("click").on("click", this._onItemDelete.bind(this));
		html.find("[data-action='power']").click(this._onPowerRoll.bind(this));
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
	 * Handle editing an existing Owned Item for the Actor
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onItemEdit(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		item.sheet.render(true);
	}

	/**
	 * Handle deleting an existing Owned Item for the Actor
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemDelete(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);

		const confirmed = await Dialog.confirm({
			title: "Deletar Item",
			content: `<p>Tem certeza que deseja deletar <strong>${item.name}</strong>?</p>`,
			defaultYes: false
		});

		if (confirmed) {
			await item.delete();
		}
	}

	/**
	 * Handle clicking on a power to use it
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onPowerRoll(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);

		if (item) {
			return item.roll();
		}
	}

	/**
	 * Handle clicking on the Goal rollable area
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onGoalRoll(event) {
		event.preventDefault();
		const goal = this.actor.system.goal;
		console.log("Goal:", goal);

		if (!goal || goal.trim() === "") {
			ui.notifications.warn("Objetivo não definido!");
			return;
		}

		const message = `
			<div class="tormenta20 chat-card">
        <header class="card-header flexrow">
          <img src="${this.actor.img}" title="${this.actor.name}" width="36" height="36"/>
          <h3>Objetivo</h3>
        </header>
        <p>
          ${goal}
        </p>
      </div>`;

		this._toChat(message);
	}

	/**
	 * Handle clicking on the Effects rollable area
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onEffectsRoll(event) {
		event.preventDefault();
		const effects = this.actor.system.effects;

		if (!effects || effects.trim() === "") {
			ui.notifications.warn("Efeito não definido!");
			return;
		}

		const message = `
			<div class="tormenta20 chat-card">
        <header class="card-header flexrow">
          <img src="${this.actor.img}" title="${this.actor.name}" width="36" height="36"/>
          <h3>Efeito</h3>
        </header>
        <p>
        	${effects}
        </p>
      </div>`;

		this._toChat(message);
	}
}
