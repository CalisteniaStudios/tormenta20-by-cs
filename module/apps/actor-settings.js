export default class ActorSettings extends FormApplication {
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.id = "actor-settings";
		options.template = "systems/tormenta20/templates/apps/actor-settings.html";
		options.height = "auto";
		options.width = 400;
		options.minimizable = true;
		options.title = "Configurações de Personagem"
		return options;
	}

	getData() {
		let data = super.getData()
		return data
	}

	async _updateObject(event, formData) {
		this.object.update(formData)
	}
}