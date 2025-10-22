/**
 * Extend the base Token class to implement additional system-specific logic.
 * @extends {Token}
 */
export default class TokenT20 extends foundry.canvas.placeables.Token {
	T20Ranges = [];

	/** @override */
	_applyRenderFlags(flags) {
		super._applyRenderFlags(flags);
		if (flags.refreshSize) this.drawRanges(true);
		else if (flags.refreshState) this.drawRanges();
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_drawBar(number, bar, data) {
		if (data.attribute === "attributes.pv" || data.attribute === "attributes.pm") {
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
		let { value, max, temp, tempmax, min } = foundry.utils.getProperty(actorData, data.attribute);

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
			[1 - colorPct / 2, colorPct, 0],
			[0.5 * colorPct, 0.7 * colorPct, 0.5 + colorPct / 2]
		];
		const hpColor = PIXI.utils.rgb2hex(tknBarColor[number]);
		const c = data.attribute === "attributes.pm" ? CONFIG.T20.tokenMPColors : CONFIG.T20.tokenHPColors;

		// Determine the container size (logic borrowed from core)
		const w = this.w;
		let h = Math.max(canvas.dimensions.size / 12, 8);
		if (this.document.height >= 2) h *= 1.6; // Enlarge the bar for large tokens
		const bs = Math.clamp(h / 8, 1, 2);
		const bs1 = bs + 1;

		// Overall bar container
		bar.clear();
		bar.beginFill(blk, 0.5).lineStyle(bs, blk, 1.0).drawRoundedRect(0, 0, w, h, 3);

		// // Maximum HP penalty
		// else if (tempmax < 0) {
		//   const pct = (max + tempmax) / max;
		//   bar.beginFill(c.negmax, 1.0).lineStyle(1, blk, 1.0).drawRoundedRect(pct*w, 0, (1-pct)*w, h, 2);
		// }

		// Health bar
		bar
			.beginFill(hpColor, 1.0)
			.lineStyle(bs, blk, 1.0)
			.drawRoundedRect(0, 0, valuePct * w, h, 2);

		// Temporary hit points
		if (temp > 0) {
			bar
				.beginFill(c.temp, 1.0)
				.lineStyle(0)
				.drawRoundedRect(bs1, bs1, tempPct * w - 2 * bs1, h - 2 * bs1, 1);
		}

		// Negative HP
		if (value < 0) {
			bar
				.beginFill(c.negmax, 1.0)
				.lineStyle(bs, blk, 1.0)
				.drawRoundedRect((1 - negativePct) * w, 0, negativePct * w, h, 2);
		}

		// Set position
		let posY = number === 0 ? this.h - h : 0;
		bar.position.set(0, posY);
	}

	drawRanges(forceRedraw) {
		const showRanges = ui.controls.controls.tokens.tools.range.active;
		if (!showRanges || forceRedraw || !this.controlled) {
			this.T20Ranges.forEach((r) => this.removeChild(r));
			this.T20Ranges = [];
		}
		if (showRanges && !this.T20Ranges.length && this.controlled) {
			const { units, size } = canvas.scene.grid;
			const { height, width } = canvas.dimensions;
			if (units != "m") return;
			const ranges = [9, 30, 90];
			for (const range of ranges) {
				if (range * size > width && range * size > height) continue;
				this._drawRange(range);
			}
		}
	}

	/**
	 * Draw range circles, range starts at token border not center.
	 */
	_drawRange(range) {
		const label = {
			9: T20.distanceUnits.short,
			30: T20.distanceUnits.medium,
			90: T20.distanceUnits.long
		}[range];
		const { distance, size } = canvas.dimensions;
		const squares = range / distance;
		if (squares < 1) return;
		// const bonusSize = (this.w > size ? this.w / 2 : 0);
		const bonusSize = Math.max(this.w, size) / 2;
		const circle = new PIXI.Graphics();
		circle
			.lineStyle(2, 0x000000, 1.0)
			.drawCircle(this.bounds.width / 2, this.bounds.height / 2, size * (range / distance) + bonusSize);
		this.T20Ranges.push(circle);
		this.addChild(circle);
		// Text
		const { PreciseText } = foundry.canvas.containers;
		const text = new PreciseText(`${range}m\n${label}`, CONFIG.canvasTextStyle.clone());
		text.anchor.set(0.5, 0.5);
		text.position.set((range / distance) * size + bonusSize * 2, this.bounds.width / 2);
		this.T20Ranges.push(text);
		this.addChild(text);
	}
}
