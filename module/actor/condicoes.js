import { T20Conditions } from "../conditions/conditions.js";
import { T20 } from "../config.js";

const _TokenToggleEffect = Token.prototype.toggleEffect;
export const toggleEffect = async function (...args) {
	const data = _TokenToggleEffect.bind(this)(...args);
	let condicao = args[0].id;
	console.log(condicao);
// 	// let icon = 
// 	let condicao = args[0].id ? args[0].id : args[0].match(/\/\w+\./i)[0].replace(/\/|\./g, "");
	

// 	const token = this;
// 	let condition = T20Conditions[condicao];
// 	if(args[0].id && condition) mergeObject(args[0], condition);
// 	console.log(token.actor.effects);
// 	if(condition) {
// 		condition.flags?.t20?.childEffect?.forEach(function(ef){
// 			const stts = T20Config.statusEffectIcons.find(sei=> sei.id==ef);
// 			const stae = T20Conditions[ef];
// 			console.log("---------");
// 			console.log(args);
// 			// console.log(condicao);
// 			// console.log(args[1].active);
// 			let ativando = args[1].active !== false;
// 			let existe = token.actor.effects.find(ae=> ae.data?.flags?.core?.statusId == ef);
// 			let outra = token.actor.effects.filter(ae=> ae.data?.flags?.t20?.childEffect?.includes(ef));
// 			// console.log(`ATIVANDO: ${ativando}`);
// 			// console.log(`EXISTE:`);
// 			// console.log(existe);
// 			// console.log(`OUTRA:`);
// 			// console.log(outra);
// 			// console.log(`OUTRA: ${ativando}`);
// 			// if(!args[1].active || !){
// 			// }
// 			token.toggleEffect(stts, {overlay:false});
// 				// console.log("AAAAAAAAACHOU");
// 			/*
// 				1 - TOGGLE ATORDOADO
// 					APLICANDO :
// 						DESPREVENIDO EXISTE :
// 							- NADA
// 						DESPREVENIDO !EXISTE :
// 							- TOGGLE DESPREVENIDO
// 					REMOVENDO :
// 						DESPREVENIDO EXISTE :
// 							POR OUTRA CONDIÇÃO :
// 								- NADA

// 						DESPREVENIDO !EXISTE :
// 							- NADA
// 			*/
// 			// token.toggleEffect(mergeObject(stts, stae), {overlay:false});
// 		});
// 	}
// 	// token.actor.effects.find(ef=> ef.name)
// 	// this.toggleEffect()
// 	// T20Conditions["abalado"];
// 	//T20Conditions[effect.flags.tormenta20.stack];
// 	// await chatCondition(this.actor, condicao);
	return data;
};

async function chatCondition(actor, condicao) {
	let activeCond = findCondition(actor.effects, condicao);
	if (activeCond == null && condicao != undefined) {
		let toChat = (speaker, message) => {
			let chatData = {
				user: game.user.id,
				content: message,
				speaker: ChatMessage.getSpeaker(speaker),
				type: CONST.CHAT_MESSAGE_TYPES.OTHER
			};
			ChatMessage.create(chatData, {});
		};

		let condicaoDados = CONFIG.conditions[condicao];
		if (condicaoDados === undefined) return;
		let condicaoDadosOrig = CONFIG.statusEffects.find(x => x.id == condicao);
		let chatMessage = "<div class='tormenta20 chat-card item-card'><header class='card-header flexrow'><img class='invert' src='" + condicaoDadosOrig.icon + "' width='36' height='36' style='flex:0'><h3 class='item-name'><div>" + condicaoDadosOrig.label + "</div></h3></header><div class='card-content'>" + condicaoDados.tooltip.replace('<strong>' + condicaoDadosOrig.label + '</strong><br><br>','') + "</div></div>";
		toChat(this, chatMessage);
	}
}

function findCondition(effects, condicao) {
	let condic = null;
	effects.forEach((element) => {
		if (element.data.label == condicao) condic = element;
	});

	return condic;
}
