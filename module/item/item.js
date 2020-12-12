import { T20Utility } from '../utility.js';
import ConjurarDialog from "../apps/conjurar-dialog.js";
import AprimoramentoApplication from "../apps/aprimoramento-app.js";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class T20Item extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.data;
  }

  /* ##### SAGA APRIMORAMENTOS STARFINDER #####*/
  async addAprimoramento({
        custo = 0, 
        tipo = "Truque", 
        ativo = false,
        formula = "", 
        description = "",
        id = null
    } = {}) {
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

  
  /* ##### /SAGA APRIMORAMENTOS STARFINDER #####*/
}