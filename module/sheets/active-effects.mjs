export default class ActiveEffectConfigT20 extends foundry.applications.sheets.ActiveEffectConfig {
	/* override*/
	get title() {
		if (this.document.flags?.tormenta20?.onuse) {
			return `Efeito de Uso: ${this.document.name}`;
		}
		return `${game.i18n.localize(`DOCUMENT.${this.document.documentName}`)}: ${this.document.name}`;
	}

	static PARTS = {
		...super.PARTS,
		details: {
			template: "systems/tormenta20/templates/apps/active-effect/details.hbs"
		},
		duration: {
			template: "systems/tormenta20/templates/apps/active-effect/duration.hbs"
		}
	};
}
