import CreatureData from "./templates/creature.mjs";

export default class DangerData extends CreatureData {
	static actorType = "danger";

	/** @inheritdoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.goal = new fields.HTMLField({
			required: false,
			nullable: true,
			initial: "",
			label: "T20.DetailsGoal",
			hint: "T20.DetailsGoalHint"
		});

		schema.effects = new fields.HTMLField({
			required: false,
			nullable: true,
			initial: "",
			label: "T20.DetailsEffects",
			hint: "T20.DetailsEffectsHint"
		});

		schema.detalhes.fields.biography.fields.gm = new fields.HTMLField({
			required: false,
			nullable: true,
			initial: "",
			label: "T20.DetailsBiographyGM",
			hint: "T20.DetailsBiographyGMHint"
		});

		return schema;
	}
}
