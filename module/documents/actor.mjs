import ItemT20 from "../documents/item.mjs";
// import { T20 } from '../config.mjs';
import { simplifyRollFormula, d20Roll, damageRoll } from '../dice/dice.mjs';
import {applyOnUseEffects} from "../apps/ability-use.mjs";
import AbilityUseDialog from "../apps/ability-use-dialog.mjs";
import ChoicesDialog from "../apps/choices-dialog.mjs";
import * as migrations from "./migrations.mjs";
import {actorMigration} from "./migrations.mjs";

/**
 * Extend the base Actor class to implement additional system-specific logic.
 */
export default class ActorT20 extends Actor {

	constructor(data, context) {
		super(data, context);
	}
	
	/** @inheritdoc */
	static migrateData(data) {
		const start = foundry.utils.deepClone(data);
		actorMigration.migrateCreatureType(data);
		actorMigration.migrateCRLevel(data);
		actorMigration.migrateResistances(data);
		
		if( !foundry.utils.isEmpty( foundry.utils.diffObject(start, data) ) ) {
			foundry.utils.setProperty(data,'flags.tormenta20.needCommit', true);
		}
		return super.migrateData(data);
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

	get modifiedFields() {
		return this.effects.reduce((acc, ef) => {
			if( ef.modifiesActor ) {
				for (let ch of ef.changes) {
					if ( !acc[ch.key] ) acc[ch.key] = [];
					if ( ch.mode == 2 && !acc[ch.key].find( f => f.mode == 5 ) ) {
						acc[ch.key].push({label:ef.name, value:ch.value, mode:ch.mode});
					} else if ( ch.mode == 5 ) {
						acc[ch.key] = [{label:ef.name, value:ch.value, mode:ch.mode}];
					}
				}
			}
			return acc;
		}, {});
	}

	/* -------------------------------------------- */

	get skillFormula() {
		// later ...@bonus, @pda
		if (this.type == 'character' ){
			return ['@meionivel','@treino','@atributo','@outros','@condi'];
		} else if (this.type == 'npc' ){
			return ['@meionivel','@treino','@atributo','@outros','@condi'];
			return ['@ndtreinado','@ndsemtreino','@outros','@condi'];
		} else {
			return ['@atributo','@outros','@condi'];
		}
	}
	/* -------------------------------------------- */

	get defenseFormula() {
		// later ...@bonus
		if (this.type == 'character' ){
			return ['@base','@atributo','@armadura','@escudo','@outros','@condi'];
		} else if (this.type == 'npc' ){
			return ['@base','@outros','@condi'];
		} else {
			return ['@base','@outros','@condi'];
		}
	}

	/* -------------------------------------------- */

	get dcFormula() {
		// later ...@bonus
		if (this.type == 'character' ){
			return ['@base','@meionivel','@atributo','@outros'];
		} else if (this.type == 'npc' ){
			return ['@base','@outros'];
		} else {
			return ['@base','@outros'];
		}
	}

	/* -------------------------------------------- */

	get encumbranceFormula() {
		// later ...@bonus
		if (this.type == 'character' ){
			return ['@base','@atributo'];
		} else if (this.type == 'npc' ){
			return ['@base'];
		} else {
			return ['@base'];
		}
	}

	/* -------------------------------------------- */

	get attackRollFormula() {
		if (this.type == 'character' ){
			return ['1d20', ...this.skillFormula,'@arma'];
		} else if (this.type == 'npc' ){
			return ['1d20', ...this.skillFormula,'@arma'];
		} else {
			return ['1d20', ...this.skillFormula,'@arma'];
		}
	}
	
	/* -------------------------------------------- */
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	/** @override */
	prepareData() {
		super.prepareData();
		// this.prepareBaseData();
		// this.preparePreDerivedData();
		// this.prepareEmbeddedDocuments();
		this.preparePosDerivedData();
		
		// Iterate over owned items and recompute attributes that depend on prepared actor data
		this.items.forEach(item => item.prepareFinalAttributes());
	}

	/* -------------------------------------------- */

	/** @override */
	prepareBaseData() {
		const system = this.system;
		for (let [key, resource] of Object.entries(system.resources)) {
			if ( ["vehicle","simple"].includes(this.type) ) break;
			if ( !resource.label ) resource.label = T20.resources[key];
		}
		
		switch (this.type) {
			case "character":
				this._prepareCharacterData();
				break;
			case "npc":
				this._prepareNPCData();
				break;
			case "vehicle":
				this._prepareVehicleData();
				break;
			case "simple":
				this._prepareSimpleActorData();
				break;
		}
		this.preparePreDerivedData();
	}

	/* -------------------------------------------- */

	/**
	 * Derived Data:
	 * [Ability Modifier, Skill Value, Defense, CD, Encumbrance]
	 * 
	 * */
	/** @override */
	preparePreDerivedData() {
		const system = this.system;
		if ( ["vehicle","simple"].includes(this.type) ){
			system.attributes.carga = this._computeEncumbrance(system);
			return;
		}

		const nivel = system.attributes.nivel?.value || 0;

		// Loop through ability and add modifiers
		for (let [key, ability] of Object.entries(system.atributos)) {
			ability.name = CONFIG.T20.atributos[key];
			ability.value = (ability.base + ability.racial + ability.bonus);
		}
	}

	preparePosDerivedData() {
		const system = this.system;
		const nivel = system.attributes.nivel?.value || 0;

		// THIS IS AN ABERRATION
		// IT'S PURPOSE IS TO ALLOW ACTIVE EFFECTS TO SET RACIAL ABILITY VALUES
		// THEN USE THOSE VALUES AT HP/MP CALC
		if ( this.overrides.system?.atributos ) {
			const overrides = this.overrides.system;
			for (let [key, ability] of Object.entries(overrides.atributos)) {
				if ( ability.racial && system.atributos[key] ) {
					system.atributos[key].value += ability.racial ?? 0 ;
				}
			}
		}
		
		// Defense
		this._prepareDefense();

		// Skills
		if ( system.pericias ) {
			for (let [key, pericia] of Object.entries(system.pericias)) {
				this._prepareSkills(key, pericia);
			}
		}

		// BASE CD
		if ( this.type == 'npc' ){
			// let nd = system.builder.attributes.dc.cr;
			// const crData = T20.NPCParams(nd);
			// system.attributes.cd = crData.dc;
		} else {
			system.attributes.cd = 10 + Math.floor(nivel / 2);
		}

		// Encumbrance
		system.attributes.carga = this._computeEncumbrance(system);

		// Damage Resistances
		this._prepareResistances(system);

		if ( this.type == 'character' ){
			this._preparePVPMTotal();
		} else if ( this.type == 'npc' ){
			system.attributes.pv.min = (Math.floor(system.attributes.pv.max/2)*-1);
		}
	}

	/**
	 * Unused in favor of preparePreDerivedData & preparePosDerivedData
	 **/
	prepareDerivedData() {
		
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
		
		let baseFlags = { tormenta20: {} };
		let sheetFlags = {};
		if ( this.getFlag("tormenta20", "sheet.editarPericias") === undefined ) sheetFlags.editarPericias = true;
		if ( this.getFlag("tormenta20", "sheet.botaoEditarItens") === undefined ) sheetFlags.botaoEditarItens = true;
		
		if ( this.getFlag("tormenta20", "lvlconfig") === undefined ){
			let levelConfig = {
				pv: { for: false, des: false, con: true , int: false, sab: false, car: false },
				pm: { for: false, des: false, con: false, int: false, sab: false, car: false },
				pvBonus: ["0","0"],
				pmBonus: ["0","0"],
				manual: false
			}
			baseFlags.tormenta20.lvlconfig = levelConfig;
		}
		baseFlags.tormenta20.sheet = sheetFlags;
		if( !foundry.utils.isEmpty(sheetFlags) ) foundry.utils.mergeObject( flags, baseFlags );

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
		xp.pct = Math.clamp(pct, 0, 100);
	}

	/* -------------------------------------------- */

	_prepareNPCData() {
		const system = this.system;
		const flags = this.flags;
		let npcFlags = {};
		// let reformSheet = this.sheet instanceof game.tormenta20.applications.ActorSheetT20Builder;
		// if ( this.getFlag("tormenta20", "npcReform") === undefined ) npcFlags.npcReform = false;
		// if ( reformSheet ) npcFlags.npcReform = reformSheet;
		if ( this.getFlag("tormenta20", "showCD") === undefined ) npcFlags.showCD = true;

		let nd = system.attributes.nd;
		const crData = T20.NPCParams(nd);
		
		if ( ['1/2','1/4'].includes(nd) ) system.attributes.nivel.value = 1;
		else if ( ['S','S+'].includes(nd) ) system.attributes.nivel.value = 20;
		else system.attributes.nivel.value = Number(nd) ?? 1;
		const nivel = system.attributes.nivel.value;
		
		system.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
		system.attributes.meionivel = Math.floor(system.attributes.nivel.value/2);
		// system.attributes.treino = crData.topskill;
		// system.attributes.meionivel = crData.botskill;
		// Experience Reward
		system.attributes.defesa.condi = 0;
		system.attributes.nivel.xp.value = this.getCRExp(nd);

		if ( system.biography?.value ) {
			system.detalhes.biography.value += system.biography.value;
		}

		let baseFlags = { tormenta20: npcFlags };
		if( !foundry.utils.isEmpty(npcFlags) ) foundry.utils.mergeObject( flags, baseFlags );
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
	_prepareDefense(){
		const system = this.system;
		const rollData = this.getRollData();
		const defense = system.attributes.defesa;
		const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
		let parts = this.defenseFormula;
		let pda = 0;
		
		const items = this.items.filter( i => i.type == 'equipamento' && (equipmentSlots ? i.system.equipado2.slot : i.system.equipado));
		const armor = items.find( i => i.type == 'equipamento' && ['leve','pesada'].includes(i.system.tipo) && (equipmentSlots ? i.system.equipado2.slot : i.system.equipado));
		const shield = items.find( i => i.type == 'equipamento' && i.system.tipo == 'escudo' && (equipmentSlots ? i.system.equipado2.slot : i.system.equipado));
		const accessories = items.filter( i => i.type == 'equipamento' && !['escudo','leve','pesada'].includes(i.system.tipo) && (equipmentSlots ? i.system.equipado2.slot : i.system.equipado));
		
		// 
		let accDef = accessories.map( m => m.system.armadura.value ).reduce((sum, v) => sum + v, 0);
		let accPda = accessories.map( m => m.system.armadura.penalidade ).reduce((sum, v) => sum + v, 0);
		parts.push(accDef);
		pda += armor ? armor.system.armadura.penalidade : 0;
		pda += shield ? shield.system.armadura.penalidade : 0;
		pda += accPda ? accPda : 0;
		// console.warn( this.name, defense.bonus);
		parts.push(...defense.bonus);
		let maxAtr = armor ? armor.system.armadura.maxAtr : 0;
		let atributo = rollData[defense.atributo];
		if ( armor && armor.system.tipo == 'pesada' ) {
			atributo = Math.clamp(atributo, 0, maxAtr);
		}

		rollData['base'] = this.type == 'character' ? 10 : (defense.base || 10);
		rollData['atributo'] = defense.atributo ? atributo : 0;
		rollData['armadura'] = armor ? armor.system.armadura.value : 0;
		rollData['escudo'] = shield ? shield.system.armadura.value : 0;
		rollData['outros'] = defense.outros;
		rollData['condi'] = defense.condi;
		

		const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		
		system.attributes.defesa.value = parseInt(result);
		system.attributes.defesa.pda += -pda;
	}

	/* -------------------------------------------- */

	/**
	* Prepare skill value.
	* @private
	*/
	_prepareSkills(key, pericia, roll = false) {
		const system = this.system;
		// const pericia = system.pericias[key] || false;
		if ( key == 'ofic' ) return;
		
		const rollData = this.getRollData();
		let parts = this.skillFormula;
		
		pericia.label = pericia.label || CONFIG.T20.pericias[key] || '';
		pericia.pda = ["acro", "furt", "ladi"].includes(key) || Boolean(pericia.label.match(/\+/g));
		pericia.st = ["ades", 'atua', "conh", "guer", "joga", "ladi", "mist", "ocul", "nobr", "pilo", "reli"].includes(key) || Boolean(key.match(/ofi[1-9]/)) || Boolean(pericia.label.match(/\*/g));
		pericia.custom = Boolean(key.match(/ofi[1-9]|_pc[1-9]/));
		pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
		
		if ( this.type == 'npc' && ['fort','refl','vont','luta','pont'].includes(key)){
			parts = ['@outros','@condi'];
		}
		
		if ( !pericia.treinado ) parts = parts.filter( f => f != '@treino');
		if ( pericia.bonus.length ) parts.push(...pericia.bonus);
		if ( pericia.pda && rollData['pda'] ) parts.push("-@pda");
		if ( key == "furt" && rollData['tamanho'] ) parts.push("@tamanho");
		
		let atributo = rollData[pericia.atributo];
		rollData['atributo'] = atributo || 0;
		pericia.outros ? rollData['outros'] = pericia.outros : parts = parts.filter( f => f != '@outros');
		pericia.condi ? rollData['condi'] = pericia.condi : parts = parts.filter( f => f != '@condi');
		// GET GLOBAL ACTOR MODIFIERS
		const bonuses = foundry.utils.getProperty(system, "modificadores.pericias") || {};
		if (bonuses.geral.filter(Boolean).length) parts.push("@pericia");
		if (!["luta", "pont"].includes(key) && bonuses.semataque.filter(Boolean).length) parts.push("@semataque");
		if (["luta", "pont"].includes(key) && bonuses.ataque.filter(Boolean).length) parts.push("@ataque");
		if (["fort", "refl", "vont"].includes(key) && bonuses.resistencia.filter(Boolean).length) parts.push("@resistencia");
		if (bonuses.atr && bonuses.atr[pericia.atributo]?.filter(Boolean).length) parts.push(bonuses.atr[pericia.atributo]);
		
		if ( !roll ) {
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			pericia.value = parseInt(result.replace(" ","")) || 0;
		} else {
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			let dice = pericia.parts ? pericia.parts[0] : "1d20";
			if ( this.type == 'npc' ) return Roll.replaceFormulaData([dice, result].join('+'), rollData).split('+');
			return Roll.replaceFormulaData([dice, ...parts].join('+'), rollData).split('+');
			return [dice, ...parts]; //.concat(parts);
		}
	}



	/* -------------------------------------------- */
	
	_prepareResistances(system){
		const rollData = this.getRollData();
		for (const [key, res] of Object.entries( system.tracos.resistencias ) ) {
			let parts = [res.base, ...res.bonus];
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			system.tracos.resistencias[key].value = Number(result) == Number.prototype ? Number(result) : result ;
		}
	}

	/* -------------------------------------------- */

	/**
	* Compute the level and percentage of encumbrance for an Actor.
	* @param {Object} system			The data object for the Actor being rendered
	* @returns {{max: number, value: number, pct: number}}	An object describing the character's encumbrance level
	* @private
	*/
	_computeEncumbrance(system) {
		/* FLAGS */
		const flags = {}
		flags['organised'] = this.getFlag('tormenta20', 'inventarioOrganizado');

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
		if ( ["vehicle","simple"].includes(this.type) ){
			weight.encumbered = weight > (weight.max / 2);
			weight.pct = Math.clamp((weight.value * 100) / weight.max, 0, 100);
			return weight;
		}
		// Compute Encumbrance percentage
		const atr = system.atributos[weight.atributo].value;
		const parts = [weight.base, ...weight.bonus];
		const rollData = this.getRollData();
		// const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		const base = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		const limit = (Number(base) || 10) + ( atr > 0 ? atr * 2 : atr );
		weight.max = limit * 2;
		weight.encumbered = weight.value > limit;
		weight.pct = Math.clamp((weight.value * 100) / weight.max, 0, 100);
		return weight;
	}

	/* -------------------------------------------- */

	/**
	* Prepare HP and MP max value.
	* @private
	*/
	_preparePVPMTotal(){
		const resourcePV = this.system.attributes.pv;
		const resourcePM = this.system.attributes.pm;

		const nivel = Number( this.system.attributes.nivel.value );
		const con = this.system.atributos.con;

		const soma = {pv:0,pm:0};
		let lvlc = this.getFlag("tormenta20", "lvlconfig");
		if ( !lvlc || lvlc.manual ) return;
		
		for ( let classe of this.itemTypes.classe ) {
			let c = classe.system;
			let iniPV = c.inicial? c.pvPorNivel * 3 : 0;
			soma.pv += Number(iniPV) + (Number(c.niveis) * ( Number(c.pvPorNivel) + con.base + con.racial ));
			soma.pm += c.niveis * c.pmPorNivel;
		}
		if( lvlc.pvBonus[0] ) soma.pv += Number(lvlc.pvBonus[0]);
		if( lvlc.pvBonus[1] ) soma.pv += Math.floor(Number(lvlc.pvBonus[1]) * nivel);
		if( lvlc.pmBonus[0] ) soma.pm += Number(lvlc.pmBonus[0]);
		if( lvlc.pmBonus[1] ) soma.pm += Math.floor(Number(lvlc.pmBonus[1]) * nivel);
		for (let [atr, value] of Object.entries(lvlc.pv)){
			let abl = this.system.atributos[atr];
			if(value) soma.pv += Number(abl.base) + Number(abl.racial);
		}
		for (let [atr, value] of Object.entries(lvlc.pm)){
			let abl = this.system.atributos[atr];
			if(value) soma.pm += Number(abl.base) + Number(abl.racial);
		}

		resourcePV.min = (Math.floor(soma.pv/2)*-1);
		resourcePV.max = soma.pv;
		resourcePM.max = soma.pm;
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
		data["nivel"] =  Number(this.system.attributes?.nivel?.value || 1);
		data["meionivel"] = Math.floor(data["nivel"] / 2) || 0;
		if ( this.type == 'npc') {
			let nd = data.attributes.nd;
			const crData = T20.NPCParams(nd);
			data["ndtreinado"] = crData.topskill || 0;
			data["ndsemtreino"] = crData.botskill || 0;
		}
		// Set class level
		const classes = this.items.reduce(function (cn, it) {
			if (it.type === "classe") cn[it.name.slugify()] = it.system.niveis;
			return cn;
		}, {});
		data["nvl"] = classes;
		// Set power type modifiers (ie.: tormenta, distinction)
		const powers = {};
		this.items.map(m=>m.system.rolltags).flat().map(f=>f.capitalize()).forEach(f=>powers[f] = (powers[f] ?? 0) +1 );

		for (let [k, v] of Object.entries(powers)) {
			powers[k+'2'] = Math.floor( (powers[k] - 1) / 2);
			powers[k+'3'] = Math.floor( (powers[k] - 1) / 3);
			powers[k+'4'] = Math.floor( (powers[k] - 1) / 4);
		}
		foundry.utils.mergeObject(data, powers);

		// Set casting ability
		/* TODO CLASS SPELLBOOK */
		let atbchave = this.system.attributes.conjuracao || '';
		data["atributoChave"] = this.system.atributos[atbchave]?.value ?? 0;

		// Set defense bonuses modifiers
		let defMods = this.system.modificadores?.defesa || {};
		data["armadura"] = defMods.armadura || 0;
		data["armaduraLeve"] = defMods.armaduraLeve || 0;
		data["armaduraPesada"] = defMods.armaduraPesada || 0;
		data["escudo"] = defMods.escudo || 0;

		// Set skill bonuses modifiers
		let skillMods = this.system.modificadores?.pericias || {};
		const size = this.system.tracos.tamanho;
		const sizeMod = { "min": 5, "peq": 2, "med": 0, "gra":-2, "eno":-5, "col": -10 };
		
		data["treino"] = this.system.attributes?.treino || 0;
		data["tamanho"] = sizeMod[size];
		data["pda"] = this.system.attributes?.defesa.pda || 0;
		
		data["pericia"] = simplifyRollFormula(skillMods.geral?.filter(Boolean).join(' + '), data) || 0;
		data["semataque"] = simplifyRollFormula(skillMods.semataque?.filter(Boolean).join(' + '), data) || 0;
		data["ataque"] = simplifyRollFormula(skillMods.ataque?.filter(Boolean).join(' + '), data) || 0;
		data["resistencia"] = simplifyRollFormula(skillMods.resistencia?.filter(Boolean).join(' + '), data) || 0;
		
		// Set ability bonuses modifiers
		let ablMods = this.system.modificadores?.atributos || {};
		data["atributo"] = simplifyRollFormula(ablMods.geral?.filter(Boolean).join(' + '), data) || 0;
		data["fisicos"] = simplifyRollFormula(ablMods.fisicos?.filter(Boolean).join(' + '), data) || 0;
		data["mentais"] = simplifyRollFormula(ablMods.mentais?.filter(Boolean).join(' + '), data) || 0;

		// Set damage bonuses modifiers
		let dmgMods = this.system.modificadores?.dano || {};
		data["dano"] = simplifyRollFormula(dmgMods.geral?.filter(Boolean).join(' + '), data) || 0;
		data["danoMagico"] = simplifyRollFormula(dmgMods.mag?.filter(Boolean).join(' + '), data) || 0;
		data["danoCAC"] = simplifyRollFormula(dmgMods.cac?.filter(Boolean).join(' + '), data) || 0;
		data["danoAD"] = simplifyRollFormula(dmgMods.ad?.filter(Boolean).join(' + '), data) || 0;
		data["danoALQ"] = simplifyRollFormula(dmgMods.alq?.filter(Boolean).join(' + '), data) || 0;
		
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
	getCRExp(cr) {
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
		const attrs = ['attack','damage','defense','hp','dc','topsave','midsave','botsave', 'skills'];
		
		if( attr == 'all') {
			for ( let att of attrs ){
				updateData['system.builder.attributes.'+att+'.value'] = crData[att];
				updateData['system.builder.attributes.'+att+'.cr'] = cr;
			}
		} else if ( attr == 'skills' ) {
			updateData['system.builder.attributes.'+attr+'.value'] = crData['topskill'];
			updateData['system.builder.attributes.'+attr+'.cr'] = cr;
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
				// const skills = foundry.utils.mergeObject(this.system.pericias, {
				// 	defe: { value: 0, atributo: "des" },
				// 	ocul: { value: 0, atributo: "int" },
				// });
				// delete skills.mist;
				
				// this.update({ "system.pericias": skills });
				break;
			default:
				const updateData = {};
				if ( !this._stats || this._stats.systemVersion < '1.4.100' ){
					// UPDATE ABILITIES TO GOTY
					for (let [key, ability] of Object.entries(this._source.system.atributos)) {
						updateData[`system.atributos.${key}.base`] = Math.floor((ability.value - 10) / 2);
						updateData[`system.atributos.${key}.bonus`] = ability.bonus != 0 ? ability.bonus/2 : 0;
					}
					// UPDATE NPC DEFENSE TO GOTY
					if (this.type == 'npc') {
						updateData['system.attributes.defesa.base'] = 10 + this._source.system.attributes.defesa.outros;
						updateData['system.attributes.defesa.outros'] = 0;
					}
				}
				if (this.type == 'character') {
					updateData['prototypeToken.actorLink'] = true;
				}
				this.updateSource(updateData);
				break;
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		// console.log(foundry.utils.flattenObject(changed));
		await super._preUpdate(changed, options, user);
		// Apply changes in Actor size to Token width/height
		const newSize = foundry.utils.getProperty(changed, "system.tracos.tamanho");
		if (newSize && (newSize !== foundry.utils.getProperty(this.system, "tracos.tamanho"))) {
			let size = CONFIG.T20.tokenSizes[newSize];
			if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
				changed.prototypeToken = changed.prototypeToken || {};
				changed.prototypeToken.height = size;
				changed.prototypeToken.width = size;
			}
		}
		const sheetClass = foundry.utils.getProperty(changed, "flags.core.sheetClass");
		if( false && sheetClass && sheetClass == 'tormenta20.ActorSheetT20Builder' ){
			foundry.utils.setProperty(changed, 'flags.tormenta20.npcReform', true);
			const builder = foundry.utils.getProperty(this.system, "builder.attributes");
			if( !['0','1','2'].includes(builder.fort?.rank) ){
				foundry.utils.setProperty(changed, 'system.builder.attributes.fort.rank', '0');
			}
			if( !['0','1','2'].includes(builder.refl?.rank) ){
				foundry.utils.setProperty(changed, 'system.builder.attributes.refl.rank', '0');
			}
			if( !['0','1','2'].includes(builder.vont?.rank) ){
				foundry.utils.setProperty(changed, 'system.builder.attributes.vont.rank', '0');
			}
		}
		// NPC REFORM
		if ( false && this.type == 'npc' && this.getFlag('tormenta20','npcReform') ){
			// TODO MAY NEED REFACTORING
			let attributes = {};
			let skills = {};
			let cr = foundry.utils.getProperty(changed, 'system.attributes.nd');
			let defense = foundry.utils.getProperty(changed, 'system.builder.attributes.defense.value');
			let hp = foundry.utils.getProperty(changed, 'system.builder.attributes.hp.value');
			let mp = foundry.utils.getProperty(changed, 'system.builder.attributes.mp.value');
			let dc = foundry.utils.getProperty(changed, 'system.builder.attributes.dc.value');
			let fort = foundry.utils.getProperty(changed, 'system.builder.attributes.fort.value');
			let refl = foundry.utils.getProperty(changed, 'system.builder.attributes.refl.value');
			let vont = foundry.utils.getProperty(changed, 'system.builder.attributes.vont.value');

			let _cr = foundry.utils.getProperty(changed, 'system.attributes.nivel.value');
			let _defense = foundry.utils.getProperty(changed, 'system.attributes.defesa.base');
			let _hp = foundry.utils.getProperty(changed, 'system.attributes.pv.max');
			let _mp = foundry.utils.getProperty(changed, 'system.attributes.pm.max');
			let _dc = foundry.utils.getProperty(changed, 'system.attributes.dc');
			let _fort = foundry.utils.getProperty(changed, 'system.pericias.fort.outros');
			let _refl = foundry.utils.getProperty(changed, 'system.pericias.refl.outros');
			let _vont = foundry.utils.getProperty(changed, 'system.pericias.vont.outros');
			if ( cr && (cr != foundry.utils.getProperty(this.system, _cr)) ){
				attributes.nivel = {value: cr};
			}
			if ( defense && (defense != foundry.utils.getProperty(this.system, _defense)) ){
				attributes.defesa = {base: defense};
			}
			if ( hp && (hp != foundry.utils.getProperty(this.system, _hp)) ){
				attributes.pv = {max: hp};
			}
			if ( mp && (mp != foundry.utils.getProperty(this.system, _mp)) ){
				attributes.pm = {max: mp};
			}
			if ( dc && (dc != foundry.utils.getProperty(this.system, _dc)) ){
				attributes.cd = dc;
			}
			if ( fort && (fort != foundry.utils.getProperty(this.system, _fort)) ){
				skills.fort = {outros: fort};
			}
			if ( refl && (refl != foundry.utils.getProperty(this.system, _refl)) ){
				skills.refl = {outros: refl};
			}
			if ( vont && (vont != foundry.utils.getProperty(this.system, _vont)) ){
				skills.vont = {outros: vont};
			}
			if (!foundry.utils.isEmpty(attributes)) changed.system.attributes = attributes;
			if (!foundry.utils.isEmpty(skills)) changed.system.pericias = skills;
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, userId){
		super._onUpdate(changed, options, userId);
		/* Check Encumbered Status and Add/Remove its ActiveEffect */
		if ( this.type=="character" ) {
			if( game.userId !== userId ) return;
			const ef = this.effects.find( ef => ef.statuses.has("sobrecarregado"));
			const wasEncumbered = Boolean(ef);
			const isEncumbered = this.system.attributes?.carga?.encumbered;
			if ( isEncumbered != wasEncumbered ) {
				if ( isEncumbered && !ef ) {
					this.createEmbeddedDocuments('ActiveEffect', [T20.conditions['sobrecarregado']]);
				} else if( !isEncumbered && ef ) {
					this.deleteEmbeddedDocuments('ActiveEffect', [ef._id]);
				}
			}
		}
	}
	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
		
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreateDescendantDocuments(parent, collection, data, options, userId){
		await super._preCreateDescendantDocuments(parent, collection, data, options, userId);
		if( game.userId !== userId ) return;
		// Show chat message if condition;
		options.toChat = options.toChat === undefined ? true : options.toChat;
		if(collection == "effects" && options.toChat){
			const showCard = game.settings.get("tormenta20", "showStatusCards");
			const effect = data.find(doc => doc.statuses.length );
			if(showCard && effect){
				game.tormenta20.macros.msgFromJournal(effect.name, "tormenta20.basico", 'Condições');
			}
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onCreateDescendantDocuments(parent, collection, documents, data, options, userId){
		await super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);

		if( collection == "effect" ){
			let effs = documents.filter(ef => ef.changes.find( ch => ch.key.match(/^\?/) ) );
			let choices = [];
			for ( let ef of effs ){
				let changes = ef.changes.filter( ch => ch.key.match(/^\?/) );
				let choice = {};
				for ( let ch of changes ){
					choice.id = ef.id;
					choice.label = ef.name;
					choice.key = ch.key.split('.');
					choice.value = ch.value.split('.');
					choices.push(choice);
				}
			}
			if ( !foundry.utils.isEmpty(choices) && (userId == game.userId) ) {
				let chosen = await ChoicesDialog.create( choices, this );
				chosen = foundry.utils.expandObject(chosen);
				for ( let [ id, c] of Object.entries(chosen) ){
					let ef = this.effects.find( e => e.id == id );
					for ( let [ key, value ] of Object.entries(c) ){
						ef.setFlag('tormenta20', key, value);
					}
				}
			}
		}
	}


	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if (attribute === "attributes.pv" || attribute === "attributes.pm") {
			const hp = foundry.utils.getProperty(this.system, attribute);
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
		applyRD = true;
		const pv = this.system.attributes.pv;
		const pm = this.system.attributes.pm;
		const rds = this.system.tracos?.resistencias;
		const rdsEx = Object.entries(rds).filter(i => i[1].excecao ).reduce((acc, d) => (acc[d[0]]= d[1].excecao,acc),{});

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
			damage: 0 - (rds.dano?.value ? rds.dano.value : 0),
			total: 0,
			tempHP: 0,
			mana: 0,
			tempMP: 0
		};
		
		for ( let [type, dmg] of Object.entries(damage) ){
			if ( type == 'curapv' || type == 'perda') {
				final.damage = 0;
				final.damage += dmg.value;
			} else if ( type == 'curatpv' ) {
				final.damage = 0;
				final.tempHP += dmg.value;
			} else if ( type == 'curapm' ) {
				final.damage = 0;
				final.mana += dmg.value;
			} else if ( type == 'curatpm' ) {
				final.damage = 0;
				final.tempMP += dmg.value;
			} else {
				let r = 0;
				if( applyRD && type == 'dano' ){
					// r = Number( rds[type]?.value ?? 0 );
				} else if( applyRD ) {
					// OLD: Number(rds.dano?.value ?? 0) +
					// Somava RD do tipo 'dano' a todos os tipos;
					r = Number( rds[type]?.value ?? 0 );
				}
				if( applyRD && !foundry.utils.isEmpty(rdsEx) && !rdsEx[type] ) {
					r += Number(Object.values(rdsEx)[0]);
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
		// Apply the multiplier
		final.damage = Math.floor(final.damage * multiplier);
		final.total = Math.floor(final.total * multiplier);
		final.tempHP = Math.floor(final.tempHP * multiplier);
		final.mana = Math.floor(final.mana * multiplier);
		final.tempMP = Math.floor(final.tempMP * multiplier);
		
		// Deduct value from temp attr first
		const tmpHP = parseInt(pv.temp) || 0;
		const tmpMP = parseInt(pm.temp) || 0;
		const hpt = final.damage > 0 ? Math.min(tmpHP, final.damage) : 0;
		const mpt = final.damage > 0 ? Math.min(tmpMP, final.mana) : 0;
		// Remaining goes to attr
		const dhp = Math.clamp(pv.value - (final.damage - hpt), pv.min, pv.max);
		const dmp = Math.clamp(pm.value - (final.mana - mpt), pm.min, pm.max);

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
		const dh = Math.clamp(pv.value - (amount - dt), pv.min, pv.max);

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
			spendMana = Math.clamp(pm.value + newSptAmount, 0, pm.max);
			chatMessage = `<i class="fas fa-user-plus"></i> +${newSptAmount} PM`;
		} else {
			amount = Math.floor(parseInt(amount) + adjust);
			newSptAmount = amount;
			// Deduct damage from temp Mana first
			tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;
			chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} PMs`;
			// Remove Mana
			spendMana = Math.clamp(pm.value - (newSptAmount - tmpPMspend), 0, pm.max);
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
		const cloneActor = await this.clone({name: `${this.name} (Temp)`},
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
		itemData = foundry.utils.mergeObject( itemData, pericia);
		let parts = cloneActor._prepareSkills(key, pericia, true );
		parts = parts.map(i => typeof i === "string" ? i.replace(/^\+/, "") : i );
		itemData.parts = parts.filter(Boolean);
		let needsConfiguration;
		if ( game.settings.get('tormenta20','invertUsageConfig') ) {
			needsConfiguration = !(options.event?.shiftKey ?? false);
		} else {
			needsConfiguration = (options.event?.shiftKey ?? false);
		}
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = foundry.utils.mergeObject(rConfig, configuration);

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
		const rollConfig = foundry.utils.mergeObject({
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
			if ( !foundry.utils.isEmpty(manaUpdate) ) {
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
		const bonuses = foundry.utils.getProperty(this.system, "modificadores.atributos") || {};
		if (bonuses.geral.filter(Boolean).length) parts.push("@atributo");
		if (["for", "des", "con"].includes(key) && bonuses.fisicos.filter(Boolean).length) parts.push("@fisicos");
		if (["int", "sab", "car"].includes(key) && bonuses.mentais.filter(Boolean).length) parts.push("@mentais");
		if (Object.keys(bonuses).includes(key) && bonuses[key].filter(Boolean).length) parts.push(bonuses[key]);

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
		let needsConfiguration;
		if ( game.settings.get('tormenta20','invertUsageConfig') ) {
			needsConfiguration = !(options.event?.shiftKey ?? false);
		} else {
			needsConfiguration = (options.event?.shiftKey ?? false);
		}
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create(itemData);
			if (!configuration) return;
			rConfig = foundry.utils.mergeObject(rConfig, configuration);
			
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
		const rollConfig = foundry.utils.mergeObject({
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
			if ( !foundry.utils.isEmpty(manaUpdate) ) {
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

	/** @inheritDoc */
	applyActiveEffects() {
		this.effects.forEach(e => e.determineSuppression());
		return super.applyActiveEffects();
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