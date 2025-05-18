export default class AtributosDinamicosDialog extends FormApplication {
	constructor(atributosDinamicos, options = {}) {
		super({}, options);
		this.atributosDinamicos = atributosDinamicos;
		this._resolve = null; // Store the resolve function
	}

	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "atributos-dinamicos-dialog",
			title: "Atributos Dinâmicos",
			template: "systems/tormenta20/templates/apps/dynamic-attributes-dialog.hbs",
			width: 400,
			closeOnSubmit: true
		});
	}

	getData() {
		const { value, description } = this.atributosDinamicos;
		return {
			description,
			atributosList: Array.isArray(value) ? value : Array.from(value ?? [])
		};
	}

	async _updateObject(event, formData) {
		// Resolve the promise with the form data
		if (this._resolve) this._resolve(formData);
	}

	static async prompt(atributosDinamicos) {
		return new Promise((resolve) => {
			const dlg = new this(atributosDinamicos);
			dlg._resolve = resolve;
			dlg.render(true);
		});
	}
}
