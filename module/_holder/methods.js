// rollMods[r.key]
applyRollChanges(rollMods){
	let rolls = this.data.data.rolls;
	let roll;
	for ( let r of rolls ){
		let dano = r.parts[0][0];
		if ( rollMods[r.key].override || rollMods[r.key].override == "" ){
			dano = rollMods[r.key].override;
		}

		if ( typeof rollMods[r.key].die === "string" ) {
			dano = dano.replace(/d\d+/, rollMods[r.key].die);
		}

		if ( rollMods[r.key].dgmStep ) {
			let indx = -1;
			if( CONFIG.T20.passosDano[dano] && CONFIG.T20.passosDano[dano] !== -1 ){
				indx = CONFIG.T20.passosDano[dano].indexOf(dano);
				dano = CONFIG.T20.passosDano[dano][indx+rollMods[r.key].dgmStep] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr1.indexOf(dano)){
				indx = CONFIG.T20.passosDano.arr1.indexOf(dano);
				dano = CONFIG.T20.passosDano.arr1[indx+rollMods[r.key].passo] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr2.indexOf(dano)){
				indx = CONFIG.T20.passosDano.arr2.indexOf(dano);
				dano = CONFIG.T20.passosDano.arr2[indx+rollMods[r.key].passo] || "4d12";
			}
			if( indx == -1 && CONFIG.T20.passosDano.arr3.indexOf(dano)){
				indx = CONFIG.T20.passosDano.arr3.indexOf(dano);
				dano = CONFIG.T20.passosDano.arr3[indx+rollMods[r.key].passo] || "4d12";
			}
		}
	
		if ( rollMods[r.key].addDie ){
			dano = new Roll(dano).alter(1, rollMods[r.key].addDie).formula;
		}

		if ( rollMods[r.key].addNum ) {
				roll = new Roll(dano);
				if ( roll.terms[2] ) roll.terms[2] = roll.terms[2] + rollMods[r.key].addNum;
				else roll.terms[2] = rollMods[r.key].addNum;
				dano = roll.formula;
		}
	}

	
	return roll;
}



/*
ARMAS
["pericia","atributoAtq","atributoDano",
"criticoM","criticoX","tipoDano","alcance"]

OUTOS
["","","","","","","",""]
["alcance","alvo","area","execucao",
"duracao","resistencia","atrRes","cd","tipo"];

["pericia","atributoAtq","atributoDano","criticoM","criticoX","tipoDano","alcance","alvo","area","execucao","duracao","resistencia","atrRes","cd","tipo"];

{
	pericia:		["rolls.0.parts.1.0",C.pericias],
	atributoAtq:	["rolls.0.parts.1.1",C.atributos],
	atributoDano:	["rolls.1.parts.1.0",C.atributos],
	tipoDano:		["rolls.1.parts.1.1",C.damageTypes],
	criticoM:		["criticoM",null],
	criticoX:		["criticoX",null],
	alcance:		["alcance",C.distanceUnits],
	alvo:			["alvo",null],
	area:			["area",null],
	execucao:		["ativacao.execucao",C.abilityActivationTypes],
	duracao:		["duracao.units",""],
	resistencia:	["resistencia.value",""],
	atributoCD:		["resistencia.atributo",""],
	cd:				["resistencia.bonus",""],
	tipo:			["tipo",""]
}



function (value, configKey){
	const lang = game.i18n.translations.T20;
	value = value.toLowerCase().capitalize();
	value = Object.entries(lang).find(t=> t[1] == value)[0] || value;
	if ( Object.entries(configKey).find(t=> t[1]==value)[0] ){
		return Object.entries(configKey).find(t=> t[1]==value)[0];
	} else  if( configKey[value] ){
		return configKey[value];
	}
	return null;
}


area = cone 4,5m
areaEffect {
	type: cone,
	value: 4.5,
	width: null
}
*/

if(mode === 2) _campos[key] = Number(id[key]) + Number(value) || id[key];
if(mode === 5) _campos[key] = value;


