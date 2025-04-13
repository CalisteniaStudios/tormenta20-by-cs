export default class ActorDirectoryTormenta20 extends foundry.applications.sidebar.tabs.ActorDirectory {
	static _entryPartial = "systems/tormenta20/templates/sidebar/actor-document-partial.hbs";

	static DEFAULT_OPTIONS = {
		collection: "Actor",
		renderUpdateKeys: ["name", "img", "ownership", "sort", "folder", "system.attributes.nivel.value"]
	};
}
