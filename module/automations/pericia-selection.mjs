export default class PericiaSelection extends FormApplication {
	constructor(periciaList, resolve, options = {}) {
		super({}, options);
		this.periciaList = periciaList;
		this._resolve = resolve;
		this.selected = [];
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "power-pericia-select",
			classes: ["tormenta20", "dialog"],
			title: game.i18n.localize("T20.SelectPericia"),
			template: "systems/tormenta20/templates/automations/pericia-selection.hbs",
			width: 400,
			height: "auto"
		});
	}

	getData() {
		return { pericias: this.periciaList };
	}

	activateListeners(html) {
		super.activateListeners(html);
		const $btns = html.find("button.pericia-btn");
		const $concluir = html.find("button.concluir-btn");

		$btns.click(ev => {
			ev.preventDefault();
			const key = ev.currentTarget.value;
			const idx = this.selected.indexOf(key);
			if (idx >= 0) {
				this.selected.splice(idx, 1);
				ev.currentTarget.classList.remove("selected");
			} else if (this.selected.length < 2) {
				this.selected.push(key);
				ev.currentTarget.classList.add("selected");
			}
			// Enable Concluir only if 1 or 2 selected
			$concluir.prop("disabled", this.selected.length === 0 || this.selected.length > 2);
		});

		html.find("form").submit(ev => {
			ev.preventDefault();
			if (this.selected.length === 0 || this.selected.length > 2) return;
			this._resolve([...this.selected]);
			this.close();
		});
	}

	close(options) {
		this._resolve(null);
		return super.close(options);
	}

	/** Required by FormApplication, but not used here. */
	async _updateObject(event, formData) {
		// No-op: selection is handled via custom submit logic.
	}
}
