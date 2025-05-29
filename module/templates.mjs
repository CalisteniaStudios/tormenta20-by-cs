/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	const templatePaths = [
		// Shared Partials
		"systems/tormenta20/templates/partials/nav-bar.hbs",
		"systems/tormenta20/templates/partials/active-effects.hbs",
		"systems/tormenta20/templates/partials/fieldlist.hbs",

		// Actor Sheet Partials
		"systems/tormenta20/templates/actor/parts/headers/sheet-header-base.hbs",
		"systems/tormenta20/templates/actor/parts/headers/sheet-header-tabbed.hbs",
		"systems/tormenta20/templates/actor/parts/headers/sheet-header-npc.hbs",
		"systems/tormenta20/templates/actor/parts/headers/sheet-header-simple.hbs",
		"systems/tormenta20/templates/actor/parts/headers/sheet-header-summary.hbs",
		"systems/tormenta20/templates/actor/parts/statblock.hbs",
		"systems/tormenta20/templates/actor/parts/abilities.hbs",
		"systems/tormenta20/templates/actor/parts/defense.hbs",
		"systems/tormenta20/templates/actor/parts/resources.hbs",
		"systems/tormenta20/templates/actor/parts/resources-extra.hbs",
		"systems/tormenta20/templates/actor/parts/traits.hbs",
		"systems/tormenta20/templates/actor/parts/currency.hbs",
		"systems/tormenta20/templates/actor/parts/encumbrance.hbs",
		"systems/tormenta20/templates/actor/parts/journal.hbs",
		"systems/tormenta20/templates/actor/parts/modifiers.hbs",
		// Lists
		"systems/tormenta20/templates/actor/parts/lists/list-general.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-inventory.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-weapon.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-equipment.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-consumable.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-loot.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-favorites.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-powers.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-powers-tabbed.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-spells.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-skills.hbs",
		"systems/tormenta20/templates/actor/parts/lists/list-header-element.hbs",
		"systems/tormenta20/templates/actor/parts/lists/actor-item-controls.hbs",

		// Actor Builder Partials

		// Item Sheet Partials
		"systems/tormenta20/templates/item/parts/item-header.hbs",
		"systems/tormenta20/templates/item/parts/item-rolls.hbs",
		"systems/tormenta20/templates/item/parts/item-ativacao.hbs",
		"systems/tormenta20/templates/item/parts/item-enhancements.hbs",
		"systems/tormenta20/templates/item/parts/item-description.hbs",
		"systems/tormenta20/templates/item/parts/item-modificacoes.hbs",
		"systems/tormenta20/templates/item/parts/item-resistencia.hbs",
		"systems/tormenta20/templates/item/parts/item-progression.hbs",
		"systems/tormenta20/templates/item/parts/item-grants.hbs",

		// Rolls
		"systems/tormenta20/templates/chat/roll-breakdown.hbs",

		// Active Effects
		"systems/tormenta20/templates/apps/active-effect/details.hbs",
		"systems/tormenta20/templates/apps/active-effect/duration.hbs",

		// Development Partials
		"systems/tormenta20/templates/actor/parts/teste.hbs"
	];

	const paths = {};
	for (const path of templatePaths) {
		const htmlPath = path.replace(".hbs", ".html");
		const baseName = path.split("/").pop().replace(".hbs", "");

		paths[htmlPath] = path;
		paths[`tormenta20.${baseName}`] = path;
	}
	return foundry.applications.handlebars.loadTemplates(paths);
};
