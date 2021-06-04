/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @implements {FormApplication}
 */
export default class TraitSelector extends FormApplication {

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "trait-selector",
			classes: ["tormenta20"],
			title: "Actor Trait Selection",
			template: "systems/tormenta20/templates/apps/trait-selector.html",
			width: 320,
			height: "auto",
			choices: {},
			allowCustom: true,
			minimum: 0,
			maximum: null
		});
	}

	/* -------------------------------------------- */

	/**
	 * Return a reference to the target attribute
	 * @type {String}
	 */
	get attribute() {
		return this.options.name;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {

		// Get current values
		let attr = foundry.utils.getProperty(this.object.data, this.attribute);
		if ( getType(attr) !== "Object" ) attr = {value: [], custom: ""};
		// Populate choices
		let choices = "";
		if (this.options.choices != undefined) {
			choices = duplicate(this.options.choices);
			for ( let [k, v] of Object.entries(choices) ) {
				choices[k] = {
					label: v,
					chosen: attr ? attr.value.includes(k) : false
				}
			}
		}
		console.log(attr);

		console.log(choices);
		// Return data
		return {
			allowCustom: this.options.allowCustom,
			choices: choices,
			custom: attr ? attr.custom : ""
		}
	}

	/* -------------------------------------------- */

	/** @override */
	_updateObject(event, formData) {
		const updateData = {};
		// Obtain choices
		const chosen = [];
		for ( let [k, v] of Object.entries(formData) ) {
			if ( (k !== "custom") && v ) chosen.push(k);
		}
		updateData[`${this.attribute}.value`] = chosen;

		// Validate the number chosen
		if ( this.options.minimum && (chosen.length < this.options.minimum) ) {
			return ui.notifications.error(`Você precisa escolher no mínimo ${this.options.minimum} perícias`);
		}
		if ( this.options.maximum && (chosen.length > this.options.maximum) ) {
			return ui.notifications.error(`Você pode escolher no máximo ${this.options.maximum} perícias`);
		}

		// Include custom
		if ( this.options.allowCustom ) {
			updateData[`${this.attribute}.custom`] = formData.custom;
		}

		// Update the object
		this.object.update(updateData);
	}
}
