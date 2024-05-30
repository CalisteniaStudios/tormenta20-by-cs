import ActorT20 from "../documents/actor.mjs";
import {applyOnUseEffects} from "./ability-use.mjs";
/**
 * A specialized Dialog subclass for ability usage
 * @type {Dialog}
 */
export default class AbilityUseDialog extends Dialog {
	constructor(item, dialogData={}, options={}) {
		super(dialogData, options);
		this.options.classes = ["tormenta20", "ability-use-form"];

		/**
		 * Store a reference to the Item document being used
		 * @type {ItemT20}
		 */
		this.item = item;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Add controles para números
		html.find('.numCtrl').click(this.numberControl.bind(this));
	}

	numberControl(ev){
		ev.preventDefault();
		let target;
		if ( ev.target.tagName == "I" ) {
			target = $(ev.target).parent('.numCtrl');
		} else {
			target = ev.target;
		}
		let campo = $(target).siblings('.numInp')[0];
		if($(target).val() === "+"){
			campo.value =  parseInt(campo.value) + parseInt($(campo).prop('step'));
		} else if($(target).val() === "-"){
			campo.value = parseInt(campo.value) - parseInt($(campo).prop('step'));
		}
	}

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/**
	 * A constructor function which displays the Spell Cast Dialog app for a given Actor and Item.
	 * Returns a Promise which resolves to the dialog FormData once the workflow has been completed.
	 * @param {ItemT20} item
	 * @return {Promise}
	 */
	 static async create(item) {
		if ( !item.isOwned ) ui.notifications.error(game.i18n.localize("T20.ActionWarningItemNotOwned"));
		// Prepare data
		const actorData = item.actor.system;
		const itemData = item.system;
		const pmCost = itemData?.custo > 0 ? true : false;
		let aprimoramentos = [];
		let apdeap = {};
		
		function filterAE( ae , keys=[] , tags=[] ){
			const name = item.name;
			let items = ae.getFlag('tormenta20','items');
			items = items ? items.split(';').map( i => i.trim()) : [];
			if ( !foundry.utils.isEmpty(items) && !items.includes(name) ) return false;
			for ( let k of keys ){
				if ( !ae.flags?.tormenta20 || !ae.flags?.tormenta20[k] ) return false;
			}
			return true;
		}
		
		const relate = {
			atributo:'ability', pericia:'skill',
			arma:'attack', magia:'spell',
			poder:'power', consumivel:'consumable',
			equipamento:'equipment'
		}
		let utype = '';
		switch (item.type){
			case "atributo":
			case "pericia":
				utype = relate[item.type];
				aprimoramentos = [
					...item.actor.effects.filter(ae => filterAE( ae , ['onuse', utype]) ),
				];
				item.validOnUseEffects = aprimoramentos;
				break;
			case "arma":
			case "magia":
			case "poder":
			case "equipamento":
			case "consumivel":
				utype = relate[item.type];
				aprimoramentos = [
					...item.effects.filter(ae => filterAE( ae , ['onuse', 'self']) ),
					...item.actor.effects.filter(ae => filterAE( ae , ['onuse', utype]) ),
				];
				break;
		}

		// TODO Check if Actor have sufficient MP
		// TODO Include consume os Ammunition, Itens, Money?
		// TODO Include measured templates placement
		// Prepare dialog form data
		const data = {
			item: itemData,
			title: game.i18n.format("T20.AbilityUseHint", item),
			note: "",
			custo: itemData?.custo ?? null,
			formula: (["arma", "poder", "pericia", "magia", "atributo", "consumivel"].includes(item.type)),
			formuladano: (["arma", "poder", "magia", "consumivel","equipamento"].includes(item.type)),
			itype: item.type,
			consumeMP: pmCost,
			aprimoramentos: aprimoramentos,
			rollMode: game.settings.get("core", "rollMode"),
			rollModes: CONFIG.Dice.rollModes,
			rollKeeping: (event.altKey ? "khd20" : (event.ctrlKey ? "kld20" : "")),
			rollKeep: {"khd20":"Melhor de 2d20","kld20":"Pior de 2d20"},
			errors: []
		};

		// Render the ability usage template
		const html = await renderTemplate("systems/tormenta20/templates/apps/ability-use.html", data);

		// Create the Dialog and return data as a Promise
		const icon = item.type === "magia" ? "fas fa-magic" : "fa-fist-raised";
		const label = item.type === "magia" ? game.i18n.localize('T20.AbilityUseCast') : game.i18n.localize('T20.AbilityUseUse');
		
		
		
		
		return await new Promise((resolve) => {
			const dlg = new this(item, {
				title: game.i18n.format('T20.AbilityUseHint', {name:item.name, type:item.type}),
				content: html,
				buttons: {
					use: {
						icon: `<i class="fas ${icon}"></i>`,
						label: label,
						callback: html => {
							const fd = new FormDataExtended(html[0].querySelector("form"));
							let op = applyOnUseEffects( item, fd.object );
							resolve( foundry.utils.mergeObject( fd.object, op ) );
						}
					}
				},
				default: "use",
				close: () => resolve(null)
			});
			if( item.type === "magia" && ( item.actor.getFlag("tormenta20", "createPotion" || game.user.isGM ) ) ) {
				dlg.data.buttons.brew = {
					icon: `<i class="fas fa-flask"></i>`,
					label: game.i18n.localize('T20.BrewPotion'),
					callback: html => {
						const fd = new FormDataExtended(html[0].querySelector("form"));
						fd.object.brew = true;
						let op = applyOnUseEffects( item, fd.object );
						resolve( foundry.utils.mergeObject( fd.object, op ) );
					}
				}
			}
			dlg.options.width = 600;
			dlg.position.width = 600;
			dlg.render(true);
		});
	}
}
