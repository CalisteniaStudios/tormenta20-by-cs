import ActiveEffectT20 from "../documents/active-effects.mjs";
export default class ActiveEffectEdit extends FormApplication {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.id = "actor-settings";
		// options.template = "systems/tormenta20/templates/apps/actor-settings.html";
		options.template = "systems/tormenta20/templates/apps/effect-edit.html",
		options.height = 400;
		options.width = 600;
		options.minimizable = true;
		options.title = "Configurar Efeitos de Items";
		return options;
	}

	getData() {
		let formData = super.getData();
		formData['item'] = this.object.item;
		// formData['effects'] = this.object.item.effects.map( m => new ActiveEffect(m.toObject()) );
		// formData['effects'] = prepareActiveEffectCategories(this.object.item.effects);
		formData['effects'] = ActiveEffectT20.prepareActiveEffectCategories(this.object.effects);
		return formData;
	}

	activateListeners(html) {
		
		html.find(".effect-control").click(ev => ActiveEffectT20.onManageActiveEffect(ev, this.object));
		html.find('.effect').on("contextmenu", ev => ActiveEffectT20.onManageActiveEffect(ev, this.object));
		
		html.on('click contextmenu', ev => {
			this.render(true);
		});
	}

	async _updateObject(event, formData) {
		this.object.update(formData)
	}
}