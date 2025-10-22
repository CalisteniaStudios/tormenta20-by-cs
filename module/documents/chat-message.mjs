export default class ChatMessageTormenta20 extends ChatMessage {
	async renderHTML({ canDelete, canClose = false, ...rest } = {}) {
		const html = await super.renderHTML({ canDelete, canClose, ...rest });
		this._highlightCriticalSuccessFailure(html);
		this._hideDC(html);
		return html;
	}

	_highlightCriticalSuccessFailure(html) {
		if (!this.isContentVisible || !this.rolls.length) return;
		// Highlight rolls where the first part is a d20 roll
		for (let [index, d20Roll] of this.rolls.entries()) {
			const d0 = d20Roll.dice[0];
			if (d0?.faces !== 20 || d0?.values.length !== 1) continue;

			// d20Roll = CONFIG.Dice.rolls.RollT20.fromRoll(d20Roll);
			const d = d20Roll.dice[0];

			// Ensure it is an un-modified d20 roll
			const isD20 = d.faces === 20 && d.values.length === 1;
			if (!isD20) return;
			const isModifiedRoll = "success" in d.results[0] || d.options.marginSuccess || d.options.marginFailure;
			if (isModifiedRoll) return;

			// Highlight successes and failures
			const total = html.querySelectorAll(".dice-total")[index];
			if (!total) continue;

			const isAttack = d20Roll.options.type === "attack";

			if (isAttack) {
				const critical = d.options.critical || 20;
				const fumble = d.options.fumble || 1;
				if (d.total >= critical) total.classList.add("success", "critical");
				else if (d.total <= fumble) total.classList.add("failure", "fumble");
				else if (d.options.target) {
					if (d.total >= d.options.target) total.classList.add("success");
					else total.classList.add("failure");
				}
			}
		}
	}

	_hideDC(html) {
		if (game.settings.get("tormenta20", "showFoeDc")) return;
		if (game.user.isGM) return;
		const actor = this.speakerActor;
		if (!actor) return;
		if (actor.type == "character") return;
		const header = html.querySelector(".card-item-header");
		if (!header) return;
		let content = header.innerHTML.replace(/CD \d+/i, "CD ??");
		header.innerHTML = content;
	}
}
