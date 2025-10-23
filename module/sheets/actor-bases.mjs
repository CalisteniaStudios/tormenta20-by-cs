import ActorSheetT20 from "./actor-base.mjs";
export default class ActorSheetT20Bases extends ActorSheetT20 {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "bases"],
			template: "systems/tormenta20/templates/actor/bases-sheet.hbs",
			height: 600,
			width: 650
		});
	}

	/* -------------------------------------------- */

	get unsupportedItemTypes() {
		return new Set(Item.TYPES.filter((i) => !["comodo", "mobilia"].includes(i)));
	}

	/* -------------------------------------------- */

	async getData(options) {
		const sheetData = await super.getData(options);
		sheetData.residentes = this.actor.system.residentes
			.map((id) => game.actors.get(id))
			.filter((actor) => actor)
			.map((actor) => ({ id: actor.id, img: actor.img, name: actor.name }));
		return sheetData;
	}

	async _prepareItems(data) {
		data.comodos = this.actor.itemTypes.comodo.sort((a, b) => a.sort - b.sort);
		data.mobilias = this.actor.itemTypes.mobilia.sort((a, b) => a.sort - b.sort);
		data.residentes = this.actor.system.residentes
			.map((id) => game.actors.get(id))
			.filter((actor) => actor)
			.map((actor) => ({ id: actor.id, img: actor.img, name: actor.name }));
	}

	/* -------------------------------------------- */

	activateListeners(html) {
		super.activateListeners(html);

		// Item summaries
		html.find(".item .item-name > label, .item .item-description").click((event) => this._onItemSummary(event));

		// Listener para troca de porte
		html.find('select[name="system.porte"]').change(async (ev) => {
			const porte = ev.currentTarget.value;
			const roomsNumber = CONFIG.T20.roomsNumber[porte] ?? 0;
			await this.actor.update({ "system.rooms": roomsNumber });
		});
		html.find("[data-action='delete-item']").on("click", this._onDeleteItem.bind(this));
		html.find("[data-action='transfer-effects']").on("click", this._onTransferEffects.bind(this));
	}

	_onDeleteItem(event) {
		event.preventDefault();
		const { id } = event.target.closest(".choiceset-item").dataset;
		if (!id) return;
		const residentes = this.actor.system.residentes;
		residentes.delete(id);
		this.actor.update({ "system.residentes": residentes });
	}

	async _onTransferEffects(event) {
		const toCreate = [];
		const types = ["comodo", "mobilia"];
		for (const type of types) {
			for (const item of this.actor.itemTypes[type]) {
				if (!item.system.residentes || !item.effects.size) continue;
				for (const effect of item.effects) {
					const effectData = effect.toJSON();
					foundry.utils.setProperty(effectData, "flags.tormenta20.grantedFromBase", true);
					toCreate.push(effectData);
				}
			}
		}
		for (const id of this.actor.system.residentes) {
			const residente = game.actors.get(id);
			if (!residente || !residente.isOwner) continue;
			const toDelete = residente.effects.filter((ef) => ef.getFlag("tormenta20", "grantedFromBase")).map((ef) => ef.id);
			await residente.createEmbeddedDocuments("ActiveEffect", toCreate);
			await residente.deleteEmbeddedDocuments("ActiveEffect", toDelete);
		}
	}

	/* -------------------------------------------- */

	async _onDropActor(event, actor) {
		const uuid = actor.uuid.split("Actor.");
		const id = uuid.pop();
		if (uuid.filter(Boolean).length) return;
		if (game.actors.get(id).type !== "character") return;
		const residentes = this.actor.system.residentes;
		if (!residentes.has(id)) {
			residentes.add(id);
			this.actor.update({ "system.residentes": residentes });
		}
	}

	async _onDropItemCreate(itemData) {
		itemData = Array.isArray(itemData) ? itemData : [itemData];
		const remainingItems = [];
		const currentComodoNames = this.actor.itemTypes.comodo.map((p) => p.name).filter(Boolean);

		const mobilias = this.actor.itemTypes.mobilia.length;

		for (const item of itemData) {
			if (item.type === "comodo") {
				const comodoName = item.name?.trim();
				if (comodoName && currentComodoNames.includes(comodoName)) {
					ui.notifications.warn(
						`Já existe um cômodo chamado "${comodoName}" nesta base. Exclua-o para adicionar outro com o mesmo nome.`
					);
					continue;
				}
				remainingItems.push(item);
			} else if (item.type === "mobilia") {
				if (mobilias >= this.actor.itemTypes.comodo.length) {
					ui.notifications.warn(
						"Cada cômodo só pode ter uma mobília. Adicione mais cômodos para importar mais mobílias."
					);
					continue;
				}
				remainingItems.push(item);
			} else {
				ui.notifications.warn(`Só é possível adicionar Cômodos e Mobílias.`);
				continue;
			}
		}
		return super._onDropItemCreate(remainingItems);
	}
}
