import { simplifyRollFormula } from "../../../dice/dice.mjs";

export default class AttributesFields {
	static prepareDefense(rollData) {
		const defesa = this.attributes.defesa;
		const parts = [defesa.base];

		let pda = 0;

		if (this.parent.type === "character" && game.settings.get("tormenta20", "progressiveDefense")) {
			parts.push("@meionivel");
		}

		const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
		const items = this.parent.itemTypes.equipamento.filter(
			(i) => (equipmentSlots ? i.system.equipado2.slot : i.system.equipado)
		);

		const armor = items.find((i) => ["leve", "pesada"].includes(i.system.tipo));
		const shield = items.find((i) => i.type === "equipamento" && i.system.tipo === "escudo");
		const accessories = items.filter((i) => !["escudo", "leve", "pesada"].includes(i.system.tipo));
		const accDef = accessories.map((m) => m.system.armadura.value).reduce((sum, v) => sum + v, 0);
		const accPda = accessories.map((m) => m.system.armadura.penalidade).reduce((sum, v) => sum + v, 0);
		if (accDef) parts.push(accDef);
		pda += armor ? armor.system.armadura.penalidade : 0;
		pda += shield ? shield.system.armadura.penalidade : 0;
		pda += accPda ?? 0;
		parts.push(...defesa.bonus);
		let maxAtr = armor ? armor.system.armadura.maxAtr : 0;
		let atributo = this.atributos[defesa.atributo].value;
		if (armor?.system.tipo !== "pesada" || Number.between(atributo, -Infinity, maxAtr)) {
			atributo = Math.clamp(atributo, 0, maxAtr);
			parts.push(`@${defesa.atributo}`);
		}
		if (armor) parts.push(armor.system.armadura.value);
		if (shield) parts.push(shield.system.armadura.value);
		if (defesa.outros) parts.push(defesa.outros);
		if (defesa.condi) parts.push(defesa.condi);

		const result = simplifyRollFormula(parts.join("+"), rollData, {
			constantFirst: true
		}).trim();

		defesa.value = parseInt(result);
		defesa.pda = pda;
		rollData.pda = pda;
	}

	static prepareMovement() {
		const equipmentSlots = game.settings.get("tormenta20", "equipmentSlots");
		const items = this.parent.itemTypes.equipamento.filter(
			(i) => (equipmentSlots ? i.system.equipado2.slot : i.system.equipado)
		);
		const armor = items.find((i) => i.system.tipo === "pesada");
		if (armor) {
			for (let [key, value] of Object.entries(this.attributes.movement)) {
				if (Number.isNumeric(this.attributes.movement[key])) {
					this.attributes.movement[key] = value - 3;
				}
			}
		}

		// const statuses = this.parent.statuses;
		// const noMovement = this.parent.hasConditionEffect("noMovement");
		// const halfMovement = this.parent.hasConditionEffect("halfMovement");
		// const encumbered = statuses.has("encumbered");
		// const heavilyEncumbered = statuses.has("heavilyEncumbered");
		// const exceedingCarryingCapacity = statuses.has("exceedingCarryingCapacity");
		// const crawl = this.parent.hasConditionEffect("crawl");
		// const units = this.attributes.movement.units ??= defaultUnits("length");
		// let reduction = game.settings.get("dnd5e", "rulesVersion") === "modern"
		// ? (this.attributes.exhaustion ?? 0) * (CONFIG.DND5E.conditionTypes.exhaustion?.reduction?.speed ?? 0) : 0;
		// reduction = convertLength(reduction, CONFIG.DND5E.defaultUnits.length.imperial, units);
		// for ( const type in CONFIG.DND5E.movementTypes ) {
		// 	let speed = Math.max(0, this.attributes.movement[type] - reduction);
		// 	if ( noMovement || (crawl && (type !== "walk")) ) speed = 0;
		// 	else {
		// 		if ( halfMovement ) speed *= 0.5;
		// 		if ( heavilyEncumbered ) {
		// 			speed = Math.max(0, speed - (CONFIG.DND5E.encumbrance.speedReduction.heavilyEncumbered[units] ?? 0));
		// 		} else if ( encumbered ) {
		// 			speed = Math.max(0, speed - (CONFIG.DND5E.encumbrance.speedReduction.encumbered[units] ?? 0));
		// 		}
		// 		if ( exceedingCarryingCapacity ) {
		// 			speed = Math.min(speed, CONFIG.DND5E.encumbrance.speedReduction.exceedingCarryingCapacity[units] ?? 0);
		// 		}
		// 	}
		// 	this.attributes.movement[type] = speed;
		// }
	}

