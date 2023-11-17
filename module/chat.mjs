import ChoicesDialog from "./apps/choices-dialog.mjs";
import ItemT20 from "./documents/item.mjs";

	/* -------------------------------------------- */
	/*  Chat Message Overrides                      */
	/* -------------------------------------------- */

/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html The Chat Message being rendered
 * @param {Array} options The Array of Context Menu options
 *
 * @return {Array} The extended options Array including new context choices
 */
export const  addChatMessageContextOptions = function (html, options) {
	let canApply = li => {
		const message = game.messages.get(li.data("messageId"));
		return ( li.find(".roll--dano").length || message?.isRoll ) && message?.isContentVisible && canvas.tokens?.controlled.length;
	};
	let canApplyMana = li => {
		const message = game.messages.get(li.data("messageId"));
		return ( li.find(".mana-cost, .chat-spend-mana").length || message?.isRoll ) && message?.isContentVisible && canvas.tokens?.controlled.length;
	}

	options.push({
		name: 'Aplicar Dano',
		icon: '<i class="fas fa-user-minus" style="color: #CC0000;"></i>',
		value: 1,
		condition: canApply,
		callback: li => applyChatCardDamage(li, 1)
	}, {
		name: 'Aplicar Dano em Dobro',
		icon: '<i style="color: #CC0000;">2x </i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, 2)
	}, {
		name: 'Aplicar Dano pela Metade',
		icon: '<i style="color: #CC0000;">½ </i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, 0.5)
	}, {
		name: 'Aplicar Cura',
		icon: '<i class="fas fa-user-plus" style="color: #00AA00;"></i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, -1, true)
	}, {
		name: 'Gastar Mana',
		icon: '<i class="fas fa-star" style="color: #33A0FF;"></i>',
		condition: canApplyMana,
		callback: li => applyChatManaSpend(li, 0)
	});
	return options;
};

/**
 * Render Action Buttons Over chat-card
 */
export const ApplyButtons = function (app, html, data){
	let chatHTML = html.find(".message-content");//.find(".tormenta20.chat-card");
	if ( !chatHTML[0] ) return;
	chatHTML = chatHTML[0];
	
	let button;
	let btnparent;
	let btncontainer;
	// Get Element To Append to;
	// btnparent = chatHTML.querySelectorAll('.roll:not(.roll--dano) .dice-formula')[0];
	let btnCreate = function( text = '', classes = [], title = '', data = [] ){
		let b = document.createElement("button");
		b.innerHTML = text;
		b.classList.add(...classes);
		b.title = title;
		for (const d of data) {
			if ( Array.isArray(d) && d[0] && d[1] ){
				b.dataset[d[0]] = d[1];
			}
		}
		return b;
	}

	btnparent = chatHTML.querySelectorAll('.roll:not(.roll--dano)')[0];

	if( false && btnparent ){
		btncontainer = document.createElement("span");
		btncontainer.classList.add('dice-btn', 'formula', 'right');

		button = btnCreate('<i class="fas fa-redo"></i>', ['chat-reroll'], "Re-rolar");
		btncontainer.append(button);
		
		btnparent.append(btncontainer);
	}
	
	// Get Element To Append to;
	// btnparent = chatHTML.querySelectorAll('.roll--dano .dice-total')[0];
	// btnparent = chatHTML.querySelectorAll('.roll.roll--dano')[0];
	let btnparents = chatHTML.querySelectorAll('.roll.roll--dano');
	
	for (const btnparent of btnparents) {
		if( btnparent ){
			// Buttons Left
			btncontainer = document.createElement("span");
			btncontainer.classList.add('dice-btn', 'result', 'left');
		
			// Button Apply Damage
			button = btnCreate('<i class="fas fa-user-minus"></i>', ['apply-dmg'], "Aplicar Dano", [['mod',1]]);
			btncontainer.append(button);
	
			// Button Apply Damage Double
			button = btnCreate('2x', ['apply-dmg'], "Aplicar Dano em Dobro", [['mod',2]]);
			btncontainer.append(button);
			
			btnparent.append(btncontainer);
	
			// Buttons Right
			btncontainer = document.createElement("span");
			btncontainer.classList.add('dice-btn', 'result', 'right');
			
			// Button Apply Damage Half
			button = btnCreate('½', ['apply-dmg'], "Aplicar Metade do Dano", [['mod',0.5]]);
			btncontainer.append(button);
			
			// Button Apply Damage as Heal
			button = btnCreate('<i class="fas fa-user-plus"></i>', ['apply-dmg'], "Aplicar Cura", [['mod',-1]]);
			btncontainer.append(button);
	
			btnparent.append(btncontainer);
			
		}
		
	}

}

