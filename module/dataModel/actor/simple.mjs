import CreatureData from "./templates/creature.mjs";

import AttributesFields from "./templates/attributes.mjs";

export default class SimpleData extends CreatureData {
	static actorType = "simple";

	prepareDerivedData() {
		const rollData = this.parent.getRollData();
		this.prepareAtributos({ rollData });
		AttributesFields.prepareDefense.call(this, rollData);
		this.prepareSkills({ rollData });

		AttributesFields.prepareMovement.call(this);
		AttributesFields.prepareEncumbrance.call(this, rollData);
		AttributesFields.prepareDamageResistances.call(this, rollData);
	}
}
