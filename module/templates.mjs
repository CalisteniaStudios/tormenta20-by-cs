/**
* Define a set of template paths to pre-load
* Pre-loaded templates are compiled and cached for fast access when rendering
* @return {Promise}
*/
export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([

		// Shared Partials
		"systems/tormenta20/templates/partials/nav-bar.html",
		"systems/tormenta20/templates/partials/active-effects.html",
		
		
		// Actor Sheet Partials
		"systems/tormenta20/templates/actor/parts/sheet-header-base.html",
		"systems/tormenta20/templates/actor/parts/sheet-header-tabbed.html",
		"systems/tormenta20/templates/actor/parts/sheet-header-npc.html",
		"systems/tormenta20/templates/actor/parts/sheet-header-simple.html",
		"systems/tormenta20/templates/actor/parts/statblock.html",
		"systems/tormenta20/templates/actor/parts/abilities.html",
		"systems/tormenta20/templates/actor/parts/defense.html",
		"systems/tormenta20/templates/actor/parts/resources.html",
		"systems/tormenta20/templates/actor/parts/resources-extra.html",
		"systems/tormenta20/templates/actor/parts/traits.html",
		"systems/tormenta20/templates/actor/parts/currency.html",
		"systems/tormenta20/templates/actor/parts/encumbrance.html",
		"systems/tormenta20/templates/actor/parts/list-general.html",
		"systems/tormenta20/templates/actor/parts/list-weapon.html",
		"systems/tormenta20/templates/actor/parts/list-equipment.html",
		"systems/tormenta20/templates/actor/parts/list-consumable.html",
		"systems/tormenta20/templates/actor/parts/list-loot.html",
		"systems/tormenta20/templates/actor/parts/list-favorites.html",
		"systems/tormenta20/templates/actor/parts/list-powers.html",
		"systems/tormenta20/templates/actor/parts/list-spells.html",
		"systems/tormenta20/templates/actor/parts/list-skills.html",
		"systems/tormenta20/templates/actor/parts/journal.html",
		"systems/tormenta20/templates/actor/parts/modifiers.html",
		
		// Actor Builder Partials
		

		// Item Sheet Partials
		"systems/tormenta20/templates/item/parts/item-header.html",
		"systems/tormenta20/templates/item/parts/item-rolls.html",
		"systems/tormenta20/templates/item/parts/item-ativacao.html",
		"systems/tormenta20/templates/item/parts/item-enhancements.html",
		"systems/tormenta20/templates/item/parts/item-description.html",
		"systems/tormenta20/templates/item/parts/item-modificacoes.html",
		"systems/tormenta20/templates/item/parts/item-resistencia.html",
		"systems/tormenta20/templates/item/parts/item-progression.html",


		// Development Partials
		"systems/tormenta20/templates/actor/parts/teste.html",
	]);
};
