/*  */

export default class T20ActiveEffect extends  BaseActiveEffect {

	/* -------------------------------------------- */
	/*  Model Configuration                         */
	/* -------------------------------------------- */
	
	/** @inheritdoc */
	static defineSchema() {
		return mergeObject( super.defineSchema() , {
			duration: new fields.SchemaField({
				scene: new fields.BooleanField({initial: false, label: "EFFECT.Scene"}),
			}),
			onUse: new fields.BooleanField({initial: false, label: "EFFECT.OnUse"}),
			tags: new fields.StringField({required: true, initial:'', label: "EFFECT.ChangeKey"}),
			flags: new fields.ObjectField()
		} );
	}

	_flagT20() {
		return {
			onUse: false,
			onUse: false,
			
		}
	}

	/*  */
		
	/**
	 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
	 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
	 * @return {object}                   Data for rendering
	 */
	static prepareActiveEffectCategories(effects) {
		// Define effect header categories
		const categories = {
			onuse: {
				type: "onuse",
				label: "Efeitos de Uso",
				effects: []
			},
			temporary: {
				type: "temporary",
				label: "Efeitos Temporários",
				effects: []
			},
			passive: {
				type: "passive",
				label: "Efeitos Passivos",
				effects: []
			},
			inactive: {
				type: "inactive",
				label: "Efeitos Inativos",
				effects: []
			}
		};
		// Iterate over active effects, classifying them into categories
		for ( let e of effects ) {
			e._getSourceName(); // Trigger a lookup for the source name
			if(e.parent.documentName == "Actor" && e.origin && e.origin.split(".")[3]) {
				const actor = e.parent;
				const item = actor.items.get(e.origin.split(".")[3]);
				if(item && item.type == "equipamento" && (e.disabled !== !item.system.equipado) ){
					e.update({disabled: !item.system.equipado});
				}
			}

			if ( e.flags.tormenta20?.onuse ) categories.onuse.effects.push(e);
			else if ( e.disabled ) categories.inactive.effects.push(e);
			else if ( e.isTemporary ) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}
		return categories;
	}
}