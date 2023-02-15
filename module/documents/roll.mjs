import { T20 } from "../config.mjs";

export default class RollT20 extends Roll {
	
	ROLLTYPES = {
		FORMULA: 1,
		ATTACK: 2,
		DAMAGE: 3,
	}

	// MODIFIERSDATA = {
	// 	0: {type: "", value:"0", conditions: {flavor:"", origin:""}},
	// }

	SORTMODIFIERS = {
		addTerm: 0,
		upgradeDie: 1,
		modifyDieNumber: 2,
		modifyDieFace: 3,
		addPerDie: 4,
		dieModifier: 5,
	}

	constructor(formula, data, options) {
		super(formula, data, options);
		if ( !options.type ) options.type = this.ROLLTYPES.FORMULA;
		if ( !options.modifiers ) options.modifiers = [];
		if ( options.type == this.ROLLTYPES.FORMULA ) this.configureFormulaModifiers();
		if ( options.type == this.ROLLTYPES.ATTACK ) this.configureAttackModifiers();
		if ( options.type == this.ROLLTYPES.DAMAGE ) this.configureDamageModifiers();
		// console.log(this);
	}

	/* -------------------------------------------- */
	/*  Roll Methods                                */
	/* -------------------------------------------- */

	/**
	 * Apply optional modifiers which customize the behavior of the d20term
	 * @private
	 */
	configureFormulaModifiers() {
	}

	/**
	 * Apply optional modifiers which customize the behavior of the d20term
	 * @private
	 */
	configureAttackModifiers() {
	}

	/**
	 * Apply optional modifiers which customize the behavior of the d20term
	 * @private
	 */
	configureDamageModifiers() {
		const modifiers = this.options.modifiers.sort((a,b) => this.SORTMODIFIERS[a.type] - this.SORTMODIFIERS[b.type]);
		for (const mod of modifiers) {
			mod.value = mod.value.toString();
			switch (mod.type) {
				case "addTerm":
					this.modAddTerm(mod);
					break;
				case "addPerDie":
					this.modAddPerDie(mod);
					break;
				case "modifyDieNumber":
					this.modModifyDieNumber(mod);
					break;
				case "modifyDieFace":
					this.modModifyDieFace(mod);
					break;
				case "upgradeDie":
					this.modUpgradeDie(mod);
					break;
				case "dieModifier":
					this.modDieModifier(mod);
					break;
				default:
					console.log("DEFAULT");
					break;
			}
		}
	}

	/**
	 * ADD TERM
	 * @param {object} mod         DATA
	 */
	modAddTerm(mod){
		mod.value = Roll.replaceFormulaData(mod.value, this.data);
		let newTerm;
		if ( isFinite( Roll.safeEval(mod.value) ) ) {
			newTerm = new NumericTerm({number: Roll.safeEval(mod.value), options:{flavor: mod.flavor,origin:mod.origin}});
		} else {
			newTerm = new DiceTerm({number: mod.value, options:{flavor: mod.flavor,origin:mod.origin}});
		}
		this.terms.push(
			new OperatorTerm({operator: '+'}),
			newTerm
		);
	}
	
	modAddPerDie(mod){
		mod.value = Roll.replaceFormulaData(mod.value, this.data);
		mod.value = Roll.safeEval(mod.value);
		if ( !isFinite(mod.value) ) return;
		const dies = this.terms.filter( term => {
			const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(',') : false;
			const origin = mod.conditions.origin ? mod.conditions.origin.split(',') : false;
			if ( !(term instanceof DiceTerm) ) return false;
			if ( flavor && !flavor.includes(term.options.flavor)) return false;
			if ( origin && !origin.includes(term.options.origin)) return false;
			return true;
		}).map( term => term.number );
		const total = Roll.safeEval(...dies) * mod.value;
		if ( !total ) return;
		this.terms.push(
			new OperatorTerm({operator: '+'}),
			new NumericTerm({number: total, options:{flavor: mod.flavor,origin:mod.origin}})
		);
	}
	
	modModifyDieNumber(mod){
		mod.value = Roll.replaceFormulaData(mod.value, this.data);
		mod.value = Roll.safeEval(mod.value);
		if ( !isFinite(mod.value) ) return;
		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(',') : false;
		const origin = mod.conditions.origin ? mod.conditions.origin.split(',') : false;
		for (const term of this.terms) {
			if ( !(term instanceof DiceTerm) ) continue;
			if ( flavor && !flavor.includes(term.options.flavor)) continue;
			if ( origin && !origin.includes(term.options.origin)) continue;
			term.number = term.number + mod.value;
		}
	}
	
	modModifyDieFace(mod){
		mod.value = Roll.replaceFormulaData(mod.value, this.data);
		mod.value = Roll.safeEval(mod.value);
		if ( !isFinite(mod.value) ) return;
		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(',') : false;
		const origin = mod.conditions.origin ? mod.conditions.origin.split(',') : false;
		for (const term of this.terms) {
			if ( !(term instanceof DiceTerm) ) continue;
			if ( flavor && !flavor.includes(term.options.flavor)) continue;
			if ( origin && !origin.includes(term.options.origin)) continue;
			term.faces = mod.value;
		}
	}
	
	modUpgradeDie(mod){
		mod.value = Roll.replaceFormulaData(mod.value, this.data);
		mod.value = Roll.safeEval(mod.value);
		if ( !isFinite(mod.value) ) return;
		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(',') : false;
		const origin = mod.conditions.origin ? mod.conditions.origin.split(',') : false;
		for (const term of this.terms) {
			if ( !(term instanceof DiceTerm) ) continue;
			if ( flavor && !flavor.includes(term.options.flavor)) continue;
			if ( origin && !origin.includes(term.options.origin)) continue;
			let termIndex = -1;
			let passosIndx = 0;
			for (passosIndx = 0; passosIndx < C.passosDano.length; passosIndx++) {
				termIndex = T20.passosDano[passosIndx].indexOf(term.expression);
				if (termIndex != -1) break;
			}
			if ( passosIndx >= passosDano.length || termIndex < 0 || !T20.passosDano[passosIndx][ termIndex + mod.value ] ) continue;
			[term.number, term.faces] = T20.passosDano[passosIndx][ termIndex + mod.value ].split('d');
		}
	}
	
	modDieModifier(mod){
		if( !Die.MODIFIERS[mod.value] ) return;
		const flavor = mod.conditions.flavor ? mod.conditions.flavor.split(',') : false;
		const origin = mod.conditions.origin ? mod.conditions.origin.split(',') : false;
		for (const term of this.terms) {
			if ( !(term instanceof DiceTerm) ) continue;
			if ( term.modifiers.includes(mod.value) ) continue;
			if ( flavor && !flavor.includes(term.options.flavor)) continue;
			if ( origin && !origin.includes(term.options.origin)) continue;
			term.modifiers.push(mod.value);
		}
	}
}