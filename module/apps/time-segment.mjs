export const endSegment = async function (app, html) {
	if (game.user.isGM && !app.element.querySelector(".scene-segment")) {
		const button = document.createElement("button");
		button.className = "scene-segment flexF";
		button.title = "Terminar a Cena";
		button.innerHTML = "<i class='fa-solid fa-clapperboard'></i> Terminar Cena";

		button.addEventListener("click", async function () {
			let historico = "";
			for await (const token of canvas.tokens.placeables) {
				const actor = !token.actorLink ? token.actor : game.actors.get(token.actor.id);
				if (actor.type != "character") continue;
				let efeitos = token.actor.effects.filter((e) => e.getFlag("tormenta20", "durationScene")).map((e) => e.id);
				let labels = token.actor.effects
					.filter((e) => e.getFlag("tormenta20", "durationScene"))
					.map((e) => `<i>${e.name}</i>`);
				if (efeitos.length) {
					historico += `<br><b>${token.actor.name}</b> ${labels.join(", ")}`;
					await actor.deleteEmbeddedDocuments("ActiveEffect", efeitos);
				}
			}

			let toChat = (message) => {
				let chatData = {
					user: game.user._id,
					type: CONST.CHAT_MESSAGE_STYLES.OTHER,
					content: message,
					speaker: ChatMessage.getSpeaker()
				};
				ChatMessage.create(chatData);
			};
			let outputHistorico = "";
			if (historico) {
				outputHistorico = ` Os seguintes efeitos foram removidos:${historico}`;
			}

			let chatMessage = `<div class='tormenta20 chat-card item-card'>
				<header class='card-header flexrow'>
					<h3 class="item-name">
						<i class="fa-solid fa-clapperboard" style=""></i> Cena Finalizada
					</h3>
				</header>
				<div class='card-content'>A cena atual foi terminada pelo mestre.${outputHistorico}</div>
			</div>`;
			toChat(chatMessage);
		});

		const footer = html.querySelector(".combat-controls");
		footer.classList.add("flexrow");
		footer.appendChild(button);
	}
};
