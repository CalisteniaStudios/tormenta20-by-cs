export class T20Utility {
    static short(curto, actor){
    let value = null;
    let atr = curto.replace("@","");
    if(value == null){
      for (let [key, ability] of Object.entries(actor.atributos)) {
        // Calculate the modifier using d20 rules.
        if(key == atr){
          value = ability.mod;
        }
      }
    }
    if(value == null){
      for (let [key, pericias] of Object.entries(actor.pericias)) {
        // Calculate the modifier using d20 rules.
        if(pericias.label.toLowerCase() == atr){
          value = pericias.value;
        }
      }
    }

    if(value == null){
      for (let [key, pericias] of Object.entries(actor.pericias.ofi.mais)) {
        // Calculate the modifier using d20 rules.
        if(pericias.label.toLowerCase() == atr){
          value = pericias.value;
        }
      }
    }

    if(value == null){
      for (let [key, pericias] of Object.entries(actor.periciasCustom)) {
        // Calculate the modifier using d20 rules.
        if(pericias.label.toLowerCase() == atr){
          value = pericias.value;
        }
      }
    }
    if(value == null){
      return 0;
    }
    return value;
  }

}