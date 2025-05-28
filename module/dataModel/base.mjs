export default class Tormenta20TypeData extends foundry.abstract.TypeDataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {};
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Getters/Setters                             */
	/* -------------------------------------------- */

	get getDataFields() {
		const doc = this.parent;
		const schema = doc.system.schema;
		const dataFields = foundry.utils.flattenObject(doc.system.toObject());

		dataFields.name = doc.schema.getField("name");
		dataFields.img = doc.schema.getField("img");

		for (const [fieldPath, value] of Object.entries(dataFields)) {
			dataFields[fieldPath] = schema.getField(fieldPath);
			if (dataFields[fieldPath]?.choices) {
				let choices = dataFields[fieldPath].choices;
				dataFields[fieldPath].valueLabel = choices[value]?.label ?? choices[value];
				// sheetCategory
			}
		}

		return foundry.utils.expandObject(dataFields);
	}

	get document() {
		let parent = this.parent;
		while (parent) {
			if (parent.documentName) break;
			parent = parent.parent;
		}
		return parent;
	}

	// Children must implement their actions;
	get contextMenu() {
		return [];
	}

	/* -------------------------------------------- */
	/*  System Operations                           */
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/* Data Preparation                             */
	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareBaseData() {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	prepareDerivedData() {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async toEmbed(config, options = {}) {
		return null;
	}

	/* -------------------------------------------- */
	/*  Database Operations                         */
	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preCreate(data, options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onCreate(data, options, userId) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preUpdate(changes, options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onUpdate(changed, options, userId) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	async _preDelete(options, user) {}

	/* -------------------------------------------- */

	/** @inheritDoc */
	_onDelete(options, userId) {}
}
