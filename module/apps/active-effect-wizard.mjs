import { Accordion } from "../style/Accordion.mjs";

import ActorT20 from "../documents/actor.mjs";
import ItemT20 from "../documents/item.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class ActiveEffectWizard extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(document, effectData = {}, options = {}) {
		super(options);
		this.document = document;
		if (this.document instanceof ItemT20) {
			this.#effect.name = this.document.name;
			this.#effect.img = this.document.img;
		}
		this.#effect = {
			...this.#effect,
			...effectData
		};
		// PJs têm praticamente todos os campos utilizáveis
		this.templateModel = new ActorT20({ name: "Template", type: "character" });
	}

	#effect = {
		name: game.i18n.localize("T20.EffectNewLabel"),
		img: "icons/svg/aura.svg"
	};

	#changes = [];

	#accordions = [];

	#collapsibleStates = {
		arma: true,
		magia: true,
		atributo: true,
		skill: true
	};

	currAttribute = "for";

	currSkill = "acro";

	currResistance = "dano";

	document;

	static DEFAULT_OPTIONS = {
		window: {
			icon: "fas fa-wand-magic-sparkles",
			title: "Criador de Efeitos Ativos",
			resizable: true
		},
		position: {
			width: 650,
			height: 800
		},
		classes: ["tormenta20", "active-effect-wizard", "swade-application", "standard-form"],
		tag: "form",
		form: {
			handler: ActiveEffectWizard.#createEffect,
			submitOnClose: false,
			submitOnChange: false,
			closeOnSubmit: false
		},
		actions: {
			addChange: ActiveEffectWizard.#onAddChange,
			deleteChange: ActiveEffectWizard.#onDeleteChange,
			clickIcon: ActiveEffectWizard.#onClickIcon
		}
	};

	static PARTS = {
		form: {
			template: "systems/tormenta20/templates/apps/active-effect-wizard.hbs",
			scrollable: [".presets"]
		},
		footer: { template: "templates/generic/form-footer.hbs" }
	};

	get targetIsSpell() {
		return this.document instanceof ItemT20 && this.document.type === "magia";
	}

	get targetIsWeapon() {
		return this.document instanceof ItemT20 && this.document.type === "arma";
	}

	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const target = event.target;
		if (!target) return; // TODO: what actually do
		const index = target.closest("li")?.dataset.index;
		if (target.classList.contains("value")) {
			if (target.type === "checkbox") this.#changes[Number(index)].value = target.checked;
			else this.#changes[Number(index)].value = target.value;
		} else if (target.classList.contains("mode")) {
			this.#changes[Number(index)].mode = Number(target.value);
		} else if (target.classList.contains("target")) {
			this[target.name] = target.value;
		}
		const formData = new foundry.applications.ux.FormDataExtended(this.form);
		foundry.utils.mergeObject(this.#effect, formData.object);
		this.render();
	}

	async _onRender(context, options) {
		await super._onRender(context, options);
		this.#setupAccordions();
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		return foundry.utils.mergeObject(context, {
			isSpell: this.targetIsSpell,
			isWeapon: this.targetIsWeapon,
			effect: this.#effect,
			changes: this.#changes,
			collapsibleStates: this.#collapsibleStates,
			expirationOptions: this.#getExpirationOptions(),
			skillSuggestions: this.#getSkillSuggestions(),
			resistanceSuggestions: this.#getResistanceSuggestions(),
			resistancePresets: this.#getResistancePresets(),
			derivedPresets: this.#getDerivedPresets(),
			globalModPresets: this.#getGlobalModPresets(),
			otherPresets: this.#getOtherStatsPresets(),

			spellPresets: this.#getSpellPresets(),
			weaponPresets: this.#getWeaponPresets(),
			attributes: { "*": "Todos os Atributos", ...CONFIG.T20.atributos },
			currAttribute: this.currAttribute,
			currSkill: this.currSkill,
			currResistance: this.currResistance,
			changeModes: {
				[foundry.CONST.ACTIVE_EFFECT_MODES.ADD]: "EFFECT.MODE_ADD",
				[foundry.CONST.ACTIVE_EFFECT_MODES.MULTIPLY]: "EFFECT.MODE_MULTIPLY",
				[foundry.CONST.ACTIVE_EFFECT_MODES.OVERRIDE]: "EFFECT.MODE_OVERRIDE",
				[foundry.CONST.ACTIVE_EFFECT_MODES.UPGRADE]: "EFFECT.MODE_UPGRADE"
			},
			buttons: [
				{
					type: "submit",
					icon: "fa-solid fa-arrow-down-to-line",
					label: "T20.EffectWizard.Add"
				}
			]
		});
	}

	/**
	 * @this ActiveEffectWizard
	 */
	static async #createEffect(_event, _form, _formData) {
		this.#prepareChanges();
		await foundry.utils.getDocumentClass("ActiveEffect").create(this.#effect, {
			renderSheet: this.#changes.length === 0,
			parent: this.document
		});
		this.close();
	}

	#getSkillSuggestions() {
		const parent = this.document.parent ?? this.document;
		const createSuggestions = (obj) => {
			return Object.fromEntries(
				Object.entries(obj)
					.map(([key, skill]) => [key, skill.label ?? CONFIG.T20.pericias[key].label])
					.filter(([_, label]) => label)
					.sort((a, b) => a[1].localeCompare(b[1]))
			);
		};
		const source = parent instanceof ActorT20 ? parent.system.pericias : CONFIG.T20.pericias;
		return { "*": "Todas as Perícias", ...createSuggestions(source) };
	}

	#getResistanceSuggestions() {
		const createSuggestions = () => {
			return Object.fromEntries(
				Object.entries(CONFIG.T20.damageTypes)
					.map(([key, label]) => [key, label])
					.filter(([_, label]) => label)
			);
		};
		return createSuggestions();
	}

	#getResistancePresets() {
		return [
			{
				key: "bonus",
				label: game.i18n.localize("T20.DR")
			},
			{
				key: "vulnerabilidade",
				label: game.i18n.localize("T20.Weakness")
			},
			{
				key: "imunidade",
				label: game.i18n.localize("T20.Immunity")
			},
			{
				key: "danoPorDado",
				label: game.i18n.localize("T20.DamPerDie"),
				disabled: ["dano", "perda"].includes(this.currResistance)
			}
		];
	}

	#getDerivedPresets() {
		return [
			{
				label: `${game.i18n.localize("T20.Health")}: ${game.i18n.localize("T20.BonusTotal")}`,
				key: "system.attributes.pv.bonus.total"
			},
			{
				label: `${game.i18n.localize("T20.Health")}: ${game.i18n.localize("T20.BonusPerLevel")}`,
				key: "system.attributes.pv.bonus.nivel"
			},
			{
				label: `${game.i18n.localize("T20.Health")}: ${game.i18n.localize("T20.BonusPerLevelOdd")}`,
				key: "system.attributes.pv.bonus.nivelImpar"
			},
			{
				label: `${game.i18n.localize("T20.Health")}: ${game.i18n.localize("T20.BonusPerLevelEven")}`,
				key: "system.attributes.pv.bonus.nivelPar"
			},
			{
				label: `${game.i18n.localize("T20.Mana")}: ${game.i18n.localize("T20.BonusTotal")}`,
				key: "system.attributes.pm.bonus.total"
			},
			{
				label: `${game.i18n.localize("T20.Mana")}: ${game.i18n.localize("T20.BonusPerLevel")}`,
				key: "system.attributes.pm.bonus.nivel"
			},
			{
				label: `${game.i18n.localize("T20.Mana")}: ${game.i18n.localize("T20.BonusPerLevelOdd")}`,
				key: "system.attributes.pm.bonus.nivelImpar"
			},
			{
				label: `${game.i18n.localize("T20.Mana")}: ${game.i18n.localize("T20.BonusPerLevelEven")}`,
				key: "system.attributes.pm.bonus.nivelPar"
			},
			{
				label: `${game.i18n.localize("T20.Defense")}: ${game.i18n.localize("T20.Bonus")}`,
				key: "system.attributes.defesa.bonus"
			},
			{
				label: `${game.i18n.localize("T20.Defense")}: ${game.i18n.localize("T20.Ability")}`,
				key: "system.attributes.defesa.atributo"
			}
		];
	}

	#getGlobalModPresets() {
		return [
			{ name: "system.modificadores.atributos.for", label: "Testes de Força" },
			{
				name: "system.modificadores.atributos.des",
				label: "Testes de Destreza"
			},
			{
				name: "system.modificadores.atributos.con",
				label: "Testes de Constituição"
			},
			{
				name: "system.modificadores.atributos.int",
				label: "Testes de Inteligência"
			},
			{
				name: "system.modificadores.atributos.sab",
				label: "Testes de Sabedoria"
			},
			{
				name: "system.modificadores.atributos.car",
				label: "Testes de Carisma"
			},
			{
				name: "system.modificadores.atributos.geral",
				label: "Testes de Atributos"
			},
			{
				name: "system.modificadores.atributos.fisicos",
				label: "Testes de Atributos Fisicos"
			},
			{
				name: "system.modificadores.atributos.mentais",
				label: "Testes de Atributos Mentais"
			},
			{ name: "system.modificadores.custoPM", label: "Aumento de custo de PM" },
			{ name: "system.modificadores.dano.geral", label: "Dano Geral" },
			{ name: "system.modificadores.dano.cac", label: "Dano Corpo a Corpo" },
			{ name: "system.modificadores.dano.ad", label: "Dano A Distância" },
			{ name: "system.modificadores.dano.mag", label: "Dano de Magias" },
			{ name: "system.modificadores.cura.geral", label: "Cura Geral" },
			{ name: "system.modificadores.cura.alq", label: "Cura Alquímica" },
			{ name: "system.modificadores.cura.mag", label: "Cura Mágica" },
			{
				name: "system.modificadores.pericias.geral",
				label: "Testes de Perícias"
			},
			{
				name: "system.modificadores.pericias.ataque",
				label: "Testes de Perícias de Ataque"
			},
			{
				name: "system.modificadores.pericias.semataque",
				label: "Testes de Perícias, exceto de Ataque"
			},
			{
				name: "system.modificadores.pericias.resistencia",
				label: "Testes de Perícias de Resistências"
			},
			{
				name: "system.modificadores.pericias.atr.for",
				label: "Testes de Perícias de Força"
			},
			{
				name: "system.modificadores.pericias.atr.des",
				label: "Testes de Perícias de Destreza"
			},
			{
				name: "system.modificadores.pericias.atr.con",
				label: "Testes de Perícias de Constituição"
			},
			{
				name: "system.modificadores.pericias.atr.int",
				label: "Testes de Perícias de Inteligência"
			},
			{
				name: "system.modificadores.pericias.atr.sab",
				label: "Testes de Perícias de Sabedoria"
			},
			{
				name: "system.modificadores.pericias.atr.car",
				label: "Testes de Perícias de Carisma"
			}
		];
	}

	#getOtherStatsPresets() {
		return [
			{
				label: game.i18n.localize("T20.Size"),
				key: "system.tracos.tamanho"
			},
			{
				label: game.i18n.localize("T20.SpellDC"),
				key: "system.attributes.cd"
			},
			{
				label: game.i18n.localize("T20.AllMovements"),
				key: "system.attributes.movement.*"
			},
			{
				label: `${game.i18n.localize("T20.Movement")} ${game.i18n.localize("T20.MovementWalk")}`,
				key: "system.attributes.movement.walk"
			},
			{
				label: `${game.i18n.localize("T20.Movement")} ${game.i18n.localize("T20.MovementBurrow")}`,
				key: "system.attributes.movement.burrow"
			},
			{
				label: `${game.i18n.localize("T20.Movement")} ${game.i18n.localize("T20.MovementClimb")}`,
				key: "system.attributes.movement.climb"
			},
			{
				label: `${game.i18n.localize("T20.Movement")} ${game.i18n.localize("T20.MovementFly")}`,
				key: "system.attributes.movement.fly"
			},
			{
				label: `${game.i18n.localize("T20.Movement")} ${game.i18n.localize("T20.MovementSwim")}`,
				key: "system.attributes.movement.swim"
			},
			{
				label: "Limite de Itens Empunháveis",
				key: "system.equipamentos.limiteEmpunhado"
			},
			{
				label: "Limite de Itens Vestidos",
				key: "system.equipamentos.limiteVestido"
			}
		];
	}

	#getSpellPresets() {
		if (!this.targetIsSpell) return [];
		return [
			{
				name: "alcance",
				label: "Alcance"
			},
			{
				name: "area",
				label: "Área"
			},
			{
				name: "cd",
				label: "CD"
			},
			{
				name: "dano",
				label: "Dano"
			},
			{
				name: "duracao",
				label: "Duração"
			},
			{
				name: "execucao",
				label: "Execução"
			},
			{
				name: "passo",
				label: "Passo de Dano"
			}
		];
	}

	#getWeaponPresets() {
		if (!this.targetIsWeapon) return [];
		return [
			{
				name: "criticoM",
				label: "Margem de Crítico"
			},
			{
				name: "criticoX",
				label: "Multiplicador de Crítico"
			},
			{
				name: "passo",
				label: "Passo de Dano"
			}
		];
	}

	#getExpirationOptions() {
		return {
			0: "SWADE.Expiration.BeginAuto",
			1: "SWADE.Expiration.BeginPrompt",
			2: "SWADE.Expiration.EndAuto",
			3: "SWADE.Expiration.EndPrompt"
		};
	}

	#prepareChanges() {
		this.#effect.changes = this.#changes.map((c) => {
			return {
				key: c.key,
				mode: c.mode,
				value: c.value
			};
		});
	}

	/**
	 * @this ActiveEffectWizard
	 */
	static #onAddChange(_event, currentTarget) {
		const details = currentTarget.closest("details");
		const keyPart = currentTarget.dataset.key;
		const category = details?.dataset.category;
		const tgt = details?.querySelector(".target");
		const target = tgt?.value ?? currentTarget.innerText;

		let label = target;
		let key = keyPart;
		let boolean = false;
		let choices;
		if (category === "skill") {
			if (!target) {
				return ui.notifications.warn("Please enter a skill name first!");
			}
			label = `${tgt.options[tgt.selectedIndex].text} ${currentTarget.innerText}`.trim();
			key = `system.pericias.${target}.${keyPart}`;
		} else if (category === "atributo") {
			label = `${CONFIG.T20.atributos[target]} ${currentTarget.innerText}`.trim();
			key = `system.atributos.${target}.${keyPart}`;
		} else if (category === "resistance") {
			const dano = CONFIG.T20.damageTypes[target];
			let str = "";
			if (keyPart === "bonus") {
				if (target === "dano" || target === "perda") str = "T20.DamResType";
				else str = "T20.DamResOf";
			} else if (keyPart === "vulnerabilidade") {
				if (target === "dano" || target === "perda") str = "T20.DamVulnType";
				else str = "T20.DamVulnOf";
				boolean = true;
			} else if (keyPart === "imunidade") {
				if (target === "dano" || target === "perda") str = "T20.DamImmType";
				else str = "T20.DamImmOf";
				boolean = true;
			} else if (keyPart === "danoPorDado") {
				label = game.i18n.format("T20.DamPerDieOf", { tipo: dano });
				boolean = true;
			}
			label = game.i18n.format(str, { tipo: dano });
			key = `system.tracos.resistencias.${target}.${keyPart}`;
		}
		if (!boolean) {
			const property = foundry.utils.getProperty(this.templateActor, key);
			boolean = typeof property === "boolean";
		}
		const field = this.templateModel.system.schema.getField(key.replace("system.", ""));
		if (field?.choices !== undefined) choices = true;

		this.#changes?.push({
			label: label,
			key: key,
			mode: foundry.CONST.ACTIVE_EFFECT_MODES.ADD,
			boolean,
			choices,
			field
		});
		this.render({ force: true });
	}

	/**
	 * @this ActiveEffectWizard
	 */
	static #onDeleteChange(_event, target) {
		const index = target.closest("li")?.dataset.index;
		this.#changes.splice(Number(index), 1);
		this.render({ force: true });
	}

	#setupAccordions() {
		this.form?.querySelectorAll(".presets details").forEach((el) => {
			this.#accordions.push(new Accordion(el, ".content", { duration: 200 }));
			const id = el.dataset.category;
			el.querySelector("summary")?.addEventListener("click", () => {
				const states = this.#collapsibleStates;
				const currentState = Boolean(states[id]);
				states[id] = !currentState;
			});
		});
	}

	/**
	 * @this ActiveEffectWizard
	 */
	static #onClickIcon(_event, _target) {
		new foundry.applications.apps.FilePicker.implementation({
			current: this.#effect.img,
			type: "image",
			callback: this.#onChangeIcon.bind(this)
		}).render({ force: true });
	}

	#onChangeIcon(path, _picker) {
		this.#effect.img = path;
		this.render({ force: true });
	}
}
