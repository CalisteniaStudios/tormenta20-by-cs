
const _TokenToggleEffect = Token.prototype.toggleEffect;
export const toggleEffect = async function (...args) {
	const data = _TokenToggleEffect.bind(this)(...args);
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
		let chatMessage = "<div class='tormenta20 chat-card item-card'><header class='card-header flexrow'><img class='invert' src='" + condicaoDadosOrig.icon + "' width='36' height='36' style='flex:0'><h3 class='item-name'><div>" + condicaoDadosOrig.name + "</div></h3></header><div class='card-content'>" + condicaoDados.tooltip.replace('<strong>' + condicaoDadosOrig.name + '</strong><br><br>','') + "</div></div>";
		toChat(this, chatMessage);
	}
}

function findCondition(effects, condicao) {
	let condic = null;
	effects.forEach((element) => {
		if (element.data.name == condicao) condic = element;
	});

	return condic;
}
