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
		if( !parts[0].match(/d20/) ) {
			let formula = `${nd}d20${mods}`;
			parts.unshift(formula);
		}

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
			return roll.evaluate({maximize:max,minimize:min,async:false});
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


/**
 * A standardized helper function for simplifying the constant parts of a multipart roll formula
 *
 * @param {string} formula                 The original Roll formula
 * @param {Object} data                    Actor or item data against which to parse the roll
 * @param {Object} options                 Formatting options
 * @param {boolean} options.constantFirst   Puts the constants before the dice terms in the resulting formula
 *
 * @return {string}                        The resulting simplified formula
 */
 export function simplifyRollFormula(formula, data, {constantFirst = false} = {}) {
	const roll = new Roll(formula, data); // Parses the formula and replaces any @properties
  const terms = roll.terms;
  // Some terms are "too complicated" for this algorithm to simplify
  // In this case, the original formula is returned.
  if (terms.some(_isUnsupportedTerm)) return roll.formula;

  const rollableTerms = []; // Terms that are non-constant, and their associated operators
  const constantTerms = []; // Terms that are constant, and their associated operators
  let operators = [];       // Temporary storage for operators before they are moved to one of the above

  for (let term of terms) {                                 // For each term
    if (term instanceof OperatorTerm) operators.push(term); // If the term is an addition/subtraction operator, push the term into the operators array
    else {                                                  // Otherwise the term is not an operator
      if (term instanceof DiceTerm) {                       // If the term is something rollable
        rollableTerms.push(...operators);                   // Place all the operators into the rollableTerms array
        rollableTerms.push(term);                           // Then place this rollable term into it as well
      }                                                     //
      else {                                                // Otherwise, this must be a constant
        constantTerms.push(...operators);                   // Place the operators into the constantTerms array
        constantTerms.push(term);                           // Then also add this constant term to that array.
      }                                                     //
      operators = [];                                       // Finally, the operators have now all been assigend to one of the arrays, so empty this before the next iteration.
    }
  }

  const constantFormula = Roll.getFormula(constantTerms);  // Cleans up the constant terms and produces a new formula string
  const rollableFormula = Roll.getFormula(rollableTerms);  // Cleans up the non-constant terms and produces a new formula string
	
  const constantPart = Roll.safeEval(constantFormula);     // Mathematically evaluate the constant formula to produce a single constant term
  const parts = constantFirst ? // Order the rollable and constant terms, either constant first or second depending on the optional argumen
    [constantPart, rollableFormula] : [rollableFormula, constantPart];

  // Join the parts with a + sign, pass them to `Roll` once again to clean up the formula
  return new Roll(parts.filterJoin(" + ")).formula;
}

/* -------------------------------------------- */

/**
 * Only some terms are supported by simplifyRollFormula, this method returns true when the term is not supported.
 * @param {*} term - A single Dice term to check support on
 * @return {Boolean} True when unsupported, false if supported
 */
 function _isUnsupportedTerm(term) {
	const diceTerm = term instanceof DiceTerm;
	const operator = term instanceof OperatorTerm && ["+", "-"].includes(term.operator);
	const number   = term instanceof NumericTerm;

	return !(diceTerm || operator || number);
}