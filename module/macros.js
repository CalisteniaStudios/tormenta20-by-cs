
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {Object} data     The dropped data
* @param {number} slot     The hotbar slot to use
* @returns {Promise}
*/
export async function createT20Macro(data, slot) {
	if (data.type === "Pericia") {
		const item = data.data;
		const command = `game.tormenta20.rollSkillMacro("${item.label}","${data.subtype}");`;
		let macro = game.macros.entities.find(
			(m) => m.name === item.label && m.command === command
			);
		if (!macro) {
			macro = await Macro.create({
				name: item.label,
				type: "script",
				command: command,
			});
		}
		game.user.assignHotbarMacro(macro, slot);
		return false;
	}
	if (data.type === "Item") {
		if (!("data" in data))
			return ui.notifications.warn(
				"Você só pode criar Macros para Ataques, Magias e Poderes. Você pode referenciar atributos e perícias com @. Ex.: @for ou @luta"
				);
		const item = data.data;
		// const actor = getItemOwner(item);
		// Create the macro command
		let command = "";
		if (item.type === "arma") {
			command = `
			//UTILIZE OS CAMPOS ABAIXO PARA MODIFICAR um ATAQUE
			//VALORES SERÃO SOMADOS A CARACTEÍSTICA.
			//INICIAR COM "=" SUBSTITUIRÁ O BÔNUS DA FICHA DA ARMA
			game.tormenta20.rollItemMacro("${item.name}",{
				'atq' : "0",
				'dadoDano' : "",
				'dano' : "0", 
				'margemCritico' : "0",
				'multCritico' : "0",
				'pericia' : "",
				'atributo' : "",
				'tipo' : "",
				'alcance' : "",
				'custo' : "0",
				'nome' : "",
				'descricao' : ""
			});`;
		} else {
			command = `game.tormenta20.rollItemMacro("${item.name}");`;
		}

		let macro = game.macros.entities.find(
			(m) => m.name === item.name && m.command === command
			);
		if (!macro) {
			macro = await Macro.create({
				name: item.name,
				type: "script",
				img: item.img,
				command: command,
				flags: {
					"tormenta20.itemMacro": true,
				},
			});
		}
		game.user.assignHotbarMacro(macro, slot);
		return false;
	}
}

/* -------------------------------------------- */

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {string} itemName
* @return {Promise}
*/
export async function rollItemMacro(itemName, extra = null) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	let item = null;
	if (extra) {
		item = actor
		? actor.items.find(
			(i) => i.name === itemName && extra && i.type !== "ataque"
			)
		: null;
	} else {
		item = actor ? actor.items.find((i) => i.name === itemName) : null;
	}
	if (!actor) return ui.notifications.warn(`Selecione um personagem.`);
	if (!item)
		return ui.notifications.warn(
			`O personagem selecionado não possui um Item chamado ${itemName}`
			);
	// console.log(item);
	// Trigger the item roll
	await game.tormenta20.dice.prepRoll(event, item, actor, extra);
}



export async function rollSkillMacro(skillName, subtype) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	let skill;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	if (!actor) return ui.notifications.warn(`Selecione um personagem.`);
	if (subtype == "oficios") {
		for (let [t, sk] of Object.entries(actor.data.data.pericias["ofi"].mais)) {
			if (sk.label === skillName) {
				skill = sk;
				break;
			}
		}
	} else if (subtype == "custom") {
		for (let [t, sk] of Object.entries(actor.data.data.periciasCustom)) {
			if (sk.label === skillName) {
				skill = sk;
				break;
			}
		}
	} else {
		for (let [t, sk] of Object.entries(actor.data.data.pericias)) {
			if (sk.label === skillName) {
				skill = sk;
				break;
			}
		}
	}
	const item = {
		type: "pericia",
		label: skill.label,
		roll: `1d20+${skill.value}`,
	};
	// Trigger the item roll
	await game.tormenta20.dice.prepRoll(event, item, actor);
}