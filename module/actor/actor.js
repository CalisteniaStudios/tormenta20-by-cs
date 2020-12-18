import { T20Utility } from '../utility.js';
/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class T20Actor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'npc') this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareNpcData(actorData) {
    const data = actorData.data;
    // Make modifications to data here. For example:
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.atributos)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;
    // console.log(data);
    // Make modifications to data here. For example:
    var nivel = data.attributes.nivel.value;

    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.atributos)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }

    for (let [key, pericia] of Object.entries(data.pericias)) {
      // Calculate the pericias .
      if (pericia.treinado) {
        pericia.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2))
      } else {
        pericia.treino = 0;
      }

      var atributo = pericia.atributo;
      pericia.mod = data.atributos[atributo].mod;
      pericia.value = Math.floor(nivel / 2) + Number(pericia.treino) + Number(pericia.mod) + Number(pericia.temp ?? 0) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado ? Math.abs(data.escudo.penalidade) : 0) : 0));
    }
    
    if(data.pericias.ofi.mais){
      for (let [key, pericia] of Object.entries(data.pericias.ofi.mais)) {
        // Calculate the pericias .
        if (pericia.treinado) {
          pericia.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2))
        } else {
          pericia.treino = 0;
        }

        pericia.nome = String(pericia.label).replace(/[\*\+]/g, '').trim();
        //.match(/\w+([\s\w]+)?\b/g)?  pericia.label.match(/\w+([\s\w]+)?\b/g)[0] : '';

        pericia.st = (pericia.label.match(/\+/g) ? true : false);
        pericia.pda = (pericia.label.match(/\*/g) ? true : false);

        var atributo = pericia.atributo;
        pericia.mod = data.atributos[atributo].mod;
        pericia.value = Math.floor(nivel / 2) + Number(pericia.treino) + Number(pericia.mod)  + Number(pericia.temp ?? 0) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado ? Math.abs(data.escudo.penalidade) : 0) : 0));
      }
    }
    if(data.periciasCustom){
      for (let [key, pericia] of Object.entries(data.periciasCustom)) {
        // Calculate the pericias .
        if (pericia.treinado) {
          pericia.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2))
        } else {
          pericia.treino = 0;
        }

        pericia.nome = pericia.label.replace(/[\*\+]/g, '').trim();
        //match(/\w+([\s\w]+)?\b/g)?  pericia.label.match(/\w+([\s\w]+)?\b/g)[0] : '';

        pericia.st = (pericia.label.match(/\*/g) ? true : false);
        pericia.pda = (pericia.label.match(/\+/g) ? true : false);

        var atributo = pericia.atributo;
        pericia.mod = data.atributos[atributo].mod;
        pericia.value = Math.floor(nivel / 2) + Number(pericia.treino) + Number(pericia.mod)  + Number(pericia.temp ?? 0) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado ? Math.abs(data.escudo.penalidade) : 0) : 0));
      }
    }

    data.defesa.armad = data.armadura.equipado ? Number(data.armadura.defesa) : 0;
    data.defesa.escud = data.escudo.equipado ? Number(data.escudo.defesa) : 0;
    data.defesa.value = 10 + Number((data.defesa.des ? data.atributos.des.mod : 0)) +
      Number(data.defesa.armad) + Number(data.defesa.escud) +
      Number(data.defesa.outro);

    data.rd.value = data.rd.base + data.rd.temp

    // for compatibility with dnd modules
    data.attributes.hp = data.attributes.pv.value

  }

  /**
   * Apply a certain amount of damage or healing to the health pool for Actor
   * @param {number} amount       An amount of damage (positive) or healing (negative) to sustain
   * @param {number} multiplier   A multiplier which allows for resistance, vulnerability, or healing
   * @return {Promise<Actor>}     A Promise which resolves once the damage has been applied
   */
  async applyDamage(amount = 0, multiplier = 1, heal) {

    let toChat = (speaker, message) => {
      let chatData = {
        user: game.user.id,
        content: message,
        speaker: ChatMessage.getSpeaker(speaker),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
      }
      ChatMessage.create(chatData, {})
    }

    let damageHealth = 0
    let tmpPVDamage
    let chatMessage = ''
    let newDmgAmount = amount

    const pv = this.data.data.attributes.pv;
    const totalRd = this.data.data.rd.value;
    const tmpPV = parseInt(pv.temp) || 0;
    if (heal) {
      tmpPVDamage = 0;
      newDmgAmount = amount;
      damageHealth = Math.clamped(pv.value + newDmgAmount, 0, pv.max);
      chatMessage = `<i class="fas fa-user-plus"></i> +${newDmgAmount} pontos PV`;
    } else {
      amount = Math.floor(parseInt(amount) * multiplier);
      newDmgAmount = amount;
      if (totalRd > 0) {
        newDmgAmount = Math.max(newDmgAmount - totalRd, 0);
      }

      // Deduct damage from temp HP first
      
      tmpPVDamage = newDmgAmount > 0 ? Math.min(tmpPV, newDmgAmount) : 0;

      chatMessage = `<i class="fas fa-user-minus"></i> ${newDmgAmount} pontos PV`;
      if (totalRd > 0) {
        chatMessage += `<br/>(${amount} - RD${totalRd})`;
      }

      // Remaining goes to health
      damageHealth = Math.clamped(pv.value - (newDmgAmount - tmpPVDamage), 0, pv.max);
    }
    toChat(this, chatMessage);

    // Update the Actor
    return this.update({
      "data.attributes.pv.temp": tmpPV - tmpPVDamage,
      "data.attributes.pv.value": damageHealth
    });
  }



  /**
   * Spend or recover mana points for Actor
   * @param {number} amount       An amount of spent (positive) or recover (negative) mana points
   * @param {number} adjust       A adjust for the value due to specific conditions
   * @return {Promise<Actor>}     A Promise which resolves once the damage has been applied
   */
  async spendMana(amount = 0, adjust = 0, recover) {

    let toChat = (speaker, message) => {
      let chatData = {
        user: game.user.id,
        content: message,
        speaker: ChatMessage.getSpeaker(speaker),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER
      }
      ChatMessage.create(chatData, {})
    }

    let spendMana = 0
    let tmpPMspend
    let chatMessage = ''
    let newSptAmount = amount

    const pm = this.data.data.attributes.pm;
    const tmpPM = parseInt(pm.temp) || 0;
    if (recover) {
      tmpPMspend = 0;
      newSptAmount = amount;
      spendMana = Math.clamped(pm.value + newSptAmount, 0, pm.max);
      chatMessage = `<i class="fas fa-recover-mana"></i> +${newSptAmount} pontos PM`;
    } else {
      amount = Math.floor(parseInt(amount) + adjust);
      newSptAmount = amount;

      // Deduct damage from temp Mana first
      
      tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;

      chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} pontos PM`;

      // Remaining goes to health
      spendMana = Math.clamped(pm.value - (newSptAmount - tmpPMspend), 0, pm.max);
    }
    toChat(this, chatMessage);
        // Update the Actor
        return this.update({
          "data.attributes.pm.temp": tmpPM - tmpPMspend,
          "data.attributes.pm.value": spendMana
        });
  }

}