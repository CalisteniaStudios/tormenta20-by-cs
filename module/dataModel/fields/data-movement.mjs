import Tormenta20DataModel from "./data-tormenta20.mjs";
import ActorMovementConfig from "../../apps/movement-config.mjs";

export default class MovementData extends Tormenta20DataModel {
	/** @inheritDoc */
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			burrow: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementBurrowValue",
				hint: "T20.MovementBurrowValueHint"
			}),
			climb: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementClimbValue",
				hint: "T20.MovementClimbValueHint"
			}),
			fly: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementFlyValue",
				hint: "T20.MovementFlyValueHint"
			}),
			swim: new fields.NumberField({
				initial: 0,
				min: 0,
				integer: true,
				label: "T20.MovementSwimValue",
				hint: "T20.MovementSwimValueHint"
			}),
			walk: new fields.NumberField({
				initial: 9,
				min: 0,
				integer: true,
				label: "T20.MovementWalkValue",
				hint: "T20.MovementWalkValueHint"
			}),
			hover: new fields.BooleanField({
				initial: false,
				label: "T20.MovementHoverStatus",
				hint: "T20.MovementHoverStatusHint"
			}),
			unit: new fields.StringField({
				initial: "m",
				label: "T20.MovementUnitType",
				hint: "T20.MovementUnitTypeHint"
			})
		};
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
