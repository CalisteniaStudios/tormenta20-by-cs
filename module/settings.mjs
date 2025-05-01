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
		name: game.i18n.localize("T20.SettingSheetSettings"),
		label: game.i18n.localize("T20.SettingSheetSettings"),
		icon: "fas fa-scroll",
		type: Tormenta20ActorSheetSettings,
		restricted: true
	});

	game.settings.registerMenu("tormenta20", "optionalRulesSettings", {
		name: game.i18n.localize("T20.SettingOptionalRulesSettings"),
		label: game.i18n.localize("T20.SettingOptionalRulesSettings"),
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
		name: game.i18n.localize("T20.SettingsCampaignSettingRule"),
		hint: game.i18n.localize("T20.SettingsCampaignSettingHint"),
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
		name: game.i18n.localize("T20.SettingsLimitedSheet"),
		hint: game.i18n.localize("T20.SettingsLimitedSheetHint"),
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
		name: game.i18n.localize("T20.SettingDisableExperience"),
		hint: game.i18n.localize("T20.SettingDisableExperienceHint"),
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
		name: game.i18n.localize("T20.SettingEnableLanguages"),
		hint: game.i18n.localize("T20.SettingEnableLanguagesHint"),
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/**
	 * Option to disable sheet journals (TODO REMOVE?)
	 */
	game.settings.register("tormenta20", "disableJournal", {
		name: game.i18n.localize("T20.SettingDisableJournal"),
		hint: game.i18n.localize("T20.SettingDisableJournalHint"),
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});

	/**
	 * Option to automatic spend mana on ability use
	 */
	game.settings.register("tormenta20", "automaticManaSpend", {
		name: game.i18n.localize("T20.SettingAutomaticManaSpend"),
		hint: game.i18n.localize("T20.SettingAutomaticManaSpendHint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Option to automatic spend mana on ability use
	 */
	game.settings.register("tormenta20", "foeSheetCompactSpell", {
		name: game.i18n.localize("T20.SettingFoeSheetCompactSpell"),
		hint: game.i18n.localize("T20.SettingFoeSheetCompactSpellHint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	/**
	 * Option to automatically collapse Item Card descriptions
	 */
	game.settings.register("tormenta20", "autoCollapseItemCards", {
		name: game.i18n.localize("T20.SettingCollapseItemDescRule"),
		hint: game.i18n.localize("T20.SettingCollapseItemDescHint"),
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
		name: game.i18n.localize("T20.SettingStatusCardRule"),
		hint: game.i18n.localize("T20.SettingStatusCardHint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		requiresReload: true
	});

	game.settings.register("tormenta20", "showDamageCards", {
		name: game.i18n.localize("T20.SettingDamageCardRule"),
		hint: game.i18n.localize("T20.SettingDamageCardRuleHint"),
		scope: "world",
		config: true,
		default: "none",
		type: String,
		choices: {
			none: game.i18n.localize("T20.None"),
			players: game.i18n.localize("T20.SettingDamageCardPlayers"),
			npcs: game.i18n.localize("T20.SettingDamageCardNPCS")
		},
		requiresReload: true
	});

	/**
	 * Option to item slots instead of boolean equipped status.
	 */
	game.settings.register("tormenta20", "equipmentSlots", {
		name: game.i18n.localize("T20.SettingEquipmentSlots"),
		hint: game.i18n.localize("T20.SettingEquipmentSlotsHint"),
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
		name: game.i18n.localize("T20.SettingUsageConfig"),
		hint: game.i18n.localize("T20.SettingUsageConfigHint"),
		scope: "client",
		config: true,
		default: "default",
		type: String,
		choices: {
			default: game.i18n.localize("T20.SettingUsageConfigDefault"),
			shift: game.i18n.localize("T20.SettingUsageConfigShift")
		}
	});

	game.settings.register("tormenta20", "invertUsageConfig", {
		name: game.i18n.localize("T20.SettingInvertUsageConfig"),
		hint: game.i18n.localize("T20.SettingInvertUsageConfigHint"),
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Define how Lancinante effect is applyed
	 */
	game.settings.register("tormenta20", "lancinatingVersion", {
		name: game.i18n.localize("T20.SettingLancinatingVersion"),
		hint: game.i18n.localize("T20.SettingLancinatingVersionHint"),
		scope: "world",
		config: false,
		default: "default",
		type: String,
		choices: {
			default: game.i18n.localize("T20.SettingLancinatingDefault"),
			revised: game.i18n.localize("T20.SettingLancinatingRevised")
		}
	});

	game.settings.register("tormenta20", "progressiveDefense", {
		name: game.i18n.localize("T20.SettingProgressiveDefense"),
		hint: game.i18n.localize("T20.SettingProgressiveDefenseHint"),
		scope: "world",
		config: false,
		default: false,
		type: Boolean,
		requiresReload: true
	});
};
