const _TokenToggleEffect = Token.prototype.toggleEffect;
export const toggleEffect = async function (...args) {
  const data = _TokenToggleEffect.bind(this)(...args);
  let condicao = args[0].id;
  await resolveConditions(this.actor, condicao);
  return data;
};

async function resolveConditions(actor, condicao) {
  if (condicao) {
    let activeCond = findCondition(actor.effects, condicao);
    switch (condicao) {
      case "abalado":
        if (activeCond != null) {
            await ModificarPericias(actor, 0);
        } else {
            await ModificarPericias(actor, -2);
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

async function ModificarPericias(actor, valor) {
  for (let [key, pericia] of Object.entries(actor.data.data.pericias)) {
    await actor.update({
      ["data.pericias." + key + ".temp"]: valor,
    });
  }

  let oficios = actor.data.data.pericias.ofi.mais;
  if (oficios.length == undefined || oficios.length >0) {
    let c = 0;
    for (var i in actor.data.data.pericias.ofi.mais) {
      oficios[c] = actor.data.data.pericias.ofi.mais[i];
      oficios[c].temp = valor;
      c++;
    }
    await actor.update({ "data.pericias.ofi.mais": oficios });
  }

  let periciasCustom = actor.data.data.periciasCustom;
  if (periciasCustom.length  == undefined || periciasCustom.length > 0) {
    let c = 0;
    for (var i in actor.data.data.periciasCustom) {
      periciasCustom[c] = actor.data.data.periciasCustom[i];
      periciasCustom[c].temp = valor;
      c++;
    }
    await actor.update({ "data.periciasCustom": periciasCustom });
  }
}
