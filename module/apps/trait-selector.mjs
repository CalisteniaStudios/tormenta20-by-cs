const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @implements {FormApplication}
 */
export default class TraitSelector extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(actor, options) {
		super({ actor: actor.id, ...options });
		this.object = actor;
	}

	// eslint-disable-next-line no-unused-private-class-members
	#id;

	static DEFAULT_OPTIONS = {
		id: "{actor}-{trait}-trait-selector",
		classes: ["tormenta20", "trait-selector"],
		tag: "form",
		position: {
			height: "auto",
			width: 400
		},
		form: {
			closeOnSubmit: true,
			handler: TraitSelector.#onCommitChanges
		},
		window: {
			title: "T20.ActorTraitSelection",
			contentClasses: ["standard-form"]
		}
	};

	static PARTS = {
		body: {
			template: "systems/tormenta20/templates/apps/trait-selector.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs"
		}
	};

	/* -------------------------------------------- */

	/**
	 * Return a reference to the target attribute
	 * @type {String}
	 */
	get attribute() {
		return this.options.name;
	}

	/* -------------------------------------------- */

	_initializeApplicationOptions(options) {
		const applicationOptions = super._initializeApplicationOptions(options);
		applicationOptions.uniqueId = `${options.actor}-${options.id}`;
		return applicationOptions;
	}

	/** @override */
	async _prepareContext(opt) {
		// Get current values
		const { deepClone, getProperty } = foundry.utils;
		const attr = deepClone(getProperty(this.object, this.attribute));
		attr.value = new Set(attr.value);
		// Populate choices
		let choices = {};
		const columns = Object.values(this.options.choices).some((c) => !!Object.keys(c.choices ?? {}).length) ? 2 : 1;
		if (this.options.choices !== undefined) {
			choices = foundry.utils.duplicate(this.options.choices);
			for (let [k, v] of Object.entries(choices)) {
				choices[k] = {
					label: v.label ?? v,
					choices: v.choices ?? [],
					chosen: attr.value.has(k)
				};
				for (let [ck, cv] of Object.entries(choices[k].choices)) {
					choices[k].choices[ck] = {
						label: cv.label ?? cv,
						chosen: attr.value.has(ck),
						disabled: attr.value.has(k)
					};
				}
			}
		}
		// Return data
		return {
			allowCustom: this.options.allowCustom,
			choices,
			custom: attr ? attr.custom : "",
			columns
		};
	}

	/** @inheritDoc */
	async _preparePartContext(partId, context, options) {
		context = await super._preparePartContext(partId, context, options);
		context.fields = [];
		context.buttons = [{ type: "submit", icon: "fas fa-save", label: "Save Changes" }];
		return context;
	}

	/* -------------------------------------------- */

	_onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const target = event.target;
		const subgroup = target.closest("li").querySelector("ul");
		if (subgroup) {
			for (const child of subgroup.querySelectorAll("input")) {
				child.disabled = target.checked;
			}
		}
	}

	/* -------------------------------------------- */

	static async #onCommitChanges(event, form, fd) {
		const updateData = {};
		// Obtain choices
		const chosen = [];
		for (let [k, v] of Object.entries(fd.object)) {
			if (k !== "custom" && v) chosen.push(k);
		}
		updateData[`${this.attribute}.value`] = chosen.sort();

		// Validate the number chosen
		if (this.options.minimum && chosen.length < this.options.minimum) {
			return ui.notifications.error(`Você precisa escolher no mínimo ${this.options.minimum} perícias`);
		}
		if (this.options.maximum && chosen.length > this.options.maximum) {
			return ui.notifications.error(`Você pode escolher no máximo ${this.options.maximum} perícias`);
		}

		// Include custom
		if (this.options.allowCustom) {
			updateData[`${this.attribute}.custom`] = fd.object.custom;
		}

		// Update the object
		this.object.update(updateData);
	}
}
