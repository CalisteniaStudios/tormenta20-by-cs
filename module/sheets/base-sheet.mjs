/**
 * Extends DocumentSheet implementing common sheet interations;
 */
export default function Tormenta20BaseSheetMixin(Base) {
	return class Tormenta20BaseSheet extends Base {
		static SHEET_MODES = { EDIT: 0, PLAY: 1 };

		/** @override */
		static DEFAULT_OPTIONS = {
			classes: ["standard-form", "tormenta20"],
			window: {},
			actions: {
				logToConsole: { handler: this.#logToConsole, buttons: [0] },
				toggleMode: { handler: this.#onToggleMode, buttons: [0] },
				editImage: { handler: this.#onEditImage, buttons: [0] },
				create: { handler: this.#onCreate, buttons: [0] },
				delete: { handler: this.#onDelete, buttons: [0] },
				edit: { handler: this.#onEdit, buttons: [0] },
				// update: {handler: this.#onUpdate, buttons: [0] },
				toggle: { handler: this.#onToggle, buttons: [0] },
				vary: { handler: this.#onVary, buttons: [0, 2] },
				manage: { handler: this.#onManage, buttons: [0] },
				filter: { handler: this.#onFilter, buttons: [0, 2] },
				expand: { handler: this.#onExpand, buttons: [0] }
				// TODO:
				// rollAttribute: {handler: this.#rollAttribute, buttons: [0, 2]},
				// rollRollSkill: {handler: this.#rollAttribute, buttons: [0, 2]},
				// rollRollItem: {handler: this.#rollAttribute, buttons: [0, 2]},
				// rollEntry: {handler: this.#executeRoll, buttons: [0, 2]},
				// sendToChat: {handler: this.#sendToChat, buttons: [0, 2]},
			},
			position: { width: "auto" }
		};

		_sheetMode = this.constructor.SHEET_MODES.PLAY;

		_expanded = {};

		/* ---------------------------------------- */
		/* Getters                                  */
		/* ---------------------------------------- */

		get isPlayMode() {
			return this._sheetMode === this.constructor.SHEET_MODES.PLAY;
		}

		get isEditMode() {
			return this._sheetMode === this.constructor.SHEET_MODES.EDIT;
		}

		/* ---------------------------------------- */
		/* Rendering                                */
		/* ---------------------------------------- */

		_onFirstRender(context, options) {
			super._onFirstRender(context, options);
			this._setupContextMenu();
		}

		_setupContextMenu() {
			const { ContextMenu } = foundry.applications.ui;
			new ContextMenu(this.element, "[data-context-menu]", [], {
				onOpen: (entry) => {
					const { entryId, contextMenu } = entry.dataset;
					const property = foundry.utils.getProperty(this.document, contextMenu);
					if (property && "contextMenu" in property) return property.contextMenu;
					else if (entryId) {
						const doc = this.document.items.get(entryId) ?? this.document.effects.get(entryId);
						return doc.getSheetContextMenu;
					}
				}
			});
		}

		/** @inheritDoc */
		async _renderFrame(options) {
			const frame = await super._renderFrame(options);

			// Add console.log button
			const logLabel = game.i18n.localize("CONSOLE.LOG");
			const logBtn = `<button type="button" class="header-control fa-solid fa-terminal icon" data-action="logToConsole" data-tooltip="${logLabel}" aria-label="${logLabel}"></button>`;
			this.window.close.insertAdjacentHTML("beforebegin", logBtn);

			return frame;
		}

		/* ---------------------------------------- */
		/* Actions Handlers                         */
		/* ---------------------------------------- */

		/**
		 * Prompt the user to select an image from the file system;
		 * @param {*} event
		 * @param {*} target
		 */
		static async #onEditImage(event, target) {
			if (!this.isEditable) return;
			const current = this.document.img;
			const fp = new FilePicker({
				type: "image",
				current: current,
				callback: (path) => this.document.update({ img: path }),
				top: this.position.top + 40,
				left: this.position.left + 10
			});
			fp.browse();
		}

		/**
		 * Toggle between EDIT and PLAY mode;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 */
		static async #onToggleMode(event, target) {
			this._sheetMode = this._sheetMode === 1 ? 0 : 1;
			this.render();
		}

		/**
		 * Create embedded Document/DataModel;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.create]     Name of the Document/DataModel.
		 * @param {string} [target.dataset.type]       Type of the Document/DataModel.
		 * @param {string} [target.dataset.fieldPath]  DataField fieldPath.
		 * @param {string} [target.dataset.entryId]    Id/Key of the Document/DataModel.
		 * @returns void
		 *
		 * @example The template HTML structure
		 * ```hbs
		 * <button data-action="create" data-create="Item" data-type="base"></button>
		 *
		 * <button data-action="create" data-type="pericia" data-field-path="system.pericias"></button>
		 * ```
		 */
		static async #onCreate(event, target) {
			const { create, type, fieldPath, entryId } = target.dataset;
			const documentData = this.document.toObject();
			const currentField = foundry.utils.getProperty(documentData, fieldPath);

			if (create === "Item") {
				const itemData = {
					type: type ?? "base",
					img: CONFIG[create]?.dataModels[type]?.DEFAULT_IMAGE ?? "icons/svg/item-bag.svg",
					name: game.i18n.format("DOCUMENT.Create", {
						type: game.i18n.localize(`TYPES.Item.${type}`)
					})
				};
				const created = await this.document.createEmbeddedDocuments(create, [itemData]);
				created[0].sheet.render(true);
			} else if (create === "ActiveEffect") {
				let category = target.dataset.category;
				const effectData = {
					type: type ?? "base",
					name: game.i18n.format("DOCUMENT.Create", {
						type: game.i18n.localize(`TYPES.ActiveEffect.${type}`)
					}),
					img: CONFIG[create]?.dataModels[type]?.DEFAULT_IMAGE ?? "icons/svg/aura.svg",
					disabled: category === "inactive",
					duration: category === "temporary" ? { rounds: 1 } : {}
				};
				this.document.createEmbeddedDocuments(create, [effectData]);
			} else {
				const updateData = {};
				// Get default object structure to be added
				// TODO: instantiate from DataModel?
				const data = this._getCreateData(type, target);

				if (!data) {
					return;
				} else if (currentField instanceof Array) {
					currentField.push(data);
				} else if (currentField instanceof Object) {
					if (currentField[data.key]) return;
					currentField[data.key] = data;
				} else return;

				updateData[fieldPath] = currentField;
				this.document.update(updateData);
			}
		}

		/**
		 * Delete embedded Document/DataModel;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.fieldPath]  DataField fieldPath.
		 * @param {string} [target.dataset.entryId]    Id/Key of the Document/DataModel.
		 * @returns
		 *
		 * @example The template HTML structure
		 * ```hbs
		 * <button data-action="delete" data-entry-id="dTWkG8ZKEBwN1iPi"></button>
		 *
		 * <button data-action="delete" data-field-path="system.pericias" data-entry-id="acro"></button>
		 * ```
		 */
		static async #onDelete(event, target) {
			const { entryId, fieldPath } = target.dataset;
			const document = await this._getHandlerDocument(entryId);
			const documentData = this.document.toObject();
			const currentField = foundry.utils.getProperty(documentData, fieldPath);

			if (currentField instanceof Array) {
				currentField.splice(entryId, 1);
				const updateData = {};
				updateData[fieldPath] = currentField;
				return this.document.update(updateData);
			} else if (currentField instanceof Object) {
				const updateData = {};
				updateData[`${fieldPath}-=${entryId}`] = null;
				return this.document.update(updateData);
			} else if (document) {
				this.document.deleteEmbeddedDocuments(document.documentName, [entryId]);
			}
		}

		/**
		 * Open document sheet;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.entryId]    Id/Key of the Document/DataModel.
		 * @returns
		 *
		 * @example The DataModel requires a getter that will renders the sheet
		 * ```js
		 * get sheet(){
		 *  return new ActorResourcesSheet(this.document).render(true);
		 * }
		 * ```
		 * The template HTML structure
		 * ```hbs
		 * <button data-action="edit" data-entry-id="dTWkG8ZKEBwN1iPi"></button>
		 *
		 * <button data-action="delete" data-field-path="system.pericias.acro"></button>
		 * ```
		 */
		static async #onEdit(event, target) {
			const { entryId, editSheet } = target.dataset;
			const property = foundry.utils.getProperty(this.document, editSheet);
			if (property && "sheet" in property) return property.sheet;
			else if (entryId) {
				const document = await this._getHandlerDocument(entryId);
				if (!document) return;
				document.sheet.render(true);
			}
		}

		/**
		 * NEEDED?
		 */
		// static async #onUpdate(event, target) {}

		/**
		 * Toggle the value of a BooleanField;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.fieldPath]  DataField fieldPath.
		 * @param {string} [target.dataset.entryId]    Id/Key of the Document/DataModel.
		 * @returns
		 *
		 * @example The template HTML structure
		 * ```hbs
		 * <button data-action="toggle" data-vary="system.pericias.acro.treino"></button>
		 * ```
		 */
		static async #onToggle(event, target) {
			const fieldPath = target.dataset.fieldPath;
			const entryId = target.closest(".entry")?.dataset.entryId;

			// Toggle statusEffect
			if (this.actor && CONFIG.T20.conditions[entryId]) return this.actor.toggleStatusEffect(entryId);

			const document = await this._getHandlerDocument(entryId);
			if (!foundry.utils.hasProperty(document, fieldPath)) return;
			const updateData = {};
			updateData[fieldPath] = !foundry.utils.getProperty(document, fieldPath);
			document.update(updateData);
		}

		/**
		 * Increase/Decrease the value of a NumberField;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.fieldPath]  DataField fieldPath.
		 * @param {string} [target.dataset.max]        Maximun value of the NumberField.
		 * @param {string} [target.dataset.entryId]    Id/Key of the Document/DataModel.
		 * @returns
		 *
		 * @example The template HTML structure
		 * ```hbs
		 * <button data-action="vary" data-vary="system.pericias.acro.treino"></button>
		 * ```
		 */
		static async #onVary(event, target) {
			const { max, entryId } = target.dataset;
			const fieldPath = target.dataset.vary;
			// const entryId = target.closest(".entry")?.dataset.entryId;
			// Document
			console.log("fieldPath", fieldPath, max);
			const document = await this._getHandlerDocument(entryId);
			if (!foundry.utils.hasProperty(document, fieldPath)) return;

			let value = Number(foundry.utils.getProperty(document, fieldPath));
			const updateData = {};
			updateData[fieldPath] = value;
			event.type === "click" ? updateData[fieldPath]++ : updateData[fieldPath]--;
			if (max && Number(max)) {
				updateData[fieldPath] = Math.min(updateData[fieldPath], Number(max));
			}
			document.update(updateData);
		}

		/**
		 * TODO: Deprecate? Open app not related to DataModel?
		 * Open applications that manage some aspect of the sheet;
		 * @param {*} event                            The click event.
		 * @param {*} target                           The element clicked.
		 * @param {string} [target.dataset.manage]     Property data-manage with a identifier to application.
		 * @returns
		 */
		static async #onManage(event, target) {
			let manage = target.dataset.manage;
			switch (manage) {
				case "":
					// REST
					break;
				default:
			}
		}

		static async #onFilter(event, target) {}

		static async #onExpand(event, target) {
			const { expand, type, entryId } = target.dataset;
			if (this._expanded[type] instanceof Array) {
			} else {
				this._expanded[type] = entryId;
			}
		}

		static async #logToConsole(event, target) {
			console.group("LOG DOCUMENT AND SHEET ");
			console.log(this.document);
			console.log(this);
			console.groupEnd();
		}

		/* ---------------------------------------- */

		async _getHandlerDocument(id) {
			const document = this.document;
			return (await fromUuid(id)) ?? document.items?.get(id) ?? document.effects?.get(id) ?? document;
		}

		_getCreateData(type, target) {
			switch (type) {
				case "pericia": {
					const key = foundry.applications.api.DialogV2.prompt({
						window: { title: "I18N.DIALOG.CreateSkill" }
					});
					return {
						key: key,
						// type: "oficio" ?? "custom"
						type: "oficio"
					};
				}
				default:
					return {};
			}
		}

		/* ---------------------------------------- */
		/* Methods                                  */
		/* ---------------------------------------- */

		async _prepareDocumentSystem() {
			// TODO CALCULATE BURDEN BAR
			return {};
		}

		/**
		 * TODO
		 * Organize itens in categories.
		 * @returns {Object} sheetItems
		 */
		async _prepareDocumentItems() {
			// const doc = this.document;
			// const items = doc.items;
			const sheetItems = {};
			return sheetItems;
		}

		/**
		 * TODO
		 * Organize effects in categories.
		 * @returns {Object} sheetItems
		 */
		async _prepareDocumentEffects() {
			// const doc = this.document;
			// const effects = this.document.effects;
			const sheetEffects = {};
			return sheetEffects;
		}
	};
}
