export const T20Conditions = {};

T20Conditions.abalado = {
	label: "Abalado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/abalado.svg",
	flags: {core:{statusId:"abalado"},tormenta20:{condition:true,durationScene:true,stack:"apavorado"}},
	changes: [{key: "data.pericias.acr.condi", mode:3, value:-2},
		{key: "data.pericias.ade.condi", mode:3, value:-2},
		{key: "data.pericias.atl.condi", mode:3, value:-2},
		{key: "data.pericias.atu.condi", mode:3, value:-2},
		{key: "data.pericias.cav.condi", mode:3, value:-2},
		{key: "data.pericias.con.condi", mode:3, value:-2},
		{key: "data.pericias.cur.condi", mode:3, value:-2},
		{key: "data.pericias.dip.condi", mode:3, value:-2},
		{key: "data.pericias.eng.condi", mode:3, value:-2},
		{key: "data.pericias.for.condi", mode:3, value:-2},
		{key: "data.pericias.fur.condi", mode:3, value:-2},
		{key: "data.pericias.gue.condi", mode:3, value:-2},
		{key: "data.pericias.ini.condi", mode:3, value:-2},
		{key: "data.pericias.int.condi", mode:3, value:-2},
		{key: "data.pericias.intu.condi", mode:3, value:-2},
		{key: "data.pericias.inv.condi", mode:3, value:-2},
		{key: "data.pericias.jog.condi", mode:3, value:-2},
		{key: "data.pericias.lad.condi", mode:3, value:-2},
		{key: "data.pericias.lut.condi", mode:3, value:-2},
		{key: "data.pericias.mis.condi", mode:3, value:-2},
		{key: "data.pericias.nob.condi", mode:3, value:-2},
		{key: "data.pericias.ofi.condi", mode:3, value:-2},
		{key: "data.pericias.per.condi", mode:3, value:-2},
		{key: "data.pericias.pil.condi", mode:3, value:-2},
		{key: "data.pericias.pon.condi", mode:3, value:-2},
		{key: "data.pericias.ref.condi", mode:3, value:-2},
		{key: "data.pericias.rel.condi", mode:3, value:-2},
		{key: "data.pericias.sob.condi", mode:3, value:-2},
		{key: "data.pericias.von.condi", mode:3, value:-2}]
}

T20Conditions.agarrado = {
	label: "Agarrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/agarrado.svg",
	flags: {core:{statusId:"agarrado"},tormenta20:{condition:true,childEffect:["desprevenido","imovel"]}},
	changes: [{key: "data.pericias.lut.condi", mode:3, value:-2},
		{key: "data.pericias.pon.condi", mode:3, value:-2}]
}

T20Conditions.alquebrado = {
	label: "Alquebrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/alquebrado.svg",
	flags: {core:{statusId:"alquebrado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.modificadores.custoPM", mode:2, value:1}]
}

T20Conditions.apavorado = {
	label: "Apavorado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/apavorado.svg",
	flags: {core:{statusId:"apavorado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.acr.condi", mode:3, value:-5},
		{key: "data.pericias.ade.condi", mode:3, value:-5},
		{key: "data.pericias.atl.condi", mode:3, value:-5},
		{key: "data.pericias.atu.condi", mode:3, value:-5},
		{key: "data.pericias.cav.condi", mode:3, value:-5},
		{key: "data.pericias.con.condi", mode:3, value:-5},
		{key: "data.pericias.cur.condi", mode:3, value:-5},
		{key: "data.pericias.dip.condi", mode:3, value:-5},
		{key: "data.pericias.eng.condi", mode:3, value:-5},
		{key: "data.pericias.for.condi", mode:3, value:-5},
		{key: "data.pericias.fur.condi", mode:3, value:-5},
		{key: "data.pericias.gue.condi", mode:3, value:-5},
		{key: "data.pericias.ini.condi", mode:3, value:-5},
		{key: "data.pericias.int.condi", mode:3, value:-5},
		{key: "data.pericias.intu.condi", mode:3, value:-5},
		{key: "data.pericias.inv.condi", mode:3, value:-5},
		{key: "data.pericias.jog.condi", mode:3, value:-5},
		{key: "data.pericias.lad.condi", mode:3, value:-5},
		{key: "data.pericias.lut.condi", mode:3, value:-5},
		{key: "data.pericias.mis.condi", mode:3, value:-5},
		{key: "data.pericias.nob.condi", mode:3, value:-5},
		{key: "data.pericias.ofi.condi", mode:3, value:-5},
		{key: "data.pericias.per.condi", mode:3, value:-5},
		{key: "data.pericias.pil.condi", mode:3, value:-5},
		{key: "data.pericias.pon.condi", mode:3, value:-5},
		{key: "data.pericias.ref.condi", mode:3, value:-5},
		{key: "data.pericias.rel.condi", mode:3, value:-5},
		{key: "data.pericias.sob.condi", mode:3, value:-5},
		{key: "data.pericias.von.condi", mode:3, value:-5}]
}

