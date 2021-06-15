/**
 * A specialized Dialog subclass for ability usage
 * @type {Dialog}
 */
export default class AbilityUseDialog extends Dialog {
	constructor(item, dialogData={}, options={}) {
		super(dialogData, options);
		this.options.classes = ["tormenta20", "dialog"];

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
		let campo = $(ev.target).siblings('.numInp')[0];
		if($(ev.target).val() === "+"){
			campo.value =  parseInt(campo.value) + parseInt($(campo).prop('step'));
		} else if($(ev.target).val() === "-"){
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
		const actorData = item.actor.data.data;
		const itemData = item.data.data;
		const pmCost = item.data.data?.custo > 0 ? true : false;
		// let aprimoramentos = itemData?.aprimoramentos ?? [];
		let aprimoramentos = [];
		let apdeap = {};
		const group = {
			arma: ["attack","attackm","attackr","damage","damagem","damager","skill","skills"],
			magia: ["spells"],
			poder: ["power"],
			pericia: ["skill","skills"],
			atributo: ["abilities","ability"],
			consumivel: ["consumable"]
		}
		// let gap = [];
		// item.actor.items.forEach(function(it){
		// 	it.data.data.aprimoramentos?.forEach(function(ap){
		// 		if(group[item.type].includes(ap.objeto)) aprimoramentos.push(ap);
		// 	})
		// });
		// console.log(item.actor);
		
		switch (item.type){
			case "arma":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && (ae.data.flags.tormenta20.attack ) );
				aprimoramentos = aprimoramentos.concat(item.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.self )));
				// add self  || ae.data.flags.tormenta20.self
				
				aprimoramentos.forEach(function(ap){
					let iid = ap.data.origin.split(".")[3] || "";
					if(item.id && iid && item.id != iid){
						apdeap[iid] = item.actor.items.get(iid).effects.filter(ownit => ownit.data.flags.tormenta20.onuse && ownit.data.flags.tormenta20.self);
					}
				});
				break;
			case "atributo":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && ae.data.flags.tormenta20.ability );

				break;
			case "pericia":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && ae.data.flags.tormenta20.skill );
				break;
			case "magia":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.spell ));
				aprimoramentos = aprimoramentos.concat(item.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.self )));
				break;
			case "poder":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.power ) );
				aprimoramentos = aprimoramentos.concat(item.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.self )));
				break;
			case "consumivel":
				aprimoramentos = item.actor.effects.filter(ae => ae.data.flags.tormenta20.onuse && ( ae.data.flags.tormenta20.consumable ) );
				break;
		}

		// TODO Check if Actor have sufficient MP
		// TODO Include cosume os Ammunition, Itens, Money
		// TODO Include measured templates placement
		// Prepare dialog form data
		const data = {
			item: item.data,
			title: game.i18n.format("T20.AbilityUseHint", item.data),
			note: "",
			custo: itemData?.custo ?? null,
			formula: (["arma", "poder", "pericia", "magia", "atributo", "consumivel"].includes(item.type)),
			formuladano: item.type === "arma",
			itype: item.type,
			consumeMP: pmCost,
			aprimoramentos: aprimoramentos,
			errors: []
		};
		// if ( item.data.type === "spell" ) this._getSpellData(actorData, itemData, data);

		// Render the ability usage template
		const html = await renderTemplate("systems/tormenta20/templates/apps/ability-use.html", data);

		// Create the Dialog and return data as a Promise
		const icon = item.type === "magia" ? "fas fa-magic" : "fa-fist-raised";
		const label = item.type === "magia" ? "Conjurar Magia" : "Usar Habilidade";
		return new Promise((resolve) => {
			const dlg = new this(item, {
				title: `Uso de ${item.type}: ${item.name}`,
				content: html,
				buttons: {
					use: {
						icon: `<i class="fas ${icon}"></i>`,
						label: label,
						callback: html => {
							const fd = new FormDataExtended(html[0].querySelector("form"));
							resolve(fd.toObject());
						}
					}
				},
				default: "use",
				close: () => resolve(null)
			});
			if( item.type === "magia" ) {
				dlg.data.buttons.brew = {
					icon: `<i class="fas fa-flask"></i>`,
					label: "Criar Poção",
					callback: html => {
						const fd = new FormDataExtended(html[0].querySelector("form"));
						fd.dtypes.brew = true;
						resolve(mergeObject(fd.toObject(), {brew: true}));
					}
				}
			}
			dlg.options.width = 600;
			dlg.position.width = 600;
			dlg.render(true);
		});
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	/**
	 * Get the ability usage note that is displayed
	 * @private
	 */
	 static _getAbilityUseNote(item, uses, recharge) {

		return ""
		
	 }

	 /* -------------------------------------------- */

	 static _handleSubmit(formData, item) {

	 }
 }
