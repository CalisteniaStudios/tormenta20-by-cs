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

	async getData(options) {
		const data = await super.getData(options);
		const rooms = data.system.rooms;
		const comodos = this.actor.itemTypes.comodo;
		const acomodacoes = [];

		for (let i = 0; i < Math.max(rooms, comodos.length); i++) {
			const item = comodos[i];
			const name = i >= rooms ? "Cômodo Extra" : `Cômodo ${i + 1}`;
			acomodacoes.push(item ? { name, item } : { name });
		}

		for (const [i, mobilia] of this.actor.itemTypes.mobilia.entries()) {
			acomodacoes[i].mobilias = [mobilia];
		}

		data.acomodacoes = acomodacoes;
		return data;
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Listener para troca de porte
		html.find('select[name="system.porte"]').change(async (ev) => {
			const porte = ev.currentTarget.value;
			const roomsNumber = CONFIG.T20.roomsNumber[porte] ?? 0;
			await this.actor.update({ "system.rooms": roomsNumber });
		});
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
