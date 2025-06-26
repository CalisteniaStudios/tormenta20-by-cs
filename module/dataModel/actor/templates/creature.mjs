import { simplifyRollFormula } from "../../../dice/dice.mjs";
import Tormenta20TypeData from "../../base.mjs";

import { MappingField, PenaltyField, SkillData } from "../../helpers.mjs";

const fields = foundry.data.fields;

export default class CreatureData extends Tormenta20TypeData {
	static actorType;

	/** @inheritDoc */
	static defineSchema(type) {
		type ??= this.actorType;
		const fields = foundry.data.fields;
		const _fields = tormenta20.data.fields;
		return {
			...super.defineSchema(),
			atributos: this.schemaAbilities(type),
			attributes: this.schemaAttributes(type),
			detalhes: this.schemaDetails(type),
			dinheiro: this.schemaCurrency(type),
			modificadores: this.schemaModifiers(type),
			pericias: new MappingField(new fields.EmbeddedDataField(SkillData), {
				initialKeys: T20.pericias,
				initialValue: this._initialSkillValue.bind(this),
				initialKeysOnly: false
			}),
			resources: new fields.TypedObjectField(
				new fields.SchemaField({
					value: new fields.NumberField({
						required: true,
						nullable: false,
						initial: 0,
						step: 1,
						integer: true,
						label: "T20.ResourceValue",
						hint: "T20.ResourceValueHint"
					}),
					max: new fields.NumberField({
						required: true,
						nullable: false,
						initial: 0,
						integer: true,
						label: "T20.ResourceMaxValue",
						hint: "T20.ResourceMaxValueHint"
					}),
					label: new fields.StringField({
						required: true,
						nullable: false,
						initial: ""
					})
				}),
				{
					initial: {
						primary: {
							value: 0,
							max: 0,
							label: game.i18n.localize(T20.resources.primary)
						},
						secondary: {
							value: 0,
							max: 0,
							label: game.i18n.localize(T20.resources.secondary)
						},
						tertiary: {
							value: 0,
							max: 0,
							label: game.i18n.localize(T20.resources.tertiary)
						},
						deathsave: {
							value: 0,
							max: 3,
							label: game.i18n.localize(T20.resources.deathsave)
						},
						shadow: {
							value: 0,
							max: 5,
							label: game.i18n.localize(T20.resources.shadow)
						},
						catarse: {
							value: 0,
							max: 3,
							label: game.i18n.localize(T20.resources.catarse)
						}
					}
				}
			),
			tracos: this.schemaTraits()
		};
	}

	/** @inheritdoc */
	static migrateData(data) {
		if (data.pericias?.ofi0) delete data.pericias.ofi0;
		if (data.pericias?._pc0) delete data.pericias._pc0;
		if (data.pericias.acro?.st && data.pericias.reli?.pda && data.pericias.guer?.pda) {
			const initial = new SkillData();
			for (const [key, value] of Object.entries(data.pericias)) {
				data.pericias[key] = this._initialSkillValue(key, initial, value);
			}
		}
		if (!Object.keys(data.resources ?? {}).length) {
			data.resources = foundry.utils.deepClone(this.schema.fields.resources.initial);
		}
		return super.migrateData(data);
	}

	static _initialSkillValue(key, initial, existing) {
		const config = T20.pericias[key];
		if (!config) return existing ?? initial;
		const target = existing ?? initial;
		target.atributo = config.abl ?? initial.atributo;
		target.pda = config.armorPenalty ?? initial.st;
		target.st = config.trainedOnly ?? initial.pda;
		target.size = config.sizeMod ?? initial.size;
		return target;
	}

