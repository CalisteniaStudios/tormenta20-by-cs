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
		// TODO Include cosume os Ammunition, Itens, Money
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
			errors: []
		};

		// Render the ability usage template
		const html = await renderTemplate("systems/tormenta20/templates/apps/ability-use.html", data);

		// Create the Dialog and return data as a Promise
		const icon = item.type === "magia" ? "fas fa-magic" : "fa-fist-raised";
		const label = item.type === "magia" ? "Lançar Magia" : "Usar Habilidade";
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
							resolve(fd.object);
						}
					}
				},
				default: "use",
				close: () => resolve(null)
			});
			if( item.type === "magia" && ( item.actor.getFlag("tormenta20", "createPotion" || game.user.isGM ) ) ) {
				dlg.data.buttons.brew = {
					icon: `<i class="fas fa-flask"></i>`,
					label: "Criar Poção",
					callback: html => {
						const fd = new FormDataExtended(html[0].querySelector("form"));
						fd.dtypes.brew = true;
						resolve(mergeObject(fd.object, {brew: true}));
					}
				}
			}
			dlg.options.width = 600;
			dlg.position.width = 600;
			dlg.render(true);
		});
		
		// TODO
		//applyAprimoramentos( item, configuration );
		//return {};
	}

	/* -------------------------------------------- */
	/*  Apply                                       */
	/* -------------------------------------------- */

	applyAprimoramentos( item, configuration=null ){
		if( !configuration ) return {};
		const C = CONFIG.T20, id = item.system, actor = item.actor;
		const temCusto = id.ativacao.custo > 0;
		const re = {
			faces: /^d\d+$/,
			die: /\d+d\d+[\+|\-]?[\d+]?/,
			split: /(d)|([\+|\-])|(\d+)|(\@\w+)/g,
			perd: /d\*\d+/
		}
		let changes = [], options = {};
		options.aprimoramentos = [];
		options.effects = [];
		let rollMods = id.rolls.reduce(function(acc, r){ 
			acc[r.key] = r.parts.map(i=> ({die:null, dmgStep:0, override:null,
				addDie:0, addNum:0, perDie:0 }) );
			return acc;
		}, {});
		// Aprimoramentos Aplicados
		const aplicados = expandObject(configuration).aprs;
		const aprimoramentos = this.aprimoramentosValidos.filter(ef => aplicados[ef.id]?.aplica );
		
		// Efeitos temporários
		let effectList = this.effects.filter( ef => !ef.flags.tormenta20.onuse && !ef.disabled);
		let optEffectList = this.effects.filter( ef => !ef.flags.tormenta20.onuse && ef.disabled);

		
		[effectList,optEffectList].forEach(function(list){
			list.forEach(function(ef, index){
				changes.push([]);
				ef.changes.forEach(function(ch){
					changes[index].push({
						key: ch.key,
						value: Number(ch.value) || ch.value,
						mode: ch.mode
					});
				});
			});
		});

		
		// FUNÇÃO DE INTERNA
		const applyChanges = (ch,qtd,ef) => {
			const campos = {
				// ARMA
				// pericia:			["rolls.0.parts.1.0", null ],//C.pericias
				// atributoAtq:	["rolls.0.parts.1.1", C.atributos ],
				// atributoDano:	["rolls.1.parts.1.0", C.atributos ],
				// tipoDano:			["rolls.1.parts.1.1", C.damageTypes ],
				criticoM:			["criticoM", null ],
				criticoX:			["criticoX", null ],
				// ARMA / MAGIA / PODER / CONSUMIVEL
				alcance:			["alcance", C.distanceUnits ],
				// MAGIA / PODER / CONSUMIVEL
				alvo:					["alvo", null ],
				area:					["area", null ],
				execucao:			["ativacao.execucao", C.abilityActivationTypes ],
				duracao:			["duracao.value", C.timePeriods ],
				resistencia:	["resistencia.value", null ],
				atributoCD:		["resistencia.atributo", C.atributos ],
				cd:						["resistencia.bonus", null ],
				efeito: 			["efeito", null ],
				// PERICIA
				atributo:			["atributo", null],
				treino:				["treino", null],
				treinado:			["treinado", null]
			}
			const _campos = {};
			// ROLLS ARRAY
			let rolls = id.rolls.filter(r=> (( (ch.key == "roll" && item.type!=="arma") || r.key == ch.key || r.key.match(new RegExp(ch.key)) || ["pericia", "atributoAtq", "atributoDano", "tipoDano", "passos"].includes(ch.key)) ) ); //&& r.parts[0][0].match(re.die)
			ch.key = ch.key.toString();
			for(let r of rolls){
				// CUSTOM CHANGES
				let p = ef._sourceName ? Math.max( rollMods[r.key].findIndex(i=> i.src == ef._sourceName), 0) : 0;
				if( ch.mode == 0 ) {
					if (ch.key.match(/\@([^\#]+)\#/)){
						r.key = ch.key.match(/\@([^\#]+)\#/)[1];
						ch.key = ch.key.split("#")[1];
					}
					// d12 => muda o dado
					if( ch.value.match(re.faces) ){
						rollMods[r.key][p].die = ch.value;
					}
					// kh => adic o modifier
					else if( Die.MODIFIERS[ch.value.replace(/\d+|\>|\<|\+|\-|\=/, "")] && !["min","max"].includes(ch.value) ){
						if( ch.value.match(/k|kh|kl/) ){
							r.parts[p][0] = r.parts[p][0].replace("1d","2d")+ch.value;
						} else r.parts[p][0] = r.parts[p][0]+ch.value;
					}
					// 1d8+1 => muda a quantidade
					else if( ch.value.match(re.die)
								&& (r.parts[p][0].match(re.die) || rollMods[r.key][p].match(re.die)) ){
						let tempAp = [];
						ch.value.match(re.split).forEach(rt => tempAp.push(Number(rt) * qtd||rt));
						if( tempAp[0] ) rollMods[r.key][p].addDie += tempAp[0];
						if( tempAp[4] ) rollMods[r.key][p].addNum += tempAp[4];
					}
					// d*1 => +1 por dado ie.: 2d8+2 > 2d8+2+2
					else if( ch.value.match(re.perd) ){
						rollMods[r.key][p].perDie += Number(ch.value.match(/\d+/)[0]) || 0;
					}
					// Max/Min => Maximiza Minimiza a Rollagem
					else if( ["max","min"].includes(ch.value) ){
						options.minmax = ch.value;
					}
					// passos 1 => aumenta o dano em um passo 
					else if( r.type == "dano" && ch.key=="passos" ){
						if( Number(ch.value) ){
							rollMods[r.key][p].dmgStep += Number(ch.value) * qtd;
						} else {
							try {
								let x = ch.value.replace("@","");
								ch.value = this.getRollData()[x];
								rollMods[r.key][p].dmgStep += Number(ch.value) * qtd;
							} catch (error) {
								
							}
						}
					}
				}
				// MULTIPLY CHANGES
				else if( ch.mode == 1 ) {
					// Only multiply from the same src
					if( rollMods[r.key].find(m=> m.src == ef._sourceName ) ){
						let temp = r.parts.pop();
						r.parts.push([temp[0]*(Number(ch.value)+qtd-1), ""]);
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					// ADD ROLL FROM ITEM
					if (ch.value == "roll"){
						const itr = actor.items.get(ef.origin.split(".")[3])
                              .system.rolls.find(r=>r.type=="dano");//(r=>r.key=="dano0");
						r.parts.push(itr.parts[0]);
					} else {
						r.parts.push([Number(ch.value * qtd) || ch.value,""]);
					}
					if( ef._sourceName ){
						rollMods[r.key].push( { die:null, dmgStep:0, override:null, addDie:0, addNum:0, perDie:0, src: ef._sourceName } );
					}
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ){
					if( r.type=="dano" ){
						if( item.type == "arma" && ch.key == "atributoDano" ) {
							r.parts[1][0] = ch.value.charAt(0) == "@" ? ch.value : `@${ch.value}`;
						} else if( item.type == "arma" && ch.key == "tipoDano" ) {
							r.parts[0][1] = ch.value;
						} else if( ["","-"].includes(ch.value) ) {
							r.parts = [];
						} else if(Number(ch.value) || ch.value.charAt(0) == "@" || ch.value.match(re.die)) {
							rollMods[r.key][p].override = ch.value;
						}
					}
					else if(r.type=="ataque"){
						if( item.type == "arma" && ch.key == "pericia" ) {
							r.parts[1][0] = ch.value;
						} else if( item.type == "arma" && ch.key == "atributoAtq" ) {
							r.parts[1][1] = ch.value;
						}
					}
				}
			}
			// ITEM DATA
			if( campos[ch.key] ){
				// CUSTOM CHANGES
				if( ch.mode == 0 ) i = 1;
				// MULTIPLY CHANGES
				else if( ch.mode == 1 ) {
					if( Number(ch.value) ){
						let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
						if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)* (Number(ch.value)*qtd);
						else if ( temp ) {
							temp.replace(/\d+/, (match) => Number(match)*(Number(ch.value)*qtd) );
						}
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					re.float = /[\d+]?[,]?\d+/;
					if( Number(ch.value) ){
						let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
						if( Number.isNumeric(Number(temp)) ) {
							_campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qtd);
						}
						else if ( temp !== false ) {
							temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qtd) );
						}
					} else if( ch.value.match(re.float) && ch.key == "area" ){
						let n1 = id.area.match(re.float)[0].replace(",",".");
						let n2 = ch.value.toString().match(re.float)[0].replace(",",".");
						let n3 = Number(n1) + ( Number(n2) * qtd ) + "";
						_campos[ch.key] = id.area.replace(n1.replace(".",",") , n3);
					}
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ) {
					if( campos[ch.key][1] ) {
						_campos[campos[ch.key][0]] = ItemT20.itemKey( ch.value , campos[ch.key][1]);
					} else _campos[campos[ch.key][0]] = ch.value;
				}
				// TODO test
				foundry.utils.mergeObject(id, expandObject(_campos));
			}
			
			// ACTOR DATA
			// TODO

			// ACTIVE EFFECT
			// include effect from the item
			if( ch.key === "efeito"){
				let tef = optEffectList.find(ef => ef.label === ch.value );
				if ( tef ) effectList.push(tef);
			}
			// include condition
			else if( ch.key === "condicao"){
				let tef = T20Conditions[ch.value.toLowerCase().trim()];
				if ( tef ) effectList.push(new ActiveEffect(tef));
				// if ( tef ) effectList.push(ActiveEffect.create(tef));
			}
		}
		
		aprimoramentos.sort((a,b)=> (
			(a.changes.some(ch=>ch.mode == 5) && !b.changes.some(ch=>ch.mode == 5)) ? -1 : (b.changes.some(ch=>ch.mode == 5) && !a.changes.some(ch=>ch.mode == 5)) ? 1 : 0 
			)
		);
		aprimoramentos.forEach(function(ef){
			// Prepare chat content;
			let ap = {};
			ap.description = item.type !== "arma"? ef.label : ( item.id == ef.parent.id ? `${ef.parent.name} - ${ef.label}` : ef._sourceName );
			ap.custo = Number(aplicados[ef.id]?.custo) * aplicados[ef.id]?.aplica || aplicados[ef.id]?.custo;
			ap.qtd = Number(aplicados[ef.id]?.aplica) || 1;
			if( options.aprimoramentos.find(i=> i.description == ap.description ) ){
				let apl =  options.aprimoramentos.find(i=> i.description == ap.description );
				apl.custo += ap.custo || 0;
				apl.qtd += ap.qtd-1 || 0;
			} else {
				options.aprimoramentos.push(ap);
			}
			
			id.ativacao.custo += Number(ap.custo) || 0;
			if( !Number(aplicados[ef.id]?.custo+1) && item.type == "magia" ) options.truque = true;
			
			ef.changes.forEach(function(ch){
				
				applyChanges(ch, ap.qtd, ef);

				if( ch.key.match(/^(data|system)./) ){
					changes.forEach(function(efch){
						if( !ef.flags.tormenta20.aumenta || ( ef.flags.tormenta20.aumenta && efch.map(i => i.key).includes(ch.key) ) ) {
							if( ch.key == "system.tamanho" && efch.findIndex(i => i.key=="system.tamanho")){
								efch.splice(efch.findIndex(i => i.key=="system.tamanho"),1);
							}
							efch.push({
								key: ch.key,
								value: Number(ch.value * ap.qtd)  || ch.value,
								mode: ch.mode
							});
						}
					});
				}
			});

		});
		
		// Prepare data from the item to update labels
		item.prepareDerivedData();
		// Apply the modifications to the rolls data
		id.rolls = this.applyRollChanges(rollMods);
		if ( temCusto ) Math.min(id.ativacao.custo || 1);
		// 
		effectList.forEach(function(ef, index){
			let tempEffect = new ActiveEffect({
				label: ef.label ?? this.name,
				icon: ef.icon ?? this.img,
				origin: ef.origin ?? undefined,
				flags: mergeObject(ef.flags, { temp: true }),
				duration: ef.duration ?? undefined,
				disabled: false,
				changes: changes[index] ?? ef.changes
			});
			tempEffect.changes = tempEffect.changes.filter(ch => ch.key.match(/^data./i));
			let efl = ef.label.slugify().replace("-","");
			if(T20Conditions[efl]){
				tempEffect = new ActiveEffect(T20Conditions[efl]);
			}
			options.effects.push(tempEffect);
		});

		return options;
	}

	/* -------------------------------------------- */

	/** 
	 * Realiza as modificações nas formulas de rolagens como alteração de dado, adição de dados
	 * e bônus e aumento de passo;
	 * @param {Object} rollMods   Objeto com os valores a serem modificados;
	 */
	/* MIGRATE TO ACTIVE EFFECTS */
	applyRollChanges(rollMods){
		let rolls = this.system.rolls;
		let roll;
		for ( let r of rolls ){
			for ( let [i, p] of r.parts.entries() ){
				let dano = p[0] //r.parts[rollMods][0];
				if( rollMods[r.key][i]?.override == "" ){
					r.parts[i] = [];
					continue;
				} else if ( rollMods[r.key][i]?.override ){
					dano = rollMods[r.key][i].override;
				}
		
				if ( typeof rollMods[r.key][i]?.die === "string" ) {
					dano = dano.replace(/d\d+/, rollMods[r.key][i].die);
				}
		
				if ( rollMods[r.key][i]?.dmgStep ) {
					let indx = -1;
					let adic = dano.search(/[\+\-]/);
					let danoBase = dano.slice(0,adic);
					let danoAdic = dano.slice(adic);
					if( CONFIG.T20.passosDano[danoBase] && CONFIG.T20.passosDano[danoBase] !== -1 ){
						indx = CONFIG.T20.passosDano[danoBase].indexOf(danoBase);
						dano = CONFIG.T20.passosDano[danoBase][indx+rollMods[r.key][i].dmgStep] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr1.indexOf(danoBase)){
						indx = CONFIG.T20.passosDano.arr1.indexOf(danoBase);
						dano = CONFIG.T20.passosDano.arr1[indx+rollMods[r.key][i].passo] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr2.indexOf(danoBase)){
						indx = CONFIG.T20.passosDano.arr2.indexOf(danoBase);
						dano = CONFIG.T20.passosDano.arr2[indx+rollMods[r.key][i].passo] || "4d12";
					}
					if( indx == -1 && CONFIG.T20.passosDano.arr3.indexOf(danoBase)){
						indx = CONFIG.T20.passosDano.arr3.indexOf(danoBase);
						dano = CONFIG.T20.passosDano.arr3[indx+rollMods[r.key][i].passo] || "4d12";
					}
					dano = dano + danoAdic;
				}
			
				if ( rollMods[r.key][i]?.addDie ){
					dano = new Roll(dano).alter(1, rollMods[r.key][i].addDie).formula;
				}
		
				if ( rollMods[r.key][i]?.addNum ) {
					roll = new Roll(dano);
					if ( roll.terms[2] ) roll.terms[2].number += rollMods[r.key][i].addNum;
					else roll = new Roll( dano + "+" + rollMods[r.key][i].addNum ) || roll;
					dano = roll.formula;
				}
				
				if ( rollMods[r.key][i]?.perDie ) {
					let pd = parseInt(dano.match(/\d+d/ )[0]) * Number(rollMods[r.key][i].perDie) || 0;
					if ( pd ) dano = `${dano} + ${pd}`;
				}
				r.parts[i][0] = dano;
			}
		}
		return rolls;
	}

	/* -------------------------------------------- */
	/*  Helpers                                     */
	/* -------------------------------------------- */

	// _ApplyItemChange(){
	// }

 }
