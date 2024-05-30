
/**
* Override the default Initiative formula to customize special behaviors of the system.
* See Combat._getInitiativeFormula for more detail.
*/
export const _getInitiativeFormula = function(combatant) {
	const actor = combatant.actor;
	if ( !actor ) return "1d20";
	let init = actor.system.pericias.inic.value;
	
	let nd = 1;
	let mods = "";

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

/**
* When the Combat apply on turn effects
*/
Hooks.on("updateCombat", (combat, data, options, userId) => {
	const updateTurn = (combat.round > 0 && ("turn" in data) || ("round" in data));
	if ( !updateTurn ) return;
	const combatantId = combat.current.combatantId;
	let combatant = combat.combatants.get(combatantId);
	let curActor = combatant?.actor;
	if( !curActor || game.userId != userId ) return;
	// Check effects from each combatant
	for ( let c of combat.combatants ){
		let actor = c?.actor;
		// Effects Applied to CurrentCombatant Activated on Own Turn
		if ( curActor.id == actor.id ){
			let eff = actor.effects.filter(function(ae) {
				return (!ae.flags.tormenta20.onuse
								&& ae.changes.find(c=> ['sustentado','dano'].includes(c.key))
							);
			});
			let e;
			for( let ef of eff ){
				if( ef.changes.find(c=> c.key == 'sustentado' )  ){
					ChatMessage.create({content:'Sustentar Magia'});
				}
				if( e = ef.changes.find(c=> c.key == 'dano' )  ){
					new Roll(e.value,{},{flavor:`${ef.name}`}).toMessage();
				}
			}
		}
		// Effects Applied to Others Combatant Activated on CurrentCombatant Turn
		/** TODOS
		 * Overwrite Origin when create effect
		 * Regex to Match NonLinked Tokens
		 * Get Effect From Area Template
		 */
		else {
			let eff = actor.effects.filter(function(ae) {
				return (!ae.flags.tormenta20.onuse
							&& ae.origin?.match(curActor.id) 
							&& ae.changes.find(c=> c.key == '@dano' )
						);
			});
			let e;
			for( let ef of eff ){
				if( e = ef.changes.find(c=> c.key == '@dano' )  ){
					new Roll(e.value).toMessage();
				}
			}
		}
	}
});