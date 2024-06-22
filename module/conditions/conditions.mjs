export const T20Conditions = {};

T20Conditions.abalado = {
	name: "Abalado",
	id: "abalado",
	duration: {rounds:999},
	statuses: ["abalado"],
	icon: "systems/tormenta20/icons/conditions/abalado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"apavorado",category:'medo'}},
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
		// {key: "system.pericias.ofic.condi", mode:3, value:-2},
		{key: "system.pericias.perc.condi", mode:3, value:-2},
		{key: "system.pericias.pilo.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2},
		{key: "system.pericias.refl.condi", mode:3, value:-2},
		{key: "system.pericias.reli.condi", mode:3, value:-2},
		{key: "system.pericias.sobr.condi", mode:3, value:-2},
		{key: "system.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.agarrado = {
	name: "Agarrado",
	id: "agarrado",
	duration: {rounds:999},
	statuses: ["agarrado"],
	icon: "systems/tormenta20/icons/conditions/agarrado.svg",
	flags: {tormenta20:{condition:true,childEffect:["desprevenido","imovel"],category:'movimento'}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.alquebrado = {
	name: "Alquebrado",
	id: "alquebrado",
	duration: {rounds:999},
	statuses: ["alquebrado"],
	icon: "systems/tormenta20/icons/conditions/alquebrado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.modificadores.custoPM", mode:2, value:1}]
}

T20Conditions.apavorado = {
	name: "Apavorado",
	id: "apavorado",
	duration: {rounds:999},
	statuses: ["apavorado"],
	icon: "systems/tormenta20/icons/conditions/apavorado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'medo'}},
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
		// {key: "system.pericias.ofic.condi", mode:3, value:-5},
		{key: "system.pericias.perc.condi", mode:3, value:-5},
		{key: "system.pericias.pilo.condi", mode:3, value:-5},
		{key: "system.pericias.pont.condi", mode:3, value:-5},
		{key: "system.pericias.refl.condi", mode:3, value:-5},
		{key: "system.pericias.reli.condi", mode:3, value:-5},
		{key: "system.pericias.sobr.condi", mode:3, value:-5},
		{key: "system.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.atordoado = {
	name: "Atordoado",
	id: "atordoado",
	duration: {rounds:999},
	statuses: ["atordoado"],
	icon: "systems/tormenta20/icons/conditions/atordoado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"],category:'mental'}}
}

T20Conditions.caido = {
	name: "Caído",
	id: "caido",
	duration: {rounds:999},
	statuses: ["caido"],
	icon: "systems/tormenta20/icons/conditions/caido.svg",
	flags: {tormenta20:{condition:true}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-5},
		{ key: "system.attributes.movement.walk", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.burrow", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.climb", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.fly", mode: 3, value: 1.5 },
		{ key: "system.attributes.movement.swim", mode: 3, value: 1.5 }]
}

T20Conditions.cego = {
	name: "Cego",
	id: "cego",
	duration: {rounds:999},
	statuses: ["cego","blind","sentidos"],
	icon: "systems/tormenta20/icons/conditions/cego.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido","lento"],category:'sentidos'}},
	changes: [{key: "system.pericias.acro.condi", mode:3, value:-5},
		{key: "system.pericias.atle.condi", mode:3, value:-5},
		{key: "system.pericias.cava.condi", mode:3, value:-5},
		{key: "system.pericias.furt.condi", mode:3, value:-5},
		{key: "system.pericias.inic.condi", mode:3, value:-5},
		{key: "system.pericias.luta.condi", mode:3, value:-5},
		{key: "system.pericias.pilo.condi", mode:3, value:-5},
		{key: "system.pericias.pont.condi", mode:3, value:-5},
		{key: "system.pericias.refl.condi", mode:3, value:-5}]
}

T20Conditions.confuso = {
	name: "Confuso",
	id: "confuso",
	duration: {rounds:999},
	statuses: ["confuso"],
	icon: "systems/tormenta20/icons/conditions/confuso.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.debilitado = {
	name: "Debilitado",
	id: "debilitado",
	duration: {rounds:999},
	statuses: ["debilitado"],
	icon: "systems/tormenta20/icons/conditions/debilitado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"inconsciente"}},
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
	name: "Desprevenido",
	id: "desprevenido",
	duration: {rounds:999},
	statuses: ["desprevenido"],
	icon: "systems/tormenta20/icons/conditions/desprevenido.svg",
	flags: {tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "system.pericias.refl.condi", mode:3, value:-5},
	{key: "system.attributes.defesa.condi", mode:3, value:-5}]
}

T20Conditions.doente = {
	name: "Doente",
	id: "doente",
	duration: {rounds:999},
	statuses: ["doente"],
	icon: "systems/tormenta20/icons/conditions/doente.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'metabolismo'}}
}

T20Conditions.emchamas = {
	name: "Em Chamas",
	id: "emchamas",
	duration: {rounds:999},
	statuses: ["emchamas"],
	icon: "systems/tormenta20/icons/conditions/em-chamas.svg",
	flags: {tormenta20:{condition:true,durationScene:true}},
	changes:[{key:'dano',mode:0,value:'1d6[fogo]'}]
}

