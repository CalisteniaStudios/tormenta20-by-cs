import ActorMovementConfig from "../../apps/movement-config.mjs";
import Tormenta20DataModel from "./data-tormenta20.mjs";

export default class MovementData extends Tormenta20DataModel {
	/** @inheritDoc */
	static defineSchema() {
		const fields = foundry.data.fields;

		const schema = {};
		for (const move of Object.keys(T20.movementTypes)) {
			schema[move] = new fields.SchemaField(
				{
					base: new fields.NumberField({
						required: true,
						initial: move == "walk" ? 9 : 0,
						min: 0
					}),
					bonus: new fields.ArrayField(new fields.StringField(), {
						required: true,
						initial: []
					})
				},
				{
					label: `T20.Movement${move.titleCase()}`
				}
			);
		}
		schema.hover = new fields.BooleanField({
			label: "T20.MovementHoverStatus",
			hint: "T20.MovementHoverStatusHint"
		});
		schema.unit = new fields.StringField({
			initial: "m",
			label: "T20.MovementUnitType",
			hint: "T20.MovementUnitTypeHint"
		});
		schema.tags = new fields.SetField(new fields.StringField(), {
			label: "T20.Tag"
		});
		return schema;
	}

	/* -------------------------------------------- */
	/*  Getters/Setters                             */
	/* -------------------------------------------- */

	get sheet() {
		return new ActorMovementConfig(this.document).render(true);
	}

	/* -------------------------------------------- */
	/*  System Operations                           */
	/* -------------------------------------------- */
}
