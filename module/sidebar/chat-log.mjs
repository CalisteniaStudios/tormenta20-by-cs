export default class ChatLogTormenta20 extends foundry.applications.sidebar.tabs.ChatLog {
	_getEntryContextOptions() {
		const context = super._getEntryContextOptions();
		const canApply = li => {
			const message = game.messages.get(li.dataset.messageId);
			return ( li.querySelector(".roll--dano") || message?.isRoll ) && message?.isContentVisible && canvas.tokens?.controlled.length;
		};
		const canApplyMana = li => {
			const message = game.messages.get(li.dataset.messageId);
			return ( li.querySelector(".mana-cost, .chat-spend-mana") || message?.isRoll ) && message?.isContentVisible && canvas.tokens?.controlled.length;
		}
		return [
			...context,
			{
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
			}
		]
	}
}