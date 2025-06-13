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
}
