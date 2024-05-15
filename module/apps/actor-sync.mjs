import ActorT20 from "../documents/actor.mjs"; 

/**
 * Class designed to manage updates on actor items, according to their compendium entry.
 * @extends DocumentSheet
 * 
 */

export default class ActorSync extends DocumentSheet {
	constructor(actor, options) {
		if ( !(actor instanceof ActorT20) ){
			throw new Error("ActorSync may only be use for actors.");
		}
		super(actor, options);
		this.actor = actor;
	}

	/* -------------------------------------------- */

	/** @override */
	static documentType = "actor";

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: `systems/tormenta20/templates/apps/actor-sync.hbs`,
			width: 700,
			height: 700,
			tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "usage"}]
		});
	}

	/* -------------------------------------------- */

	/** @override */
	get title() {
		return `${game.i18n.localize("T20.ActorSync")} - ${this.actor.name}`;
	}

	/* -------------------------------------------- */
	
	/** @override */
	async getData(options) {
		return {
			actor: this.actor.toObject(), // Configure source data
			editable: this.isEditable,
			categorys: await this.#prepareItens(),
		}
	}

	/* -------------------------------------------- */

	/**
	 * Prepare embbeded items
	 * @returns {{uuid: string, sourceId: string, status: string}[]}
	 */
	async #prepareItens() {
		const itemTypes = {
			"arma": [],
			"classe": [],
			"consumivel": [],
			"equipamento": [],
			"magia": [],
			"poder": [],
			"tesouro": [],
		}

		for (const item of this.actor.items) {
			let status = {};
			status.uuid = await TextEditor.enrichHTML(`@UUID[${item.uuid}]{${item.name}}`, {
				relativeTo: this.actor, secrets: this.actor.isOwner, async: true
			});
			const srcItem = await fromUuid( item.getFlag('core','sourceId') );
			
			console.groupCollapsed(`Item: ${item.name}`);
			if ( !(item.type in itemTypes) ) itemTypes[item.type] = [];
			if ( srcItem ) {
				status.sourceId = await TextEditor.enrichHTML(`@UUID[${srcItem.uuid}]{${srcItem.name}}`, {
					relativeTo: this.actor, secrets: this.actor.isOwner, async: true
				});
				
				let _item = item.toObject();
				let _source = srcItem.toObject();
				let ignore = {
					system: [],
					flags: [],
				}
				switch (item.type) {
					case 'classe':
						ignore.system = ['niveis','inicial']
						break;
						
					default:
						break;
				}
				
				ignore.system = Object.fromEntries(ignore.system.map(k=> [`-=${k}`, null]));
				ignore.flags = Object.fromEntries(ignore.flags.map(k=> [`-=${k}`, null]));

				_item.system = foundry.utils.mergeObject(_item.system, ignore.system, {performDeletions: true});
				_item.system = foundry.utils.flattenObject(_item.system);
				_source.system = foundry.utils.mergeObject(_source.system, ignore.system, {performDeletions: true});
				_source.system = foundry.utils.flattenObject(_source.system);
				_item.flags.tormenta20 = foundry.utils.mergeObject(_item.flags.tormenta20 ?? {}, ignore.flags, {performDeletions: true});
				_source.flags.tormenta20 = foundry.utils.mergeObject(_source.flags.tormenta20 ?? {}, ignore.flags, {performDeletions: true});
				
				status.name = _item.name == _source.name;
				status.name_diff = status.name ? null : _source.name;
				status.flags_diff = this.#listDiff(_item.flags.tormenta20, _source.flags.tormenta20);
				status.flags = (status.flags_diff === '' );
				status.system_diff = this.#listDiff(_item.system, _source.system);
				status.system = (status.system_diff === '' );
				status.effects_diff = this.#listDiff(_item.effects, _source.effects);
				status.effects = (status.effects_diff === '' );
			} else {
				status.sourceId = "Não encontrado";
			}
			itemTypes[item.type].push(status);
			console.log(item);
			console.log(srcItem);
			console.groupEnd();
		}
		console.log(itemTypes);
		return itemTypes;
	}

	/* -------------------------------------------- */
	
	#listDiff(obj1, obj2) {
		let diff = foundry.utils.diffObject(obj1 ?? {}, obj2 ?? {});
		if ( foundry.utils.isEmpty(diff) ) return '';
		return Object.entries(diff).map( e => `<span>${e.join(' => ')}</span>` ).join( `<br>` );
	}

	/* -------------------------------------------- */

	/** @override */
	_getSubmitData(updateData) {
		const formData = foundry.utils.expandObject(super._getSubmitData(updateData));
		
		return formData;
	}

	/* -------------------------------------------- */

	// /** @override */
	// async _updateObject(event, formData) {
	// 	try {
	// 		this.action.updateSource(formData);
	// 	} catch(err) {
	// 		return ui.notifications.error(`Invalid Action update: ${err.message}`);
	// 	}
	// 	const actions = this.object.toObject().system.actions;
	// 	actions.findSplice(a => a.id === this.action.id, this.action.toObject());
	// 	return this.object.update({"system.actions": actions}, {diff: false});
	// }
}