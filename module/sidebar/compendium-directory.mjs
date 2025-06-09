// # SPDX-FileCopyrightText: 2019 Hooking
// #
// # SPDX-License-Identifier: Apache License v2

import MiniSearch from "../../node_modules/minisearch/dist/es/index.js";
import { createHTMLElement, fontAwesomeIcon, htmlQuery } from "../utils.mjs";

export default class CompendiumDirectoryT20 extends foundry.applications.sidebar.tabs.CompendiumDirectory {
	static STOP_WORDS = new Set(["o", "a", "de", "da", "do"]);

	static #searchEngine = null;

	/** Include ability to search and drag document search results */
	static DEFAULT_OPTIONS = {
		actions: {
			openSheet: CompendiumDirectoryT20.#onClickOpenSheet
		}
	};

	matchDragDrop;

	static PARTS = {
		...super.PARTS,
		match: { template: "systems/tormenta20/templates/sidebar/compendium-directory/search-result.hbs" }
	};

	get searchEngine() {
		if (!CompendiumDirectoryT20.#searchEngine) {
			const wordSegmenter =
				"Segmenter" in Intl
					? new Intl.Segmenter(game.i18n.lang, { granularity: "word" })
					: // Firefox >:(
						{
							segment(term) {
								return [{ segment: term }];
							}
						};
			CompendiumDirectoryT20.#searchEngine = new MiniSearch({
				fields: ["name", "originalName"],
				idField: "uuid",
				processTerm: (term) => {
					if (term.length <= 1 || CompendiumDirectoryT20.STOP_WORDS.has(term)) {
						return null;
					}
					return Array.from(wordSegmenter.segment(term))
						.map((t) =>
							foundry.applications.ux.SearchFilter.cleanQuery(t.segment.toLocaleLowerCase(game.i18n.lang)).replace(
								/['"]/g,
								""
							)
						)
						.filter((t) => t.length > 1);
				},
				searchOptions: { combineWith: "AND", prefix: true },
				storeFields: ["uuid", "img", "name", "type", "documentType", "packLabel"]
			});
		}

