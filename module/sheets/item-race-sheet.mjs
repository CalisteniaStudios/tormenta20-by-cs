import ItemSheetT20 from "./item-sheet.mjs";

export default class RaceSheetT20 extends ItemSheetT20 {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			dragDrop: [{ dragSelector: ".choiceset-item .item", dropSelector: ".choiceset" }]
		});
	}

	get unsupportedItemTypes() {
		return new Set(["comobodo", "mobilia", "race", "classe"]);
	}

	async getData() {
		const context = await super.getData();
		await Promise.all(
			this.item.system.grants.map(async (cs, index) => {
				const choices = await Promise.all(
					cs.choices.map(async (c) => {
						const item = await fromUuid(c.uuid);
						if (!item) return null;
						c.img = item.img;
						c.name = item.name;
						return c;
					})
				);
				cs.choices = choices.filter(Boolean);
				this.item.system.grants[index] = cs;
			})
		);
		return context;
	}

	_cache = {};

	/* -------------------------------------------- */

	async activateListeners(html) {
		super.activateListeners(html);
		html.find(".item .item-name > label, .item .item-description").click((event) => this._onItemSummary(event));

		html.find("[data-action='add-choiceset']").on("click", this._onAddChoiceSet.bind(this));
		html.find("[data-action='delete-choiceset']").on("click", this._onDeleteChoiceSet.bind(this));
		html.find("[data-action='delete-item']").on("click", this._onDeleteItem.bind(this));
		// @todo add click event on item's img/label to render the item
	}

	async _onItemSummary(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents(".choiceset-item");
		const uuid = li.data("uuid");
		// fromUuid é custoso e pouco responsivo, por isso vale a pena usar cache
		let item = this._cache[uuid] ?? (await fromUuid(uuid));
		if (!item) return;
		this._cache[uuid] = item;
		let chatData = await item.getChatData();
		if (!chatData.description.value) return;
		// Toggle summary
		if (li.hasClass("expanded")) {
			let summary = li.children(".item-summary");
			summary.slideUp(200, () => summary.remove());
		} else {
			let div = $(`<div class="item-summary">${chatData.description.value}</div>`);
			let props = $("<div class='item-properties'></div>");
			div.append(props);
			li.append(div.hide());
			div.slideDown(200);
		}
		li.toggleClass("expanded");
	}

	_onAddChoiceSet(event) {
		event.preventDefault();
		const grants = this.item.system.grants ?? [];
		// @todo add Creation Dialog
		grants.push({
			title: "",
			desc: "",
			type: "multi",
			choices: []
		});
		this.item.update({ "system.grants": grants });
	}

	_onDeleteChoiceSet(event) {
		event.preventDefault();
		const { id } = event.target.closest(".choiceset").dataset;
		if (!id) return;
		const grants = this.item.system.grants.filter((item, index) => index !== Number(id));
		this.item.update({ "system.grants": grants });
	}

	_onDeleteItem(event) {
		event.preventDefault();
		const { id: index } = event.target.closest(".choiceset-item").dataset;
		const { id } = event.target.closest(".choiceset").dataset;
		if (!index || !id) return;
		const grants = this.item.system.grants;
		grants[id].choices = grants[id].choices.filter((item, _index) => _index !== Number(index));
		this.item.update({ "system.grants": grants });
	}

	/* -------------------------------------------- */

	async _onDragStart(event) {
		const li = event.currentTarget;
		if (event.target.classList.contains("content-link")) return;
		if (!li.closest(".choiceset-item").dataset.uuid) return super._onDragStart(event);

		const dragData = this._getEntryDragData(li.closest(".choiceset-item").dataset.uuid);
		if (!dragData) return;

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	}

	_getEntryDragData(entryId) {
		const entry = this.item.system.grants.findIndex((cs) => cs.choices.find((c) => c.uuid === entryId));
		if (Number.isNumeric(entry)) {
			return {
				choiceSet: entry,
				type: "Item",
				uuid: entryId
			};
		}
	}

	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
		if (!["Item", "Folder"].includes(data.type)) return super._onDrop(event, data);

		if (data.type === "Folder") return this._onDropFolder(event, data);
		return await this._onDropItem(event, data);
	}

	async _onDropFolder(event, data) {
		const folder = await Folder.implementation.fromDropData(data);
		if (!this.item.isOwner || folder.type !== "Item") return [];

		await Promise.all(
			folder.contents.map(async (item) => {
				if (!(item instanceof Item)) item = await fromUuid(item.uuid);
				if (this.unsupportedItemTypes.has(item.type)) return;
				return this._onDropItem(event, item.toDragData());
			})
		);
	}

	async _onDropItem(event, data) {
		// name não será guardado pois ele é lido sempre que a ficha é renderizada para evitar problemas ao renomear o item original
		const item = await Item.implementation.fromDropData(data);
		const { img, name, type, uuid } = item;

		const { id: setId } = event.target.closest(".choiceset").dataset;
		const grants = this.item.system.grants;

		if (this.unsupportedItemTypes.has(type)) return false;
		// if (data.choiceSet === Number(setId)) return false; // return this._onSortItem(event, item, setId);
		if (data.choiceSet === Number(setId)) return this._onSortItem(event, item, setId);
		if (grants[setId].choices.find((c) => c.uuid === uuid)) {
			ui.notifications.warn("T20.RepeatedGrant", { localize: true });
			return false;
		}
		if ("choiceSet" in data && data.choiceSet !== Number(setId)) {
			grants[data.choiceSet].choices = grants[data.choiceSet].choices.filter((c) => c.uuid !== uuid);
		}
		grants[setId].choices.push({ uuid });
		grants[setId].choices.sort((a, b) => a.name.localeCompare(b.name));

		return await this.item.update({ "system.grants": grants });
	}

	_onSortItem(event, item, setId) {
		const newPos = event.target.closest(".choiceset-item");
		if (!newPos) return false;
		const grants = this.item.system.grants;
		const choices = grants[setId].choices;
		const oldIndex = choices.findIndex((c) => c.uuid === item.uuid);
		const newIndex = Number(newPos.dataset.id);
		if (oldIndex === newIndex || choices[oldIndex].advancement > choices[newIndex].advancement) return false;
		this._sortArray(choices, newIndex, oldIndex);
		return this.item.update({ "system.grants": grants });
	}

	_sortArray(array, newIndex, oldIndex) {
		if (newIndex >= array.length) {
			let k = newIndex - array.length + 1;
			while (k--) {
				array.push(undefined);
			}
		}
		array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
	}
}
