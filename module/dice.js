import AbilityUseDialog from "./apps/ability-use-dialog.js";
import { T20Utility } from "./utility.js";

export async function d20Roll({parts=[], data={}, event={}, advantage=null, disadvantage=null, critical=20, fumble=1, targetValue=null}={}) {

	parts = parts.concat(["@bonus"]);

	let adv = 0;
	if( advantage || event.altKey ) adv = 1;
	else if ( disadvantage || event.ctrlKey ) adv = -1;
	
	
	// Define the inner roll function
	const _roll = (parts, adv, form) => {

		// Determine the d20 roll and modifiers
		let nd = 1;
		let mods = "";

		// Handle advantage
		if (adv === 1) {
			nd = 2;
			mods += "kh";
		}
		// Handle disadvantage
		else if (adv === -1) {
			nd = 2;
			mods += "kl";
		}

		// Prepend the d20 roll
		let formula = `${nd}d20${mods}`;
		parts.unshift(formula);

		// Optionally include a situational bonus
		if ( form ) {
			data['bonus'] = form.bonus.value;
			messageOptions.rollMode = form.rollMode.value;
		}
		if (!data["bonus"]) parts.pop();

		// Execute the roll
		let roll = new Roll(parts.join(" + "), data);
		try {
			roll.roll();
		} catch (err) {
			console.error(err);
			ui.notifications.error(`Avaliação de rolagem falhou: ${err.message}`);
			return null;
		}
		targetValue = 5;
		// Flag d20 options for any 20-sided dice in the roll
		for (let d of roll.dice) {
			if (d.faces === 20) {
				d.options.critical = critical;
				d.options.fumble = fumble;
				if (targetValue) d.options.target = targetValue;
			}
		}

		return roll;
	}
	// Create the Roll instance
	const roll = _roll(parts, adv);
	return roll;
}

export async function damageRoll({parts, actor, data, event={}, critical=false, lancinante=false, criticalMultiplier=2, minmax=false}={}) {

	parts = parts.concat(["@bonus"]);
	// Define inner roll function
	const _roll = function(parts, crit, form) {
		// Optionally include a situational bonus
		if ( form ) {
			data['bonus'] = form.bonus.value;
			messageOptions.rollMode = form.rollMode.value;
		}
		if (!data["bonus"]) parts.pop();

		// Create the damage roll
		let roll = new Roll(parts.join("+"), data);
		// Modify the damage formula for critical hits
		if ( crit === true ) {
			// roll.alter(criticalMultiplier, 0, { multiplyNumeric: lancinante });
			if ( roll.terms[0] instanceof Die ) {
				roll.terms[0].alter(criticalMultiplier, 0);
				roll._formula = roll.formula;
			}
			if(lancinante){
				roll.terms.forEach(function(item, index){
					if( parseInt(item) ){
						roll.terms[index] = item * criticalMultiplier;
					}
				});
				roll._formula = roll.formula;
			}
		}
		// minMax
		const min = minmax && minmax == "min" ? true : false;
		const max = minmax && minmax == "max" ? true : false;
		// Execute the roll
		try {
			return roll.evaluate({maximize:max,minimize:min});
		} catch(err) {
			console.error(err);
			ui.notifications.error(`Avaliação de rolagem falhou: ${err.message}`);
			return null;
		}
	};

	const roll = _roll(parts, critical);
	// Return roll
	return roll;
}
