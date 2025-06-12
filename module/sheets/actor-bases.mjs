import ActorSheetT20 from "./actor-base.mjs";
export default class ActorSheetT20Bases extends ActorSheetT20 {
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "bases"],
			template: "systems/tormenta20/templates/actor/bases-sheet.hbs",
			width: 900,
			height: 600
		});
	}

	async getData(options) {
		const data = await super.getData(options);
		const rooms = Number(data.system.rooms?.number) || 0;
		const comodos = Array.from({ length: rooms }, (_, i) => ({
			name: `Cômodo ${i + 1}`,
			item: null,
			mobilias: []
		}));

		for (const [i, comodo] of this.actor.itemTypes.comodo.entries()) {
			comodos[i].item = comodo;
		}

		for (const [i, mobilia] of this.actor.itemTypes.mobilia.entries()) {
			comodos[i].mobilias = [mobilia];
		}

		data.comodosPoderes = comodos;
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Listener para troca de porte
		html.find('select[name="system.porte"]').change(async (ev) => {
			const porte = ev.currentTarget.value;
			const roomsNumber = CONFIG.T20.roomsNumber[porte] ?? 0;
			await this.actor.update({ "system.rooms.number": roomsNumber });
		});
	}

	async _onDropItemCreate(itemData) {
		itemData = Array.isArray(itemData) ? itemData : [itemData];
		const remainingItems = [];
		const rooms = Number(this.actor.system.rooms?.number) || 0;

		const filledComodos = this.actor.itemTypes.comodo.length;
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
				if (filledComodos >= rooms) {
					ui.notifications.warn("Todos os cômodos estão ocupados. Exclua um para adicionar outro.");
					continue;
				}
				remainingItems.push(item);
			} else if (item.type === "mobilia") {
				if (mobilias >= filledComodos) {
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
