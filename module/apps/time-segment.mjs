export const endSegment = async function (app, html) {
	if (app.options.id == "combat" && game.user.isGM) {
		let button = $(
			"<button class='scene-segment' title='Terminar a Cena'><img src='systems/tormenta20/icons/clapperboard.svg' width='32' height='32' /></i></button>"
		);

		button.click(async function () {
			let historico = "";
			for await (const token of canvas.tokens.placeables) {
				if (!token.actorLink) {
					let efeitos = token.actor.effects.filter(e => e.getFlag("tormenta20", "durationScene") ).map(e => e.id);
					let labels = token.actor.effects.filter(e => e.getFlag("tormenta20", "durationScene") ).map(e => `<i>${e.name}</i>`);
					if( efeitos.length ){
						historico += "<br><b>" + token.actor.name + "</b> " + labels.join(", ");
						await token.actor.deleteEmbeddedDocuments("ActiveEffect", efeitos);
					}
				} else {
					let efeitos = token.actor.effects.filter(e => e.getFlag("tormenta20", "durationScene") ).map(e => e.id);
					let labels = token.actor.effects.filter(e => e.getFlag("tormenta20", "durationScene") ).map(e => `<i>${e.name}</i>`);
					if( efeitos.length ){
						historico += "<br><b>" + token.actor.name + "</b> " + labels.join(", ");
						const thisActor = game.actors.get(token.actor.id);
						await thisActor.deleteEmbeddedDocuments("ActiveEffect", efeitos);
					}
				}
			}
			
			let toChat = (message) => {
				let chatData = {
					user: game.user._id,
					type: CONST.CHAT_MESSAGE_TYPES.OTHER,
					content: message,
					speaker: ChatMessage.getSpeaker()
				};
				ChatMessage.create(chatData);
			};
			let outputHistorico = ""
			if (historico) {
				outputHistorico = " Os seguintes efeitos foram removidos:" + historico;
			}
			
			let chatMessage = "<div class='tormenta20 chat-card item-card'><header class='card-header flexrow'><img class='invert' src='systems/tormenta20/icons/clapperboard.svg' width='36' height='36' style='flex:0'><h3 class='item-name'><div>Cena Finalizada</div></h3></header><div class='card-content'>A cena atual foi terminada pelo mestre." + outputHistorico + "</div></div>";
			toChat(chatMessage);
		});

		html.find(".directory-footer").append(button);
	}
};
