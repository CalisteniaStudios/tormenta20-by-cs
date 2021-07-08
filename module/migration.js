let teveErro = false;
/**
* Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
* @return {Promise}      A Promise which resolves once the migration is completed
*/
export const migrateWorld = async function () {
	ui.notifications.info(`Aplicando Migração de Sistema do Tormenta20 para a versão ${game.system.data.version}. Por favor, seja paciente e não feche o seu jogo ou desligue o servidor.`, { permanent: true });
	
	// Migrate World Actors
	for (let a of game.actors.contents) {
		let updateData = {};
		try {
			updateData = migrateActorData(a.data);
			removeDeprecatedData(a.data, updateData);
			if (!isObjectEmpty(updateData)) {
				console.log(`Migrando entidade Ator ${a.name}`);
				await a.update(updateData, { enforceTypes: false });
			}
		} catch (err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Ator ${a.name}: ${err.message}`;
			teveErro = true;
			console.error(err);
		}
	}
	
	// Migrate World Items
	for (let i of game.items.contents) {
		try {
			const updateData = migrateItemData(i.data);
			removeDeprecatedData(i.data, updateData);
			if (!isObjectEmpty(updateData)) {
				console.log(`Migrando entidade Item ${i.name}`);
				await i.update(updateData, { enforceTypes: false });
			}
		} catch (err) {
			err.message = `Migração de sistema Tormenta20 falhou para o Item ${i.name}: ${err.message}`;
			teveErro = true;
			console.error(err);
		}
	}
	
	// Migrate Actor Override Tokens
	for (let s of game.scenes.contents) {
		try {
			const updateData = migrateSceneData(s.data);
			if (!isObjectEmpty(updateData)) {
				console.log(`Migrando entidade Cena ${s.name}`);
				// Migrando entidade Cena Minas Heldret 2 Andar
				await s.update(updateData, { enforceTypes: false });
				s.tokens.contents.forEach(t => t._actor = null);
			}
		} catch (err) {
			err.message = `Migração de sistema Tormenta20 falhou para a Cena ${s.name}: ${err.message}`;
			teveErro = true;
			console.error(err);
		}

	}
	
	// Migrate World Compendium Packs
	for (let p of game.packs) {
		if (p.metadata.package !== "world") continue;
		if (!["Actor", "Item", "Scene"].includes(p.metadata.entity)) continue;
		await migrateCompendium(p);
	}
	
	// Set the migration as complete
	game.settings.set("tormenta20","systemMigrationVersion",game.system.data.version);
	ui.notifications.info(`Migração de Sistema do Tormenta20 para a versão ${game.system.data.version} concluída!`,{ permanent: true });
	console.log(`Migração de Sistema do Tormenta20 para a versão ${game.system.data.version} concluída!`);
	
	let error = "";
	if( teveErro ){
		error = "<br>Erros ocorreram durante a migração, consulte o console (F12). Print e reporte os erros ao desenvolvedor."
	}

	new Dialog({
		"title": `Feedback de Atualização`,
		"content": `<p style="text-align:center">Para finalizar o processo de atualização é necessário recarregar o Foundry (F5) para que os itens e fichas sejam preparados corretamente. <br> Alguns tokens não linkados podem conter erros, embora suas fichas originais estejam . ${error}</p>`,
		"buttons": {
			"no": {
				"icon": '<i class="fas fa-times"></i>',
				"label": 'Cancelar'
			},
			"yes": {
				"icon": '<i class="fas fa-check"></i>',
				"label": 'Recarregar',
				"callback": (html) => {
					window.location.reload();
				}
			},
		},
		"default": 'yes',
	}).render(true);
	
};

/* -------------------------------------------- */

/**
* Apply migration rules to all Entities within a single Compendium pack
* @param pack
* @return {Promise}
*/
export const migrateCompendium = async function (pack) {
	const entity = pack.metadata.entity;
	// if ( !["Actor", "Item", "Scene"].includes(entity) ) return;
	if ( !["Actor", "Item"].includes(entity) ) return;
	// if ( !["Actor"].includes(entity) ) return;
	
	// Unlock the pack for editing
	const wasLocked = pack.locked;
	await pack.configure({ locked: false });
	
	// Begin by requesting server-side data model migration and get the migrated content
	await pack.migrate();
	const content = await pack.getDocuments();
	
	// Iterate over compendium entries - applying fine-tuned migration functions
	for (let doc of content) {
		let updateData = {};
		try {
			switch (entity) {
				case "Actor":
				updateData = migrateActorData(doc.data);
				removeDeprecatedData(doc.data, updateData);
				break;
				case "Item":
				updateData = migrateItemData(doc.data);
				removeDeprecatedData(doc.data, updateData);
				break;
				case "Scene":
				updateData = migrateSceneData(doc.data);
				break;
			}
			
			// Save the entry, if data was changed
			if ( foundry.utils.isObjectEmpty(updateData) ) continue;
			await doc.update(updateData);
			console.log(`Migrated ${entity} entity ${doc.name} in Compendium ${pack.collection}`);
		} catch (err) {
			// Handle migration failures
			err.message = `Failed tormenta20 system migration for entity ${doc.name} in pack ${pack.collection}: ${err.message}`;
			console.error(err);
			teveErro = true;
		}
	}
	
	// Apply the original locked status for the pack
	pack.configure({ locked: wasLocked });
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
export const migrateActorData = function (actor) {
	const updateData = {};
	// Actor Data Updates
	
	if( !actor.data ) return updateData;
	if( actor.flags?.tormenta20?.version != "1.3.0.0" ) {
		_migrateActorSkills(actor, updateData);
		_migrateActorData8X(actor, updateData);
	}
	_migrateItemEffects(actor, updateData);
	updateData["flags.tormenta20.version"] = "1.3.0.0";
	// Migrate Owned Items
	if ( !actor.items ) return updateData;
	const items = actor.items.reduce((arr, i) => {
		const itemData = i instanceof CONFIG.Item.documentClass ? i.toObject() : i;
		itemData.parent = actor;
		if ( itemData.flags?.tormenta20?.version === "1.3.0.0" ) return arr;
		let itemUpdate = migrateItemData(itemData);
		removeDeprecatedData(itemData, itemUpdate);
		// Update the Owned Item
		if ( !isObjectEmpty(itemUpdate) ) {
			itemUpdate._id = itemData._id;
			arr.push(expandObject(itemUpdate));
		}
		return arr;
	}, []);
	
	if ( items.length > 0 ) updateData.items = items;
	return updateData;
};

/* -------------------------------------------- */

// TODO clean actor data

/* -------------------------------------------- */

/* -------------------------------------------- */

/**
* Migrate a single Item entity to incorporate latest data model changes
* @param item
*/
export const migrateItemData = function (item) {
	const updateData = {};
	
	if (typeof item.data.description === "string") {
		updateData["data.description.value"] = item.data.description.replace(/<p[^>]*>/g, '<p style="text-align:justify;">');
	}
	
	if (item.type == "equip") {
		updateData["type"] = "equipamento";
		// _migrateItemEquip(item, updateData);
	} else if (item.type == "arma") {
		_migrateItemWeapon(item, updateData);
	} else if (item.type == "magia") {
		_migrateItemSpell(item, updateData);
	} else if (item.type == "poder") {
		_migrateItemPower(item, updateData);
	} else if ( item.type == "classe" ) {
		_migrateClasse(item, updateData);
	} else if ( item.type == "consumivel" ) {
		_migrateItemConsumable(item, updateData);
	}
	
	if( ["consumivel","magia","poder"].includes(item.type)  ) {
		let action = {"padrao":"action", "movimento":"move", "completa":"full", "reacao":"reaction", "livre":"free"};
		let alcance = {"Nenhum": "none", "Pessoal": "self", "Toque": "touch", "Curto": "short", "Médio": "medium", "Longo": "long"};
		let duration = {instant: "inst", cena: "scene", turno: "turn", rodada: "round", sust: "sust", verTexto: "special", outra: "special" }

		updateData["data.ativacao.execucao"] = action[item.data.ativacao.execucao] ?? "";
		updateData["data.alcance"] = alcance[item.data.alcance];
		if( typeof item.data.resistencia === "string"){
			let atrRes = item.data.atrRes ? item.data.atrRes : (item.data.tipo == "Arcana" ? "int" : "sab");
			updateData["data.resistencia"] = {
				atributo: atrRes,
				bonus: item.data.cd,
				txt: item.data.resistencia
			};
		}
		updateData["data.duracao"] = {
			value: item.data.duracao.valor ?? null,
			units: duration[item.data.duracao.unidade] ?? "",
			special: ""
		}
	}
	updateData["flags.tormenta20.version"] = "1.3.0.0";
	_migrateItemEffects(item, updateData);
	return updateData;
}

/**
* Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
* Return an Object of updateData to be applied
* @param {Object} scene  The Scene data to Update
* @return {Object}       The updateData to apply
*/
export const migrateSceneData = function(scene) {
	const tokens = scene.tokens.contents.map(token => {
		const t = token.toJSON();
		try {
			const temFlag = token.actor?.getFlag("tormenta20","version") == "1.3.0.0";
			const jaMigrou = ( token.actor?.data?.data?.attributes?.defesa ) ? true : false ;
			//getFlag("tormenta20","version") == "1.3.0.0";
			if (!t.actorId || t.actorLink) {
				t.actorData = {};
			}
			else if ( !game.actors.has(t.actorId) ){
				t.actorId = null;
				t.actorData = {};
			}
			else if ( !t.actorLink ) {
				const actorData = duplicate(token.actor.data);//t.actorData);
				// deepClone(token.actor.data.toObject()); //
				actorData.type = token.actor?.type;
				const update = migrateActorData(actorData);

				if ( jaMigrou ) t.actorData = actorData;

				['items', 'effects'].forEach(embeddedName => {
					if (!update[embeddedName]?.length) return;
					const updates = new Map(update[embeddedName].map(u => [u._id, u]));
					t.actorData[embeddedName]?.forEach(original => {
						const update = updates.get(original._id);
						if (update) mergeObject(original, update);
					});
					delete update[embeddedName];
				});
				delete t.actorData.items;
				mergeObject(t.actorData, update);
			}
		} catch (err) {
			err.message = `Falha ao migrar Token ${token.name}: ${err.message}`;
			console.error(err);
		}
		return t;
	});
	return {tokens};
};

/* -------------------------------------------- */
/*  Low level migration utilities
/* -------------------------------------------- */

/**
* Migrate the actor skills string to new keys
* @private
*/
function _migrateActorSkills(actor, updateData) {
	const ad = actor.data;
	let treino;
	if( actor.type == "npc" ){
		let nivel = ad.attributes.nivel.value;
		treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
	}
	let skillsArrays = [];
	skillsArrays.push(ad.pericias);
	skillsArrays.push(ad.pericias.ofi?.mais || {} );
	skillsArrays.push(ad.periciasCustom || {} );
	let ar = ["data.pericias", "data.pericias.ofi.mais", "data.periciasCustom"];
	for (let [k, arr] of Object.entries(skillsArrays)) {
		for (let [key, pericia] of Object.entries(arr)) {
			let temp = ["true", true, "1", 1].includes(pericia.treinado) ? 1 : 0;
			//Transform Regular Skills
			if (k == 0) {
				let newkey = _DeParaSkills(key);
				updateData[`${ar[k]}.${newkey}.outros`] = pericia.outros ?? 0;
				if (key.length == 3) {
					updateData[`${ar[k]}.-=${key}`] = null;
					updateData[`${ar[k]}.${newkey}.treinado`] = temp;
				}
				if (key == "intu") {
					updateData[`${ar[k]}.${newkey}.treinado`] = temp;
				}
				if (key == "ofi0") {
					updateData[`${ar[k]}.-=${key}`] = null;
				}
				if( actor.type == "npc" ){
					let nivel = ad.attributes.nivel.value;
					let meioNivel = Math.floor(nivel/2);
					let atr = ad.atributos[pericia.atributo].mod ?? 0;
					let isTrained = 0;
					let sklValue = pericia.value;
					let sklOutros = 0;
					/* LOGS */
					const logMobs = ["Cavaleiro Supremacista", "Aparição", "Esqueleto de elite", "Finntroll Feitor"];
					const logSkls = ["lut","pon","von", "for"].includes(key);
					const loggar = (logSkls && logMobs.includes(actor.name));
					/* LOGS */
					if( ["lut","pon"].includes(key) ) {
						if( key == "lut" && ad.atributos.des.mod > ad.atributos.for.mod ) {
							atr = ad.atributos.des.mod;
							updateData[`${ar[k]}.${newkey}.atributo`] = "des";
						}
						let it = actor.items.find(i => i.type == "arma" && (i.data?.data?.pericia == key || i.data?.pericia == key) );
						if ( it ){
							const abl = ["for","des","con","int","sab","car"];
							const _atrAtq = it.data?.data?.atrAtq || it.data?.atrAtq;
							const _atqBns = it.data?.data?.atqBns || it.data?.atqBns;
							if ( abl.includes(_atrAtq) && atr !== _atrAtq ) {
								sklValue = parseInt(_atqBns) + ad.atributos[_atrAtq].mod;
							} else if (!abl.includes(_atrAtq)) {
								sklValue = parseInt(_atqBns);
							}
						}
					}

					let _sklBase = meioNivel + atr;
					let _sklTrnd = meioNivel + atr + treino;
					
					if( (Number(sklValue) == 0 && ["ini","per","for","ref","von","lut","pon"].includes(key)) || Number(sklValue) !== 0 ) {
						if ( key == "fur" ){
							let tamanho = 0;
							const size = Object.assign({}, ...Object.entries(CONFIG.T20.actorSizes).map(([a,b]) => ({ [b]: a })))[ad.tamanho];
							const sizeMod = { "min": 5, "peq": 2, "med": 0, "gra":-2, "eno":-5, "col": -10 };
							tamanho = sizeMod[size];
							if ( Number(tamanho) ) _sklBase = _sklBase + tamanho;
							if ( Number(tamanho) ) _sklTrnd = _sklTrnd + tamanho;
						}
						
						if ( sklValue == _sklBase ) {
							// NÃO É TREINADO E NÃO TEM BONUS
						} else if ( sklValue == _sklTrnd ) {
							// É TREINADO E NÃO TEM BONUS
							isTrained = 1;
						} else if ( sklValue > _sklTrnd ) {
							// É TREINADO E TEM BONUS
							isTrained = 1;
							sklOutros = ( ["lut","pon"].includes(key) ? 0 : sklValue - _sklTrnd );
						} else if ( (sklValue > _sklBase && sklValue < _sklTrnd) || (sklValue < _sklBase) ) {
							// NÃO É TREINADO E TEM BONUS
							sklOutros = ( ["lut","pon"].includes(key) ? 0 : sklValue - _sklBase );
						}
					}
					
					updateData[`${ar[k]}.${newkey}.treinado`] = isTrained;
					updateData[`${ar[k]}.${newkey}.outros`] = sklOutros;
				}
			}
			if (k == 1) {
				//Transform Craft Skills
				updateData[`data.pericias.ofi${parseInt(key) + 1}.atributo`] = pericia.atributo;
				updateData[`data.pericias.ofi${parseInt(key) + 1}.label`] = pericia.label;
				updateData[`data.pericias.ofi${parseInt(key) + 1}.treinado`] = pericia.treinado;
				updateData[`data.pericias.ofi${parseInt(key) + 1}.outros`] = pericia.outros ?? 0;
			}
			if (k == 2) {
				let newkey = _DeParaSkills(pericia.label);
				if (pericia.label == newkey) {
					//Keep Custom skill
					updateData[`${ar[k]}._pc${parseInt(key) + 1}.atributo`] = pericia.atributo ?? "for";
					updateData[`${ar[k]}._pc${parseInt(key) + 1}.label`] = pericia.label;
					updateData[`${ar[k]}._pc${parseInt(key) + 1}.treinado`] = pericia.treinado ?? 1;
					updateData[`${ar[k]}._pc${parseInt(key) + 1}.outros`] = pericia.outros ?? 0;
				} else {
					//Transform Custom skill to regular skill
					updateData[`${ar[0]}.-=${key}`] = null;
					updateData[`${ar[0]}.${newkey}.treinado`] = 1;
					updateData[`${ar[0]}.${newkey}.outros`] = pericia.outros ?? 0;
				}
			}
		}
	}
	return updateData;
}

function _migrateActorData8X(actor, updateData) {
	const ad = actor.data;
	const flags = actor.flags;
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
	updateData["data.detalhes.biography.value"] = ad.biography;
	updateData["data.tracos.idiomas"] = ad.detalhes.idiomas;
	updateData["data.tracos.profArmas"] = ad.detalhes.profArmas;
	const profArmad8x = {"leve": "lev", "pesada": "pes", "escudo": "esc"};
	let profArmaduras = ad.detalhes.profArmaduras;
	if ( profArmaduras?.value ) profArmaduras.value = profArmaduras.value.map(p => profArmad8x[p]);
	updateData["data.tracos.profArmaduras"] = profArmaduras;
	updateData["data.attributes.conjuracao"] = ad.atributoChave;
	updateData["data.tracos.resistencias.dano.value"] = Number(ad.rd?.base || 0) + Number(ad.rd?.temp || 0);

	if( actor.type == "npc" ){
		// const crType = {"humanoide": "hum","monstro": "mon","animal": "ani","construto": "con","espirito": "esp","mortovivo": "mor","morto-vivo": "mor"};
		// updateData["data.detalhes.tipo"] = crType[type] || "hum";
		let type = ad.attributes.raca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
		if ( type.match(/monstro/) ) updateData["data.detalhes.tipo"] = "mon";
		else if ( type.match(/animal/) ) updateData["data.detalhes.tipo"] = "ani";
		else if ( type.match(/construto/) ) updateData["data.detalhes.tipo"] = "con";
		else if ( type.match(/espirito/) ) updateData["data.detalhes.tipo"] = "esp";
		else if ( type.match(/morto/) ) updateData["data.detalhes.tipo"] = "mor";
		else updateData["data.detalhes.tipo"] = "hum";

		updateData["data.detalhes.nd"] =  ad.attributes.nd;
		updateData["data.tracos.resistencias.dano.value"] = Number(ad.rd?.value || 0);
		let defesa = ad.defesa?.value - ad.atributos.des.mod - 10;
		updateData["data.attributes.defesa.outros"] = defesa;
		updateData["data.detalhes.equipamento"] = ad.equipament;
		updateData["data.detalhes.resistencias"] = ad.resistencias;
		updateData["data.detalhes.tesouro"] = ad.treasure;
	} else {
		// updateData["data.attributes.defesa.value"] = ad.defesa.value;
		updateData["data.attributes.defesa.outros"] = Number(ad.defesa.outro) + Number(ad.defesa.temp);
		updateData["data.attributes.defesa.bonus"] = ad.defesa.bonus ?? 0;
		updateData["data.attributes.defesa.condi"] = ad.defesa.condi ?? 0;
		updateData["data.attributes.defesa.pda"] = ad.defesa.pda;
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

	return updateData;
}

function _DeParaTipoArma(key) {
	key = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	let armaTipo = {simples:"sim",marcial:"mar",exotica:"exo","arma de fogo":"fog",armadefogo:"fog",natural:"nat",improvisada:"imp"};
	return armaTipo[key] || "sim";
}

/* -------------------------------------------- */

function _DeParaSkills(key) {
	let newkey = key;
	switch (key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
		case "acr":
		case "acrobacia":
		newkey = "acro";
		break;
		case "ade":
		case "adestramento":
		newkey = "ades";
		break;
		case "atl":
		case "atletismo":
		newkey = "atle";
		break;
		case "atu":
		case "atuacao":
		newkey = "atua";
		break;
		case "cav":
		case "cavalgar":
		newkey = "cava";
		break;
		case "con":
		case "conhecimento":
		newkey = "conh";
		break;
		case "cur":
		case "cura":
		newkey = "cura";
		break;
		case "dip":
		case "diplomacia":
		newkey = "dipl";
		break;
		case "eng":
		case "enganacao":
		newkey = "enga";
		break;
		case "for":
		case "fortitude":
		newkey = "fort";
		break;
		case "fur":
		case "furtividade":
		newkey = "furt";
		break;
		case "gue":
		case "guerra":
		newkey = "guer";
		break;
		case "ini":
		case "iniciativa":
		newkey = "inic";
		break;
		case "int":
		case "intimidacao":
		newkey = "inti";
		break;
		case "intu":
		case "intuicao":
		newkey = "intu";
		break;
		case "inv":
		case "investigacao":
		newkey = "inve";
		break;
		case "jog":
		case "jogatina":
		newkey = "joga";
		break;
		case "lad":
		case "ladinagem":
		newkey = "ladi";
		break;
		case "lut":
		case "luta":
		newkey = "luta";
		break;
		case "mis":
		case "misticismo":
		newkey = "mist";
		break;
		case "nob":
		case "nobreza":
		newkey = "nobr";
		break;
		case "ofi":
		case "oficio":
		case "oficios":
		newkey = "ofi0";
		break;
		case "per":
		case "percepcao":
		newkey = "perc";
		break;
		case "pil":
		case "pilotagem":
		newkey = "pilo";
		break;
		case "pon":
		case "pontaria":
		newkey = "pont";
		break;
		case "ref":
		case "reflexos":
		newkey = "refl";
		break;
		case "rel":
		case "religiao":
		newkey = "reli";
		break;
		case "sob":
		case "sobrevivencia":
		newkey = "sobr";
		break;
		case "von":
		case "vontade":
		newkey = "vont";
		break;
	}
	return newkey;
}

/* -------------------------------------------- */

function _DeParaDamageType(value) {
	if (value !== "") {
		try {
			return Object.keys(CONFIG.T20.damageTypes).find((k) => CONFIG.T20.damageTypes[k] === value);
		} catch (err) {
			return "";
		}
	} else {
		return "";
	}
}

/* -------------------------------------------- */

function _DeParaAtributeType(value, adic) {
	if (value !== "" && value !== "0") {
		try {
			if (typeof CONFIG.T20.atributosAbr[value] !== "undefined") {
				return adic + value;
			} else {
				return "";
			}
		} catch (err) {
			return "";
		}
	} else {
		return "";
	}
}

/* -------------------------------------------- */

function _migrateClasse(item, updateData) {
	if (item.type !== "classe") return;
	if( item.parent ){
		let classe = item.parent.items.find(i => i.type == "classe" );
		if( item._id == classe.id ) {
			updateData["data.inicial"] = true;
		}
	}
	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate spell data.
 * @private
 */
function _migrateItemSpell(item, updateData) {
	if (item.type != "magia") return;
	const type = {divina: "div",arcana: "arc",universal: "uni"};
	const schools = {abjuracao:"abj",advinhacao:"adv",conjuracao:"con",encantamento:"enc",evocacao:"evo",ilusao:"ilu",necromancia:"nec",transmutacao:"tra"};
	let tipo = item.data.tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	let escola = item.data.escola.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	updateData["data.tipo"] = type[tipo];
	updateData["data.escola"] = schools[escola];
	if ( item.data.efeito ){
		let rolls = [];
		rolls.push({
			type: "dano",
			key: "dano0",
			name: "Dano",
			parts: [[ item.data.efeito , ""]]
		});
		updateData["data.rolls"] = rolls;
	}
	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate power data.
 * @private
 */
function _migrateItemPower(item, updateData) {
	if (item.type != "poder") return;
	if ( item.data.roll ){
		let rolls = [];
		rolls.push({
			type: "dano",
			key: "dano0",
			name: "Dano",
			parts: [[ item.data.roll , ""]]
		});
		updateData["data.rolls"] = rolls;
	}
	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate consumable data.
 * @private
 */
 function _migrateItemConsumable(item, updateData) {
	if (item.type != "consumivel") return;
	if ( item.data.efeito ){
		let rolls = [];
		rolls.push({
			type: "dano",
			key: "dano0",
			name: "Dano",
			parts: [[ item.data.efeito , ""]]
		});
		updateData["data.rolls"] = rolls;
	}

	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate wearables data.
 * @private
 */
function _migrateItemEquip(item, updateData) {
	if (item.type != "armadura") return;
	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate weapon data.
 * @private
 */
function _migrateItemWeapon(item, updateData) {
	if (item.type != "arma") return;
	let rollsArray = [];
	let rollAtaque = {};
	let rollDano = {};
	if (item.data.custo > 0) {
		updateData["data.ativacao.custo"] = item.data.custo;
	} else {
		updateData["data.ativacao.custo"] = null;
	}
	const wpProps = {adaptavel:"ada",agil:"agi",alongada:"alo",arremesso:"arr",ataqueDistancia:"dst",duasMaos:"dms",dupla:"dup",leve:"lev",municao:"mun",versatil:"ver"};
	const props = {};
	for ( let [key, value] of Object.entries(item.data.propriedades) ) {
		let chav = wpProps[key];
		props[chav] = value;
	}
	updateData["data.propriedades"] = props;
	
	updateData["data.tipoUso"] = _DeParaTipoArma(item.data.tipoUso);
	
	rollAtaque["key"] = "ataque0";
	rollAtaque["name"] = "Ataque";
	rollAtaque["type"] = "ataque";
	rollAtaque["parts"] = [];
	rollAtaque["parts"].push(["1d20", ""]);
	let atrAtq = "";
	
	if ( item.parent && item.parent.type == "character" ) {
		let atbSkill = item.parent.data.pericias[item.data.pericia].atributo;
		item.data.atrAtq = item.data.atrAtq == "0"? "" : item.data.atrAtq;
		atrAtq = atbSkill == item.data.atrAtq ? "" : item.data.atrAtq;
	}
	rollAtaque["parts"].push([
		_DeParaSkills(item.data.pericia),
		_DeParaAtributeType(atrAtq, ""),
	]);
	let ataqueBonus = "";
	if ( item.parent && item.parent.type == "npc" ) {
		let ad = item.parent.data;
		let nivel = ad.attributes.nivel.value;
		let treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		let atrAtq = item.data.atrAtq;
		let atr = Math.max( ad.atributos.for.mod, ad.atributos.des.mod );
		if ( item.data.pericia == "pon" ) atr = ad.atributos.des.mod;
		let tempskl = Number(item.data.atqBns)
		if ( tempskl > 0 ) tempskl = tempskl - Math.floor(nivel/2);
		if ( tempskl > 0 && (tempskl - atr >= 0) && atrAtq == "0" ) tempskl = tempskl - atr;
		if ( tempskl > 0 && (tempskl - treino >= 0) ) tempskl = tempskl - treino;
		ataqueBonus = tempskl;
	} else {
		ataqueBonus = item.data.atqBns;
	}
	rollAtaque["parts"].push([ataqueBonus, ""]);
	rollsArray.push(rollAtaque);
	
	rollDano["key"] = "dano0";
	rollDano["name"] = "Dano";
	rollDano["type"] = "dano";
	rollDano["parts"] = [];
	rollDano["parts"].push([
		item.data.dano,
		_DeParaDamageType(item.data.tipo),
	]);
	if( ["for","des","con","int","sab","car"].includes(item.data.atrDan) ) {
		rollDano["parts"].push([_DeParaAtributeType(item.data.atrDan, "@"), ""]);
	} else if( item.data.pericia == "lut" ) {
		rollDano["parts"].push(["@for", ""]);
	} else rollDano["parts"].push(["", ""]);

	if ( item.parent && item.parent.type == "npc" ) {
		let ad = item.parent.data;
		let atrDan = item.data.atrDan;
		let atr = Math.max( ad.atributos.for.mod, ad.atributos.des.mod );
		let danoFrml = game.tormenta20.dice.simplifyRollFormula(item.data.danoBns, {});
		let temp = new Roll( danoFrml );
		
		let dmgNum = temp.terms.find(t => t instanceof NumericTerm  );
		dmgNum = dmgNum ? dmgNum.number : 0;
		let dmgDies = temp.terms.reduce((ac, t) => {
			if (t instanceof DiceTerm) ac.push([t.expression,t.flavor.toLowerCase()]);
			return ac;
		}, []);
		if( !["for","des","con","int","sab","car"].includes(atrDan) ) {
			if( dmgNum > 0 && (dmgNum - atr >= 0) ) dmgNum = dmgNum - atr;
		}
		if ( dmgNum ) {
			rollDano["parts"].push([
				dmgNum,
				_DeParaDamageType(item.data.tipo),
			]);
		}
		
		if (dmgDies){
			for ( let die of dmgDies ) {
				rollDano["parts"].push(die);
			}
		}
	} else {
		if ( item.data.danoBns && item.data.danoBns != "0" ) {
			rollDano["parts"].push([
				item.data.danoBns,
				_DeParaDamageType(item.data.tipo),
			]);
		}
	}
	rollsArray.push(rollDano);
	updateData["data.rolls"] = rollsArray;
	return updateData;
}

/* -------------------------------------------- */

/**
 * Migrate ActiveEffects data to new flags and keys
 * @private
 */
 async function _migrateItemEffects(owner, updateData) {
	let effects = foundry.utils.deepClone(owner.effects);
	let newEffects = [];
	for ( let effect of effects ){
		if ( effect.data ) {
			effect = effect.data.toObject();
		}
		let flagT20 = effect.flags.t20 || {};
		effect.flags["tormenta20"] = flagT20;
		effect.flags["t20"] = null;
		
		for ( let e of effect.changes ) {
			if( e.key.match(/data.defesa/) ){
				e.key = e.key.replace(/data.defesa/, "data.attributes.defesa");
				e.key = e.key.replace(/defesa.outros/, "defesa.bonus");
				e.key = e.key.replace(/defesa.outro/, "defesa.bonus");
				e.key = e.key.replace(/defesa.temp/, "defesa.bonus");
			} else {
				e.key = e.key.replace(/.temp/, ".bonus");
			}
			if( ["poder","magia","consumivel"].includes(owner.type) && e.key=="roll" ){
				e.key = "dano";
			}
			e.key = e.key.replace(/data.tamanho/, "data.tracos.tamanho");
			e.key = e.key.replace(/.pericias.acr/, ".pericias.acro");
			e.key = e.key.replace(/.pericias.ade/, ".pericias.ades");
			e.key = e.key.replace(/.pericias.atl/, ".pericias.atle");
			e.key = e.key.replace(/.pericias.atu/, ".pericias.atua");
			e.key = e.key.replace(/.pericias.cav/, ".pericias.cava");
			e.key = e.key.replace(/.pericias.con/, ".pericias.conh");
			e.key = e.key.replace(/.pericias.cur/, ".pericias.cura");
			e.key = e.key.replace(/.pericias.def/, ".pericias.defe");
			e.key = e.key.replace(/.pericias.dip/, ".pericias.dipl");
			e.key = e.key.replace(/.pericias.eng/, ".pericias.enga");
			e.key = e.key.replace(/.pericias.for/, ".pericias.fort");
			e.key = e.key.replace(/.pericias.fur/, ".pericias.furt");
			e.key = e.key.replace(/.pericias.gue/, ".pericias.guer");
			e.key = e.key.replace(/.pericias.ini/, ".pericias.inic");
			e.key = e.key.replace(/.pericias.int./, ".pericias.inti");
			e.key = e.key.replace(/.pericias.inv/, ".pericias.inve");
			e.key = e.key.replace(/.pericias.jog/, ".pericias.joga");
			e.key = e.key.replace(/.pericias.lad/, ".pericias.ladi");
			e.key = e.key.replace(/.pericias.lut/, ".pericias.luta");
			e.key = e.key.replace(/.pericias.mis/, ".pericias.mist");
			e.key = e.key.replace(/.pericias.ocu/, ".pericias.ocul");
			e.key = e.key.replace(/.pericias.nob/, ".pericias.nobr");
			e.key = e.key.replace(/.pericias.ofi/, ".pericias.ofic");
			e.key = e.key.replace(/.pericias.per/, ".pericias.perc");
			e.key = e.key.replace(/.pericias.pil/, ".pericias.pilo");
			e.key = e.key.replace(/.pericias.pon/, ".pericias.pont");
			e.key = e.key.replace(/.pericias.ref/, ".pericias.refl");
			e.key = e.key.replace(/.pericias.rel/, ".pericias.reli");
			e.key = e.key.replace(/.pericias.sob/, ".pericias.sobr");
			e.key = e.key.replace(/.pericias.von/, ".pericias.vont");
	
			e.key = e.key.replace(/flags.pvBonus/, "flags.tormenta20.lvlconfig.pvBonus");
			e.key = e.key.replace(/flags.pmBonus/, "flags.tormenta20.lvlconfig.pmBonus");

			e.value = e.value.replace(/@@atibutoChave/, "@atibutoChave");
		}
		newEffects.push(effect);
	}
	updateData["effects"] = newEffects;
	return updateData;
}

/* -------------------------------------------- */

/**
 * Remove deprecated data.
 * @param {object} object The data to clean
 * @private
 */
export function removeDeprecatedData(object, updateData) {
	updateData["flags.-=t20"] = null;
	if( object.type == "character" || object.type == "npc" ){
		const ad = object.data;
		const oldSkills = ["acr","ade","atl","atu","cav","con","cur","dip","eng","for","fur","gue","ini","int","inv","jog","lad","lut","mis","nob","ofi","per","pil","pon","ref","rel","sob","von"];
		for ( let skl of oldSkills){
			updateData[`data.pericias.-=${skl}`] = null;
		}
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
		updateData["data.detalhes.-=idiomas"] = null;
		updateData["data.detalhes.-=profArmas"] = null;
		updateData["data.detalhes.-=profArmaduras"] = null;
		updateData["data.detalhes.-=profArmaduras"] = null;
		updateData["data.-=atributoChave"] = null;
		updateData["data.-=defesa"] = null;
		updateData["data.-=periciasCustom"] = null;
		updateData["data.-=rd"] = null;
		updateData["data.attributes.-=hp"] = null;
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
	}
	else if( object.type == "arma" ){
		updateData["data.-=pericia"] = null;
		updateData["data.-=atrAtq"] = null;
		updateData["data.-=atqBns"] = null;
		updateData["data.-=dano"] = null;
		updateData["data.-=tipo"] = null;
		updateData["data.-=atrDan"] = null;
	}
	else if( object.type == "magia" || object.type == "poder" || object.type == "consumivel" ){
		updateData["data.-=aprimoramentos"] = null;
		updateData["data.-=roll"] = null;
		updateData["data.-=efeito"] = null;
	}
	return updateData;
}