import ActiveEffectWizard from "../apps/active-effect-wizard.mjs";
import ActorT20 from "./actor.mjs";
import ItemT20 from "./item.mjs";
import { effectMigration } from "./migrations.mjs";
/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export default class ActiveEffectT20 extends ActiveEffect {
	/** @inheritdoc */
	static migrateData(data) {
		super.migrateData(data);
		effectMigration.migrateAbilitiesPath(data);
		effectMigration.migrateResistancesPath(data);
		return data;
	}

	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		if (this.parent && ["comodo", "mobilia"].includes(this.parent.type)) {
			this.updateSource({ transfer: !this.parent.system.residentes });
		}
	}

	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		if (game.userId != userId) return;

		if (this.isCondition && this.parent.documentName == "Actor") {
			this._createChildEffects(data, options, userId);
			/**
			 * TODO: UPGRADE EFFECT
			 * Ideally the one with shortest duration? (But we don't have the correct durations ^^')
			 */
		}
	}

	async _createChildEffects(data, options, userId) {
		const childEffect = foundry.utils.getProperty(data, "flags.tormenta20.childEffect");
		if (foundry.utils.isEmpty(childEffect)) return;
		const effects = [];
		for (const statusId of childEffect) {
			const effect = await ActiveEffect.fromStatusEffect(statusId);
			effects.push({
				...effect.toObject(),
				origin: this.uuid
			});
		}
		if (foundry.utils.isEmpty(effects)) return;
		await this.parent.createEmbeddedDocuments("ActiveEffect", effects);
	}

	/** @inheritdoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		if (game.userId !== userId) return;
		if (this.isCondition && this.parent.documentName == "Actor") {
			this._deleteChildEffects();
		}
	}

	_deleteChildEffects() {
		const childEffect = foundry.utils.getProperty(this, "flags.tormenta20.childEffect");
		if (foundry.utils.isEmpty(childEffect)) return;
		const effects = this.parent.effects.filter((ef) => ef.origin == this.uuid).map((ef) => ef.id);
		if (foundry.utils.isEmpty(effects)) return;
		this.parent.deleteEmbeddedDocuments("ActiveEffect", effects);
	}

	/**
	 * Is this active effect currently suppressed?
	 * @type {boolean}
	 */
	get isSuppressed() {
		if (this.parent.documentName !== "Actor") return false;
		let suppressed = super.isSuppressed ?? false;
		if (!suppressed) suppressed = this.isSuppressedUnnequipped;
		if (!suppressed) suppressed = this.isSuppressedInherited;
		if (!suppressed) suppressed = this.isSuppressedDuplicated;
		if (!suppressed) suppressed = this.isSuppressedUpgrade;
		if (!suppressed) suppressed = this.isSuppressedImunity;
		this._suppressed = suppressed;
		return suppressed;
	}

	get isSuppressedUnnequipped() {
		const [parentType, parentId, documentType, documentId, syntheticItem, syntheticItemId] =
			this.origin?.split(".") ?? [];
		let item;
		// Case 1: This is a linked or sidebar actor
		if (parentType === "Actor" && !(parentId !== this.parent.id || documentType !== "Item")) {
			item = this.parent.items.get(documentId);
		}
		// Case 2: This is a synthetic actor on the scene
		else if (parentType === "Scene" && !(documentId !== this.parent.token?.id || syntheticItem !== "Item")) {
			item = this.parent.items.get(syntheticItemId);
		}
		if (item) return item.areEffectsSuppressed;
		return false;
	}

	// If Parent is supressed, child will be supressed too
	get isSuppressedInherited() {
		if (this.origin) {
			const id = this.origin.split(".").pop();
			const origin = this.parent.effects.get(id);
			if (origin) return origin._suppressed;
		}
		return false;
	}

	// If more than one of the same status are present, the oldest ones get supressed
	get isSuppressedDuplicated() {
		const statusId = this.statuses.first();
		const duplicate = this.parent.effects.filter((ef) => ef.id != this.id && ef.statuses.has(statusId));
		if (duplicate.length) {
			const creation = duplicate.map((ef) => ef._stats.createdTime);
			if (creation.find((i) => i > this._stats.createdTime)) return true;
		}
		return false;
	}

	// If upgraded version is present
	get isSuppressedUpgrade() {
		const upgrade = foundry.utils.getProperty(this, "flags.tormenta20.stack");
		if (this.isCondition && upgrade) {
			if (this.parent.statuses.has(upgrade)) return true;
		}
		return false;
	}

	// Actor is Imunine
	get isSuppressedImunity() {
		const statusImunities = foundry.utils.getProperty(this.parent, "system.tracos.ic.value");
		if (this.isCondition && statusImunities && statusImunities.size) {
			const statusId = this.statuses.first();
			const category = this.getFlag("tormenta20", "category");
			const ignore = this.getFlag("tormenta20", "ignoreImunity");
			if (!ignore && statusId && statusImunities.has(statusId)) return true;
			if (!ignore && category && statusImunities.has(category)) return true;
		}
		return false;
	}

	/** @override */
	get active() {
		return !this.disabled && !this.isSuppressed && !this.isUsage;
	}

	/** @override */
	get isUsage() {
		return this.getFlag("tormenta20", "onuse");
	}

	get isCondition() {
		return this.getFlag("tormenta20", "condition");
	}

	/**
	 * Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.
	 * @type {boolean}
	 */
	get isTemporary() {
		const scene = this.getFlag("tormenta20", "durationScene");
		const duration = this.duration.seconds ?? (this.duration.rounds || this.duration.turns) ?? 0;
		if (scene || duration > 0) return true;
		if (!this.statuses.size) return false;

		// Effects transferred from items are usually passive bonuses. They may
		// carry an icon, but should not be treated as active scene conditions.
		const inheritedPassive =
			this.parent?.documentName === "Actor"
			&& (this.transfer || this.origin?.includes(".Item."))
			&& !this.isUsage
			&& !this.isCondition;
		return !inheritedPassive;
	}
	/* --------------------------------------------- */

	/** @inheritdoc */
	apply(actor, change) {
		if (change.key.match(/\.\?+\./)) return null;
		if (change.key.startsWith("flags.tormenta20.")) change = this._prepareFlagChange(actor, change);
		if (change.key.startsWith("system.attributes.movement") && change.key.match(/(walk|fly|burrow|climb|swim)$/)) {
			change.key += change.mode == 2 ? ".bonus" : ".base";
		}
		const wildcardPatterns = [
			"system.atributos.*.value",
			"system.atributos.*.bonus",
			"system.pericias.*.bonus",
			"system.pericias.*.condi",
			"system.attributes.movement.*.value",
			"system.attributes.movement.*.base",
			"system.attributes.movement.*.bonus"
		];
		const filters = {
			"system.attributes.movement": (key) => T20.movementTypes[key]
		};
		if (change.key.includes("*") && wildcardPatterns.includes(change.key)) {
			// Replica `system.path.*.key` pra todas as chaves de `system.path`
			let [fieldPath, field] = change.key.split(".*");
			field ??= "";
			const property = foundry.utils.getProperty(actor, fieldPath);
			const filter = filters[fieldPath] ?? (() => true);
			for (const key of Object.keys(property).filter(filter)) {
				change.key = `${fieldPath}.${key}${field}`;
				super.apply(actor, change);
			}
			return {};
		}
		return super.apply(actor, change);
	}

	/* --------------------------------------------- */

	/**
	 * Prepare derived data related to active effect duration
	 * @internal
	 */
	_prepareDuration() {
		// const d = this.duration;
		const isScene = this.getFlag("tormenta20", "durationScene");

		// Scene-based duration
		if (isScene) {
			return {
				type: "scene",
				duration: null,
				remaining: null,
				label: game.i18n.localize("T20.TimeScene"),
				_worldTime: game.time.worldTime
			};
		}
		return super._prepareDuration();
	}

	/* --------------------------------------------- */

	/**
	 * Transform the data type of the change to match the type expected for flags.
	 * @param {ActorT20} actor           The Actor to whom this effect should be applied.
	 * @param {EffectChangeData} change  The change being applied.
	 * @returns {EffectChangeData}       The change with altered types if necessary.
	 */
	_prepareFlagChange(actor, change) {
		const { key, value } = change;
		const data = CONFIG.T20.characterFlags[key.replace("flags.tormenta20.", "")];
		if (!data) return change;

		// Set flag to initial value if it isn't present
		const current = foundry.utils.getProperty(actor, key) ?? null;
		if (current === null) {
			let initialValue = null;
			if (data.placeholder) initialValue = data.placeholder;
			else if (data.type === Boolean) initialValue = false;
			else if (data.type === Number) initialValue = 0;
			foundry.utils.setProperty(actor, key, initialValue);
		}

		// Coerce change data into the correct type
		if (data.type === Boolean) {
			if (value === "false") change.value = false;
			else change.value = Boolean(value);
		} else if (data.type === Number) {
			if (value.startsWith("@")) {
				let rolldata = actor.getRollData();
				let numvalue = Roll.replaceFormulaData(value, rolldata);
				change.value = Number(numvalue);
			}
		}
		return change;
	}

	/* --------------------------------------------- */

	/**
	 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
	 * @param {MouseEvent} event        The left-click event on the effect control
	 * @param {ActorT20|ItemT20} owner  The owning document which manages this effect
	 * @returns {Promise|null}          Promise that resolves when the changes are complete.
	 */
	static async onManageActiveEffect(event, owner) {
		event.preventDefault();
		const a = event.currentTarget;
		const li = a.closest("li");
		const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
		const type = li.dataset.effectType === "onuseTemp" ? "onuse" : li.dataset.effectType;
		const temp = li.dataset.effectType === "onuseTemp";
		switch (a.dataset.action) {
			case "create": {
				const isOnUse = type === "onuse";
				const itemEffect = owner.documentName === "Item";
				const effectData = {
					name: isOnUse || !itemEffect ? game.i18n.localize("T20.EffectNewLabel") : owner.name,
					img: isOnUse ? "icons/svg/upgrade.svg" : itemEffect ? owner.img : "icons/svg/aura.svg",
					origin: owner.uuid,
					tint: "#FFFFFF",
					flags: { tormenta20: { onuse: isOnUse, durationScene: temp, self: owner.type === "magia" } },
					"duration.rounds": type === "temporary" || temp ? 1 : undefined,
					"duration.seconds": undefined,
					disabled: ["inactive", "onuse"].includes(type)
				};
				if (event.type == "contextmenu") {
					return await owner.createEmbeddedDocuments("ActiveEffect", [effectData], { renderSheet: true });
				}
				return new ActiveEffectWizard(owner, effectData).render({ force: true });
			}
			case "create-status": {
				const statusEffect = await ActiveEffect.fromStatusEffect(a.dataset.statusId);
				if (!statusEffect) return false;
				statusEffect.transfer = false;
				return owner.createEmbeddedDocuments("ActiveEffect", [statusEffect.toObject()]);
			}
			case "edit":
				return effect.sheet.render(true);
			case "delete":
				return effect.delete();
			case "toggle":
				return effect.update({ disabled: !effect.disabled });
		}
	}

	/* --------------------------------------------- */

	/**
	 * Prepare the data structure for Active Effects which are currently applied to an Actor or Item.
	 * @param {ActiveEffect[]} effects    The array of Active Effect instances to prepare sheet data for
	 * @return {object}                   Data for rendering
	 */
	static prepareActiveEffectCategories(effects) {
		// Define effect header categories
		const categories = {
			onuse: {
				type: "onuse",
				label: game.i18n.localize("T20.OnUseEffects"), // "Efeitos de Uso",
				effects: []
			},
			onuseTemp: {
				type: "onuseTemp",
				label: game.i18n.localize("T20.OnUseEffectTemporary"), // "Efeitos de Uso Temporários",
				effects: []
			},
			temporary: {
				type: "temporary",
				label: game.i18n.localize("T20.EffectTemporary"), // "Efeitos Temporários",
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("T20.EffectPassive"), // "Efeitos Passivos",
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("T20.EffectInactive"), // "Efeitos Inativos",
				effects: []
			},
			suppressed: {
				type: "suppressed",
				label: game.i18n.localize("T20.EffectSuppressed"),
				effects: [],
				info: [game.i18n.localize("T20.EffectSuppressedHint")]
			}
		};
		// Iterate over active effects, classifying them into categories
		for (let e of effects) {
			// e.sourceName // Trigger a lookup for the source name
			if (e.isSuppressed) categories.suppressed.effects.push(e);
			else if (e.flags.tormenta20?.onuse && e.isTemporary) categories.onuseTemp.effects.push(e);
			else if (e.flags.tormenta20?.onuse) categories.onuse.effects.push(e);
			else if (e.disabled) categories.inactive.effects.push(e);
			else if (e.isTemporary) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}

		return categories;
	}
}
