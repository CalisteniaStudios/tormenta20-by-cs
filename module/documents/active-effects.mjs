import { effectMigration } from "./migrations.mjs";
/**
 * Extend the base ActiveEffect class to implement system-specific logic.
 */
export default class ActiveEffectT20 extends ActiveEffect {

	/** @inheritdoc */
	static migrateData(data) {
		super.migrateData(data);
		const start = foundry.utils.deepClone(data);
		// if( data.name === undefined && data.label) {
		// 	console.error(data);
		// 	data.name = data.label;
		// }
		effectMigration.migrateAbilitiesPath(data);
		effectMigration.migrateResistancesPath(data);
		if( !foundry.utils.isEmpty( foundry.utils.diffObject(start, data) ) ) {
			foundry.utils.setProperty(data,'flags.tormenta20.needCommit', true);
		}
		return data;
	}
	/**
	 * Is this active effect currently suppressed?
	 * @type {boolean}
	 */
	isSuppressed = false;

	/** @override */
	get active() {
		return !this.disabled && !this.isSuppressed && !this.isUsage;
	}
	
	/** @override */
	get isUsage() {
		return this.getFlag('tormenta20','onuse');
	}

	/**
	 * Describe whether the ActiveEffect has a temporary duration based on combat turns or rounds.
	 * @type {boolean}
	 */
	get isTemporary() {
		const scene = this.getFlag('tormenta20','durationScene');
		const duration = this.duration.seconds ?? (this.duration.rounds || this.duration.turns) ?? 0;
		return scene || (duration > 0) || this.statuses.size;
	}
	/* --------------------------------------------- */

	/** @inheritdoc */
	apply(actor, change) {
		if ( this.isSuppressed ) return null;
		if ( change.key.match(/\.\?+\./) ) return null;
		if ( change.key.startsWith("flags.tormenta20.") ) change = this._prepareFlagChange(actor, change);
		return super.apply(actor, change);
	}

	/* --------------------------------------------- */

	/**
	 * Prepare derived data related to active effect duration
	 * @internal
	 */
	_prepareDuration() {
		const d = this.duration;
		const isScene = this.getFlag('tormenta20','durationScene');

		// Scene-based duration
		if ( isScene ) {
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
		if ( !data ) return change;

		// Set flag to initial value if it isn't present
		const current = foundry.utils.getProperty(actor, key) ?? null;
		if ( current === null ) {
			let initialValue = null;
			if ( data.placeholder ) initialValue = data.placeholder;
			else if ( data.type === Boolean ) initialValue = false;
			else if ( data.type === Number ) initialValue = 0;
			foundry.utils.setProperty(actor, key, initialValue);
		}
		
		// Coerce change data into the correct type
		if ( data.type === Boolean ) {
			if ( value === "false" ) change.value = false;
			else change.value = Boolean(value);
		} else if ( data.type === Number ) {
			if ( value.startsWith("@") ) {
				let rolldata =  actor.getRollData();
				let numvalue = Roll.replaceFormulaData(value, rolldata);
				change.value = Number(numvalue);
			}
		}
		return change;
	}

	/* --------------------------------------------- */

	/**
	 * Determine whether this Active Effect is suppressed or not.
	 */
	determineSuppression() {
		this.isSuppressed = false;
		if ( this.disabled || (this.parent.documentName !== "Actor") ) return;
		const [parentType, parentId, documentType, documentId, syntheticItem, syntheticItemId] = this.origin?.split(".") ?? [];
		let item;
		// Case 1: This is a linked or sidebar actor
		if ( parentType === "Actor" ) {
			if ( (parentId !== this.parent.id) || (documentType !== "Item") ) return;
			item = this.parent.items.get(documentId);
		}
		// Case 2: This is a synthetic actor on the scene
		else if ( parentType === "Scene" ) {
			if ( (documentId !== this.parent.token?.id) || (syntheticItem !== "Item") ) return;
			item = this.parent.items.get(syntheticItemId);
		}
		if ( !item ) return;
		this.isSuppressed = item.areEffectsSuppressed;
	}

	/* --------------------------------------------- */

	/**
 * Manage Active Effect instances through the Actor Sheet via effect control buttons.
 * @param {MouseEvent} event        The left-click event on the effect control
 * @param {ActorT20|ItemT20} owner  The owning document which manages this effect
 * @returns {Promise|null}          Promise that resolves when the changes are complete.
 */
	static onManageActiveEffect(event, owner) {
		event.preventDefault();
		const a = event.currentTarget;
		const li = a.closest("li");
		const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
		const type = li.dataset.effectType == "onuseTemp" ? "onuse" : li.dataset.effectType;
		const temp = li.dataset.effectType == "onuseTemp" ? true : false;
		switch ( a.dataset.action ) {
			case "create":
			return owner.createEmbeddedDocuments("ActiveEffect", [{
				name:  type=="onuse" ? game.i18n.localize("T20.EffectNewLabel") : owner.name,
				icon: ( type=="onuse" ? "icons/svg/upgrade.svg" :
												owner.documentName == "Item" ? owner.img : "icons/svg/aura.svg"),
				origin: owner.uuid,
				tint: "#FFFFFF",
				flags: { tormenta20: { onuse: type=="onuse", durationScene: temp } },
				"duration.rounds": type === "temporary" || temp ? 1 : undefined,
				"duration.seconds": undefined,
				disabled: ["inactive","onuse"].includes(type)
			}]);
			case "create-status":
				const statusEffect = CONFIG.T20.conditions[a.dataset.statusId];
				if ( !statusEffect ) return false;
				statusEffect.transfer = false;
				return owner.createEmbeddedDocuments("ActiveEffect", [statusEffect]);
			case "edit":
			return effect.sheet.render(true);
			case "delete":
			return effect.delete();
			case "toggle":
			return effect.update({disabled: !effect.disabled});
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
				label: game.i18n.localize("T20.OnUseEffect"),//"Efeitos de Uso",
				effects: []
			},
			onuseTemp: {
				type: "onuseTemp",
				label: game.i18n.localize("T20.OnUseEffectTemporary"),//"Efeitos de Uso Temporários",
				effects: []
			},
			temporary: {
				type: "temporary",
				label: game.i18n.localize("T20.EffectTemporary"),//"Efeitos Temporários",
				effects: []
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("T20.EffectPassive"),//"Efeitos Passivos",
				effects: []
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("T20.EffectInactive"),//"Efeitos Inativos",
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
		for ( let e of effects ) {
			// e.sourceName // Trigger a lookup for the source name
			if ( e.isSuppressed ) categories.suppressed.effects.push(e);
			else if ( e.flags.tormenta20?.onuse && e.isTemporary ) categories.onuseTemp.effects.push(e);
			else if ( e.flags.tormenta20?.onuse ) categories.onuse.effects.push(e);
			else if ( e.disabled ) categories.inactive.effects.push(e);
			else if ( e.isTemporary ) categories.temporary.effects.push(e);
			else categories.passive.effects.push(e);
		}
		
		return categories;
	}
}