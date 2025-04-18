import Tormenta20TypeData from "../base.mjs";

import {
	RollData
} from "../helpers.mjs";
const fields = foundry.data.fields;

export default class Tormenta20ItemData extends Tormenta20TypeData {
	/** @inheritDoc */
	static defineSchema() {

		return {
			description: new fields.SchemaField({
				value: new fields.HTMLField({ required: true, nullable: false, initial: "", label: "T20.ItemDescription", hint: "T20.ItemDescriptionHint" }),
				unidentified: new fields.HTMLField({ initial: "", label: "T20.ItemUnidentifiedDescription", hint: "T20.ItemUnidentifiedDescriptionHint" })
			}),
			source: new fields.StringField({ initial: "", label: "T20.ItemSourceReference", hint: "T20.ItemSourceReferenceHint" }),
			origin: new fields.StringField({ initial: "", label: "T20.ItemOrigin", hint: "T20.ItemOriginHint" }),
			tags: new fields.ArrayField(new fields.StringField(), { label: "T20.ItemTagsList", hint: "T20.ItemTagsListHint" }),
			rolltags: new fields.ArrayField(new fields.StringField(), { label: "T20.ItemTagsList", hint: "T20.ItemTagsListHint" }),
			chatFlavor: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemChatFlavor", hint: "T20.ItemChatFlavorHint" }),
			chatGif: new fields.StringField({ initial: "", label: "T20.ItemChatGif", hint: "T20.ItemChatGifHint" })
		};
	}

