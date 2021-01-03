/**
 * A specialized Dialog subclass for ability usage
 * @type {Dialog}
 */
export default class AbilityUseDialog extends Dialog {
  constructor(item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["tormenta20", "dialog"];

    /**
     * Store a reference to the Item entity being used
     * @type {ItemT20}
     */
    this.item = item;
  }

  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
   * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
   * @param {ItemT20} item
   * @return {Promise}
   */
  static async create(item) {
    if ( !item.isOwned ) throw new Error("Um item precisa pertencer a um personagem para ser usado.");

    // Prepare data
    const actorData = item.actor.data.data;
    const itemData = item.data.data;
    const pmCost = item.data.data.custo > 0 ? true : false;
    
    // TODO Check if Actor have sufficient MP
    // TODO Include cosume os Ammunition, Itens, Money
    // TODO Include measured templates placement
    // Prepare dialog form data
    const data = {
      item: item.data,
      title: game.i18n.format("Usar Poder", item.data),
      note: "",
      custo: itemData.custo,
      formula: (["arma", "poder", "pericia", "magia", "atributo", "consumivel"].includes(item.type)),
      formuladano: item.type === "arma",
      consumeMP: pmCost,
      errors: []
    };
    // if ( item.data.type === "spell" ) this._getSpellData(actorData, itemData, data);

    // Render the ability usage template
    const html = await renderTemplate("systems/tormenta20/templates/apps/ability-use.html", data);

    // Create the Dialog and return data as a Promise
    const icon = "fa-fist-raised";
    const label = "Usar Habilidade";
    return new Promise((resolve) => {
      const dlg = new this(item, {
        title: `Uso de ${item.type}: ${item.name}`,
        content: html,
        buttons: {
          use: {
            icon: `<i class="fas ${icon}"></i>`,
            label: label,
            callback: html => {
              const fd = new FormDataExtended(html[0].querySelector("form"));
              resolve(fd.toObject());
            }
          }
        },
        default: "use",
        close: () => resolve(null)
      });
      dlg.render(true);
    });
  }

  /* -------------------------------------------- */
  /*  Helpers                                     */
  /* -------------------------------------------- */

  /**
   * Get the ability usage note that is displayed
   * @private
   */
  static _getAbilityUseNote(item, uses, recharge) {

    return ""
    
  }

  /* -------------------------------------------- */

  static _handleSubmit(formData, item) {

  }
}
