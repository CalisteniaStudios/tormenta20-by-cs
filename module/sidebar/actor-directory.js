export default class ActorDirectoryTormenta20 extends ActorDirectory {
	static entryPartial = "systems/tormenta20/templates/sidebar/actor-document-partial.hbs";

	static get defaultOptions() {
		const options = super.defaultOptions;
		options.renderUpdateKeys.push("system.attributes.nivel.value");
		return options;
	}
}
