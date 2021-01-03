import { T20Utility } from '../utility.js';
import ConjurarDialog from "../apps/conjurar-dialog.js";
import AprimoramentoApplication from "../apps/aprimoramento-app.js";

/**
 * Override and extend the basic :class:`Item` implementation
 */
export default class ItemT20 extends Item {
	/**
	* Augment the basic Item data model with additional dynamic data.
	*/
	prepareData() {
		super.prepareData();
		const data = this.data;

		if (this.data.type == "skill"){
			this.prepareSkill();
		}
	}

	prepareSkill(){
		if (this.data.type != "skill"){
			return;
		}

		const data = this.data;

		if (this.isOwned)
		{
			if (!data.data.total){
				data.data.total = 0;
			}
			let actorData = this.actor.data.data;
			let halfLevel = Math.floor(actorData.attributes.nivel.value/2);

			let training = !data.data.trained ? 0 : (actorData.attributes.nivel.value > 14 ? 6 : (actorData.attributes.nivel.value > 6 ? 4 : 2));
			let abilityMod = actorData.atributos[data.data.ability].mod;
			let armorPen = false ? 0 : 0;

			data.data.total = halfLevel + training + abilityMod + data.data.bonus + armorPen;
		}
	}

	async addAprimoramento({custo = 0, tipo = "Truque", ativo = false, formula = "", description = "", id = null } = {}) {
		const data = duplicate(this.data.data);
		const aprimoramentos = data.aprimoramentos;
		id  = id ?? ([1e7] + -1e3 + -4e3 + - 8e3 + -1e11).replace(/[018]/g, c => (
			c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
		aprimoramentos.push({
			custo,
			tipo,
			ativo,
			formula,
			description,
			id
		});

		console.log("Adicionando aprimoramento ao item");

		await this.update({["data.aprimoramentos"]: aprimoramentos});
	}

	async deleteAprimoramento(id) {
		const aprimoramentos = this.data.data.aprimoramentos.filter(mod => mod.id !== id);
		await this.update({"data.aprimoramentos": aprimoramentos});
	}

	editAprimoramento(id) {
		const aprimoramentos = duplicate(this.data.data.aprimoramentos);
		const aprimoramento = aprimoramentos.find(mod => mod.id === id);
		new AprimoramentoApplication(aprimoramento, this, {}, this.actor).render(true);
	}

	/* -------------------------------------------- */
	/*  Chat Message Helpers                        */
	/* -------------------------------------------- */

	static chatListeners(html) {
		html.on('click', '.item-name', this._onChatCardToggleContent.bind(this));
	}

	/* -------------------------------------------- */

	/**
	* Handle toggling the visibility of chat card content when the name is clicked
	* @param {Event} event   The originating click event
	* @private
	*/
	static _onChatCardToggleContent(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const card = header.closest(".chat-card");
		const content = card.querySelector(".card-content");
		content.style.display = content.style.display === "none" ? "block" : "none";
	}

	/* -------------------------------------------- */
}