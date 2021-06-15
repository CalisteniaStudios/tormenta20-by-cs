	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateEmbeddedDocuments(embeddedName, result, options, userId){
		
		// Manage condition stacking and dependencies
		// if(embeddedName == "ActiveEffect" && result.some(doc => doc.flags.core.statusId )){
		// 	let toRemove = [];
		// 	for ( let doc of result ) {
		// 		if( !doc.flags.core?.statusId ) continue;
		// 		let stack = doc.flags?.tormenta20?.stack || false;
		// 		let hasEffect = this.effects.find(ef => ef.data.flags?.core?.statusId == doc.flags.core.statusId);
		// 		console.error(stack);
		// 		console.error(hasEffect);
		// 		if( stack && hasEffect ){
		// 			let newCond = mergeObject(T20Conditions[stack], doc, {overwrite:false} );
		// 			// console.log(doc);
		// 			// console.log(newCond);
		// 			result.push(newCond);
		// 		}
		// 		if( hasEffect ) result.splice(doc, 1);
		// 		let children = doc.flags?.tormenta20?.childEffect;
		// 		if( children ) {
		// 			console.log(children);
		// 			children.map(i => result.push(T20Conditions[i]));
		// 		}
		// 	}
			
		// 	console.log(result);
		// 	await super.createEmbeddedDocuments(embeddedName, result);
		// } else {
		// }
		await super._preCreateEmbeddedDocuments(embeddedName, result, options, userId);
	}

	/** @inheritdoc */
	async _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId){
		await super._onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId);
		// Manage condition stacking and dependencies
		// if(embeddedName == "ActiveEffect" && result.some(doc => doc.flags.core.statusId )){
		// 	let toRemove = [];
		// 	for ( let doc of result ) {
		// 		if( !doc.flags.core?.statusId ) continue;
		// 		let stack = doc.flags?.tormenta20?.stack || false;
		// 		let hasEffect = this.effects.filter(ef => ef.data.flags?.core?.statusId == doc.flags.core.statusId);
		// 		if(stack && hasEffect.length > 1){
		// 			toRemove.push(hasEffect[0].id);
		// 		}
		// 	}
		// 	if( toRemove ){
		// 		console.log(toRemove);
		// 		await super.deleteEmbeddedDocuments(embeddedName, toRemove);
		// 	}
		// }
		// console.log(documents);
		// console.log(result);
	}

	/** @override */
	/*
	*	Methods for precreate owned item
	*/
	/** @override */
	/**/
	async createEmbeddedDocuments(embeddedName, data, context={}) {
		let isCondition = false;
		if(embeddedName === "ActiveEffect"){
			console.log(data);
			isCondition = data.filter(e=> e.flags?.core?.statusId && !e.flags?.core?.statusId.match(/combat-utility-belt/) );
			// data.some(e=> e.flags?.core?.statusId);
			// condicoes = 
			// if( isCondition && flattenObject(data)["flags.core.statusId"].match(/combat-utility-belt/) ){
			// 	isCondition = false;
			// }
		}
		if (isCondition) {
			await this.createCondition(isCondition, context);
		}
		// Standard embedded entity creation
		else  super.createEmbeddedDocuments(embeddedName, data, context);
	}
	/**/

	/**
	* Manage condition applying rules;
	* 
	* @param {Array} data					Array of ActiveEffect data;
	* @param {Object} options			Additional context which customizes the creation workflow
	*/
	async createCondition(data, options={}){
		let conditions = this.effects.filter(ef => ef.getFlag('core','statusId'));
		for( let condi of data ){
			let exist = conditions.find(ef => ef.getFlag('core','statusId') == condi.flags.core.statusId);
			let stack = condi.flags?.tormenta20?.stack || false;
			if(exist){
				condi = null;
				if(stack){
					await this.deleteEmbeddedDocuments("ActiveEffect", [exist.id]);
					data.push(T20Conditions[stack]);
				}
			} else {
				let children = condi.flags?.tormenta20?.childEffect;
				if( children ) {
					children.map(i => data.push(T20Conditions[i]));
				}
			}
		}
		if( data.length ){
			await super.createEmbeddedDocuments("ActiveEffect", data, options);
		}
	}

	/* -------------------------------------------- */

	async deleteEmbeddedDocuments(embeddedName, ids, context={}){
		const isCondition = false ;
		console.error("deleteEmbeddedDocuments");
		if ( embeddedName === "ActiveEffect"){
			// && this.effects.get(itemData)?.data?.flags?.core?.statusId ) ? true : false;
			isCondition = this.effects.filter(ef => ef.getFlag('core','statusId') && id.includes(ef.id) );
		}
		if ( isCondition ) await this.deleteCondition( isCondition, context );
		// Standard embedded entity creation
		else  super.deleteEmbeddedDocuments(embeddedName, ids, context);
	}

	/**
	* Manage condition removing rules;
	* @deprecated now is item.delete()
	* @param {Object} itemData			StatusEffect id
	*/
	/**/
	async deleteCondition(data, context={}){
		// let ids = [];
		// // get all child conditions this actor show have ie [weak, shaken, weak, prone]
		// let conditions = this.effects.filter(ef => ef.getFlag('core','statusId'));
		// // && ef.getFlag('tormenta20','childEffect'));
		// for ( let condi of data ) {
		// 	ids.push( condi.id );
		// 	let children = condi.getFlag('tormenta20', 'childEffect');
		// 	// data.flags.tormenta20?.childEffect;
		// 	if( children ){
		// 		conditions.find(ef => )
		// 	}
		// }
		let childrenConditions = [];
		// const conditions = this.effects.filter(function(ef){
		const conditions = data.filter(function(ef){
			// if(ef.getFlag('core','statusId')){
				if(ef.getFlag('tormenta20', 'childEffect')){
					childrenConditions = childrenConditions.concat(ef.getFlag('tormenta20', 'childEffect'));
				}
				return ef;
			// }
		});
		let ids = data.map(i=> i.id);
		console.log(data);
		console.log(conditions);
		console.log(childrenConditions);
		console.log(ids);
		// this condition children to be removed ie [weak]
		// const condition = conditions.find(c=> c.id === itemData);
		// let ids = [condition.id];
		// if(condition){
		// 	let ar = condition.data.flags.t20?.childEffect ?? [];
		// 	for(let i=0; i < ar.length; i++){
		// 		let child = conditions.find(c=> c.data.flags.core?.statusId === ar[i]);
		// 		if(child){
		// 			let amount = childrenConditions.filter(c=> c===child.data.flags.core.statusId).length;
		// 			if(amount == 1) ids.push(child.id);
		// 			if(child.data.flags.t20?.childEffect){
		// 				child.data.flags.t20?.childEffect.forEach(ch=>ar.push(ch));
		// 			}
		// 		}
		// 	}
		// }
		// await super.deleteEmbeddedEntity("ActiveEffect", ids, options);
	}
	/**/


	
	getArmaData(id, actorData, configuration=null){
		let options = {};
		const rollData = this.getRollData();
		let ret = {
			atqparts:[],
			dmgparts:[],
			custo:0,
			aprimoramentos: []
		}
		let passos = 0;
		let aplicados = {};

		/*		APRIMORAMENTOS		*/
		if( configuration ) {
			let aplica = [].concat(configuration?.aplica) ?? [];
			let ids = [].concat(configuration?.id) ?? [];
			
			const ae = this.actor.effects.filter(ef=> ids.includes(ef.id));
			aplica.forEach(function(ap, ind){
				if(ap && ap !== "0"){
					aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
				}
			});
			const actor = this.actor;
			let aprimoramentos = this.effects.filter(ef => Object.keys(aplicados).includes(ef.id) );
			let sae = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
			aprimoramentos = aprimoramentos.concat(sae);
			let mods = {};
			let camposarma = ["criticoM","criticoX","tipo","alcance"]
			let _campos = {};
			aprimoramentos.forEach(function(ef){
				if( !mods[ef.sourceName] ) mods[ef.sourceName] = {ataque:[],dano:""};
				if( Number(ef.data.flags.tormenta20.custo) ) ret.custo += Number(ef.data.flags.tormenta20.custo) * aplicados[ef.id];
				let ap = {
					description: ef._sourceName,
					
				}
				let flavor = ef.parent.items.get(ef.data.origin.split(".")[3]).data.data.chatFlavor || false;
				if(flavor) options.chatFlavor = flavor;
				if (Number(ef.data.flags.tormenta20.custo)) ap.custo = ef.data.flags.tormenta20.custo * aplicados[ef.id];
				if (ret.aprimoramentos.find(i=>i.description == ef._sourceName)) {
					ret.aprimoramentos.map(function(i){if(i.description == ef._sourceName) i.custo += ap.custo});
				} else {
					ret.aprimoramentos.push(ap);
				}
				ef.data.changes.forEach(function(ch){
					let key = ch.key;
					let mode = ch.mode;
					let value = ch.value;
					let sourceName = ef.sourceName;
					if (ch.key.match(/\@([^\#]+)\#/)){
						sourceName = ch.key.match(/\@([^\#]+)\#/)[1];
						key = ch.key.split("#")[1];
						if( !mods[sourceName] ) mods[sourceName] = {ataque:[],dano:""};
					}
					if(camposarma.includes(key)){
						if(mode === 2) _campos[key] = Number(id[key]) + Number(value) || id[key];
						if(mode === 5) _campos[key] = value;
					} else if(["$ataque","ataque"].includes(key)){
						// if(mode === 1 && Number(value)) mods[sourceName].ataque = mods[sourceName].ataque * (Number(value) * aplicados[ef.id]);
						if(mode === 1 && Number(value)) mods[sourceName].ataque = mods[sourceName].ataque.map(n => Number(n) * (Number(value) + aplicados[ef.id]-1) || n);
						if(mode === 2) mods[sourceName].ataque.push(Number(value) * aplicados[ef.id] || value);
						if(mode === 5) mods[sourceName].ataque = [value];
					} else if(["$dano","dano"].includes(key)){
						// custom 1d8 > mods[].aumentadado = X * qtd
						if(mode === 0 && value.match(/\d+d\d+/)){
							let tempAp = [];
							if ( !mods[sourceName].aumentaDado ) mods[sourceName].aumentaDado = 0;
							if ( !mods[sourceName].aumentaNum ) mods[sourceName].aumentaNum = 0;
							
							value.match(/(\d+^[d])|(d)|(^[d]\d+)|([\+|\-])|(\d+)|(\@\w+)/g).forEach(rt => tempAp.push(Number(rt) * aplicados[ef.id]||rt));
							if( tempAp[0] ) mods[sourceName].aumentaDado += tempAp[0];
							if( tempAp[4] ) mods[sourceName].aumentaNum += tempAp[4];
						}
						// custom d12 > mods[].dado = d8
						if(mode === 0 && value.match(/^d\d+$/)) mods[sourceName].dado = value; 
						if ( mode === 0 && ["max","min"].includes(ch.value.toLowerCase().trim()) ){ //make min/max
							options.minmax = ch.value.toLowerCase().trim();
						}
						// adcion 1d8 > mods[sourceName].dano = 1d8
						if(mode === 1 && ( Number(value) )) mods[sourceName].dano = mods[sourceName].dano * (Number(value) + aplicados[ef.id] -1);
						if(mode === 2 && ( Number(value) || value.match(/\d+d\d+|@\w+/))) mods[sourceName].dano = Number(value) * aplicados[ef.id] || value;
						if(mode === 2 && (!Number(value) && value.match(/roll/))) {
							let tempIt = actor.items.get(ef.data.origin.split(".")[3]).data.data;
							mods[sourceName].dano = tempIt.roll ?? tempIt.efeito ?? tempIt.formula;
						}
						// subst 1d6 > mods[sourceName].dano = 1d6
						if(mode === 5 && value.match(/\d+d\d+/)) mods[sourceName].override = value; 
					} else if(["$passos","passos"].includes(key)){
						if(mode === 2) passos += Number(value) * aplicados[ef.id];
					}

				});

			});
			for (var i = 0; i < Object.keys(mods).length; i++) {
				let m = mods[Object.keys(mods)[i]];
				if ( m.ataque.length ) ret.atqparts = ret.atqparts.concat(m.ataque);
				if (m.dano && (m.aumentaDado || m.aumentaNum || m.dado || m.override)){
					m.dano = this.applyRollChanges(m.dano, m);
				} 
				ret.dmgparts.push( m.dano );
			}
			mergeObject(this.data.data, _campos);
			if(Number(passos) && passos!==0){
				this.data.data.dano = this.applyRollChanges(this.data.data.dano, {passo:passos});
			}
			mergeObject(options,ret);
			if(configuration.bonus) options.atqparts.push(configuration.bonus);
			if(configuration.bonusdano) options.dmgparts.push(configuration.bonusdano);
		}
		return options;
	}

	/* -------------------------------------------- */

	getItemData(id, actorData, configuration=null){
		const options = {};
		const rollData = this.getRollData();
		
		const valorDuracao = id.duracao.unidade != "turno" && id.duracao.unidade != "rodada" ? "" : id.duracao.valor;
		const unidadeDuracao = CONFIG.T20.timePeriods[id.duracao.unidade];
		let formula = [];
		formula.push(id.roll ?? id.dano ?? id.efeito);
		let rollMods = {
			dado:null,
			passo:0,
			override:null,
			aumentaDado:0,
			aumentaNum:0
		}
		
		if(this.type === "magia"){
			// set Original spell header
			options.spell = {
				tipo: id.tipo,
				circulo: id.circulo,
				escola: id.escola,
				execucao: CONFIG.T20.abilityActivationTypes[id.ativacao.execucao] || "Duas rodadas",
				alcance: id.alcance,
				alvo: id.alvo,
				area: id.area,
				duracao: valorDuracao ? valorDuracao + " " + unidadeDuracao + (valorDuracao != 1 ? "s" : "") : unidadeDuracao,
				resistencia: id.resistencia,
				cd: actorData.attributes.cd + (actorData.atributos[id.atrRes]?.mod ?? 0) + id.cd
			};
		}
		
		options.custo = id.ativacao.custo > 0 ? Number(id.ativacao.custo) + (actorData.modificadores?.custosPM?.bonus ?? 0) : 0;
		options.truque = false;
		options.aprimoramentos = [];
		options.effects = [];

		let aprimoramentos = [];
		let aplicados = {};
		let changes = [];
		let flags = {};
		// get Active Effects from this spell
		let effectList = this.effects.filter( ef => !ef.data.flags.tormenta20.onuse && !ef.data.disabled);
		let optEffectList = this.effects.filter( ef => !ef.data.flags.tormenta20.onuse && ef.data.disabled);
		if ( configuration ) {
			let aplica = [].concat(configuration?.aplica) ?? [];
			let ids = [].concat(configuration?.id) ?? [];
			if (configuration?.bonus) formula.push(configuration?.bonus);
			if (configuration?.bonusdano) formula.push(configuration?.bonusdano);
			if (configuration?.ajustecusto) options.custo += Number(configuration?.ajustecusto);
			// Set obj of applied effects
			// key => ae.uuid	value => amount of aplications
			aplica.forEach(function(ap, ind){
				if(ap && ap !== "0"){
					aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
				}
			});
			// get Aprimoramentos from this item
			aprimoramentos = this.effects.filter(ef => Object.keys(aplicados).includes(ef.id) );
			let ae = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
			if ( ae.length ) aprimoramentos = aprimoramentos.concat(ae);
			
			aprimoramentos = aprimoramentos.sort((a,b) => (a.data.flags.tormenta20.aumenta && !b.data.flags.tormenta20.aumenta) ? 1 : ((b.data.flags.tormenta20.aumenta && !a.data.flags.tormenta20.aumenta) ? -1 : 0));
			
			// create new Active Effect to concatenate changes
			let campos = ["alcance","alvo","area","execucao","duracao","resistencia","atrRes","cd","tipo","escola"];
			[effectList,optEffectList].forEach(function(list){
				list.forEach(function(ef, index){
					changes.push([]);
					ef.data.changes.forEach(function(ch){
						changes[index].push({
							key: ch.key,
							value: Number(ch.value) || ch.value,
							mode: ch.mode
						});
					});
				});
			});

			let _campos = {
				custo: 0
			};
			
			aprimoramentos.forEach(function(ef){
				if ( ef.data.flags.ActiveAuras?.isAura ) flags["ActiveAuras"] = ef.data.flags.ActiveAuras;

				ef.data.changes.forEach(function(ch){
					if( campos.includes(ch.key) ){
						if (ch.mode === 5) _campos[ch.key] = ch.value;
						// if (ch.mode === 2) _campos[ch.key] = ch.value;
						if (ch.mode === 2 && options.spell[ch.key] && Number(options.spell[ch.key]) && Number(ch.value)){
							_campos[ch.key] = Number(options.spell[ch.key]) + Number(ch.value)
						} else if ( ch.mode === 2 && options.spell[ch.key] && ch.value && options.spell[ch.key].match(/[\d+]?[,]?\d+/) && ch.value.toString().match(/[\d+]?[,]?\d+/) ) {
							let n1 = options.spell[ch.key].match(/[\d+]?[,]?\d+/)[0].replace(",",".");
							let n2 = ch.value.toString().match(/[\d+]?[,]?\d+/)[0].replace(",",".");
							let n3 = Number(n1) + ( Number(n2) * aplicados[ef.id] ) + "";
							_campos[ch.key] = options.spell[ch.key].replace(n1 , n3.replace(".",","));
						}
					}
					// include effect from the item
					else if( ch.key === "efeito"){
						let tef = optEffectList.find(ef => ef.data.label === ch.value );
						if ( tef ) effectList.push(tef);
					}
					// include condition
					else if( ch.key === "condicao"){
						let tef = T20Conditions[ch.value.toLowerCase().trim()];
						if ( tef ) effectList.push(ActiveEffect.create(tef));
					}
					// adds new bonus/dice
					else if( ["roll","dano"].includes(ch.key) && ch.mode === 2 ){
						formula.push( Number(ch.value) * aplicados[ef.id] || ch.value);
					}
					// overwrite main roll
					else if( ["roll","dano"].includes(ch.key) && ch.mode === 5 ){
						rollMods.override = ch.value;
					}
					// Customizing rolls , change faces, include modifiers
					else if( ch.key === "roll" && ch.mode === 0 ){
						if( (formula[0].match(/\d+d\d+/) || rollMods.override.match(/\d+d\d+/)) && ch.value.match(/\d+d\d+/)){ //adds more dice
							let tempAp = [];
							ch.value.match(/(\d+^[d])|(d)|(^[d]\d+)|([\+|\-])|(\d+)|(\@\w+)/g).forEach(rt => tempAp.push(Number(rt) * aplicados[ef.id]||rt));
							if( tempAp[0] ) rollMods.aumentaDado += tempAp[0];
							if( tempAp[4] ) rollMods.aumentaNum += tempAp[4];
						}else if(ch.value.match(/^d\d+$/)){ //change faces
							rollMods.dado = ch.value;
						} else if ( ["max","min"].includes(ch.value.toLowerCase().trim()) ){ //make min/max
							options.minmax = ch.value.toLowerCase().trim();
						}
						// TODO MODIFIERS "r" "x" "xo" "k" "kh" "kl" "d" "dh" "dl" "cs" "cf" "df" "sf" "ms"
						// TODO "+1 pra cada dado"
					} else if( ch.key !== "roll" ) {
						changes.forEach(function(efch){
							if( !ef.data.flags.tormenta20.aumenta || ( ef.data.flags.tormenta20.aumenta && efch.map(ch => ch.key).includes(ch.key) ) ) {
								if( ch.key == "data.tamanho" && efch.findIndex(i => i.key=="data.tamanho")){
									efch.splice(efch.findIndex(i => i.key=="data.tamanho"),1);
								}
								efch.push({
									key: ch.key,
									value: Number(ch.value * aplicados[ef.id])  || ch.value,
									mode: ch.mode
								});
							}
						});
					}
				});
				if ( ef.data.flags.tormenta20.custo === "" ){
					options.truque = true;
				} else if ( ef.data.flags.tormenta20.custo ) {
					options.custo += Number(ef.data.flags.tormenta20.custo) * aplicados[ef.id];
				}

				options.aprimoramentos.push({
					description: ef.data.label,
					custo: (Number(ef.data.flags.tormenta20.custo) || 0) * aplicados[ef.id],
					qtd: aplicados[ef.id]
				});

			}); 
			// Merge objects to overwrite spellHeader data // TODO add header to everything?
			if(this.type == "magia") mergeObject(options.spell, _campos);
		}
		// Create effects to embbed at chat card
		effectList = [];
		effectList.forEach(function(ef, index){
			let tempEffect = ActiveEffect.create({
				label: ef.data?.label ?? this.data.name,
				icon: ef.data?.icon ?? this.data.img,
				origin: ef.data?.origin ?? undefined,
				flags: mergeObject(ef.data.flags, flags, { temp: true }),
				duration: ef.data?.duration ?? undefined,
				disabled: false,
				changes: changes[index] ?? ef.data.changes
			});
			tempEffect.data.changes = tempEffect.data.changes.filter(ch => ch.key.match(/^data./i));
			let efl = ef.data?.label;
			if(T20Conditions[efl.slugify().replace("-","")])
				tempEffect = ActiveEffect.create(T20Conditions[efl.slugify().replace("-","")]);
				options.effects.push(tempEffect);
		});
		
		options.custo = options.truque || !id.ativacao.custo ? 0 : Math.max(options.custo,1);
		
		// Initiate measured template creation
		let createMeasuredTemplate = true;
		if ( options.spell?.area.match(/(\d+m)|(linha)/i) ) {
			let mtData = {};
			mtData.type = options.spell.area.match(/(\d+m de raio)|(cubo)|(quadrado)|(linha)|(cone)/i)[0];
			mtData.type = mtData.type.toLowerCase();
			if(mtData.type.match(/de raio/i)) mtData.type = "circle";
			if(mtData.type.match(/cubo|quadrado/i)) mtData.type = "rect";
			if ( mtData.type == "linha" ){
				mtData.type = "ray";
				if ( options.spell.alcance.match(/m[eé]dio/i) ) {
					mtData.distance = 30;
				} else if ( options.spell.alcance.match(/longo/i)) {
					mtData.distance = 90;
				} else {
					mtData.distance = 9;
				}
			} else {
				mtData.distance = options.spell.area.match(/((\d+)?[,]?\d+)(m)/i)[1] || 0;
				mtData.distance = mtData.distance.replace(",",".");
				mtData.distance = Number(mtData.distance) || 1.5;
			}
			mtData.actor = this.actor;
			const template = AbilityTemplate.fromData(mtData);
			if ( template ) template.drawPreview();
		}
		formula[0] = this.applyRollChanges(formula[0], rollMods);
		id.efeito = formula.join("+");
		return options;
	}