export const hideDieFlavor = function (ChatMessage, html, data){
	const coreMessage = !$(html).find(".tormenta20")[0];
	const haveDamageRoll = ChatMessage.rolls.find(r=> r._formula.match(/\[(\w+)\]/) && game.tormenta20.config.damageTypes[r._formula.match(/\[(\w+)\]/)[1]]);
	const rolls = $(html).find(".dice-roll");
	if ( coreMessage && haveDamageRoll ){
		$(html).find('.message-content').append('<div class="roll roll--dano"></div>');
		$(html).find('.message-content').addClass('tormenta20 chat-card item-card');
		
		for (const roll of rolls) {
			$(roll).find('.dice-formula')[0].textContent = $(roll).find('.dice-formula')[0].textContent.replace(/\[\w+\]/g, '');
			$(html).find(".roll.roll--dano").append($(roll));
		}
	}
}

	export const chatListeners = function (html){
		html.on('click', '.item-name', _onChatCardToggleContent.bind(this));
		html.on('click', '.chat-message', _onChatCardToggleDamage.bind(this));
		html.on('click', '.chat-apply-ae', _onChatCardApplyEffect.bind(this));
		html.on('click', '.chat-place-template', _onChatPlaceTemplate.bind(this));
		
		//html.on('click', '.chat-reroll', _onChatReRoll.bind(this));
		html.on('click', '.apply-dmg', _onChatApplyDamage.bind(this));
		html.on('click', '.chat-spend-mana', _onChatSpendMana.bind(this));
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */
	
	/**
	 * TODO [Delayed to V10 to use Message With Multi Rolls]
	 * Call Reroll Method for selected roll and update chat card
	 * @param {HTMLElement} roll The chat entry which contains the roll data
	 */
	function _onChatReRoll(event){
		event.preventDefault();
		const btn = event.currentTarget;
		const chatCardId = btn.closest(".chat-message").dataset.messageId;
		const message = game.messages.get(chatCardId);
	}

	function _onChatSpendCatarse(event){
		event.preventDefault();
		const btn = event.currentTarget;
		const chatCardId = btn.closest(".chat-message").dataset.messageId;
		const message = game.messages.get(chatCardId);
	}

	function _callApplyDamage( roll, multiplier ){
		if (canvas.tokens.controlled.length) {
			return Promise.all(canvas.tokens.controlled.map(tk => {
				if( roll ) return tk.actor.applyDamageV2(roll, multiplier, true);
				// return tk.actor.applyDamage(amount, multiplier, true);
			}));
		} else {
			ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
		}
	}

	/**
	* Get rolled damage value and call Actor apply damage Method
	*/
	function _onChatApplyDamage(event) {
		event.preventDefault();
		const btn = event.currentTarget;
		const amount = Number(btn.closest(".roll").querySelector(".dice-total").innerText);
		const multiplier = Number(btn.dataset.mod);
		const chatCardId = btn.closest(".chat-message").dataset.messageId;
		const message = game.messages.get(chatCardId);
		const rollTitle = btn.closest(".roll").dataset.rollTitle;
		const roll =  message.rolls.find( r => r.options.title == rollTitle && r.options.type == 'damage' );
		
		if( amount && multiplier ){
			if (canvas.tokens.controlled.length) {
				return Promise.all(canvas.tokens.controlled.map(tk => {
					if( roll ) return tk.actor.applyDamageV2(roll, multiplier, true);
					return tk.actor.applyDamage(amount, multiplier, true);
				}));
			} else {
				ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
			}
		}
	}

	/**
	* Apply rolled dice damage to the token or tokens which are currently controlled.
	* This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
	*
	* @param {HTMLElement} li The chat entry which contains the roll data
	* @param {Number} multiplier A damage multiplier to apply to the rolled damage.
	* @return {Promise}
	*/
	async function applyChatCardDamage(li, multiplier) {
		const message = game.messages.get( li.data('messageId') );
		const rolls =  message.rolls.filter( r => r.options.type == 'damage' );
		let roll;
		if ( rolls.length > 1 ) {
			let options = rolls.map(r => `<option value="${r.options.title}">${r.options.title} (${r.total})</option>`)
			let chosen;
			await new Dialog({
				title: "Escolha a rolagem",
				content: `<select name="roll" style="width:30%; margin:10px 35%;">${options.join()}</select>`,
				buttons: {
					yes: {
						label: "Confirma",
						callback: html => {
							chosen = html.find("[name=roll]")[0].value;
							roll = rolls.find(r => r.options.title == chosen );
							if ( roll ) _callApplyDamage( roll , multiplier );
						}
					},
					no: { label: "Cancela" }
				}
			}).render(true);
			return;
		} else { 
			roll = rolls.pop();
			if ( roll ) _callApplyDamage( roll , multiplier );
		}
	}

	function applyChatCardDamageOld(message, multiplier) {
		if (canvas.tokens.controlled.length) {
			let roll = message.find('.roll--dano') ?? message.find('.dice-roll');
			const amount = roll.find('.dice-total').text();
			return Promise.all(canvas.tokens.controlled.map(t => {
				const a = t.actor;
				return a.applyDamage(amount, multiplier, true);
			}));
		}
		else {
			ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
		}
	}

/**
	* Get mana cost value and call Actor spend mana Method
	* @param {Event} event   The originating click event
	* @private
	*/
	function _onChatSpendMana(event) {
		event.preventDefault();
		const btn = event.currentTarget;
		const amount = Number(btn.value);
		if (canvas.tokens.controlled.length) {
			return Promise.all(canvas.tokens.controlled.map(tk => {
				const actor = tk.actor;
				return actor.spendMana(amount, 0, false);
			}));
		}
		else {
			ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os gastos de mana");
		}
	}

	
/**
 * Apply mana points spent to the token or tokens which are currently controlled.
 * This allows for damage to be adjusted due to reduced or expanded cost
 *
 * @param {HTMLElement} message The chat entry which contains the mana cost
 * @param {Number} adjust A adjust value to apply to the cost.
 * @return {Promise}
 */
	function applyChatManaSpend(message, adjust, recover = false) {
		if (canvas.tokens.controlled.length) {
			const amount = message.find('.chat-spend-mana').val();
			return Promise.all(canvas.tokens.controlled.map(tk => {
				const actor = tk.actor;
				return actor.spendMana(amount, adjust, recover);
			}));
		} else {
			ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os gastos de mana");
		}
	}


/**
	* Handle toggling the visibility of chat card content when the name is clicked
	* @param {Event} event   The originating click event
	* @private
	*/
	function _onChatCardToggleContent(event) {
		event.preventDefault();
		const chatCard = event.currentTarget.closest(".chat-message");
		const content = chatCard.querySelector(".card-content");
		content.style.display = content.style.display === "none" ? "block" : "none";
	}

	function _onChatCardToggleDamage(event) {
		event.preventDefault();
		const chatCard = event.currentTarget.closest(".chat-message");
		const minimal = chatCard.querySelector(".card-damage");
		const details = chatCard.querySelector(".card-damage-details");
		if( minimal && details ) {
			minimal.style.display = minimal.style.display === "none" ? "block" : "none";
			details.style.display = details.style.display === "none" ? "block" : "none";
		}
	}
	

	/**
		* Retrieve AbilityTemplate data and Draw on Canvas
		* @param {Event} event   The originating click event
		* @private
		*/
	function _onChatPlaceTemplate(event) {
		event.preventDefault();
		const chatCardId = event.currentTarget.closest(".chat-message").dataset.messageId;
		const chatCard = game.messages.get(chatCardId);
		const button = event.currentTarget;
		const card = button.closest(".chat-card");

		const actor = game.actors.get(card.dataset.actorId);
		if( !actor ) return;

		const storedData = chatCard.getFlag("tormenta20", "itemData");
		const storedTemplate = chatCard.getFlag("tormenta20", "template");
		// let item = new game.tormenta20.entities.ItemT20(storedData, {name:'temp',type:'tesouro',parent: actor});
		let item = { system: storedTemplate, actor: actor };
		// new game.tormenta20.entities.ItemT20()
		// new game.tormenta20.canvas.AbilityTemplate()
		if( !item ) return;
		item.system.area = storedTemplate.area;
		item.system.alcance = storedTemplate.alcance;
		
		const template = game.tormenta20.canvas.AbilityTemplate.fromItem(item);
		if ( template ) {
			template.drawPreview();
		}
	}


/**
	* Handle Active Effetcs Applying on Tokens
	* @param {Event} event   The originating click event
	* @private
	*/
	async function _onChatCardApplyEffect(event) {
		event.preventDefault();
		const chatCardId = event.currentTarget.closest(".chat-message").dataset.messageId;
		const actorId = event.currentTarget.closest(".item-card").dataset.actorId;
		const buttonId = event.currentTarget.dataset.effectIndex;
		const actors = canvas.tokens.controlled;
		if ( actors.length && buttonId>=0){
			const chatEffect = game.messages.get(chatCardId).flags.tormenta20?.effects[buttonId];
			if( chatEffect[0].duration.seconds ) {
				chatEffect[0].duration.startTime = game.time.worldTime;
			}
			
			let toChat = true;
			for ( let ac of actors ) {
				await ac.actor.createEmbeddedDocuments("ActiveEffect", [...chatEffect], {
					toChat: toChat
				});
				toChat = false;
			}
		}
		else if (actors.length == 0) {
			ui.notifications.warn("Você precisa selecionar pelo menos um token.");
		}
	}


	/* -------------------------------------------- */
	/*  /Chat Message Helpers                       */
	/* -------------------------------------------- */
	/**
	 * Highlight critical success or failure on d20 rolls
	 * TODO CHANGE THIS
	 */
	export const highlightCriticalSuccessFailure = function(message, html, data) {
		if ( !message.isRoll || !message.isContentVisible ) return;

		// Highlight rolls where the first part is a d20 roll
		const roll = message.roll;
		if ( !roll.dice.length ) return;
		const d = roll.dice[0];

		// Ensure it is an un-modified d20 roll
		const isD20 = (d.faces === 20) && ( d.values.length === 1 );
		if ( !isD20 ) return;
		const isModifiedRoll = ("success" in d.results[0]) || d.options.marginSuccess || d.options.marginFailure;
		if ( isModifiedRoll ) return;

		// Highlight successes and failures
		const critical = d.options.critical || 20;
		const fumble = d.options.fumble || 1;
		if ( d.total >= critical ) html.find(".dice-total").addClass("critical");
		else if ( d.total <= fumble ) html.find(".dice-total").addClass("fumble");
		else if ( d.options.target ) {
			if ( roll.total >= d.options.target ) html.find(".dice-total").addClass("success");
			else html.find(".dice-total").addClass("failure");
		}
	};