T20Conditions.atordoado = {
	label: "Atordoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/atordoado.svg",
	flags: {core:{statusId:"atordoado"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}}
}

T20Conditions.caido = {
	label: "Caído",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/caido.svg",
	flags: {core:{statusId:"caido"},tormenta20:{condition:true}},
	changes: [{key: "data.pericias.lut.condi", mode:3, value:-5},
		{ key: "data.attributes.movement.walk", mode: 3, value: 1.5 },
        { key: "data.attributes.movement.burrow", mode: 3, value: 1.5 },
        { key: "data.attributes.movement.climb", mode: 3, value: 1.5 },
        { key: "data.attributes.movement.fly", mode: 3, value: 1.5 },
        { key: "data.attributes.movement.swim", mode: 3, value: 1.5 }]
}

T20Conditions.cego = {
	label: "Cego",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/cego.svg",
	flags: {core:{statusId:"cego"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido","lento"]}},
	changes: [{key: "data.pericias.acr.condi", mode:3, value:-2},
		{key: "data.pericias.atl.condi", mode:3, value:-2},
		{key: "data.pericias.cav.condi", mode:3, value:-2},
		{key: "data.pericias.fur.condi", mode:3, value:-2},
		{key: "data.pericias.ini.condi", mode:3, value:-2},
		{key: "data.pericias.lut.condi", mode:3, value:-2},
		{key: "data.pericias.pil.condi", mode:3, value:-2},
		{key: "data.pericias.pon.condi", mode:3, value:-2},
		{key: "data.pericias.ref.condi", mode:3, value:-2}]
}

T20Conditions.confuso = {
	label: "Confuso",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/confuso.svg",
	flags: {core:{statusId:"confuso"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.debilitado = {
	label: "Debilitado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/debilitado.svg",
	flags: {core:{statusId:"debilitado"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente"}},
	changes: [{key: "data.modificadores.atributos.for", mode:2, value:-5},
		{key: "data.modificadores.atributos.des", mode:2, value:-5},
		{key: "data.modificadores.atributos.con", mode:2, value:-5},
		{key: "data.pericias.acr.condi", mode:3, value:-5},
		{key: "data.pericias.atl.condi", mode:3, value:-5},
		{key: "data.pericias.cav.condi", mode:3, value:-5},
		{key: "data.pericias.for.condi", mode:3, value:-5},
		{key: "data.pericias.fur.condi", mode:3, value:-5},
		{key: "data.pericias.ini.condi", mode:3, value:-5},
		{key: "data.pericias.lut.condi", mode:3, value:-5},
		{key: "data.pericias.pil.condi", mode:3, value:-5},
		{key: "data.pericias.pon.condi", mode:3, value:-5},
		{key: "data.pericias.ref.condi", mode:3, value:-5}]
}

T20Conditions.desprevenido = {
	label: "Desprevenido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/desprevenido.svg",
	flags: {core:{statusId:"desprevenido"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.ref.condi", mode:3, value:-5},
	{key: "data.defesa.condi", mode:3, value:-5}]
}

T20Conditions.doente = {
	label: "Doente",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/doente.svg",
	flags: {core:{statusId:"doente"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.emchamas = {
	label: "Em Chamas",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/em-chamas.svg",
	flags: {core:{statusId:"emchamas"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.enjoado = {
	label: "Enjoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enjoado.svg",
	flags: {core:{statusId:"enjoado"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.enredado = {
	label: "Enredado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enredado.svg",
	flags: {core:{statusId:"enredado"},tormenta20:{condition:true,durationScene:true,childEffect:["lento","vulneravel"]}},
	changes: [{key: "data.pericias.lut.condi", mode:3, value:-2},
		{key: "data.pericias.pon.condi", mode:3, value:-2}]
}

T20Conditions.envenenado = {
	label: "Envenenado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/envenenado.svg",
	flags: {core:{statusId:"envenenado"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.esmorecido = {
	label: "Esmorecido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/esmorecido.svg",
	flags: {core:{statusId:"esmorecido"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.modificadores.atributos.int", mode:2, value:-5},
		{key: "data.modificadores.atributos.sab", mode:2, value:-5},
		{key: "data.modificadores.atributos.con", mode:2, value:-5},
		{key: "data.pericias.ade.condi", mode:3, value:-5},
		{key: "data.pericias.atu.condi", mode:3, value:-5},
		{key: "data.pericias.con.condi", mode:3, value:-5},
		{key: "data.pericias.cur.condi", mode:3, value:-5},
		{key: "data.pericias.dip.condi", mode:3, value:-5},
		{key: "data.pericias.eng.condi", mode:3, value:-5},
		{key: "data.pericias.gue.condi", mode:3, value:-5},
		{key: "data.pericias.int.condi", mode:3, value:-5},
		{key: "data.pericias.intu.condi", mode:3, value:-5},
		{key: "data.pericias.inv.condi", mode:3, value:-5},
		{key: "data.pericias.jog.condi", mode:3, value:-5},
		{key: "data.pericias.lad.condi", mode:3, value:-5},
		{key: "data.pericias.mis.condi", mode:3, value:-5},
		{key: "data.pericias.inv.condi", mode:3, value:-5},
		{key: "data.pericias.nob.condi", mode:3, value:-5},
		{key: "data.pericias.ofi.condi", mode:3, value:-5},
		{key: "data.pericias.per.condi", mode:3, value:-5},
		{key: "data.pericias.rel.condi", mode:3, value:-5},
		{key: "data.pericias.sob.condi", mode:3, value:-5},
		{key: "data.pericias.von.condi", mode:3, value:-5}]
}

T20Conditions.exausto = {
	label: "Exausto",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/exausto.svg",
	flags: {core:{statusId:"exausto"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente",childEffect:["debilitado","lento","vulneravel"]}}
}

T20Conditions.fascinado = {
	label: "Fascinado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fascinado.svg",
	flags: {core:{statusId:"fascinado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.per.condi", mode:3, value:-5}]
}

T20Conditions.fatigado = {
	label: "Fatigado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fatigado.svg",
	flags: {core:{statusId:"fatigado"},tormenta20:{condition:true,durationScene:true,stack:"exausto",childEffect:["fraco","vulneravel"]}}
}


T20Conditions.fraco = {
	label: "Fraco",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fraco.svg",
	flags: {core:{statusId:"fraco"},tormenta20:{condition:true,durationScene:true,stack:"debilitado"}},
	changes: [{key: "data.modificadores.atributos.for", mode:2, value:-2},
		{key: "data.modificadores.atributos.des", mode:2, value:-2},
		{key: "data.modificadores.atributos.con", mode:2, value:-2},
		{key: "data.pericias.acr.condi", mode:3, value:-2},
		{key: "data.pericias.atl.condi", mode:3, value:-2},
		{key: "data.pericias.cav.condi", mode:3, value:-2},
		{key: "data.pericias.for.condi", mode:3, value:-2},
		{key: "data.pericias.fur.condi", mode:3, value:-2},
		{key: "data.pericias.ini.condi", mode:3, value:-2},
		{key: "data.pericias.lut.condi", mode:3, value:-2},
		{key: "data.pericias.pil.condi", mode:3, value:-2},
		{key: "data.pericias.pon.condi", mode:3, value:-2},
		{key: "data.pericias.ref.condi", mode:3, value:-2}]
}

T20Conditions.frustrado = {
	label: "Frustrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/frustrado.svg",
	flags: {core:{statusId:"frustrado"},tormenta20:{condition:true,durationScene:true,stack:"esmorecido"}},
	changes: [{key: "data.modificadores.atributos.int", mode:2, value:-2},
		{key: "data.modificadores.atributos.sab", mode:2, value:-2},
		{key: "data.modificadores.atributos.con", mode:2, value:-2},
		{key: "data.pericias.ade.condi", mode:3, value:-2},
		{key: "data.pericias.atu.condi", mode:3, value:-2},
		{key: "data.pericias.con.condi", mode:3, value:-2},
		{key: "data.pericias.cur.condi", mode:3, value:-2},
		{key: "data.pericias.dip.condi", mode:3, value:-2},
		{key: "data.pericias.eng.condi", mode:3, value:-2},
		{key: "data.pericias.gue.condi", mode:3, value:-2},
		{key: "data.pericias.int.condi", mode:3, value:-2},
		{key: "data.pericias.intu.condi", mode:3, value:-2},
		{key: "data.pericias.inv.condi", mode:3, value:-2},
		{key: "data.pericias.jog.condi", mode:3, value:-2},
		{key: "data.pericias.lad.condi", mode:3, value:-2},
		{key: "data.pericias.mis.condi", mode:3, value:-2},
		{key: "data.pericias.inv.condi", mode:3, value:-2},
		{key: "data.pericias.nob.condi", mode:3, value:-2},
		{key: "data.pericias.ofi.condi", mode:3, value:-2},
		{key: "data.pericias.per.condi", mode:3, value:-2},
		{key: "data.pericias.rel.condi", mode:3, value:-2},
		{key: "data.pericias.sob.condi", mode:3, value:-2},
		{key: "data.pericias.von.condi", mode:3, value:-2}]
}

T20Conditions.imovel = {
	label: "Imóvel",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/imovel.svg",
	flags: {core:{statusId:"imovel"},tormenta20:{condition:true,durationScene:true}},
	changes: [{ key: "data.attributes.movement.walk", mode: 3, value: 0 },
        { key: "data.attributes.movement.burrow", mode: 3, value: 0 },
        { key: "data.attributes.movement.climb", mode: 3, value: 0 },
        { key: "data.attributes.movement.fly", mode: 3, value: 0 },
        { key: "data.attributes.movement.swim", mode: 3, value: 0 }]
}

T20Conditions.inconsciente = {
	label: "Inconsciente",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/inconsciente.svg",
	flags: {core:{statusId:"inconsciente"},tormenta20:{condition:true,durationScene:true,childEffect:["indefeso"]}}
}

T20Conditions.indefeso = {
	label: "Indefeso",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/indefeso.svg",
	flags: {core:{statusId:"indefeso"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}},
	changes: [{key: "data.defesa.condi", mode:3, value:-10}]
}

T20Conditions.lento = {
	label: "Lento",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/lento.svg",
	flags: {core:{statusId:"lento"},tormenta20:{condition:true,durationScene:true}},
	changes: [{ key: "data.attributes.movement.walk", mode: 1, value: 0.5 },
        { key: "data.attributes.movement.burrow", mode: 1, value: 0.5 },
        { key: "data.attributes.movement.climb", mode: 1, value: 0.5 },
        { key: "data.attributes.movement.fly", mode: 1, value: 0.5 },
        { key: "data.attributes.movement.swim", mode: 1, value: 0.5 }]
}

T20Conditions.morto = {
	label: "Morto",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/morto.svg",
	flags: {core:{statusId:"morto"},tormenta20:{condition:true}}
}

T20Conditions.ofuscado = {
	label: "Ofuscado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/ofuscado.svg",
	flags: {core:{statusId:"ofuscado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.per.condi", mode:3, value:-2}]
}

T20Conditions.paralisado = {
	label: "Paralisado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/paralisado.svg",
	flags: {core:{statusId:"paralisado"},tormenta20:{condition:true,durationScene:true,childEffect:["imovel","indefeso"]}}
}

T20Conditions.pasmo = {
	label: "Pasmo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/pasmo.svg",
	flags: {core:{statusId:"pasmo"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.petrificado = {
	label: "Petrificado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/petrificado.svg",
	flags: {core:{statusId:"petrificado"},tormenta20:{condition:true,durationScene:true,childEffect:["inconsciente"]}},
	changes: [ { key: "data.rd.value", mode: 3, value: 8 } ]
}

T20Conditions.sangrando = {
	label: "Sangrando",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sangrando.svg",
	flags: {core:{statusId:"sangrando"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.surdo = {
	label: "Surdo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/surdo.svg",
	flags: {core:{statusId:"surdo"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.ini.condi", mode:3, value:-2}]
}

T20Conditions.surpreendido = {
	label: "Surpreendido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/surpreendido.svg",
	flags: {core:{statusId:"surpreendido"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}}
}

T20Conditions.vulneravel = {
	label: "Vulnerável",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/vulneravel.svg",
	flags: {core:{statusId:"vulneravel"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.defesa.condi", mode:3, value:-2}]
}

T20Conditions.sobrecarregado = {
	label: "Sobrecarregado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sobrecarregado.svg",
	flags: {core:{statusId:"sobrecarregado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.defesa.penalidade", mode:2, value:-2},
		{ key: "data.attributes.movement.walk", mode: 2, value: -3 },
	    { key: "data.attributes.movement.burrow", mode: 2, value: -3 },
	    { key: "data.attributes.movement.climb", mode: 2, value: -3 },
	    { key: "data.attributes.movement.fly", mode: 2, value: -3 },
	    { key: "data.attributes.movement.swim", mode: 2, value: -3 }]
}