T20Conditions.enfeiticado = {
	name: "Enfeitiçado",
	id: "enfeiticado",
	duration: {rounds:999},
	statuses: ["enfeiticado"],
	icon: "systems/tormenta20/icons/conditions/enfeiticado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.enjoado = {
	name: "Enjoado",
	id: "enjoado",
	duration: {rounds:999},
	statuses: ["enjoado"],
	icon: "systems/tormenta20/icons/conditions/enjoado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'metabolismo'}}
}

T20Conditions.enredado = {
	name: "Enredado",
	id: "enredado",
	duration: {rounds:999},
	statuses: ["enredado"],
	icon: "systems/tormenta20/icons/conditions/enredado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["lento","vulneravel"],category:'movimento'}},
	changes: [{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2}]
}

T20Conditions.envenenado = {
	name: "Envenenado",
	id: "envenenado",
	duration: {rounds:999},
	statuses: ["envenenado"],
	icon: "systems/tormenta20/icons/conditions/envenenado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'veneno'}}
}

T20Conditions.esmorecido = {
	name: "Esmorecido",
	id: "esmorecido",
	duration: {rounds:999},
	statuses: ["esmorecido"],
	icon: "systems/tormenta20/icons/conditions/esmorecido.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.modificadores.atributos.int", mode:2, value:-5},
		{key: "system.modificadores.atributos.sab", mode:2, value:-5},
		{key: "system.modificadores.atributos.car", mode:2, value:-5},
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
		// {key: "system.pericias.ofic.condi", mode:3, value:-5},
		{key: "system.pericias.perc.condi", mode:3, value:-5},
		{key: "system.pericias.reli.condi", mode:3, value:-5},
		{key: "system.pericias.sobr.condi", mode:3, value:-5},
		{key: "system.pericias.vont.condi", mode:3, value:-5}]
}

T20Conditions.exausto = {
	name: "Exausto",
	id: "exausto",
	duration: {rounds:999},
	statuses: ["exausto"],
	icon: "systems/tormenta20/icons/conditions/exausto.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"inconsciente",childEffect:["debilitado","lento","vulneravel"],category:'cansaco'}}
}

T20Conditions.fascinado = {
	name: "Fascinado",
	id: "fascinado",
	duration: {rounds:999},
	statuses: ["fascinado"],
	icon: "systems/tormenta20/icons/conditions/fascinado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}},
	changes: [{key: "system.pericias.perc.condi", mode:3, value:-5}]
}

T20Conditions.fatigado = {
	name: "Fatigado",
	id: "fatigado",
	duration: {rounds:999},
	statuses: ["fatigado"],
	icon: "systems/tormenta20/icons/conditions/fatigado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"exausto",childEffect:["fraco","vulneravel"],category:'cansaco'}}
}

T20Conditions.fraco = {
	name: "Fraco",
	id: "fraco",
	duration: {rounds:999},
	statuses: ["fraco"],
	icon: "systems/tormenta20/icons/conditions/fraco.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"debilitado"}},
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
	name: "Frustrado",
	id: "frustrado",
	duration: {rounds:999},
	statuses: ["frustrado"],
	icon: "systems/tormenta20/icons/conditions/frustrado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,stack:"esmorecido",category:'mental'}},
	changes: [{key: "system.modificadores.atributos.int", mode:2, value:-2},
		{key: "system.modificadores.atributos.sab", mode:2, value:-2},
		{key: "system.modificadores.atributos.car", mode:2, value:-2},
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
		// {key: "system.pericias.ofic.condi", mode:3, value:-2},
		{key: "system.pericias.perc.condi", mode:3, value:-2},
		{key: "system.pericias.reli.condi", mode:3, value:-2},
		{key: "system.pericias.sobr.condi", mode:3, value:-2},
		{key: "system.pericias.vont.condi", mode:3, value:-2}]
}

T20Conditions.imovel = {
	name: "Imóvel",
	id: "imovel",
	duration: {rounds:999},
	statuses: ["imovel"],
	icon: "systems/tormenta20/icons/conditions/imovel.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{ key: "system.attributes.movement.walk", mode: 3, value: 0 },
		{ key: "system.attributes.movement.burrow", mode: 3, value: 0 },
		{ key: "system.attributes.movement.climb", mode: 3, value: 0 },
		{ key: "system.attributes.movement.fly", mode: 3, value: 0 },
		{ key: "system.attributes.movement.swim", mode: 3, value: 0 }]
}

T20Conditions.inconsciente = {
	name: "Inconsciente",
	id: "inconsciente",
	duration: {rounds:999},
	statuses: ["inconsciente"],
	icon: "systems/tormenta20/icons/conditions/inconsciente.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["indefeso"]}}
}

