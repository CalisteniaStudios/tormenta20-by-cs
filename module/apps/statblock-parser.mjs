import ActorT20 from "../documents/actor.mjs";

export default class StatblockParser extends FormApplication {
	static loadedCompendiums = false;

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "statblock-parser",
			classes: ["tormenta20"],
			title: game.i18n.localize("T20.StatblockParser"),
			template: "systems/tormenta20/templates/apps/statblock-parser.hbs",
			width: 900,
			height: "auto",
			resizable: true
		});
	}

	getData() {
		let formData = super.getData();
		formData.config = CONFIG.T20;
		formData.parser = this.object;
		formData.statblock = this.object.statblock;
		formData.schema = this.object.schema;
		formData.items = this.object.items;
		formData.log = this.object.log;

		return formData;
	}

	activateListeners(html) {
		html.find(".validate").click(this._parseStatblock.bind(this));
		html.find(".apply").click(this._applyToActor.bind(this));
	}

	toRegExpOr(list, values = false) {
		let j;
		if (list instanceof Array && list.every((i) => typeof i == "string")) {
			j = list.join("|");
		} else if (list instanceof Object && values) {
			j = Object.values(list).join("|");
		} else if (list instanceof Object && !values) {
			j = Object.keys(list).join("|");
		} else return false;

		return new RegExp(`(${j})`, "i");
	}

	async _applyToActor(ev) {
		ev.preventDefault();
		let actor = this.object.actor;
		let acItems = actor.items.map((m) => m.id);
		actor.deleteEmbeddedDocuments("Item", acItems);
		let acEffects = actor.effects.map((m) => m.id);
		actor.deleteEmbeddedDocuments("ActiveEffect", acEffects);

		actor.update({
			type: "npc",
			name: this.object.schema.name,
			system: this.object.schema
		});
		await actor.createEmbeddedDocuments("Item", this.object.items);
		await actor.createEmbeddedDocuments("ActiveEffect", this.object.effects);
		return this.close();
	}

	async _parseStatblock(ev) {
		ev.preventDefault();
		if (!this.constructor.loadedCompendiums) {
			this.constructor.packequipamentos = await game.packs
				.get("tormenta20.equipamentos")
				.getIndex({ fields: ["system.rolls", "system.criticoM", "system.criticoX", "system.qtd"] });
			this.constructor.packsmagias = await game.packs
				.get("tormenta20.magias")
				.getIndex({ fields: ["system.ativacao"] });
			this.constructor.packspoderes = await game.packs
				.get("tormenta20.poderes")
				.getIndex({ fields: ["system.ativacao"] });
			this.constructor.npcFeatures = await game.packs
				.get("tormenta20.habilidades-de-criaturas")
				.getIndex({ fields: ["system.ativacao"] });

			this.constructor.loadedCompendiums = true;
		}
		const statblock = ev.currentTarget
			.closest("form")
			.statblock.value.replace(/-\n/g, "")
			.replace(/([a-zA-Z0-9áâãàäéêèëíìïóôõòöúùüçñ,])(\n)([a-z0-9áâãàäéêèëíìïóôõòöúùüçñ\-+()])/g, "$1 $3")
			.replaceAll(/–/g, "-");
		const schema = new ActorT20({
			type: "npc",
			name: "template"
		}).system.toObject();
		const log = [];
		const itemsList = [];
		this.object.items = [];
		this.object.effects = [];
		// const statblock2 = statblock.split("\n").filter(Boolean);
		// const log2 = {
		// 	name: { success: false, message: "Nome" },
		// 	cr: { success: false, message: "ND" },
		// 	type: { success: false, message: "Tipo" },
		// 	size: { success: false, message: "Tamanho" },
		// 	role: { success: false, message: "Papel em Combate" },
		// 	abilities: { success: false, message: "Atributos" },
		// 	hp: { success: false, message: "PV" },
		// 	mp: { success: false, message: "PM" },
		// 	defense: { success: false, message: "Defesa" },
		// 	immunities: { success: false, message: "Imunidades a Condições" },
		// 	dr: { success: false, message: "Reduções de Dano" },
		// 	movement: { success: false, message: "Deslocamentos" },
		// 	senses: { success: false, message: "Sentidos" },
		// 	skills: { success: false, message: "Perícias" },
		// 	powers: { success: false, message: "Poderes e Magias" },
		// 	weapons: { success: false, message: "Armas" },
		// 	equipment: { success: false, message: "Equipamentos" },
		// 	loot: { success: false, message: "ND" }
		// };
		// console.log(statblock2);
		// this.parseData2(statblock2, schema, itemsList, log2); //LINHA A LINHA
		this.parseData(statblock, schema, itemsList, log);
		this.parseSkills(statblock, schema, itemsList, log);
		this.parseAbilities(statblock, schema, itemsList, log);
		this.parseWeapons(statblock, schema, itemsList, log);
		this.parseTreasure(statblock, schema, itemsList, log);
		this.object.statblock = statblock;
		this.object.schema = schema;
		this.object.items = itemsList;
		this.object.log = log;
		this.render(true);
	}

	parseData2(statblock, schema, itemsList, log) {
		const updateData = {};
		let line;

		// GET NAME AND CR;
		line = statblock.find((i) => i.match(/ND \w+$/i));
		if (line) {
			let { name, nd } = line.split(/ ND /i);
			schema.name = name;
			schema.attributes.nd = nd;
			log.name = { success: true, message: `Nome: ${schema.name}` };
			log.cr = { success: true, message: `ND: ${schema.attributes.nd}` };
		}

		// GET TYPE (SUBTYPE), SIZE AND ROLE;
		line = statblock.find(
			(i) => i.match(this.toRegExpOr(T20.creatureTypes)) && i.match(this.toRegExpOr(T20.actorSizes))
		);
		if (line) {
			let t = line.match(this.toRegExpOr(T20.creatureTypes, true))?.[0] ?? "Monstro";
			let st = line.match(/\((\w+)\)/i)?.[0] ?? "";
			let s = line.match(this.toRegExpOr(T20.actorSizes, true))?.[0] ?? "Médio";
			let r = line.match(this.toRegExpOr(T20.creatureRoles, true))?.[0] ?? "Solo";
			schema.detalhes.tipo = foundry.utils.invertObject(T20.creatureTypes)[t[0]];
			schema.detalhes.raca = st;
			log.type = {
				success: true,
				message: `Tipo: ${t} ${st ? `(${st})` : ""}`
			};
			schema.tracos.tamanho = foundry.utils.invertObject(T20.actorSizes)[s[0]] ?? "";
			log.size = { success: true, message: `Tamanho: ${s}` };
			schema.detalhes.role = foundry.utils.invertObject(T20.creatureRoles)[r[0]] ?? "";
			log.role = { success: true, message: `Papel: ${r}` };
		}

		// GET ABILITIES;
		line = statblock.find((i) => i.match(/([A-z]{3} ([\-]?[\d|\—])+, ){5}/gi));
		if (line) {
			let abilities = line
				.toLowerCase()
				.split(",")
				.map((i) => i.trim().split(" "));
			for (const [abl, value] of abilities) {
				schema.atributos[abl] = Number(value);
			}
			log.atributos = { success: true, message: `Atributos: ${line}` };
		}

		// GET RESOURCES HP
		let re = new RegExp(`${game.i18n.translations.T20.HitPoints} \\d+`, "i");
		line = statblock.find((i) => i.match(re));
		if (line) {
			schema.attributes.pv.value = parseInt(line.match(/\d+/)?.[0] ?? 0);
			schema.attributes.pv.max = parseInt(line.match(/\d+/)?.[0] ?? 0);
			log.hp = { success: true, message: `${line}` };
		}
		// GET RESOURCES MP
		re = new RegExp(`${game.i18n.translations.T20.ManaPoints} \\d+`, "i");
		line = statblock.find((i) => i.match(re));
		if (line) {
			schema.attributes.pm.value = parseInt(line.match(/\d+/)?.[0] ?? 0);
			schema.attributes.pm.max = parseInt(line.match(/\d+/)?.[0] ?? 0);
			log.mp = { success: true, message: `${line}` };
		}
		// GET DEFENSE
		re = new RegExp(`${game.i18n.translations.T20.Defense} \\d+`, "i");
		line = statblock.find((i) => i.match(re));
		if (line) {
			schema.attributes.defense.base = parseInt(line.match(/\d+/)?.[0] ?? 0);
			log.defense = { success: true, message: `${line}` };
		}
		// GET RESISTANCES
		if (line) {
			const res = re[0]?.replace(/((Defesa|For|Ref|Von|Fort|Refl|Vont) [\+|\-]?\d+[,]?)/gi, "").trim() || "";
			schema.detalhes.resistencias = res;
			// log.res = {success: true, message: `Resistencias (Texto): ${res}`};
		}
		// console.log(schema, log);
	}

	parseData(statblock, schema, itemsList, log) {
		let msg = "";
		// Extrai o nome e ND
		try {
			const name = statblock.match(/(.*)\n*/);
			const nd = statblock.match(/ND ([\d|\d\/\d]+)/);
			if (name) {
				schema.name = name[1];
				log.push({ success: true, message: `Nome: ${schema.name}` });
			} else log.push({ success: false, message: "Nome" });
			if (nd) {
				schema.attributes.nd = nd[1];
				log.push({ success: true, message: `ND: ${schema.attributes.nd}` });
			} else log.push({ success: false, message: "ND" });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Nome ou ND" });
		}

		// Extrai Tipos
		try {
			const cType = Object.fromEntries(Object.entries(CONFIG.T20.creatureTypes).map(([key, value]) => [value, key]));
			const cRole = Object.fromEntries(Object.entries(CONFIG.T20.creatureRoles).map(([key, value]) => [value, key]));
			const cSize = Object.fromEntries(Object.entries(CONFIG.T20.actorSizes).map(([key, value]) => [value, key]));

			let types = statblock
				.capitalize()
				.match(/.*\s(especial|solo|lacaio|Iniciativa)/i)[0]
				.replace(/Iniciativa|\(|\)/gi, "")
				.trim()
				.split(" ")
				.map((m) => cType[m] || cRole[m.capitalize()] || cSize[m] || m);
			for (let t of types) {
				if (CONFIG.T20.creatureTypes[t]) {
					schema.detalhes.tipo = t;
					log.push({
						success: true,
						message: `Tipo de Criatura: ${CONFIG.T20.creatureTypes[t]}`
					});
				} else if (CONFIG.T20.creatureRoles[t]) {
					schema.detalhes.role = t;
					log.push({
						success: true,
						message: `Papel em Combate: ${CONFIG.T20.creatureRoles[t]}`
					});
				} else if (CONFIG.T20.actorSizes[t]) {
					schema.tracos.tamanho = t;
					log.push({
						success: true,
						message: `Tamanho: ${CONFIG.T20.actorSizes[t]}`
					});
				} else {
					schema.detalhes.raca = t.capitalize();
					log.push({
						success: true,
						message: `Subtipo de Criatura: ${schema.detalhes.raca}`
					});
				}
			}
			if (!schema.detalhes.role) log.push({ success: false, message: "Papel em Combate: Solo" });
		} catch (error) {
			console.warn(error);
			log.push({
				success: false,
				message: "Tipo de Criatura, Papel em Combate, Tamanho, Subtipo de Criatura"
			});
		}

		// Extrai atributos
		try {
			let abilities = statblock.match(/For ([\-|\–]?[\d|\—]+), *[^\n]*/i);
			abilities = abilities[0]
				.toLowerCase()
				.match(/(\w+) ([\-|\–]?[\d|\—]+)/g)
				.map((m) => {
					return { [m.split(" ")[0]]: m.split(" ")[1] };
				});
			abilities = Object.assign({}, ...abilities);
			msg = "";
			for (let [abl, value] of Object.entries(abilities)) {
				schema.atributos[abl].base = parseInt(value.replace("—", "-0").replace("–", "-"));
				msg += `${abl}: ${value} `;
			}
			log.push({ success: true, message: `Atributos: ${msg}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Atributos" });
		}

		// Extrai Recursos
		try {
			let hp = statblock.match(/Pontos de Vida (?<value>\d+)/i);
			let mp = statblock.match(/Pontos de Mana (?<value>\d+)/i);
			if (hp && hp.groups) {
				schema.attributes.pv.value = parseInt(hp.groups.value);
				schema.attributes.pv.max = parseInt(hp.groups.value);
				log.push({
					success: true,
					message: `Pontos de Vida: ${schema.attributes.pv.max}`
				});
			}
			if (mp && mp.groups) {
				schema.attributes.pm.value = parseInt(mp.groups.value);
				schema.attributes.pm.max = parseInt(mp.groups.value);
				log.push({
					success: true,
					message: `Pontos de Mana: ${schema.attributes.pm.max}`
				});
			} else {
				schema.attributes.pm.value = 0;
				schema.attributes.pm.max = 0;
			}
		} catch (error) {
			console.warn(error);
			log.push({
				success: false,
				message: "Pontos de Vida e/ou Pontos de Mana"
			});
		}

		// Extrai Defesa
		try {
			const { value } = statblock.match(/Defesa (?<value>\d+)/i).groups;
			if (value) schema.attributes.defesa.base = Number(value) - schema.atributos.des.base;
			log.push({ success: true, message: `Defesa: ${value}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Defesa" });
		}

		// Extrai Resistências
		try {
			let res = statblock.replace(/\n/g, " ").match(/Defesa .* Pontos de Vida/i);
			// TODO converter para pegar a habilidade de criatura e alterar o valor do efeito
			if (/resist[eê]ncia a magia \+\d/i.test(res[0])) {
				const qtd = res[0].match(/resist[eê]ncia a magia \+(\d*)/i)[1];
				this.object.effects.push(
					new ActiveEffect(
						{
							img: "icons/svg/upgrade.svg",
							name: "Resistência a Magia",
							changes: [{ key: "roll", priority: null, value: qtd }],
							disabled: true,
							flags: {
								tormenta20: {
									onuse: true,
									skill: true,
									items: "Fortitude;Reflexos;Vontade"
								}
							}
						},
						{ parent: this.object.actor }
					)
				);
			}
			res =
				res[0]?.replace(/((Defesa|For|Ref|Von|Fort|Refl|Vont) [\+|\-|\–]?\d+[,]?|Pontos de Vida)/gi, "").trim() || "";
			schema.detalhes.resistencias = res;
			log.push({
				success: true,
				message: `Resistências (Texto): ${schema.detalhes.resistencias}`
			});

			res = res.replace(/ |,/g, "_").slugify().replace(/_/g, " ");
			res = res
				.replace(/imunidade|reducao|resistencia|vulnerabilidade/gi, (match) => `#${match}`)
				.split("#")
				.filter(Boolean)
				.map((m) => m.trim());
			res = res.map((m) => {
				return {
					[m.match(/imunidade|reducao|resistencia|vulnerabilidade/i)]: m.split(" ")
				};
			});

			let ic = [];
			let rd = [];
			let dmgimuni = [];
			let dmgvuln = [];
			res.forEach((r) => {
				if (r.imunidade) {
					ic.push(...r.imunidade.filter((f) => CONFIG.T20.conditionTypes[f]));
					dmgimuni.push(...r.imunidade.filter((f) => CONFIG.T20.damageTypes[f]));
				} else if (r.reducao) {
					let [value, vuln] = r.reducao.find((f) => parseInt(f)).split("/");
					rd.push(
						...r.reducao
							.filter((f) => CONFIG.T20.damageTypes[f])
							.map((f) => {
								return { [f]: value };
							})
					);
				} else if (r.resistencia) {
					// TODO criar mecanica de resistência
				} else if (r.vulnerabilidade) {
					dmgvuln = r.vulnerabilidade.filter((f) => CONFIG.T20.damageTypes[f]);
				}
			});

			if (ic.length) {
				schema.tracos.ic.value = ic;
				log.push({
					success: true,
					message: `Imunidades a Condições: ${ic.join(", ") || "—"}`
				});
			}
			msg = "";
			let tmp = Object.assign({}, ...rd);
			for (let [k, v] of Object.entries(tmp)) {
				schema.tracos.resistencias[k].base = parseInt(v) || 0;
				msg += `${k}: ${v}; `;
			}
			log.push({ success: true, message: `Resistência a dano: ${msg || "—"}` });
			for (let k of dmgimuni) {
				schema.tracos.resistencias[k].imunidade = true;
			}
			log.push({
				success: true,
				message: `Imunidade a dano: ${dmgimuni.join(", ") || "—"}`
			});
			for (let k of dmgvuln) {
				schema.tracos.resistencias[k].vulnerabilidade = true;
			}
			log.push({
				success: true,
				message: `Vulnerabilidade a dano: ${dmgvuln.join(", ") || "—"}`
			});
		} catch (error) {
			console.warn(error);
			log.push({
				success: false,
				message: "Imunidades a Condições e Reduções de Dano"
			});
		}

		// Extrai Deslocamentos
		try {
			// let movement = statblock.toLowerCase().match(/\n(\w+ \d+m \(\d+q\))/ig).map( m => [m.match(/deslocamento|escalar|escavar|natação|voo/i)[0], m.match(/\d+/)[0]]);
			let movementTxt = statblock.split("\n").find((l) => l.match(/^Deslocamento( \w+)? \d+m/i));
			let temp = movementTxt.split("q),");
			temp = temp.pop().trim();
			if (!temp.match(/\(\d+q\)/)) {
				schema.detalhes.movimento = temp;
				movementTxt = movementTxt.replace(`, ${temp}`, "", movementTxt);
			}

			let movement = movementTxt
				.slugify()
				.replaceAll("-", " ")
				.replace(/^Deslocamento ([A-z]+)/i, "$1")
				.split(",")
				.map((m) => [m.match(/\w+/)[0], m.match(/\d+/)[0]]);

			// movement2.split(',').map(d => d.split(' '));
			msg = "";
			for (let [move, value] of movement) {
				let ms = {
					deslocamento: "walk",
					escalar: "climb",
					escavar: "burrow",
					natacao: "swim",
					voo: "fly"
				};
				if (ms[move]) {
					schema.attributes.movement[ms[move]] = parseInt(value);
					msg += `${move} ${value}; `;
				}
			}
			log.push({ success: true, message: `Movimento: ${msg}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Deslocamentos" });
		}

		// Extrai Sentidos percepção às cegas
		try {
			let senses = Object.fromEntries(Object.entries(CONFIG.T20.senses).map(([key, value]) => [value.slugify(), key]));
			let sentidos = statblock.replace(/\n/g, " ").match(/Iniciativa .* Defesa/i)[0];
			sentidos = sentidos.replace(/Defesa/i, "");
			sentidos = sentidos.split(",").map((m) => m.trim().slugify());
			sentidos = sentidos.filter((f) => senses[f]).map((m) => senses[m]);
			schema.attributes.sentidos.value = sentidos;
			log.push({ success: true, message: `Sentidos: ${sentidos.join(", ") || "—"}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Sentidos" });
		}
	}

	parseSkills(statblock, schema, itemsList, log) {
		let msg = "";
		try {
			let sks = Object.fromEntries(
				Object.entries(T20.pericias)
					.filter(([_, value]) => value.label)
					.map(([key, value]) => [value.label, key])
			);
			sks.Fort = "fort";
			sks.Ref = "refl";
			sks.Von = "vont";
			// this.toRegExpOr(sks);
			let skills = statblock
				.replace(/\n/g, " ")
				.replace("–", "-")
				.match(
					/(Acrobacia|Adestramento|Atletismo|Atuação|Cavalgar|Conhecimento|Cura|Defesa|Diplomacia|Enganação|Fortitude|Furtividade|Guerra|Iniciativa|Intimidação|Intuição|Investigação|Jogatina|Ladinagem|Luta|Misticismo|Ocultismo|Nobreza|Ofício|Percepção|Pilotagem|Pontaria|Reflexos|Religião|Sobrevivência|Vontade|Fort|Ref|Von) ([\+|\-]\d+)/gi
				);
			skills = skills.map((m) => {
				const pericia = m.split(" ")[0].toLowerCase().capitalize();
				return { [sks[pericia]]: { value: parseInt(m.split(" ")[1]) } };
			});
			skills = Object.assign({}, ...skills);
			msg = "";
			for (let [key, skill] of Object.entries(skills)) {
				this.parseSkill(key, skill, schema);
				msg += `${CONFIG.T20.pericias[key].label}: ${skill.value + (skill.outros ?? 0)}; `;
			}
			log.push({ success: true, message: `Perícias: ${msg}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Perícias" });
		}
	}

	parseSkill(key, skill, schema) {
		skill.atributo ??= T20.pericias[key].abl;
		const nd = schema.attributes.nd;
		let nivel = 1;
		if (["1/2", "1/4"].includes(nd)) nivel = 1;
		else if (["S", "S+"].includes(nd)) nivel = 20;
		else nivel = Number(nd) || 1;

		const meionivel = Math.floor(nivel / 2);
		const treino = nivel > 14 ? 6 : nivel > 6 ? 4 : 2;
		const atributo = schema.atributos[skill.atributo].base;
		const tamanho = T20.pericias[key].sizeMod ? CONFIG.T20.sizeModifiers[schema.tracos.tamanho] : 0;

		const comTreino = meionivel + treino + atributo + tamanho;
		const semTreino = meionivel + atributo + tamanho;
		if (skill.value === comTreino) skill.treinado = true;
		else if (skill.value === semTreino) skill.treinado = false;
		else {
			const treinado = Math.abs(comTreino - skill.value) < Math.abs(semTreino - skill.value);
			skill.treinado = treinado;
			skill.outros = skill.value - (treinado ? comTreino : semTreino);
			skill.value -= skill.outros;
		}
		schema.pericias[key] = skill;
	}

	/**
	 * Search for world collenction and compendiums for item @name and @type
	 */
	searchItem(name, type, itemsList) {
		let idx = 5;
		if (["magia", "poder"].includes(type)) {
			if (name.split("(")[1]) {
				name = name.split("(")[0].trim();
			} else {
				idx = name.split(" ").find((f) => f.length > 3 && f[0].match(/[a-z]/));
				idx = idx ? name.split(" ").indexOf(idx) - 1 : 5;
				name = idx ? name.split(" ", idx).join(" ") : name;
			}
		}
		let names = [];
		let words = name.split(" ", idx);
		let conc = "";
		for (let i = 0; i <= words.length; i++) {
			for (let j = 1; j < 6; j++) {
				if (i + j > words.length) continue;
				conc = words.slice(i, i + j).join(" ");
				names.push(conc.slugify());
				conc = words
					.map((m) => m.replace(/.$/, ""))
					.slice(i, i + j)
					.join(" ");
				names.push(conc.slugify());
			}
		}
		let exists = itemsList.find((f) => names.includes(f.name.slugify()));
		if (exists) {
			return { exists: true };
		}
		const packs = {
			"*": "packequipamentos",
			arma: "packequipamentos",
			equipamento: "packequipamentos",
			magia: "packsmagias"
		};
		names.sort((a, b) => b.length - a.length);
		let item;

		const isGeneric = type === "*";
		const typeFilter = (f) => (isGeneric ? !["poder", "magia", "arma", "classe"].includes(f.type) : f.type === type);
		const itemDirList = game.items.filter(typeFilter);
		let packList;
		if (type === "poder") packList = [...this.constructor.packspoderes, ...this.constructor.npcFeatures];
		else packList = this.constructor[packs[type]];

		const pack = packList.filter(typeFilter);
		for (const name of names) {
			item = itemDirList.find((f) => f.name.slugify() === name) ?? pack.find((f) => f.name.slugify() === name);
			if (item) break;
		}

		if (!item) {
			type = isGeneric ? "tesouro" : type;
			item = new game.tormenta20.entities.ItemT20({
				type: type,
				name: words.join(" ")
			}).toObject();
			delete item._id;
		}
		return item;
	}

	parseAbilities(statblock, schema, itemsList, log) {
		let msg = "";
		try {
			let actions = Object.fromEntries(
				Object.entries(CONFIG.T20.abilityActivationTypes).map(([key, value]) => [value, key])
			);
			let abilities = "";
			let lines = statblock.split(/\n/);
			if (statblock.match(/À Distância .*(\n)/i)) {
				abilities = statblock.match(/À Distância .*(\n)/i)[0];
				abilities = lines.find((l) => l.match(/^À Distância /i));
				schema.detalhes.ataquesad = abilities.replace(/À Distância /i, "");
			}
			if (statblock.match(/Corpo a Corpo .*(\n)/i)) {
				abilities = statblock.match(/Corpo a Corpo .*(\n)/i)[0];
				abilities = lines.find((l) => l.match(/^Corpo a Corpo /i));
				schema.detalhes.ataquescac = abilities.replace(/Corpo a Corpo /i, "");
			}
			if (statblock.match(/Deslocamento (.|\n)*/i)) {
				abilities = statblock.match(/Deslocamento .*(\n)/i)[0];
				abilities = lines.find((l) => l.match(/^Deslocamento /i) && l.match(/\d+m (\d+q)/i));
				// schema.detalhes.movimento = abilities.split(',')[1] ?? '';
			}
			// abilities = abilities.match(/((.|\n)*)\nFor /)[1];
			// abilities = abilities.replace(/(\.|\))\n/g,'</abl>#<abl>').split('#');
			// abilities.shift();
			// abilities = abilities.filter( m => !m.match(/(For ([\-|\–]?[\d|\—]+), Des)|(Perícias )|(Equipamento )|(Tesouro )/) );
			// abilities = abilities.map( m =>  m.replace(/<abl>|<\/abl>/g,'').replace(/\n/g,' ').trim());

			abilities = lines.filter(
				(l) =>
					!(
						new RegExp(schema.name).test(l)
						|| /ND (\d+|\d+\/\d+)$/i.test(l)
						|| /^Defesa \d+, Fort [+-]?\d+, Ref [+-]?\d+/i.test(l)
						|| /^Corpo a Corpo /i.test(l)
						|| /^À Distância /i.test(l)
						|| (/^Deslocamento /i.test(l) && /\d+m (\d+q)/i.test(l))
						|| /^Iniciativa [+-]?\d+, Percepção [+-]?\d+/i.test(l)
						|| /^Deslocamento /i.test(l)
						|| /^Pontos de (Vida|Mana) \d+/i.test(l)
						|| /^Perícias \w+ [+-]?\d+/i.test(l)
						|| /^(Equipamento|Equipamentos|Tesouro)/i.test(l)
						|| /^Parceiro/i.test(l)
						|| /^For (\-?\d+|—)/i.test(l)
						|| (new RegExp(`^${Object.values(CONFIG.T20.creatureTypes).join("|")}`, "i").test(l)
							&& new RegExp(`(${Object.values(CONFIG.T20.actorSizes).join("|")})`, "i").test(l))
					)
			);
			abilities = abilities.map((m) => {
				return { desc: m };
			});
			abilities.forEach((ability) => {
				let spell = !!ability.desc.match(/• /);
				if (spell) ability.desc = ability.desc.replace("•", "").trim();

				let item = this.searchItem(ability.desc, spell ? "magia" : "poder", itemsList);
				if (item.exists) return;

				ability.action = "";
				ability.pm = 0;
				ability.descOri = ability.desc;
				ability.desc = ability.desc.replace(new RegExp(item.name, "i"), "").trim();
				if (ability.desc[0] == "(") {
					ability.action = ability.desc.match(/\(([^)]+)\)/);
					if (ability.action) {
						ability.desc = ability.desc.replace(ability.action[0], "").trim();
						ability.action = ability.action[0].replace(/\(|\)/g, "");
						ability.pm = ability.action.split(",")[1] ?? 0;
						if (ability.pm) ability.pm = ability.pm.match(/\d+/)[0];
						ability.action = ability.action.split(",")[0];
						ability.action = actions[ability.action];
					}
				}

				if (spell) {
					item.system.description.value = `<section class="secret">${ability.descOri}</section>${item.system.description.value}`;
				}
				if (!spell) {
					item.system.ativacao.custo = ability.pm;
					item.system.ativacao.execucao = ability.action;
					item.system.description.value = ability.desc;
				}
				ability.spell = spell;
				ability.item = item;
			});
			abilities = abilities.filter((f) => f.item).map((m) => m.item);
			itemsList.push(...abilities);
			let powers = abilities.filter((f) => f.type == "poder");
			let spells = abilities.filter((f) => f.type == "magia");

			if (powers.length) {
				msg = `Habilidades encontradas (${powers.length}): `;
				msg += `${powers.map((m) => m.name).join(", ")}`;
				log.push({ success: true, message: `${msg}` });
			}
			if (spells.length) {
				msg = `Magias encontradas (${spells.length}): `;
				msg += `${spells.map((m) => m.name).join(", ")}`;
				log.push({ success: true, message: `${msg}` });
			}
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Poderes e Magias" });
		}
	}

	parseWeapons(statblock, schema, itemsList, log) {
		let msg = "";
		try {
			// Filtra as Linhas de Corpo a Corpo|À Distância;
			const armaData = statblock.match(/((Corpo a Corpo|À Distância) [^\.]*)/gi);
			if (!armaData.length) return;
			const parsedSkills = new Set();
			const itemNames = [];
			for (let AD of armaData) {
				const regexNumeral = /\b(dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez)\b\s+(\w+)/i;

				// Limpa e separa as armas;
				AD = AD.replace(/Corpo a Corpo|À Distância/gi, "")
					.replace(/\n/g, " ")
					.replace(" e ", "|")
					.replace(" ou ", "|")
					.replace("), ", ")|")
					.trim()
					.split("|");

				// Extrai os dados das armas
				AD.forEach((arma) => {
					let qtd = 1;
					arma = arma.match(/(?<name>.*[^\+|\-]) (?<atk>[+|-]\d+) \((?<dmg>.*)\)/).groups;
					if (regexNumeral.test(arma.name)) {
						arma.name = arma.name.replace(regexNumeral, (_original, numero, palavra) => {
							qtd = game.tormenta20.utils.wordToNumber(numero);
							return game.tormenta20.utils.despluralizar(palavra).titleCase();
						});
					}
					let item = this.searchItem(arma.name, "arma", itemsList);
					if (!item) return;
					// Prepara Rolagem de Ataque
					const { rolls } = item.system;
					const attack = rolls.find((r) => r.type === "ataque");
					if (arma.atk && attack) {
						const pericia = attack.parts[1][0];
						if (!parsedSkills.has(pericia) && !schema.pericias[pericia].treinado) {
							parsedSkills.add(pericia);
							schema.pericias[pericia].value = Number(arma.atk);
							this.parseSkill(pericia, schema.pericias[pericia], schema);
						} else {
							const { value, outros } = schema.pericias[pericia];
							arma.atk = Number(arma.atk) - value - outros;
							attack.parts[2][0] = arma.atk;
						}
					}
					// Prepara Rolagem de Dano
					const weaponDamage = rolls.find((r) => r.type === "dano");
					if (arma.dmg && weaponDamage) {
						let [dmg, crit] = arma.dmg.split(",");
						dmg = dmg.split("mais").map((rp) =>
							rp
								.trim()
								.split(" ")
								.map((t) => t.slugify())
								.filter((m) => m.match(/\d+d\d+[\+|\-]?[\d+]?/) || CONFIG.T20.damageTypes[m])
						);
						const [wdmg, ...restDmg] = dmg;
						const dmgtype = weaponDamage?.parts?.[0]?.[1] ?? wdmg?.[1] ?? "corte";
						const baseDmg = wdmg?.[0] ?? "";
						weaponDamage.parts = [[baseDmg, dmgtype, "weapon"], ["", "", ""], ...restDmg];
						const { margem, multi } = crit?.trim().match(/(?<margem>\d+)?\/?(?<multi>x\d)?/).groups || {};
						if (margem) item.system.criticoM = parseInt(margem);
						if (multi) item.system.criticoX = parseInt(multi);
					}
					if (qtd > 1) item.system.qtd = qtd;
					item.system.description.value = `<section class="secret">${arma.name}</section>${item.system.description.value}`;
					itemsList.push(item);
					itemNames.push(qtd > 1 ? `${item.name} x${qtd}` : item.name);
				});
			}

			msg += `Armas encontradas (${itemNames.length}): ${itemNames.join(", ")}`;
			log.push({ success: true, message: `${msg}` });
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Armas" });
		}
	}

	parseTreasure(statblock, schema, itemsList, log) {
		let msg = "";
		try {
			let equipamentos = statblock.replace(/\n/g, " ").match(/Equipamento[s]? .* Tesouro/i);
			equipamentos = equipamentos ? equipamentos[0] : false;
			if (equipamentos) {
				equipamentos = equipamentos
					.replace(/Equipamento|Equipamentos|Tesouro/gi, "")
					.split(",")
					.map((m) => m.replace(".", "").trim());
				equipamentos = equipamentos.map((m) => {
					return { desc: m };
				});
				equipamentos.forEach((equip) => {
					let item = this.searchItem(equip.desc, "*", itemsList);
					if (item.exists) return;
					let qtd = equip.desc.match(/x(?<qtd>\d+)/);
					if (qtd) item.system.qtd = qtd.groups?.qtd || 1;
					item.system.description.value = `${equip.desc}<br>${item.system.description.value}`;
					equip.item = item;
				});
				equipamentos = equipamentos.filter((f) => f.item).map((m) => m.item);
				itemsList.push(...equipamentos);

				msg += `Equipamentos encontrados (${equipamentos.length}): `;
				msg += `${equipamentos.map((m) => (m.system.qtd > 1 ? `${m.name} x${m.system.qtd}` : m.name)).join(", ")}`;
				log.push({ success: true, message: `${msg}` });
			}
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Equipamentos" });
		}

		try {
			let tesouros = statblock.match(/Tesouro .*/i)[0];
			tesouros = tesouros.replace(/Tesouro/i, "").trim();
			schema.detalhes.tesouro = tesouros;
			log.push({
				success: true,
				message: `Tesouro (Texto): ${schema.detalhes.tesouro}`
			});
		} catch (error) {
			console.warn(error);
			log.push({ success: false, message: "Tesouro" });
		}
	}
}
