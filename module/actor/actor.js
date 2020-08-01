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
      if(pericia.treinado){
        pericia.treino = (nivel >14 ? 6 : (nivel > 6 ? 4 : 2))
      } else {
        pericia.treino = 0;
      }

      var atributo = pericia.atributo;
      pericia.mod = data.atributos[atributo].mod;
      pericia.value = Math.floor(nivel/2) + Number(pericia.treino) + Number(pericia.mod) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado? Math.abs(data.escudo.penalidade) : 0) : 0));
    }

    for (let [key, pericia] of Object.entries(data.pericias.ofi.mais)) {
      // Calculate the pericias .
      if(pericia.treinado){
        pericia.treino = (nivel >14 ? 6 : (nivel > 6 ? 4 : 2))
      } else {
        pericia.treino = 0;
      }

      pericia.nome = pericia.label.replace(/[\*\+]/g,'').trim();
      //.match(/\w+([\s\w]+)?\b/g)?  pericia.label.match(/\w+([\s\w]+)?\b/g)[0] : '';
      
      pericia.st = (pericia.label.match(/\+/g) ? true : false);
      pericia.pda = (pericia.label.match(/\*/g) ? true : false);
      
      var atributo = pericia.atributo;
      pericia.mod = data.atributos[atributo].mod;
      pericia.value = Math.floor(nivel/2) + Number(pericia.treino) + Number(pericia.mod) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado? Math.abs(data.escudo.penalidade) : 0) : 0));
    }

    for (let [key, pericia] of Object.entries(data.periciasCustom)) {
      // Calculate the pericias .
      if(pericia.treinado){
        pericia.treino = (nivel >14 ? 6 : (nivel > 6 ? 4 : 2))
      } else {
        pericia.treino = 0;
      }

      pericia.nome = pericia.label.replace(/[\*\+]/g,'').trim();
      //match(/\w+([\s\w]+)?\b/g)?  pericia.label.match(/\w+([\s\w]+)?\b/g)[0] : '';
      
      pericia.st = (pericia.label.match(/\+/g) ? true : false);
      pericia.pda = (pericia.label.match(/\*/g) ? true : false);
      
      var atributo = pericia.atributo;
      pericia.mod = data.atributos[atributo].mod;
      pericia.value = Math.floor(nivel/2) + Number(pericia.treino) + Number(pericia.mod) + Number(pericia.outros) - Number((pericia.pda ? (data.armadura.equipado ? Math.abs(data.armadura.penalidade) : 0) + (data.escudo.equipado? Math.abs(data.escudo.penalidade) : 0) : 0));
    }
    
    data.defesa.armad = data.armadura.equipado ? Number(data.armadura.defesa) : 0;
    data.defesa.escud = data.escudo.equipado ? Number(data.escudo.defesa) : 0;
    data.defesa.value = 10 + Number((data.defesa.des ? data.atributos.des.mod : 0))
                        + Number(data.defesa.armad) + Number(data.defesa.escud)
                        + Number(data.defesa.outro);

    
  }


}