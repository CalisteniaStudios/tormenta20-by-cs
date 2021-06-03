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

		// Iterate over owned items and recompute attributes that depend on prepared actor data
		this.items.forEach(item => item.prepareFinalAttributes());
	}

	/* -------------------------------------------- */

	/** @override */
	prepareBaseData() {
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
		const actor = this;
		const actorData = this.data;
		const data = actorData.data;
		const nivel = data.attributes.nivel.value;
		// Base CD
		data.attributes.cd = 10 + Math.floor(nivel / 2);
		console.log(actor);
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
		// actorData.data.detalhes.carga = this._computeEncumbrance(actorData, carga);
		// Cache labels
		// this.labels["creatureType"];

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
		const data = super.getRollData();
		for (let abl in data.atributos) {
			data[abl] = data.atributos[abl].mod
		}

		const classes = this.items.reduce(function (cn, it) {
			if (it.type === "classe") cn[it.name.slugify()] = it.data.data.niveis;
			return cn;
		}, {});

		data["nivel"] = this.data.data.attributes.nivel.value;
		data["meionivel"] = Math.floor(this.data.data.attributes.nivel.value / 2);
		data["nvl"] = classes;
		data["atributoChave"] = this.data.data.attributes.conjuracao;
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
		/* TODO IMPLEMENT GET FROM ITEM */

		const classes = [];
		const nivel = this.items.reduce((arr, item) => {
			if (item.type === "classe") {
				const classLevels = parseInt(item.data.data.niveis) || 1;
				arr += classLevels;
				classes.push(item.name + " " + item.data.data.niveis);
			}
			return arr;
		}, 0);
		data.attributes.nivel.value = nivel;
		console.log(nivel);
		console.log(classes);
		// Experience required for next level
		data.attributes.treino = (nivel > 14 ? 6 : (nivel > 6 ? 4 : 2));
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

		// Experience Reward
		let nd = data.attributes.nd;
		data.details.xp.value = Number(nd) * 1000 || (["1/2", "1/3", "1/4", "1/6", "1/8"].includes(nd) ? 100 * Number(nd.split("/")[1]) : 0);

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
		
		if (data.attributes.defesa == undefined) {
			data.attributes.defesa = {
				value: 0,
				pda: 0
			}
		}
		let parts = ["10"];
		let pda = 0;
		let atributo = data.attributes.defesa.atributo || "des";
		let mod = data.atributos[atributo].mod;
		let maxAbl = false;
		
		// Defense Calculation
		for (let item of actorData.items ) {
			if (item.type == "equipamento" && item.data.data.equipado) {
				let tipo = item.data.data.tipo;
				let def = item.data.data.armadura.value;
				let penalidade = item.data.data.armadura.penalidade;
				let maxAtr = item.data.data.armadura.maxAtr
				if (tipo == "leve" || tipo == "pesada") {
					// armadura = tipo;
					if(Number(data.attributes.defesa.armadura)){
						def += data.attributes.defesa.armadura;
					}
					maxAbl = Number(maxAtr) ? Number(maxAtr) : false;
					parts.push( def );
				} else if (tipo == "escudo") {
					// escudo = true;
					if(Number(data.attributes.defesa.armadura)){
						def += data.attributes.defesa.armadura;
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
		parts.push(data.attributes.defesa.condi || 0);
		
		/**/
		console.log(parts);
		
		const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
		console.error("DEFESA");
		console.log(result);
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
		// Vizahell
		if (true) {
			pericia.pda = ["acro", "furt", "ladi"].includes(key);
			pericia.st = ["ades", "conh", "guer", "joga", "ladi", "mist", "ocul", "nobr", "pilo", "reli"].includes(key);
		} else {
			pericia.nome = pericia.label.replace(/[\*\+]/g, "").trim();
			pericia.st = pericia.label.match(/\*/g) ? true : false;
			pericia.pda = pericia.label.match(/\+/g) ? true : false;
		}

		var atributo = pericia.atributo;
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
		
		if ( !roll ) {
			const result = simplifyRollFormula(parts.join('+'), rollData, { constantFirst: true }).trim();
			pericia.value = parseInt(result) || 0;
		} else return ["1d20"].concat(parts);

	}

	/* -------------------------------------------- */

	_calcPVPM() {
		const updateData = {};
		const nivel = Number( this.data.data.attributes.nivel.value );
		const con = this.data.data.atributos.con.mod;
		const soma = {pv:0,pm:0};
		let lvlconfig = this.getFlag("tormenta20", "lvlconfig");
		if ( !lvlconfig ){
			lvlconfig = {
				pv: { for: false, des: false, int: false, sab: false, car: false },
				pm: { for: false, des: false, con: false, int: false, sab: false, car: false },
				pvBonus: ["0","0"],
				pmBonus: ["0","0"]
			}
			this.setFlag("tormenta20", "lvlconfig", lvlconfig);
		}
		
		for ( let classe of this.itemTypes.classe ) {
			let c = classe.data.data;
			let iniPV = c.primary? c.pvPorNivel * 3 : 0;
			soma.pv += Number(iniPV) + (Number(c.niveis) * ( Number(c.pvPorNivel) + con ));
			soma.pm += c.niveis * c.pmPorNivel;
		}
		if( lvlconfig.pvBonus[0] ) soma.pv += Number(lvlconfig.pvBonus[0]);
		if( lvlconfig.pvBonus[1] ) soma.pv += Number(lvlconfig.pvBonus[1].replace(",",".")) * nivel;
		if( lvlconfig.pmBonus[0] ) soma.pm += Number(lvlconfig.pmBonus[0]);
		if( lvlconfig.pmBonus[1] ) soma.pm += Number(lvlconfig.pmBonus[1].replace(",",".")) * nivel;
		for (let [atr, value] of Object.entries(lvlconfig.pv)){
			if(value) soma.pv += Number(this.data.data.atributos[atr].mod);
		}
		for (let [atr, value] of Object.entries(lvlconfig.pm)){
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
			const q = i.data.data.quantidade || 0;
			const w = i.data.data.peso || 0;
			return weight + (q * w);
		}, 0);

		// Compute Encumbrance percentage
		weight = weight.toNearest(0.1);
		const max = actorData.data.atributos.for.value * 10;
		const pct = Math.clamped((weight * 100) / max, 0, 100);
		return { "value": weight.toNearest(0.1), "pct": pct };
		// return { value: weight.toNearest(0.1), max, pct, encumbered: pct > (2/3) };
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
				console.log(data);
				console.log(this);
				break;
		}

		// Token size category
		const size = CONFIG.T20.tokenSizes[this.data.data.tracos.tamanho || "med"];
		this.data.token.update({ width: size, height: size });

		// Player character prototype token
		if (this.type === "character") {
			this.data.token.update({ vision: true, actorLink: true, disposition: 1 });
		}

		// TODO default token settings
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

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */

	/** @override */
	async modifyTokenAttribute(attribute, value, isDelta, isBar) {
		if (attribute === "attributes.pv" || attribute === "attributes.pm") {
			const hp = getProperty(this.data.data, attribute);
			const delta = isDelta ? (-1 * value) : (hp.value + hp.temp) - value;
			return this.applyDamage(delta);
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
	async applyDamage(amount = 0, multiplier = 1) {
		amount = Math.floor(parseInt(amount) * multiplier);
		const pv = this.data.data.attributes.pv;

		// Prepare Damage Reduction if damage
		const rd = this.data.data.tracos.rd.value;
		amount = amount > 0 ? Math.max(amount - rd, 0) : amount;

		// Deduct damage from temp HP first
		const tmp = parseInt(pv.temp) || 0;
		const dt = amount > 0 ? Math.min(tmp, amount) : 0;

		// Remaining goes to health
		const dh = Math.clamped(pv.value - (amount - dt), 0, pv.max);

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
			isBar: true
		}, updates);
		return allowed !== false ? this.update(updates) : this;

		let toChat = (speaker, message) => {
			let chatData = {
				user: game.user.id,
				content: message,
				speaker: ChatMessage.getSpeaker(speaker),
				type: CONST.CHAT_MESSAGE_TYPES.OTHER,
			};
			ChatMessage.create(chatData, {});
		};
		chatMessage = `<i class="fas fa-user-plus"></i> +${newDmgAmount} pontos PV`;
		chatMessage = `<i class="fas fa-user-minus"></i> ${newDmgAmount} pontos PV`;

		if (totalRd > 0) {
			chatMessage += `<br/>(${amount} - RD${totalRd})`;
		}
		//toChat(this, chatMessage);

	}

	/* -------------------------------------------- */

	applyAprimoramentos(item, configuration=null){
		if( !configuration ) return {};
		const C = CONFIG.T20, actor = this, ad = actor.data.data;
		let changes = [], options = {};
		options.aprimoramentos = [];
		let temCusto = false;
		item.custo = 0;
		console.log(item);

		// Aprimoramentos Aplicados
		const aplicados = expandObject(configuration).aprs;
		const aprimoramentos = this.effects.filter(ef => aplicados[ef.id]?.aplica );
		// const aprimoramentos = this.aprimoramentosValidos.filter(ef => aplicados[ef.id]?.aplica );

		// FUNÇÃO DE INTERNA
		const applyChanges = (ch,qtd,ef) => {
			const campos = {
				atributo:			["atributo", null],
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
					console.error("ADD 10");
					console.log(r);
					if(item.type == "pericia"){
						_campos.outros = item.outros? 
											item.outros + "+"+ (Number(ch.value * qtd) || ch.value)
											:	(Number(ch.value * qtd) || ch.value);
						// r.parts.push( Number(ch.value * qtd) || ch.value );
					} else r.parts.push( Number(ch.value * qtd) || ch.value )
					console.log(r.parts);
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
						console.error(Number(temp)* (Number(ch.value)*qtd));
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
					if(campos[ch.key]) _campos[campos[ch.key][0]] = ch.value;
				}
				// TODO test
			}
			foundry.utils.mergeObject(item, expandObject(_campos));
			console.log(item);
			console.log(_campos);
			
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
		console.log(item.parts);
		if(item.type == "pericia"){
			item.parts = this._prepareSkills(item.id, item, ad, this.getRollData(), true );
		}
		console.log(item.parts);
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
		let consumeMana = 0;
		let rollMode;
		let itemData = {
			name: pericia.label,
			type: "pericia",
			parts: []
		}
		let parts = this._prepareSkills(key, pericia, ad, this.getRollData(), true );
		parts = parts.map(i => typeof i === "string" ? i.replace(/^\+/, "") : i );
		itemData.parts = parts.filter(Boolean);
		console.log(itemData);

		const needsConfiguration = options.event.shiftKey;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create({
				actor: actor, type:"pericia", data: pericia, id: key, isOwned: true,
				name: pericia.label.replace(/[\*||\+]/g,"").trim()
			});
			if (!configuration) return;
			
			console.log(configuration);
			rollMode = configuration.rollMode;
			options = this.applyAprimoramentos( mergeObject(pericia, itemData), configuration);
			console.log(pericia);
		} else {
			// aways active
		}

		// Compose roll options
		const rollConfig = mergeObject({
			parts: options.itemData.parts.map(i => typeof i === "string" ? i.replace(/^\+| /, "") : i ).filter(Boolean),
			actor: actor,
			data: this.getRollData(),
			title: pericia.label,
			flavor: pericia.label
		}, options);

		options.itemData.rolled = await d20Roll(rollConfig);
		
		// LOGS
		console.log(rollConfig);
		return this.displayCard({ options, rollMode});
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
		let rollMode;

		// Construct parts
		const parts = ["@mod"];
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
		const needsConfiguration = options.event.shiftKey;
		let configuration = {};
		if( needsConfiguration ){
			configuration = await AbilityUseDialog.create({
				actor: actor, type:"atributo", data: abl, id: key, isOwned: true,
				name: abl.label.replace(/[\*||\+]/g,"").trim()
			});
			if (!configuration) return;
			
			console.log(configuration);
			rollMode = configuration.rollMode;
			options = this.applyAprimoramentos( mergeObject(abl, itemData), configuration);
			console.log(abl);
		} else {
			// aways active
		}
		// Roll and return
		const rollConfig = mergeObject({
			parts: parts.filter(Boolean),
			data: data,
			title: game.i18n.format("T20.AbilityPromptTitle", { atributo: label }),
			flavor: "Teste de Atributo",
			messageData: { "flags.tormenta20.roll": { type: "ability", key } }
		}, options);
		
		// return d20Roll(rollData);
		options.itemData.rolled = await d20Roll(rollConfig);
		
		// LOGS
		console.log(rollConfig);
		return this.displayCard({ options, rollMode});
	}

	/* -------------------------------------------- */

	// TODO create rest function?

	/* -------------------------------------------- */

	//static formatCreatureType(typeData) {

	/* -------------------------------------------- */

	// TODO death saves for skyfall?

	/* -------------------------------------------- */

	/* -------------------------------------------- */
	/*	DEPRECATED METHODS													*/
	/* -------------------------------------------- */


	/* -------------------------------------------- */

	/** @override */
	/*/
	async update(data, options={}) {
		
		// Get size and scale token

		return super.update(data, options={});
	}
	/**/

	/** @override */
	/*
	*	Methods for precreate owned item
	*/
	/** @override */
	/*/
	async createEmbeddedEntity(embeddedName, itemData, options={}) {
		let isCondition = false;
		if(embeddedName === "ActiveEffect"){
			isCondition = flattenObject(itemData)["flags.core.statusId"] ?? false;
			if( isCondition && flattenObject(itemData)["flags.core.statusId"].match(/combat-utility-belt/) ){
				isCondition = false;
			}
		}
		// const isCondition = (embeddedName === "ActiveEffect")? flattenObject(itemData)["flags.core.statusId"] ?? false : false;
		if (isCondition) await this.createCondition(isCondition, itemData, options);
		// Standard embedded entity creation
		else  super.createEmbeddedEntity(embeddedName, itemData, options);
	}
	/**/

	/**
	* Manage condition applying rules;
	* 
	* @param {string} condition			statusId from Status Effect
	* @param {Object} itemData			StatusEffect object
	*/
	/*/
	async createCondition(condition, itemData, options={}){
		let ignore = false;
		let createArr = [T20Conditions[condition]];
		for(let i=0; i<createArr.length; i++){
			let conditions = this.effects.filter(ef => ef.getFlag('core','statusId'));
			let exist = conditions.find(ef => ef.getFlag('core','statusId') == createArr[i].flags.core.statusId);
			if(exist){
				if(createArr[i].flags?.t20?.stack){
					await this.deleteEmbeddedEntity("ActiveEffect", exist.id);
					let evo = T20Conditions[createArr[i].flags.t20.stack];
					createArr.pop();
					i--;
					createArr.push(evo);
				} else {
					createArr.pop();
					i--;
				}
			} else {
				createArr[i].flags?.t20?.childEffect?.forEach(ce => createArr.push(T20Conditions[ce]) );
			}
		}
		if(createArr){
			await super.createEmbeddedEntity("ActiveEffect", createArr, options);
		}
	}
	/**/

	/** @deprecated now is item.delete() ? */
	/*/
	async deleteEmbeddedEntity(embeddedName, itemData, options={}) {
		const isCondition = ( embeddedName === "ActiveEffect" && this.effects.get(itemData)?.data?.flags?.core?.statusId ) ? true : false;
		if (isCondition) await this.deleteCondition(itemData, options);
		// Standard embedded entity creation
		else  super.deleteEmbeddedEntity(embeddedName, itemData, options);
	}
	/**/

	/**
	* Manage condition removing rules;
	* @deprecated now is item.delete()
	* @param {Object} itemData			StatusEffect id
	*/
	/*/
	async deleteCondition(itemData, options={}){
		let childrenConditions = [];
		// get all child conditions this actor show have ie [weak, shaken, weak, prone]
		const conditions = this.effects.filter(function(ef){
			if(ef.getFlag('core','statusId')){
				if(ef.data.flags.t20?.childEffect)
					childrenConditions = childrenConditions.concat(ef.data.flags.t20.childEffect);
				return ef;
			}
		});

		// this condition children to be removed ie [weak]
		const condition = conditions.find(c=> c.id === itemData);
		let ids = [condition.id];
		if(condition){
			let ar = condition.data.flags.t20?.childEffect ?? [];
			for(let i=0; i < ar.length; i++){
				let child = conditions.find(c=> c.data.flags.core?.statusId === ar[i]);
				if(child){
					let amount = childrenConditions.filter(c=> c===child.data.flags.core.statusId).length;
					if(amount == 1) ids.push(child.id);
					if(child.data.flags.t20?.childEffect){
						child.data.flags.t20?.childEffect.forEach(ch=>ar.push(ch));
					}
				}
			}
		}
		await super.deleteEmbeddedEntity("ActiveEffect", ids, options);
	}
	/**/

	/** @overrides */
	applyActiveEffects() {
		const overrides = {};
		// Vizahell
		// Organize non-disabled effects by their application priority
		const changes = this.effects.reduce((changes, e) => {
			if (e.data.disabled || e.data?.flags?.t20?.onuse) return changes;
			return changes.concat(e.data.changes.map(c => {
				c = duplicate(c);
				if (c.key.match(/(data.)(.*)(.temp|.outros|.outro|.bonus|.value)|data.modificadores/i) && c.mode === 2 && !c.value.toString().match(/^[+|-][\d+|@\w+]/i)) {
					c.value = "+" + c.value.toString();
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
		this.overrides = expandObject(overrides);
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
			chatMessage = `<i class="fas fa-recover-mana"></i> +${newSptAmount} pontos PM`;
		} else {
			amount = Math.floor(parseInt(amount) + adjust);
			newSptAmount = amount;

			// Deduct damage from temp Mana first

			tmpPMspend = newSptAmount > 0 ? Math.min(tmpPM, newSptAmount) : 0;

			chatMessage = `<i class="fas fa-user-minus"></i> ${newSptAmount} pontos PM`;

			// Remaining goes to health
			spendMana = Math.clamped(
				pm.value - (newSptAmount - tmpPMspend),
				0,
				pm.max
			);
		}
		toChat(this, chatMessage);
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
			flags: {"core.canPopout": true, "tormenta20.aprimoramentos": options.aprimoramentos}
		};

		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));

		if (game?.dice3d?.show) {
			let wd = {
				whisper: (["gmroll", "blindroll"].includes(rollMode) ? ChatMessage.getWhisperRecipients("GM") 
					: (rollMode === "selfroll" ? [game.user._id] : null)),
				blind: rollMode === "blindroll"
			}
			for (const roll of options.rolls){
				game.dice3d.showForRoll(roll, game.user, true, wd.whisper, wd.blind)
			}
		}
		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}
}
