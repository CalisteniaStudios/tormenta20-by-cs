
/**
* Override the default Initiative formula to customize special behaviors of the system.
* Apply the dexterity score as a decimal tiebreaker if requested
* See Combat._getInitiativeFormula for more detail.
*/
export const _getInitiativeFormula = function(combatant) {
	const actor = combatant.actor;
	if ( !actor ) return "1d20";
	let init;

	let nd = 1;
	let mods = "";
	// new skills
	if(!actor.data.data.pericias){
		// TODO get highest Iniciative skill : problem mp cost
		// let initSkills = actor.items.filter(s => s.data.type === "skill" && s.data.data.toInitiative);
		let skill = actor.items.filter(s => s.data.type == "skill" && s.data.name == "Iniciativa");
		if(skill[0]){
			init = skill[0].data.data.total;
		}
		// no iniciative skill found
		else {
			init = actor.data.data.atributos.des.mod + actorData.data.attributes.nivel.value/2;
		}
	}
	// old skills
	else if(actor.data.data.pericias){
		init = actor.data.data.pericias.ini.value;
	}

	const parts = [`${nd}d20${mods}`, init];

	return parts.filter(p => p !== null).join(" + ");
};

/**
* When the Combat encounter updates - re-render open Actor sheets for combatants in the encounter.
*/
Hooks.on("updateCombat", (combat, data, options, userId) => {
	const updateTurn = ("turn" in data) || ("round" in data);
	if ( !updateTurn ) return;
	for ( let t of combat.turns ) {
		const a = t.actor;
		if ( t.actor ) t.actor.sheet.render(false);
	}
});
