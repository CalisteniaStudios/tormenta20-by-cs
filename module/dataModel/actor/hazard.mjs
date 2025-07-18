import Tormenta20TypeData from "../base.mjs";

export default class HazardData extends Tormenta20TypeData {
	static actorType = "hazard";

	/** @inheritdoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			attributes: new fields.SchemaField({
				nd: new fields.StringField({
					required: true,
					nullable: false,
					initial: "1",
					label: "T20.FoeCRValue",
					hint: "T20.FoeCRValueHint"
				})
			}),

			detalhes: new fields.SchemaField({
				actions: new fields.HTMLField({
					required: false,
					nullable: true,
					initial: ""
				}),

				effects: new fields.HTMLField({
					required: false,
					nullable: true,
					initial: "",
					label: "T20.DetailsEffects",
					hint: "T20.DetailsEffectsHint"
				}),

				goal: new fields.HTMLField({
					required: false,
					nullable: true,
					initial: "",
					label: "T20.DetailsGoal",
					hint: "T20.DetailsGoalHint"
				})
			})
		};
		const schema = super.defineSchema();

		schema.nd = new fields.StringField({
			required: true,
			nullable: true,
			initial: "1",
			label: "T20.FoeCRValue",
			hint: "T20.FoeCRValueHint"
		});

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
