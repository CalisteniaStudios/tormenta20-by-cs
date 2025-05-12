/**
 * Define a custom JournalSheet class used for the Tormenta20 rules journal entries.
 * @extends JournalSheet
 * @mixes SheetsT20
 */
export default class JournalSheetT20 extends JournalSheet {
	/** @override */
	static get defaultOptions() {
		const options = JournalSheet.defaultOptions;
		options.classes.unshift("tormenta20-basico", "journal-sheet");
		return options;
	}

	/** @override */
	// get title() {
	//   return `[${game.i18n.localize("CRUCIBLE.Rules")}] ${this.document.name}`;
	// }

	/** @inheritDoc */
	async _renderInner(data) {
		const html = await super._renderInner(data);
		// html.find("input[type='search']").addClass("frame-brown");
		// html.find("button.create").addClass("frame-brown");
		return html;
	}

	/** @inheritDoc */
	async _renderOuter() {
		const html = await super._renderOuter();
		// const overlaySrc = "systems/crucible/ui/journal/overlay.png"; // TODO convert
		// const overlay = `<img class="background-overlay" src="${overlaySrc}">`
		// html.prepend(overlay);
		const t20Classes = this.document.getFlag("t20basico", "journalOptions.cssClass");
		if (t20Classes) {
			html.addClass(t20Classes);
		}
		return html;
	}
}
