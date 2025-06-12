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
		data.config = CONFIG.T20;

		const rooms = Number(data.system.rooms?.number) || 0;
		const poderes = this.actor.items.filter((i) => i.type === "poder" && i.system?.subtipo === "comodo");
		const mobilias = this.actor.items.filter((i) => i.type === "poder" && i.system?.subtipo === "mobilia");

		const extractComodoName = (poder) => poder.name.match(/^Cômodo -\s*(.+)$/i)?.[1]?.trim() || null;

		const comodos = Array.from({ length: rooms }, (_, i) => ({
			name: `Cômodo ${i + 1}`,
			poderes: [],
			mobilias: []
		}));

		for (const poder of poderes) {
			const comodoName = extractComodoName(poder);
			let targetComodo = null;

			if (comodoName) {
				targetComodo = comodos.find((c) => c.poderes.length === 0 && c.name.startsWith("Cômodo"));
				if (targetComodo) {
					targetComodo.name = comodoName;
				} else {
					targetComodo = comodos.find((c) => c.name === comodoName);
				}
			}
			if (targetComodo) {
				targetComodo.poderes.push(poder);
			}
		}

		for (const mobilia of mobilias) {
			const targetComodo = comodos.find((c) => c.mobilias.length === 0);
			if (targetComodo) {
				targetComodo.mobilias.push(mobilia);
			}
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

		const poderes = this.actor.items.filter((i) => i.type === "poder" && i.system?.subtipo === "comodo");
		const filledComodos = poderes.length;
		const currentComodoNames = poderes.map((p) => p.name).filter(Boolean);

		const mobilias = this.actor.items.filter((i) => i.type === "poder" && i.system?.subtipo === "mobilia");
		const mobiliasCount = mobilias.length;

		for (const item of itemData) {
			const subtipo = item.system?.subtipo;

			if (item.type === "poder" && subtipo === "comodo") {
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
			} else if (item.type === "poder" && subtipo === "mobilia") {
				if (mobiliasCount >= filledComodos) {
					ui.notifications.warn(
						"Cada cômodo só pode ter uma mobília. Adicione mais cômodos para importar mais mobílias."
					);
					continue;
				}
				remainingItems.push(item);
			} else if (item.type === "poder") {
				ui.notifications.warn(`Só é possível adicionar poderes com subtipo "comodo" ou "mobilia".`);
				continue;
			} else {
				// Allow importing magias and any other items
				remainingItems.push(item);
			}
		}
		return super._onDropItemCreate(remainingItems);
	}
}