if( campos.includes(ch.key) ){
	if (ch.mode === 5) _campos[ch.key] = ch.value;
	
	if (ch.mode === 2 && options.spell[ch.key] && Number(ch.value)
		&& Number(options.spell[ch.key]) ){
		_campos[ch.key] = Number(options.spell[ch.key]) + Number(ch.value)
	} else if ( ch.mode === 2 && options.spell[ch.key] && ch.value
		&& options.spell[ch.key].match(/[\d+]?[,]?\d+/) 
		&& ch.value.toString().match(/[\d+]?[,]?\d+/) ) {
		let n1 = options.spell[ch.key].match(/[\d+]?[,]?\d+/)[0].replace(",",".");
		let n2 = ch.value.toString().match(/[\d+]?[,]?\d+/)[0].replace(",",".");
		let n3 = Number(n1) + ( Number(n2) * aplicados[ef.id] ) + "";
		_campos[ch.key] = options.spell[ch.key].replace(n1 , n3.replace(".",","));
	}
}











{{!-- Perícia --}}
{{!-- [ pericia, atributo, bonus,  ] --}}
{{#if (eq roll.type "pericia" ) }}
<div class="form-group">
	<ol class="roll-parts form-group">
		<li class="roll-part flexrow">
			<input type="hidden" name="data.rolls.{{key}}.parts.0.0" value="1d20"/>

			<select name="data.rolls.{{key}}.parts.1.0">
				{{#select (lookup (lookup roll.parts 1) 0) }}
				<option value="">{{ localize "T20.None" }}</option>
				{{#each ../../config.pericias as |name type|}}
				<option value="{{type}}">{{name}}</option>
				{{/each}}
				{{/select}}
			</select>
			<select name="data.rolls.{{key}}.parts.1.1" title="Substituir Atributo da Perícia">
				{{#select (lookup (lookup roll.parts 1) 1)}}
				<option value=""></option>
				{{#each ../../config.atributos as |name type|}}
				<option value="{{type}}">{{name}}</option>
				{{/each}}
				{{/select}}
			</select>
			<input type="text" name="data.rolls.{{key}}.parts.2.0" value="{{lookup (lookup roll.parts 2) 0}}"/>
		</li>
		{{#if ready}}
			{{#each roll.parts as |part i| }}
			<li class="roll-part flexrow" data-roll-part="{{i}}">
				<input type="text" name="data.rolls.{{key}}.parts.{{i}}.0" value="{{lookup this "0"}}"/>
				<input type="text" name="data.rolls.{{key}}.parts.{{i}}.1" value="{{lookup this "1"}}"/>
				<a class="parts-control delete-part" data-roll-id="{{key}}" title="{{key}}"><i class="fas fa-minus"></i></a>
			</li>
			{{/each}}
		{{/if}}
	</ol>
</div>
{{/if}}















async _onRollAtributo(event) {
	event.preventDefault();
	let atributo = this.actor.data.type==="npc" 	?	event.currentTarget.dataset.itemId
									: event.currentTarget.parentElement.dataset.itemId;
	let rolls={};
	let rollMode;
	let parts = [];
	let options = {event: event};
	
	// Display a configuration dialog to customize the usage
	const needsConfiguration = event.shiftKey;
	let configuration = {};
	if( needsConfiguration ){
		let fakeItem = {
			actor: this.actor,
			type:"atributo",
			name: CONFIG.T20.atributos[atributo],
			data: {
				formula:"1d20+@mod"
			},
			isOwned: true
		}
		configuration = await AbilityUseDialog.create(fakeItem);

		rollMode = configuration.rollMode;
	} else {
		let awaysActive = this.actor.effects.filter(ef => ef.data?.flags?.t20?.onuse && ef.data?.flags?.t20?.ability && !ef.data.disabled);
		if(awaysActive){
			configuration.id = awaysActive.map(ef => ef.id);
			configuration.aplica = Array(configuration.id.length).fill(true);
		}
	}

	if ( !isObjectEmpty(configuration) ) {
		let aplica = [].concat(configuration?.aplica) ?? [];
		let ids = [].concat(configuration?.id) ?? [];
		let aplicados = {};
		if (configuration?.bonus) parts.push(configuration?.bonus);
		
		aplica.forEach(function(ap, ind){
			if(ap && ap !== "0"){
				aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
			}
		});
		// get Aprimoramentos from this item
		let aprimoramentos = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
		aprimoramentos = aprimoramentos.sort((a,b) => (a.data.flags.tormenta20.aumenta && !b.data.flags.tormenta20.aumenta) ? 1 : ((b.data.flags.tormenta20.aumenta && !a.data.flags.tormenta20.aumenta) ? -1 : 0));
		options.aprimoramentos = [];
		aprimoramentos.forEach(function(ef){
			ef.data.changes.forEach(function(ch){
				if( ch.key === "roll" && ch.mode === 2 ){
					parts.push(Number(ch.value) * aplicados[ef.id] || ch.value);
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
	}

	options.parts = parts;
	rolls = await this.actor.rollAtributo(atributo, options);
	//rolls.atq = await this.actor.rollAtributo(atributo, {parts: parts,event: event});

	let itemData = {
		name: CONFIG.T20.atributos[atributo]
	}
	this.actor.displayCard({rolls, itemData, rollMode});
}

async _onRollPericia(event) {
	event.preventDefault();
	let pericia = this.actor.data.type==="npc" 	?	event.currentTarget.dataset.itemId
									: event.currentTarget.parentElement.dataset.itemId;
	let type = event.currentTarget.dataset.type;
	let rolls={};
	let rollMode;
	let parts = [];
	let skillData = {padrao: this.actor.data.data.pericias, oficios: this.actor.data.data.pericias.ofi.mais, custom: this.actor.data.data.periciasCustom}[type];
	skillData[pericia].formula = "1d20+@mod";
	let itemData = {
		actor: this.actor,
		type:"pericia",
		data: skillData[pericia],
		name: skillData[pericia].label.replace(/[\*||\+]/g,"").trim(),
		id: pericia,
		isOwned: true
	}
	let options = {event: event};
	// Display a configuration dialog to customize the usage
	const needsConfiguration = event.shiftKey;
	let configuration = {};
	if( needsConfiguration ){
		configuration = await AbilityUseDialog.create(itemData);
		
		rollMode = configuration.rollMode;
	} else {
		let awaysActive = this.actor.effects.filter(ef => ef.data?.flags?.t20?.onuse && ef.data?.flags?.t20?.skill && !ef.data.disabled);
		if(awaysActive){
			configuration.id = awaysActive.map(ef => ef.id);
			configuration.aplica = Array(configuration.id.length).fill(true);
		}
	}

	if ( !isObjectEmpty(configuration) ) {
		let aplica = [].concat(configuration?.aplica) ?? [];
		let ids = [].concat(configuration?.id) ?? [];
		let aplicados = {};
		if (configuration?.bonus) parts.push(configuration?.bonus);
		
		aplica.forEach(function(ap, ind){
			if(ap && ap !== "0"){
				aplicados[ids[ind]] = aplica[ind] === true ? 1 : Number(aplica[ind]) ;
			}
		});
		// get Aprimoramentos from this item
		let aprimoramentos = this.actor.effects.filter(ef=> Object.keys(aplicados).includes(ef.id));
		aprimoramentos = aprimoramentos.sort((a,b) => (a.data.flags.tormenta20.aumenta && !b.data.flags.tormenta20.aumenta) ? 1 : ((b.data.flags.tormenta20.aumenta && !a.data.flags.tormenta20.aumenta) ? -1 : 0));
		options.aprimoramentos = [];
		aprimoramentos.forEach(function(ef){
			ef.data.changes.forEach(function(ch){
				if( ch.key === "roll" && ch.mode === 2 ){
					parts.push(Number(ch.value) * aplicados[ef.id] || ch.value);
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
	}
	options.parts = parts;
	rolls = await this.actor.rollPericia(itemData, options);
	
	this.actor.displayCard({rolls, itemData, rollMode});
}