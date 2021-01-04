export const endSegment = async function (app, html) {
  if (app.options.id == "combat" && game.user.isGM) {
    let button = $(
      "<button class='scene-segment' title='Terminar a Cena'><i class='fas fa-film'></i></button>"
    );

    button.click(async function () {
      let historico = "";
      for await (const token of canvas.tokens.placeables) {
        if (!token.data.actorLink) {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.durationType == "cena") {
              historico += "<BR><B>" + token.data.name + "</b> deixou de estar <i>" + efeito.label + "</i>";
              const deleted = await token.actor.deleteEmbeddedEntity(
                "ActiveEffect",
                efeito._id
              );
            }
          }        } else {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.durationType == "cena") {
              historico += "<BR><B>" + token.actor.data.name + "</b> deixou de estar <i>" + efeito.label + "</i>";
              const thisActor = game.actors.get(token.actor.data._id);
              const deleted = await thisActor.deleteEmbeddedEntity(
                "ActiveEffect",
                efeito._id
              );
            }
          }
        }
      }
      //
      let toChat = (speaker, message) => {
        let chatData = {
          user: game.user.id,
          content: message,
          speaker: game.user,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER
        };
        ChatMessage.create(chatData, {});
      };
  
      let chatMessage = "A cena atual foi terminada pelo mestre. As seguintes condições foram terminadas:<BR>";
      chatMessage += historico;
      toChat(game.user, chatMessage);
    });

    html.find(".directory-footer").append(button);
  }
};
