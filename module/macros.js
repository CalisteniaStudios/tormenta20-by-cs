
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
	'atributoAtq' : "",
	'atributoDano' : "",
	'pericia' : "",
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
	
	// Get matching items
	const items = actor ? actor.items.filter(i => i.name === itemName) : [];
	if ( items.length > 1 ) {
		ui.notifications.warn(`O personagem ${actor.name} possui mais de um Item ${itemName}. O primeiro encontrado será usado.`);
	} else if ( items.length === 0 ) {
		return ui.notifications.warn(`O personagem selecionado não possui um Item chamado ${itemName}`);
	}
	
	const item = items[0];

	// Trigger the item roll
	return item.roll({extra:extra});
}



export async function rollSkillMacro(skillName, subtype) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	let skill;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	if (!actor) return ui.notifications.warn(`Selecione um personagem.`);

	// let skillData = {padrao: actor.data.data.pericias, oficios: actor.data.data.pericias.ofi.mais, custom: actor.data.data.periciasCustom}[subtype];
	// skillData[skillName].formula = "1d20+@mod";


	if (subtype == "oficios") {
		for (let [t, sk] of Object.entries(actor.data.data.pericias["ofi"].mais)) {
			if (sk.label === skillName) {
				skill = sk;
				skill.id=t;
				break;
			}
		}
	} else if (subtype == "custom") {
		for (let [t, sk] of Object.entries(actor.data.data.periciasCustom)) {
			if (sk.label === skillName) {
				skill = sk;
				skill.id=t;
				break;
			}
		}
	} else {
		for (let [t, sk] of Object.entries(actor.data.data.pericias)) {
			if (sk.label === skillName) {
				skill = sk;
				skill.id=t;
				break;
			}
		}
	}
	const itemData = {
		actor: actor,
		isOwned: true,
		type: "pericia",
		data: skill,
		roll: `1d20+${skill.value}`,
		name: skillName.replace(/[\*||\+]/g,"").trim(),
		id: skill.id
	};
	// Trigger the item roll
	let rolls = {};
	rolls.atq = await actor.rollPericia(itemData, {event: event});
		
	actor.displayCard({rolls, itemData});
}