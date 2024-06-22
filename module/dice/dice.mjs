export async function d20Roll({parts=[], data={}, event={}, advantage=null, disadvantage=null, critical=20, fumble=1, targetValue=null, options={}}={}) {

	parts = parts.concat(["@bonus"]);
	let adv = 0;
	if( options.rollKeep=="khd20" || event.altKey || parts[0].includes('kh')) adv = 1;
	else if ( options.rollKeep=="kld20" || event.ctrlKey || parts[0].includes('kl')) adv = -1;

	
	
	// Define the inner roll function
	const _roll = async (parts, adv, form) => {

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
		if( parts[0].match(/d20/) ) {
			let formula = `${nd}d20${mods}`;
			parts[0] = formula;
		}

		// Optionally include a situational bonus
		if ( form ) {
			data['bonus'] = form.bonus.value;
			messageOptions.rollMode = form.rollMode.value;
		}
		if (!data["bonus"]) parts.pop();

		// Execute the roll
		let roll = new Roll(parts.map(p=> p.toString().replace(/^\+|\s/g,"")).filterJoin("+"), data);

		try {
			await roll.roll({async:true});
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
		roll.options.type = 'attack';
		roll.options.title = options.title;
		return roll;
	}
	// Create the Roll instance
	const roll = await _roll(parts, adv);
	return roll;
}

export async function damageRoll({parts, actor, data={}, event={}, critical=false, lancinante=false, criticalMultiplier=2, minmax=false}={}) {
	parts = parts.concat(["@bonus"]);
	// Define inner roll function
	const _roll = async function(parts, crit, form) {
		// Optionally include a situational bonus
		if ( form ) {
			data['bonus'] = form.bonus.value;
			messageOptions.rollMode = form.rollMode.value;
		}
		if (!data["bonus"]) parts.pop();
		// Create the damage roll
		let roll;
		parts = parts.reduce(function(acc, o){
			let p = String(o[0]).split('+');
			acc = acc.concat( p.map( e => [e, o[1]]) );
			return  acc;
		}, []);
		parts = parts.map( function(e) { 
			if(e[0] && e[1]) return e[0]+`[${e[1]}]`;
			else return e[0];
		});
		roll = new Roll(parts.map(p=> p.toString().replace(/^\+|\s/g,"")).filterJoin("+"), data);
		roll.options.type = 'damage';
		
		// Modify the damage formula for critical hits
		if ( crit === true ) {
			if ( roll.terms[0] instanceof foundry.dice.terms.Die ) {
				roll.terms[0].alter(criticalMultiplier, 0);
				roll._formula = roll.formula;
			}
			if(lancinante){
				switch (game.settings.get("tormenta20","lancinatingVersion")) {
					case "revised":
						roll.terms.forEach(function(term, index){
							if( term instanceof foundry.dice.terms.NumericTerm && term.options.flavor == "danoCritico" ){
								roll.terms[index].number = term.number * criticalMultiplier;
								roll.terms[index].options.flavor = "";
							}
						});
						break;
					default:
						roll.terms.forEach(function(term, index){
							if( term instanceof foundry.dice.terms.NumericTerm ){
								roll.terms[index].number = term.number * criticalMultiplier;
							}
						});
						break;
				}
				roll._formula = roll.formula;
			}
		} else {
			let _fterms = [];
			roll.terms.forEach((term, i) => {
				if ( term.options.flavor == "danoCritico" ) {
					if ( _fterms[i-1] instanceof foundry.dice.terms.OperatorTerm ) {
						_fterms.pop();
					}
					
				} else {
					_fterms.push(term);
				}
			});
			roll.terms = _fterms;
			roll.resetFormula();
		}
		// minMax
		const min = minmax && minmax == "min" ? true : false;
		const max = minmax && minmax == "max" ? true : false;
		// Execute the roll
		try {
			let l = await roll.evaluate({ maximize:max, minimize:min });
			l._formula = l._formula.replaceAll(/(\[\w*\])/g, '');
			return l;
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
 export function simplifyRollFormula2(formula, data, {constantFirst = false} = {}) {
	const roll = new Roll(formula, data); // Parses the formula and replaces any @properties
	const terms = roll.terms;
	// Some terms are "too complicated" for this algorithm to simplify
	// In this case, the original formula is returned.
	if (terms.some(_isUnsupportedTerm)) return roll.formula;

	const rollableTerms = []; // Terms that are non-constant, and their associated operators
	const constantTerms = []; // Terms that are constant, and their associated operators
	let operators = [];       // Temporary storage for operators before they are moved to one of the above

	for (let term of terms) {                                 // For each term
		if (term instanceof foundry.dice.terms.OperatorTerm) operators.push(term); // If the term is an addition/subtraction operator, push the term into the operators array
		else {                                                  // Otherwise the term is not an operator
			if (term instanceof foundry.dice.terms.DiceTerm) {                       // If the term is something rollable
				rollableTerms.push(...operators);                   // Place all the operators into the rollableTerms array
				rollableTerms.push(term);                           // Then place this rollable term into it as well
			}                                                     //
			else if (term instanceof foundry.dice.terms.ParentheticalTerm){
				const numTerm = new foundry.dice.terms.NumericTerm({number: Roll.safeEval(term.term)});
				constantTerms.push(...operators);
				constantTerms.push(numTerm);
			}
			else {                                                // Otherwise, this must be a constant
				constantTerms.push(...operators);                   // Place the operators into the constantTerms array
				constantTerms.push(term);                           // Then also add this constant term to that array.
			}                                                     //
			operators = [];                                       // Finally, the operators have now all been assigend to one of the arrays, so empty this before the next iteration.
		}
	}

	const constantFormula = Roll.getFormula(constantTerms) || 0;  // Cleans up the constant terms and produces a new formula string
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
	const diceTerm = term instanceof foundry.dice.terms.DiceTerm;
	const operator = term instanceof foundry.dice.terms.OperatorTerm && ["+", "-", "*"].includes(term.operator);
	const number   = term instanceof foundry.dice.terms.NumericTerm;
	const parents  = term instanceof foundry.dice.terms.ParentheticalTerm && Roll.safeEval(term.term);

	return !(diceTerm || operator || number || parents );
 }


/**
 * A standardized helper function for simplifying the constant parts of a multipart roll formula.
 *	SOURCE dnd5e
 * @param {string} formula                          The original roll formula.
 * @param {object} [options]                        Formatting options.
 * @param {boolean} [options.preserveFlavor=false]  Preserve flavor text in the simplified formula.
 *
 * @returns {string}  The resulting simplified formula.
 */
 export function simplifyRollFormula(formula, data, { preserveFlavor=false } = {}) {
	// Create a new roll and verify that the formula is valid before attempting simplification.
	let roll;
	try { roll = new Roll(formula, data); }
	catch(err) { 
		console.log(formula, data);
		console.warn(`Unable to simplify formula '${formula}': ${err}`);
	}
	Roll.validate(roll.formula);

	// Optionally strip flavor annotations.
	if ( !preserveFlavor ) roll.terms = Roll.parse(roll.formula.replace(foundry.dice.terms.RollTerm.FLAVOR_REGEXP, ""));

	// Perform arithmetic simplification on the existing roll terms.
	roll.terms = _simplifyOperatorTerms(roll.terms);

	if ( /[*/]/.test(roll.formula) ) {
		return (( roll.isDeterministic ) && ( !/\[/.test(roll.formula) || !preserveFlavor )
			? ( game.release.generation < 12
				? roll.evaluate({async: false}).total.toString()
				: roll.evaluateSync().total.toString()
				)
			: roll.constructor.getFormula(roll.terms)
		);
	}

	// Flatten the roll formula and eliminate string terms.
	roll.terms = _expandParentheticalTerms(roll.terms);
	roll.terms = Roll.simplifyTerms(roll.terms);

	// Group terms by type and perform simplifications on various types of roll term.
	let { poolTerms, diceTerms, mathTerms, numericTerms } = _groupTermsByType(roll.terms);
	numericTerms = _simplifyNumericTerms(numericTerms ?? []);
	diceTerms = _simplifyDiceTerms(diceTerms ?? []);

	// Recombine the terms into a single term array and remove an initial + operator if present.
	const simplifiedTerms = [diceTerms, poolTerms, mathTerms, numericTerms].flat().filter(Boolean);
	if ( simplifiedTerms[0]?.operator === "+" ) simplifiedTerms.shift();
	return roll.constructor.getFormula(simplifiedTerms);
}


/* -------------------------------------------- */

/**
 * A helper function to perform arithmetic simplification and remove redundant operator terms.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {RollTerm[]}      A new array of roll terms with redundant operators removed.
 */
function _simplifyOperatorTerms(terms) {
	return terms.reduce((acc, term) => {
		const prior = acc[acc.length - 1];
		const ops = new Set([prior?.operator, term.operator]);

		// If one of the terms is not an operator, add the current term as is.
		if ( ops.has(undefined) ) acc.push(term);

		// Replace consecutive "+ -" operators with a "-" operator.
		else if ( (ops.has("+")) && (ops.has("-")) ) acc.splice(-1, 1, new foundry.dice.terms.OperatorTerm({ operator: "-" }));

		// Replace double "-" operators with a "+" operator.
		else if ( (ops.has("-")) && (ops.size === 1) ) acc.splice(-1, 1, new foundry.dice.terms.OperatorTerm({ operator: "+" }));

		// Don't include "+" operators that directly follow "+", "*", or "/". Otherwise, add the term as is.
		else if ( !ops.has("+") ) acc.push(term);

		return acc;
	}, []);
}

/* -------------------------------------------- */

/**
 * A helper function for combining unannotated numeric terms in an array into a single numeric term.
 * @param {object[]} terms  An array of roll terms.
 * @returns {object[]}      A new array of terms with unannotated numeric terms combined into one.
 */
function _simplifyNumericTerms(terms) {
  const simplified = [];
  const { annotated, unannotated } = _separateAnnotatedTerms(terms);

  // Combine the unannotated numerical bonuses into a single new NumericTerm.
  if ( unannotated.length ) {
    const staticBonus = Roll.safeEval(Roll.getFormula(unannotated));
    if ( staticBonus === 0 ) return [...annotated];

    // If the staticBonus is greater than 0, add a "+" operator so the formula remains valid.
    if ( staticBonus > 0 ) simplified.push(new foundry.dice.terms.OperatorTerm({ operator: "+"}));
    simplified.push(new foundry.dice.terms.NumericTerm({ number: staticBonus} ));
  }
  return [...simplified, ...annotated];
}

/* -------------------------------------------- */

/**
 * A helper function to group dice of the same size and sign into single dice terms.
 * @param {object[]} terms  An array of DiceTerms and associated OperatorTerms.
 * @returns {object[]}      A new array of simplified dice terms.
 */
function _simplifyDiceTerms(terms) {
  const { annotated, unannotated } = _separateAnnotatedTerms(terms);

  // Split the unannotated terms into different die sizes and signs
  const diceQuantities = unannotated.reduce((obj, curr, i) => {
    if ( curr instanceof foundry.dice.terms.OperatorTerm ) return obj;
    const key = `${unannotated[i - 1].operator}${curr.faces}`;
    obj[key] = (obj[key] ?? 0) + curr.number;
    return obj;
  }, {});

  // Add new die and operator terms to simplified for each die size and sign
  const simplified = Object.entries(diceQuantities).flatMap(([key, number]) => ([
    new foundry.dice.terms.OperatorTerm({ operator: key.charAt(0) }),
    new foundry.dice.terms.Die({ number, faces: parseInt(key.slice(1)) })
  ]));
  return [...simplified, ...annotated];
}

/* -------------------------------------------- */

/**
 * A helper function to extract the contents of parenthetical terms into their own terms.
 * @param {object[]} terms  An array of roll terms.
 * @returns {object[]}      A new array of terms with no parenthetical terms.
 */
function _expandParentheticalTerms(terms) {
  terms = terms.reduce((acc, term) => {
    if ( term instanceof foundry.dice.terms.ParentheticalTerm ) {
      if ( term.isDeterministic ) term = new foundry.dice.terms.NumericTerm({ number: Roll.safeEval(term.term) });
      else {
        const subterms = new Roll(term.term).terms;
        term = _expandParentheticalTerms(subterms);
      }
    }
    acc.push(term);
    return acc;
  }, []);
  return _simplifyOperatorTerms(terms.flat());
}

/* -------------------------------------------- */

/**
 * A helper function to group terms into PoolTerms, DiceTerms, MathTerms, and NumericTerms.
 * MathTerms are included as NumericTerms if they are deterministic.
 * @param {RollTerm[]} terms  An array of roll terms.
 * @returns {object}          An object mapping term types to arrays containing roll terms of that type.
 */
function _groupTermsByType(terms) {
  // Add an initial operator so that terms can be rearranged arbitrarily.
  if ( !(terms[0] instanceof foundry.dice.terms.OperatorTerm) ) terms.unshift(new foundry.dice.terms.OperatorTerm({ operator: "+" }));

  return terms.reduce((obj, term, i) => {
    let type;
    if ( term instanceof foundry.dice.terms.DiceTerm ) type = foundry.dice.terms.DiceTerm;
    else if ( (term instanceof foundry.dice.terms.FunctionTerm) && (term.isDeterministic) ) type = foundry.dice.terms.NumericTerm;
    else type = term.constructor;
    const key = `${type.name.charAt(0).toLowerCase()}${type.name.substring(1)}s`;

    // Push the term and the preceding OperatorTerm.
    (obj[key] = obj[key] ?? []).push(terms[i - 1], term);
    return obj;
  }, {});
}

/* -------------------------------------------- */

/**
 * A helper function to separate annotated terms from unannotated terms.
 * @param {object[]} terms     An array of DiceTerms and associated OperatorTerms.
 * @returns {Array | Array[]}  A pair of term arrays, one containing annotated terms.
 */
function _separateAnnotatedTerms(terms) {
  return terms.reduce((obj, curr, i) => {
    if ( curr instanceof foundry.dice.terms.OperatorTerm ) return obj;
    obj[curr.flavor ? "annotated" : "unannotated"].push(terms[i - 1], curr);
    return obj;
  }, { annotated: [], unannotated: [] });
}