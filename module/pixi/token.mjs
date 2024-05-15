
/**
 * Extend the base Token class to implement additional system-specific logic.
 * @extends {Token}
 */
 export default class TokenT20 extends Token {

	/** @inheritdoc */
	// toggleEffect(effect, options) {
	// 	super.toggleEffect(effect, options);
	// }

	/* -------------------------------------------- */

	/** @inheritdoc */
	_drawBar(number, bar, data) {
		if ( data.attribute === "attributes.pv" || data.attribute === "attributes.pm" ){
			return this._drawHPBar(number, bar, data);
		}
		return super._drawBar(number, bar, data);
	}

	/* -------------------------------------------- */

	/**
	 * Specialized drawing function for HP bars.
	 * @param {number} number      The Bar number
	 * @param {PIXI.Graphics} bar  The Bar container
	 * @param {object} data        Resource data for this bar
	 * @private
	 */
	_drawHPBar(number, bar, data) {
		// Extract health data

		const actorData = this.document.actor.system;
		let {value, max, temp, tempmax, min} = foundry.utils.getProperty(actorData, data.attribute);
		
		temp = Number(temp || 0);
		tempmax = Number(tempmax || 0);

		// Differentiate between effective maximum and displayed maximum
		const effectiveMax = Math.max(0, max + tempmax);
		let displayMax = max + (tempmax > 0 ? tempmax : 0);

		// Allocate percentages of the total
		const tempPct = Math.clamp(temp, 0, displayMax) / displayMax;
		const valuePct = Math.clamp(value, 0, effectiveMax) / displayMax;
		const negativePct = Math.clamp(value, min, 0) / min;
		const colorPct = Math.clamp(value, 0, effectiveMax) / displayMax;

		// Determine colors to use
		const blk = 0x000000;
		const tknBarColor = [
			[(1-(colorPct/2)), colorPct, 0],
			[(0.5 * colorPct), (0.7 * colorPct), 0.5 + (colorPct / 2)]
		]
		const hpColor = PIXI.utils.rgb2hex(tknBarColor[number]);
		const c = data.attribute === "attributes.pm" ? CONFIG.T20.tokenMPColors : CONFIG.T20.tokenHPColors;
		
		// Determine the container size (logic borrowed from core)
		const w = this.w;
		let h = Math.max((canvas.dimensions.size / 12), 8);
		if ( this.document.height >= 2 ) h *= 1.6;  // Enlarge the bar for large tokens
		const bs = Math.clamp(h / 8, 1, 2);
		const bs1 = bs+1;

		// Overall bar container
		bar.clear()
		bar.beginFill(blk, 0.5).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, w, h, 3);

		// // Maximum HP penalty
		// else if (tempmax < 0) {
		//   const pct = (max + tempmax) / max;
		//   bar.beginFill(c.negmax, 1.0).lineStyle(1, blk, 1.0).drawRoundedRect(pct*w, 0, (1-pct)*w, h, 2);
		// }

		// Health bar
		bar.beginFill(hpColor, 1.0).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, valuePct*w, h, 2)

		// Temporary hit points
		if ( temp > 0 ) {
			bar.beginFill(c.temp, 1.0).lineStyle(0).drawRoundedRect(bs1, bs1, (tempPct*w)-(2*bs1), h-(2*bs1), 1);
		}

		// Negative HP
		if (value < 0) {
		  bar.beginFill(c.negmax, 1.0).lineStyle(bs, blk, 1.0).drawRoundedRect((1-negativePct)*w, 0, negativePct*w, h, 2);
		}


		// Set position
		let posY = (number === 0) ? (this.h - h) : 0;
		bar.position.set(0, posY);
	}

}