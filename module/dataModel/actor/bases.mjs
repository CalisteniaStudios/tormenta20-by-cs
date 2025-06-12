import Tormenta20TypeData from "../base.mjs";

const fields = foundry.data.fields;
export default class BasesData extends Tormenta20TypeData {
	/** @inheritDoc */
	static defineSchema() {
		const _fields = tormenta20.data.fields;
		return {
			tipo: new fields.StringField({
				required: false,
				initial: "",
				label: "T20.BasesType"
			}),
			porte: new fields.StringField({
				required: true,
				nullable: false,
				blank: false,
				initial: "min",
				label: "T20.BasesSize",
				choices: Object.keys(T20.porteType)
			}),
			seguranca: new fields.SchemaField({
				base: new fields.NumberField({
					required: false,
					initial: 0,
					label: "T20.BasesSecurity"
				}),
				bonus: new fields.NumberField({
					required: false,
					initial: 0,
					label: "T20.BasesSecurityBonus"
				}),
				total: new fields.NumberField({
					required: false,
					initial: 0,
					label: "T20.BasesSecurityTotal"
				})
			}),
			maintenance: new fields.StringField({
				required: false,
				label: "T20.BasesMaintenance"
			}),
			rooms: new fields.SchemaField({
				number: new fields.NumberField({
					required: false,
					initial: 0,
					label: "T20.BasesRoomsNumber"
				})
			}),
			mobilias: new fields.StringField({
				required: false,
				initial: "",
				label: "T20.BasesFurniture"
			}),
			detalhes: new fields.SchemaField({
				biography: new fields.SchemaField({
					value: new fields.HTMLField({
						required: true,
						nullable: false,
						initial: "",
						label: "T20.BasesDescription"
					})
				})
			}),
			attributes: new fields.SchemaField({
				nivel: new fields.SchemaField({
					value: new fields.NumberField({
						required: true,
						nullable: false,
						initial: 0,
						min: 0,
						max: 20,
						label: "T20.BasesLevel"
					})
				}),
				movement: new fields.EmbeddedDataField(_fields.MovementData, {
					initial: {
						walk: 0,
						climb: 0,
						burrow: 0,
						swim: 0,
						fly: 0,
						hover: false,
						unit: "m"
					}
				})
			})
		};
	}

	prepareDerivedData() {
		super.prepareDerivedData?.();

		// Calculate seguranca.total
		const base = this.seguranca?.base ?? 0;
		const bonus = this.seguranca?.bonus ?? 0;
		this.seguranca.total = base + bonus;
	}
}
