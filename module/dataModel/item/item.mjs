import Tormenta20TypeData from "../base.mjs";

import { RollData } from "../helpers.mjs";
const fields = foundry.data.fields;

export default class Tormenta20ItemData extends Tormenta20TypeData {
	/** @inheritDoc */
	static defineSchema() {
		return {
			description: new fields.SchemaField({
				value: new fields.HTMLField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemDescription",
					hint: "T20.ItemDescriptionHint"
				}),
				unidentified: new fields.HTMLField({
					initial: "",
					label: "T20.ItemUnidentifiedDescription",
					hint: "T20.ItemUnidentifiedDescriptionHint"
				})
			}),
			source: new fields.StringField({
				initial: "",
				label: "T20.ItemSourceReference",
				hint: "T20.ItemSourceReferenceHint"
			}),
			origin: new fields.StringField({
				initial: "",
				label: "T20.ItemOrigin",
				hint: "T20.ItemOriginHint"
			}),
			tags: new fields.ArrayField(new fields.StringField(), {
				label: "T20.ItemTagsList",
				hint: "T20.ItemTagsListHint"
			}),
			rolltags: new fields.ArrayField(new fields.StringField(), {
				label: "T20.ItemTagsList",
				hint: "T20.ItemTagsListHint"
			}),
			automationtags: new fields.ArrayField(new fields.StringField(), {
				label: "T20.ItemAutomationTags",
				hint: "T20.ItemAutomationTagsHint"
			}),
			chatFlavor: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemChatFlavor",
				hint: "T20.ItemChatFlavorHint"
			}),
			chatGif: new fields.StringField({
				initial: "",
				label: "T20.ItemChatGif",
				hint: "T20.ItemChatGifHint"
			})
		};
	}

	/* ITEM SCHEMAS */
	static schemaPhysicalItem(type = "arma") {
		let schema = {
			carregado: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: true,
				label: "T20.ItemCarrying",
				hint: "T20.ItemCarryingHint"
			}),
			espacos: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ItemSlot",
				hint: "T20.ItemSlotsHint"
			}),
			peso: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ItemWeight",
				hint: "T20.ItemWeightHint"
			}),
			qtd: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 1,
				min: 0,
				label: "T20.ItemQuantity",
				hint: "T20.ItemQuantityHint"
			}),
			preco: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ItemPrice",
				hint: "T20.ItemPriceHint"
			}),
			pv: new fields.SchemaField({
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					step: 1,
					min: 0,
					integer: true,
					label: "T20.ItemHitPoints",
					hint: "T20.ItemHitPointsHint"
				}),
				max: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					integer: true,
					label: "T20.ItemHitPointsMax",
					hint: "T20.ItemHitPointsMaxHint"
				})
			}),
			rd: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ItemDamageReduction",
				hint: "T20.ItemDamageReductionHint"
			})
		};

		if (type === "arma") {
		}
		return schema;
	}

	static schemaActivation(type = "arma") {
		let schema = {
			// ativacao
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({
					required: true,
					initial: 0,
					label: "T20.ItemActivationCost",
					hint: "T20.ItemActivationCostHint"
				}),
				condicao: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemActivationCondition",
					hint: "T20.ItemActivationConditionHint"
				}),
				execucao: new fields.StringField({
					required: true,
					nullable: false,
					initial: "passive",
					label: "T20.ItemActivationAction",
					hint: "T20.ItemActivationActionHint"
				}),
				qtd: new fields.StringField({
					initial: "",
					label: "T20.ItemActivationActionQuantity",
					hint: "T20.ItemActivationActionQuantityHint"
				}),
				special: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemActivationSpecial",
					hint: "T20.ItemActivationSpecialHint"
				})
			}),
			// consume
			consume: new fields.SchemaField({
				amount: new fields.NumberField({
					initial: 0,
					label: "T20.ItemConsuptionQuantity",
					hint: "T20.ItemConsuptionQuantityHint"
				}),
				mpMultiplier: new fields.BooleanField({
					label: "T20.ItemConsuptionMultiplier",
					hint: "T20.ItemConsuptionMultiplierHint"
				}),
				target: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemConsuptionTarget",
					hint: "T20.ItemConsuptionTargetHint"
				}),
				type: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemConsuptionType",
					hint: "T20.ItemConsuptionTypeHint"
				})
			}),
			// duracao
			duracao: new fields.SchemaField({
				units: new fields.StringField({
					required: true,
					nullable: false,
					blank: false,
					initial: "inst",
					choices: T20.timePeriods,
					label: "T20.ItemDurationUnit",
					hint: "T20.ItemDurationUnitHint"
				}),
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.ItemDurationValue",
					hint: "T20.ItemDurationValueHint"
				}),
				special: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemDurationSpecial",
					hint: "T20.ItemDurationSpecialHint"
				})
			}),
			// range
			range: new fields.SchemaField({
				units: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemRangeUnits",
					hint: "T20.ItemRangeUnitsHint"
				}),
				value: new fields.NumberField({
					initial: 0,
					label: "T20.ItemRangeValue",
					hint: "T20.ItemRangeValueHint"
				})
			}),

			alcance: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemRangeDescription",
				hint: "T20.ItemRangeDescriptionHint"
			}),
			alvo: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemTargetDescription",
				hint: "T20.ItemTargetDescriptionHint"
			}),
			area: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemAreaOfEffectDescription",
				hint: "T20.ItemAreaOfEffectDescriptionHint"
			}),
			efeito: new fields.StringField({
				required: true,
				nullable: false,
				initial: "",
				label: "T20.ItemEffectDescription",
				hint: "T20.ItemEffectDescriptionHint"
			})
		};

		if (type === "arma") {
			delete schema.duracao;
			delete schema.range;
			delete schema.alvo;
			delete schema.area;
			delete schema.efeito;
			delete schema.ativacao.condicao;
			delete schema.ativacao.execucao;
			delete schema.ativacao.qtd;
			delete schema.ativacao.special;
		} else if (type === "equipamento") {
			delete schema.duracao;
			delete schema.range;
			delete schema.alvo;
			delete schema.area;
			delete schema.alcance;
			delete schema.efeito;
			delete schema.consume;
			delete schema.ativacao.condicao;
			delete schema.ativacao.execucao;
			delete schema.ativacao.qtd;
			delete schema.ativacao.special;
		} else if (type === "poder") {
			delete schema.consume;
			delete schema.alvo;
			delete schema.ativacao.condicao;
			delete schema.ativacao.execucao;
			delete schema.ativacao.qtd;
			delete schema.ativacao.special;
		}
		return schema;
	}

	static schemaRolls(type) {
		const schema = {};
		if (type === "arma") {
			schema.rolls = new fields.ArrayField(new fields.EmbeddedDataField(RollData), {
				initial: () => [
					{
						parts: [[], ["luta", ""], [""]], // [[vazio], [perícia, atributo], [bonus]]
						name: "Ataque",
						type: "ataque",
						key: "ataque"
					},
					{
						parts: [["1d6", "dano"], ["padrao"]], // [[dano, tipo], [atributo]]
						adaptavel: "",
						name: "Dano",
						type: "dano",
						key: "dano"
					}
				]
			});
		} else {
			schema.rolls = new fields.ArrayField(new fields.EmbeddedDataField(RollData));
		}
		return schema;
	}

	static schemaSavingThrow(type = "arma") {
		let schema = {
			resistencia: new fields.SchemaField({
				txt: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemSavingThrowDescription",
					hint: "T20.ItemSavingThrowDescriptionHint"
				}),
				pericia: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemSavingThrowSkill",
					hint: "T20.ItemSavingThrowSkillHint"
				}),
				atributo: new fields.StringField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.ItemSavingThrowDCAbility",
					hint: "T20.ItemSavingThrowDCAbilityHint"
				}),
				bonus: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.ItemSavingThrowDCBonus",
					hint: "T20.ItemSavingThrowDCBonusHint"
				})
			})
		};

		if (type === "arma") {
		}
		return schema;
	}

	static schemaUpgrades(type = "arma") {
		let schema = {
			upgrades: new fields.SchemaField({
				melhoria1: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemSuperiorUpgrades",
					hint: "T20.ItemSuperiorUpgradesHint"
				}),
				melhoria2: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemSuperiorUpgrades",
					hint: "T20.ItemSuperiorUpgradesHint"
				}),
				melhoria3: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemSuperiorUpgrades",
					hint: "T20.ItemSuperiorUpgradesHint"
				}),
				melhoria4: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemSuperiorUpgrades",
					hint: "T20.ItemSuperiorUpgradesHint"
				}),
				material: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemSpecialMaterial",
					hint: "T20.ItemSpecialMaterialHint"
				}),
				encanto1: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemEnchantmentUpgrade",
					hint: "T20.ItemEnchantmentUpgradeHint"
				}),
				encanto2: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemEnchantmentUpgrade",
					hint: "T20.ItemEnchantmentUpgradeHint"
				}),
				encanto3: new fields.StringField({
					required: true,
					blank: true,
					initial: "",
					label: "T20.ItemEnchantmentUpgrade",
					hint: "T20.ItemEnchantmentUpgradeHint"
				})
			}),
			// melhorias: new fields.ObjectField(),
			// encantos: new fields.ObjectField(),
			enableAutoUpgrades: new fields.BooleanField({
				required: false,
				nullable: false,
				initial: true,
				label: "T20.EnhancementsAutomationEnable",
				hint: "T20.EnhancementsAutomationEnableHint"
			})
		};

		if (type === "arma") {
		}
		return schema;
	}

	static schemaItemGrants(type = "classe") {
		let schema = {};

		if (type === "race") {
			schema.grants = new foundry.data.fields.ArrayField(
				new foundry.data.fields.SchemaField({
					title: new foundry.data.fields.StringField({ initial: "", required: true }),
					desc: new foundry.data.fields.StringField({ initial: "", required: true }),
					type: new foundry.data.fields.StringField({ initial: "multi", choices: ["single", "multi"] }),
					choices: new foundry.data.fields.ArrayField(
						new foundry.data.fields.SchemaField({
							uuid: new foundry.data.fields.DocumentUUIDField({ type: "Item", embedded: false })
						})
					)
				})
			);
			schema.skills = new foundry.data.fields.ArrayField(
				new foundry.data.fields.SchemaField({
					title: new foundry.data.fields.StringField({ initial: "", required: true }),
					desc: new foundry.data.fields.StringField({ initial: "", required: true }),
					type: new foundry.data.fields.StringField({ initial: "multi", choices: ["single", "multi"] }),
					choices: new fields.SetField(new fields.StringField({ required: true, blank: false }))
				})
			);
		}
		return schema;
	}

	static migrateData(source) {
		if (typeof source.description === "string") {
			source.description = { value: source.description, unidentified: "" };
		}
		return source;
	}

	prepareBaseData() {
		const item = this.parent;
		// TODO move to another file
		if (item.isOwned && item.parent === "character" && game.settings.get("tormenta20", "equipmentSlots")) {
			if (this.equipado && this.equipado2.slot === 0) {
				const equip2 = this.equipado2;
				if (this.equipado2.type === "hand" && this.equipado === 2) {
					this.equipado2.slot = 12.1;
				} else {
					let equips = this.actor.items.filter((it) => it.equipado && it.equipado2.type === equip2.type);
					let limite = equip2.type === "hand" ? "limiteEmpunhado" : "limiteVestido";
					equips = equips.map((it) => it.id);
					this.equipado2.slot =
						(equip2.type === "hand" ? 1.1 : 1.2) + Math.min(equips.indexOf(this.id), this.actor.equipamentos[limite]);
				}
			}
		} else if (!item.isOwned && ["arma", "equipamento"].includes(item.type)) {
			this.equipado = false;
		}
		if (this.resistencia) this.resistencia.cd = 0;
	}

	prepareDerivedData() {
		const item = this.parent;
		if (!["arma", "classe", "equipamento", "race"].includes(item.type)) {
			this.prepareDuration();
		}
	}

	prepareDuration() {
		if (["inst", "perm", "scene", "sust"].includes(this.duracao.units)) this.duracao.value = 0;
	}

	prepareFinalAttributes() {
		const item = this.parent;
		const actor = item.parent ?? {};
		if (item.isOwned) return;
		if ((this.resistencia?.atributo || actor.type === "npc") && this.resistencia?.txt) {
			const atr = foundry.utils.getProperty(actor.system, `atributos.${this.resistencia.atributo}.value`);
			const nvl = Math.floor(foundry.utils.getProperty(actor.system, "attributes.nivel.value") / 2);
			if (actor.type === "npc") this.resistencia.cd = actor.system.attributes.cd;
			else this.resistencia.cd = 10 + nvl + atr + this.resistencia.bonus;
		}
	}
}
