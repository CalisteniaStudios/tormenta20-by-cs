export const T20Conditions = {};

T20Conditions.abalado = {
	label: "Abalado",
	id: "abalado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/abalado.svg",
	flags: {core:{statusId:"abalado"},tormenta20:{condition:true,durationScene:true,stack:"apavorado"}},
	changes: [
		{key: "data.pericias.acro.condi", mode:3, value:-2},
		{key: "data.pericias.ades.condi", mode:3, value:-2},
		{key: "data.pericias.atle.condi", mode:3, value:-2},
		{key: "data.pericias.atua.condi", mode:3, value:-2},
		{key: "data.pericias.cava.condi", mode:3, value:-2},
		{key: "data.pericias.conh.condi", mode:3, value:-2},
		{key: "data.pericias.cura.condi", mode:3, value:-2},
		{key: "data.pericias.dipl.condi", mode:3, value:-2},
		{key: "data.pericias.enga.condi", mode:3, value:-2},
		{key: "data.pericias.fort.condi", mode:3, value:-2},
		{key: "data.pericias.furt.condi", mode:3, value:-2},
		{key: "data.pericias.guer.condi", mode:3, value:-2},
		{key: "data.pericias.inic.condi", mode:3, value:-2},
		{key: "data.pericias.inti.condi", mode:3, value:-2},
		{key: "data.pericias.intu.condi", mode:3, value:-2},
		{key: "data.pericias.inve.condi", mode:3, value:-2},
		{key: "data.pericias.joga.condi", mode:3, value:-2},
		{key: "data.pericias.ladi.condi", mode:3, value:-2},
		{key: "data.pericias.luta.condi", mode:3, value:-2},
		{key: "data.pericias.mist.condi", mode:3, value:-2},
		{key: "data.pericias.nobr.condi", mode:3, value:-2},
		{key: "data.pericias.ofic.condi", mode:3, value:-2},
		{key: "data.pericias.perc.condi", mode:3, value:-2},
		{key: "data.pericias.pilo.condi", mode:3, value:-2},
		{key: "data.pericias.pont.condi", mode:3, value:-2},
		{key: "data.pericias.refl.condi", mode:3, value:-2},
		{key: "data.pericias.reli.condi", mode:3, value:-2},
		{key: "data.pericias.sobr.condi", mode:3, value:-2},
		{key: "data.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.agarrado = {
	label: "Agarrado",
	id: "agarrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/agarrado.svg",
	flags: {core:{statusId:"agarrado"},tormenta20:{condition:true,childEffect:["desprevenido","imovel"]}},
	changes: [{key: "data.pericias.luta.condi", mode:3, value:-2},
		{key: "data.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.alquebrado = {
	label: "Alquebrado",
	id: "alquebrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/alquebrado.svg",
	flags: {core:{statusId:"alquebrado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.modificadores.custoPM", mode:2, value:1}]
}

T20Conditions.apavorado = {
	label: "Apavorado",
	id: "apavorado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/apavorado.svg",
	flags: {core:{statusId:"apavorado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.acro.condi", mode:3, value:-5},
		{key: "data.pericias.ades.condi", mode:3, value:-5},
		{key: "data.pericias.atle.condi", mode:3, value:-5},
		{key: "data.pericias.atua.condi", mode:3, value:-5},
		{key: "data.pericias.cava.condi", mode:3, value:-5},
		{key: "data.pericias.conh.condi", mode:3, value:-5},
		{key: "data.pericias.cura.condi", mode:3, value:-5},
		{key: "data.pericias.dipl.condi", mode:3, value:-5},
		{key: "data.pericias.enga.condi", mode:3, value:-5},
		{key: "data.pericias.fort.condi", mode:3, value:-5},
		{key: "data.pericias.furt.condi", mode:3, value:-5},
		{key: "data.pericias.guer.condi", mode:3, value:-5},
		{key: "data.pericias.inic.condi", mode:3, value:-5},
		{key: "data.pericias.inti.condi", mode:3, value:-5},
		{key: "data.pericias.intu.condi", mode:3, value:-5},
		{key: "data.pericias.inve.condi", mode:3, value:-5},
		{key: "data.pericias.joga.condi", mode:3, value:-5},
		{key: "data.pericias.ladi.condi", mode:3, value:-5},
		{key: "data.pericias.luta.condi", mode:3, value:-5},
		{key: "data.pericias.mist.condi", mode:3, value:-5},
		{key: "data.pericias.nobr.condi", mode:3, value:-5},
		{key: "data.pericias.ofic.condi", mode:3, value:-5},
		{key: "data.pericias.perc.condi", mode:3, value:-5},
		{key: "data.pericias.pilo.condi", mode:3, value:-5},
		{key: "data.pericias.pont.condi", mode:3, value:-5},
		{key: "data.pericias.refl.condi", mode:3, value:-5},
		{key: "data.pericias.reli.condi", mode:3, value:-5},
		{key: "data.pericias.sobr.condi", mode:3, value:-5},
		{key: "data.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.atordoado = {
	label: "Atordoado",
	id: "atordoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/atordoado.svg",
	flags: {core:{statusId:"atordoado"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}}
}

T20Conditions.caido = {
	label: "Caído",
	id: "caido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/caido.svg",
	flags: {core:{statusId:"caido"},tormenta20:{condition:true}},
	changes: [{key: "data.pericias.luta.condi", mode:3, value:-5},
		{ key: "data.attributes.movement.walk", mode: 3, value: 1.5 },
		{ key: "data.attributes.movement.burrow", mode: 3, value: 1.5 },
		{ key: "data.attributes.movement.climb", mode: 3, value: 1.5 },
		{ key: "data.attributes.movement.fly", mode: 3, value: 1.5 },
		{ key: "data.attributes.movement.swim", mode: 3, value: 1.5 }]
}

T20Conditions.cego = {
	label: "Cego",
	id: "cego",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/cego.svg",
	flags: {core:{statusId:"cego"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido","lento"]}},
	changes: [{key: "data.pericias.acro.condi", mode:3, value:-2},
		{key: "data.pericias.atle.condi", mode:3, value:-2},
		{key: "data.pericias.cava.condi", mode:3, value:-2},
		{key: "data.pericias.furt.condi", mode:3, value:-2},
		{key: "data.pericias.inic.condi", mode:3, value:-2},
		{key: "data.pericias.luta.condi", mode:3, value:-2},
		{key: "data.pericias.pilo.condi", mode:3, value:-2},
		{key: "data.pericias.pont.condi", mode:3, value:-2},
		{key: "data.pericias.refl.condi", mode:3, value:-2}]
}

T20Conditions.confuso = {
	label: "Confuso",
	id: "confuso",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/confuso.svg",
	flags: {core:{statusId:"confuso"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.debilitado = {
	label: "Debilitado",
	id: "debilitado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/debilitado.svg",
	flags: {core:{statusId:"debilitado"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente"}},
	changes: [{key: "data.modificadores.atributos.for", mode:2, value:-5},
		{key: "data.modificadores.atributos.des", mode:2, value:-5},
		{key: "data.modificadores.atributos.con", mode:2, value:-5},
		{key: "data.pericias.acro.condi", mode:3, value:-5},
		{key: "data.pericias.atle.condi", mode:3, value:-5},
		{key: "data.pericias.cava.condi", mode:3, value:-5},
		{key: "data.pericias.fort.condi", mode:3, value:-5},
		{key: "data.pericias.furt.condi", mode:3, value:-5},
		{key: "data.pericias.inic.condi", mode:3, value:-5},
		{key: "data.pericias.luta.condi", mode:3, value:-5},
		{key: "data.pericias.pilo.condi", mode:3, value:-5},
		{key: "data.pericias.pont.condi", mode:3, value:-5},
		{key: "data.pericias.refl.condi", mode:3, value:-5}]
}

T20Conditions.desprevenido = {
	label: "Desprevenido",
	id: "desprevenido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/desprevenido.svg",
	flags: {core:{statusId:"desprevenido"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.refl.condi", mode:3, value:-5},
	{key: "data.attributes.defesa.condi", mode:3, value:-5}]
}

T20Conditions.doente = {
	label: "Doente",
	id: "doente",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/doente.svg",
	flags: {core:{statusId:"doente"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.emchamas = {
	label: "Em Chamas",
	id: "emchamas",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/em-chamas.svg",
	flags: {core:{statusId:"emchamas"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.enjoado = {
	label: "Enjoado",
	id: "enjoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enjoado.svg",
	flags: {core:{statusId:"enjoado"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.enredado = {
	label: "Enredado",
	id: "enredado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enredado.svg",
	flags: {core:{statusId:"enredado"},tormenta20:{condition:true,durationScene:true,childEffect:["lento","vulneravel"]}},
	changes: [{key: "data.pericias.luta.condi", mode:3, value:-2},
		{key: "data.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.envenenado = {
	label: "Envenenado",
	id: "envenenado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/envenenado.svg",
	flags: {core:{statusId:"envenenado"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.esmorecido = {
	label: "Esmorecido",
	id: "esmorecido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/esmorecido.svg",
	flags: {core:{statusId:"esmorecido"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.modificadores.atributos.int", mode:2, value:-5},
		{key: "data.modificadores.atributos.sab", mode:2, value:-5},
		{key: "data.modificadores.atributos.con", mode:2, value:-5},
		{key: "data.pericias.ades.condi", mode:3, value:-5},
		{key: "data.pericias.atua.condi", mode:3, value:-5},
		{key: "data.pericias.cont.condi", mode:3, value:-5},
		{key: "data.pericias.cura.condi", mode:3, value:-5},
		{key: "data.pericias.dipl.condi", mode:3, value:-5},
		{key: "data.pericias.enga.condi", mode:3, value:-5},
		{key: "data.pericias.guer.condi", mode:3, value:-5},
		{key: "data.pericias.inti.condi", mode:3, value:-5},
		{key: "data.pericias.intu.condi", mode:3, value:-5},
		{key: "data.pericias.inve.condi", mode:3, value:-5},
		{key: "data.pericias.joga.condi", mode:3, value:-5},
		{key: "data.pericias.ladi.condi", mode:3, value:-5},
		{key: "data.pericias.mist.condi", mode:3, value:-5},
		{key: "data.pericias.inve.condi", mode:3, value:-5},
		{key: "data.pericias.nobr.condi", mode:3, value:-5},
		{key: "data.pericias.ofic.condi", mode:3, value:-5},
		{key: "data.pericias.perc.condi", mode:3, value:-5},
		{key: "data.pericias.reli.condi", mode:3, value:-5},
		{key: "data.pericias.sobr.condi", mode:3, value:-5},
		{key: "data.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.exausto = {
	label: "Exausto",
	id: "exausto",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/exausto.svg",
	flags: {core:{statusId:"exausto"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente",childEffect:["debilitado","lento","vulneravel"]}}
}

T20Conditions.fascinado = {
	label: "Fascinado",
	id: "fascinado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fascinado.svg",
	flags: {core:{statusId:"fascinado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.perc.condi", mode:3, value:-5}]
}

T20Conditions.fatigado = {
	label: "Fatigado",
	id: "fatigado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fatigado.svg",
	flags: {core:{statusId:"fatigado"},tormenta20:{condition:true,durationScene:true,stack:"exausto",childEffect:["fraco","vulneravel"]}}
}


T20Conditions.fraco = {
	label: "Fraco",
	id: "fraco",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fraco.svg",
	flags: {core:{statusId:"fraco"},tormenta20:{condition:true,durationScene:true,stack:"debilitado"}},
	changes: [{key: "data.modificadores.atributos.for", mode:2, value:-2},
		{key: "data.modificadores.atributos.des", mode:2, value:-2},
		{key: "data.modificadores.atributos.con", mode:2, value:-2},
		{key: "data.pericias.acro.condi", mode:3, value:-2},
		{key: "data.pericias.atle.condi", mode:3, value:-2},
		{key: "data.pericias.cava.condi", mode:3, value:-2},
		{key: "data.pericias.fort.condi", mode:3, value:-2},
		{key: "data.pericias.furt.condi", mode:3, value:-2},
		{key: "data.pericias.inic.condi", mode:3, value:-2},
		{key: "data.pericias.luta.condi", mode:3, value:-2},
		{key: "data.pericias.pilo.condi", mode:3, value:-2},
		{key: "data.pericias.pont.condi", mode:3, value:-2},
		{key: "data.pericias.refl.condi", mode:3, value:-2}]
}

T20Conditions.frustrado = {
	label: "Frustrado",
	id: "frustrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/frustrado.svg",
	flags: {core:{statusId:"frustrado"},tormenta20:{condition:true,durationScene:true,stack:"esmorecido"}},
	changes: [{key: "data.modificadores.atributos.int", mode:2, value:-2},
		{key: "data.modificadores.atributos.sab", mode:2, value:-2},
		{key: "data.modificadores.atributos.con", mode:2, value:-2},
		{key: "data.pericias.ades.condi", mode:3, value:-2},
		{key: "data.pericias.atua.condi", mode:3, value:-2},
		{key: "data.pericias.conh.condi", mode:3, value:-2},
		{key: "data.pericias.cura.condi", mode:3, value:-2},
		{key: "data.pericias.dipl.condi", mode:3, value:-2},
		{key: "data.pericias.enga.condi", mode:3, value:-2},
		{key: "data.pericias.guer.condi", mode:3, value:-2},
		{key: "data.pericias.inti.condi", mode:3, value:-2},
		{key: "data.pericias.intu.condi", mode:3, value:-2},
		{key: "data.pericias.inve.condi", mode:3, value:-2},
		{key: "data.pericias.joga.condi", mode:3, value:-2},
		{key: "data.pericias.ladi.condi", mode:3, value:-2},
		{key: "data.pericias.mist.condi", mode:3, value:-2},
		{key: "data.pericias.inve.condi", mode:3, value:-2},
		{key: "data.pericias.nobr.condi", mode:3, value:-2},
		{key: "data.pericias.ofic.condi", mode:3, value:-2},
		{key: "data.pericias.perc.condi", mode:3, value:-2},
		{key: "data.pericias.reli.condi", mode:3, value:-2},
		{key: "data.pericias.sobr.condi", mode:3, value:-2},
		{key: "data.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.imovel = {
	label: "Imóvel",
	id: "imovel",
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
	id: "inconsciente",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/inconsciente.svg",
	flags: {core:{statusId:"inconsciente"},tormenta20:{condition:true,durationScene:true,childEffect:["indefeso"]}}
}

T20Conditions.indefeso = {
	label: "Indefeso",
	id: "indefeso",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/indefeso.svg",
	flags: {core:{statusId:"indefeso"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}},
	changes: [{key: "data.attributes.defesa.condi", mode:3, value:-10}]
}

T20Conditions.lento = {
	label: "Lento",
	id: "lento",
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
	id: "morto",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/morto.svg",
	flags: {core:{statusId:"morto"},tormenta20:{condition:true}}
}

T20Conditions.ofuscado = {
	label: "Ofuscado",
	id: "ofuscado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/ofuscado.svg",
	flags: {core:{statusId:"ofuscado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.perc.condi", mode:3, value:-2}]
}

T20Conditions.paralisado = {
	label: "Paralisado",
	id: "paralisado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/paralisado.svg",
	flags: {core:{statusId:"paralisado"},tormenta20:{condition:true,durationScene:true,childEffect:["imovel","indefeso"]}}
}

T20Conditions.pasmo = {
	label: "Pasmo",
	id: "pasmo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/pasmo.svg",
	flags: {core:{statusId:"pasmo"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.petrificado = {
	label: "Petrificado",
	id: "petrificado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/petrificado.svg",
	flags: {core:{statusId:"petrificado"},tormenta20:{condition:true,durationScene:true,childEffect:["inconsciente"]}},
	changes: [ { key: "data.tracos.resistencia.dano.value", mode: 3, value: 8 } ]
}

T20Conditions.sangrando = {
	label: "Sangrando",
	id: "sangrando",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sangrando.svg",
	flags: {core:{statusId:"sangrando"},tormenta20:{condition:true,durationScene:true}}
}

T20Conditions.surdo = {
	label: "Surdo",
	id: "surdo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/surdo.svg",
	flags: {core:{statusId:"surdo"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.pericias.inic.condi", mode:3, value:-2}]
}

T20Conditions.surpreendido = {
	label: "Surpreendido",
	id: "surpreendido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/surpreendido.svg",
	flags: {core:{statusId:"surpreendido"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}}
}

T20Conditions.vulneravel = {
	label: "Vulnerável",
	id: "vulneravel",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/vulneravel.svg",
	flags: {core:{statusId:"vulneravel"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.attributes.defesa.condi", mode:3, value:-2}]
}

T20Conditions.sobrecarregado = {
	label: "Sobrecarregado",
	id: "sobrecarregado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sobrecarregado.svg",
	flags: {core:{statusId:"sobrecarregado"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "data.attributes.defesa.pda", mode:2, value:-2},
		{ key: "data.attributes.movement.walk", mode: 2, value: -3 },
		{ key: "data.attributes.movement.burrow", mode: 2, value: -3 },
		{ key: "data.attributes.movement.climb", mode: 2, value: -3 },
		{ key: "data.attributes.movement.fly", mode: 2, value: -3 },
		{ key: "data.attributes.movement.swim", mode: 2, value: -3 }]
}