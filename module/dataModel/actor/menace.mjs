import CreatureData from "./templates/creature.mjs";

import { parseFraction } from "../../utils.mjs";
import AttributesFields from "./templates/attributes.mjs";

export default class MenaceData extends CreatureData {
	static actorType = "npc";

	/** @inheritdoc */
	static migrateData(data) {
		if (data.detalhes?.tipo && !Object.keys(T20.creatureTypes).includes(data.detalhes.tipo)) {
			let cType = Object.keys(T20.creatureTypes).find((c) => data.detalhes.tipo.match(c));
			data.detalhes.tipo = cType ?? "hum";
		}

		if (data.detalhes?.nd && data.detalhes.nd > data.attributes.nd) {
			data.attributes.nd = data.detalhes.nd;
		}

		if (data.attributes?.nivel && (isNaN(data.attributes?.nivel.value) || !isFinite(data.attributes?.nivel.value))) {
			data.attributes.nivel.value = 1;
		}
		return super.migrateData(data);
	}

	prepareBaseData() {
		const flags = this.parent.flags;
		let npcFlags = {};
		if (this.parent.getFlag("tormenta20", "showCD") === undefined) npcFlags.showCD = true;

		let nd = this.attributes.nd;
		// const crData = T20.NPCParams(nd);
		if (["S", "S+"].includes(nd)) this.attributes.nivel.value = 20;
		else this.attributes.nivel.value = Number(nd) || 1;
		const nivel = this.attributes.nivel.value;

		this.attributes.treino = nivel > 14 ? 6 : nivel > 6 ? 4 : 2;
		this.attributes.meionivel = Math.floor(this.attributes.nivel.value / 2);
		// Experience Reward
		this.attributes.defesa.condi = 0;
		this.attributes.nivel.xp.value = Math.floor(parseFraction(nd) * 1000);

		if (this.biography?.value) {
			this.detalhes.biography.value += this.biography.value;
		}

		let baseFlags = { tormenta20: npcFlags };
		if (!foundry.utils.isEmpty(npcFlags)) foundry.utils.mergeObject(flags, baseFlags);

		this.prepareBaseAtributos();
	}

	prepareDerivedData() {
		const rollData = this.parent.getRollData();
		this.prepareAtributos({ rollData });
		AttributesFields.prepareDefense.call(this, rollData);
		this.prepareSkills({ rollData });

		AttributesFields.prepareMovement.call(this);
		AttributesFields.prepareEncumbrance.call(this, rollData);
		AttributesFields.prepareDamageResistances.call(this, rollData);
		this.attributes.pv.min = Math.floor(this.attributes.pv.max / 2) * -1;
	}
}
