const _TokenToggleEffect = Token.prototype.toggleEffect;
export const toggleEffect = async function (...args) {
  const data = _TokenToggleEffect.bind(this)(...args);
  let condicao = args[0].id;
  //await resolveConditions(this.actor, condicao);
  return data;
};

async function resolveConditions(actor, condicao) {
  if (condicao) {
    let activeCond = findCondition(actor.effects, condicao);
    switch (condicao) {
      case "abalado":
        if (activeCond != null) {
          //Retirar abalado
          await ModificarTodasAsPericias(actor, 0);
        } else {
          //Adicionar abalado
          await ModificarTodasAsPericias(actor, -2);
        }
        break;
      case "agarrado":
        break;
      case "alquebrado":
        break;
      case "apavorado":
        break;
      case "atordoado":
        break;
      case "caido":
        break;
      case "cego":
        break;
      case "confuso":
        break;
      case "debilitado":
        if (activeCond != null) {
          //Retirar debilitado
          await actor.update({ ["data.atributos.for.temp"]: -0 });
          await actor.update({ ["data.atributos.des.temp"]: -0 });
          await actor.update({ ["data.atributos.con.temp"]: -0 });
        } else {
          //Adicionar debilitado
          await actor.update({ ["data.atributos.for.temp"]: -5 });
          await actor.update({ ["data.atributos.des.temp"]: -5 });
          await actor.update({ ["data.atributos.con.temp"]: -5 });
        }
        break;
      case "desprevenido":
        if (activeCond != null) {
          //Retirar vulnerável
          await actor.update({ ["data.defesa.temp"]: 0 });
          await actor.update({ ["data.pericias.ref.temp"]: 0 });
        } else {
          //Adicionar vulnerável
          await actor.update({ ["data.defesa.temp"]: -5 });
          await actor.update({ ["data.pericias.ref.temp"]: 5 });
        }
        break;
      case "doente":
        break;
      case "em-chamas":
        break;
      case "enjoado":
        break;
      case "enredado":
        break;
      case "envenenado":
        break;
      case "esmorecido":
        if (activeCond != null) {
          //Retirar debilitado
          await actor.update({ ["data.atributos.int.temp"]: -0 });
          await actor.update({ ["data.atributos.sab.temp"]: -0 });
          await actor.update({ ["data.atributos.car.temp"]: -0 });
        } else {
          //Adicionar debilitado
          await actor.update({ ["data.atributos.int.temp"]: -5 });
          await actor.update({ ["data.atributos.sab.temp"]: -5 });
          await actor.update({ ["data.atributos.car.temp"]: -5 });
        }
        break;
      case "exausto":
        break;
      case "fascinado":
        break;
      case "fatigado":
        break;
      case "fraco":
        break;
      case "frustrado":
        break;
      case "imovel":
        break;
      case "inconsciente":
        break;
      case "indefeso":
        break;
      case "lento":
        break;
      case "ofuscado":
        break;
      case "paralisado":
        break;
      case "pasmo":
        break;
      case "petrificado":
        break;
      case "sangrando":
        break;
      case "surdo":
        break;
      case "surpreendido":
        break;
      case "vulneravel":
        if (activeCond != null) {
          //Retirar vulnerável
          await actor.update({ ["data.defesa.temp"]: 0 });
        } else {
          //Adicionar vulnerável
          await actor.update({ ["data.defesa.temp"]: -2 });
        }
        break;
    }
  }
}

function findCondition(effects, condicao) {
  let condic = null;
  effects.forEach((element) => {
    if (element.data.flags.core.statusId == condicao) condic = element;
  });

  return condic;
}

async function ModificarTodasAsPericias(actor, valor) {
  for (let [key, pericia] of Object.entries(actor.data.data.pericias)) {
    await actor.update({ ["data.pericias." + key + ".temp"]: valor });
  }

  let oficios = actor.data.data.pericias.ofi.mais;
  if (oficios.length == undefined || oficios.length > 0) {
    let c = 0;
    for (var i in actor.data.data.pericias.ofi.mais) {
      oficios[c] = actor.data.data.pericias.ofi.mais[i];
      oficios[c].temp = valor;
      c++;
    }
    await actor.update({ "data.pericias.ofi.mais": oficios });
  }

  let periciasCustom = actor.data.data.periciasCustom;
  if (periciasCustom.length == undefined || periciasCustom.length > 0) {
    let c = 0;
    for (var i in actor.data.data.periciasCustom) {
      periciasCustom[c] = actor.data.data.periciasCustom[i];
      periciasCustom[c].temp = valor;
      c++;
    }
    await actor.update({ "data.periciasCustom": periciasCustom });
  }
}
