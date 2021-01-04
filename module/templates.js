/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Shared Partials

    // Actor Sheet Partials

    // Item Sheet Partials
    "systems/tormenta20/templates/item/parts/item-header.html",
    "systems/tormenta20/templates/item/parts/item-action.html",
    "systems/tormenta20/templates/item/parts/item-encantos.html",
    "systems/tormenta20/templates/item/parts/item-description.html",
    "systems/tormenta20/templates/item/parts/item-modificacoes.html"
  ]);
};
