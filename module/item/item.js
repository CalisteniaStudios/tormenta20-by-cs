import { T20Utility } from '../utility.js';
import ConjurarDialog from "../apps/conjurar-dialog.js";
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

}