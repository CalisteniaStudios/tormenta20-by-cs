export default class ActiveEffectConfigT20 extends ActiveEffectConfig {
	/*override*/
	get title() {
		if(this.object.data.flags.t20.onuse){
			// ${game.i18n.localize("EFFECT.ConfigTitle")}
			return `Efeito de Uso: ${this.object.sourceName}`;
		} else {
			return `${game.i18n.localize("EFFECT.ConfigTitle")}: ${this.object.data.label}`;
		}
	}
	/*override*/
	get template() {
		if(this.object.data.flags.t20.onuse){
			return "systems/tormenta20/templates/apps/onuse-effect-config.html";
		} else {
			return "systems/tormenta20/templates/apps/active-effect-config.html"
		}
	}	
}