T20Conditions.indefeso = {
	name: "Indefeso",
	id: "indefeso",
	duration: {rounds:999},
	statuses: ["indefeso"],
	icon: "systems/tormenta20/icons/conditions/indefeso.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}},
	changes: [{key: "system.attributes.defesa.condi", mode:3, value:-10}]
}

T20Conditions.invisivel = {
	name: "Invisível",
	id: "invisivel",
	duration: {rounds:999},
	statuses: ["invisivel"],
	icon: "icons/svg/invisible.svg",
	flags: {tormenta20:{condition:true,durationScene:true}},
}

T20Conditions.lento = {
	name: "Lento",
	id: "lento",
	duration: {rounds:999},
	statuses: ["lento"],
	icon: "systems/tormenta20/icons/conditions/lento.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{ key: "system.attributes.movement.walk", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.burrow", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.climb", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.fly", mode: 1, value: 0.5 },
        { key: "system.attributes.movement.swim", mode: 1, value: 0.5 }]
}

T20Conditions.morto = {
	name: "Morto",
	id: "morto",
	duration: {rounds:999},
	statuses: ["morto"],
	icon: "systems/tormenta20/icons/conditions/morto.svg",
	flags: {tormenta20:{condition:true}}
}

T20Conditions.ofuscado = {
	name: "Ofuscado",
	id: "ofuscado",
	duration: {rounds:999},
	statuses: ["ofuscado"],
	icon: "systems/tormenta20/icons/conditions/ofuscado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'sentidos'}},
	changes: [
		{key: "system.pericias.perc.condi", mode:3, value:-2},
		{key: "system.pericias.luta.condi", mode:3, value:-2},
		{key: "system.pericias.pont.condi", mode:3, value:-2},
	]
}

T20Conditions.paralisado = {
	name: "Paralisado",
	id: "paralisado",
	duration: {rounds:999},
	statuses: ["paralisado"],
	icon: "systems/tormenta20/icons/conditions/paralisado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["imovel","indefeso"],category:'movimento'}}
}

T20Conditions.pasmo = {
	name: "Pasmo",
	id: "pasmo",
	duration: {rounds:999},
	statuses: ["pasmo"],
	icon: "systems/tormenta20/icons/conditions/pasmo.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'mental'}}
}

T20Conditions.petrificado = {
	name: "Petrificado",
	id: "petrificado",
	duration: {rounds:999},
	statuses: ["petrificado"],
	icon: "systems/tormenta20/icons/conditions/petrificado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["inconsciente"],category:'metamorfose'}},
	changes: [ { key: "system.tracos.resistencias.dano.value", mode: 3, value: 8 } ]
}

T20Conditions.sangrando = {
	name: "Sangrando",
	id: "sangrando",
	duration: {rounds:999},
	statuses: ["sangrando"],
	icon: "systems/tormenta20/icons/conditions/sangrando.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'metabolismo'}},
	changes: [{key: "dano", mode:0, value:'1d6[perda]'}]
}

T20Conditions.sustentando = {
	name: "Sustentando",
	id: "sustentando",
	duration: {rounds:999},
	statuses: ["sustentando"],
	icon: "systems/tormenta20/icons/conditions/sustentando.svg",
	flags: {tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "sustentado", mode:0, value:''}]
}

T20Conditions.surdo = {
	name: "Surdo",
	id: "surdo",
	duration: {rounds:999},
	statuses: ["surdo"],
	icon: "systems/tormenta20/icons/conditions/surdo.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'sentidos'}},
	changes: [{key: "system.pericias.inic.condi", mode:3, value:-5}]
}

T20Conditions.surpreendido = {
	name: "Surpreendido",
	id: "surpreendido",
	duration: {rounds:999},
	statuses: ["surpreendido"],
	icon: "systems/tormenta20/icons/conditions/surpreendido.svg",
	flags: {tormenta20:{condition:true,durationScene:true,childEffect:["desprevenido"]}}
}

T20Conditions.vulneravel = {
	name: "Vulnerável",
	id: "vulneravel",
	duration: {rounds:999},
	statuses: ["vulneravel"],
	icon: "systems/tormenta20/icons/conditions/vulneravel.svg",
	flags: {tormenta20:{condition:true,durationScene:true}},
	changes: [{key: "system.attributes.defesa.condi", mode:3, value:-2}]
}

T20Conditions.sobrecarregado = {
	name: "Sobrecarregado",
	id: "sobrecarregado",
	duration: {rounds:999},
	statuses: ["sobrecarregado"],
	icon: "systems/tormenta20/icons/conditions/sobrecarregado.svg",
	flags: {tormenta20:{condition:true,durationScene:true,category:'movimento'}},
	changes: [{key: "system.attributes.defesa.pda", mode:2, value:-2},
		{ key: "system.attributes.movement.walk", mode: 2, value: -3 },
		{ key: "system.attributes.movement.burrow", mode: 2, value: -3 },
		{ key: "system.attributes.movement.climb", mode: 2, value: -3 },
		{ key: "system.attributes.movement.fly", mode: 2, value: -3 },
		{ key: "system.attributes.movement.swim", mode: 2, value: -3 }]
}