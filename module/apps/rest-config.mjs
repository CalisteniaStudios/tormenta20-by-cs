export default class RestConfigDialog extends foundry.applications.api.DialogV2 {
	constructor(options={}) {
		super(options);
		this.options.classes.push(...["tormenta20"]);
	}

	static async create(actors) {
		if (!actors.length) {
			ui.notifications.warn("Nenhum personagem selecionado!");
			return;
		}

		async function descanso(actors, modificador, modPV, modPM, curaCP=0, curaAC=0) {
			let msg = [];
			for (let actor of actors) {
				if (actor.actor) {
					let m = await actor.actor.descanso(modificador, modPV, modPM, curaCP, curaAC, false);
					msg.push(m);
				} else if (actor.documentName === "Actor") {
					let m = await actor.descanso(modificador, modPV, modPM, curaCP, curaAC, false);
					msg.push(m);
				}
			}
			let descricao = "";
			const condicao = ["Ruim", "Normal", "Confortável", "Luxuoso"];
			let c = condicao[Math.floor(modificador)];
			descricao += `<span>Condição ${c}: ${modificador}/nivel</span><br>`;
			if (modPV) {
				descricao += `<span>Extra PV: ${modPV}/nivel</span><br>`;
			}
			if (modPM) {
				descricao += `<span>Extra PM: ${modPM}/nivel</span><br>`;
			}
			if (curaCP) {
				descricao += "<span>Cuidados Rolongados (+1 PV/Nível)</span><br>";
			}
			if (curaAC) {
				descricao += "<span>Acompanhamento Médico (+1 PV/Nível)</span><br>";
			}
			descricao += `<p>${msg.join("<br>")}</p>`;
			let content = {
				item: {
					name: game.i18n.localize("T20.Rest"),
					img: "icons/svg/regen.svg"
				},
				system: {
					description: {
						value: descricao
					}
				}
			};
			let template = "systems/tormenta20/templates/chat/chat-card.html";
			const html = await renderTemplate(template, content);
			const chatData = {
				user: game.user.id,
				type: CONST.CHAT_MESSAGE_STYLES.OTHER,
				content: html
			};
			ChatMessage.create(chatData);
		}

		let content = `<form>
		<div class="form-group">
				<label>Qualidade</label> <select name='qualidade'>
						<option value=0.5>Ruim</option>
						<option value=1 selected>Normal</option>
						<option value=2 >Confortável</option>
						<option value=3>Luxuoso</option>
				</select>
		</div>
		<div class="form-group">
				<label>PV Extra / Por Nível</label>
				<div class="form-fields"><input type='number' name='modPV' value='0'></div>
		</div>
		<div class="form-group">
				<label>PM Extra / Por Nível</label>
				<div class="form-fields"><input type='number' name='modPM' value='0'></div>
		</div>
		<div class="form-group">
				<label>Cuidados Prolongados</label>
				<div class="form-fields"><input type='checkbox' name='curaCP' value=1></div>
		</div>
		<div class="form-group">
				<label>Acompanhamento Médico</label>
				<div class="form-fields"><input type='checkbox' name='curaAC' value=1></div>
		</div>
		</form>`;

		return this.wait({
			actors,
			window: {
				title: "Descanso",
				icon: "fa-solid fa-bed"
			},
			content,
			buttons: [{
				label: "OK",
				action: "ok",
				callback: (event, button, dlg) => {
					const modQ = parseFloat(dlg.element.querySelector("[name=qualidade]").value);
					const modPV = parseInt(dlg.element.querySelector("[name=modPV]").value);
					const modPM = parseInt(dlg.element.querySelector("[name=modPM]").value);
					const curaCP = dlg.element.querySelector("[name=curaCP]").checked;
					const curaAC = dlg.element.querySelector("[name=curaAC]").checked;
					descanso(actors, modQ, modPV, modPM, curaCP, curaAC);
				}
			},
			{
				label: "Cancel"
			}],
			position: { width: 400 }
		});
	}
}
