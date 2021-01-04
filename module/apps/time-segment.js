export const endSegment = async function (app, html) {
  if (app.options.id == "combat" && game.user.isGM) {
    let button = $(
      "<button class='scene-segment' title='Terminar a Cena'><i class='fas fa-film'></i></button>"
    );

    button.click(async function () {
      for await (const token of canvas.tokens.placeables) {
        if (!token.data.actorLink) {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.durationType == "cena") {
              const deleted = await token.actor.deleteEmbeddedEntity(
                "ActiveEffect",
                efeito._id
              );
            }
          }        } else {
          for await (const efeito of token.actor.data.effects) {
            if (efeito.durationType == "cena") {
              const thisActor = game.actors.get(token.actor.data._id);
              const deleted = await thisActor.deleteEmbeddedEntity(
                "ActiveEffect",
                efeito._id
              );
            }
          }
        }
      }
    });

    html.find(".directory-footer").append(button);
  }
};
