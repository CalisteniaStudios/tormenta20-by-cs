/**
 * This function is used to hook into the Chat Log context menu to add additional options to each message
 * These options make it easy to conveniently apply damage to controlled tokens based on the value of a Roll
 *
 * @param {HTMLElement} html    The Chat Message being rendered
 * @param {Array} options       The Array of Context Menu options
 *
 * @return {Array}              The extended options Array including new context choices
 */
export const addChatMessageContextOptions = function (html, options) {
    // let canApply = li => canvas.tokens.controlled.length && li.find(".dice-roll").length;
    let canApply = li => li.find(".roll--dano").length;
    let canApplyMana = li => li.find(".mana-cost").length && !game.settings.get("tormenta20", "automaticManaSpend");
    options.push({
        name: 'Aplicar Dano',
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, 1)
    }, {
        name: 'Aplicar Cura',
        icon: '<i class="fas fa-user-plus"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, -1, true)
    }, {
        name: 'Aplicar Dano em Dobro',
        icon: '<i class="fas fa-user-injured"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, 2)
    }, {
        name: 'Aplicar Dano pela Metade',
        icon: '<i class="fas fa-user-shield"></i>',
        condition: canApply,
        callback: li => applyChatCardDamage(li, 0.5)
    }, {
        name: 'Gastar Mana',
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApplyMana,
        callback: li => applyChatManaSpend(li, 0)
    });
    return options;
};

/**
 * Apply rolled dice damage to the token or tokens which are currently controlled.
 * This allows for damage to be scaled by a multiplier to account for healing, critical hits, or resistance
 *
 * @param {HTMLElement} roll    The chat entry which contains the roll data
 * @param {Number} multiplier   A damage multiplier to apply to the rolled damage.
 * @return {Promise}
 */
function applyChatCardDamage(roll, multiplier, heal = false) {
    if (canvas.tokens.controlled.length) {
        // const amount = roll.find('.dice-total').text();
        const amount = roll.find('.roll--dano').find('.dice-total').text();
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.applyDamage(amount, multiplier, heal);
        }));
    } else {
        ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os valores rolados");
    }
}

/**
 * Apply mana points spent to the token or tokens which are currently controlled.
 * This allows for damage to be adjusted due to reduced or expanded cost
 *
 * @param {HTMLElement} mana    The chat entry which contains the mana cost
 * @param {Number} adjust   A adjust value to apply to the cost.
 * @return {Promise}
 */
function applyChatManaSpend(mana, adjust, recover = false) {
    if (canvas.tokens.controlled.length) {
        const amount = mana.find('.mana-cost').text();
        return Promise.all(canvas.tokens.controlled.map(t => {
            const a = t.actor;
            return a.spendMana(amount, adjust, recover);
        }));
    } else {
        ui.notifications.warn("É necessario selecionar um ou mais tokens, para aplicar os gastos de mana");
    }
}