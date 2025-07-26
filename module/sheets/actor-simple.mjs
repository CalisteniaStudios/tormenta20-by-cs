import ActorSheetT20Character from "./actor-character.mjs";
export default class ActorSheetT20Simple extends ActorSheetT20Character {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["tormenta20", "sheet", "actor", "simple"],
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "attributes"
				}
			],
			scrollY: [".sheet-body"],
			width: 600,
			height: 600
		});
	}

	/** @override */
	get template() {
		return "systems/tormenta20/templates/actor/simple-sheet.hbs";
	}

	/**
	 * Organize Owned Items for rendering the NPC sheet
	 * @private
	 */
	async _prepareItems(data) {
		const actorData = data.actor;
		// Initialize containers.

		// Categorize items as inventory
		const inventario = {
			arma: { label: "Armas", items: [], dataset: { type: "arma" } },
			equipamento: {
				label: "Equipamentos",
				items: [],
				dataset: { type: "equipamento" }
			},
			consumivel: {
				label: "Consumível",
				items: [],
				dataset: { type: "consumivel" }
			},
			tesouro: { label: "Tesouro", items: [], dataset: { type: "tesouro" } }
		};

		// Partition items by category
		let [items, magias, poderes] = data.items.reduce(
			(arr, item) => {
				// Item details
				item.img = item.img || CONST.DEFAULT_TOKEN;
				item.isStack = Number.isNumeric(item.system.qtd) && item.system.qtd !== 1;

				// Classify items into types
				if (item.type === "magia") arr[1].push(item);
				else if (item.type === "poder") arr[2].push(item);
				else if (Object.keys(inventario).includes(item.type)) arr[0].push(item);
				return arr;
			},
			[[], [], []]
		);

		// Organize items
		for (let i of items) {
			i.system.qtd = i.system.qtd || 0;
			i.system.espacos = i.system.espacos || 0;
			i.espacosTotal = Math.round(i.system.qtd * i.system.espacos * 100) / 100;
			inventario[i.type].items.push(i);
		}

		// Organize spells and count the number of prepared spells
		const grimorio = {
			1: { spells: [], custo: 1 },
			2: { spells: [], custo: 3 },
			3: { spells: [], custo: 6 },
			4: { spells: [], custo: 10 },
			5: { spells: [], custo: 15 }
		};
		let maiorCirculo = 0;
		magias.forEach(function (m) {
			maiorCirculo = Math.max(maiorCirculo, m.system.circulo);
			grimorio[m.system.circulo].spells.push(m);
		});

		// Assign and return
		actorData.poderes = poderes;
		actorData.magias = grimorio;
		actorData.maiorCirculo = maiorCirculo;
		inventario.itens = { label: "Itens", items: items };
		actorData.inventario = inventario;
	}
}
