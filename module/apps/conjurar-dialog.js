/**
 * A specialized Dialog subclass for casting a spell item with augments
 * @extends {Dialog}
 */
export default class ConjurarDialog extends Dialog {
  constructor(actor, item, dialogData={}, options={}) {
    super(dialogData, options);
    this.options.classes = ["tormenta20", "dialog"];

    /**
     * Store a reference to the Actor entity which is casting the spell
     * @type {ActorT20}
     */
    this.actor = actor;

    /**
     * Store a reference to the Item entity which is the spell being cast
     * @type {ItemT20}
     */
    this.item = item;
  }
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Add controles para checkbox e números
    html.find('.dialogCheck').click(this.checkboxControl.bind(this));
    html.find('.numCtrl').click(this.numberControl.bind(this));
  }

   
  numberControl(ev){
    ev.preventDefault();
    let campo = $(ev.target).siblings('.numInp')[0];
    if($(ev.target).val() === "+"){
      campo.value =  parseInt(campo.value) + parseInt($(campo).prop('step'));
    } else if($(ev.target).val() === "-"){
      campo.value = parseInt(campo.value) - parseInt($(campo).prop('step'));
    }
  }
  checkboxControl(ev){
    if($(ev.target).prop('checked')){
      $(ev.target).siblings('.dialogCheckHidden')[0].disabled =true;
    } else {
      $(ev.target).siblings('.dialogCheckHidden')[0].disabled =false;
    }
  } 
  /* -------------------------------------------- */
  /*  Rendering                                   */
  /* -------------------------------------------- */

  /**
   * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
   * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
   * @param {ActorT20} actor
   * @param {ItemT20} item
   * @return {Promise}
   */
  static async create(actor, item) {
    const ad = actor.data.data;
    const id = item.data.data;
    let aprimoramentos = id.aprimoramentos;
    // Render the Spell casting template
    const html = await renderTemplate("systems/tormenta20/templates/apps/aprimorar-magia.html", {
      item: item.data,
      aprimoramentos: aprimoramentos
    });
    // Create the Dialog and return as a Promise
    return new Promise((resolve, reject) => {
      const dlg = new this(actor, item, {
        title: `${item.name}: Aprimoramentos`,
        content: html,
        buttons: {
          cast: {
            icon: '<i class="fas fa-magic"></i>',
            label: "Conjurar",
            callback: html => resolve(new FormData(html[0].querySelector("#spell-config-form")))
          }
        },
        default: "cast",
        close: reject
      });
      dlg.options.width = 600;
      dlg.position.width = 600;
      dlg.render(true);
    });
  }
}
