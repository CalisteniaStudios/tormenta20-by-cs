/** ************************************************************/
/* Module: Drag Ruler																				 */
/** ************************************************************/
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	class Tormenta20SpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{ id: "walk", default: 0x3222c7, name: "Deslocamento" },
				{ id: "dash", default: 0xffec07, name: "Dobro" },
				{ id: "run", default: 0xc033e0, name: "Triplo" },
				{ id: "run2", default: 0x1bcad8, name: "Quádruplo" }
			];
		}

		getRanges(token) {
			const baseSpeed = token.actor.system.attributes.movement.walk.base;
			const enjoadoLento = token.actor.system.referencias?.find(
				(condicao) => condicao.label === "Enjoado" || condicao.label === "Lento"
			);
			let runMultiplier = this.getSetting("dashMultiplier");
			if (enjoadoLento) runMultiplier = 1;
			const ranges = [
				{ range: baseSpeed, color: "walk" },
				{ range: baseSpeed * 2, color: "dash" },
				{ range: baseSpeed * 3, color: "run" },
				{ range: baseSpeed * 4, color: "run2" }
			];
			for (let i = runMultiplier, len = ranges.length; i < len; i++) {
				ranges.pop();
			}
			return ranges;
		}

		get settings() {
			return [
				{
					id: "dashMultiplier",
					name: "drag-ruler.genericSpeedProvider.settings.dashMultiplier.name",
					hint: "drag-ruler.genericSpeedProvider.settings.dashMultiplier.hint",
					scope: "world",
					config: true,
					type: Number,
					default: 2
				}
			];
		}
	}
	dragRuler.registerSystem("tormenta20", Tormenta20SpeedProvider);
});

// Module: Item Piles
Hooks.once("item-piles-ready", async () => {
	await game.itempiles.API.addSystemIntegration({
		VERSION: "1.0.0",
		ACTOR_CLASS_TYPE: "character",
		ITEM_CLASS_LOOT_TYPE: "tesouro",
		ITEM_CLASS_WEAPON_TYPE: "arma",
		ITEM_CLASS_EQUIPMENT_TYPE: "equipamento",
		ITEM_QUANTITY_ATTRIBUTE: "system.qtd",
		ITEM_PRICE_ATTRIBUTE: "system.preco",
		ITEM_FILTERS: [
			{
				path: "type",
				filters: "magia,poder,classe"
			},
			{
				path: "system.tipoUso",
				filters: "nat"
			}
		],
		ITEM_SIMILARITIES: ["name", "type"],
		CURRENCIES: [
			{
				type: "attribute",
				name: "Ouro",
				img: "icons/commodities/currency/coin-embossed-insect-gold.webp",
				abbreviation: "{#}TO",
				data: {
					path: "system.dinheiro.to"
				},
				primary: false,
				exchangeRate: 10,
				index: 0,
				id: "system.dinheiro.to"
			},
			{
				type: "attribute",
				name: "Prata",
				img: "icons/commodities/currency/coin-embossed-unicorn-silver.webp",
				abbreviation: "{#}TP",
				data: {
					path: "system.dinheiro.tp"
				},
				primary: true,
				exchangeRate: 1,
				index: 1,
				id: "system.dinheiro.tp"
			},
			{
				type: "attribute",
				name: "Cobre",
				img: "icons/commodities/currency/coin-engraved-waves-copper.webp",
				abbreviation: "{#}TC",
				data: {
					path: "system.dinheiro.tc"
				},
				primary: false,
				exchangeRate: 0.1,
				index: 2,
				id: "system.dinheiro.tc"
			}
		]
	});
});