	/* ACTOR SCHEMAS */
	static schemaAbilities(type = "character") {
		let getSchema = () => {
			return new fields.SchemaField({
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					min: -5,
					label: "T20.AbilityValue",
					hint: "T20.AbilityValueHint"
				}),
				base: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.AbilityBaseValue",
					hint: "T20.AbilityBaseValueHint"
				}),
				racial: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.AbilityRacialValue",
					hint: "T20.AbilityRacialValueHint"
				}),
				bonus: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					label: "T20.AbilityBonusValue",
					hint: "T20.AbilityBonusValueHint"
				})
			});
		};

		let schema = {};
		Object.keys(T20.atributos).forEach((abl) => (schema[abl] = getSchema()));
		return new fields.SchemaField(schema);
	}

	static schemaDefense(type = "character") {
		let schema = {
			atributo: new fields.StringField({
				required: true,
				blank: false,
				choices: T20.atributos,
				initial: "des",
				label: "T20.DefenseAbilityBonus",
				hint: "T20.DefenseAbilityBonusHint"
			}),
			pda: new PenaltyField({
				required: true,
				nullable: false,
				initial: 0,
				label: "T20.DefenseArmorPenalty",
				hint: "T20.DefenseArmorPenaltyHint"
			}),
			value: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 10,
				label: "T20.DefenseValue",
				hint: "T20.DefenseValueHint"
			}),
			base: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 10,
				label: "T20.DefenseBaseValue",
				hint: "T20.DefenseBaseValueHint"
			}),
			outros: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "T20.DefenseOtherValue",
				hint: "T20.DefenseOtherValueHint"
			}),
			condi: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "T20.DefenseStatusEffectsValue",
				hint: "T20.DefenseStatusEffectsValueHint"
			}),
			bonus: new fields.ArrayField(new fields.StringField(), {
				label: "T20.DefenseEffectValues",
				hint: "T20.DefenseEffectValuesHint"
			})
		};
		if (type === "npc") {
		} else if (type === "simple") {
			delete schema.atributo;
			delete schema.pda;
			delete schema.base;
			delete schema.outros;
			delete schema.condi;
		}
		return new fields.SchemaField(schema);
	}

	static schemaEncumbrance(type = "character") {
		return new fields.SchemaField({
			value: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.EncumbranceValue",
				hint: "T20.EncumbranceValueHint"
			}),
			atributo: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				choices: T20.atributos,
				initial: "for"
			}),
			base: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 10,
				min: 0,
				label: "T20.EncumbranceBase",
				hint: "T20.EncumbranceBaseHint"
			}),
			bonus: new fields.ArrayField(new fields.StringField(), {
				label: "T20.EncumbranceEffectsValues",
				hint: "T20.EncumbranceEffectsValuesHint"
			}),
			limit: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.EncumbranceLimit",
				hint: "T20.EncumbranceLimitHint"
			}),
			max: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.EncumbranceMax",
				hint: "T20.EncumbranceMaxHint"
			}),
			pct: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.EncumbrancePercentage",
				hint: "T20.EncumbrancePercentageHint"
			}),
			encumbered: new fields.BooleanField({ label: "T20.EncumbranceStatus", hint: "T20.EncumbranceStatusHint" })
		});
	}

	static schemaLevel(type = "character") {
		let schema = {
			value: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				max: 20,
				label: "T20.LevelValue",
				hint: "T20.LevelValueHint"
			}),
			xp: new fields.SchemaField({
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					integer: true,
					label: "T20.ExperienceValue",
					hint: "T20.ExperienceValueHint"
				}),
				pct: new fields.NumberField({
					initial: 0,
					integer: true,
					max: 100,
					label: "T20.ExperiencePercentege",
					hint: "T20.ExperiencePercentegeHint"
				}),
				proximo: new fields.NumberField({
					initial: 0,
					integer: true,
					label: "T20.ExperienceToNextLevel",
					hint: "T20.ExperienceToNextLevelHint"
				})
			})
		};
		if (type === "npc" || type === "bases") {
			delete schema.pct;
			delete schema.proximo;
		} else if (type === "simple") {
		}
		return new fields.SchemaField(schema);
	}

	static schemaMovement(type = "character") {
		return new fields.SchemaField({
			burrow: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementBurrowValue",
				hint: "T20.MovementBurrowValueHint"
			}),
			climb: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementClimbValue",
				hint: "T20.MovementClimbValueHint"
			}),
			fly: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementFlyValue",
				hint: "T20.MovementFlyValueHint"
			}),
			swim: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementSwimValue",
				hint: "T20.MovementSwimValueHint"
			}),
			walk: new fields.NumberField({
				initial: 9,
				min: 0,
				integer: true,
				label: "T20.MovementWalkValue",
				hint: "T20.MovementWalkValueHint"
			}),
			hover: new fields.BooleanField({ label: "T20.MovementHoverStatus", hint: "T20.MovementHoverStatusHint" }),
			unit: new fields.StringField({
				initial: "m",
				label: "T20.MovementUnitType",
				hint: "T20.MovementUnitTypeHint"
			})
		});
	}

	static schemaSenses(type = "character") {
		return new fields.SchemaField({
			value: new fields.ArrayField(new fields.StringField(), {
				label: "T20.SensesList",
				hint: "T20.SensesListHint"
			}),
			custom: new fields.StringField({
				label: "T20.SensesCustom",
				hint: "T20.SensesCustomHint"
			})
		});
	}

	// label: "T20.Value", hint: "T20.Hint"
	static schemaResources(type = "character") {
		return new fields.SchemaField({
			value: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				step: 1,
				integer: true,
				label: "T20.ResourceValue",
				hint: "T20.ResourceValueHint"
			}),
			temp: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				step: 1,
				integer: true,
				label: "T20.ResourceTemporaryValue",
				hint: "T20.ResourceTemporaryHint"
			}),
			min: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				integer: true,
				label: "T20.ResourceMinValue",
				hint: "T20.ResourceMinValueHint"
			}),
			max: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				integer: true,
				label: "T20.ResourceMaxValue",
				hint: "T20.ResourceMaxValueHint"
			})
		});
	}

	static schemaAttributes(type = "character") {
		const _fields = tormenta20.data.fields;
		let schema = {
			carga: this.schemaEncumbrance(),
			cd: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 10,
				label: "T20.AttributeDCValue",
				hint: "T20.AttributeDCValueHint"
			}),
			conjuracao: new fields.StringField({
				blank: true,
				choices: T20.atributos,
				initial: "int",
				label: "T20.AttributeSpellcastingAbl",
				hint: "T20.AttributeSpellcastingAblHint"
			}),
			defesa: this.schemaDefense(),
			// movement: this.schemaMovement(),
			movement: new fields.EmbeddedDataField(_fields.MovementData),
			nivel: this.schemaLevel(type),
			pv: this.schemaResources(),
			pm: this.schemaResources(),
			sentidos: this.schemaSenses(),
			treino: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				label: "T20.AttributeTrainingValue",
				hint: "T20.AttributeTrainingValueHint"
			})
		};
		if (type === "character") {
			for (const key of ["pv", "pm"]) {
				schema[key].fields.atributos = new fields.SchemaField(
					Object.fromEntries(
						Object.keys(T20.atributos)
							.filter((atr) => key !== "pv" || atr !== "con")
							.map((abl) => [abl, new fields.BooleanField()])
					)
				);
				schema[key].fields.bonus = new fields.SchemaField({
					nivel: new fields.ArrayField(new fields.StringField(), {
						min: 1,
						initial: ["0"]
					}),
					nivelPar: new fields.ArrayField(new fields.StringField(), {
						min: 1,
						initial: ["0"]
					}),
					nivelImpar: new fields.ArrayField(new fields.StringField(), {
						min: 1,
						initial: ["0"]
					}),
					total: new fields.ArrayField(new fields.StringField(), {
						min: 1,
						initial: ["0"]
					})
				});
			}
		} else if (type === "npc") {
			schema.nd = new fields.StringField({
				required: true,
				initial: "1",
				label: "T20.FoeCRValue",
				hint: "T20.FoeCRValueHint"
			});
		} else if (type === "simple") {
			delete schema.cd;
			delete schema.conjuracao;
			delete schema.nivel;
			delete schema.treino;
		}

		return new fields.SchemaField(schema);
	}

	static schemaCurrency(type = "character") {
		return new fields.SchemaField({
			tc: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.CurrencyCopperValue",
				hint: "T20.CurrencyCopperValueHint"
			}),
			tl: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.CurrencyPlatinumValue",
				hint: "T20.CurrencyPlatinumValueHint"
			}),
			to: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.CurrencyGoldValue",
				hint: "T20.CurrencyGoldValueHint"
			}),
			tp: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.CurrencySilverValue",
				hint: "T20.CurrencySilverValueHint"
			})
		});
	}

	static schemaDetails(type = "character") {
		let schema = {
			origem: new fields.StringField({
				initial: "",
				label: "T20.DetailsBackground",
				hint: "T20.DetailsBackgroundHint"
			}),
			info: new fields.StringField({
				initial: "",
				label: "T20.DetailsNotes",
				hint: "T20.DetailsNotesHint"
			}),
			divindade: new fields.StringField({
				initial: "",
				label: "T20.DetailsDeity",
				hint: "T20.DetailsDeityHint"
			}),
			raca: new fields.StringField({
				initial: "",
				label: "T20.DetailsRace",
				hint: "T20.DetailsRaceHint"
			}),
			tipo: new fields.StringField({
				required: true,
				choices: T20.creatureTypes,
				initial: "hum",
				label: "T20.DetailsCreatureType",
				hint: "T20.DetailsCreatureTypeHint"
			}),
			biography: new fields.SchemaField({
				value: new fields.HTMLField({
					required: true,
					nullable: false,
					initial: "",
					label: "T20.DetailsBiography",
					hint: "T20.DetailsBiographyHint"
				}),
				public: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsBiographyPublic",
					hint: "T20.DetailsBiographyPublicHint"
				})
			}),
			diario: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			}),
			diario1: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			}),
			diario2: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			}),
			diario3: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			}),
			diario4: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			}),
			diario5: new fields.SchemaField({
				name: new fields.StringField({
					initial: "",
					label: "T20.DetailsJournalName",
					hint: "T20.DetailsJournalNameHint"
				}),
				value: new fields.HTMLField({
					initial: "",
					label: "T20.DetailsJournal",
					hint: "T20.DetailsJournalHint"
				})
			})
		};

		if (type === "npc") {
			schema.equipamento = new fields.StringField({
				initial: "",
				label: "T20.FoeEquipment",
				hint: "T20.FoeEquipmentHint"
			});
			schema.resistencias = new fields.StringField({
				initial: "",
				label: "T20.FoeResistances",
				hint: "T20.FoeResistancesHint"
			});
			schema.movimento = new fields.StringField({
				initial: "",
				label: "T20.FoeMovement",
				hint: "T20.FoeMovementHint"
			});
			schema.ataquescac = new fields.StringField({
				initial: "",
				label: "T20.FoeMelee",
				hint: "T20.FoeMeleeHint"
			});
			schema.ataquesad = new fields.StringField({
				initial: "",
				label: "T20.FoeRanged",
				hint: "T20.FoeRangedHint"
			});
			schema.tesouro = new fields.StringField({
				initial: "",
				label: "T20.FoeTreasure",
				hint: "T20.FoeTreasureHint"
			});
			schema.role = new fields.StringField({
				initial: "",
				label: "T20.FoeRole",
				hint: "T20.FoeRoleHint"
			});
			delete schema.info;
			delete schema.diario;
			delete schema.diario1;
			delete schema.diario2;
			delete schema.diario3;
			delete schema.diario4;
			delete schema.diario5;
		} else if (type === "simple") {
			delete schema.origem;
			delete schema.info;
			delete schema.divindade;
			delete schema.raca;
			delete schema.tipo;
			delete schema.diario;
			delete schema.diario1;
			delete schema.diario2;
			delete schema.diario3;
			delete schema.diario4;
			delete schema.diario5;
		}

		return new fields.SchemaField(schema);
	}

	static schemaModifiers(type = "character") {
		return new fields.SchemaField({
			custoPM: new fields.NumberField({
				required: true,
				nullable: false,
				initial: 0,
				min: 0,
				label: "T20.ModsMPExtraValue",
				hint: "T20.ModsMPExtraValueHint"
			}),
			atributos: new fields.SchemaField({
				for: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityStrEffectsValues",
					hint: "T20.ModsAbilityStrEffectsValuesHint"
				}),
				des: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityDexEffectsValues",
					hint: "T20.ModsAbilityDexEffectsValuesHint"
				}),
				con: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityConEffectsValues",
					hint: "T20.ModsAbilityConEffectsValuesHint"
				}),
				int: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityIntEffectsValues",
					hint: "T20.ModsAbilityIntEffectsValuesHint"
				}),
				sab: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityWisEffectsValues",
					hint: "T20.ModsAbilityWisEffectsValuesHint"
				}),
				car: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityChaEffectsValues",
					hint: "T20.ModsAbilityChaEffectsValuesHint"
				}),
				fisicos: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityPhysicalEffectsValues",
					hint: "T20.ModsAbilityPhysicalEffectsValuesHint"
				}),
				mentais: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityMentalEffectsValues",
					hint: "T20.ModsAbilityMentalEffectsValuesHint"
				}),
				geral: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsAbilityGeneralEffectsValues",
					hint: "T20.ModsAbilityGeneralEffectsValuesHint"
				})
			}),
			ataque: new fields.SchemaField({
				geral: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageRangedEffectsValues",
					hint: "T20.ModsDamageRangedEffectsValuesHint"
				}),
				cac: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageRangedEffectsValues",
					hint: "T20.ModsDamageRangedEffectsValuesHint"
				}),
				ad: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageRangedEffectsValues",
					hint: "T20.ModsDamageRangedEffectsValuesHint"
				})
			}),
			cura: new fields.SchemaField({
				geral: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageGeneralEffectsValues",
					hint: "T20.ModsDamageGeneralEffectsValuesHint"
				}),
				mag: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageSpellEffectsValues",
					hint: "T20.ModsDamageSpellEffectsValuesHint"
				})
			}),
			dano: new fields.SchemaField({
				ad: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageRangedEffectsValues",
					hint: "T20.ModsDamageRangedEffectsValuesHint"
				}),
				alq: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageAlchemyEffectsValues",
					hint: "T20.ModsDamageAlchemyEffectsValuesHint"
				}),
				cac: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageMeleeEffectsValues",
					hint: "T20.ModsDamageMeleeEffectsValuesHint"
				}),
				geral: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageGeneralEffectsValues",
					hint: "T20.ModsDamageGeneralEffectsValuesHint"
				}),
				mag: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsDamageSpellEffectsValues",
					hint: "T20.ModsDamageSpellEffectsValuesHint"
				})
			}),
			pericias: new fields.SchemaField({
				geral: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsSkillsGeneralEffectsValues",
					hint: "T20.ModsSkillsGeneralEffectsValuesHint"
				}),
				resistencia: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsSkillsSavesEffectsValues",
					hint: "T20.ModsSkillsSavesEffectsValuesHint"
				}),
				semataque: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsSkillsNotAttackEffectsValues",
					hint: "T20.ModsSkillsNotAttackEffectsValuesHint"
				}),
				ataque: new fields.ArrayField(new fields.StringField(), {
					label: "T20.ModsSkillsAttackEffectsValues",
					hint: "T20.ModsSkillsAttackEffectsValuesHint"
				}),
				atr: new fields.SchemaField({
					for: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsStrEffectsValues",
						hint: "T20.ModsSkillsStrEffectsValuesHint"
					}),
					des: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsDexEffectsValues",
						hint: "T20.ModsSkillsDexEffectsValuesHint"
					}),
					con: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsConEffectsValues",
						hint: "T20.ModsSkillsConEffectsValuesHint"
					}),
					int: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsIntEffectsValues",
						hint: "T20.ModsSkillsIntEffectsValuesHint"
					}),
					sab: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsWisEffectsValues",
						hint: "T20.ModsSkillsWisEffectsValuesHint"
					}),
					car: new fields.ArrayField(new fields.StringField(), {
						label: "T20.ModsSkillsChaEffectsValues",
						hint: "T20.ModsSkillsChaEffectsValuesHint"
					})
				})
			})
		});
	}

	static schemaResistances(type = "character") {
		let getSchema = () => {
			return new fields.SchemaField({
				value: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					min: 0,
					label: "T20.DamageReductionValue",
					hint: "T20.DamageReductionValueHint"
				}),
				base: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					min: 0,
					label: "T20.DamageReductionBaseValue",
					hint: "T20.DamageReductionBaseValueHint"
				}),
				bonus: new fields.ArrayField(new fields.StringField(), {
					label: "T20.DamageReductionEffectValues",
					hint: "T20.DamageReductionEffectValuesHint"
				}),
				excecao: new fields.NumberField({
					required: true,
					nullable: false,
					initial: 0,
					min: 0,
					label: "T20.DamageReductionException",
					hint: "T20.DamageReductionExceptionHint"
				}),
				imunidade: new fields.BooleanField({ label: "T20.DamageReductionImunity", hint: "T20.DamageReductionImunityHint" }),
				vulnerabilidade: new fields.BooleanField({ label: "T20.DamageReductionVulnerability", hint: "T20.DamageReductionVulnerabilityHint" }),
				danoPorDado: new fields.BooleanField()
			});
		};

		let schema = {};
		Object.keys(T20.damageTypes).forEach((dmg) => (schema[dmg] = getSchema()));
		return new fields.SchemaField(schema);
	}

	static schemaTraits(type = "character") {
		let schema = {
			ic: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {
					label: "T20.TraitsConditionsImunitiesList",
					hint: "T20.TraitsConditionsImunitiesListHint"
				}),
				custom: new fields.StringField({
					label: "T20.TraitsConditionsImunitiesCustom",
					hint: "T20.TraitsConditionsImunitiesCustomHint"
				})
			}),
			idiomas: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {
					label: "T20.TraitsLangaguesProficienciesList",
					hint: "T20.TraitsLangaguesProficienciesListHint"
				}),
				custom: new fields.StringField({
					label: "T20.TraitsLangaguesProficienciesCustom",
					hint: "T20.TraitsLangaguesProficienciesCustomHint"
				})
			}),
			profArmaduras: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {
					label: "T20.TraitsArmorProficienciesList",
					hint: "T20.TraitsArmorProficienciesListHint"
				}),
				custom: new fields.StringField({
					label: "T20.TraitsArmorProficienciesCustom",
					hint: "T20.TraitsArmorProficienciesCustomHint"
				})
			}),
			profArmas: new fields.SchemaField({
				value: new fields.ArrayField(new fields.StringField(), {
					label: "T20.TraitsWeaponProficienciesList",
					hint: "T20.TraitsWeaponProficienciesListHint"
				}),
				custom: new fields.StringField({
					label: "T20.TraitsWeaponProficienciesCustom",
					hint: "T20.TraitsWeaponProficienciesCustomHint"
				})
			}),
			resistencias: this.schemaResistances(),
			tamanho: new fields.StringField({
				required: true,
				nullable: false,
				choices: T20.actorSizes,
				initial: "med",
				label: "T20.TraitActorSize",
				hint: "T20.TraitActorSizeHint"
			})
		};
		if (type !== "character") {
			delete schema.idiomas;
			delete schema.profArmaduras;
			delete schema.profArmas;
		} else if (type === "npc") {
		} else if (type === "simple") {
		}

		return new fields.SchemaField(schema);
	}

	/** Calcula os atributos sem bônus, para cálculo de PV/PM */
	prepareBaseAtributos() {
		const flags = this.parent.flags.tormenta20 ?? {};
		Object.entries(this.atributos).forEach(([key, atr]) => {
			atr.value = atr.base + atr.racial;
		});
	}

	prepareAtributos({ rollData = {} } = {}) {
		const flags = this.parent.flags.tormenta20 ?? {};
		Object.entries(this.atributos).forEach(([key, atr]) => {
			atr.value += atr.bonus;
			rollData[key] = atr.value;
		});
	}

	prepareSkills({ rollData = {} } = {}) {
		for ( const [id, skillData] of Object.entries(this.pericias) ) {
			this.prepareSkill(id, { skillData, rollData });
		}
	}

	prepareSkill(skillId, { skillData, rollData, atributo }={}) {
		if (skillId === "ofic") return;

		const parts = ["@meionivel"];

		skillData ??= foundry.utils.deepClone(this.pericias[skillId]);
		rollData ??= this.parent.getRollData();
		atributo ??= skillData.atributo;
		skillData.atributo = atributo;

		skillData.label ||= CONFIG.T20.pericias[skillId]?.label || skillId;

		parts.push(`@${skillData.atributo}`);
		if (skillData.treinado) parts.push("@treino");
		if (skillData.bonus.length) parts.push(...skillData.bonus);
		if (skillData.pda && rollData.pda) parts.push("@pda");
		if (skillData.size && rollData.tamanho) parts.push("@tamanho");
		if (skillData.outros) parts.push(skillData.outros);
		if (skillData.condi) parts.push(skillData.condi);

		// GET GLOBAL ACTOR MODIFIERS
		const bonuses = foundry.utils.getProperty(this, "modificadores.pericias") || {};
		if (bonuses.geral.filter(Boolean).length) parts.push("@pericia");
		if (Object.keys(CONFIG.T20.resistencias).includes(skillId) && bonuses.resistencia.filter(Boolean).length) {
			parts.push("@resistencia");
		}
		else if (!["luta", "pont"].includes(skillId) && bonuses.semataque.filter(Boolean).length) parts.push("@semataque");
		else if (["luta", "pont"].includes(skillId) && bonuses.ataque.filter(Boolean).length) parts.push("@ataque");
		if (bonuses.atr && bonuses.atr[skillData.atributo]?.filter(Boolean).length) {
			parts.push(...bonuses.atr[skillData.atributo]);
		}

		const result = simplifyRollFormula(parts.join("+"), rollData, {
			constantFirst: true
		}).trim();
		skillData.value = parseInt(result) || 0;

		return skillData;
	}
}
