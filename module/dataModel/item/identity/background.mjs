import IdentityData from "./identity.mjs";


export default class BackgroundData extends IdentityData {
	
	/** @inheritDoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		const _fields = tormenta20.data.fields;
		return Object.assign(super.defineSchema(), {
			// progressao: new _fields.MappingField(),
		});
	}
	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*  Getters/Setters                             */
	/* -------------------------------------------- */


	
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
	async toEmbed(config, options={}) {
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