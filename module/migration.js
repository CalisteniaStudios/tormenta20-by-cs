import { T20 } from "./config.js";

/**
* Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
* @return {Promise}      A Promise which resolves once the migration is completed
*/
export const migrateWorld = async function() {
	ui.notifications.info(`Aplicando Migração de Sistema do Tormenta20 para a versão ${game.system.data.version}. Por favor, seja paciente e não feche o seu jogo ou desligue o servidor.`, {permanent: true});

	// Migrate World Actors
	for ( let a of game.actors.contents ) {
		try {
			console.warn("Migrate World Actors");
			console.log(a);
			const updateData = migrateActorData(a.data);
			if ( !foundry.utils.isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Ator ${a.name}`);
				console.log(updateData);
				await a.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Ator ${a.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Items
	for ( let i of game.items.contents ) {
		try {
			const updateData = migrateItemData(i.toObject());
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Item ${i.name}`);
				console.log(updateData);
				await i.update(updateData, {enforceTypes: false});
			}
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Item ${i.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate Actor Override Tokens
	for ( let s of game.scenes.contents ) {
		try {
			const updateData = migrateSceneData(s.data);
			if ( !isObjectEmpty(updateData) ) {
				console.log(`Migrando entidade Cena ${s.name}`);
				// await s.update(updateData, {enforceTypes: false});
				// Prevent un-updated chached actorData.
				s.tokens.contents.forEach(t => t._actor = null);
			}
		} catch(err) {
			err.message = `Migração de sistema Tormenta20 falhou para a Cena ${s.name}: ${err.message}`;
			console.error(err);
		}
	}

	// Migrate World Compendium Packs
	for ( let p of game.packs ) {
		if ( p.metadata.package !== "world" ) continue;
		if ( !["Actor", "Item", "Scene"].includes(p.metadata.entity) ) continue;
		// await migrateCompendium(p);
	}

	// Set the migration as complete
	game.settings.set("tormenta20", "systemMigrationVersion", game.system.data.version);
	ui.notifications.info(`Migração de Sistema do Tormenta20 para a versão ${game.system.data.version} concluída!`, {permanent: true});
};

/* -------------------------------------------- */

/**
* Apply migration rules to all Entities within a single Compendium pack
* @param pack
* @return {Promise}
*/
export const migrateCompendium = async function(pack) {
	const entity = pack.metadata.entity;
	if ( !["Actor", "Item", "Scene"].includes(entity) ) return;

	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({locked: false});

	// Begin by requesting server-side data model migration and get the migrated content
	await pack.migrate();
	const documents = await pack.getDocuments();

	// Iterate over compendium entries - applying fine-tuned migration functions
	for ( let doc of documents ) {
		let updateData = {};
		try {
			switch (entity) {
				case "Actor":
					updateData = migrateActorData(doc.data);
					break;
				case "Item":
					updateData = migrateItemData(doc.data);
					break;
				case "Scene":
					updateData = migrateSceneData(doc.data);
					break;
			}
			if ( isObjectEmpty(updateData) ) continue;

			// Save the entry, if data was changed
			await doc.update(updateData);
			console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
		}

		// Handle migration failures
		catch(err) {
			err.message = `Failed tormenta20 system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
		}
	}

	// Apply the original locked status for the pack
	await pack.configure({locked: wasLocked});
	console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/* -------------------------------------------- */
/*  Entity Type Migration Helpers               */
/* -------------------------------------------- */

/**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {Actor} actor   The actor to Update
 * @return {Object}       The updateData to apply
 */
export const migrateActorData = function(actor) {
	const updateData = {};
	// Actor Data Updates
	if( actor.type == "npc" ) return updateData;
	if ( actor.data ) {
		console.warn("migrateActorData");
		console.log(actor);
		_migrateActorTo8X(actor, updateData);
		// _migrateActiveEffectsTo8X(actor, updateData);
	}
	// Migrate Owned Items
	if ( !actor.items ) return updateData;
	const items = actor.items.reduce((arr, i) => {
		// Migrate the Owned Item
		const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
		let itemUpdate = migrateItemData(itemData);
		
		// Update the Owned Item
		if ( !isObjectEmpty(itemUpdate) ) {
			itemUpdate._id = itemData._id;
			arr.push(expandObject(itemUpdate));
		}
		return arr;
	}, []);
	if ( items.length > 20000 ) updateData.items = items;
	return updateData;
};

/* -------------------------------------------- */

	// TODO clean actor data

/* -------------------------------------------- */

/**
* Migrate a single Item entity to incorporate latest data model changes
* @param item
*/
export const migrateItemData = function(item) {
	const updateData = {};
	console.log(item);
	_migrateItemTo8X(item, updateData);
	_migrateActiveEffectsTo8X(item, updateData);
	return updateData;
};


/* -------------------------------------------- */

/**
* Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
* Return an Object of updateData to be applied
* @param {Object} scene  The Scene data to Update
* @return {Object}       The updateData to apply
*/
export const migrateSceneData = function(scene) {
	const tokens = scene.tokens.map(token => {
		const t = token.toJSON();
		if (!t.actorId || t.actorLink) {
			t.actorData = {};
		}
		else if ( !game.actors.has(t.actorId) ){
			t.actorId = null;
			t.actorData = {};
		}
		else if ( !t.actorLink ) {
			const actorData = duplicate(t.actorData);
			actorData.type = token.actor?.type;
			const update = migrateActorData(actorData);
			['items', 'effects'].forEach(embeddedName => {
				if (!update[embeddedName]?.length) return;
				const updates = new Map(update[embeddedName].map(u => [u._id, u]));
				t.actorData[embeddedName].forEach(original => {
					const update = updates.get(original._id);
					if (update) mergeObject(original, update);
				});
				delete update[embeddedName];
			});

			mergeObject(t.actorData, update);
		}
		return t;
	});
	return {tokens};
};

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
 * Migrate actor data to new model
 * @private
 */
function _migrateActorTo8X(actor, updateData) {
	const ad = actor.data;
	const flags = actor.flags;
	console.warn("_migrateActorTo8X");
	console.log(actor)
	console.log(ad);
	console.log(flags);
	updateData["data.detalhes.raca"] = ad.attributes.raca;
	updateData["data.detalhes.info"] = ad.attributes.info;
	updateData["data.detalhes.origem"] = ad.attributes.origem;
	updateData["data.detalhes.divindade"] = ad.attributes.divindade;
	let sizes = {"médio":"med","medio":"med","pequeno":"peq","minusculo":"min","minúsculo":"min","grande":"gra","enorme":"eno","colossal":"col"};
	let newSize = ad.tamanho ? sizes[ad.tamanho.toLowerCase()] : "med";
	updateData["data.tracos.tamanho"] = newSize;
	// data.detalhes.resistencias is Descriptive Only
	updateData["data.detalhes.resistencias"] = ad.resistencias;
	if( ad.detalhes?.dinheiro ){
		updateData["data.dinheiro"] = ad.detalhes.dinheiro;
	}

	updateData["data.detalhes.biography.value"] = ad.detalhes.biography;
	updateData["data.tracos.idiomas"] = ad.detalhes.idiomas;
	updateData["data.tracos.profArmas"] = ad.detalhes.profArmas;
	updateData["data.tracos.profArmaduras"] = ad.detalhes.profArmaduras;
	updateData["data.tracos.idiomas"] = ad.detalhes.profArmaduras;
	updateData["data.attributes.conjuracao"] = ad.atributoChave;
	updateData["data.attributes.defesa.value"] = ad.defesa.value;
	updateData["data.attributes.defesa.outro"] = ad.defesa.outro;
	updateData["data.attributes.defesa.bonus"] = ad.defesa.bonus;
	updateData["data.attributes.defesa.condi"] = ad.defesa.condi;
	updateData["data.attributes.defesa.pda"] = ad.defesa.pda;
	// data.tracos.resistencias is/will be Functional
	updateData["data.tracos.resistencias.dano"] = Number(ad.rd.base || 0) + Number(ad.rd.temp || 0);
	for( let [k, p] of Object.entries(ad.pericias) ){
		console.log(k);
		let key = Object.keys(T20.pericias).find(i=> i.match(k));
		let temp = {
			value: 0,
			atributo: p.atributo,
			treinado: p.treinado,
			treino: p.treino,
			condi: 0,
			outros: p.outros
		}
		if( key ) updateData[`data.pericias.${key}`] = temp;
		if( k.length == 3 ) updateData[`data.pericias.-=${k}`] = null;
	}
	let i = 1;
	for( let o of ad.pericias.ofi.mais ){
		let temp = {
			value: 0,
			atributo: o.atributo,
			treinado: o.treinado,
			treino: o.treino,
			condi: 0,
			outros: o.outros,
			label: o.label
		}
		updateData[`data.pericias.ofi${i}`] = temp;

		i++;
	}
	i = 1;
	for( let o of Object.values(ad.periciasCustom) ){
		let skill = `_pc${i}`;
		let temp = {}
		if ( actor.type == "npc" ){
			skill = Object.entries( T20.pericias ).find(i => i[1] == o.label )[0];
		} else {
			i++;
			temp.label = o.label;
		}
		temp.value = 0;
		temp.atributo = o.atributo;
		temp.treinado = o.treinado;
		temp.treino = o.treino;
		temp.condi = 0;
		temp.outros = o.outros;

		updateData[`data.pericias.${skill}`] = temp;
	}
	updateData["flags.tormenta20.sheet.editarPericias"] = flags.editarPericias;
	updateData["flags.tormenta20.sheet.mostrarDivindade"] = flags.mostrarDivindade;
	updateData["flags.tormenta20.sheet.mostrarAtributoTemp"] = flags.mostrarAtributoTemp;
	updateData["flags.tormenta20.sheet.mostrarOutrosDefesa"] = flags.mostrarOutrosDefesa;
	updateData["flags.tormenta20.sheet.botaoEditarItens"] = flags.botaoEditarItens;
	updateData["flags.tormenta20.sheet.mostrarTreino"] = flags.mostrarTreino;
	updateData["flags.tormenta20.sheet.mago"] = flags.mago;
	updateData["flags.tormenta20.lvlconfig.pvBonus"] = flags.pvBonus;
	updateData["flags.tormenta20.lvlconfig.pmBonus"] = flags.pmBonus;
	updateData["flags.tormenta20.lvlconfig.pv"] = {
		for: flags.forPV,
		des: flags.desPV,
		int: flags.intPV,
		sab: flags.sabPV,
		car: flags.carPV
	};
	updateData["flags.tormenta20.lvlconfig.pm"] = {
		for: flags.forPM,
		des: flags.desPM,
		con: flags.conPM,
		int: flags.intPM,
		sab: flags.sabPM,
		car: flags.carPM
	};
	
	for ( let k of Object.keys(ad.atributos) ) {
		updateData[`data.atributos.${k}.-=raca`] = null;
		updateData[`data.atributos.${k}.-=temp`] = null;
		updateData[`data.atributos.${k}.-=mod`] = null;
		updateData[`data.atributos.${k}.-=penalidade`] = null;
	}
	updateData["data.attributes.-=raca"] = null;
	updateData["data.attributes.-=info"] = null;
	updateData["data.attributes.-=classe"] = null;
	updateData["data.attributes.-=origem"] = null;
	updateData["data.attributes.-=divindade"] = null;
	updateData["data.-=tamanho"] = null;
	updateData["data.-=resistencias"] = null;
	updateData["data.detalhes.-=dinheiro"] = null;
	updateData["data.detalhes.-=biography"] = null;
	updateData["data.detalhes.-=idiomas"] = null;
	updateData["data.detalhes.-=profArmas"] = null;
	updateData["data.detalhes.-=profArmaduras"] = null;
	updateData["data.detalhes.-=profArmaduras"] = null;
	updateData["data.-=atributoChave"] = null;
	updateData["data.-=defesa"] = null;
	updateData["data.-=periciasCustom"] = null;
	updateData["data.-=rd"] = null;
	updateData["data.attributes.-=hp"] = null;
	updateData["data.attributes.-=classe"] = null;
	updateData["data.attributes.-=senses"] = null;
	updateData["data.atributos.-=raca"] = null;
	updateData["data.atributos.-=temp"] = null;
	updateData["data.atributos.-=mod"] = null;
	updateData["data.atributos.-=penalidade"] = null;
	updateData["data.detalhes.-=carga"] = null;
	updateData["data.detalhes.-=altura"] = null;
	updateData["data.detalhes.-=peso"] = null;
	updateData["data.detalhes.-=aparencia"] = null;
	updateData["data.detalhes.-=personalidade"] = null;
	updateData["data.detalhes.-=alinhamento"] = null;
	updateData["data.-=biography"] = null;
	updateData["data.-=referencias"] = null;
	updateData["data.-=deslocamento"] = null;
	updateData["data.-=defesa"] = null;

	updateData["flags.-=editarPericias"] = null;
	updateData["flags.-=mostrarDivindade"] = null;
	updateData["flags.-=mostrarAtributoTemp"] = null;
	updateData["flags.-=mostrarOutrosDefesa"] = null;
	updateData["flags.-=botaoEditarItens"] = null;
	updateData["flags.-=mostrarTreino"] = null;
	updateData["flags.-=mago"] = null;
	updateData["flags.-=pvBonus"] = null;
	updateData["flags.-=pmBonus"] = null;
	updateData["flags.-=forPV"] = null;
	updateData["flags.-=desPV"] = null;
	updateData["flags.-=intPV"] = null;
	updateData["flags.-=sabPV"] = null;
	updateData["flags.-=carPV"] = null;
	updateData["flags.-=forPM"] = null;
	updateData["flags.-=desPM"] = null;
	updateData["flags.-=conPM"] = null;
	updateData["flags.-=intPM"] = null;
	updateData["flags.-=sabPM"] = null;
	updateData["flags.-=carPM"] = null;

	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate item data to new model
 * @private
 */
function _migrateItemTo8X(item, updateData) {
	const id = item.data;
	updateData["data.description.value"] = id.description;
	if( item.type == "arma") {
		let owner = item.parent;
		let rolls = [];
		let atq = {}
		atq.name = "Ataque";
		atq.key = "ataque0";
		atq.type = "ataque";
		atq.parts = [["1d20",""], ["luta",""], ["",""]];
		atq.parts[1][0] = {"lut": "luta", "pon":"pont", "atu":"atua"}[id.pericia];
		if( owner ) {
			let atbSkill = owner.data.pericias[atq.parts[1][0]].atributo;
			atq.parts[1][1] = id.atrAtq == atbSkill ? "" : id.atrAtq;
		} else {
			atq.parts[1][1] = "";
		}
		atq.parts[2][0] = id.atqBns ? id.atqBns : "";
		rolls.push(atq);
		let dano = {};
		dano.name = "Dano";
		dano.key = "dano0";
		dano.type = "dano";
		dano.versatil = "";
		dano.parts = [["1d6",""], ["@for",""]];
		dano.parts[0][0] = id.dano ? id.dano : "1d6";
		dano.parts[0][1] = T20.damageTypes[id.tipo.toLowerCase()] ? T20.damageTypes[id.tipo.toLowerCase()] : "corte";
		dano.parts[1][0] = id.atrDan ? "@"+id.atrDan : "@for";
		updateData["data.rolls"] = rolls;

		updateData["data.-=pericia"] = null;
		updateData["data.-=atrAtq"] = null;
		updateData["data.-=atqBns"] = null;
		updateData["data.-=dano"] = null;
		updateData["data.-=tipo"] = null;
		updateData["data.-=atrDan"] = null;

	}
	// EQUIP TO EQUIPAMENTO
	else if( item.type == "equip") {
		item.type = "equipamento";
		updateData["data.armadura.maxAtr"] = 0;
	}
	// SPELL AND POWER
	else if( item.type == "magia" || item.type == "poder" || item.type == "consumivel" ) {
		let action = {"padrao":"action", "movimento":"move", "completa":"full", "reacao":"reaction", "livre":"free"};
		let alcance = {"Nenhum": "none", "Pessoal": "self", "Toque": "touch", "Curto": "short", "Médio": "medium", "Longo": "long"};
		let duration = {instant: "inst", cena: "scene", turno: "turn", rodada: "round", sust: "sust", verTexto: "special", outra: "special" }

		updateData["data.ativacao.execucao"] = action[id.ativacao.execucao] ?? "";
		updateData["data.alcance"] = alcance[id.alcance];
		console.log(id);
		console.log(id.resistencia);
		updateData["data.reistencia"] = {
			pericia: id.resistencia? id.resistencia.match(/fort|refl|vont/i)[0] : "",
			atributo: id.atrRes,
			bonus: id.cd,
			txt: id.resistencia
		};
		updateData["data.duracao"] = {
			value: id.duracao.valor ?? null,
			units: duration[id.duracao.unidade] ?? "",
			special: ""
		}
		let rolls = [];
		if( id.roll ){
			rolls.push({
				type: "dano",
				key: "dano0",
				name: "Dano",
				parts: [[ id.roll , ""]]
			});
		} else if ( id.efeito ) {
			rolls.push({
				type: "dano",
				key: "dano0",
				name: "Dano",
				parts: [[ id.efeito , ""]]
			});
		}
		updateData["data.rolls"] = rolls;
		updateData["data.-=aprimoramentos"] = null;
		updateData["data.-=roll"] = null;
		updateData["data.-=efeito"] = null;
	}
	//
	else if( item.type == "classe") {
		if( item.parent ){
			let classe = item.parent.items.find(i => i.type == "classe" );
			if( item.id == classe.id ) {
				updateData["data.inicial"] = true;
			}
		}
	}
	return updateData;
}

/* -------------------------------------------- */
/**
 * Migrate ActiveEffects data to new flags and keys
 * @private
 */
function _migrateActiveEffectsTo8X(owner, updateData) {
	let effects = foundry.utils.deepClone(owner.effects);
	console.log(owner);
	for ( let effect of effects ){
		if ( effect.data ) {
			effect = effect.data;
		}
		console.log(effect);
		let flagT20 = effect.flags.t20 || {};
		// flagT20 = effect.flags.t20;

		updateData["flags.tormenta20"] = flagT20;
		updateData["flags.-=t20"] = null;
		for ( let e of effect.changes ) {
			if( e.key.match(/data.defesa/) ){
				e.key.replace(/data.defesa/, "data.attributes.defesa");
				e.key.replace(/defesa.temp/, "data.attributes.defesa.outros");
				e.key.replace(/defesa.outro/, "data.attributes.defesa.bonus");
			} else {
				e.key.replace(/.temp/, ".bonus");
			}
			e.key.replace(/data.tamanho/, "data.tracos.tamanho");
			e.key.replace(/.pericias.acr/, ".pericias.acro");
			e.key.replace(/.pericias.ade/, ".pericias.ades");
			e.key.replace(/.pericias.atl/, ".pericias.atle");
			e.key.replace(/.pericias.atu/, ".pericias.atua");
			e.key.replace(/.pericias.cav/, ".pericias.cava");
			e.key.replace(/.pericias.con/, ".pericias.conh");
			e.key.replace(/.pericias.cur/, ".pericias.cura");
			e.key.replace(/.pericias.def/, ".pericias.defe");
			e.key.replace(/.pericias.dip/, ".pericias.dipl");
			e.key.replace(/.pericias.eng/, ".pericias.enga");
			e.key.replace(/.pericias.for/, ".pericias.fort");
			e.key.replace(/.pericias.fur/, ".pericias.furt");
			e.key.replace(/.pericias.gue/, ".pericias.guer");
			e.key.replace(/.pericias.ini/, ".pericias.inic");
			e.key.replace(/.pericias.int/, ".pericias.inti");
			e.key.replace(/.pericias.intu/, ".pericias.intu");
			e.key.replace(/.pericias.inv/, ".pericias.inve");
			e.key.replace(/.pericias.jog/, ".pericias.joga");
			e.key.replace(/.pericias.lad/, ".pericias.ladi");
			e.key.replace(/.pericias.lut/, ".pericias.luta");
			e.key.replace(/.pericias.mis/, ".pericias.mist");
			e.key.replace(/.pericias.ocu/, ".pericias.ocul");
			e.key.replace(/.pericias.nob/, ".pericias.nobr");
			e.key.replace(/.pericias.ofi/, ".pericias.ofic");
			e.key.replace(/.pericias.per/, ".pericias.perc");
			e.key.replace(/.pericias.pil/, ".pericias.pilo");
			e.key.replace(/.pericias.pon/, ".pericias.pont");
			e.key.replace(/.pericias.ref/, ".pericias.refl");
			e.key.replace(/.pericias.rel/, ".pericias.reli");
			e.key.replace(/.pericias.sob/, ".pericias.sobr");
			e.key.replace(/.pericias.von/, ".pericias.vont");
	
			e.key.replace(/flags.pvBonus/, "flags.tormenta20.lvlconfig.pvBonus");
			e.key.replace(/flags.pmBonus/, "flags.tormenta20.lvlconfig.pmBonus");
			e.key.replace(/flags.t20.pvBonus/, "flags.tormenta20.lvlconfig.pvBonus");
			e.key.replace(/flags.t20.pmBonus/, "flags.tormenta20.lvlconfig.pmBonus");
			e.key.replace(/flags.t20/, "flags.tormenta20");
		}
	}
	updateData["effects"] = effects;
	return updateData;
}

/* -------------------------------------------- */

function _migrateClasse(item, updateData) {
	if ( item.type != "classe" ) return;
	return updateData;
}

function _migrateSpell(item, updateData) {
	if ( item.type != "magia" ) return;
	return updateData;
}

/**
* Reorganiza os poderes.
* @private
*/
function _migratePower(item, updateData) {
	if ( item.type != "poder" ) return;
	return updateData;
}

/**
* Replaces Armadura to Equip
* @private
*/
function _migrateItemArmor(item, updateData) {
	if ( item.type != "equipamento" ) return;
	return updateData;
}

/**
* Adiciona os tipos e propriedades das armas.
* @private
*/
function _migrateItemWeapon(item, updateData) {
	if ( item.type != "arma" ) return;
	return updateData;
}
