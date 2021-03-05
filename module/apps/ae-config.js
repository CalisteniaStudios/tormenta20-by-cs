export default class ActiveEffectConfigT20 extends ActiveEffectConfig {
	/*override*/
	get title() {
		if(this.object.data.flags?.t20?.onuse){
			// ${game.i18n.localize("EFFECT.ConfigTitle")}
			return `Efeito de Uso: ${this.object.sourceName}`;
		} else {
			return `${game.i18n.localize("EFFECT.ConfigTitle")}: ${this.object.data.label}`;
		}
	}
	/*override*/
	get template() {
		if(this.object.data.flags?.t20?.onuse){
			return "systems/tormenta20/templates/apps/onuse-effect-config.html";
		} else {
			return "systems/tormenta20/templates/apps/active-effect-config.html"
		}
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".useType").click(this._toggleTranfer.bind(this));
	}

	async _toggleTranfer(event){
		event.preventDefault();
		let transfer = false;
		$(".useType").each(function(){
			if( $(this)[0].checked ) transfer = true;
		});

		let upds = {}
		upds.transfer = transfer;
		upds[event.target.name] = event.target.checked;
		await this.object.update(upds);
		this.render();
	}

}