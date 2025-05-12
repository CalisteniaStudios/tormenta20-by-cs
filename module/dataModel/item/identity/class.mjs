import IdentityData from "./identity.mjs";

const fields = foundry.data.fields;

// , label:"T20.Value", hint:"T20.Hint"
export default class ClassData extends IdentityData {
	/** @override */
	static defineSchema() {
		let type = "classe";
		return {
			...super.defineSchema(),
			...this.schemaRolls(),
			niveis: new fields.NumberField({
				required: true,
				initial: 1,
				label: "T20.ItemClassLevels",
				hint: "T20.ItemClassLevelsHint"
			}),
			pvPorNivel: new fields.NumberField({
				required: true,
				initial: 1,
				label: "T20.ItemClassHPLevel",
				hint: "T20.ItemClassHPLevelHint"
			}),
			pmPorNivel: new fields.NumberField({
				required: true,
				initial: 1,
				label: "T20.ItemClassMPLevel",
				hint: "T20.ItemClassMPLevelHint"
			}),
			inicial: new fields.BooleanField({
				required: true,
				nullable: false,
				initial: false,
				label: "T20.ItemClassIsInitial",
				hint: "T20.ItemClassIsInitialHint"
			})
		};
	}
}
