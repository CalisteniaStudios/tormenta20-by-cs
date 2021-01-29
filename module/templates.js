/**
* Define a set of template paths to pre-load
* Pre-loaded templates are compiled and cached for fast access when rendering
* @return {Promise}
*/
export const preloadHandlebarsTemplates = async function() {
	return loadTemplates([

		// Shared Partials

		// Actor Sheet Partials
		"systems/tormenta20/templates/actor/parts/actor-aviso.html",
		"systems/tormenta20/templates/actor/parts/actor-diario.html",
		"systems/tormenta20/templates/actor/parts/actor-inventory.html",
		"systems/tormenta20/templates/actor/parts/actor-powers.html",
		"systems/tormenta20/templates/actor/parts/actor-spells.html",
		"systems/tormenta20/templates/actor/parts/actor-skills.html",
		"systems/tormenta20/templates/actor/parts/actor-traits.html",

		// Item Sheet Partials
		"systems/tormenta20/templates/item/parts/item-header.html",
		"systems/tormenta20/templates/item/parts/item-ativacao.html",
		"systems/tormenta20/templates/item/parts/item-encantos.html",
		"systems/tormenta20/templates/item/parts/item-description.html",
		"systems/tormenta20/templates/item/parts/item-modificacoes.html",
		"systems/tormenta20/templates/item/parts/item-resistencia.html"
	]);
};