		return CompendiumDirectoryT20.#searchEngine;
	}

	/** Create a drag preview that looks like the one generated from an open compendium */
	get #dragPreview() {
		const preview = document.createElement("div");
		preview.id = "pack-search-drag-preview";

		const thumbnail = document.createElement("img");
		const title = document.createElement("h4");
		preview.append(thumbnail, title);

		return preview;
	}

	async _onFirstRender(context, options) {
		this._createContextMenu(this.#getDocumentMatchContextEntries, "ol.document-matches > li");
		return super._onFirstRender(context, options);
	}

	#getDocumentMatchContextEntries() {
		return [
			{
				name: "COMPENDIUM.ImportEntry",
				icon: fontAwesomeIcon("download").outerHTML,
				condition: (li) => {
					const uuid = li.dataset.uuid;
					if (!uuid) throw Error("Tormenta20 | Unexpected missing uuid");
					const collection = game.packs.get(fromUuidSync(uuid)?.pack ?? "", { strict: true });
					const documentClass = collection.documentClass;
					return documentClass.canUserCreate(game.user);
				},
				callback: (li) => {
					const uuid = li.dataset.uuid;
					if (!uuid) throw Error("Tormenta20 | Unexpected missing uuid");
					const packCollection = game.packs.get(fromUuidSync(uuid)?.pack ?? "", { strict: true });
					const worldCollection = game.collections.get(packCollection.documentName, { strict: true });
					const indexData = fromUuidSync(uuid) ?? { _id: "" };
					if (!("_id" in indexData && typeof indexData._id === "string")) {
						throw Error("Tormenta20 | Unexpected missing document _id");
					}
					return worldCollection.importFromCompendium(packCollection, indexData._id, {}, { renderSheet: true });
				}
			}
		];
	}

	_onRender(context, options) {
		if (options.parts.includes("directory")) {
			const matchesList = createHTMLElement("ol", { classes: ["document-matches"] });
			const html = this.element;
			html.querySelector("ol.directory-list")?.append(matchesList);
			this.matchDragDrop = new foundry.applications.ux.DragDrop({
				dragSelector: "li.match",
				permissions: {
					dragstart: this._canDragStart.bind(this),
					drop: this._canDragDrop.bind(this)
				},
				callbacks: {
					dragover: this._onDragOver.bind(this),
					dragstart: this._onDragStart.bind(this),
					drop: this._onDrop.bind(this)
				}
			}).bind(html);
		}
		return super._onRender(context, options);
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	// _getEntryContextOptions() {
	// 	        const options = super._getEntryContextOptions();

	//     options.push({
	//         name: "COMPENDIUM.MigrationStatus",
	//         icon: fontAwesomeIcon("info").outerHTML,
	//         condition: (li) => {
	//             const compendium = game.packs.get(li.dataset.pack, { strict: true });
	//             const actorOrItem =
	//                 compendium.documentClass === CONFIG.Actor.documentClass ||
	//                 compendium.documentClass === CONFIG.Item.documentClass;
	//             const isSystemCompendium = compendium.metadata.packageType === "system";
	//             return game.user.isGM && actorOrItem && !isSystemCompendium;
	//         },
	//         callback: async (li) => {
	//             const compendium = game.packs.get(li.dataset.pack, { strict: true });
	//             new CompendiumMigrationStatus(compendium).render(true);
	//         },
	//     });

	//     return options;
	// }

	/** System compendium search */
	_onSearchFilter(event, query, rgx, listElem) {
		super._onSearchFilter(event, query, rgx, listElem);
		const html = this.element;

		// Match documents within each compendium by name
		const docMatches = query.length > 0 ? this.searchEngine.search(query) : [];
		const filters = this.activeFilters;
		const filteredMatches = filters.size > 0 ? docMatches.filter((m) => filters.has(m.documentType)) : docMatches;

		// Create a list of document matches
		const matchTemplate = htmlQuery(html, ".compendium-search-match");
		if (!matchTemplate) throw Error("Tormenta20 | Match template not found");

		const listElements = filteredMatches.map((match) => {
			const li = matchTemplate.content.firstElementChild?.cloneNode(true);
			li.dataset.score = match.score.toString();
			li.dataset.uuid = match.uuid;

			// Show a thumbnail if available
			const thumbnail = li.querySelector("img");
			if (thumbnail) {
				if (typeof match.img === "string") {
					thumbnail.src = match.img;
				} else if (match.documentType === "JournalEntry") {
					thumbnail.src = "icons/svg/book.svg";
				}
			}

			const docAnchor = li.querySelector("a[data-action=openSheet]");
			const packAnchor = li.querySelector("a[data-action=activateEntry]");
			const systemType = ["Actor", "Item"].includes(match.documentType)
				? game.i18n.localize(`TYPES.${match.documentType}.${match.type}`)
				: null;
			if (docAnchor && packAnchor) {
				docAnchor.innerText = match.name;
				packAnchor.append(systemType ? `${systemType} (${match.packLabel})` : `(${match.packLabel})`);
				const collection = foundry.utils.parseUuid(match.uuid)?.collection;
				packAnchor.dataset.pack = collection?.metadata.id;
			}

			return li;
		});
		const matchesList = htmlQuery(html, "ol.document-matches");
		if (!matchesList) return;
		matchesList.replaceChildren(...listElements);
		this.matchDragDrop.bind(matchesList);
	}

	/** Anyone can drag from search results */
	_canDragStart(selector) {
		return selector === "ol.document-matches" || super._canDragStart(selector);
	}

	/** Replicate the functionality of dragging a compendium document from an open `Compendium` */
	_onDragStart(event) {
		const dragElement = event.currentTarget;
		if (!(dragElement instanceof HTMLElement && event.dataTransfer)) {
			return super._onDragStart(event);
		}
		const { uuid } = dragElement.dataset;
		if (!uuid) return super._onDragStart(event);

		const indexEntry = fromUuidSync(uuid);
		if (!indexEntry) throw Error("Tormenta20 | Unexpected error retrieving index data");

		// Clean up old drag preview
		document.querySelector("#pack-search-drag-preview")?.remove();

		// Create a new drag preview
		const dragPreview = this.#dragPreview.cloneNode(true);
		const [img, title] = Array.from(dragPreview.childNodes);
		title.innerText = indexEntry.name ?? "";
		img.src = "img" in indexEntry && indexEntry.img ? indexEntry.img : "icons/svg/book.svg";

		document.body.appendChild(dragPreview);
		const documentType = (() => {
			if (indexEntry instanceof foundry.abstract.Document) return indexEntry.documentName;
			const pack = game.packs.get(indexEntry.pack ?? "");
			return pack?.documentName ?? null;
		})();
		if (!documentType) return;

		event.dataTransfer.setDragImage(dragPreview, 75, 25);
		event.dataTransfer.setData("text/plain", JSON.stringify({ type: documentType, uuid }));
	}

	/** Called by a "ready" hook */
	compileSearchIndex() {
		console.debug("Tormenta20 | compiling search index");
		const packs = game.packs.filter((p) => p.index.size > 0 && p.testUserPermission(game.user, "OBSERVER"));
		this.searchEngine.removeAll();

		for (const pack of packs) {
			const contents = pack.index.map((i) => ({
				...i,
				documentType: pack.metadata.type,
				packLabel: pack.metadata.label
			}));
			this.searchEngine.addAll(contents);
		}
		console.debug("Tormenta20 | Finished compiling search index");
	}

	// Open compendium on result click
	static async #onClickOpenSheet(_event, target) {
		const doc = await fromUuid(target.closest("li")?.dataset.uuid ?? "");
		doc?.sheet?.render(true);
	}
}
