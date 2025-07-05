/* FROM 5e */
/* -------------------------------------------- */
/*  Config Pre-Localization                     */
/* -------------------------------------------- */

/**
 * Storage for pre-localization configuration.
 * @type {object}
 * @private
 */
const _preLocalizationRegistrations = {};

/**
 * Mark the provided config key to be pre-localized during the init stage.
 * @param {string} configKey              Key within `CONFIG.T20` to localize.
 * @param {object} [options={}]
 * @param {string} [options.key]          If each entry in the config enum is an object,
 *                                        localize and sort using this property.
 * @param {string[]} [options.keys=[]]    Array of localization keys. First key listed will be used for sorting
 *                                        if multiple are provided.
 * @param {boolean} [options.sort=false]  Sort this config enum, using the key if set.
 */
export function preLocalize(configKey, { key, keys = [], sort = false } = {}) {
	if (key) keys.unshift(key);
	_preLocalizationRegistrations[configKey] = { keys, sort };
}

/* -------------------------------------------- */

/**
 * Execute previously defined pre-localization tasks on the provided config object.
 * @param {object} config  The `CONFIG.T20` object to localize and sort. *Will be mutated.*
 */
export function performPreLocalization(config) {
	for (const [key, settings] of Object.entries(_preLocalizationRegistrations)) {
		_localizeObject(config[key], settings.keys);
		if (settings.sort) config[key] = sortObjectEntries(config[key], settings.keys[0]);
	}
}

/* -------------------------------------------- */

/**
 * Sort the provided object by its values or by an inner sortKey.
 * @param {object} obj                 The object to sort.
 * @param {string|Function} [sortKey]  An inner key upon which to sort or sorting function.
 * @returns {object}                   A copy of the original object that has been sorted.
 */
export function sortObjectEntries(obj, sortKey) {
	let sorted = Object.entries(obj);
	const sort = (lhs, rhs) =>
		foundry.utils.getType(lhs) === "string" ? lhs.localeCompare(rhs, game.i18n.lang) : lhs - rhs;
	if (foundry.utils.getType(sortKey) === "function") sorted = sorted.sort((lhs, rhs) => sortKey(lhs[1], rhs[1]));
	else if (sortKey) sorted = sorted.sort((lhs, rhs) => sort(lhs[1][sortKey], rhs[1][sortKey]));
	else sorted = sorted.sort((lhs, rhs) => sort(lhs[1], rhs[1]));
	return Object.fromEntries(sorted);
}

/* -------------------------------------------- */

/**
 * Localize the values of a configuration object by translating them in-place.
 * @param {object} obj       The configuration object to localize.
 * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
 * @private
 */
function _localizeObject(obj, keys) {
	for (const [k, v] of Object.entries(obj)) {
		const type = typeof v;
		if (type === "string") {
			obj[k] = game.i18n.localize(v);
			continue;
		}

		if (type !== "object") {
			console.error(
				new Error(`Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`)
			);
			continue;
		}
		if (!keys?.length) {
			console.error(new Error("Localization keys must be provided for pre-localizing when target is an object."));
			continue;
		}

		for (const key of keys) {
			if (!v[key]) continue;
			v[key] = game.i18n.localize(v[key]);
		}
	}
}

export function uuidToObject(uuid) {
	uuid.split(".").reduce(function (result, value, index, array) {
		if (!value) value = `undefined${index}`;
		if (index % 2 === 0) result[value] = array[index + 1];
		return result;
	}, {});
}

export function stringify(obj) {
	return JSON.stringify(obj, null, 3);
}

/**
 * Tira o plural de palavras em Português.
 * Atenção para palavras terminadas em "us", que geralmente não estão no plural (deus, virus, ônibus, bônus).
 * @param {string} palavra
 * @param {boolean} pulaUS	Determina se a "us" deve ser considerado plural ou não.
 * @returns {string}
 */
export function despluralizar(palavra, pulaUS = true) {
	if (palavra.endsWith("ões") || palavra.endsWith("ães")) {
		return `${palavra.slice(0, -3)}ão`;
	} else if (palavra.endsWith("is") && palavra.length > 3) {
		return `${palavra.slice(0, -2)}l`;
	} else if (palavra.endsWith("res")) {
		return palavra.slice(0, -2);
	} else if (palavra.endsWith("ses")) {
		return palavra.slice(0, -2);
	} else if (palavra.endsWith("s") && (!pulaUS || !palavra.endsWith("us"))) {
		return palavra.slice(0, -1);
	}
	return palavra;
}

export function wordToNumber(str) {
	return (
		{
			zero: 0,
			um: 1,
			uma: 1,
			dois: 2,
			duas: 2,
			três: 3,
			quatro: 4,
			cinco: 5,
			seis: 6,
			sete: 7,
			oito: 8,
			nove: 9,
			dez: 10
		}[str.toLowerCase()] ?? 1
	);
}

export function fontAwesomeIcon(glyph, { style = "solid", fixedWidth = false } = {}) {
	const styleClass = `fa-${style}`;
	const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
	const icon = document.createElement("i");
	icon.classList.add(styleClass, glyphClass);
	if (fixedWidth) icon.classList.add("fa-fw");

	return icon;
}

export function htmlQuery(parent, selectors) {
	if (!(parent instanceof Element || parent instanceof Document)) return null;
	return parent.querySelector(selectors);
}

export function createHTMLElement(nodeName, { classes = [], dataset = {}, children = [], innerHTML } = {}) {
	const element = document.createElement(nodeName);
	if (classes.length > 0) element.classList.add(...classes);

	for (const [key, value] of Object.entries(dataset).filter(([, v]) => v !== false)) {
		element.dataset[key] = value === true ? "" : String(value);
	}

	if (innerHTML) {
		element.innerHTML = innerHTML;
	} else {
		for (const child of children) {
			const childElement = child instanceof HTMLElement ? child : new Text(child);
			element.appendChild(childElement);
		}
	}

	return element;
}

/**
 * Convert a bonus value to a simple integer for displaying on the sheet.
 * @param {number|string|null} bonus  Bonus formula.
 * @param {object} [data={}]          Data to use for replacing @ strings.
 * @returns {number}                  Simplified bonus as an integer.
 * @protected
 */
export function simplifyBonus(bonus, data = {}) {
	if (!bonus) return 0;
	if (Number.isNumeric(bonus)) return Number(bonus);
	try {
		const roll = new Roll(bonus, data);
		return roll.isDeterministic ? roll.evaluateSync().total : 0;
	} catch (error) {
		console.error(error);
		return 0;
	}
}

export function parseFraction(fraction) {
	let [num, denom] = fraction.split("/").map(Number);
	denom = isNaN(denom) || denom === 0 ? 1 : denom;
	return num / denom;
}
