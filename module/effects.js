/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event      The left-click event on the effect control
 * @param {Actor|Item} owner      The owning entity which manages this effect
 */
export function onManageActiveEffect(event, owner) {
	event.preventDefault();
	const a = event.currentTarget;
	const li = a.closest("li");
	const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
	switch ( a.dataset.action ) {
		case "create":
		return owner.createEmbeddedDocuments("ActiveEffect", [{
			label: li.dataset.effectType=="onuse" ? "Novo Efeito" : owner.name,
			icon: (li.dataset.effectType=="onuse" ? "icons/svg/upgrade.svg" :
											owner.documentName == "Item" ? owner.data.img : "icons/svg/aura.svg"),
			origin: owner.uuid,
			flags: { tormenta20: { onuse: li.dataset.effectType=="onuse" } },
			"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
			"duration.seconds": undefined,
			disabled: ["inactive","onuse"].includes(li.dataset.effectType)
		}]);
		case "edit":
		return effect.sheet.render(true);
		case "delete":
		return effect.delete();
		case "toggle":
		return effect.update({disabled: !effect.data.disabled});
	}
}

/**
 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
 * @return {object}                   Data for rendering
 */
export function prepareActiveEffectCategories(effects) {

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
		if(e.parent.documentName == "Actor" && e.data.origin && e.data.origin.split(".")[3]) {
			const actor = e.parent;
			const item = actor.items.get(e.data.origin.split(".")[3]);
			if(item && item.type == "equipament" && (e.data.disabled !== !item.data.data.equipado) ){
				e.update({disabled: !item.data.data.equipado});
			}
		}

		if ( e.data.flags.tormenta20?.onuse ) categories.onuse.effects.push(e);
		else if ( e.data.disabled ) categories.inactive.effects.push(e);
		else if ( e.isTemporary ) categories.temporary.effects.push(e);
		else categories.passive.effects.push(e);
	}
	return categories;
}