export default class LevelSettings extends FormApplication {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "trait-selector",
			classes: ["tormenta20"],
			title: "Configuração de Nível",
			template: "systems/tormenta20/templates/apps/level-settings.html",
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
		let flags = this.object.data.flags.tormenta20 || {};
		const con = this.object.data.data.atributos.con.mod;
		if (this.object.data.classes != undefined) {
			const cls = duplicate(this.object.data.classes);
			for ( let [key, data] of Object.entries(cls) ) {
				let c = data.data;
				let iniPV = c.primary? c.pvPorNivel * 3 : 0;
				classes[key] = {
					label: data.name,
					pvPorNivel: c.pvPorNivel,
					pmPorNivel: c.pmPorNivel,
					niveis: c.niveis,
					pvTotal: Number(iniPV) + (Number(c.niveis) * ( Number(c.pvPorNivel) + con )),
					pmTotal: c.niveis * c.pmPorNivel
				}
			}
		}
		let atributosPV = flags.atributosPV || [];
		let atributosPM = flags.atributosPM || [];
		const config = CONFIG.T20;
		return {
			actor: this.object,
			classes: classes,
			atributosPV: atributosPV,
			atributosPM: atributosPM,
			flags: flags,
			con: con,
			config: config
		};
	}


	async _updateObject(event, formData) {
		const data = expandObject(formData);
		delete data.classes;
		this.object.setFlag("tormenta20", "lvlconfig", data);
		this.object._calcPVPM();
		return;
		// const updateData = {};
		// let soma = {"pv": 0, "pm": 0};
		// const nivel = Number( this.object.data.data.attributes.nivel.value );
		// const data = expandObject(formData);
		// for (let [k, classe] of Object.entries(data.classes)){
		// 	soma.pv += Number(classe.pv);
		// 	soma.pm += Number(classe.pm);
		// }
		// if( data.pvBonus[0] ) soma.pv += Number(data.pvBonus[0]);
		// if( data.pvBonus[1] ) soma.pv += Number(data.pvBonus[1].replace(",",".")) * nivel;
		// if( data.pmBonus[0] ) soma.pm += Number(data.pmBonus[0]);
		// if( data.pmBonus[1] ) soma.pm += Number(data.pmBonus[1].replace(",",".")) * nivel;
		// for (let [atr, value] of Object.entries(data.pv)){
		// 	if(value) soma.pv += Number(this.object.data.data.atributos[atr].mod);
		// }
		// for (let [atr, value] of Object.entries(data.pm)){
		// 	if(value) soma.pm += Number(this.object.data.data.atributos[atr].mod);
		// }
		// delete data.classes;
		// updateData["data.attributes.pv.max"] = soma.pv;
		// updateData["data.attributes.pm.max"] = soma.pm;
		// this.object.setFlag("tormenta20", "lvlconfig", data);
		// this.object.update(updateData);
	}
}
