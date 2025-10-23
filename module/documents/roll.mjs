// import { T20 } from "../config.mjs";

import { simplifyRollFormula } from "../dice/dice.mjs";

const { DiceTerm, Die, OperatorTerm, NumericTerm } = foundry.dice.terms;

export default class RollT20 extends foundry.dice.Roll {
	get formulaSimplified() {
		return simplifyRollFormula(this.formula);
	}

	/**
	 * Prepare context data used to render the CHAT_TEMPLATE for this roll.
	 * @param {object} options
	 * @param {string} [options.flavor]
	 * @param {boolean} [options.isPrivate=false]
	 * @returns {Promise<{object}>}
	 * @protected
	 */
	async _prepareChatRenderContext({ flavor, isPrivate = false, ...options } = {}) {
		return {
			formula: isPrivate ? "???" : this.formulaSimplified,
			_formula: isPrivate ? "???" : this.formula,
			flavor: isPrivate ? null : (flavor ?? this.options.flavor),
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100
		};
	}
}

// export default class RollT20 extends Roll {
// 	static SORTMODIFIERS = {
// 		addTerm: 0,
// 		upgradeDie: 1,
// 		modifyDieNumber: 2,
// 		modifyDieFace: 3,
// 		addPerDie: 4,
// 		dieModifier: 5
// 	};

// 	constructor(formula, data = {}, options = {}) {
// 		super(formula, data, options);
// 		if (!options.type) options.type = "formula";
// 		if (!options.modifiers) options.modifiers = [];
// 		if (options.type === "formula") this.configureFormulaModifiers();
// 		else if (options.type === "attack") this.configureAttackModifiers();
// 		else if (options.type === "damage") this.configureDamageModifiers();
// 		// console.log(this);
// 	}

// 	static fromRoll(roll) {
// 		const newRoll = new this(roll.formula, roll.data, roll.options);
// 		Object.assign(newRoll, roll);
// 		return newRoll;
// 	}

// 	/* -------------------------------------------- */
// 	/*  Roll Methods                                */
// 	/* -------------------------------------------- */

// 	/**
// 	 * Apply optional modifiers which customize the behavior of the d20term
// 	 * @private
// 	 */
// 	configureFormulaModifiers() { }

// 	/**
// 	 * Apply optional modifiers which customize the behavior of the d20term
// 	 * @private
// 	 */
// 	configureAttackModifiers() { }

// 	/**
// 	 * Apply optional modifiers which customize the behavior of the d20term
// 	 * @private
// 	 */
// 	configureDamageModifiers() {
// 		const modifiers = this.options.modifiers.sort(
// 			(a, b) => RollT20.SORTMODIFIERS[a.type] - RollT20.SORTMODIFIERS[b.type]
// 		);
// 		for (const mod of modifiers) {
// 			mod.value = mod.value.toString();
// 			switch (mod.type) {
// 				case "addTerm":
// 					this.modAddTerm(mod);
// 					break;
// 				case "addPerDie":
// 					this.modAddPerDie(mod);
// 					break;
// 				case "modifyDieNumber":
// 					this.modModifyDieNumber(mod);
// 					break;
// 				case "modifyDieFace":
// 					this.modModifyDieFace(mod);
// 					break;
// 				case "upgradeDie":
// 					this.modUpgradeDie(mod);
// 					break;
// 				case "dieModifier":
// 					this.modDieModifier(mod);
// 					break;
// 				default:
// 					console.log("DEFAULT");
// 					break;
// 			}
// 		}
// 	}

// 	/**
// 	 * ADD TERM
// 	 * @param {object} mod         DATA
// 	 */
// 	modAddTerm(mod) {
// 		mod.value = Roll.replaceFormulaData(mod.value, this.data);
// 		let newTerm;
// 		const options = { flavor: mod.flavor, origin: mod.origin };
// 		if (isFinite(Roll.safeEval(mod.value))) {
// 			newTerm = new NumericTerm({ number: Roll.safeEval(mod.value), options });
// 		} else {
// 			newTerm = new DiceTerm({ number: mod.value, options });
// 		}
// 		this.terms.push(new OperatorTerm({ operator: "+" }), newTerm);
// 	}

