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
		return ActiveEffect.create({
			label: "Novo Efeito",
			icon: "icons/svg/aura.svg",
			origin: owner.uuid,
			flags: { t20: { onuse: li.dataset.effectType=="onuse" } },
			"duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
			"duration.seconds": undefined,
			disabled: ["inactive","onuse"].includes(li.dataset.effectType)
		}, owner).create();
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
		// console.log(e.data.flags.t20);
		if ( e.data.flags.onuse || e.data.flags.t20?.onuse ) categories.onuse.effects.push(e);
		else if ( e.data.disabled ) categories.inactive.effects.push(e);
		else if ( e.isTemporary ) categories.temporary.effects.push(e);
		else categories.passive.effects.push(e);
	}
	return categories;
}