	/* ITEM SCHEMAS */
	static schemaPhysicalItem(type="arma") {
		let schema = {
			carregado: new fields.BooleanField({ required: true, nullable: false, initial: true, label: "T20.ItemCarrying", hint: "T20.ItemCarryingHint" }),
			espacos: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "T20.ItemSlot", hint: "T20.ItemSlotsHint" }),
			peso: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "T20.ItemWeight", hint: "T20.ItemWeightHint" }),
			qtd: new fields.NumberField({ required: true, nullable: false, initial: 1, min: 0, label: "T20.ItemQuantity", hint: "T20.ItemQuantityHint" }),
			preco: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "T20.ItemPrice", hint: "T20.ItemPriceHint" }),
			pv: new fields.SchemaField({
				value: new fields.NumberField({ required: true, nullable: false, initial: 3, step: 1, integer: true, label: "T20.ItemHitPoints", hint: "T20.ItemHitPointsHint" }),
				min: new fields.NumberField({ required: true, nullable: false, initial: 0, integer: true, label: "T20.ItemHitPointsMin", hint: "T20.ItemHitPointsMinHint" }),
				max: new fields.NumberField({ required: true, nullable: false, initial: 3, integer: true, label: "T20.ItemHitPointsMax", hint: "T20.ItemHitPointsMaxHint" })
			}),
			rd: new fields.NumberField({ required: true, nullable: false, initial: 0, min: 0, label: "T20.ItemDamageReduction", hint: "T20.ItemDamageReductionHint" })
		};

		if (type === "arma") {
		}
		return schema;
	}

	static schemaActivation(type="arma") {
		let schema = {
			// ativacao
			ativacao: new fields.SchemaField({
				custo: new fields.NumberField({ required: true, initial: 0, label: "T20.ItemActivationCost", hint: "T20.ItemActivationCostHint" }),
				condicao: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemActivationCondition", hint: "T20.ItemActivationConditionHint" }),
				execucao: new fields.StringField({ required: true, nullable: false, initial: "passive", label: "T20.ItemActivationAction", hint: "T20.ItemActivationActionHint" }),
				qtd: new fields.StringField({ initial: "", label: "T20.ItemActivationActionQuantity", hint: "T20.ItemActivationActionQuantityHint" }),
				special: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemActivationSpecial", hint: "T20.ItemActivationSpecialHint" })
			}),
			// consume
			consume: new fields.SchemaField({
				amount: new fields.NumberField({ initial: 0, label: "T20.ItemConsuptionQuantity", hint: "T20.ItemConsuptionQuantityHint" }),
				mpMultiplier: new fields.BooleanField({ required: true, initial: false, label: "T20.ItemConsuptionMultiplier", hint: "T20.ItemConsuptionMultiplierHint" }),
				target: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemConsuptionTarget", hint: "T20.ItemConsuptionTargetHint" }),
				type: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemConsuptionType", hint: "T20.ItemConsuptionTypeHint" })
			}),
			// duracao
			duracao: new fields.SchemaField({
				units: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemDurationUnit", hint: "T20.ItemDurationUnitHint" }),
				value: new fields.NumberField({ required: true, nullable: false, initial: 0, label: "T20.ItemDurationValue", hint: "T20.ItemDurationValueHint" }),
				special: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemDurationSpecial", hint: "T20.ItemDurationSpecialHint" })
			}),
			// range
			range: new fields.SchemaField({
				units: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemRangeUnits", hint: "T20.ItemRangeUnitsHint" }),
				value: new fields.NumberField({ initial: 0, label: "T20.ItemRangeValue", hint: "T20.ItemRangeValueHint" })
			}),
			// target
			target: new fields.SchemaField({
				type: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemTargetType", hint: "T20.ItemTargetTypeHint" }),
				value: new fields.NumberField({ initial: 0, label: "T20.ItemTargeValue", hint: "T20.ItemTargeValueHint" }),
				width: new fields.NumberField({ initial: 0, label: "T20.ItemTargeWidth", hint: "T20.ItemTargeWidthHint" })
			}),

			alcance: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemRangeDescription", hint: "T20.ItemRangeDescriptionHint" }),
			alvo: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemTargetDescription", hint: "T20.ItemTargetDescriptionHint" }),
			area: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemAreaOfEffectDescription", hint: "T20.ItemAreaOfEffectDescriptionHint" }),
			efeito: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemEffectDescription", hint: "T20.ItemEffectDescriptionHint" })
		};

		if (type === "arma") {
			delete schema.duracao;
			delete schema.range;
			delete schema.target;
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
			delete schema.target;
			delete schema.alvo;
			delete schema.area;
			delete schema.alcance;
			delete schema.efeito;
			delete schema.consume;
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
						parts: [["1d6", "dano"], [""]], // [[dano, tipo], [atributo]]
						versatil: "",
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

	static schemaSavingThrow(type="arma") {
		let schema = {
			resistencia: new fields.SchemaField({
				txt: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemSavingThrowDescription", hint: "T20.ItemSavingThrowDescriptionHint" }),
				pericia: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemSavingThrowSkill", hint: "T20.ItemSavingThrowSkillHint" }),
				atributo: new fields.StringField({ required: true, nullable: false, initial: "", label: "T20.ItemSavingThrowDCAbility", hint: "T20.ItemSavingThrowDCAbilityHint" }),
				bonus: new fields.NumberField({ required: true, initial: 0, label: "T20.ItemSavingThrowDCBonus", hint: "T20.ItemSavingThrowDCBonusHint" })
			})
		};

		if (type === "arma") {
		}
		return schema;
	}

	static schemaUpgrades(type="arma") {
		let schema = {
			upgrades: new fields.SchemaField({
				melhoria1: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemSuperiorUpgrades", hint: "T20.ItemSuperiorUpgradesHint" }),
				melhoria2: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemSuperiorUpgrades", hint: "T20.ItemSuperiorUpgradesHint" }),
				melhoria3: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemSuperiorUpgrades", hint: "T20.ItemSuperiorUpgradesHint" }),
				melhoria4: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemSuperiorUpgrades", hint: "T20.ItemSuperiorUpgradesHint" }),
				material: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemSpecialMaterial", hint: "T20.ItemSpecialMaterialHint" }),
				encanto1: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemEnchantmentUpgrade", hint: "T20.ItemEnchantmentUpgradeHint" }),
				encanto2: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemEnchantmentUpgrade", hint: "T20.ItemEnchantmentUpgradeHint" }),
				encanto3: new fields.StringField({ required: true, blank: true, initial: "", label: "T20.ItemEnchantmentUpgrade", hint: "T20.ItemEnchantmentUpgradeHint" })
			}),
			melhorias: new fields.ObjectField(),
			encantos: new fields.ObjectField(),
			enableAutoUpgrades: new fields.BooleanField({ required: false, nullable: false, initial: false, label: "T20.EnhancementsAutomationEnable", hint: "T20.EnhancementsAutomationEnableHint" })
		};

		if (type === "arma") {
		}
		return schema;
	}
}