// 	modAddPerDie(mod) {
// 		mod.value = Roll.replaceFormulaData(mod.value, this.data);
// 		mod.value = Roll.safeEval(mod.value);
// 		if (!isFinite(mod.value)) return;
// 		const dies = this.terms
// 			.filter((term) => {
// 				const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(",") : false;
// 				const origin = mod.conditions.origin ? mod.conditions.origin.split(",") : false;
// 				if (!(term instanceof DiceTerm)) return false;
// 				if (flavor && !flavor.includes(term.options.flavor)) return false;
// 				if (origin && !origin.includes(term.options.origin)) return false;
// 				return true;
// 			})
// 			.map((term) => term.number);
// 		const total = Roll.safeEval(...dies) * mod.value;
// 		if (!total) return;
// 		this.terms.push(
// 			new OperatorTerm({ operator: "+" }),
// 			new NumericTerm({
// 				number: total,
// 				options: { flavor: mod.flavor, origin: mod.origin }
// 			})
// 		);
// 	}

// 	modModifyDieNumber(mod) {
// 		mod.value = Roll.replaceFormulaData(mod.value, this.data);
// 		mod.value = Roll.safeEval(mod.value);
// 		if (!isFinite(mod.value)) return;
// 		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(",") : false;
// 		const origin = mod.conditions.origin ? mod.conditions.origin.split(",") : false;
// 		for (const term of this.terms) {
// 			if (!(term instanceof DiceTerm)) continue;
// 			if (flavor && !flavor.includes(term.options.flavor)) continue;
// 			if (origin && !origin.includes(term.options.origin)) continue;
// 			term.number = term.number + mod.value;
// 		}
// 	}

// 	modModifyDieFace(mod) {
// 		mod.value = Roll.replaceFormulaData(mod.value, this.data);
// 		mod.value = Roll.safeEval(mod.value);
// 		if (!isFinite(mod.value)) return;
// 		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(",") : false;
// 		const origin = mod.conditions.origin ? mod.conditions.origin.split(",") : false;
// 		for (const term of this.terms) {
// 			if (!(term instanceof DiceTerm)) continue;
// 			if (flavor && !flavor.includes(term.options.flavor)) continue;
// 			if (origin && !origin.includes(term.options.origin)) continue;
// 			term.faces = mod.value;
// 		}
// 	}

// 	modUpgradeDie(mod) {
// 		mod.value = Roll.replaceFormulaData(mod.value, this.data);
// 		mod.value = Roll.safeEval(mod.value);
// 		if (!isFinite(mod.value)) return;
// 		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(",") : false;
// 		const origin = mod.conditions.origin ? mod.conditions.origin.split(",") : false;
// 		for (const term of this.terms) {
// 			if (!(term instanceof DiceTerm)) continue;
// 			if (flavor && !flavor.includes(term.options.flavor)) continue;
// 			if (origin && !origin.includes(term.options.origin)) continue;
// 			let termIndex = T20.passosDano.indexOf(term.expression);
// 			if (!termIndex || !T20.passosDano[termIndex + mod.value]) continue;
// 			[term.number, term.faces] = T20.passosDano[termIndex + mod.value].split("d");
// 		}
// 	}

// 	modDieModifier(mod) {
// 		if (!Die.MODIFIERS[mod.value]) return;
// 		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(",") : false;
// 		const origin = mod.conditions.origin ? mod.conditions.origin.split(",") : false;
// 		for (const term of this.terms) {
// 			if (!(term instanceof DiceTerm)) continue;
// 			if (term.modifiers.includes(mod.value)) continue;
// 			if (flavor && !flavor.includes(term.options.flavor)) continue;
// 			if (origin && !origin.includes(term.options.origin)) continue;
// 			term.modifiers.push(mod.value);
// 		}
// 	}
// }
