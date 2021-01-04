const _TokenToggleEffect = Token.prototype.toggleEffect;
export const toggleEffect = async function (...args) {
  const data = _TokenToggleEffect.bind(this)(...args);
  let condicao = args[0].id;
  await chatCondition(this.actor, condicao);
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
    let chatMessage = condicaoDados.tooltip;
    toChat(this, chatMessage);
  }
}

function findCondition(effects, condicao) {
  let condic = null;
  effects.forEach((element) => {
    if (element.data.flags.core.statusId == condicao) condic = element;
  });

  return condic;
}
