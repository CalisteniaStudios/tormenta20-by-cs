
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
	// Create the macro command
	let command = "";
	if (data.type === "Pericia") {
		const item = data.data;
		command = `game.tormenta20.rollSkillMacro("${item.label}","${data.subtype}");`;
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

	if (data.type === "ActiveEffect") {
		let item = data.data;
		command = `// Ativar/Desativar Efeito;
if(actor) {
	let effect = actor.effects.find(ef => ef.data.label == "${item.label}");

	if(effect){
		effect.update({disabled: !effect.data.disabled});
	}
}`;
		let macro = game.macros.entities.find(
			(m) => m.name === item.label && m.command === command
			);
		if (!macro) {
			macro = await Macro.create({
				name: item.label,
				type: "script",
				img: item.icon,
				command: command
			});
		}
		game.user.assignHotbarMacro(macro, slot);
	}
}

/* -------------------------------------------- */

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {string} itemName
* @return {Promise}
*/
export async function rollItemMacro(itemName, extra = {}) {
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
	//Object.values(extra).some(e=> e.match(/^=/) )
	if ( items[0].type === "arma" && (extra.atq.match(/^=/) || extra.dano.match(/^=/)) ) {
		ui.notifications.warn(`Substituir bonus de ataque e dano (ie: "=15") não é suportado no momento.`);
	}
	const item = items[0];


	const rollConfigs = {}
	rollConfigs.configureDialog = event.shiftKey;
	rollConfigs.extra	= extra;
	// Trigger the item roll
	return item.roll( rollConfigs );
}



export async function rollSkillMacro(skillName) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	if (!actor) return ui.notifications.warn(`Selecione um personagem.`);

	let pericias = Object.entries(actor.data.data.pericias);
	let skl = pericias.find(p => p[1].label == skillName )[0];
	await actor.rollPericia(skl, {event: event});
	
}