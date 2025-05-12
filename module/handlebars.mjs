export function registerHandlebarsHelpers() {
	Handlebars.registerHelper("concat", function () {
		let outStr = "";
		for (let arg in arguments) {
			if (typeof arguments[arg] != "object") {
				outStr += arguments[arg];
			}
		}
		return outStr;
	});

	Handlebars.registerHelper("fieldBonuses", function (sheet, hbl) {
		const actor = game.actors.get(sheet.actor._id) || fromUuidSync(sheet.uuid);
		if (!actor) return "";
		const rollData = actor.getRollData();
		const modFields = actor.modifiedFields;
		const path = hbl.hash.path;
		const pathTerms = path.split(".").filter((t) => !["system", "attributes", "tracos"].includes(t));
		const [type, key] = pathTerms;
		let listEffects = [];
		let listItems = "";

		switch (type) {
			case "atributos": {
				// ['base', 'racial', 'bonus', ...efeitos]
				const abl = actor.system.atributos[key];
				listEffects = [
					{ label: "Base", value: abl.base },
					abl.racial ? { label: "Racial", value: abl.racial } : false,
					abl.bonus ? { label: "Bônus Temporário", value: abl.bonus } : false,
					...(modFields[path] ?? [])
				];
				break;
			}
			case "pv":
			case "pm": {
				const level = actor.system.attributes.nivel.value;
				const classes = actor.items
					.filter((i) => i.type === "classe")
					.map((c) => {
						const initialHP = type === "pv" && c.system.inicial ? c.system.pvPorNivel * 3 : 0;
						const levelCount = Number(c.system.niveis);
						const porNivel = Number(c.system[`${type}PorNivel`]);
						return {
							label: `${c.name} ${levelCount}`,
							[type]: initialHP + levelCount * porNivel
						};
					});
				const atr = Object.entries(actor.system.atributos)
					.filter(([key, data]) => actor.system.attributes[type].atributos[key] || (key === "con" && type === "pv"))
					.map(([key, data]) => {
						const value = key === "con" && type === "pv" ? level * data.value : data.value;
						return [data.name, value];
					});
				const bonusNivel = modFields[`system.attributes.${type}.bonus.nivel`]?.map(({ label, mode, value }) => ({
					label,
					mode,
					value,
					multiplier: level
				}));
				const bonusNivelPar = modFields[`system.attributes.${type}.bonus.nivelPar`]?.map(({ label, mode, value }) => ({
					label,
					mode,
					value,
					multiplier: Math.floor(level / 2)
				}));
				const bonusNivelImpar = modFields[`system.attributes.${type}.bonus.nivelImpar`]?.map(
					({ label, mode, value }) => ({
						label,
						mode,
						value,
						multiplier: Math.ceil(level / 2)
					})
				);
				listEffects = [
					...classes.map((c) => ({ label: c.label, value: c[type] })),
					...atr.map(([label, value]) => ({ label, value })),
					...(bonusNivel ?? []),
					...(bonusNivelPar ?? []),
					...(bonusNivelImpar ?? []),
					...(modFields[`system.attributes.${type}.bonus.flat`] ?? [])
				];
				break;
			}
			case "pericias": {
				// ['meionivel', 'treino', 'atributo', 'outros', 'condi', 'tamanho', ...efeitos]
				const skill = actor.system.pericias[key];
				// Math.floor(actor.system.attributes.nivel.value/2);
				const meioNivel = rollData.meionivel;
				const treino = rollData.treino;
				listEffects = [
					meioNivel ? { label: "Metade do Nível", value: meioNivel } : false,
					skill.treinado ? { label: "Treino", value: treino } : false,
					{
						label: CONFIG.T20.atributos[skill.atributo],
						value: rollData[skill.atributo]
					},
					skill.outros ? { label: "Outros", value: skill.outros } : false,
					skill.size ? { label: "Tamanho", value: rollData.tamanho } : false,
					skill.condi ? { label: "Condição", value: skill.condi } : false,
					skill.pda && actor.pda ? { label: "Penalidade de Armadura", value: actor.pda } : false,

					...(modFields["system.modificadores.pericias.geral"] ?? []),
					...(["luta", "pont"].includes(key) ? (modFields["system.modificadores.pericias.ataque"] ?? []) : []),
					...(["fort", "refl", "vont"].includes(key)
						? (modFields["system.modificadores.pericias.resistencia"] ?? [])
						: []),
					...(!["luta", "pont"].includes(key) ? (modFields["system.modificadores.pericias.semataque"] ?? []) : []),

					...(modFields[`system.modificadores.pericias.atr.${skill.atributo}`] ?? []),

					...(modFields[path] ?? [])
				];
				break;
			}
			case "defesa": {
				// ['base', 'atributo', 'outros', 'condi', 'armadura', 'escudo', 'acessorio' ...efeitos]
				const defesa = actor.system.attributes.defesa;
				const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
				const armaduras = actor.itemTypes.equipamento
					.filter((i) => (equipmentSlots ? i.system.equipado2.slot : i.system.equipado))
					.map((i) => {
						return {
							label: i.name,
							value: i.system.armadura.value,
							tipo: i.system.tipo
						};
					});
				const armaduraPesada = armaduras.some((i) => i.tipo === "pesada");
				const meioNivel = game.settings.get("tormenta20", "progressiveDefense") ? rollData.meionivel : 0;
				listEffects = [
					{ label: "Base", value: defesa.base },
					meioNivel ? { label: "Metade do Nível", value: meioNivel } : false,
					defesa.atributo && !armaduraPesada
						? {
								label: CONFIG.T20.atributos[defesa.atributo],
								value: rollData[defesa.atributo]
							}
						: false,
					...armaduras,
					defesa.outros ? { label: "Outros", value: defesa.outros } : false,
					// (rollData.armadura ? { label: "Armadura", value: rollData.armadura } : false),
					// (rollData.escudo ? { label: "Escudo", value: rollData.escudo } : false),
					...(modFields[path] ?? [])
				];
				break;
			}
			case "rd":
				// ['base', ...efeitos]
				break;

			default:
				break;
		}
		// data-tooltip="{{fieldBonuses @root path=(concat 'system.pericias.' skill.key)}}" data-tooltip-direction="LEFT"
		let total = 0;
		for (const item of listEffects.filter(Boolean)) {
			listItems += `<li class="flexrow"><label>${item.label}:</label><span>`;
			let value = item.value;
			if (typeof value === "string" && value.startsWith("@")) {
				value = Roll.replaceFormulaData(value, rollData) * (item.multiplier ?? 1);
			}
			if (item.mode === 5) {
				listItems += `${value}</span></li>`;
				total = value;
				break;
			} else {
				listItems += `${value >= 0 ? `+${Number(value)}` : value}</span></li>`;
				total += Number(value);
			}
		}
		if (total >= 0) total = `+${total}`;
		let tooltip = `
		<ul class="fieldBonuses">
			${listItems}
			<hr>
			<li class="flexrow"><label>Total:</label><span>${total}</span></li>
		</ul>
		`;
		return tooltip;
	});

	Handlebars.registerHelper("toLowerCase", function (str) {
		return str.toLowerCase();
	});

	Handlebars.registerHelper("toJSONString", function (str) {
		return JSON.stringify(str);
	});

	Handlebars.registerHelper("conditionTip", function (context, condition, options) {
		let ret = "";
		for (let prop in context) {
			if (condition === prop) {
				ret = `${ret} ${context[prop].tooltip}`;
			}
		}
		return ret;
	});
	Handlebars.registerHelper("stripTags", function (str) {
		return str.replace(/<[^>]*>?/gm, "");
	});

	Handlebars.registerHelper("stripTagsInline", function (str) {
		return str.replace(/<(?!\/?[a|i](?=>|\s.*>))\/?.*?>/gm, "");
	});

	Handlebars.registerHelper("add", (a, b) => {
		return a + b;
	});

	Handlebars.registerHelper("divide", (a, b) => {
		return a / b;
	});

	Handlebars.registerHelper("multiply", (a, b) => {
		return a * b;
	});

	Handlebars.registerHelper("find", function (arr, key, value, flat = false) {
		if (flat) return !!arr.find((i) => foundry.utils.flattenObject(i)[key] === value);
		return !!arr.find((i) => i[key] === value);
	});

	Handlebars.registerHelper("ift", function (v, rtrue, rfalse) {
		return v ? rtrue : rfalse;
	});

	Handlebars.registerHelper("includes", function (v, choices = []) {
		return choices.includes(v);
	});

	/**
	 * @param {object} items
	 * @returns {Handlebars.SafeString}
	 */
	Handlebars.registerHelper("t20-classes", function (items) {
		const classes = items
			.filter((i) => i.type === "classe")
			.sort((a, b) => (b.system.inicial || 0) - (a.system.inicial || 0))
			.map(function (i) {
				return {
					name: i.name,
					nivel: i.system.niveis,
					toString: function () {
						return `${this.name} ${this.nivel}`;
					}
				};
			});
		return classes.join(", ");
	});

	/**
	 * @param {string} string
	 * @returns {Handlebars.SafeString}
	 */
	Handlebars.registerHelper("t20-rollFlavor", function (label) {
		return new Handlebars.SafeString(CONFIG.T20.damageTypes[label] ?? label);
	});

	/**
	 * @param {Item} item
	 * @returns {Handlebars.SafeString}
	 */
	Handlebars.registerHelper("t20-itemDesc", function (item) {
		const desc = [];
		let separator = ", ";
		if (item.type === "arma") {
			const { toHit, dano, critico } = item.labels;
			desc.push(toHit, dano, critico);
		} else if (item.type === "equipamento") {
			const { penalidade, value } = item.system.armadura;
			separator = " / ";
			if (penalidade || value) {
				desc.push(`<i class="fa-solid fa-shield"></i> ${value >= 0 ? `+${value}` : value}`);
				desc.push(`<i class="fa-solid fa-person-hiking"></i> ${penalidade}`);
			}
		} else if (item.type === "consumivel") {
			desc.push(`${game.i18n.localize("T20.ItemQuantity")}: ${item.system.qtd}`);
		} else if (item.type === "magia" || item.type === "poder") {
			if (item.type === "magia") {
				desc.push(`${item.system.circulo}º ${game.i18n.localize("T20.SpellCircle")}`);
			}
			const { ativacao, custoPM } = item.labels;
			const sustentada = item.system.duracao.units === "sust";
			if (ativacao) {
				if (sustentada) {
					desc.push(`${ativacao} (${game.i18n.localize("T20.TimeSust")})`);
				} else desc.push(ativacao);
			} else if (sustentada) desc.push(game.i18n.localize("T20.TimeSust"));
			if (custoPM) desc.push(custoPM);
		}
		return new Handlebars.SafeString(desc.filterJoin(separator));
	});
}
