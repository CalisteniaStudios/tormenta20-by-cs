import {applyOnUseEffects} from "./ability-use.js";
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
		let target = $(ev.target).parent('.numCtrl') ?? ev.target;
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
		if ( !item.isOwned ) throw new Error("Um item precisa pertencer a um personagem para ser usado.");

		// Prepare data
		const actorData = item.actor.system;
		const itemData = item.system;
		const pmCost = itemData?.custo > 0 ? true : false;
		let aprimoramentos = [];
		let apdeap = {};
		
		function filterAE( ae , keys=[] , tags=[] ){
			for ( let k of keys ){
				if ( !ae.flags?.tormenta20 || !ae.flags?.tormenta20[k] ) return false;
			}
			return true;
		}
		// filterAE( ae , ['onuse', 'attack'])
		const relate = {
			atributo:'ability', pericia:'skill',
			arma:'attack', magia:'spell',
			poder:'power', consumivel:'consumable',
		}
		let utype = '';
		switch (item.type){
			case "atributo":
			case "pericia":
				utype = relate[item.type];
				aprimoramentos = [
					...item.actor.effects.filter(ae => filterAE( ae , ['onuse', utype]) ),
				];
				break;
			case "arma":
			case "magia":
			case "poder":
			case "consumivel":
				utype = relate[item.type];
				aprimoramentos = [
					...item.actor.effects.filter(ae => filterAE( ae , ['onuse', utype]) ),
					...item.effects.filter(ae => filterAE( ae , ['onuse', 'self']) )
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
			formuladano: item.type === "arma",
			itype: item.type,
			consumeMP: pmCost,
			aprimoramentos: aprimoramentos,
			rollMode: game.settings.get("core", "rollMode"),
			rollModes: CONFIG.Dice.rollModes,
			errors: []
		};

		// Render the ability usage template
		const html = await renderTemplate("systems/tormenta20/templates/apps/ability-use.html", data);

		// Create the Dialog and return data as a Promise
		const icon = item.type === "magia" ? "fas fa-magic" : "fa-fist-raised";
		const label = item.type === "magia" ? "Lançar Magia" : "Usar Habilidade";
		// return new Promise((resolve) => {
		return await new Promise((resolve) => {
			const dlg = new this(item, {
				title: `Uso de ${item.type}: ${item.name}`,
				content: html,
				buttons: {
					use: {
						icon: `<i class="fas ${icon}"></i>`,
						label: label,
						callback: html => {
							const fd = new FormDataExtended(html[0].querySelector("form"));
							
							let op = applyOnUseEffects( item, fd.object );
							console.log( op );
							console.log( fd.object );
							resolve( mergeObject( fd.object, op ) );
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
						fd.dtypes.brew = true;
						let op = applyOnUseEffects( item, fd.object );
						console.log( op );
						console.log( fd.object );
						resolve( mergeObject( fd.object, op ) );
					}
				}
			}
			dlg.options.width = 600;
			dlg.position.width = 600;
			dlg.render(true);
		});
	}
}
