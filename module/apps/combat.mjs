
/**
 * An extension of the base CombatTracker class to provide some Tormenta20-specific functionality.
 * @extends {CombatTracker}
 */
export default class CombatTrackerT20 extends CombatTracker {
	/** @inheritdoc */
	async _onCombatantControl(event) {
		return super._onCombatantControl(event);
		const btn = event.currentTarget;
		const combatantId = btn.closest(".combatant").dataset.combatantId;
		const combatant = this.viewed.combatants.get(combatantId);
		if ((btn.dataset.control === "rollInitiative") && combatant?.actor) return combatant.actor.rollInitiativeDialog();
	}

	async getData(options={}) {
		const context = await super.getData(options);
		await this.calculateNDEncontro(context);
		return context;
	}

	encontro = {
		base: 0,
		nd: 0
	};

	/**
	 * CASES:
	 * SINGLE CREATURE: NE = ND
	 * MULTIPLE CREATURE SAME ND: ND + 2 EVERY DOUBLE
	 * MULTIPLE CREATURE DIFF ND: MAX(ND) + (ND - 1: +1 )
	 * GROUPS OF CREATURES DIFF
	 * @param {*} context
	 */
	async calculateNDEncontro(context) {
		console.log(context);
		const combat = context.combat;
		console.log(combat);
		if (!combat) return;
		const npcs = combat.combatants.map((c) => c.actor).filter((c) => c && c.type == "npc");
		console.log(npcs);
		if (npcs.length == 0) return;
		const ndsValues = Object.values(npcs.map(this.getNDReal));
		console.log(ndsValues);
		const ndsGroups = ndsValues.reduce((acc, nd) => {
			acc[nd] ??= { qty: 0, dobro: 0, ndGrupo: 0 };
			acc[nd].nd = nd;
			acc[nd].qty++;
			acc[nd].dobro = this.getNDDobro(acc[nd].qty);
			acc[nd].ndGrupo = acc[nd].nd + acc[nd].dobro;
			return acc;
		}, {});
		const _ndsGroups = Object.values(ndsGroups);
		console.log(ndsGroups);
		// SINGLE CREATURE
		if (ndsValues.length == 1) {
			this.encontro.nd = ndsValues[0];

		}
		// MULTIPLE CREATURE SAME ND
		else if (ndsValues.every((nd) => nd == ndsValues[0])) {
			this.encontro.nd = ndsValues[0] + this.getNDDobro(ndsValues.length);

		}
		// MULTIPLE CREATURE DIFFERENT ND GROUPS WITH SINGLE
		else if (Math.max(..._ndsGroups.map((nd) => nd.qty)) == 1) {
			const base = Math.max(...ndsValues);
			const diff = this.getNDDistance(base, ndsValues);
			this.encontro.nd = Math.floor(base + diff);

		}
		// MULTIPLE CREATURE DIFFERENT ND GROUPS WITH MULTIPLE
		else if (Math.max(..._ndsGroups.map((nd) => nd.qty)) > 1) {
			// GROUP GROUPS
			console.log(_ndsGroups);
			const arrNDGroup = Object.values(_ndsGroups).map((nd) => nd.ndGrupo);
			const ndsGroups2 = arrNDGroup.reduce((acc, nd) => {
				acc[nd] ??= { qty: 0, dobro: 0, ndGrupo: 0 };
				acc[nd].nd = nd;
				acc[nd].qty++;
				acc[nd].dobro = this.getNDDobro(acc[nd].qty);
				acc[nd].ndGrupo = acc[nd].nd + acc[nd].dobro;
				return acc;
			}, {});
			const _ndsGroups2 = Object.values(ndsGroups2);
			const ndsValues2 = _ndsGroups2.map((nd) => nd.ndGrupo);

			console.log(ndsGroups2);
			console.log(ndsValues2);
			const base = Math.max(...ndsValues2);
			const diff = this.getNDDistance(base, _ndsGroups2);
			this.encontro.nd = Math.floor(base + diff);

		}
	}

