import CreatureData from "./templates/creature.mjs";

export default class DangerData extends CreatureData {
	static actorType = "danger";

	/** @inheritdoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			attributes: new fields.SchemaField({
				goal: new fields.HTMLField({
					required: false,
					nullable: true,
					initial: "",
					label: "T20.DetailsGoal",
					hint: "T20.DetailsGoalHint"
				}),
				nd: new fields.StringField({
					required: true,
					nullable: false,
					initial: "1",
					label: "T20.FoeCRValue",
					hint: "T20.FoeCRValueHint"
				})
			}),

			detalhes: new fields.SchemaField({
				biography: new fields.SchemaField({
					value: new fields.HTMLField({
						required: true,
						nullable: false,
						initial: "",
						label: "T20.DetailsBiography",
						hint: "T20.DetailsBiographyHint"
					}),
					gm: new fields.HTMLField({
						required: true,
						nullable: false,
						initial: "",
						label: "T20.DetailsBiographyPublic",
						hint: "T20.DetailsBiographyPublicHint"
					})
				}),

				effects: new fields.HTMLField({
					required: false,
					nullable: true,
					initial: "",
					label: "T20.DetailsEffects",
					hint: "T20.DetailsEffectsHint"
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
