/**
 * A type of Roll specific to a d20-based check, save, or attack roll in the T20 system.
 */
export default class D20Roll extends Roll {
  constructor(formula, data, options) {
    super(formula, data, options);
    if ( !((this.terms[0] instanceof foundry.dice.terms.Die) && (this.terms[0].faces === 20)) ) {
      throw new Error(`Invalid D20Roll formula provided ${this._formula}`);
    }
    this.configureModifiers();
  }

	/* -------------------------------------------- */

  /**
   * Advantage mode of a T20 d20 roll
   * @enum {number}
   */
	 static ADV_MODE = {
    NORMAL: 0,
    ADVANTAGE: 1,
    DISADVANTAGE: -1,
  }

	/* -------------------------------------------- */

  /**
   * A convenience reference for whether this D20Roll has advantage
   * @type {boolean}
   */
	 get hasAdvantage() {
    return this.options.advantageMode === D20Roll.ADV_MODE.ADVANTAGE;
  }

  /**
   * A convenience reference for whether this D20Roll has disadvantage
   * @type {boolean}
   */
  get hasDisadvantage() {
    return this.options.advantageMode === D20Roll.ADV_MODE.DISADVANTAGE;
  }

	/* -------------------------------------------- */
  /*  D20 Roll Methods                            */
  /* -------------------------------------------- */

	/**
   * Apply optional modifiers which customize the behavior of the d20term
   * @private
   */
	 configureModifiers() {
    const d20 = this.terms[0];
    d20.modifiers = [];

    // Handle Advantage or Disadvantage
    if ( this.hasAdvantage ) {
      d20.number = 2;
      d20.modifiers.push("kh");
      d20.options.advantage = true;
    }
    else if ( this.hasDisadvantage ) {
      d20.number = 2;
      d20.modifiers.push("kl");
      d20.options.disadvantage = true;
    }
    else d20.number = 1;

    // Assign critical and fumble thresholds
    if ( this.options.critical ) d20.options.critical = this.options.critical;
    if ( this.options.fumble ) d20.options.fumble = this.options.fumble;
    if ( this.options.targetValue ) d20.options.target = this.options.targetValue;

    // Re-compile the underlying formula
    this._formula = this.constructor.getFormula(this.terms);
  }

	/* -------------------------------------------- */

  /** @inheritdoc */
  async toMessage(messageData={}, options) {
    messageData.flavor = messageData.flavor || this.options.flavor;

    // Evaluate the roll now so we have the results available to determine whether reliable talent came into play
    if ( !this._evaluated ) await this.evaluate({ async:true });

    // Add appropriate advantage mode message flavor and T20 roll flags
    if ( this.hasAdvantage ) messageData.flavor += ` (${game.i18n.localize("T20.Advantage")})`;
    else if ( this.hasDisadvantage ) messageData.flavor += ` (${game.i18n.localize("T20.Disadvantage")})`;
    return super.toMessage(messageData, options);
  }

}