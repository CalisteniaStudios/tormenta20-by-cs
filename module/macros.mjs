/* -------------------------------------------- */
/*  Macros Scripts                              */
/* -------------------------------------------- */
const macroScripts = {
SKILL: `game.tormenta20.rollSkillMacro("{label}","{subtype}");`,
ITEM: `game.tormenta20.rollItemMacro("{name}");`,
EXTRAWEAPON: {
  'atq' : "0",
  'dadoDano' : "",
  'dano' : "0", 
  'margemCritico' : "0",
  'multCritico' : "0",
  'atributoAtq' : "",
  'atributoDano' : "",
  'pericia' : "",
},
WEAPON: `
//UTILIZE OS CAMPOS ABAIXO PARA MODIFICAR um ATAQUE
//VALORES SERÃO SOMADOS A CARACTEÍSTICA.
//INICIAR COM "=" SUBSTITUIRÁ O BÔNUS DA FICHA DA ARMA
game.tormenta20.rollItemMacro("{name}",{
  'atq' : "0",
  'dadoDano' : "",
  'dano' : "0", 
  'margemCritico' : "0",
  'multCritico' : "0",
  'atributoAtq' : "",
  'atributoDano' : "",
  'pericia' : "",
});`,
EFFECT: `// Ativar/Desativar Efeito;
if(actor) {
  let effect = actor.effects.find(ef => ef.label == "{label}");

  if(effect){
    effect.update({disabled: !effect.disabled});
  }
}`,
EQUIPMENT: `// Equipa/Desequipa Equipamento;
if(actor){
  let item = actor.items.find( it => it.name == "{name}");
  if(item){
    item.update({'system.equipado': !item.system.equipado});
  }
}`,
}

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */


import ItemT20 from "./documents/item.mjs";

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
		command = macroScripts.SKILL.replace('{label}', item.label).replace('{subtype}', data.subtype);
		let macro = game.macros.find((m) => m.name === item.label && m.command === command);
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
		let item = await fromUuid( data.uuid );
		if ( !item instanceof ItemT20 )
			return ui.notifications.warn(
				"Não há uma macro para este tipo de item."
				);
		
		if (item.type === "arma") {
			command = macroScripts.WEAPON.replace('{name}',item.name);
		} else if (item.type === "equipamento") {
			command = macroScripts.EQUIPMENT.replace('{name}',item.name);
		} else {
			command = macroScripts.ITEM.replace('{name}',item.name);
		}

		let macro = game.macros.find((m) => m.name === item.name && m.command === command);
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
		return true;
	}

	if (data.type === "ActiveEffect") {
		let effect = await fromUuid( data.uuid );
		if( !effect instanceof ActiveEffect )
			return ui.notifications.warn(
				"Não há uma macro para este tipo de item."
				);
		
		command = macroScripts.EFFECT.replace('{label}',effect.name);
		let macro = game.macros.find( (m) => m.name === effect.name && m.command === command );
		if (!macro) {
			macro = await Macro.create({
				name: effect.name,
				type: "script",
				img: effect.icon,
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
	if ( items[0].type === "arma" && (extra.atq.match(/^=/) || extra.dano.match(/^=/)) ) {
		ui.notifications.warn(`Substituir bonus de ataque e dano (ie: "=15") não é suportado no momento.`);
	}
	const item = items[0];


	const rollConfigs = {}
	if ( game.settings.get('tormenta20','invertUsageConfig') ) {
		rollConfigs.configureDialog = !event.shiftKey;
	} else {
		rollConfigs.configureDialog = event.shiftKey;
	}
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

	let pericias = Object.entries(actor.system.pericias);
	let skl = pericias.find(p => p[1].label == skillName )[0];
	await actor.rollPericia(skl, {message:true, event: event});
}

export async function msgFromJournal(name, source, sourceName) {
	let journal;
	let page;
	let style = '';
	if ( source && sourceName ) {
		const pack = await game.packs.get( source ).getDocuments();
		journal = pack.find(i => i.name === sourceName);
		page = journal.pages.find( p => p.name == name );
	} else if ( source ) {
		const pack = await game.packs.get( source ).getDocuments();
		journal = pack.find(i => i.name === name);
	} else {
		journal = game.journal.getName(name);
	}
	if( !journal ) return;
	if (  game.tormenta20.config.statusEffectIcons.find( i => i.label === name )  ){
		style = 'style="position:relative; background: #ddd9d5;padding: 0.5rem; margin-left:-7px;margin-right:-7px;margin-bottom:-7px;margin-top:-27px"';
	}
	if( !page ) return;

	let chatData = {
		speaker: null,
		content: `<div ${style} >${page.text.content}</div>`
	}
	ChatMessage.create(chatData, {});
}


/**
 * Create Standard rollChatMessage
 * 
 * */
 export async function rollChatMessage({rolls= [], templateData={item: {name:"Teste", img:"icons/svg/dice-target.svg"}, system: {description:{value:"Teste"}}}}){
	templateData.rolls = [];
	// Render dice rolls
	for( let [key, roll] of Object.entries(rolls) ) {
		roll.tipo = roll.dice[0]?.faces !== 20 ? "roll--dano" : roll._critical ? "critico" : roll._fumble ? "falha" : "";
		roll.options.title = roll.options.title || "-";
		await roll.render().then((r)=> {templateData.rolls.push({template: r, roll: roll})});
	}
	
	// Render the chat card template
	let template = "systems/tormenta20/templates/chat/chat-card.html";
	const html = await renderTemplate(template, templateData);

	// Create the ChatMessage data object
	const chatData = {
		user: game.user._id,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		content: html,
		rolls: rolls,
		speaker: ChatMessage.getSpeaker()
	};
	
	// Apply the roll mode to adjust message visibility
	ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
	
	// Create the Chat Message or return its data
	ChatMessage.create(chatData);
}
