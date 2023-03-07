export const T20Conditions = {};

T20Conditions.abalado = {
	label: "Abalado",
	id: "abalado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/abalado.svg",
	flags: {core:{statusId:"abalado"},tormenta20:{condition:true,durationScene:true,stack:"apavorado",category:'medo'}},
	changes: [
		{key: "system.pericias.acro.condi", mode:3, value:-2},
		{key: "system.pericias.ades.condi", mode:3, value:-2},
		{key: "system.pericias.atle.condi", mode:3, value:-2},
		{key: "system.pericias.atua.condi", mode:3, value:-2},
		{key: "system.pericias.cava.condi", mode:3, value:-2},
		{key: "system.pericias.conh.condi", mode:3, value:-2},
		{key: "system.pericias.cura.condi", mode:3, value:-2},
		{key: "system.pericias.dipl.condi", mode:3, value:-2},
		{key: "system.pericias.enga.condi", mode:3, value:-2},
		{key: "system.pericias.fort.condi", mode:3, value:-2},
		{key: "system.pericias.furt.condi", mode:3, value:-2},
		{key: "system.pericias.guer.condi", mode:3, value:-2},
		{key: "system.pericias.inic.condi", mode:3, value:-2},
		{key: "system.pericias.inti.condi", mode:3, value:-2},
		{key: "system.pericias.intu.condi", mode:3, value:-2},
		{key: "system.pericias.inve.condi", mode:3, value:-2},
		{key: "system.pericias.joga.condi", mode:3, value:-2},
		{key: "system.pericias.ladi.condi", mode:3, value:-2},
		{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.mist.condi", mode:3, value:-2},
		{key: "system.pericias.nobr.condi", mode:3, value:-2},
		{key: "system.pericias.ofic.condi", mode:3, value:-2},
		{key: "system.pericias.perc.condi", mode:3, value:-2},
		{key: "system.pericias.pilo.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2},
		{key: "system.pericias.refl.condi", mode:3, value:-2},
		{key: "system.pericias.reli.condi", mode:3, value:-2},
		{key: "system.pericias.sobr.condi", mode:3, value:-2},
		{key: "system.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.agarrado = {
	label: "Agarrado",
	id: "agarrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/agarrado.svg",
	flags: {core:{statusId:"agarrado"},tormenta20:{condition:true,childEffect:["desprevenido","imovel"],category:'movimento'}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.alquebrado = {
	label: "Alquebrado",
	id: "alquebrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/alquebrado.svg",
	flags: {core:{statusId:"alquebrado"},tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.modificadores.custoPM", mode:2, value:1}]
}

T20Conditions.apavorado = {
	label: "Apavorado",
	id: "apavorado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/apavorado.svg",
	flags: {core:{statusId:"apavorado"},tormenta20:{condition:true,durationScene:true,category:'medo'}},
	changes: [{key: "system.pericias.acro.condi", mode:3, value:-5},
		{key: "system.pericias.ades.condi", mode:3, value:-5},
		{key: "system.pericias.atle.condi", mode:3, value:-5},
		{key: "system.pericias.atua.condi", mode:3, value:-5},
		{key: "system.pericias.cava.condi", mode:3, value:-5},
		{key: "system.pericias.conh.condi", mode:3, value:-5},
		{key: "system.pericias.cura.condi", mode:3, value:-5},
		{key: "system.pericias.dipl.condi", mode:3, value:-5},
		{key: "system.pericias.enga.condi", mode:3, value:-5},
		{key: "system.pericias.fort.condi", mode:3, value:-5},
		{key: "system.pericias.furt.condi", mode:3, value:-5},
		{key: "system.pericias.guer.condi", mode:3, value:-5},
		{key: "system.pericias.inic.condi", mode:3, value:-5},
		{key: "system.pericias.inti.condi", mode:3, value:-5},
		{key: "system.pericias.intu.condi", mode:3, value:-5},
		{key: "system.pericias.inve.condi", mode:3, value:-5},
		{key: "system.pericias.joga.condi", mode:3, value:-5},
		{key: "system.pericias.ladi.condi", mode:3, value:-5},
		{key: "system.pericias.luta.condi", mode:3, value:-5},
		{key: "system.pericias.mist.condi", mode:3, value:-5},
		{key: "system.pericias.nobr.condi", mode:3, value:-5},
		{key: "system.pericias.ofic.condi", mode:3, value:-5},
		{key: "system.pericias.perc.condi", mode:3, value:-5},
		{key: "system.pericias.pilo.condi", mode:3, value:-5},
		{key: "system.pericias.pont.condi", mode:3, value:-5},
		{key: "system.pericias.refl.condi", mode:3, value:-5},
		{key: "system.pericias.reli.condi", mode:3, value:-5},
		{key: "system.pericias.sobr.condi", mode:3, value:-5},
		{key: "system.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.atordoado = {
	label: "Atordoado",
	id: "atordoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/atordoado.svg",
	flags: {core:{statusId:"atordoado"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"],category:'mental'}}
}

T20Conditions.caido = {
	label: "Caído",
	id: "caido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/caido.svg",
	flags: {core:{statusId:"caido"},tormenta20:{condition:true}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-5},
		{ key: "system.attributes.movement.walk", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.burrow", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.climb", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.fly", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.swim", mode: 3, value: 1.5 }]
}

T20Conditions.cego = {
	label: "Cego",
	id: "blind",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/cego.svg",
	flags: {core:{statusId:"blind"},tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido","lento"],category:'sentidos'}},
	changes: [{key: "system.pericias.acro.condi", mode:3, value:-2},
		{key: "system.pericias.atle.condi", mode:3, value:-2},
		{key: "system.pericias.cava.condi", mode:3, value:-2},
		{key: "system.pericias.furt.condi", mode:3, value:-2},
		{key: "system.pericias.inic.condi", mode:3, value:-2},
		{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pilo.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2},
		{key: "system.pericias.refl.condi", mode:3, value:-2}]
}

T20Conditions.confuso = {
	label: "Confuso",
	id: "confuso",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/confuso.svg",
	flags: {core:{statusId:"confuso"},tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.debilitado = {
	label: "Debilitado",
	id: "debilitado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/debilitado.svg",
	flags: {core:{statusId:"debilitado"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente"}},
	changes: [{key: "system.modificadores.atributos.for", mode:2, value:-5},
		{key: "system.modificadores.atributos.des", mode:2, value:-5},
		{key: "system.modificadores.atributos.con", mode:2, value:-5},
		{key: "system.pericias.acro.condi", mode:3, value:-5},
		{key: "system.pericias.atle.condi", mode:3, value:-5},
		{key: "system.pericias.cava.condi", mode:3, value:-5},
		{key: "system.pericias.fort.condi", mode:3, value:-5},
		{key: "system.pericias.furt.condi", mode:3, value:-5},
		{key: "system.pericias.inic.condi", mode:3, value:-5},
		{key: "system.pericias.luta.condi", mode:3, value:-5},
		{key: "system.pericias.pilo.condi", mode:3, value:-5},
		{key: "system.pericias.pont.condi", mode:3, value:-5},
		{key: "system.pericias.refl.condi", mode:3, value:-5}]
}

T20Conditions.desprevenido = {
	label: "Desprevenido",
	id: "desprevenido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/desprevenido.svg",
	flags: {core:{statusId:"desprevenido"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "system.pericias.refl.condi", mode:3, value:-5},
	{key: "system.attributes.defesa.condi", mode:3, value:-5}]
}

T20Conditions.doente = {
	label: "Doente",
	id: "doente",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/doente.svg",
	flags: {core:{statusId:"doente"},tormenta20:{condition:true,durationScene:true,category:'metabolismo'}}
}

T20Conditions.emchamas = {
	label: "Em Chamas",
	id: "emchamas",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/em-chamas.svg",
	flags: {core:{statusId:"emchamas"},tormenta20:{condition:true,durationScene:true}},
	changes:[{key:'dano',mode:0,value:'1d6[fogo]'}]
}

T20Conditions.enfeiticado = {
	label: "Enfeitiçado",
	id: "enfeiticado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enfeiticado.svg",
	flags: {core:{statusId:"enfeiticado"},tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.enjoado = {
	label: "Enjoado",
	id: "enjoado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enjoado.svg",
	flags: {core:{statusId:"enjoado"},tormenta20:{condition:true,durationScene:true,category:'metabolismo'}}
}

T20Conditions.enredado = {
	label: "Enredado",
	id: "enredado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/enredado.svg",
	flags: {core:{statusId:"enredado"},tormenta20:{condition:true,durationScene:true,childEffect:["lento","vulneravel"],category:'movimento'}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.envenenado = {
	label: "Envenenado",
	id: "envenenado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/envenenado.svg",
	flags: {core:{statusId:"envenenado"},tormenta20:{condition:true,durationScene:true,category:'veneno'}}
}

T20Conditions.esmorecido = {
	label: "Esmorecido",
	id: "esmorecido",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/esmorecido.svg",
	flags: {core:{statusId:"esmorecido"},tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.modificadores.atributos.int", mode:2, value:-5},
		{key: "system.modificadores.atributos.sab", mode:2, value:-5},
		{key: "system.modificadores.atributos.con", mode:2, value:-5},
		{key: "system.pericias.ades.condi", mode:3, value:-5},
		{key: "system.pericias.atua.condi", mode:3, value:-5},
		{key: "system.pericias.conh.condi", mode:3, value:-5},
		{key: "system.pericias.cura.condi", mode:3, value:-5},
		{key: "system.pericias.dipl.condi", mode:3, value:-5},
		{key: "system.pericias.enga.condi", mode:3, value:-5},
		{key: "system.pericias.guer.condi", mode:3, value:-5},
		{key: "system.pericias.inti.condi", mode:3, value:-5},
		{key: "system.pericias.intu.condi", mode:3, value:-5},
		{key: "system.pericias.inve.condi", mode:3, value:-5},
		{key: "system.pericias.joga.condi", mode:3, value:-5},
		{key: "system.pericias.mist.condi", mode:3, value:-5},
		{key: "system.pericias.nobr.condi", mode:3, value:-5},
		{key: "system.pericias.ofic.condi", mode:3, value:-5},
		{key: "system.pericias.perc.condi", mode:3, value:-5},
		{key: "system.pericias.reli.condi", mode:3, value:-5},
		{key: "system.pericias.sobr.condi", mode:3, value:-5},
		{key: "system.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.exausto = {
	label: "Exausto",
	id: "exausto",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/exausto.svg",
	flags: {core:{statusId:"exausto"},tormenta20:{condition:true,durationScene:true,stack:"inconsciente",childEffect:["debilitado","lento","vulneravel"],category:'cansaco'}}
}

T20Conditions.fascinado = {
	label: "Fascinado",
	id: "fascinado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fascinado.svg",
	flags: {core:{statusId:"fascinado"},tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.pericias.perc.condi", mode:3, value:-5}]
}

T20Conditions.fatigado = {
	label: "Fatigado",
	id: "fatigado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fatigado.svg",
	flags: {core:{statusId:"fatigado"},tormenta20:{condition:true,durationScene:true,stack:"exausto",childEffect:["fraco","vulneravel"],category:'cansaco'}}
}

T20Conditions.fraco = {
	label: "Fraco",
	id: "fraco",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/fraco.svg",
	flags: {core:{statusId:"fraco"},tormenta20:{condition:true,durationScene:true,stack:"debilitado"}},
	changes: [{key: "system.modificadores.atributos.for", mode:2, value:-2},
		{key: "system.modificadores.atributos.des", mode:2, value:-2},
		{key: "system.modificadores.atributos.con", mode:2, value:-2},
		{key: "system.pericias.acro.condi", mode:3, value:-2},
		{key: "system.pericias.atle.condi", mode:3, value:-2},
		{key: "system.pericias.cava.condi", mode:3, value:-2},
		{key: "system.pericias.fort.condi", mode:3, value:-2},
		{key: "system.pericias.furt.condi", mode:3, value:-2},
		{key: "system.pericias.inic.condi", mode:3, value:-2},
		{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pilo.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2},
		{key: "system.pericias.refl.condi", mode:3, value:-2}]
}

T20Conditions.frustrado = {
	label: "Frustrado",
	id: "frustrado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/frustrado.svg",
	flags: {core:{statusId:"frustrado"},tormenta20:{condition:true,durationScene:true,stack:"esmorecido",category:'mental'}},
	changes: [{key: "system.modificadores.atributos.int", mode:2, value:-2},
		{key: "system.modificadores.atributos.sab", mode:2, value:-2},
		{key: "system.modificadores.atributos.con", mode:2, value:-2},
		{key: "system.pericias.ades.condi", mode:3, value:-2},
		{key: "system.pericias.atua.condi", mode:3, value:-2},
		{key: "system.pericias.conh.condi", mode:3, value:-2},
		{key: "system.pericias.cura.condi", mode:3, value:-2},
		{key: "system.pericias.dipl.condi", mode:3, value:-2},
		{key: "system.pericias.enga.condi", mode:3, value:-2},
		{key: "system.pericias.guer.condi", mode:3, value:-2},
		{key: "system.pericias.inti.condi", mode:3, value:-2},
		{key: "system.pericias.intu.condi", mode:3, value:-2},
		{key: "system.pericias.inve.condi", mode:3, value:-2},
		{key: "system.pericias.joga.condi", mode:3, value:-2},
		{key: "system.pericias.mist.condi", mode:3, value:-2},
		{key: "system.pericias.nobr.condi", mode:3, value:-2},
		{key: "system.pericias.ofic.condi", mode:3, value:-2},
		{key: "system.pericias.perc.condi", mode:3, value:-2},
		{key: "system.pericias.reli.condi", mode:3, value:-2},
		{key: "system.pericias.sobr.condi", mode:3, value:-2},
		{key: "system.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.imovel = {
	label: "Imóvel",
	id: "imovel",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/imovel.svg",
	flags: {core:{statusId:"imovel"},tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{ key: "system.attributes.movement.walk", mode: 3, value: 0 },
		{ key: "system.attributes.movement.burrow", mode: 3, value: 0 },
		{ key: "system.attributes.movement.climb", mode: 3, value: 0 },
		{ key: "system.attributes.movement.fly", mode: 3, value: 0 },
		{ key: "system.attributes.movement.swim", mode: 3, value: 0 }]
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
	changes: [{key: "system.attributes.defesa.condi", mode:3, value:-10}]
}

T20Conditions.invisivel = {
	label: "Invisível",
	id: "invisible",
	duration: {rounds:999},
	icon: "icons/svg/invisible.svg",
	flags: {core:{statusId:"invisible"},tormenta20:{condition:true,durationScene:true}},
}

T20Conditions.lento = {
	label: "Lento",
	id: "lento",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/lento.svg",
	flags: {core:{statusId:"lento"},tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{ key: "system.attributes.movement.walk", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.burrow", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.climb", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.fly", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.swim", mode: 1, value: 0.5 }]
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
	flags: {core:{statusId:"ofuscado"},tormenta20:{condition:true,durationScene:true,category:'sentidos'}},
	changes: [{key: "system.pericias.perc.condi", mode:3, value:-2}]
}

T20Conditions.paralisado = {
	label: "Paralisado",
	id: "paralisado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/paralisado.svg",
	flags: {core:{statusId:"paralisado"},tormenta20:{condition:true,durationScene:true,childEffect:["imovel","indefeso"],category:'movimento'}}
}

T20Conditions.pasmo = {
	label: "Pasmo",
	id: "pasmo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/pasmo.svg",
	flags: {core:{statusId:"pasmo"},tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.petrificado = {
	label: "Petrificado",
	id: "petrificado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/petrificado.svg",
	flags: {core:{statusId:"petrificado"},tormenta20:{condition:true,durationScene:true,childEffect:["inconsciente"],category:'metamorfose'}},
	changes: [ { key: "system.tracos.resistencias.dano.value", mode: 3, value: 8 } ]
}

T20Conditions.sangrando = {
	label: "Sangrando",
	id: "sangrando",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sangrando.svg",
	flags: {core:{statusId:"sangrando"},tormenta20:{condition:true,durationScene:true,category:'metabolismo'}},
	changes: [{key: "dano", mode:0, value:'1d6[perda]'}]
}

T20Conditions.sustentando = {
	label: "Sustentando",
	id: "sustentando",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sustentando.svg",
	flags: {core:{statusId:"sustentando"},tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "sustentado", mode:0, value:''}]
}

T20Conditions.surdo = {
	label: "Surdo",
	id: "surdo",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/surdo.svg",
	flags: {core:{statusId:"surdo"},tormenta20:{condition:true,durationScene:true,category:'sentidos'}},
	changes: [{key: "system.pericias.inic.condi", mode:3, value:-2}]
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
	changes: [{key: "system.attributes.defesa.condi", mode:3, value:-2}]
}

T20Conditions.sobrecarregado = {
	label: "Sobrecarregado",
	id: "sobrecarregado",
	duration: {rounds:999},
	icon: "systems/tormenta20/icons/conditions/sobrecarregado.svg",
	flags: {core:{statusId:"sobrecarregado"},tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{key: "system.attributes.defesa.pda", mode:2, value:-2},
		{ key: "system.attributes.movement.walk", mode: 2, value: -3 },
		{ key: "system.attributes.movement.burrow", mode: 2, value: -3 },
		{ key: "system.attributes.movement.climb", mode: 2, value: -3 },
		{ key: "system.attributes.movement.fly", mode: 2, value: -3 },
		{ key: "system.attributes.movement.swim", mode: 2, value: -3 }]
}