	async calcNE(context) {
		console.log(context);
		const combat = context.combat;
		console.log(combat);
		if (!combat) return;
		const npcs = combat.combatants.map((c) => c.actor).filter((c) => c && c.type == "npc");
		console.log(npcs);
		if (!npcs) return;
		const single = this.calculateSingle(npcs);
		console.log(single);
		// if ( this.calculateSingle( npcs ) ) return;
		console.log(npcs);
		const ndsValues = Object.values(npcs.map(this.getNDReal));
		this.encontro.base = Math.max(...ndsValues);

		const nds = npcs.reduce((acc, npc) => {
			let nd = this.getNDReal(npc);
			acc[nd] ??= { qty: 0, nd: 0, ndGroup: 0, distance: 0 };
			acc[nd].qty++;
			acc[nd].base = nd;
			acc[nd].ndGroup = this.getNDDobro(acc[nd].qty);
			acc[nd].nd = acc[nd].base + acc[nd].ndGroup;
			return acc;
		}, {});
		const groupNDs = this.calculateGroupND(nds);
		this.getNDDistance(groupNDs);
		console.log(this.encontro, nds, groupNDs);
	}

	getNDReal(npc) {
		let nd = npc.system.attributes.nd.toUpperCase();
		const ndS = ["S", "S+"];
		const ndF = ["1/2", "1/3", "1/4", "1/6", "1/8"];
		if (ndS.includes(nd)) nd = 20;
		else if (ndF.includes(nd)) nd = eval(nd).toFixed(2);
		else nd = Number(nd) || 1;
		return nd;
	}

	getNDDobro(qty) {
		if (qty >= 32) return 10;
		else if (qty >= 16) return 8;
		else if (qty >= 8) return 6;
		else if (qty >= 4) return 4;
		else if (qty >= 2) return 2;
		return 0;
	}

	getNDDistance(base, nds, multiply = false) {
		let acc = 0;
		for (const o of nds) {
			const nd = o.nd;
			const qty = multiply ? o.qty : 1;
			if (base - nd == 1) acc += Number(qty);
			else if (base - nd == 2) acc += 0.5 * qty;
			else if (base - nd == 3) acc += 0.25 * qty;
			else acc += 0 * qty;
		}
		return acc;
	}

	getNDDistance2(base, nd) {
		if (base - nd == 1) return 1;
		else if (base - nd == 2) return 0.5;
		else if (base - nd == 3) return 0.25;
		return 0;
	}

	getNDDistance3(nds) {
		const ndsValues = Object.values(nds).map((nd) => nd.nd);
		this.encontro.base = Math.max(...ndsValues);
		this.encontro.nd = this.encontro.base;
		for (const ndGroup of Object.values(nds)) {
			const nd = ndGroup.nd;
			const base = this.encontro.base;
			if (base - nd == 1) this.encontro.nd += 1;
			else if (base - nd == 2) this.encontro.nd += 0.5;
			else if (base - nd == 3) this.encontro.nd += 0.25;
			else this.encontro.nd += 0;
		}
		this.encontro.nd = Math.floor(this.encontro.nd);

	}

	calculateSingle(npcs) {
		console.log("calculateSingle");
		if (npcs.length != 1) return false;
		console.log("calculateSingle");
		const npc = npcs[0];
		const nd = this.getNDReal(npc);
		this.encontro = {
			nd: nd
		};
		return true;
	}

	calculateGroupND(nds) {
		const groupedNds = {};
		for (const ndGroup of Object.values(nds)) {
			const nd = ndGroup.nd;
			groupedNds[nd] ??= { qty: 0, nd: 0, ndGroup: 0, distance: 0 };
			groupedNds[nd].qty++;
			groupedNds[nd].base = nd;
			groupedNds[nd].ndGroup = this.getNDDobro(groupedNds[nd].qty);
			groupedNds[nd].nd = groupedNds[nd].base + groupedNds[nd].ndGroup;
		}
		return groupedNds;
	}

}
