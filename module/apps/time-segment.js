export const endSegment = async function (app, html) {
  if (app.options.id == "combat" && game.user.isGM) {
    let button = $(
      "<button class='scene-segment' title='Terminar a Cena'><img src='systems/tormenta20/icons/clapperboard.svg' width='32' height='32' /></i></button>"
    );

    button.click(async function () {
      let historico = "";
      for await (const token of canvas.tokens.placeables) {
        if (!token.data.actorLink) {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.flags.t20.durationScene) {
              historico += "<BR><B>" + token.data.name + "</b> deixou de estar <i>" + efeito.label + "</i>";
              const deleted = await token.actor.deleteEmbeddedEntity(
                "ActiveEffect",
                efeito._id
              );
            }
          }        } else {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.flags.t20.durationScene) {
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
      let toChat = (message) => {
        let chatData = {
          user: game.user.id,
          content: message,
          speaker: game.user,
          type: CONST.CHAT_MESSAGE_TYPES.OTHER
        };
        ChatMessage.create(chatData, {});
      };
      let outputHistorico = ""
      if (historico) {
        outputHistorico = " As seguintes condições foram terminadas:" + historico;
      }
  
      let chatMessage = "<div class='tormenta20 chat-card item-card'><header class='card-header flexrow'><img class='invert' src='systems/tormenta20/icons/clapperboard.svg' width='36' height='36' style='flex:0'><h3 class='item-name'><div>Cena Finalizada</div></h3></header><div class='card-content'>A cena atual foi terminada pelo mestre." + outputHistorico + "</div></div>";
      toChat(chatMessage);
    });

    html.find(".directory-footer").append(button);
  }
};