	static prepareEncumbrance(rollData) {
		if (!game.settings.get("tormenta20", "carryWeight")) return;
		const inventarioOrganizado = this.parent.getFlag("tormenta20", "inventarioOrganizado");

		const weight = this.attributes.carga;
		// { value: 0, max: 20, pct: 0, encumbered: false };
		const physicalItems = ["arma", "equipamento", "consumivel", "tesouro"];
		// Get the total weight from items
		weight.value = this.parent.items.reduce((weight, i) => {
			if (!physicalItems.includes(i.type) || !i.system.carregado || i.system.container) return weight;
			const q = i.system.qtd || 0;
			const w = (inventarioOrganizado && i.system.espacos === 0.5 ? 0.25 : i.system.espacos) || 0;
			// const w = i.system.espacos || 0;
			return weight + q * w;
		}, 0);
		// Get the total weight from coins (1 === 1000)
		if (game.settings.get("tormenta20", "currencyWeight")) {
			const coins = Object.values(this.dinheiro).reduce((a, b) => a + b);
			weight.value = weight.value + Math.floor(coins / 1000);
		}
		// weight.value = Math.floor( weight.value );
		if (["vehicle", "simple"].includes(this.parent.type)) {
			weight.encumbered = weight > weight.max / 2;
			weight.pct = Math.clamp((weight.value * 100) / weight.max, 0, 100);
			return;
		}
		// Compute Encumbrance percentage
		const atr = this.atributos[weight.atributo].value;
		const parts = [weight.base, ...weight.bonus];
		const base = simplifyRollFormula(parts.join("+"), rollData, {
			constantFirst: true
		}).trim();
		const limit = (Number(base) || 10) + (atr > 0 ? atr * 2 : atr);
		weight.limit = limit;
		weight.max = limit * 2;
		weight.encumbered = weight.value > limit;
		weight.pct = Math.clamp((weight.value * 100) / weight.max, 0, 100);
	}

	static prepareDamageResistances(rollData) {
		for (const [key, res] of Object.entries(this.tracos.resistencias)) {
			let parts = [res.base, ...res.bonus].filter(Boolean);
			const result = simplifyRollFormula(parts.join("+"), rollData, {
				constantFirst: true
			}).trim();
			this.tracos.resistencias[key].value = Number(result) === Number.prototype ? Number(result) : result;
		}
	}

	static preparePVPM(rollData) {
		let lvlc = this.parent.getFlag("tormenta20", "lvlconfig");
		if (lvlc?.manual) return;

		const nivel = Number(this.attributes.nivel.value);
		if (!nivel) return;
		const { substituirCon = "con" } = this.parent.flags.tormenta20 ?? {};
		for (const type of ["pv", "pm"]) {
			let soma = 0;
			const { atributos, bonus } = this.attributes[type];
			const bonusPorNivel = {
				nivel: bonus.nivel.reduce((sum, value) => sum + Number(simplifyRollFormula(value, rollData)), 0),
				nivelPar: bonus.nivelPar.reduce((sum, value) => sum + Number(simplifyRollFormula(value, rollData)), 0),
				nivelImpar: bonus.nivelImpar.reduce((sum, value) => sum + Number(simplifyRollFormula(value, rollData)), 0)
			};
			let levelSum = 0;
			for (const classe of this.parent.itemTypes.classe) {
				const c = classe.system;
				for (let i = 1; i < c.niveis + 1; i++) {
					levelSum++;
					let sum = 0;
					if (type === "pv" && c.inicial && i === 1) sum += 4 * Number(c[`${type}PorNivel`]);
					else sum += Number(c[`${type}PorNivel`]);
					sum += bonusPorNivel.nivel;
					sum += levelSum % 2 === 0 ? bonusPorNivel.nivelPar : bonusPorNivel.nivelImpar;
					if (type === "pv") {
						sum += this.atributos[substituirCon].value;
						sum = Math.max(sum, 1);
					}
					soma += sum;
				}
			}
			Object.entries(atributos)
				.filter(([atr, value]) => value)
				.forEach(([atr, value]) => {
					const { base, racial } = this.atributos[atr];
					soma += Number(base) + Number(racial);
				});
			bonus.total.forEach((value) => (soma += Number(simplifyRollFormula(value, rollData))));
			if (type === "pv") this.attributes[type].min = -Math.floor(soma / 2);
			this.attributes[type].max = Math.floor(soma);
		}
	}
}