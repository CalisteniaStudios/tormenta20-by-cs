import { Tormenta20ActorSheetSettings, Tormenta20OptionalRulesSettings } from "./apps/form-apps.mjs";
/* Classe para configurar opções do sistema*/
export const SystemSettings = function () {
	/**
	 * Track the system version upon which point a migration was last applied
	 */
	game.settings.register("tormenta20", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});

	game.settings.registerMenu("tormenta20", "sheetSettings", {
		name: "T20.SettingSheetSettings",
		label: "T20.SettingSheetSettings",
		icon: "fas fa-scroll",
		type: Tormenta20ActorSheetSettings,
		restricted: true
	});

	game.settings.registerMenu("tormenta20", "optionalRulesSettings", {
		name: "T20.SettingOptionalRulesSettings",
		label: "T20.SettingOptionalRulesSettings",
		icon: "fas fa-cog",
		type: Tormenta20OptionalRulesSettings,
		restricted: true
	});

	// game.settings.registerMenu('tormenta20', 'resourceSettings', {
	// 	name: "Configurar Recursos",
	// 	label: "Configurar Recursos",
	// 	icon: 'fas bars-progress',
	// 	type: Tormenta20ResourceColorsSettings,
	// 	restricted: true
	// });

	/**
	 * Option to define mechanics for Campaign Settings
	 */
	game.settings.register("tormenta20", "gameSystem", {
		name: "T20.SettingsCampaignSettingRule",
		hint: "T20.SettingsCampaignSettingHint",
		scope: "world",
		config: true,
		default: "Tormenta20",
		type: String,
		choices: {
			Tormenta20: "Tormenta20",
			Skyfall: "Skyfall RPG"
		},
		requiresReload: true
	});

	/**
	 * Option to define mechanics for Campaign Settings
	 */
	game.settings.register("tormenta20", "limitedSheet", {
		name: "T20.SettingsLimitedSheet",
		hint: "T20.SettingsLimitedSheetHint",
		scope: "world",
		config: true,
		default: "limited",
		type: String,
		choices: {
			default: "Padrão",
			limited: "Limitada"
		}
	});

	/**
	 * Option to disable XP bar for session-based or story-based advancement.
	 */
	game.settings.register("tormenta20", "disableExperience", {
		name: "T20.SettingDisableExperience",
		hint: "T20.SettingDisableExperienceHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
		requiresReload: true
	});

	/**
	 * Register languages rule (Homebrew)
	 */
	game.settings.register("tormenta20", "enableLanguages", {
		name: "T20.SettingEnableLanguages",
		hint: "T20.SettingEnableLanguagesHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/**
	 * Option to disable sheet journals (TODO REMOVE?)
	 */
	game.settings.register("tormenta20", "disableJournal", {
		name: "T20.SettingDisableJournal",
		hint: "T20.SettingDisableJournalHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/**
	 * Option to automatic spend mana on ability use
	 */
	game.settings.register("tormenta20", "automaticManaSpend", {
		name: "T20.SettingAutomaticManaSpend",
		hint: "T20.SettingAutomaticManaSpendHint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Option to automatic spend mana on ability use
	 */
	game.settings.register("tormenta20", "foeSheetCompactSpell", {
		name: "T20.SettingFoeSheetCompactSpell",
		hint: "T20.SettingFoeSheetCompactSpellHint",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	/**
	 * Option to automatically collapse Item Card descriptions
	 */
	game.settings.register("tormenta20", "autoCollapseItemCards", {
		name: "T20.SettingCollapseItemDescRule",
		hint: "T20.SettingCollapseItemDescHint",
		scope: "client",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true
	});

	/**
	 * Option to show apply buttons inside chat
	 */
	// game.settings.register("tormenta20", "applyButtonsInsideChat", {
	// 	name: game.i18n.localize("T20.SettingChatButtonsRule"),
	// 	hint: game.i18n.localize("T20.SettingChatButtonsHint"),
	// 	scope: "world",
	// 	config: true,
	// 	default: false,
	// 	type: Boolean,
	// 	requiresReload: true
	// });

	/**
	 * Option to show apply buttons inside chat
	 */
	game.settings.register("tormenta20", "showStatusCards", {
		name: "T20.SettingStatusCardRule",
		hint: "T20.SettingStatusCardHint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register("tormenta20", "showDamageCards", {
		name: "T20.SettingDamageCardRule",
		hint: "T20.SettingDamageCardRuleHint",
		scope: "world",
		config: true,
		default: "none",
		type: String,
		choices: {
			none: "T20.None",
			players: "T20.SettingDamageCardPlayers",
			npcs: "T20.SettingDamageCardNPCS",
		}
	});

	/**
	 * Option to item slots instead of boolean equipped status.
	 */
	game.settings.register("tormenta20", "equipmentSlots", {
		name: "T20.SettingEquipmentSlots",
		hint: "T20.SettingEquipmentSlotsHint",
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		requiresReload: true
	});

	/**
	 * Option to show Usage Effects Menu on Shift Use or Always
	 */
	game.settings.register("tormenta20", "UsageConfig", {
		name: "T20.SettingUsageConfig",
		hint: "T20.SettingUsageConfigHint",
		scope: "client",
		config: true,
		default: "default",
		type: String,
		choices: {
			default: "T20.SettingUsageConfigDefault",
			shift: "T20.SettingUsageConfigShift",
		}
	});

	game.settings.register("tormenta20", "invertUsageConfig", {
		name: "T20.SettingInvertUsageConfig",
		hint: "T20.SettingInvertUsageConfigHint",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Define how Lancinante effect is applyed
	 */
	game.settings.register("tormenta20", "lancinatingVersion", {
		name: "T20.SettingLancinatingVersion",
		hint: "T20.SettingLancinatingVersionHint",
		scope: "world",
		config: false,
		default: "default",
		type: String,
		choices: {
			default: "T20.SettingLancinatingDefault",
			revised: "T20.SettingLancinatingRevised",
		}
	});

	game.settings.register("tormenta20", "progressiveDefense", {
		name: "T20.SettingProgressiveDefense",
		hint: "T20.SettingProgressiveDefenseHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("tormenta20", "lightFinesseWeapons", {
		name: "T20.SettingLightFinesseWeapons",
		hint: "T20.SettingLightFinesseWeaponsHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	game.settings.register("tormenta20", "openRaces", {
		name: "T20.SettingOpenRaces",
		hint: "T20.SettingOpenRacesHint",
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	game.settings.register("tormenta20", "carryWeight", {
		name: "T20.SettingCarryWeight",
		hint: "T20.SettingCarryWeightHint",
		scope: "world",
		config: false,
		default: true,
		type: Boolean
	});

	game.settings.register("tormenta20", "currencyWeight", {
		name: "T20.SettingCurrencyWeight",
		hint: "T20.SettingCurrencyWeightHint",
		scope: "world",
		config: false,
		default: true,
		type: Boolean
	});


	game.settings.register("tormenta20", "overrideMeasuredTemplates", {
		name: "T20.SettingsOverrideMeasuredTemplates",
		hint: "T20.SettingsOverrideMeasuredTemplatesHint",
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		requiresReload: true,
	});



	game.settings.register("tormenta20", "drawRanges", {
		scope: "user",
		config: false,
		default: false,
		type: Boolean
	});
};
