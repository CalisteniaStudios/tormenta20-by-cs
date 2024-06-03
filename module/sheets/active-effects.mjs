export default class ActiveEffectConfigT20 extends ActiveEffectConfig {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			width: 800,
			resizable: true,
		});
	}
	
	/*override*/
	get title() {
		if (this.object.flags?.tormenta20?.onuse) {
			return `Efeito de Uso: ${this.object.sourceName}`;
		} else {
			return `${game.i18n.localize("EFFECT.ConfigTitle")}: ${this.object.name}`;
		}
	}
	/** @override */
	get template() {
		if (this.object.flags?.tormenta20?.onuse) {
			return "systems/tormenta20/templates/apps/onuse-effect-config.html";
		} else {
			return "systems/tormenta20/templates/apps/active-effect-config.html"
		}
	}

	/** @override */
	async getData() {
		const data = await super.getData();
		data.documentName = "ActiveEffect";
		data.effect.img ??= data.effect.icon;
		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".useType").click(this._toggleTranfer.bind(this));
	}

	async _toggleTranfer(event) {
		event.preventDefault();
		let transfer = false;
		$(".useType").each(function () {
			if ($(this)[0].checked) transfer = true;
		});
		let upds = {}
		upds.transfer = transfer;
		upds[event.target.name] = event.target.checked;
		await this.object.update(upds);
		this.render();
	}

	/** @override */
	async _updateObject(event, formData) {
		formData = foundry.utils.expandObject(formData);
		formData.changes = Object.values(formData.changes || {});
		for (let c of formData.changes) {
			if (c.mode !== 2 && Number.isNumeric(c.value)) c.value = parseFloat(c.value);
		}
		if (formData.flags?.tormenta20?.onuse) {
			let f = formData.flags.tormenta20;
			formData.transfer = (!f.durationScene && (f.attack || f.skill || f.ability || f.power || f.spell || f.consumable || f.equipment));
		}
		return this.object.update(formData);
	}
}