const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const { BooleanField, NumberField, StringField } = foundry.data.fields;

/* TODO REFACTOR THIS */
export class Tormenta20BaseSettings extends HandlebarsApplicationMixin(ApplicationV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		tag: "form",
		classes: ["standard-form"],
		position: {
			width: 500
		},
		form: {
			closeOnSubmit: true,
			handler: Tormenta20BaseSettings.#onCommitChanges
		},
		window: {
			title: "Configurações"
		}
	};

	/** @override */
	static PARTS = {
		config: {
			template: "systems/tormenta20/templates/apps/base-config.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs"
		}
	};

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.CONFIG = CONFIG.T20;
		context.inputs = { ...foundry.applications.fields };
		return context;
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = await super._preparePartContext(partId, context, options);
		context.fields = [];
		context.buttons = [{ type: "submit", icon: "fas fa-save", label: "Save Changes" }];
		return context;
	}

	/* -------------------------------------------- */

	/**
	 * Create the field data for a specific setting.
	 * @param {string} name  Setting key within the tormenta20 namespace.
	 * @returns {object}
	 */
	createSettingField(name) {
		const setting = game.settings.settings.get(`tormenta20.${name}`);
		if (!setting) throw new Error(`Setting \`tormenta20.${name}\` not registered.`);
		const Field = {
			[Boolean]: BooleanField,
			[Number]: NumberField,
			[String]: StringField
		}[setting.type];
		if (!Field) throw new Error("Automatic field generation only available for Boolean, Number, or String types");
		const data = {
			field: new Field({
				label: game.i18n.localize(setting.name),
				hint: game.i18n.localize(setting.hint)
			}),
			name,
			value: game.settings.get("tormenta20", name)
		};
		if (setting.choices)
			data.options = Object.entries(setting.choices).map(([value, label]) => ({
				value,
				label: game.i18n.localize(label)
			}));
		return data;
	}

	static async #onCommitChanges(event, form, formData) {
		let requiresClientReload = false;
		let requiresWorldReload = false;
		for (const [key, value] of Object.entries(foundry.utils.expandObject(formData.object))) {
			const setting = game.settings.settings.get(`tormenta20.${key}`);
			const current = game.settings.get("tormenta20", key, { document: true });
			const prior = current?._source?.value ?? current;
			const updated = await game.settings.set("tormenta20", key, value, {
				document: true
			});
			if (prior === (updated?._source?.value ?? updated)) continue;
			requiresClientReload ||= setting.scope !== CONST.SETTING_SCOPES.WORLD && setting.requiresReload;
			requiresWorldReload ||= setting.scope === CONST.SETTING_SCOPES.WORLD && setting.requiresReload;
		}
		if (requiresClientReload || requiresWorldReload) {
			return SettingsConfig.reloadConfirm({ world: requiresWorldReload });
		}
	}
}

export class Tormenta20ActorSheetSettings extends Tormenta20BaseSettings {
	/** @override */
	static DEFAULT_OPTIONS = {
		window: {
			title: "T20.SettingSheetSettings"
		}
	};

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = await super._preparePartContext(partId, context, options);
		context.fields = [
			this.createSettingField("disableExperience"),
			this.createSettingField("enableLanguages"),
			this.createSettingField("disableJournal")
		];
		return context;
	}
}

export class Tormenta20OptionalRulesSettings extends Tormenta20BaseSettings {
	/** @override */
	static DEFAULT_OPTIONS = {
		window: {
			title: "T20.SettingOptionalRulesSettings"
		}
	};

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = await super._preparePartContext(partId, context, options);
		context.fields = [
			this.createSettingField("progressiveDefense"),
			this.createSettingField("lancinatingVersion"),
			this.createSettingField("openRaces")
		];
		return context;
	}
}
