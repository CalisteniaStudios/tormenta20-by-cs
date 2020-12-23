/**
 * Application that is used to edit a dynamic aprimoramento.
 * 
 * @param {Object} aprimoramento The primoramento being edited.
 * @param {Object} target    The actor or item that the modifier belongs to.
 * @param {Object} options  Any options that modify the rendering of the sheet.
 * @param {Object} owner    The actor that the target belongs to, if target is an item.
 */
export default class AprimoramentoApplication extends FormApplication {
    constructor(aprimoramento, target, options={}, owner = null) {
        super(aprimoramento, options);

        this.actor = target;
        this.owner = owner;
    }

    static get defaultOptions() {
        let options = super.defaultOptions;

        return mergeObject(options, {
            id: 'aprimoramento-app',
            classes: ['tormenta20', 'aprimoramento-app'],
            template: "systems/tormenta20/templates/apps/aprimoramento-app.html",
            width: 400,
            height: 'auto',
            closeOnSubmit: true
        });
    }

    /** @override */
    get title() {
        return game.i18n.format("Aprimoramento ", {name: "Aprimoramento"});
    }

    /**
     * A convience method for retrieving the modifier being edited.
     */
    get aprimoramento() {
        return this.object;
    }

    /**
     * @override
     */
    getData() {
        const data = {
            owner: this.actor.owner,
            aprimoramento: this.aprimoramento,
            limited: this.actor.limited,
            options: this.options,
            editable: this.isEditable,
            cssClass: this.actor.owner ? "editable": "locked"
        };

        return data;
    }

    /**
     * @override
     * @param {jQuery} html The jQuery object that represents the DOM
     */
    activateListeners(html) {
        super.activateListeners(html);

    }

    /** @override */
    async _render(...args) {
        await super._render(...args);
    }

    /**
     * Update the Actor object with the new modifier data.
     * 
     * @param {Event} event The event that triggers the update
     * @param {Object} formData The data from the form
     */
    _updateObject(event, formData) {
        const aprimoramentos = duplicate(this.actor.data.data.aprimoramentos);
        const aprimoramento = aprimoramentos.find(mod => mod.id === this.aprimoramento.id);


        mergeObject(aprimoramento, formData);
        
        this.actor.update({'data.aprimoramentos': aprimoramentos});
    }
}