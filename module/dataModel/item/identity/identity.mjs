import Tormenta20ItemData from "../item.mjs";

export default class IdentityData extends Tormenta20ItemData {
	/** @inheritDoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		const _fields = tormenta20.data.fields;
		return Object.assign(super.defineSchema({ unidentified: false }), {});
	}
}
