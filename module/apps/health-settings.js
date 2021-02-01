export default class HealthSettings extends FormApplication {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "trait-selector",
			classes: ["tormenta20"],
			title: "Configuração de Nível",
			template: "systems/tormenta20/templates/apps/health-settings.html",
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
		if (this.options.classes != undefined) {
			classes = duplicate(this.options.classes);
			for ( let [key, data] of Object.entries(classes) ) {
				classes[key] = {
					label: data.name,
					pvPorNivel: data.data.pvPorNivel,
					pmPorNivel: data.data.pmPorNivel,
					niveis: data.data.niveis
				}
			}
		}
		const con = this.object.data.data.atributos.con.mod;
		const config = this.options.config;
		return {
			actor: this.object,
			classes: classes,
			con: con,
			config: config
		};
	}


	async _updateObject(event, formData) {
		const updateData = {};
		let soma = {"pv": 0, "pm": 0};
		let flags = {};
		const nivel = this.object.data.data.attributes.nivel.value;
		const config = this.options.config;
		for ( let [k, v] of Object.entries(formData) ) {
			if (Number.isInteger(v)) {
				let chave = k.split(".")[1];
				soma[chave] += v;
			}
			if (k.includes("pv.") || k.includes("pm.")) {
				let chave = k.split(".")[0];
				k = k.split(".")[1];
				if (v) {
					let lista = (chave == "pv") ? config.listaAlteraPV : (chave == "pm" ? config.listaAlteraPM : {});
					let valor = 0;
					if (lista[k] != undefined) {
						valor += lista[k][1];
						valor += nivel * lista[k][2];
					}
					else if (k.includes("PV") || k.includes("PM")) { //atributos
						let chaveAtributo = k.replace("PV","").replace("PM","");
						valor += this.object.data.data.atributos[chaveAtributo].mod;
					}
					else if (k.includes("pvBonus") || k.includes("pmBonus")) {
						valor += parseFloat(v[0] || 0) + nivel * parseFloat(v[1] || 0);
					}
					soma[chave] += valor;
				}
				flags[k] = v;
			}
		}
		updateData["data.attributes.pv.max"] = soma.pv;
		updateData["data.attributes.pm.max"] = soma.pm;
		updateData["flags"] = flags;
		this.object.update(updateData)
	}
}
