import { simplifyRollFormula, d20Roll, damageRoll } from '../dice.js';
import {applyOnUseEffects} from "../apps/ability-use.js";
import { T20 } from '../config.js';
// import SelectItemsPrompt from "../apps/select-items-prompt.js";
import AbilityUseDialog from "../apps/ability-use-dialog.js";
import ChoicesDialog from "../apps/choices-dialog.js";
import ItemT20 from "../item/entity.js";
import { T20Conditions } from '../conditions/conditions.js';

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {

	constructor(data, context) {
		super(data, context);

		// this.tags = this.tags || '';
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */
	
	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get aprimoramentosTypes() {
		const tipos = ["arma", "atributo", "consumivel", "magia", "pericia", "poder"];
		const types = Object.fromEntries(game.system.documentTypes.Item.map(t => [t, []]));
		for (let i of this.effects.values()) {
			if (!i.getFlag("tormenta20", "onuse")) continue;
			for (let j of tipos) {
				if (i.getFlag("tormenta20", j)) types[i.type].push(i);
			}

		}
		return types;
	}

	/* -------------------------------------------- */
	
	/* -------------------------------------------- */
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	/** @override */
	prepareData() {
		super.prepareData();

		// Iterate over owned items and recompute attributes that depend on prepared actor data
		this.items.forEach(item => item.prepareFinalAttributes());
	}

	/* -------------------------------------------- */

	/** @override */
	prepareBaseData() {
		
		const system = this.system;
		for (let [key, resource] of Object.entries(system.resources)) {
			if ( ["vehicle","simple"].includes(this.type) ) break;
			resource.label = T20.resources[key];
		}
		
		switch (this.type) {
			case "character":
				return this._prepareCharacterData();
			case "npc":
				return this._prepareNPCData();
			case "vehicle":
				return this._prepareVehicleData();
			case "simple":
				return this._prepareSimpleActorData();
		}
	}

	/* -------------------------------------------- */

	/**
	 * Derived Data:
	 * [Ability Modifier, Skill Value, Defense, CD, Encumbrance]
	 * 
	 * */
	/** @override */
	prepareDerivedData() {
		if ( ["vehicle","simple"].includes(this.type) ) return;
		
		const reforma = this.getFlag("tormenta20", "npcReform") && this.type == 'npc';
		const system = this.system;
		const nivel = system.attributes.nivel.value;

		// Loop through ability and add modifiers
		for (let [key, ability] of Object.entries(system.atributos)) {
			ability.name = CONFIG.T20.atributos[key];
			ability.value = (ability.base + ability.racial + ability.bonus);
		}
		
		// Defense
		this._prepareDefense(system);

		// Skills
		const rollData = this.getRollData();
		for (let [key, pericia] of Object.entries(system.pericias)) {
			// pericia.treino = !pericia.treinado ? 0 : system.attributes.treino;
			this._prepareSkills(key, pericia, system, rollData);
		}
		
		// BASE CD
		system.attributes.cd = reforma ? system.attributes.cd : 10 + Math.floor(nivel / 2);
		
		// Encumbrance
		system.attributes.carga = this._computeEncumbrance(system);
	}

	/* -------------------------------------------- */
	/*  Data Preparation Helpers                    */
	/* -------------------------------------------- */

	/**
	* Prepare Character type specific data
	*/
	_prepareCharacterData() {
		const system = this.system;
		const flags = this.flags;
		const classes = [];
		
		let sheetFlags = {};
		if ( this.getFlag("tormenta20", "sheet.editarPericias") === undefined ) sheetFlags.editarPericias = true;
		if ( this.getFlag("tormenta20", "sheet.botaoEditarItens") === undefined ) sheetFlags.botaoEditarItens = true;

		let baseFlags = { tormenta20: { sheet: sheetFlags } };
		if( !isEmpty(sheetFlags) ) mergeObject( flags, baseFlags );

		const nivel = this.items.reduce((arr, item) => {
			if (item.type === "classe") {
				const classLevels = parseInt(item.system.niveis) || 1;
				arr += classLevels;
				classes.push(item.name + " " + item.system.niveis);
			}
			return arr;
		}, 0);
		system.attributes.nivel.value = nivel;
		system.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		// Experience required for next level
		const xp = system.attributes.nivel.xp;
		xp.proximo = this.getLevelExp(nivel || 1);
		const anterior = this.getLevelExp(nivel - 1 || 0);
		const necessario = xp.proximo - anterior;
		const pct = Math.round((xp.value - anterior) * 100 / necessario);
		xp.pct = Math.clamped(pct, 0, 100);
	}

	/* -------------------------------------------- */

	_prepareNPCData() {
		const system = this.system;
		const flags = this.flags;
		let npcFlags = {};
		let reformSheet = this.sheet instanceof game.tormenta20.applications.ActorSheetT20Builder;
		if ( this.getFlag("tormenta20", "npcReform") === undefined ) npcFlags.npcReform = false;
		if ( reformSheet ) npcFlags.npcReform = reformSheet;
		if ( this.getFlag("tormenta20", "showCD") === undefined ) npcFlags.showCD = true;

		const reforma = npcFlags.npcReform || this.getFlag("tormenta20", "npcReform");
		let nd = system.detalhes.nd;
		
		const nivel = reforma ? (Number(nd)||1) : system.attributes.nivel.value;
		system.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		// Experience Reward
		system.attributes.defesa.condi = 0;
		system.attributes.nivel.xp.value = this.getCDExp(nd);

		if ( system.biography?.value ) {
			system.detalhes.biography.value += system.biography.value;
		}

		let baseFlags = { tormenta20: npcFlags };
		if( !isEmpty(npcFlags) ) mergeObject( flags, baseFlags );
	}

	/* -------------------------------------------- */

	_prepareVehicleData() {
		const system = this.system;
		const flags = this.flags;
	}

	/* -------------------------------------------- */

	_prepareSimpleActorData() {
		const system = this.system;
		const flags = this.flags;
	}

	/* -------------------------------------------- */

	/**
	* Prepare ability score modifier
	*/
	static _prepareModifier(ability = {}){
		ability.value = Number(ability.value || 0);
		ability.bonus = Number(ability.bonus || 0);
		return Math.floor((ability.value + ability.bonus - 10) / 2);
	}

	/* -------------------------------------------- */

	/**
	* Prepare defense value.
	* @private
	*/
	_prepareDefense(system){
		const reforma = this.getFlag("tormenta20", "npcReform") && this.type == 'npc';
		const rollData = this.getRollData();
		

		let defense = system.attributes.defesa;
		if ( !defense.base ) system.attributes.defesa.base = 10;
		if ( !defense.value ) system.attributes.defesa.value = 0;
		if ( !defense.pda ) system.attributes.defesa.pda = 0;
		if ( !Number(defense.condi) ) system.attributes.defesa.condi = 0;

		let parts = [defense.base];
		let pda = 0;
		let ability = defense.atributo;
		let abl = system.atributos[ability]?.value || 0;
		let maxAbl = false;
		
		// Defense Calculation
		for (let item of this.items.filter( i => i.type == 'equipamento') ) {
			if( reforma ) break;
			if( !item.system.equipado ) continue;
			let tipo = item.system.tipo;
			let value = Number(item.system.armadura.value);
			let penalidade = item.system.armadura.penalidade;
			let maxAtr = item.system.armadura.maxAtr;

			if (tipo == "leve" || tipo == "pesada") {
				// armadura = tipo;
				if(Number(defense.armadura)){
					value += Number(defense.armadura);
				}
				if ( tipo == "pesada" ) maxAbl = Number(maxAtr) || 0;
				parts.push( value );
			} else if (tipo == "escudo") {
				// escudo = true;
				if(Number(defense.escudo)){
					value += Number(defense.escudo);
				}
				parts.push( value );
			} else {
				parts.push( value );
			}
			pda += Math.abs(penalidade);
		}
		/* 
			DEF = 10 + armor + (@armor) + shield + (@shield)
							 + @ability, outros, bonus, condi;
		 */
		if( !reforma ){
			parts.push( maxAbl === false ? abl : Math.min( abl , maxAbl ) );
			parts.push(defense.outros || 0);
		}
		parts.push(defense.bonus || 0);
		parts.push(defense.condi);

		const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		
		system.attributes.defesa.value = parseInt(result);
		system.attributes.defesa.pda += -pda;
	}

	/* -------------------------------------------- */

	/**
	* Prepare skill value.
	* @private
	*/
	_prepareSkills(key, pericia, system, rollData, roll = false) {
		const reforma = this.getFlag("tormenta20", "npcReform") && this.type == 'npc';
		const pda = system.attributes.defesa.pda ? -Math.abs(system.attributes.defesa.pda) : 0;
		const treino = !pericia.treinado ? 0 : system.attributes.treino;
		pericia.label = pericia.label || CONFIG.T20.pericias[key] || '';
		pericia.label = key == 'ofi0'? CONFIG.T20.pericias['ofic'] : pericia.label;
		pericia.custom = false;
		if ( !Number(pericia.condi) ) pericia.condi = 0;
		if (!key.match(/ofi[1-9]|_pc[1-9]/)) {
			pericia.pda = ["acro", "furt", "ladi"].includes(key);
			pericia.st = ["ades", "conh", "guer", "joga", "ladi", "mist", "ocul", "nobr", "pilo", "reli"].includes(key);
			pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
		} else {
			pericia.custom = true;
			pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
			pericia.st = pericia.label.match(/\*/g) ? true : false;
			pericia.pda = pericia.label.match(/\+/g) ? true : false;
		}
		
		pericia.outros = pericia.outros;//Number(pericia.outros) || 0;
		pericia.bonus = pericia.bonus || 0;//Number(pericia.bonus) || 0;

		const parts = [];
		if ( ["luta","pont","fort", "refl", "vont"].includes(key) && reforma ) {
			parts.push(pericia.outros, pericia.bonus);
		} else {
			parts.push("@meionivel", treino, `@${pericia.atributo}`, (pericia.pda ? pda : 0), pericia.outros, pericia.bonus);
		}

		// GET GLOBAL ACTOR MODIFIERS
		const bonuses = getProperty(this.system, "modificadores.pericias") || {};
		if (bonuses.geral) parts.push("@pericia");
		if (!["luta", "pont"].includes(key) && bonuses.semataque) parts.push("@semataque");
		if (["luta", "pont"].includes(key) && bonuses.ataque) parts.push("@ataque");
		if (["fort", "refl", "vont"].includes(key) && bonuses.resistencia) parts.push("@resistencia");
		if (bonuses.atr && bonuses.atr[pericia.atributo]) parts.push(bonuses.atr[pericia.atributo]);
		if (pericia.condi) parts.push(pericia.condi);
		if ( key == "furt" ) parts.push("@tamanho");

		if ( !roll ) {
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			pericia.value = parseInt(result.replace(" ","")) || 0;
		} else {
			let dice = pericia.parts ? pericia.parts[0] : "1d20";
			return [dice].concat(parts);
		}

	}
	/* 
		SKL = @meionivel + @treino + @ability + @outros + @bonus + @condi
		+ (@tamanho) + (@pda) + (@ataque) + (@ataqueCAC) + (@ataqueAD)
		+ (@pericia) + (@resistencia) + (@semataque)
		+ (@mental) + (@fisico) + (@social);
	 */

	/* -------------------------------------------- */

	/**
	* Compute the level and percentage of encumbrance for an Actor.
	* @param {Object} system			The data object for the Actor being rendered
	* @returns {{max: number, value: number, pct: number}}	An object describing the character's encumbrance level
	* @private
	*/
	_computeEncumbrance(system) {
		const goty = true;
		/* FLAGS */
		const flags = {}
		flags['wideBack'] = true; this.flags.tormenta20.costasLargas;
		flags['organised'] = true; this.flags.tormenta20.inventarioOrganizado;
		if ( goty ){
			let weight = system.attributes.carga;
			// { value: 0, max: 20, pct: 0, encumbered: false };
			const physicalItems = ["arma", "equipamento", "consumivel", "tesouro"];
			// Get the total weight from items
			weight.value = this.items.reduce((weight, i) => {
				if ( !physicalItems.includes(i.type) || !i.system.carregado || i.system.container) return weight;
				const q = i.system.qtd || 0;
				const w = (flags.organised && i.system.espacos == 0.5 ? 0.25 : i.system.espacos) || 0;
				// const w = i.system.espacos || 0;
				return weight + (q * w);
			}, 0);

			// Get the total weight from coins (1 == 1000)
			let coins = Object.values( system.dinheiro ).reduce((a, b) => a + b);
			weight.value = weight.value + Math.floor( coins / 1000);
			// weight.value = Math.floor( weight.value );

			// Compute Encumbrance percentage
			const str = system.atributos.for.value;
			const int = system.atributos.int.value;
			const base = 10 + ( flags.wideBack ? 5 : 0) + ( flags.organised ? int : 0);
			const limit = base + ( str > 0 ? str*2 : str );
			weight.max = limit * 2;
			weight.encumbered = weight > limit;
			weight.pct = Math.clamped((weight.value * 100) / weight.max, 0, 100);
			return weight;
		} else {
			let rule = game.settings.get("tormenta20", "weightRule");
			if( rule == 'core' ){
				const physicalItems = ["arma", "equipamento", "consumivel", "tesouro"];
				// Get the total weight from items
				let weight = this.items.reduce((weight, i) => {
					if ( !physicalItems.includes(i.type) || !i.system.carregado ) return weight;
					const q = i.system.qtd || 0;
					const w = i.system.peso || 0;
					return weight + (q * w);
				}, 0);
				// Compute Encumbrance percentage
				weight = weight.toNearest(0.1);
				const atrFor = system.atributos.for;
				const atrCrg = system.attributes.carga ?? {value:0, max:0};
				const max = (( atrFor.value + atrFor.bonus ) * 10) + (Number(atrCrg.max) || 0) ;
				const emc = (( atrFor.value + atrFor.bonus ) * 3) + (Number(atrCrg.lev) || 0) ;
				const pct = Math.clamped((weight * 100) / max, 0, 100).toNearest(0.1);
				return { value: weight, max, pct, encumbered: weight > emc };
			}
			else if( rule == 'espacos' ){
				
				const physicalItems = ["arma", "equipamento", "consumivel", "tesouro"];
				// Get the total weight from items
				let weight = this.items.reduce((weight, i) => {
					if ( !physicalItems.includes(i.type) || !i.system.carregado || i.system.container) return weight;
					const q = i.system.qtd || 0;
					const w = i.system.espacos || 0;
					return weight + (q * w);
				}, 0);
	
				let coins = Object.values( system.dinheiro ).reduce((a, b) => a + b);
				weight = weight + Math.floor( coins / 1000);
				weight = Math.floor( weight );
				// Compute Encumbrance percentage
				const atrFor = 1; //system.atributos.for.value;
				const atrCrg = system.attributes.carga;
				const max = 10 + ( atrFor > 0 ? atrFor*2 : atrFor );
				const emc = weight;
				const pct = Math.clamped((weight * 100) / max, 0, 100);
				return { value: weight, max, pct, encumbered: weight > emc };
			}
			else if( rule == 'manual' ){
				return { value: 0, max: 100, pct: 30, encumbered: false };
			} else {
				return { value: 0, max: 100, pct: 30, encumbered: false };
			}
		}
	}

	/* -------------------------------------------- */

	/**
	* Prepare HP and MP max value.
	* @private
	*/
	_calcPVPM() {
		const updateData = {};
		const nivel = Number( this.system.attributes.nivel.value );
		const con = this.system.atributos.con.value;

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
			let c = classe.system;
			let iniPV = c.inicial? c.pvPorNivel * 3 : 0;
			soma.pv += Number(iniPV) + (Number(c.niveis) * ( Number(c.pvPorNivel) + con ));
			soma.pm += c.niveis * c.pmPorNivel;
		}
		if( lvlc.pvBonus[0] ) soma.pv += Number(lvlc.pvBonus[0]);
		if( lvlc.pvBonus[1] ) soma.pv += Math.floor(Number(lvlc.pvBonus[1]) * nivel);
		if( lvlc.pmBonus[0] ) soma.pm += Number(lvlc.pmBonus[0]);
		if( lvlc.pmBonus[1] ) soma.pm += Math.floor(Number(lvlc.pmBonus[1]) * nivel);
		for (let [atr, value] of Object.entries(lvlc.pv)){
			if(value) soma.pv += Number(this.system.atributos[atr].value);
		}
		for (let [atr, value] of Object.entries(lvlc.pm)){
			if(value) soma.pm += Number(this.system.atributos[atr].value);
		}
		updateData["system.attributes.pv.min"] = (Math.floor(soma.pv/2)*-1);
		updateData["system.attributes.pv.max"] = soma.pv;
		updateData["system.attributes.pm.max"] = soma.pm;
		this.update(updateData);
	}

	/* -------------------------------------------- */

	/**
	* Calculate HP and MP recovery by rest.
	* @private
	*/
	async descanso(modificador=1, modPV=0, modPM=0, curaCP=false, curaAC=false, toChat=true) {
		let descricao = "";
		const nivel = this.system.attributes.nivel.value;
		let rec = {
			pv:0,
			pm:0
		}
		
		let cp = curaCP ? 2 : 1;
		let ac = curaAC ? 2 : 1;
		let recuperarPV = Math.floor( nivel * ( modificador + modPV )  * cp);
		rec.pv = recuperarPV;
		await this.modifyTokenAttribute("attributes.pv", recuperarPV, true, true);

		let recuperarPM = Math.floor( nivel * ( modificador + modPM )  * ac);
		rec.pm = recuperarPM;
		await this.modifyTokenAttribute("attributes.pm", recuperarPM, true, true);

		descricao = `${this.name} recuperou ${rec.pv} PV e ${rec.pm} PM.`;
		
		if ( !toChat ) return descricao;

		let content = {
			item: {
				name: "Descanso",
				img: "icons/svg/regen.svg"
			},
			system: {
				description: {
					value: "<p>" + descricao + "</p>"
				}
			}
		}
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, content);
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			content: html
		};
		ChatMessage.create(chatData);
	}

	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/** @inheritdoc */
	getRollData() {
		// const data = foundry.utils.deepClone(super.getRollData());
		const data = Object.assign({}, this.system);
		//super.getRollData();
		// Set abilities abbreviation
		for (let abl in data.atributos) {
			data[abl] = data.atributos[abl].value;
		}

		// Set level abbreviation
		data["nivel"] =  Number(this.system.attributes.nivel.value || 1);
		data["meionivel"] = Math.floor(data["nivel"] / 2) || 0;

		// Set class level
		const classes = this.items.reduce(function (cn, it) {
			if (it.type === "classe") cn[it.name.slugify()] = it.system.niveis;
			return cn;
		}, {});
		data["nvl"] = classes;
		// Set power type modifiers (ie.: tormenta, distinction)
		/* TODO include tag to items */
		const powers = this.items.reduce(function (cn, it) {
			if (it.type === "poder"){
				let slug = it.system.subtipo.slugify();
				cn[slug] = (cn[slug] ?? 0) + 1;
			}
			return cn;
		}, {});
		for (let [k, v] of Object.entries(powers)) {
			powers[k+'2'] = 1+ Math.floor( (powers[k] - 1) / 2);
			powers[k+'3'] = 1+ Math.floor( (powers[k] - 1) / 3);
			powers[k+'4'] = 1+ Math.floor( (powers[k] - 1) / 4);
		}
		mergeObject(data, powers);

		// Set casting ability
		/* TODO CLASS SPELLBOOK */
		let atbchave = this.system.attributes.conjuracao;
		data["atributoChave"] = this.system.atributos[atbchave]?.value ?? 0;

		// Set defense bonuses modifiers
		let defMods = this.system.modificadores.defesa || {};
		data["armadura"] = defMods.armadura || 0;
		data["armaduraLeve"] = defMods.armaduraLeve || 0;
		data["armaduraPesada"] = defMods.armaduraPesada || 0;
		data["escudo"] = defMods.escudo || 0;

		// Set skill bonuses modifiers
		let skillMods = this.system.modificadores.pericias;
		const size = this.system.tracos.tamanho;
		const sizeMod = { "min": 5, "peq": 2, "med": 0, "gra":-2, "eno":-5, "col": -10 };
		
		data["treino"] = this.system.attributes.treino;
		data["tamanho"] = sizeMod[size];
		data["pda"] = this.system.attributes.defesa.pda;
		
		data["pericia"] = skillMods.geral;
		data["semataque"] = skillMods.semataque;
		data["ataque"] = skillMods.ataque;
		data["resistencia"] = skillMods.resistencia;

		// Set ability bonuses modifiers
		let ablMods = this.system.modificadores.atributos;
		data["atributo"] = ablMods.geral;
		data["fisicos"] = ablMods.fisicos;
		data["mentais"] = ablMods.mentais;

		// Set damage bonuses modifiers
		let dmgMods = this.system.modificadores.dano;
		data["dano"] = dmgMods.geral;
		data["danoMagico"] = dmgMods.mag;
		data["danoCAC"] = dmgMods.cac;
		data["danoAD"] = dmgMods.ad;
		data["danoALQ"] = dmgMods.alq;

		

		return data;
	}

	/**
	 * Return the amount of experience required to gain a certain character level.
	 * @param level {Number}	The desired level
	 * @return {Number}			 The XP required
	 */
	getLevelExp(nivel) {
		const niveis = T20.xpPorNivel;
		return niveis[Math.min(nivel, niveis.length - 1)];
	}

	/* -------------------------------------------- */

	/**
	* Return the amount of experience granted by killing a creature of a certain CR.
	* @param cr {Number}		 The creature's challenge rating
	* @return {Number}			 The amount of experience granted per kill
	*/
	getCDExp(cr) {
		return Number(cr) * 1000 || (["1/2", "1/3", "1/4", "1/6", "1/8"].includes(cr) ? 1000 * eval(cr).toFixed(3) : 0);
	}

	/* -------------------------------------------- */

	/**
	* Add a list of itens to the actor
	* TODO at Advancement
	* @param {Array.<ItemT20>} itens - The itens being added to the Actor;
	* @returns {Promise<ItemT20[]>}
	**/
	async addEmbeddedItems(items) {
		let itemsToAdd = items;
		if (itemsToAdd.length === 0) return;
		// create the selected items with this actor as parent
		return ItemT20.createDocuments(itemsToAdd.map(i => i.toJSON()), { parent: this });
	}

	/**
	 * Update Actor Attributes following NPC builder guide
	 * @param {String} cr    - The Challenge Rating to get values from;
	 * @param {String} attr  - The attribute being changed;
	 */
	_setCRAttrs(cr, attr){
		if ( this.type != 'npc' ) return;
		let updateData = {};
		const crData = CONFIG.T20.NPCParams(cr);
		let skills = {};
		skills.fort = this.system.builder.attributes.fort ?? {};
		skills.refl = this.system.builder.attributes.refl ?? {};
		skills.vont = this.system.builder.attributes.vont ?? {};
		const ranks = ['botsave','midsave','topsave'];
		const attrs = ['attack','damage','defense','hp','dc','topsave','midsave','botsave'];
		
		if( attr == 'all') {
			for ( let att of attrs ){
				updateData['system.builder.attributes.'+att+'.value'] = crData[att];
				updateData['system.builder.attributes.'+att+'.cr'] = cr;
			}
		} else {
			updateData['system.builder.attributes.'+attr+'.value'] = crData[attr];
			updateData['system.builder.attributes.'+attr+'.cr'] = cr;
		}
		if ( ['all','topsave','midsave','botsave'].includes(attr) ) {
			for ( let [key, skill] of Object.entries(skills)) {
				let r = skill.rank ?? 0;
				if( attr == 'all' || attr == ranks[r] ){
					updateData['system.builder.attributes.'+key+'.value'] = crData[ranks[r]];
					updateData['system.builder.attributes.'+key+'.cr'] = cr;
				}
			}
		}
		this.update(updateData);
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		// console.error("_preCreate");
		// SkillSet
		const system = game.settings.get("tormenta20", "gameSystem");
		switch (system) {
			case "Skyfall":
				// const skills = mergeObject(this.system.pericias, {
				// 	defe: { value: 0, atributo: "des" },
				// 	ocul: { value: 0, atributo: "int" },
				// });
				// delete skills.mist;
				
				// this.update({ "system.pericias": skills });
				break;
			default:
				// NO CHANGES;
				break;
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
		// Apply changes in Actor size to Token width/height
		const newSize = getProperty(changed, "system.tracos.tamanho");
		if (newSize && (newSize !== foundry.utils.getProperty(this.system, "tracos.tamanho"))) {
			let size = CONFIG.T20.tokenSizes[newSize];
			if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
				changed.prototypeToken = changed.prototypeToken || {};
				changed.prototypeToken.height = size;
				changed.prototypeToken.width = size;
			}
		}
		const sheetClass = getProperty(changed, "flags.core.sheetClass");
		if( sheetClass && sheetClass == 'tormenta20.ActorSheetT20Builder' ){
			setProperty(changed, 'flags.tormenta20.npcReform', true);
			const builder = getProperty(this.system, "builder.attributes");
			if( !['0','1','2'].includes(builder.fort?.rank) ){
				setProperty(changed, 'system.builder.attributes.fort.rank', '0');
			}
			if( !['0','1','2'].includes(builder.refl?.rank) ){
				setProperty(changed, 'system.builder.attributes.refl.rank', '0');
			}
			if( !['0','1','2'].includes(builder.vont?.rank) ){
				setProperty(changed, 'system.builder.attributes.vont.rank', '0');
			}
		}
		// NPC REFORM
		if ( this.type == 'npc' && this.getFlag('tormenta20','npcReform') ){
			let attributes = {};
			let skills = {};
			let cr = getProperty(changed, 'system.detalhes.nd');
			let defense = getProperty(changed, 'system.builder.attributes.defense.value');
			let hp = getProperty(changed, 'system.builder.attributes.hp.value');
			let mp = getProperty(changed, 'system.builder.attributes.mp.value');
			let dc = getProperty(changed, 'system.builder.attributes.dc.value');
			let fort = getProperty(changed, 'system.builder.attributes.fort.value');
			let refl = getProperty(changed, 'system.builder.attributes.refl.value');
			let vont = getProperty(changed, 'system.builder.attributes.vont.value');

			let _cr = getProperty(changed, 'system.attributes.nivel.value');
			let _defense = getProperty(changed, 'system.attributes.defesa.base');
			let _hp = getProperty(changed, 'system.attributes.pv.max');
			let _mp = getProperty(changed, 'system.attributes.pm.max');
			let _dc = getProperty(changed, 'system.attributes.dc');
			let _fort = getProperty(changed, 'system.pericias.fort.outros');
			let _refl = getProperty(changed, 'system.pericias.refl.outros');
			let _vont = getProperty(changed, 'system.pericias.vont.outros');
			if ( cr && (cr != getProperty(this.system, _cr)) ){
				attributes.nivel = {value: cr};
			}
			if ( defense && (defense != getProperty(this.system, _defense)) ){
				attributes.defesa = {base: defense};
			}
			if ( hp && (hp != getProperty(this.system, _hp)) ){
				attributes.pv = {max: hp};
			}
			if ( mp && (mp != getProperty(this.system, _mp)) ){
				attributes.pm = {max: mp};
			}
			if ( dc && (dc != getProperty(this.system, _dc)) ){
				attributes.cd = dc;
			}
			if ( fort && (fort != getProperty(this.system, _fort)) ){
				skills.fort = {outros: fort};
			}
			if ( refl && (refl != getProperty(this.system, _refl)) ){
				skills.refl = {outros: refl};
			}
			if ( vont && (vont != getProperty(this.system, _vont)) ){
				skills.vont = {outros: vont};
			}
			if (!isEmpty(attributes)) changed.system.attributes = attributes;
			if (!isEmpty(skills)) changed.system.pericias = skills;
		}
	}

	/* -------------------------------------------- */

	async _preCreateStatusEffects(result, options, userId){
		let resultchanged = false;
		// Chain apply/remove child effects
		// If stackable apply worst effect and remove current
		let effects = this.effects;
		let add = [];
		let remove = [];
		let i = 0;
		for ( let ef of result ){
			// add[i] = ef;
			let stack = ef.flags.tormenta20.stack;
			let child = ef.flags.tormenta20.childEffect;
			if ( !stack && !child ) continue;
			let cond = effects.find( e => e.flags?.core?.statusId == ef.flags?.core?.statusId);
			if( stack && cond ){
				result[i] = T20Conditions[stack];
				child = result[i].flags.tormenta20.childEffect;
				remove.push(cond.id);
				resultchanged = true;
			}
			if ( !isEmpty(child) ) {
				child = child.map( c => T20Conditions[c] );
				result.push(...child);
				resultchanged = true;
			}
			// for ( let cef of child ){
			// 	cond = effects.find( e => e.flags?.core?.statusId == cef.flags?.core?.statusId);
			// 	if( cef ){
			// 		result.push(cef);
			// 	}
			// } 
			i++;
		}
		i = 0;
		for ( let ef of result ){
			result[i] = new ActiveEffect({ef}).object;
			i++;
		}
		if( resultchanged ) {
			// await this._preCreateEmbeddedDocuments("ActiveEffect", result, options, userId);
		} else {
			// await super._preCreateEmbeddedDocuments("ActiveEffect", result, options, userId);
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateEmbeddedDocuments(embeddedName, result, options, userId){
		await super._preCreateEmbeddedDocuments(embeddedName, result, options, userId);
		if( game.userId !== userId ) return;
		// Show chat message if condition;
		options.toChat = options.toChat === undefined ? true : options.toChat;
		if(embeddedName == "ActiveEffect" && options.toChat){
			const showCard = game.settings.get("tormenta20", "showStatusCards");
			const effect = result.find(doc => doc.flags?.core?.statusId );
			if(showCard && effect){
				game.tormenta20.macros.msgFromJournal(effect.label, "tormenta20.basico", 'Condições');
			}
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId){
		await super._onCreateEmbeddedDocuments(embeddedName, documents, result, options, userId);


		if( embeddedName == "ActiveEffect" ){
			let effs = documents.filter(ef => ef.changes.find( ch => ch.key.match(/^\?/) ) );
			let choices = [];
			for ( let ef of effs ){
				let changes = ef.changes.filter( ch => ch.key.match(/^\?/) );
				let choice = {};
				for ( let ch of changes ){
					choice.id = ef.id;
					choice.label = ef.label;
					choice.key = ch.key.split('.');
					choice.value = ch.value.split('.');
					choices.push(choice);
				}
			}
			if ( !isEmpty(choices) ) {
				let chosen = await ChoicesDialog.create( choices, this );
				chosen = expandObject(chosen);
				for ( let [ id, c] of Object.entries(chosen) ){
					let ef = this.effects.find( e => e.id == id );
					for ( let [ key, value ] of Object.entries(c) ){
						ef.setFlag('tormenta20', key, value);
					}
				}
			}
		}
		// console.log(embeddedName, documents, result, options);
	}


	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if (attribute === "attributes.pv" || attribute === "attributes.pm") {
			const hp = getProperty(this.system, attribute);
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
	async applyDamageV2(roll, multiplier = 1, applyRD = false) {
		const pv = this.system.attributes.pv;
		const pm = this.system.attributes.pm;
		const rds = this.system.tracos?.resistencias;
		const PCVuln = this.type == "character" ? true : false;
		const NPCVuln = this.type == "npc" ? true : false;
		let damage;
		if( roll ){
			let defaultDamage = 'dano';
			damage = roll.terms.reduce( (acc, t, idx) =>{
				if ( idx == 0 && t.options.flavor ) defaultDamage = t.options.flavor;
				let dType = t.options.flavor ?? defaultDamage;
				if ( !acc[dType] ) acc[dType] = {value:0,vuln:0,rd:0,final:0};
				if( Number(t.total)) {
					acc[dType].value += t.total;
					//TODO Vulnerability per dice
					if ( t.faces && PCVuln && rds[dType] && rds[dType].vulnerabilidade ){
						acc[dType].vuln += t.number;
					}
					
				}
				return acc;
			}, {});
		}

		// Apply Damage Reduction for each type of damage
		let final = {
			damage: 0,
			total: 0,
			tempHP: 0,
			mana: 0,
			tempMP: 0
		};

		for ( let [type, dmg] of Object.entries(damage) ){
			dmg.value = Math.floor(dmg.value * multiplier);
			dmg.vuln = Math.floor(dmg.vuln * multiplier);
			if ( type == 'curapv' || type == 'perda' || dmg.value < 0 ) {
				final.damage += dmg.value;
			} else if ( type == 'curatpv' ) {
				final.tempHP += dmg.value;
			} else if ( type == 'curapm' ) {
				final.mana += dmg.value;
			} else if ( type == 'curatpm' ) {
				final.tempMP += dmg.value;
			} else {
				let r = 0;
				if( applyRD && type == 'dano' ){
					r = ( rds[type]?.value ?? 0 );
				} else if( applyRD ) {
					r = (rds.dano?.value ?? 0) + ( rds[type]?.value ?? 0 );
				}
				if( NPCVuln && rds[type]?.vulnerabilidade ){
					dmg.value = Math.floor(dmg.value * 1.5);
					dmg.vuln = Math.floor(dmg.vuln * 1.5);
				}
				dmg.value = rds[type]?.imunidade ? 0 : dmg.value;
				dmg.vuln = rds[type]?.imunidade ? 0 : dmg.vuln;
				let acc = Math.max( (dmg.value + dmg.vuln ) - r , 0);
				dmg.final = acc;
				dmg.rd = r;
				
				final.total += Math.max( (dmg.value + dmg.vuln) , 0);
				final.damage += acc;
			}
		}

		// Deduct value from temp attr first
		const tmpHP = parseInt(pv.temp) || 0;
		const tmpMP = parseInt(pm.temp) || 0;
		const hpt = final.damage > 0 ? Math.min(tmpHP, final.damage) : 0;
		const mpt = final.damage > 0 ? Math.min(tmpMP, final.mana) : 0;
		// Remaining goes to attr
		const dhp = Math.clamped(pv.value - (final.damage - hpt), pv.min, pv.max);
		const dmp = Math.clamped(pm.value - (final.mana - mpt), pm.min, pm.max);

		// Update the Actor
		const updates = {
			"system.attributes.pv.temp": tmpHP - hpt - final.tempHP,
			"system.attributes.pv.value": dhp,
			"system.attributes.pm.temp": tmpMP - mpt - final.tempMP,
			"system.attributes.pm.value": dmp,
		};

		await this.update(updates);
		let show =  game.settings.get("tormenta20", "showDamageCards");
		if ( show != 'none' ) {
			this.displayDamageCard( damage, final, show );
		}
	}
	
	async displayDamageCard(dmgParts, final, show){
		
		let label = {
			damage:'T20.HP', mana:'T20.MP', tempHP:'T20.HealingTemp', tempMP:'T20.ManaTemp'
		}
		let chatDamage = {};
		for ( let [type, value] of Object.entries(final)){
			if( type == 'total' ) chatDamage['total'] = value * -1;
			if( type != 'total' && ( type != 'damage' && value != 0 ) ) {
				chatDamage['type'] = type;
				chatDamage['label'] = label[type];
				chatDamage['value'] = value *= -1;
			} else if ( type == 'damage' ) {
				chatDamage['label'] = label[type];
				chatDamage['type'] = type;
				chatDamage['value'] = value *= -1;
			}
		}

		let color = 'red';
		if ( chatDamage.type == 'damage' && chatDamage.value <= 0 ) color = 'health';
		else if ( chatDamage.type == 'damage' && chatDamage.value > 0 ) color = 'heal';
		else if ( chatDamage.type == 'mana' && chatDamage.value != 0 ) color = 'mana';
		else if ( chatDamage.type == 'tempHP' && chatDamage.value != 0 ) color = 'hptemp';
		else if ( chatDamage.type == 'tempMP' && chatDamage.value != 0 ) color = 'mptemp';
		
		const templateData = {
			actor: this,
			damage: dmgParts,
			chatDMG: chatDamage,
			setting: game.settings.get("tormenta20", "showDamageCards"),
		}
		let template = "systems/tormenta20/templates/chat/chat-card-damage.html";
		const html = await renderTemplate(template, templateData);

		let chatData = {
			user: game.user.id,
			content: html,
			speaker: ChatMessage.getSpeaker({actor: this}),
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			flags: {
				tormenta20: {
					minimal: true,
					cssClass: `tormenta20 damage-card damage-${color}`,
				}
			}
		};
		
		let rollMode = 'publicroll';
		if ( this.type == 'npc' && show != 'npcs' ) rollMode = 'selfroll';
		ChatMessage.applyRollMode(chatData, rollMode);
		ChatMessage.create(chatData, {});
	}

	async applyDamage(amount = 0, multiplier = 1, applyRD = false) {
		amount = Math.floor(parseInt(amount) * multiplier);
		const pv = this.system.attributes.pv;
		
		// Prepare Damage Reduction if damage
		const rd = applyRD ? this.system.tracos?.resistencias?.dano?.value || 0 : 0;
		amount = amount > 0 ? Math.max(amount - rd, 0) : amount;

		// Deduct damage from temp HP first
		const tmp = parseInt(pv.temp) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;

		// Remaining goes to health
		const dh = Math.clamped(pv.value - (amount - dt), pv.min, pv.max);

		// Update the Actor
		const updates = {
			"system.attributes.pv.temp": tmp - dt,
			"system.attributes.pv.value": dh
		};

		// Delegate damage application to a hook
		// TODO replace this in the future with a better modifyTokenAttribute function in the core
		const allowed = Hooks.call("modifyTokenAttribute", {
			attribute: "attributes.pv",
			value: amount,
			isDelta: false,
			isBar: true,
		}, updates);

		return allowed !== false ? this.update(updates) : this;
	}

	/* -------------------------------------------- */

	/**
	* Spend or recover mana points for Actor
	* @param {number} amount			 An amount of spent (positive) or recover (negative) mana points
	* @param {number} adjust			 A adjust for the value due to specific conditions
	* @return {Promise<Actor>}		 A Promise which resolves once the damage has been applied
	*/
	async spendMana(amount = 0, adjust = 0, recover) {
		let spendMana = 0;
		let tmpPMspend;
		let chatMessage = "";
		let newSptAmount = amount;

		const pm = this.system.attributes.pm;
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
		// Update the Actor
		await this.update({
			"system.attributes.pm.temp": tmpPM - tmpPMspend,
			"system.attributes.pm.value": spendMana,
		});

		let show =  game.settings.get("tormenta20", "showDamageCards");
		if ( show != 'none' ) {
			this.displayDamageCard( {}, {mana:amount}, show );
		}
	}

	/* -------------------------------------------- */

	/**
	* Roll Teste de Perícia
	* @param {String} key  The skill ID (e.g. "cura")
	* @param {Object} options    Options which configure how skill tests are rolled
	* @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	*/
	async rollPericia(key, options = {message: true}) {
		const actor = this;
		const cloneActor = this.clone({name: `${this.name} (Temp)`},
																	{save: false, keepId: true});
		let pericia = foundry.utils.deepClone( cloneActor.system.pericias[key] );
		const ad = cloneActor.system;
		const event = options.event;
		let consumeMana = 0;
		let rollMode = game.settings.get("core", "rollMode");

		let rConfig = {};
		let itemData = {
			name: pericia.label,
			type: "pericia",
			parts: [],
			id: key,
			actor: cloneActor,
			system: {ativacao:{custo:0}},
			isOwned: true,
		}
		itemData = mergeObject( itemData, pericia);
		let parts = cloneActor._prepareSkills(key, pericia, ad, cloneActor.getRollData(), true );
		parts = parts.map(i => typeof i === "string" ? i.replace(/^\+/, "") : i );
		itemData.parts = parts.filter(Boolean);
		
		const needsConfiguration = options.event?.shiftKey ?? false;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = mergeObject(rConfig, configuration);

			rollMode = configuration.rollMode;
		} else {
			let active = cloneActor.effects.filter(ef => ef.getFlag("tormenta20","onuse") && ef.getFlag("tormenta20","pericia") && !ef.disabled);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.flags.tormenta20.custo};
				return o;
			}, {});
			rConfig = applyOnUseEffects( itemData, configuration );
		}
		
		rConfig.itemData = itemData;
		
		// Compose roll options
		const rollConfig = mergeObject({
			parts: rConfig.itemData?.parts.map(i => typeof i === "string" ? i.replace(/^\+| /, "") : i ).filter(Boolean) || [],
			actor: cloneActor,
			event: event,
			data: this.getRollData(),
			title: itemData.label,
			flavor: itemData.label,
		}, rConfig);

		let toInitiative = function(){
			try {
				let combate = game.combats.active;
				if (pericia.label == "Iniciativa" && combate) {
					let roll = rConfig.itemData.rolled;
					let combatente = combate.combatants.find(
						(combatant) => combatant.actor.id === actor.id
					);
					if (combatente && combatente.initiative === null) {
						combate.setInitiative(combatente.id, roll.total);
						console.log(`Foundry VTT | Iniciativa Atualizada para ${combatente._id} (${combatente.actor.name})`);
					}
				}
			} catch (error) {
				console.warn(`Foundry VTT | Erro ao adicionar a Iniciativa, ${combatente._id} (${combatente.actor.name})`);
			}
		}

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if( autoSpendMana && rConfig.itemData?.system?.ativacao?.custo ) {
			consumeMana = rConfig.itemData.system.ativacao.custo;
		} else consumeMana = false;
		
		if( consumeMana ){
			const manaUpdate = rConfig.itemData.system.ativacao.custo;
			if ( !isEmpty(manaUpdate) ) {
				this.spendMana(manaUpdate, 0, false);
			}
		}
		// LOGS
		if( options.message ){
			options = rConfig;
			options.itemData.rolled = await d20Roll(rollConfig);
			options.effects = configuration.effects ?? [];
			toInitiative();
			return this.displayCard({ options, rollMode });
		} else {
			return await d20Roll(rollConfig);
		}
	}

	/* -------------------------------------------- */

	/**
	* Roll Teste de Atributo
	* @param {String} abilityId  The ability ID (e.g. "for")
	* @param {Object} options    Options which configure how ability tests are rolled
	* @return {Promise<Roll>}    A Promise which resolves to the created Roll instance
	*/
	async rollAtributo(key, options = {message: true}) {
		const label = CONFIG.T20.atributos[key];
		const abl = this.system.atributos[key];
		const actor = this;
		const event = options.event;
		let rollMode = game.settings.get("core", "rollMode");

		// Construct parts
		const parts = ["1d20",`@${key}`];

		// Add global actor bonus GERAL | FISICOS | MENTAIS | KEY
		const bonuses = getProperty(this.system, "modificadores.atributos") || {};
		if (bonuses.geral) parts.push("@atributo");
		if (["for", "des", "con"].includes(key) && bonuses.fisicos) parts.push("@fisicos");
		if (["int", "sab", "car"].includes(key) && bonuses.mentais) parts.push("@mentais");
		if (Object.keys(bonuses).includes(key) && bonuses[key]) parts.push(bonuses[key]);

		// Add provided extra roll parts
		if (options.parts?.length > 0) {
			parts.push(...options.parts);
		}
		abl.parts = parts;

		let itemData = {
			name: abl.name,
			type: "atributo",
			parts: parts,
			id: key,
			actor: actor,
			system: {ativacao:{custo:0}},
			isOwned: true,
			rollData: abl,
			custo: 0,
		}

		let rConfig = {};
		const needsConfiguration = event?.shiftKey ?? false;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = mergeObject(rConfig, configuration);
			
			if ( configuration.bonus ) parts.push( configuration.bonus );
			rollMode = configuration.rollMode;
		}
		// Aways Active Effect
		else {
			let active = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && ef.getFlag("tormenta20","atributo") && !ef.disabled);
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.flags.tormenta20.custo};
				return o;
			}, {});
			rConfig = applyOnUseEffects( itemData, configuration );
		}
		rConfig.itemData = itemData;
		// rollData
		const rollConfig = mergeObject({
			parts: parts.filter(Boolean),
			data: this.getRollData(),
			event: event,
			title: game.i18n.format("T20.AbilityPromptTitle", { atributo: label }),
			flavor: game.i18n.localize("T20.AbilityCheck"),
			messageData: { "flags.tormenta20.roll": { type: "ability", key } }
		}, rConfig);

		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		let consumeMana = 0;
		if( autoSpendMana && rConfig.itemData?.system?.ativacao?.custo ) {
			consumeMana = rConfig.itemData.system.ativacao.custo;
		} else consumeMana = false;
		
		if( consumeMana ){
			const manaUpdate = rConfig.itemData.system.ativacao.custo;
			if ( !isEmpty(manaUpdate) ) {
				this.spendMana(manaUpdate, 0, false);
			}
		}

		if( options.message ){
			options = rConfig;
			options.itemData.rolled = await d20Roll(rollConfig);
			return this.displayCard({ options, rollMode });
		} else {
			return await d20Roll(rollConfig);
		}
	}

	/* -------------------------------------------- */

	/** @override */
	applyActiveEffects() {
		const overrides = {};
		// Organize non-disabled effects by their application priority
		let changes = this.effects.reduce((changes, e) => {
			if ( e.disabled ) return changes;
			if ( e.flags?.tormenta20?.onuse ) return changes;
			return changes.concat(e.changes.map(c => {
				c = duplicate(c);
				if (c.key.match(/(system.|data.)(.*)(.condi|.outros|.bonus|.value|.pda)|(system.|data.)modificadores/i) && c.mode === 2 && !c.value.toString().match(/^[+|-][\d+|@\w+]/i)) {
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
		changes = changes.filter(c=> c.key.match(/(system.|data.)(.*)(.condi|.outros|.bonus|.value|.pda)|(system.|data.)modificadores/i));
		
		for ( let change of changes ) {
			if ( !change.key ) continue;
			const changes = change.effect.apply(this, change);
			Object.assign(overrides, changes);
		}

		// Expand the set of final overrides
		this.overrides = foundry.utils.expandObject(overrides);
	}

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
		const token = this.getActiveTokens()[0] ?? null;

		let manaCost = Number(options.itemData?.system?.ativacao?.custo) || null;
		if ( options.truque ) manaCost = 0;
		else if ( options.halfCost ) manaCost = Math.floor(manaCost / 2);

		const templateData = {
			actor: this,
			tokenId: token?.uuid || null,
			item: options.itemData,
			custo: manaCost || null,
			onUseEffects: options.onUseEffects,
			effects: options.effects,
			rolls:[]
		};

		// Other Template Data
		if (options.itemData.rolled) {
			let roll = options.itemData.rolled;
			await roll.render().then((r)=> {templateData.rolls.push({template: r, roll: roll})});
		}

		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, templateData);
		
		// Create the ChatMessage data object
		const chatData = {
			user: game.user.id,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			rolls: [options.itemData.rolled],
			content: html,
			flavor: options.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this}),
			flags: {
				"core.canPopout": true,
				"tormenta20.rollTotal": options.itemData.rolled.total,
				"tormenta20.onUseEffects": options.onUseEffects,
				"tormenta20.effects": options.effects,
			},
		};
		// chatData.rolls = options.itemData.rolled;

		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));
		
		// Create the Chat Message or return its data
		if( createMessage ){
			return await ChatMessage.create(chatData);
		} else {
			return chatData;
		}
	}

}