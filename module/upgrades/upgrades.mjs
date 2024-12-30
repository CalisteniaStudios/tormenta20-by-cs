import { T20ArmorUpgrades } from "./armor.mjs";
import { T20EsotericUpgrades } from "./esoteric.mjs";
import { T20UpgradesGeneral } from "./general.mjs";
import { T20ToolsUpgrades } from "./tools.mjs";
import { T20WeaponUpgrades } from "./weapon.mjs";

/** Each category has a status property that indicates if
 * the upgrade is implemented or should be manually placed in the sheet.
 * DONE: it's implemented
 * MANUAL: it should be manually placed in the sheet
 * if it's not present, it's not implemented and wasn't analyzed
 */
export const T20Upgrades = {
	weapon: T20WeaponUpgrades,
	armor: T20ArmorUpgrades,
	esoteric: T20EsotericUpgrades,
	tools: T20ToolsUpgrades,
	general: T20UpgradesGeneral
};
