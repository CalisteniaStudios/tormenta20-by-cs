/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class tormenta20Actor extends Actor {

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
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    const data = actorData.data;
    // Make modifications to data here. For example:
    var nivel = data.attributes.nivel.value;
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(data.atributos)) {
      // Calculate the modifier using d20 rules.
      ability.mod = Math.floor((ability.value - 10) / 2);
    }

    for (let [key, pericia] of Object.entries(data.pericias)) {
      // Calculate the pericias .
      if(pericia.treinado){
        pericia.treino = (nivel >14 ? 6 : (nivel > 6 ? 4 : 2))
      } else {
        pericia.treino = 0;
      }

      var atributo = pericia.atributo;
      pericia.mod = data.atributos[atributo].mod;
      pericia.value = Math.floor(nivel/2) + Number(pericia.treino) + Number(pericia.mod) + Number(pericia.outros) - Number((pericia.pda ? Math.abs(data.armadura.penalidade) + Math.abs(data.escudo.penalidade) : 0));
    }

    data.defesa.armad = Number(data.armadura.defesa);
    data.defesa.escud = Number(data.escudo.defesa);
    data.defesa.value = 10 + Number((data.defesa.des ? data.atributos.des.mod : 0))
                        + Number(data.armadura.defesa) + Number(data.escudo.defesa)
                        + Number(data.defesa.outro);

    
  }


}