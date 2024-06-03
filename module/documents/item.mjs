// import { T20 } from '../config.mjs';
import { simplifyRollFormula, d20Roll, damageRoll } from '../dice/dice.mjs';
import AbilityUseDialog from "../apps/ability-use-dialog.mjs";
import {applyOnUseEffects} from "../apps/ability-use.mjs";
import AbilityTemplate from "../pixi/ability-template.mjs";
import { itemMigration } from './migrations.mjs';

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemT20 extends Item {

	/** @inheritdoc */
	static migrateData(data) {
		const start = foundry.utils.deepClone(data);
		itemMigration.migrateDuration(data);
		itemMigration.migrateEquipStatus(data);
		itemMigration.migrateProficiencyTypes(data);
		itemMigration.migratePurposeTypes(data);
		itemMigration.migrateWieldTypes(data);
		itemMigration.migrateEquipAugments(data);
		itemMigration.migrateEquipSlot(data);
		itemMigration.migrateRollTags(data);

		if( !foundry.utils.isEmpty( foundry.utils.diffObject(start, data) ) ) {
			foundry.utils.setProperty(data,'flags.tormenta20.needCommit', true);
		}
		return super.migrateData(data);
	}
	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */
	
	/**
	 * Does the Item implement a attack roll as part of its usage
	 * @type {boolean}
	 */
	get hasAttack() {
		return !!this.system.rolls.find(r=>r.type=="ataque");
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a damage roll as part of its usage
	 * @type {boolean}
	 */
	get hasDamage() {
		return !!this.system.rolls.find(r=>r.type=="dano");
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a versatile damage roll as part of its usage
	 * @type {boolean}
	 */
	get isVersatile() {
		return !!(this.hasDamage && this.system.propriedades.ada);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item implement a saving throw as part of its usage
	 * @type {boolean}
	 */
	get hasSave() {
		const resistencia = this.system?.resistencia || {};
		return !!(resistencia.atributo && resistencia.value);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have a target
	 * @type {boolean}
	 */
	get hasTarget() {
		const target = this.system.target;
		return target && !["none",""].includes(target.type);
	}

	/* -------------------------------------------- */

	/**
	 * Does the Item have an area of effect target
	 * @type {boolean}
	 */
	get hasAreaTarget() {
		const target = this.system.area;
		return target? true : false;
	}

	/* -------------------------------------------- */

	/**
	 * Provide an object which organizes all augmenting ActiveEffects by their type
	 * @type {Object<documents.ActiveEffect[]>}
	 */
	get validOnUseEffects() {
		if( !this.isOwned ) return [];
		const type = this.type;
		const name = this.name;
		let effects = [];

		const types = {magia:"spell",arma:"attack",pericia:"skill",atributo:"ability",consumivel:"consumable",poder:"power",equipamento:"equipment"};

		for ( let i of this.effects.values() ) {
			if( !i.getFlag("tormenta20","onuse") ) continue;
			if( i.getFlag("tormenta20", "self") ) effects.push(i);
		}
		
		for ( let i of this.actor.effects.values() ) {
			if( !i.getFlag("tormenta20","onuse") ) continue;
			let items = i.getFlag("tormenta20", 'items');
			if( i.getFlag("tormenta20", types[type]) ){
				effects.push(i);
			} else if( items && items.match(name) >=0 ) effects.push(i);
		}

		return effects;
	}

	/**
	 * Should this item's active effects be suppressed.
	 * @type {boolean}
	 */
	get areEffectsSuppressed() {
		const requireEquipped = ["arma", "equipamento"].includes(this.type);
		const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
		if ( !requireEquipped ) return false;
		if ( equipmentSlots && this.system.equipado2.slot == 0 ) return true;
		else if ( !equipmentSlots && (this.system.equipado === false || this.system.equipado == 0) ) return true;
		return false;
	}
	
	/* -------------------------------------------- */
	/*  DataPreparation                             */
	/* -------------------------------------------- */

	prepareBaseData() {
		super.prepareBaseData();

		if ( this.type === "equipamento" && this.parent?.type !== "character" ) {
			this.system.equipado = false;
		}
		// 
		if ( game.settings.get("tormenta20", "equipmentSlots") ) {
			if ( this.type === "equipamento" && this.parent?.type == "character" ) {
				this.system.equipado = false;
			}
			if ( this.type === "arma" && this.parent?.type == "character" ) {
				this.system.equipado = 0;
			}
			if ( this.parent?.type == "character" && this.system.equipado && this.system.equipado2.slot == 0 ) {
				const equip2 = this.system.equipado2;
				if ( this.system.equipado2.type=='hand' && this.system.equipado == 2 ) {
					this.system.equipado2.slot = 12.1;
				} else {
					let equips = this.actor.items.filter( it => it.system.equipado && it.system.equipado2.type == equip2.type );
					let limite = equip2.type == 'hand' ? 'limiteEmpunhado' : 'limiteVestido';
					equips = equips.map( it => it.id );
					this.system.equipado2.slot = ( equip2.type == 'hand' ? 1.1 : 1.2) + Math.min( equips.indexOf(this.id), this.actor.system.equipamentos[limite] );
				}
			}
		}

		/* FIX item description issues */
		if ( typeof this.system.description === 'string' || this.system.description instanceof String ) {
			this.system.description = {value: this.system.description};
		}
	}
	/**
	* Augment the basic Item data model with additional dynamic system.
	*/
	prepareDerivedData() {
		const system = this.system;
		const C = CONFIG.T20;
		const labels = this.labels = {};
		const gameSystem = game.settings.get("tormenta20", "gameSystem");
		
		// Classes
		if ( this.type === "classe" ) {
			// TODO Skyfall Class/Archetype
			let maxLvl = gameSystem == "Skyfall" ? 10 : 20;
			system.niveis = Math.clamp(system.niveis, 1, maxLvl);
		}
		// Weapons
		else if ( this.type === "arma" ) {
			labels.critico = `${system.criticoM}/${system.criticoX}x`
			let rollAttack = this.system.rolls.find( r => r.type == 'ataque' );
			let rollDamage = this.system.rolls.find( r => r.type == 'dano' );
			
			if ( this.isEmbedded && this.parent.type == 'npc'){ //TODO ERRO
				if(rollAttack) labels.npcattack = rollAttack?.parts[2][0] ?? '';
				if(rollDamage) labels.npcdamage = rollDamage?.parts[0][0] ?? '';//
			}
		}
		// Spells
		else if ( this.type === "magia" ) {
			labels.tipo = T20.spellType[system.tipo];
			labels.nivel = game.i18n.format("T20.SpellLevel", {lvl:system.circulo});
			labels.escola = T20.spellSchools[system.escola];
			// PRELOCALIZED
			// labels.tipo = game.i18n.localize(T20.spellType[system.tipo]);
			// labels.nivel = game.i18n.format("T20.SpellLevel", {lvl:system.circulo});
			// labels.escola = game.i18n.localize(T20.spellSchools[system.escola]);
			labels.materiais = system.meteriais?.value ?? null;
		}
		// Power
		else if ( this.type === "poder" ){
			labels.tipo = T20.powerType[system.tipo];
			// PRELOCALIZED
			// labels.tipo = game.i18n.localize(T20.powerType[system.tipo]);
			labels.subtipo = system.subtipo;
		}
		// Equipment
		else if ( this.type === "equipamento"){
			labels.armadura = system.armadura.valor ? `${system.armadura.valor} ${game.i18n.localize("T20.Defesa")}` : "";
		}

		// Activation
		if ( system.hasOwnProperty("ativacao") ) {
			let act = system.ativacao || {};
			if ( ['minute','hour','day'].includes(act.execucao) ) {
				labels.ativacao = [act.qtd, T20.abilityActivationTypes[act.execucao]].join(" ");
				// PRELOCALIZED
				// labels.ativacao = [act.qtd, game.i18n.localize(T20.abilityActivationTypes[act.execucao])].join(" ");
			} else if ( ['special'].includes(act.execucao) ) {
				labels.ativacao = act.special;
			} else {
				labels.ativacao = T20.abilityActivationTypes[act.execucao];
				// PRELOCALIZED
				// labels.ativacao = game.i18n.localize(T20.abilityActivationTypes[act.execucao]);
			}
		
				if ( act && act.custo > 0) labels.custoPM = act.custo + " PM";

			// Target
			let tgt = system.target || {};
			if (["none", "self"].includes(tgt.unidades)) tgt.value = null;
			if (["none", "self"].includes(tgt.type)) {
				tgt.value = null;
				tgt.unidades = null;
			}
			labels.target = [tgt.value, T20.distanceUnits[tgt.unidades], T20.targetTypes[tgt.type]].filterJoin(" ") ?? "";
			labels.alvo = system.alvo;
			labels.area = system.area;

			// Range
			labels.range = T20.distanceUnits[system.alcance];
			// PRELOCALIZED
			// labels.range = game.i18n.localize(T20.distanceUnits[system.alcance]);
			if( ['m','km'].includes(system.alcance) ){
				labels.range = `${system.range.value}${system.alcance}`
			}

			// Effect
			labels.effect = system.efeito;

			// Duration
			let dur = system.duracao || {};
			if (["inst", "perm", "cena","sust"].includes(dur.units)) dur.value = 0;
			if ( dur.value ) {
				labels.duration = [dur.value, T20.timePeriods[dur.units]].filterJoin(" ");
				// PRELOCALIZED
				// labels.duration = [dur.value, game.i18n.localize(T20.timePeriods[dur.units])].filterJoin(" ");
			} else {
				labels.duration = T20.timePeriods[dur.units];
				// PRELOCALIZED
				// labels.duration = game.i18n.localize(T20.timePeriods[dur.units]);
			}
			if( ["special"].includes(dur.units) ) {
				labels.duration = system.duracao.special;
			}
		}

		// Saving Throw
		if ( system.hasOwnProperty("resistencia") ) {
			let save = system.resistencia || {};
			const actorData = this.actor?.system ?? null;
			const actorFlags = this.actor?.flags ?? null;
			const nivel = actorData?.attributes?.nivel?.value ?? 0;
			const atr = actorData?.atributos[save.atributo]?.value ?? 0;
			let base = this.isOwned && actorData ? Math.floor(nivel/2) ?? 0 : 0;
			let mod = this.isOwned && atr ? atr : 0;

			let cd = 10 + base + mod + (Number(save.bonus) || 0);
			if ( this.actor?.type == 'npc' ){
				cd = this.actor.system.attributes.cd;
			}
			if( this.isOwned && actorFlags) {
				let showCD = actorFlags?.tormenta20?.showCD ?? true;
				if( !showCD ) cd = "??";
			}
			labels.save = save.txt ? save.txt + ` (CD ${cd})` : save.txt;
		}

		// Damage Types
		if( !(system.rolls instanceof Array) ) system.rolls = [];
		if ( system.rolls?.find(r=> r.type == "dano") ) {
			let dano = system.rolls.find(r=> r.type == "dano") || {};
			if ( dano.parts ) {
				labels.dano = dano.parts.filter( p => p[0] != '' ).map(d => d[0]).join(" + ").replace(/\+ -/g, "- ");
				labels.damageTypes = dano.parts.map(d => T20.damageTypes[d[1]]).join(", ");
			}
		}

		// Progression
		// if( !(system.progression instanceof Array) ) system.progression = [];

		// Spellheader
		if ( this.type === "magia" ) {
			//Execução: padrão; Alcance: curto; Alvo: 1 criatura; Area:; Efeito:; Duração: instantânea; Resistência: Vontade parcial.
			const hTags = { ativacao: "T20.ActivationCost", range:"T20.Range", target:"T20.Target", area: 'T20.Area', effect: 'T20.Effect', duracao:"T20.Duration", save:"T20.Resistance" };
			
			for ( let [h, tag] of Object.entries(hTags) ){
				hTags[h] = game.i18n.localize(tag);
			}
			labels.header = "";
			labels.header += labels.ativacao? `<b>${hTags['ativacao']}:</b> ${labels.ativacao}; ` : "";
			labels.header += labels.range? `<b>${hTags['range']}:</b> ${labels.range}; ` : "";
			labels.header += labels.alvo? `<b>${hTags['target']}:</b> ${labels.alvo}; ` : "";
			labels.header += labels.area? `<b>${hTags['area']}:</b> ${labels.area}; ` : "";
			labels.header += labels.effect? `<b>${hTags['effect']}:</b> ${labels.effect}; ` : "";
			labels.header += labels.duration? `<b>${hTags['duracao']}:</b> ${labels.duration}; ` : "";
			labels.header += labels.save? `<b>${hTags['save']}:</b> ${labels.save}; ` : "";
		}

		// if this item is owned, we prepareFinalAttributes() at the end of actor init
		if (!this.isOwned) this.prepareFinalAttributes();
	}

	/* -------------------------------------------- */

	/**
	 * Compute item attributes which might depend on prepared actor system.
	 */
	prepareFinalAttributes() {
		if ( this.hasSave ) {
			// Saving throws
			this.getSaveDC();
		}

		if ( this.hasAttack ) {
			// To Hit
			this.getAttackToHit();
		}

		if ( this.hasDamage ) {
			// Damage Label
			this.getDerivedDamageLabel();
		}
	}



	/* -------------------------------------------- */
	/*  Data Preparation Helpers                    */
	/* -------------------------------------------- */

	/**
	 * Populate a label with the compiled and simplified damage formula
	 * based on owned item actor system. This is only used for display
	 * 
	 * @returns {Array} array of objects with `formula` and `damageType`
	 */
	getDerivedDamageLabel() {
		const system = this.system;
		if ( !this.hasDamage || !system || !this.isOwned ) return [];

		const rollData = {}; //this.getRollData();
		this.labels.dano = simplifyRollFormula(this.labels.dano, rollData, { constantFirst: false });
		return this.labels.dano;
	}
	
	/* -------------------------------------------- */

	/**
	 * Update the derived spell DC for an item that requires a saving throw
	 * @returns {number|null}
	 */
	getSaveDC() {
		if ( !this.hasSave ) return;
		const resistencia = this.system?.resistencia;

		// Ability-score
		resistencia.cd = null;
		if ( this.isOwned ){
			let atr = foundry.utils.getProperty(this.actor.system, `atributos.${resistencia.atributo}.value`);
			let nvl = Math.floor(foundry.utils.getProperty(this.actor.system, `attributes.nivel.value`)/2);
			resistencia.cd = 10 + nvl + atr + resistencia.bonus;
			if ( this.actor.type == 'npc' ){
				resistencia.cd = this.actor.system.attributes.cd;
			}
		}

		// Update labels
		const skill = CONFIG.T20.pericias[resistencia.pericia];
		this.labels.resistencia = game.i18n.format("T20.SaveDC", {cd: resistencia.cd || "", pericia: skill});
		return resistencia.dc;
	}
	
	/* -------------------------------------------- */

	/**
	 * Update a label to the Item detailing its total to hit bonus.
	 * Sources:
	 * - item entity's innate attack bonus
	 * - item's actor's proficiency bonus if applicable
	 * - item's actor's global bonuses to the given item type
	 * - item's ammunition if applicable
	 *
	 * @returns {Object} returns `rollData` and `parts` to be used in the item's Attack roll
	 */
	getAttackToHit() {
		const itemData = this.system;
		const rollData = this.getRollData();
		const roll = itemData.rolls.find(r=>r.type == "ataque");
		if ( !this.hasAttack || !itemData || roll.parts.length < 2 ) return;
		// Define Roll bonuses
		const parts = roll.parts.map(p=> p[0] ?? p);//;
		
		// Take no further action for un-owned items
		if ( !this.isOwned ) return {rollData, parts};
		const actorData = this.actor.system;
		
		// Add skill bonus
		if ( roll.parts[1][0] ) {
			parts[1] = "@skill";
			if ( !foundry.utils.isEmpty(actorData.pericias) ) {
				rollData.skill = actorData.pericias[roll.parts[1][0]].value || 0;
			}
			// Change Skill Ability modifier
			if( roll.parts[1][1] ){
				const skill = actorData.pericias[roll.parts[1][0]];
				const abls = actorData.atributos;
				rollData.skill = skill.value - abls[skill.atributo].value + abls[roll.parts[1][1]].value;
			}
		}

		// Item modifications and enchantments TODO
		// const mods = itemData.modificacoes;
		// if( mods?.pungente ) parts.push(2);
		// else if( mods?.certeira ) parts.push(1);
		// const enchants = itemData.encantos;
		// if( enchants?.magnifica || enchants.energetica ) parts.push(4);
		// else if( enchants?.formidavel ) parts.push(2);

		// Actor-level global bonus to attack rolls
		const bonuses = this.actor.system.modificadores?.ataque || {};
		if ( bonuses.geral ) parts.push(...bonuses.geral);
		if ( bonuses.cac && roll.parts[1][0] !== "pont"){
			parts.push(...bonuses.cac);
		}
		if ( bonuses.ad && roll.parts[1][0] === "pont" ){
			parts.push(...bonuses.ad);
		}

		// One-time bonus provided by consumed ammunition
		if ( (itemData.consume?.type === 'ammo') && !!this.actor.items ) {
			const ammoItemData = this.actor.items.get(itemData.consume.target)?.system;

			if (ammoItemData) {
				const ammoItemQuantity = ammoItemData.qtd;
				const ammoCanBeConsumed = ammoItemQuantity && (ammoItemQuantity - (itemData.consume.amount ?? 0) >= 0);
				const ammoAtqBns = ammoItemData.atqBns;
				const ammoIsTypeConsumable = (ammoItemData.type === "consumivel") && (ammoItemData.subtipo === "ammo");
				if ( ammoCanBeConsumed && ammoAtqBns && ammoIsTypeConsumable ) {
					parts.push("@ammo");
					rollData["ammo"] = ammoAtqBns;
				}
			}
		}

		// Condense the resulting attack bonus formula into a simplified label
		parts.shift();
		let toHitLabel = simplifyRollFormula(parts.filterJoin('+'), rollData).trim();
		if (toHitLabel.charAt(0) !== '-') {
			toHitLabel = '+ ' + toHitLabel
		}
		this.labels.toHit = toHitLabel;
		// Update labels and return the prepared roll data
		return {rollData, parts};
	}


	/* -------------------------------------------- */
	/*  Methods                                     */
	/* -------------------------------------------- */

	/**
	 * Prepare a data object which is passed to any Roll formulas which are created related to this Item
	 * @private
	 */
	getRollData() {
		if ( !this.actor ) return null;
		const rollData = this.actor.getRollData();
		rollData.item = foundry.utils.deepClone(this.system);
		if ( this.system.rolled ){
			if ( !rollData.roll ) rollData.roll = {};
			for ( let [key, r] of Object.entries(this.system.rolled) ) {
				rollData.roll[key] = r.total;
			}
		}
		const atributoChave = this.actor.system.attributes.conjuracao;
		rollData["atributoChave"] = 0;
		if( T20.atributos[atributoChave] ){
			rollData["atributoChave"] = this.actor.system.atributos[atributoChave].value;
		}

		// Include an ability score modifier if one exists
		const atr = this.system.atrBns;
		if ( atr ) {
			const atributo = rollData.atributos[atr];
			rollData["abl"] = atributo.value || 0;
		}
		if ( this.actor.system.pericias ) {
			for ( let [key, skl] of  Object.entries(this.actor.system.pericias) ){
				rollData[key] = skl.value;
			}
		}
		return rollData;
	}

	/* -------------------------------------------- */
	/*  Event Handlers                              */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		if ( !this.isEmbedded || (this.parent.type === "vehicle") ) return;
		const actorData = this.parent.system;
		const isNPC = this.parent.type === "npc";
		let updates;
		switch (data.type) {
			case "classe":
				/* TODO */
				break;
			case "equipamento":
				updates = this._onCreateOwnedEquipment(data, actorData, isNPC);
				break;
			case "arma":
				updates = this._onCreateOwnedWeapon(data, actorData, isNPC);
				break;
			case "magia":
				updates = this._onCreateOwnedSpell(data, actorData, isNPC);
				break;
			case "poder":
				updates = this._onCreateOwnedPower(data, actorData, isNPC);
				break;
		}
		if (updates) return this.updateSource(updates);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onCreate(data, options, userId) {
		super._onCreate(data, options, userId);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _preUpdate(changed, options, user) {
		await super._preUpdate(changed, options, user);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onUpdate(changed, options, user){
		//console.log(changed, options, user);
		super._onUpdate(changed, options, user);
		// Set Initial Class
		if( this.parent && this.type === "classe" && changed.system?.hasOwnProperty("inicial") ){
			const classes = this.actor.items.filter(i => i.type === "classe" && i.id != this.id);
			let updateItems;
			// When set as initial, unset other classes
			if( changed.system.inicial ){
				updateItems = classes.map(i => {
					return {_id: i.id, "system.inicial": false};
				});
			}
			// If unseted initial, find first class and set it as initial
			else if( this.actor.items.find(i => i.type === "classe" && !i.system.inicial ) ) {
				let newInicial = this.actor.items.find(i => i.type === "classe" && i.id != this.id);
				updateItems = [{_id: newInicial.id, "system.inicial": true}];
			}
			if( updateItems ) this.actor.updateEmbeddedDocuments("Item", updateItems);
		}
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDelete(options, userId) {
		super._onDelete(options, userId);
		// Assign a new primary class
		if ( this.parent && this.type === "classe" )  {
			if( this.actor.items.find(i => i.type === "classe" && !i.system.inicial ) ) {
				let newInicial = this.actor.items.find(i => i.type === "classe" );
				const updateItems = [{_id: newInicial.id, "system.inicial": true}];
				if( updateItems ) this.actor.updateEmbeddedDocuments("Item", updateItems);
			}
		}
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned equipment type Items
	 * @private
	 */
	_onCreateOwnedEquipment(data, actorData, isNPC) {
		const updates = {};
		if ( foundry.utils.getProperty(data, "system.equipado") === undefined ) {
			updates["system.equipado"] = false;
		}
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned spell type Items
	 * @private
	 */
	_onCreateOwnedSpell(data, actorData, isNPC) {
		const updates = {};
		if( isNPC ) {
			try {
				if ( data.system.resistencia ){
					updates["system.resistencia.atributo"] = '';
					updates["system.resistencia.bonus"] = '';
				}
			} catch (error) {
				console.error(error);
			};
		}
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned powers type Items
	 * @private
	 */
	_onCreateOwnedPower(data, actorData, isNPC) {
		const updates = {};
		if( isNPC ) {
			try {
				if ( data.system.resistencia ){
					updates["system.resistencia.atributo"] = '';
					updates["system.resistencia.bonus"] = '';
				}
			} catch (error) {
				console.error(error);
			};
		}
		return updates;
	}

	/* -------------------------------------------- */

	/**
	 * Pre-creation logic for the automatic configuration of owned weapon type Items
	 * @private
	 */
	_onCreateOwnedWeapon(data, actorData, isNPC) {
		const updates = {};
		
		if( isNPC ) {
			if ( data.system.rolls ) {
				updates["system.ataques"] = 1;
				let attackRoll = data.system.rolls.find( r => r.type == 'ataque' );
				let damageRoll = data.system.rolls.find( r => r.type == 'dano' );
				if( attackRoll && damageRoll ){
					attackRoll.parts[0][1] = '';
					attackRoll.parts[1][0] = '';
					damageRoll.parts[1][0] = '';
					updates["system.rolls"] = [attackRoll,damageRoll];
				}
			};
		} else if( isNPC ) {
			try {
				let attack = actorData.builder.attributes?.attack?.value ?? 0;
				let damage = actorData.builder.attributes?.damage?.value ?? 0;
				if ( data.system.rolls ) {
					let attackRoll = data.system.rolls.find( r => r.type == 'ataque' );
					let damageRoll = data.system.rolls.find( r => r.type == 'dano' );
					if( attackRoll && damageRoll ){
						attackRoll.parts = [['1d20','',''],['','',''],[attack,'','']];
						let wroll = damageRoll.parts[0][0];
						damageRoll.parts = [[`${wroll}+${damage}`,'',''],['','','']];
						updates["system.rolls"] = [attackRoll,damageRoll];
					}
				};
			} catch (error) {
				console.error(error);
			}
		}
		return updates;
	}

	/* -------------------------------------------- */
	/*  Gameplay Mechanics                          */
	/* -------------------------------------------- */
	
	/**
	 * Roll the item to Chat, creating a chat card which contains follow up attack or damage roll options
	 * @param {boolean} [configureDialog]     Display a configuration dialog for the item roll, if applicable?
	 * @param {string} [rollMode]             The roll display mode with which to display (or not) the card
	 * @param {boolean} [createMessage]       Whether to automatically create a chat message (if true) or simply return
	 *                                        the prepared chat message data (if false).
	 * @return {Promise<ChatMessage|object|void>}
	 */
	async roll({configureDialog=true, rollMode, createMessage=true, extra={}}={}) {
		let item = this;
		rollMode = game.settings.get("core", "rollMode");
		const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
		// Hold to check later
		if ( true ) {
			item = this.clone({keepId: true});
			item.prepareFinalAttributes(); // Spell save DC, etc...
		}
		const id = this.system;                // Item system data
		const actor = this.actor;
		const ad = actor.system;               // Actor system data
		
		let createMeasuredTemplate;
		const resource = id.consume || {};     // Resource consumption

		if ( item.type == 'arma' && ( equipmentSlots ? parseInt(id.equipado2.slot)==12 : id.equipado == 2) ) {
			item.system.rolls.forEach( (r) => {
				if ( r.type == 'dano' && r.versatil ){
					r.parts[0][0] = r.versatil;
				}
			});
		}
		
		// Consume a linked (non-ammo) resource
		let consumeResource = !!resource.target && resource.type == "attribute";
		// Consume item quantity
		let consumeSelf = this.type == 'consumivel';
		let consumeQuantity = ['ammo','material'].includes(resource.type) && resource.target;
		// Consume mana
		let consumeMana = id.ativacao?.custo > 0 ? true : false;
		let hasManaCost = id.ativacao?.custo > 0 ? true : false;
		let options = {};

		// Display a configuration dialog to customize the usage
		const needsConfiguration = consumeResource || consumeMana;
		let configuration = {};
		if (configureDialog) {
			configuration = await AbilityUseDialog.create(item);
			// configuration = await new AbilityUseDialog(item).render(true);
			if (!configuration) return;
			
			options = configuration;
			// Determine consumption preferences
			// createMeasuredTemplate = Boolean(configuration.placeTemplate);
			// consumeSelf = Boolean(configuration.consumeSelf);
			// consumeQuantity = Boolean(configuration.consumeUse);
			// consumeResource = Boolean(configuration.consumeResource);
			// consumeMana = Boolean(configuration.consumeMana);
			rollMode = configuration.rollMode;
		} else {
			let itActive = this.actor.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.disabled);
			let acActive = this.effects.filter(ef => ef.getFlag("tormenta20","onuse") && !ef.disabled);
			let active = itActive.concat(acActive);
			const relate = {
				atributo:'ability', pericia:'skill',
				arma:'attack', magia:'spell',
				poder:'power', consumivel:'consumable',
				equipamento:'equipment'
			}
			let efType = relate[item.type];
			active = active.filter( ef => ef.flags.tormenta20[efType] || ef.flags.tormenta20.self );
			configuration.aprs = active.reduce((o,ef)=>{
				o[ef.id] = {aplica:1, custo: ef.flags.tormenta20.custo||"0"};
				return o;
			}, {});
			options = applyOnUseEffects( item, configuration );
		}
		consumeMana = consumeMana ? consumeMana : consumeMana != (item.system.ativacao?.custo > 0);
		hasManaCost = hasManaCost ? hasManaCost : hasManaCost != (item.system.ativacao?.custo > 0);

		if ( !foundry.utils.isEmpty( extra ) || configuration.bonus || configuration.bonusdano ) {
			item.system.rolls.forEach( r => {
				if( r.type == "ataque" ) {
					if ( !["","0",undefined].includes(configuration.bonus) ) r.parts.push([configuration.bonus, ""]);
					if ( !["","0",undefined].includes(extra.pericia) ) r.parts[1][0] = extra.pericia;
					if ( !["","0",undefined].includes(extra.atributoAtq) ) r.parts[1][1] = extra.atributoAtq;
					if ( extra?.atq?.match(/^=/) ) r.parts = [["1d20",""], [extra.atq.replace("=",""),""]];
					else if ( !["","0",undefined].includes(extra.atq) ) r.parts.push([extra.atq, ""]);
				}
				else if( r.type == "dano" ){
					if ( !["","0",undefined].includes(configuration.bonusdano) ) r.parts.push([configuration.bonusdano, ""]);
					if ( !["","0",undefined].includes(extra.dadoDano) ) r.parts[0][0] = extra.dadoDano;
					if ( !["","0",undefined].includes(extra.atributoDano) ) r.parts[1][0] = "@" + extra.atributoDano;
					if ( extra?.dano?.match(/^=/) ) r.parts = [[extra.dano.replace("=",""),""]];
					else if ( !["","0",undefined].includes(extra.dano) ) r.parts.push([extra.dano, ""]);
				}
			});

			if ( extra?.multCritico?.match(/^=/) ) item.system.criticoX = 1* extra.multCritico.replace("=","");
			else if ( Number(extra.multCritico) ) item.system.criticoX += Number(extra.multCritico);
			if ( extra?.margemCritico?.match(/^=/) ) item.system.criticoM = extra.margemCritico.replace("=","");
			else if ( Number(extra.margemCritico) ) item.system.criticoM += Number(extra.margemCritico);
		}

		// Execute Rolls
		options.rolls = [];
		item.system.rolled = {};
		if( item.system.rolls.find(r=>r.type == "ataque" && r.parts.length && r.parts[0][0]) ){
			await item.rollAttack({options:options});
		}
		if( item.system.rolls.find(r=>r.type == "formula" && r.parts.length && r.parts[0][0]) ){
			await item.rollFormula({options:options});
		}
		if( item.system.rolls.find(r=>r.type == "dano" && r.parts.length && r.parts[0][0]) ){
			await item.rollDamage({options:options});
		}
		
		options.hasManaCost = hasManaCost;
		// Determine whether the item can be used by testing for resource consumption
		if( !options.truque && consumeMana ) {
			consumeMana = Math.max(item.system.ativacao.custo, 1);
		} else consumeMana = false;
		
		const consumeSettings = consumeResource || consumeMana || consumeQuantity || consumeSelf;
		if( consumeSettings ){
			const usage = item._getUsageUpdates({consumeResource, consumeMana, consumeQuantity, consumeSelf});
			if ( !usage ) return;
			const {actorUpdates, itemsUpdate, itemUpdates, resourceUpdates, manaUpdate} = usage;

			// Commit pending data updates 
			if ( !foundry.utils.isEmpty(itemsUpdate) ) {
				this.actor.updateEmbeddedDocuments('Item', itemsUpdate);
			}
			if ( !foundry.utils.isEmpty(itemUpdates) ) {
				itemUpdates._id = this.id;
				this.actor.updateEmbeddedDocuments('Item', [itemUpdates]);
			}
			if ( !foundry.utils.isEmpty(manaUpdate) ) {
				this.actor.spendMana(manaUpdate.value, 0, false);
			}
			if ( !foundry.utils.isEmpty(resourceUpdates) ) {
				this.actor.update(resourceUpdates);
			}
		}

		
		// Create or return the Chat Message data
		if( configuration.brew ){
			let potion = "T20.ConsumableSubtypePotion";
			let icon = "pocao";
			if( item.system.area ) {
				potion = "T20.ConsumableSubtypeGranade";
				icon = "pocao-granada";
			}
			if( item.system.alvo.match(/objeto/) ) {
				potion = "T20.ConsumableSubtypeOil";
				icon = "pocao-oleo";
			}
			let potionData = Object.assign({}, item.system );
			potionData.tipo = "potion";
			potionData.qtd = 1;
			potionData.espacos = 0.5;
			potionData.rolls = item.system.rolls.map(m=>m.toObject(false));
			potionData.preco = 30 * (item.system.ativacao.custo**2);
			potionData.ativacao.custo = 0;
			
			const itemData = {
				name: game.i18n.format('T20.ConsumableSpellName',{
					item: game.i18n.localize(potion),
					name:item.name
				}),
				type: "consumivel",
				img: `systems/tormenta20/icons/itens/itens-magicos/${icon}.webp`,
				system: potionData
			};
			let warn = 1;
			itemData.system.rolled = [];
			itemData.effects = options.effects.map(efs => efs[0] );
			await actor.createEmbeddedDocuments("Item", [itemData]);
			let msg = game.i18n.format('T20.ConsumableCreated', {actor:item.actor.name, name:itemData.name} );
			return ChatMessage.create({content:msg});
		}

		// Reference aspects of the item data necessary for usage
		const hasArea = item.hasAreaTarget;       // Is the ability usage an AoE?
		// Define follow-up actions resulting from the item usage
		createMeasuredTemplate = hasArea;       // Trigger a template creation
		// Initiate measured template creation
		if ( canvas.scene && createMeasuredTemplate ) {
			const template = AbilityTemplate.fromItem(item);
			if ( template ) {
				template.drawPreview();
				options.template = {
					area: item.system.area,
					alcance: item.system.alcance
				}
			}
		}
		
		options.itemId = this.id;
		return item.displayCard({options, rollMode, createMessage});
	}

	async rollV2({configureDialog=true, createMessage=true, extra={}}={}) {
		// Data
		let rollMode = game.settings.get("core", "rollMode");

		// Duplicate the item
		let item = this.clone({keepId: true});
		let actor = item.actor;     // Actor parent
		if ( !this.isEmbedded ) {
			let actor = new Actor({name:'dummy',type:'character', items:[item.toObject()]});
			item = actor.item.find(i => true);
		} else {
			item.prepareFinalAttributes(); // Spell save DC, etc...
		}
		// Data
		const id = item.system;       // Item system data
		const ad = actor.system;      // Actor system data
		
		// TODO
		// APPLY EFFECTS TO ROLL
		if ( true ){
			adsa
		}
		// APPLY EFFECTS TO EFFECTS
		if ( true ){
			let itemEffect = item.effects.filter([])
			
		}
		// APPLY EFFECTS TO ITEMS
		if ( true ){
			let itemUpdates = {};
			item.updateSource(itemUpdates);
		}
		// APPLY EFFECTS TO ACTOR
		if ( true ){
			let actorUpdates = {};
			item.actor.updateSource(actorUpdates);
		}

		options.itemId = this.id;
		return item.displayCard({options, rollMode, createMessage});
	}

	/**
	 * Verify that the consumed resources used by an Item are available.
	 * Otherwise display an error and return false.
	 * @param {boolean} consumeQuantity     Consume quantity of the item if other consumption modes are not available?
	 * @param {boolean} consumeRecharge     Whether the item consumes the recharge mechanic
	 * @param {boolean} consumeResource     Whether the item consumes a limited resource
	 * @param {string|null} consumeSpellLevel The category of spell slot to consume, or null
	 * @param {boolean} consumeUsage        Whether the item consumes a limited usage
	 * @returns {object|boolean}            A set of data changes to apply when the item is used, or false
	 * @private
	 */
	_getUsageUpdates({consumeQuantity, consumeResource, consumeMana, consumeSelf}) {

		// Reference item data
		const id = this.system;
		const actorUpdates = {};
		const itemUpdates = {};
		const resourceUpdates = {};
		const manaUpdate = {};
		const itemsUpdate = [];

		// Consume Limited Resource
		// consumeResource = false;
		if ( consumeResource ) {
			let resourceAttr = this.actor?.system.resources[id.consume.target] ?? {};
			if( !foundry.utils.isEmpty(resourceAttr) && resourceAttr.value >= id.consume.amount ){
				let remaining = resourceAttr.value - id.consume.amount;
				let key = `system.resources.${id.consume.target}.value`;
				resourceUpdates[key] = remaining;
			}
			// if ( canConsume === false ) return false;
		}

		// Consume Mana Points
		const autoSpendMana = game.settings.get("tormenta20", "automaticManaSpend");
		if ( autoSpendMana && consumeMana && Number.isNumeric(consumeMana)) {
			if( consumeMana && this.actor.system.modificadores.custoPM ){
				consumeMana += Number(this.actor.system.modificadores.custoPM);
			}
			const mana = this.actor.system.attributes.pm;
			const currentMana = mana.value + mana.temp;
			if( currentMana >= consumeMana ) {
				manaUpdate['value'] = consumeMana;
			} else {
				ui.notifications.warn(game.i18n.format("T20.InsufficientMana", {name: this.name}));
				return false;
			}
		}

		// Reduce quantity
		if ( consumeQuantity && id.consume.target.length ) {
			let resourceItem = this.actor.items.get(id.consume.target);
			let amount = id.consume.amount * (id.consume.mpMultiplier && consumeMana ? consumeMana : 1);
			if ( resourceItem.system.qtd >= amount ) {
				let remaining = resourceItem.system.qtd - amount;
				itemsUpdate.push({_id: resourceItem.id, "system.qtd": remaining});
			} else {
				ui.notifications.warn(game.i18n.format("T20.ItemNoUses", {name: resourceItem.name}));
				return false;
			}
		}

		// Reduce self quantity
		if ( consumeSelf ) {
			const q = Number(id.qtd ?? 1);
			if ( q >= 1 ) {
				// itemsUpdate.push({_id: this.id, "system.qtd": Math.max(q - 1, 0)});
				itemUpdates["system.qtd"] = Math.max(q - 1, 0);
			} else {
				ui.notifications.warn(game.i18n.format("T20.ItemNoUses", {name: this.name}));
				return false;
			}
		}
		
		// Return the configured usage
		return {itemUpdates, itemsUpdate, actorUpdates, resourceUpdates, manaUpdate};
	}

	/* -------------------------------------------- */

	/* -------------------------------------------- */

	/**
	* Display the chat card for an Item as a Chat Message
	* @param {object} options          Options which configure the display of the item chat card
	* @param {string} rollMode         The message visibility mode to apply to the created card
	* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
	*                                  the prepared message data (if false)
	*/
	async displayCard({options, rollMode, createMessage=true}={}) {
		// Basic template rendering data
		const token = this.actor.token;
		
		let manaCost = Number(this.system.ativacao.custo) || (options.hasManaCost ? 1 : null );
		if ( options.truque ) manaCost = 0;
		else if ( options.halfCost ) manaCost = Math.floor(manaCost / 2);
		
		const templateData = {
			actor: this.actor,
			tokenId: token?.uuid || null,
			itemId: options.itemId,
			item: this,
			custo: manaCost,
			system: await this.getChatData(),
			labels: this.labels,
			truque: options.truque,
			onUseEffects: options.onUseEffects,
			effects: options.effects,
			placeTemplate: options.template,
			rolls: []
		};

		
		for( let [key, roll] of Object.entries(this.system.rolled) ) {
			roll.tipo = (roll.options.type == 'damage' || roll.dice[0]?.faces !== 20) ? "roll--dano" : roll._critical ? "critico" : roll._fumble ? "falha" : "";
			roll.options.title = key || "";
			await roll.render().then((r)=> {templateData.rolls.push({template: r, roll: roll})});
		}
		
		// Render the chat card template
		let template = "systems/tormenta20/templates/chat/chat-card.html";
		const html = await renderTemplate(template, templateData);

		// Create the ChatMessage data object
		const chatData = {
			user: game.user.id,
			rolls: Object.values( this.system.rolled ),
			content: html,
			flavor: options.chatFlavor || this.system.chatFlavor || "",
			speaker: ChatMessage.getSpeaker({actor: this.actor}),
			sound: "sounds/dice.wav",
			flags: {
				"core.canPopout": true,
				"tormenta20.onUseEffects": options.onUseEffects,
				"tormenta20.effects": options.effects,
				"tormenta20.itemData": this.system,
				"tormenta20.template": options.template
			}
		};
		
		// Apply the roll mode to adjust message visibility
		ChatMessage.applyRollMode(chatData, rollMode || game.settings.get("core", "rollMode"));
		
		// Create the Chat Message or return its data
		return createMessage ? ChatMessage.create(chatData) : chatData;
	}

	/* -------------------------------------------- */

	async getChatData(htmlOptions={async:true}) {
		const system = foundry.utils.deepClone(this.system);
		const labels = this.labels;

		// Rich text description
		system.description = system.description || {value:"",chat:"",unidentified:""};
		system.description.value = await TextEditor.enrichHTML(system.description.value, htmlOptions);

		if( this.type === "magia" || ( this.type === "consumivel" && ["scroll", "potion"].includes(system.subtipo) ) ){
			const headerTags = { ativacao: "T20.ActivationCost", range:"T20.Range", target:"T20.Target", duracao:"T20.Duration", save:"T20.Resistance" };
			const r = Object.entries(labels).map(function(t){
				if( headerTags.hasOwnProperty(t[0]) && t[1]){
					let tag = game.i18n.localize( headerTags[t[0]] );
					
					return `<b>${tag}:</b> ${t[1]};`
				} else return;
			});
			system.spellHeader = r.filter(t => t!=null).join(" ");
			// Exec - Alcn - Alvo - Area - Dura - Resis
		}
		return system;
	}

	/* -------------------------------------------- */
	/*  Item Rolls - Attack, Damage, Saves, Checks  */
	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @param {object} options        Roll options which are configured and provided to the d20Roll function
	 * @return {Promise<Roll|null>}   A Promise which resolves to the created Roll instance
	 */
	async rollAttack(options={}) {
		const itemData = this.system;
		const flags = this.actor.flags.tormenta20 || {};
		options.type = 'attack';
		// get the parts and rollData for this item's attack
		for (let r of itemData.rolls.filter(i => i.type == "ataque")) {
			// Get roll data
			const {parts, rollData} = this.getAttackToHit();
			const title = this.name;
			// r.parts = r.parts.map(p=> [p[0] || p])[0].concat(parts);
			parts.unshift(r.parts[0][0]);

			// Handle ammunition consumption
			// TODO

			// Compose roll options
			const rollConfig = foundry.utils.mergeObject({
				parts: parts,
				actor: this.actor,
				data: rollData,
				title: title,
				flavor: title,
				event: event
			}, options);

			// Expanded critical hit thresholds
			rollConfig.critical = itemData.criticoM;
			
			// Invoke the d20 roll helper
			const roll = await d20Roll(rollConfig);
			if ( roll === false ) return null;
			roll._critical = roll.terms[0].total >= itemData.criticoM;
			roll._fumble = roll.terms[0].total == 1;
			
			itemData.rolled[r.name] = roll;
		}
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollDamage({critical=false, event=null,  versatile=false, options={}}={}) {
		const itemData = this.system;
		const actorData = this.actor.system;
		let pericia;
		let lancinante = false;
		options.type = 'damage';
		if(this.type == "arma") {
			critical = itemData.rolled?.Ataque?._critical || false;
			pericia = itemData.rolls.find(i => i.type == "ataque")?.parts[1][0];
			lancinante = Object.values(itemData.upgrades)?.includes('lancinating');
		}
		for (let r of itemData.rolls.filter(i => i.type == "dano")) {
			// Get roll data
			const parts = r.parts;//.map(d => d[0]);
			const rollData = this.getRollData();
			// Configure the damage roll
			const title = this.name;
			const rollConfig = {
				actor: this.actor,
				critical: critical ?? false,
				criticalMultiplier: itemData.criticoX,
				lancinante: lancinante,
				data: rollData,
				event: event,
				parts: parts,
				title: title,
				flavor: title
			};
			
			// Adjust damage from versatile usage
			if ( versatile && r.versatil ) {
				parts[0][0] = r.versatil;
			}
			
			// Add damage bonus formula
			const bonuses = foundry.utils.getProperty(actorData, "modificadores.dano") || {};
			if ( bonuses.geral.filter(Boolean).length ) parts.push(['@dano','','']);
			if ( pericia=="luta" && bonuses.cac.filter(Boolean).length ) parts.push(['@danoCAC','','']);
			if ( pericia=="pont" && bonuses.ad.filter(Boolean).length ) parts.push(['@danoAD','','']);
			if ( this.type=="magia" && bonuses.mag.filter(Boolean).length ) parts.push(['@danoMagico','','']);
			if ( this.type=="consumivel" && this.system.tipo == "alchemy" && bonuses.alq.filter(Boolean).length ) parts.push(['@danoALQ','','']);
			
			// Call the roll helper utility
			foundry.utils.mergeObject(rollConfig, options);
			itemData.rolled[r.name] = await damageRoll(rollConfig);
		}
		// return result;
	}

	/* -------------------------------------------- */

	/**
	 * Place an attack roll using an item (weapon, feat, spell, or equipment)
	 * Rely upon the d20Roll logic for the core implementation
	 *
	 * @return {Promise<Roll>}   A Promise which resolves to the created Roll instance
	 */
	async rollFormula(options={}) {
		const itemData = this.system;
		const actorData = this.actor.system;
		const rollData = this.getRollData();
		// Invoke the roll and submit it to chat
		for (let r of itemData.rolls.filter(i => i.type == "formula")) {
			// rolls[r.name] = 
			let temp = new Roll(r.parts[0][0], rollData);
			itemData.rolled[r.name] = await temp.roll({async:true});
		}
	}
}