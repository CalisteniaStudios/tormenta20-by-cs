
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
	init = actor.data.data.pericias.ini.value;

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
