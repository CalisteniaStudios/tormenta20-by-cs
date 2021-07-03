/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html The Chat Message being rendered
 * @param {Array} options The Array of Context Menu options
 *
 * @return {Array} The extended options Array including new context choices
 */
export const addChatMessageContextOptions = function (html, options) {
	let canApply = li => li.find(".roll--dano").length;
	let canApplyMana = li => li.find(".mana-cost").length && !game.settings.get("tormenta20", "automaticManaSpend");
	options.push({
		name: 'Aplicar Dano',
		icon: '<i class="fas fa-user-minus" style="color: FireBrick;"></i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, 1)
	}, {
		name: 'Aplicar Dano em Dobro',
		icon: '<i style="color: FireBrick;">2x </i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, 2)
	}, {
		name: 'Aplicar Dano pela Metade',
		icon: '<i style="color: FireBrick;">½ </i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, 0.5)
	}, {
		name: 'Aplicar Cura',
		icon: '<i class="fas fa-user-plus" style="color: SeaGreen;"></i>',
		condition: canApply,
		callback: li => applyChatCardDamage(li, -1, true)
	}, {
		name: 'Gastar Mana',
		icon: '<i class="fas fa-star" style="color: deepskyblue;"></i>',
		condition: canApplyMana,
		callback: li => applyChatManaSpend(li, 0)
	});
	return options;
};

export const ApplyButtons = function (app, html, data)
{
	let chatHTML = html.find(".tormenta20.chat-card");
	if ( !chatHTML[0] ) return;
	chatHTML = chatHTML[0];
	let botaoAdicionado	= false;

	const btnHtml = function(b){
		return `<td class="apply-button" title="${b.title}"><button class="apply-button-b ${b.class}" style="${b.style}"> ${b.text}</button></td>`;
	}
	let b = {};

	if(chatHTML.querySelectorAll(".mana-cost, .roll--dano").length > 0) {
		let areaBotoes = $(`<hr><div><table class="apply-area"><tbody><div class="flexrow"></div></tbody></table></div>`);

		if(chatHTML.querySelectorAll(".roll--dano").length > 0) {
			// Aplicar dano
			b.title = "Aplicar Dano";
			b.class = "apply-button-dano"; 
			b.text  = '<i class="fas fa-user-minus apply-button-img"></i>';
			b.style = "background:firebrick;";
			const botaoDanoAplicar = $(btnHtml(b));
			areaBotoes.find(".flexrow").append(botaoDanoAplicar);
			botaoDanoAplicar.click(ev => {
				ev.stopPropagation();
				let roll = chatHTML.querySelectorAll(".roll--dano > .dice-roll > .dice-result > .dice-total")[0].innerHTML;
				applyInsideChatCardDamage(roll,1);
			});
			
			// Dobro
			b.title = "Aplicar Dano em Dobro";
			b.class = "apply-button-dano-dobro";
			b.text  = "2x";
			b.style = "background:firebrick; font-size: 25px;";
			const botaoDanoDobroAplicar = $(btnHtml(b));
			areaBotoes.find(".flexrow").append(botaoDanoDobroAplicar);
			botaoDanoDobroAplicar.click(ev => {
				ev.stopPropagation();
				let roll = chatHTML.querySelectorAll(".roll--dano > .dice-roll > .dice-result > .dice-total")[0].innerHTML;
				applyInsideChatCardDamage(roll,2);
			});
			// Metade
			b.title = "Aplicar Metade do Dano";
			b.class = "apply-button-dano-metade";
			b.text  = "½";
			b.style = "background:FireBrick; font-size: 25px;";
			const botaoDanoMetadeAplicar = $(btnHtml(b));
			areaBotoes.find(".flexrow").append(botaoDanoMetadeAplicar);
			botaoDanoMetadeAplicar.click(ev => {
				ev.stopPropagation();
				let roll = chatHTML.querySelectorAll(".roll--dano > .dice-roll > .dice-result > .dice-total")[0].innerHTML;
				applyInsideChatCardDamage(roll,0.5);
			});

			
			// Cura
			b.title = "Aplicar Cura";
			b.class = "apply-button-cura";
			b.text = '<i class="fas fa-user-plus apply-button-img"></i>';
			b.style = "background:SeaGreen;";
			const botaoCuraAplicar = $(btnHtml(b));
			areaBotoes.find(".flexrow").append(botaoCuraAplicar);
			botaoCuraAplicar.click(ev => {
				ev.stopPropagation();
				let roll = chatHTML.querySelectorAll(".roll--dano > .dice-roll > .dice-result > .dice-total")[0].innerHTML;
				applyInsideChatCardDamage(roll,-1,true);
			});
			botaoAdicionado = true;
		}
		if(chatHTML.querySelectorAll(".mana-cost").length > 0 && !game.settings.get("tormenta20", "automaticManaSpend"))
		{
			// Mana
			b.title = "Gastar Mana";
			b.class = "apply-button-mana";
			b.text  = '<i class="fas fa-star apply-button-img"></i>';
			b.style = "background:deepskyblue;";
			const botaoGastoMana = $(btnHtml(b));
			areaBotoes.find(".flexrow").append(botaoGastoMana);
			botaoGastoMana.click(ev => {
				ev.stopPropagation();
				let custo = chatHTML.querySelectorAll(".mana-cost")[0].innerHTML;
				applyInsideChatManaSpend(custo);
			});
			botaoAdicionado = true;
		}
		if (botaoAdicionado) {
			html.find('.item-card').append(areaBotoes);
		}
	}
}

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} roll The chat entry which contains the roll data
 * @param {Number} multiplier A damage multiplier to apply to the rolled damage.
 * @return {Promise}
 */
function applyChatCardDamage(roll, multiplier, heal = false) {
	if (canvas.tokens.controlled.length) {
		const amount = roll.find('.roll--dano').find('.dice-total').text();
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			return a.applyDamage(amount, multiplier, heal);
		}));
	}
	else {
		ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
	}
}



/**
 * Apply mana points spent to the token or tokens which are currently controlled.
 * This allows for damage to be adjusted due to reduced or expanded cost
 *
 * @param {HTMLElement} mana The chat entry which contains the mana cost
 * @param {Number} adjust A adjust value to apply to the cost.
 * @return {Promise}
 */
function applyChatManaSpend(mana, adjust, recover = false) {
	if (canvas.tokens.controlled.length) {
		const amount = mana.find('.mana-cost').text();
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			return a.spendMana(amount, adjust, recover);
		}));
	}
	else {
		ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os gastos de mana");
	}
}

function applyInsideChatManaSpend(mana) {
	if (canvas.tokens.controlled.length) {
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			return a.spendMana(mana, 0, false);
		}));
	}
	else {
		ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os gastos de mana");
	}
}

function applyInsideChatCardDamage(amount, multiplier, heal = false) {
	if (canvas.tokens.controlled.length) {
		// const amount = roll.find('.dice-total').text();
		return Promise.all(canvas.tokens.controlled.map(t => {
			const a = t.actor;
			return a.applyDamage(amount, multiplier, heal);
		}));
	}
	else {
		ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
	}
}


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
