/**
* Define a set of template paths to pre-load
* Pre-loaded templates are compiled and cached for fast access when rendering
* @return {Promise}
*/
export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([

		// Shared Partials
		"systems/tormenta20/templates2/partials/nav-bar.html",
		"systems/tormenta20/templates2/partials/active-effects.html",
		"systems/tormenta20/templates2/partials/actor/sheet-header-base.html",
		"systems/tormenta20/templates2/partials/actor/sheet-header-tabbed.html",
		"systems/tormenta20/templates2/partials/actor/sheet-header-npc.html",
		"systems/tormenta20/templates2/partials/actor/statblock.html",
		"systems/tormenta20/templates2/partials/actor/abilities.html",
		"systems/tormenta20/templates2/partials/actor/defense.html",
		"systems/tormenta20/templates2/partials/actor/resources.html",
		"systems/tormenta20/templates2/partials/actor/resources-extra.html",
		"systems/tormenta20/templates2/partials/actor/traits.html",
		"systems/tormenta20/templates2/partials/actor/currency.html",
		"systems/tormenta20/templates2/partials/actor/encumbrance.html",
		"systems/tormenta20/templates2/partials/actor/list-general.html",
		"systems/tormenta20/templates2/partials/actor/list-weapon.html",
		"systems/tormenta20/templates2/partials/actor/list-equipment.html",
		"systems/tormenta20/templates2/partials/actor/list-consumable.html",
		"systems/tormenta20/templates2/partials/actor/list-loot.html",
		"systems/tormenta20/templates2/partials/actor/list-favorites.html",
		"systems/tormenta20/templates2/partials/actor/list-powers.html",
		"systems/tormenta20/templates2/partials/actor/list-spells.html",
		"systems/tormenta20/templates2/partials/actor/list-skills.html",
		"systems/tormenta20/templates2/partials/actor/journal.html",
		"systems/tormenta20/templates2/partials/actor/modifiers.html",
		

		// Actor Sheet Partials
		"systems/tormenta20/templates/actor/parts/actor-aviso.html",
		"systems/tormenta20/templates/actor/parts/actor-diario.html",
		"systems/tormenta20/templates/actor/parts/actor-favoritos.html",
		"systems/tormenta20/templates/actor/parts/actor-inventory.html",
		"systems/tormenta20/templates/actor/parts/actor-powers.html",
		"systems/tormenta20/templates/actor/parts/actor-spells.html",
		"systems/tormenta20/templates/actor/parts/actor-skills.html",
		"systems/tormenta20/templates/actor/parts/actor-traits.html",
		"systems/tormenta20/templates/actor/parts/actor-modifiers.html",
		"systems/tormenta20/templates/actor/parts/active-effects.html",

		// Item Sheet Partials
		"systems/tormenta20/templates/item/parts/item-header.html",
		"systems/tormenta20/templates/item/parts/item-rolls.html",
		"systems/tormenta20/templates/item/parts/item-ativacao.html",
		"systems/tormenta20/templates/item/parts/item-enchantments.html",
		"systems/tormenta20/templates/item/parts/item-description.html",
		"systems/tormenta20/templates/item/parts/item-modificacoes.html",
		"systems/tormenta20/templates/item/parts/item-resistencia.html"
	]);
};
