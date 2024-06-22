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
 export function preLocalize(configKey, { key, keys=[], sort=false }={}) {
   if ( key ) keys.unshift(key);
   _preLocalizationRegistrations[configKey] = { keys, sort };
 }
 
 /* -------------------------------------------- */
 
 /**
  * Execute previously defined pre-localization tasks on the provided config object.
  * @param {object} config  The `CONFIG.T20` object to localize and sort. *Will be mutated.*
  */
 export function performPreLocalization(config) {
   for ( const [key, settings] of Object.entries(_preLocalizationRegistrations) ) {
     _localizeObject(config[key], settings.keys);
     if ( settings.sort ) config[key] = sortObjectEntries(config[key], settings.keys[0]);
   }
 }
 
 /* -------------------------------------------- */
 
 /**
  * Localize the values of a configuration object by translating them in-place.
  * @param {object} obj       The configuration object to localize.
  * @param {string[]} [keys]  List of inner keys that should be localized if this is an object.
  * @private
  */
 function _localizeObject(obj, keys) {
   for ( const [k, v] of Object.entries(obj) ) {
     const type = typeof v;
     if ( type === "string" ) {
       obj[k] = game.i18n.localize(v);
       continue;
     }
 
     if ( type !== "object" ) {
       console.error(new Error(
         `Pre-localized configuration values must be a string or object, ${type} found for "${k}" instead.`
       ));
       continue;
     }
     if ( !keys?.length ) {
       console.error(new Error(
         "Localization keys must be provided for pre-localizing when target is an object."
       ));
       continue;
     }
 
     for ( const key of keys ) {
       if ( !v[key] ) continue;
       v[key] = game.i18n.localize(v[key]);
     }
   }
 }

 function name(params) {
  
 }

function findFieldPath(search, dataField){
  if ( search.split('.')[0] !== dataField.fieldPath.split('.')[0] ) return false;
  if ( dataField.fieldPath == search ) {
    return dataField;
  } else if ( dataField.fields ) {
    for (let field of Object.values(dataField.fields) ) {
      const found = findFieldPath( search, field );
      if ( found ) return found;
    }
  }
  return false;
}


export function getDocumentSystemList(document){
  const charKeys = Object.keys(foundry.utils.flattenObject(document.system.toObject()))
  let charKeyLabel = {}

  for (let key of charKeys) {
    let field = findFieldPath( [document.system.schema.fieldPath, key].join('.'), document.system.schema )
    if ( !field ) continue;
    fieldPath = field.fieldPath.split('.');
    fieldPath[0] = 'system'
    fieldPath = fieldPath.join('.');
    charKeyLabel[ fieldPath ] = field.label;
  }
  return charKeyLabel;
}

export function uuidToObject(uuid){
  uuid.split('.').reduce(function(result, value, index, array) {
    if ( !value ) value = `undefined${index}`;
    if (index % 2 === 0)
      result[value] = array[index+1];
    return result;
  }, {});
}

export function stringify(obj){
  return JSON.stringify(obj, null, 3)
}