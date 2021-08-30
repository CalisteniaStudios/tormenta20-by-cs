import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import { T20 } from '../config.js';
// import SelectItemsPrompt from "../apps/select-items-prompt.js";
import { T20Conditions } from "../conditions/conditions.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import ItemT20 from "../item/entity.js";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {

	/* -------------------------------------------- */
	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get aprimoramentosTypes() {
		const tipos = ["arma", "atributo", "consumivel", "magia", "pericia", "poder"];
		const types = Object.fromEntries(game.system.entityTypes.Item.map(t => [t, []]));
		for (let i of this.effects.values()) {
			if (!i.getFlag("tormenta20", "onuse")) continue;
			for (let j of tipos) {
				if (i.getFlag("tormenta20", j)) types[i.data.type].push(i);
			}

		}
		return types;
	}

	/* -------------------------------------------- */
  /*  Methods                                     */
  /* -------------------------------------------- */

	/** @override */
	prepareData() {
		super.prepareData();
		// this.data.reset();
		// this.prepareBaseData();
		// this.prepareDerivedData();
		// super.prepareEmbeddedEntities();
		
		// Iterate over owned items and recompute attributes that depend on prepared actor data
		this.items.forEach(item => item.prepareFinalAttributes());
	}

	/* -------------------------------------------- */

	/** @override */
	prepareBaseData() {
		const version = game.settings.get("tormenta20","systemMigrationVersion");
		if( version < "1.3.0.0" ) return;
		switch (this.data.type) {
			case "character":
				return this._prepareCharacterData(this.data);
			case "npc":
				return this._prepareNPCData(this.data);
		}
	}

	/* -------------------------------------------- */

	/** @override */
	prepareDerivedData() {
		const version = game.settings.get("tormenta20","systemMigrationVersion");
		if( version < "1.3.0.0" ) return;
		// if( this.getFlag("tormenta20","version") !== "1.3.0.0" ) return;
		const actor = this;
		const actorData = actor.data;
		const data = actorData.data;
		const nivel = data.attributes.nivel.value;
		// Base CD
		data.attributes.cd = 10 + Math.floor(nivel / 2);
		// Loop through ability scores, and add their modifiers to our sheet output.
		for (let [key, ability] of Object.entries(data.atributos)) {
			// Calculate the modifier using d20 rules.
			ability.name = CONFIG.T20.atributos[key];
			ability.mod = Math.floor((ability.value + Number(ability.bonus || 0) - 10) / 2);
		}

		this._prepareDefense(actorData);

		// Prepare skill bonus
		const rollData = this.getRollData();
		for (let [key, pericia] of Object.entries(data.pericias)) {
			pericia.treino = !pericia.treinado ? 0 : data.attributes.treino;
			this._prepareSkills(key, pericia, data, rollData);
		}
		// Inventory encumbrance
		data.attributes.carga = this._computeEncumbrance(actorData);
	}

	/* -------------------------------------------- */

	/**
	 * Return the amount of experience required to gain a certain character level.
	 * @param level {Number}	The desired level
	 * @return {Number}			 The XP required
	 */
	getLevelExp(nivel) {
		const niveis = T20.xpPorNivel;
		return niveis[Math.min(nivel, niveis.length - 1)];
	}
	/**/

	/* -------------------------------------------- */

	/**
	* Return the amount of experience granted by killing a creature of a certain CR.
	* @param cr {Number}		 The creature's challenge rating
	* @return {Number}			 The amount of experience granted per kill
	*/
	/*/ TODO IMPLEMENT CONFIG T20
	getNDExp(cr) {
		if (cr < 1.0) return Math.max(200 * cr, 10);
		return CONFIG.T20.CR_EXP_LEVELS[cr];
	}
	/**/

	/* -------------------------------------------- */

	/** @inheritdoc */
	getRollData() {
		const data = foundry.utils.deepClone(super.getRollData());
		// super.getRollData();
		for (let abl in data.atributos) {
			data[abl] = data.atributos[abl].mod
		}

		const classes = this.items.reduce(function (cn, it) {
			if (it.type === "classe") cn[it.name.slugify()] = it.data.data.niveis;
			return cn;
		}, {});

		const poderesTormenta = this.items.filter( p => p.type == "poder" &&
			( (p.data.data.tipo == "geral" && p.data.data.subtipo == "Tormenta") || ["Deformidade", "Linhagem Rubra Aprimorada", "Linhagem Rubra Superior"].includes(p.name) ) );
		if( poderesTormenta.length ){
			data["tormenta"] = (poderesTormenta.length-1);
			data["tormenta2"] = (1 + Math.floor( (poderesTormenta.length-1) / 2 ))
			//Math.max( 1, Math.floor( (poderesTormenta.length) / 2 ) );
			data["tormenta4"] = (1 + Math.floor( (poderesTormenta.length-1) / 4 ))
			//Math.max( 1, Math.floor( (poderesTormenta.length) / 4 ) );
		} else {
			data["tormenta"] = 1;
			data["tormenta2"] = 1;
			data["tormenta4"] = 1;
		}

		data["nivel"] = this.data.data.attributes.nivel.value;
		data["meionivel"] = Math.floor(this.data.data.attributes.nivel.value / 2);
		data["nvl"] = classes;
		let atbchave = this.data.data.attributes.conjuracao;
		data["atributoChave"] = this.data.data.atributos[atbchave].mod;
		return data;
	}

	/* -------------------------------------------- */

	/**
	* Add a list of itens to the actor
	* TODO prompt?
	* @param {Array.<ItemT20>} itens - The itens being added to the Actor;
	* @returns {Promise<ItemT20[]>}
	**/
	async addEmbeddedItems(items) {
		let itemsToAdd = items;
		if (itemsToAdd.length === 0) return;
		// create the selected items with this actor as parent

		return ItemT20.createDocuments(itemsToAdd.map(i => i.toJSON()), { parent: this });
	}

	/* -------------------------------------------- */


	/* -------------------------------------------- */
	/*	Data Preparation Helpers					*/
	/* -------------------------------------------- */

	/**
	* Prepare Character type specific data
	*/
	_prepareCharacterData(actorData) {
		const data = actorData.data;
		const flags = actorData.flags;
		const classes = [];
		
		let sheetFlags = {};
		if ( this.getFlag("tormenta20", "sheet.editarPericias") === undefined ) sheetFlags.editarPericias = true;
		if ( this.getFlag("tormenta20", "sheet.botaoEditarItens") === undefined ) sheetFlags.botaoEditarItens = true;
		let baseFlags = { tormenta20: { sheet: sheetFlags } };
		if( !isObjectEmpty(sheetFlags) ) mergeObject( flags, baseFlags );

		const nivel = this.items.reduce((arr, item) => {
			if (item.type === "classe") {
				const classLevels = parseInt(item.data.data.niveis) || 1;
				arr += classLevels;
				classes.push(item.name + " " + item.data.data.niveis);
			}
			return arr;
		}, 0);
		data.attributes.defesa.condi = 0;
		data.attributes.nivel.value = nivel;
		data.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		// Experience required for next level
		const xp = data.attributes.nivel.xp;
		xp.proximo = this.getLevelExp(nivel || 1);
		const anterior = this.getLevelExp(nivel - 1 || 0);
		const necessario = xp.proximo - anterior;
		const pct = Math.round((xp.value - anterior) * 100 / necessario);
		xp.pct = Math.clamped(pct, 0, 100);
	}

	/* -------------------------------------------- */

	/**
	* Prepare NPC type specific data
	*/
	_prepareNPCData(actorData) {
		const data = actorData.data;
		const nivel = data.attributes.nivel.value;
		data.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		// Experience Reward
		let nd = data.detalhes.nd;
		data.attributes.defesa.condi = 0;
		data.attributes.nivel.xp.value = Number(nd) * 1000 || (["1/2", "1/3", "1/4", "1/6", "1/8"].includes(nd) ? 1000 * eval(nd).toFixed(3) : 0);

	}

	/* -------------------------------------------- */

	/**
	 * Prepare skill checks.
	 * @param actorData
	 * @private
	 */
	 _prepareDefense(actorData){
		const data = actorData.data;
		const rollData = this.getRollData();
		
		if (data.attributes.defesa == undefined) data.attributes.defesa = {}
		let def = data.attributes.defesa;
		if ( !def.value ) data.attributes.defesa.value = 0;
		if ( !def.pda ) data.attributes.defesa.pda = 0;
		if ( !Number(def.condi) ) data.attributes.defesa.condi = 0;

		let parts = ["10"];
		let pda = 0;
		let atributo = data.attributes.defesa.atributo;
		let mod = data.atributos[atributo]?.mod || 0;
		let maxAbl = false;
		
		// Defense Calculation
		for (let item of actorData.items ) {
			if (item.type == "equipamento" && item.data.data.equipado) {
				let tipo = item.data.data.tipo;
				let def = Number(item.data.data.armadura.value);
				let penalidade = item.data.data.armadura.penalidade;
				let maxAtr = item.data.data.armadura.maxAtr
				if (tipo == "leve" || tipo == "pesada") {
					// armadura = tipo;
					if(Number(data.attributes.defesa.armadura)){
						def += Number(data.attributes.defesa.armadura);
					}
					if ( tipo == "pesada" ) maxAbl = Number(maxAtr) || 0;
					parts.push( def );
				} else if (tipo == "escudo") {
					// escudo = true;
					if(Number(data.attributes.defesa.escudo)){
						def += Number(data.attributes.defesa.escudo);
					}
					parts.push( def );
				} else {
					// data.attributes.defesa.bonus += def;
					parts.push( def );
				}
				pda += Math.abs(penalidade);
			}
		}
		//DEF = 10, armadura, escudo, "@atributo", outros, bonus, condi; 
		parts.push( maxAbl === false ? mod : Math.min( mod , maxAbl ) );
		parts.push(data.attributes.defesa.bonus || 0);
		parts.push(data.attributes.defesa.outros || 0);
		parts.push(data.attributes.defesa.condi);
		const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		data.attributes.defesa.value = parseInt(result);
		data.attributes.defesa.pda += -pda;
	}

	/* -------------------------------------------- */

	/**
	 * Prepare skill checks.
	 * @param actorData
	 * @private
	 */
	_prepareSkills(key, pericia, data, rollData, roll = false) {
		const pda = data.attributes.defesa.pda ? -Math.abs(data.attributes.defesa.pda) : 0;
		pericia.label =  pericia.label || CONFIG.T20.pericias[key];
		pericia.custom = false;
		if ( !Number(pericia.condi) ) pericia.condi = 0;
		if (!key.match(/ofi[1-9]|_pc[1-9]/)) {
			pericia.pda = ["acro", "furt", "ladi"].includes(key);
			pericia.st = ["ades", "conh", "guer", "joga", "ladi", "mist", "ocul", "nobr", "pilo", "reli"].includes(key);
		} else {
			pericia.custom = true;
			pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
			pericia.st = pericia.label.match(/\*/g) ? true : false;
			pericia.pda = pericia.label.match(/\+/g) ? true : false;
		}
		

		var atributo = pericia.atributo || "for";
		pericia.mod = data.atributos[atributo].mod;
		pericia.outros = pericia.outros;//Number(pericia.outros) || 0;
		pericia.bonus = pericia.bonus || 0;//Number(pericia.bonus) || 0;

		const parts = [];
		parts.push("@meionivel", pericia.treino, `@${pericia.atributo}`, (pericia.pda ? pda : 0), pericia.outros, pericia.bonus);

		// GET GLOBAL ACTOR MODIFIERS
		const bonuses = getProperty(this.data.data, "modificadores.pericias") || {};
		if (bonuses.geral) parts.push(bonuses.geral);
		if (!["luta", "pont"].includes(key) && bonuses.semataque) parts.push(bonuses.semataque);
		if (["luta", "pont"].includes(key) && bonuses.ataque) parts.push(bonuses.ataque);
		if (["fort", "refl", "vont"].includes(key) && bonuses.resistencia) parts.push(bonuses.resistencia);
		if (bonuses.atr && bonuses.atr[pericia.atributo]) parts.push(bonuses.atr[pericia.atributo]);
		if (pericia.condi) parts.push(pericia.condi);
		if ( key == "furt" ) {
			let tamanho = 0;
			const size = this.data.data.tracos.tamanho;
			const sizeMod = { "min": 5, "peq": 2, "med": 0, "gra":-2, "eno":-5, "col": -10 };
			tamanho = sizeMod[size];
			if( Number(tamanho) ) parts.push(tamanho);
		}
		if ( !roll ) {
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			pericia.value = parseInt(result.replace(" ","")) || 0;
		} else {
			let dice = pericia.parts ? pericia.parts[0] : "1d20";
			return [dice].concat(parts);
		}

	}

	/* -------------------------------------------- */

	_calcPVPM() {
		const updateData = {};
		const nivel = Number( this.data.data.attributes.nivel.value );
		const con = this.data.data.atributos.con.mod;
		const soma = {pv:0,pm:0};
		let lvlc = this.getFlag("tormenta20", "lvlconfig");
		if ( !lvlc ){
			lvlc = {
				pv: { for: false, des: false, int: false, sab: false, car: false },
				pm: { for: false, des: false, con: false, int: false, sab: false, car: false },
				pvBonus: ["0","0"],
				pmBonus: ["0","0"]
			}
			this.setFlag("tormenta20", "lvlconfig", lvlc);
		}
		
		for ( let classe of this.itemTypes.classe ) {
			let c = classe.data.data;
			let iniPV = c.inicial? c.pvPorNivel * 3 : 0;
			soma.pv += Number(iniPV) + (Number(c.niveis) * ( Number(c.pvPorNivel) + con ));
			soma.pm += c.niveis * c.pmPorNivel;
		}
		if( lvlc.pvBonus[0] ) soma.pv += Number(lvlc.pvBonus[0]);
		if( lvlc.pvBonus[1] ) soma.pv += Math.floor(Number(lvlc.pvBonus[1].replace(",",".")) * nivel);
		if( lvlc.pmBonus[0] ) soma.pm += Number(lvlc.pmBonus[0]);
		if( lvlc.pmBonus[1] ) soma.pm += Math.floor(Number(lvlc.pmBonus[1].replace(",",".")) * nivel);
		for (let [atr, value] of Object.entries(lvlc.pv)){
			if(value) soma.pv += Number(this.data.data.atributos[atr].mod);
		}
		for (let [atr, value] of Object.entries(lvlc.pm)){
			if(value) soma.pm += Number(this.data.data.atributos[atr].mod);
		}
		updateData["data.attributes.pv.max"] = soma.pv;
		updateData["data.attributes.pm.max"] = soma.pm;
		this.update(updateData);
	}

	/* -------------------------------------------- */

	/**
	* Compute the level and percentage of encumbrance for an Actor.
	* @param {Object} actorData			The data object for the Actor being rendered
	* @returns {{max: number, value: number, pct: number}}	An object describing the character's encumbrance level
	* @private
	*/
	/**/
	_computeEncumbrance(actorData) {
		// Get the total weight from items
		const physicalItems = ["arma", "equipamento", "consumivel", "tesouro"];
		let weight = actorData.items.reduce((weight, i) => {
			if ( !physicalItems.includes(i.type) ) return weight;
			const q = i.data.data.qtd || 0;
			const w = i.data.data.peso || 0;
			return weight + (q * w);
		}, 0);
		// Compute Encumbrance percentage
		weight = weight.toNearest(0.1);
		const max = actorData.data.atributos.for.value * 10;
		const emc = actorData.data.atributos.for.value * 3;
		const pct = Math.clamped((weight * 100) / max, 0, 100);
		return { value: weight, max, pct, encumbered: weight > emc };
	}
	/**/


	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);

		// SkillSet
		const system = "tormenta20";
		// const system = "skyfall";
		switch (system) {
			case "skyfall":
				const skills = mergeObject(this.data.data.pericias,
					{
						defe: { value: 0, atributo: "des" },
						ocul: { value: 0, atributo: "int" },
					});
				delete skills.mist;
				this.update({ "data.pericias": skills });
				break;
			default:
				// NO CHANGES;
				break;
		}
		
		// Token size category
		const size = CONFIG.T20.tokenSizes[this.data.data.tracos.tamanho || "med"];
		this.data.token.update({ width: size, height: size });

		// Player character prototype token
		if (this.type === "character") {
			this.data.token.update({ vision: true, actorLink: true, disposition: 1 });
		}
		
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);

		// Apply changes in Actor size to Token width/height
		const newSize = foundry.utils.getProperty(changed, "data.tracos.tamanho");
		if (newSize && (newSize !== foundry.utils.getProperty(this.data, "data.tracos.tamanho"))) {
			let size = CONFIG.T20.tokenSizes[newSize];
			if (!foundry.utils.hasProperty(changed, "token.width")) {
				changed.token = changed.token || {};
				changed.token.height = size;
				changed.token.width = size;
			}
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateEmbeddedDocuments(embeddedName, result, options, userId){
		
		// Show chat message if condition;
		if(embeddedName == "ActiveEffect"){
			const showCard = game.settings.get("tormenta20", "showStatusCards");
			const effect = result.find(doc => doc.flags?.core?.statusId );
			if(showCard && effect){
				this._statusToChat(effect);
			}
		}

		await super._preCreateEmbeddedDocuments(embeddedName, result, options, userId);
	}

	/* -------------------------------------------- */

	async _statusToChat(effect){
		let conds = game.packs.get("tormenta20.condicoes");
		await conds.getDocuments();
		let condJ = conds.getName(effect.label);
		if( condJ ){
			let description = `${condJ.data.content}` || "";
			let msg = `<h2><img src="${effect.icon}" alt="${effect.label}" width="36" height="36" style="flex:0">${effect.label}</h2>${description}`
			ChatMessage.create({content:msg});
		}
	}

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if (attribute === "attributes.pv" || attribute === "attributes.pm") {
			const hp = getProperty(this.data.data, attribute);
			const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
			if( attribute === "attributes.pm" ){
				return this.spendMana(delta);
			} else return this.applyDamage(delta);
		}
		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	}

	/* -------------------------------------------- */

	/**
	 * Apply a certain amount of damage or healing to the health pool for Actor
	 * @param {number} amount			 An amount of damage (positive) or healing (negative) to sustain
	 * @param {number} multiplier	 A multiplier which allows for resistance, vulnerability, or healing
	 * @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	 */
	async applyDamage(amount = 0, multiplier = 1, applyRD = false) {
		amount = Math.floor(parseInt(amount) * multiplier);
		const pv = this.data.data.attributes.pv;
		const originalDGM = amount;
		// Prepare Damage Reduction if damage
		const rd = applyRD ? this.data.data.tracos?.resistencias?.dano?.value || 0 : 0;
		amount = amount > 0 ? Math.max(amount - rd, 0) : amount;

		// Deduct damage from temp HP first
		const tmp = parseInt(pv.temp) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;

		// Remaining goes to health
		const dh = Math.clamped(pv.value - (amount - dt), pv.min, pv.max);

		// Update the Actor
		const updates = {
			"data.attributes.pv.temp": tmp - dt,
			"data.attributes.pv.value": dh
		};

		// Delegate damage application to a hook
		// TODO replace this in the future with a better modifyTokenAttribute function in the core
		const allowed = Hooks.call("modifyTokenAttribute", {
			attribute: "attributes.pv",
			value: amount,
			isDelta: false,
			isBar: true,
			xablau: "xablau",
		}, updates);

		if ( true ){
			let chatMessage = "";
			let toChat = (speaker, message) => {
				let chatData = {
					user: game.user.id,
					content: message,
					speaker: ChatMessage.getSpeaker(speaker),
					type: CONST.CHAT_MESSAGE_TYPES.OTHER,
				};
				
				ChatMessage.create(chatData, {});
			};
			let _fas = "";
			if( amount < 0 ) _fas = "plus";
			else _fas = "minus";
			
			if ( rd > 0 && amount >= 0 ) chatMessage += `${originalDGM} - ${rd}RD >> ${amount}<br>`;
			if ( dt > 0 ) chatMessage += `<i class="fas fa-user-${_fas}"></i> -${dt} PVs temp ( ${tmp}PVT >> ${tmp - dt} PVT )<br>`;
			if ( amount < 0 ) chatMessage += `<i class="fas fa-user-${_fas}"></i> ${amount*-1} PVs ( ${pv.value}PV >> ${dh} PV )`;
			else if ( amount - dt > 0 ) chatMessage += `<i class="fas fa-user-${_fas}"></i> -${amount - dt} PVs ( ${pv.value}PV >> ${dh} PV )`;
			// toChat(this, chatMessage);
		}
		return allowed !== false ? this.update(updates) : this;

	}

	/* -------------------------------------------- */

	applyAprimoramentos(item, configuration=null){
		if( !configuration ) return {};
		const C = CONFIG.T20, actor = this, ad = actor.data.data;
		let changes = [], options = {};
		options.aprimoramentos = [];
		let temCusto = false;
		item.custo = 0;

		// Aprimoramentos Aplicados
		const aplicados = expandObject(configuration).aprs ?? {};
		const aprimoramentos = this.effects.filter(ef => aplicados[ef.id]?.aplica ) ?? [];

		// FUNÇÃO DE INTERNA
		const applyChanges = (ch,qtd,ef) => {
			const campos = {
				atributo:			["atributo", null],
				treinado:			["treinado", null],
				treino:				["treino", null]
			}
			const _campos = {};
			// ROLLS ARRAY
			let rolls = ch.key.match(/roll/) ? [item] : [];
			for(let r of rolls){
				// CUSTOM CHANGES
				if( ch.mode == 0 ) {
					// kh => adic o modifier
					if( Die.MODIFIERS[ch.value.replace(/\d+|\>|\<|\+|\-|\=/, "")] ){
						if( ch.value.match(/k|kh|kl/) ){
							r.parts[0] = r.parts[0].replace("1d","2d")+ch.value;
						} else r.parts[0] = r.parts[0]+ch.value;
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					// ADD ROLL FROM ITEM
					if(item.type == "pericia"){
						_campos.outros = item.outros? 
											item.outros + "+"+ (Number(ch.value * qtd) || ch.value)
											:	(Number(ch.value * qtd) || ch.value);
						// r.parts.push( Number(ch.value * qtd) || ch.value );
					} else r.parts.push( Number(ch.value * qtd) || ch.value )
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ){
					r.parts[0] = ch.value;
				}
			}
			// ITEM DATA
			if( campos[ch.key] ){
				// CUSTOM CHANGES
				if( ch.mode == 0 ) i = 1;
				// MULTIPLY CHANGES
				else if( ch.mode == 1 ) {
					if( Number(ch.value) ){
						let temp = eval(`item.${campos[ch.key][0]}`) ?? false;
						if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)* (Number(ch.value)*qtd);
						else if ( temp ) {
							temp.replace(/\d+/, (match) => Number(match)*(Number(ch.value)*qtd) );
						}
					}
				}
				// ADD CHANGES
				else if( ch.mode == 2 ) {
					if( Number(ch.value) ){
						let temp = eval(`id.${campos[ch.key][0]}`) ?? false;
						if( Number(temp) ) _campos[campos[ch.key][0]] = Number(temp)+ (Number(ch.value)*qtd);
						else if ( temp ) {
							temp.replace(/\d+/, (match) => Number(match)+(Number(ch.value)*qtd) );
						}
					}
				}
				// OVERRIDE CHANGES
				else if( ch.mode == 5 ) {
					if( ch.key == "treinado" ){
						_campos["treino"] = !eval(ch.value)? 0 : ad.attributes.treino;
					}
					else if(campos[ch.key]) _campos[campos[ch.key][0]] = ch.value;
					
				}
			}
			foundry.utils.mergeObject(item, expandObject(_campos));
			
			// ACTOR DATA
			// TODO
		}

		aprimoramentos.forEach(function(ef){
			// Prepare chat content;
			let ap = {};
			ap.description = ef._sourceName;// : ef.data.label;
			ap.custo = Number(aplicados[ef.id]?.custo) * aplicados[ef.id]?.aplica || aplicados[ef.id]?.custo;
			ap.qtd = Number(aplicados[ef.id]?.aplica) || 1;
			
			options.aprimoramentos.push(ap);
			
			// TODO modify item;
			item.custo += Number(ap.custo) || 0;
			if( ap.custo ) temCusto = true;
			
			ef.data.changes.forEach(function(ch){
				applyChanges(ch, ap.qtd, ef);
			});
		});

		// Update parts with changed effects
		if(item.type == "pericia"){
			item.parts = this._prepareSkills(item.id, item, ad, this.getRollData(), true );
			if ( configuration.bonus ) item.parts.push( configuration.bonus );
		} else {
			item.name = game.i18n.localize(item.name);
		}
		if( item.custo && this.data.data.modificadores.custoPM ){
			item.custo += Number(this.data.data.modificadores.custoPM);
		}
		options.itemData = item;
		return options;
	}

	/* -------------------------------------------- */
	/**
	 * Roll Teste de Perícia
	 * @param {String} key  The skill ID (e.g. "cur")
	 * @param {Object} options    Options which configure how skill tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollPericia(key, options = {}) {
		let pericia = foundry.utils.deepClone( this.data.data.pericias[key] );
		const actor = this;
		const actorData = this.data;
		const ad = actorData.data;
		const event = options.event;
		pericia.id = key;
		let consumeMana = 0;
		let rollMode = game.settings.get("core", "rollMode");

		let itemData = {
			name: pericia.label,
			type: "pericia",
			parts: []
		}
		let parts = this._prepareSkills(key, pericia, ad, this.getRollData(), true );
		parts = parts.map(i => typeof i === "string" ? i.replace(/^\+/, "") : i );
		itemData.parts = parts.filter(Boolean);
		
		const needsConfiguration = options.event?.shiftKey ?? false;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create({
				actor: actor, type:"pericia", data: pericia, id: key, isOwned: true,
				name: pericia.label.replace(/[\*||\+]/g,"").trim()
			});
			if (!configuration) return;

			rollMode = configuration.rollMode;
		} else {
			let active = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && ef.getFlag("tormenta20","pericia") && !ef.data.disabled);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.data.flags.tormenta20.custo};
				return o;
			}, {});
		}
		options = this.applyAprimoramentos( mergeObject(pericia, itemData), flattenObject(configuration));

		// Compose roll options
		const rollConfig = mergeObject({
			parts: options.itemData.parts.map(i => typeof i === "string" ? i.replace(/^\+| /, "") : i ).filter(Boolean),
			actor: actor,
			event: event,
			data: this.getRollData(),
			title: pericia.label,
			flavor: pericia.label
		}, options);

		options.itemData.rolled = await d20Roll(rollConfig);
		
		let combate = game.combats.active;
		if (pericia.label == "Iniciativa" && combate) {
			let roll = options.itemData.rolled;
			let combatente = combate.combatants.find(
				(combatant) => combatant.actor.id === this.id
			);
			if (combatente && combatente.initiative === null) {
				combate.setInitiative(combatente._id, roll.total);
				console.log(`Foundry VTT | Iniciativa Atualizada para ${combatente._id} (${combatente.actor.name})`);
			}
		}

		// LOGS
		return this.displayCard({ options, rollMode });
	}

	/* -------------------------------------------- */

	/**
	 * Roll Teste de Atributo
	 * @param {String} abilityId  The ability ID (e.g. "for")
	 * @param {Object} options    Options which configure how ability tests are rolled
	 * @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	 */
	async rollAtributo(key, options = {}) {
		const label = CONFIG.T20.atributos[key];
		const abl = this.data.data.atributos[key];
		const actor = this;
		const event = options.event;
		let rollMode = game.settings.get("core", "rollMode");

		// Construct parts
		const parts = ["1d20","@mod"];
		// const data = {mod: abl.mod};
		const data = mergeObject({ mod: abl.mod }, this.getRollData());

		// Add global actor bonus GERAL | FISICOS | MENTAIS | KEY
		const bonuses = getProperty(this.data.data, "modificadores.atributos") || {};
		if (bonuses.geral) parts.push(bonuses.geral);
		if (["for", "des", "con"].includes(key) && bonuses.fisicos) parts.push(bonuses.fisicos);
		if (["int", "sab", "car"].includes(key) && bonuses.mentais) parts.push(bonuses.mentais);
		if (Object.keys(bonuses).includes(key) && bonuses[key]) parts.push(bonuses[key]);

		// Add provided extra roll parts now because they will get clobbered by mergeObject below
		if (options.parts?.length > 0) {
			parts.push(...options.parts);
		}
		let itemData = abl;
		abl.parts = parts;
		const needsConfiguration = event?.shiftKey ?? false;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create({
				actor: actor, type:"atributo", data: abl, id: key, isOwned: true,
				name: game.i18n.localize(abl.name) //|| abl.label.replace(/[\*||\+]/g,"").trim()
			});
			if (!configuration) return;
			
			if ( configuration.bonus ) parts.push( configuration.bonus );
			rollMode = configuration.rollMode;
			
		} else {
			// aways active
			let active = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && ef.getFlag("tormenta20","atributo") && !ef.data.disabled);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.data.flags.tormenta20.custo};
				return o;
			}, {});
		}

		options = this.applyAprimoramentos( mergeObject(abl, itemData), flattenObject(configuration));
		// Roll and return
		const rollConfig = mergeObject({
			parts: parts.filter(Boolean),
			data: data,
			event: event,
			title: game.i18n.format("T20.AbilityPromptTitle", { atributo: label }),
			flavor: "Teste de Atributo",
			messageData: { "flags.tormenta20.roll": { type: "ability", key } }
		}, options);

		options.itemData.rolled = await d20Roll(rollConfig);
		
		// LOGS
		return this.displayCard({ options, rollMode });
	}

	/* -------------------------------------------- */

	// TODO create rest function?

	/* -------------------------------------------- */

	//static formatCreatureType(typeData) {

	/* -------------------------------------------- */

	// TODO 

	/* -------------------------------------------- */

	/** @overrides */
	applyActiveEffects() {
		const version = game.settings.get("tormenta20","systemMigrationVersion");
		if( version < "1.3.0.0" ) return;
		const overrides = {};
		// Organize non-disabled effects by their application priority
		const changes = this.effects.reduce((changes, e) => {
			if (e.data.disabled || e.data?.flags?.tormenta20?.onuse) return changes;
			return changes.concat(e.data.changes.map(c => {
				c = duplicate(c);
				if (c.key.match(/(data.)(.*)(.condi|.outros|.bonus|.value)|data.modificadores/i) && c.mode === 2 && !c.value.toString().match(/^[+|-][\d+|@\w+]/i)) {
					c.value = "+"+c.value.toString();
				}
				else if ( c.key.match(/tamanho/i) ){
					let size = Object.keys( CONFIG.T20.actorSizes ).includes(c.value) ? c.value : "med";
					if( Object.values( CONFIG.T20.actorSizes ).includes(c.value) ){
						size = Object.assign({}, ...Object.entries(CONFIG.T20.actorSizes).map(([a,b]) => ({ [b]: a })))[c.value];
					}
					c.value = size;
				}
				c.effect = e;
				c.priority = c.priority ?? (c.mode * 10);
				return c;
			}));
		}, []);
		changes.sort((a, b) => a.priority - b.priority);
		// Apply all changes
		for (let change of changes) {
			const result = change.effect.apply(this, change);
			if (result !== null) overrides[change.key] = result;
		}
		// Expand the set of final overrides
		this.overrides = foundry.utils.expandObject(overrides);
	}
	/* -------------------------------------------- */

	/**
	* Spend or recover mana points for Actor
	* @param {number} amount			 An amount of spent (positive) or recover (negative) mana points
	* @param {number} adjust			 A adjust for the value due to specific conditions
	* @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	*/
	async spendMana(amount = 0, adjust = 0, recover) {
		let toChat = (speaker, message) => {
			let chatData = {
				user: game.user.id,
				content: message,
				speaker: ChatMessage.getSpeaker(speaker),
				type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			};
			ChatMessage.create(chatData, {});
		};

		let spendMana = 0;
		let tmpPMspend;
		let chatMessage = "";
		let newSptAmount = amount;

		const pm = this.data.data.attributes.pm;
		const tmpPM = parseInt(pm.temp) || 0;
		if (recover) {
			tmpPMspend = 0;
			newSptAmount = amount;
			spendMana = Math.clamped(pm.value + newSptAmount, 0, pm.max);
			chatMessage = `<i class="fas fa-user-plus"></i> +${newSptAmount} PM`;
		} else {
			amount = Math.floor(parseInt(amount) + adjust);
			newSptAmount = amount;
			// Deduct damage from temp Mana first
			tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;
			chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} PMs`;
			// Remove Mana
			spendMana = Math.clamped(pm.value - (newSptAmount - tmpPMspend), 0, pm.max);
		}
		// toChat(this, chatMessage);
		// Update the Actor
		return this.update({
			"data.attributes.pm.temp": tmpPM - tmpPMspend,
			"data.attributes.pm.value": spendMana,
		});
	}
	/**/

	/* -------------------------------------------- */

	/**
	* Display the chat card for an Item as a Chat Message
	* @param {object} options          Options which configure the display of the item chat card
	* @param {string} rollMode         The message visibility mode to apply to the created card
	* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	*                                  the prepared message data (if false)
	*/
	async displayCard({ options, rollMode, createMessage = true } = {}) {
		// Basic template rendering data
		const token = this.token;
		const templateData = {
			actor: this,
			tokenId: token?.uuid || null,
			item: options.itemData,
			custo: options.itemData.custo || null,
			aprimoramentos: options.aprimoramentos,
			_rolls: []
		};
		// Other Template Data

		if (options.itemData.rolled) {
			let roll = options.itemData.rolled;
		// for( let [key, roll] of Object.entries(options.itemData.rolled) ) {
			await roll.render().then((r)=> {templateData._rolls.push({template: r, roll: roll})});
			// await options.itemData.rolled.render().then((r) => { templateData._rolls.push(r) });
		}
		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, templateData);

		// Create the ChatMessage data object
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: html,
			flavor: options.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this, token}),
			flags: {"core.canPopout": true, "tormenta20.rollTotal": options.itemData.rolled.total, "tormenta20.aprimoramentos": options.aprimoramentos}
		};

		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

		if (game?.dice3d?.show) {
			let wd = {
				whisper: (["gmroll", "blindroll"].includes(rollMode) ? ChatMessage.getWhisperRecipients("GM") 
					: (rollMode === "selfroll" ? [game.user._id] : null)),
				blind: rollMode === "blindroll"
			}
			if( options.itemData.rolled ){
			// for (const roll of options.itemData.rolled){
				game.dice3d.showForRoll(options.itemData.rolled, game.user, true, wd.whisper, wd.blind)
			}
		}
		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}
}
