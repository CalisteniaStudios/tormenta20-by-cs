export default class ResourceConfig extends FormApplication {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "trait-selector",
			classes: ["tormenta20", "resource-config"],
			title: "Configuração de Nível",
			template: "systems/tormenta20/templates/apps/resource-config.hbs",
			width: 500,
			height: "auto",
			choices: {},
			allowCustom: true,
			minimum: 0,
			maximum: null
		});
	}

	getData() {
		let classes = [];
		let flags = this.object.flags.tormenta20 || {};
		const con = this.object.system.atributos.con;
		const cls = this.object.items.filter((i) => i.type === "classe");
		const resources = {
			pv: this.object._source.system.attributes.pv,
			pm: this.object._source.system.attributes.pm
		};
		if (cls) {
			for (let [key, data] of Object.entries(cls)) {
				let c = data.system;
				let iniPV = c.inicial ? c.pvPorNivel * 3 : 0;
				classes[key] = {
					label: data.name,
					pvPorNivel: c.pvPorNivel,
					pmPorNivel: c.pmPorNivel,
					niveis: c.niveis,
					pvTotal: Number(iniPV) + Number(c.niveis) * (Number(c.pvPorNivel) + con.base + con.racial),
					pmTotal: c.niveis * c.pmPorNivel
				};
			}
		}
		return {
			actor: this.object,
			classes: classes,
			flags: flags,
			con: con.base + con.racial,
			config: CONFIG.T20,
			resources: resources
		};
	}

	async _updateObject(event, formData) {
		const data = foundry.utils.expandObject(formData);
		return await this.object.update(data);
	}
}
