/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs
 * @return {Promise}      A Promise which resolves once the migration is completed
 */
export const migrateWorld = async function() {
  ui.notifications.info(`Applying Tormenta20 System Migration for version ${game.system.data.version}. Please be patient and do not close your game or shut down your server.`, {permanent: true});

  // Migrate World Items
  for ( let i of game.items.entities ) {
    try {
      const updateData = migrateItemData(i.data);
      if ( !isObjectEmpty(updateData) ) {
        console.log(`Migrating Item entity ${i.name}`);
        await i.update(updateData, {enforceTypes: false});
      }
    } catch(err) {
      err.message = `Failed tormenta20 system migration for Item ${i.name}: ${err.message}`;
      console.error(err);
    }
  }

  // Migrate World Compendium Packs
  for ( let p of game.packs ) {
    if ( p.metadata.package !== "world" ) continue;
    if ( !["Actor", "Item", "Scene"].includes(p.metadata.entity) ) continue;
    await migrateCompendium(p);
  }

  // Set the migration as complete
  game.settings.set("tormenta20", "systemMigrationVersion", game.system.data.version);
  ui.notifications.info(`Tormenta20 System Migration to version ${game.system.data.version} completed!`, {permanent: true});
};

/* -------------------------------------------- */

/**
 * Apply migration rules to all Entities within a single Compendium pack
 * @param pack
 * @return {Promise}
 */
export const migrateCompendium = async function(pack) {
  const entity = pack.metadata.entity;
  if ( !["Item"].includes(entity) ) return;

  // Unlock the pack for editing
  const wasLocked = pack.locked;
  await pack.configure({locked: false});

  // Begin by requesting server-side data model migration and get the migrated content
  await pack.migrate();
  const content = await pack.getContent();

  // Iterate over compendium entries - applying fine-tuned migration functions
  for ( let ent of content ) {
    let updateData = {};
    try {
      switch (entity) {
        case "Item":
          updateData = migrateItemData(ent.data);
          break;
      }
      if ( isObjectEmpty(updateData) ) continue;

      // Save the entry, if data was changed
      updateData["_id"] = ent._id;
      await pack.updateEntity(updateData);
      console.log(`Migrated ${entity} entity ${ent.name} in Compendium ${pack.collection}`);
    }

    // Handle migration failures
    catch(err) {
      err.message = `Failed dnd5e system migration for entity ${ent.name} in pack ${pack.collection}: ${err.message}`;
      console.error(err);
    }
  }

  // Apply the original locked status for the pack
  pack.configure({locked: wasLocked});
  console.log(`Migrated all ${entity} entities from Compendium ${pack.collection}`);
};

/**
 * Migrate a single Item entity to incorporate latest data model changes
 * @param item
 */
export const migrateItemData = function(item) {
  const updateData = {};
  _migrateFeat(item, updateData);
  _migrateItemArmor(item, updateData);
  _migrateItemWeapon(item, updateData);
  return updateData;
};

function _migrateFeat(item, updateData) {
  if ( item.type != "poder" ) return;
  let nome = item.data.tipo.split(" - ");
  let subtipo = 0;
  if (nome[0].includes("P. ")) {
    nome[0] = nome[0].substring(3)
  }
  if (nome.length == 2) {
    subtipo = nome[1];
  }
  updateData["data.tipo"] = nome[0].toLowerCase();
  updateData["data.subtipo"] = subtipo;
  return updateData;
}

/**
 * Replaces Armadura to Equip
 * @private
 */
function _migrateItemArmor(item, updateData) {
  if ( item.type != "armadura" ) return;
  updateData["type"] = "equip";
  updateData["data.tipo"] = item.data.data.subtipo != "outros" ? item.data.subtipo : "acessorio";
  updateData["data.-=subtipo"] = null;
  return updateData;
}

function _migrateItemWeapon(item, updateData) {
  if ( item.type != "arma" ) return;
  if (item.data.description.includes("Arma Exótica")) {
    updateData["data.tipoUso"] = "exotica"
  }
  else if (item.data.description.includes("Arma de Fogo")) {
    updateData["data.tipoUso"] = "armaDeFogo"
  }
  else if (item.data.description.includes("Arma Marcial")) {
    updateData["data.tipoUso"] = "marcial"
  }
  else if (item.data.description.includes("Arma Simples")) {
    updateData["data.tipoUso"] = "simples"
  }
  
  if (item.data.propriedades === undefined) {
    updateData["data.propriedades"] = {"adaptavel":false,"agil":false,"alongada":false,"arremesso":false,"ataqueDistancia":false,"duasMaos":false,"dupla":false,"leve":false,"municao":false,"versatil":false}
  }
  
  if(item.data.municao) {
    updateData["data.propriedades.municao"] = true;
  }
  
  if (item.data.description.includes("arma ágil")) {
    updateData["data.propriedades.agil"] = true;
  }
  else if (item.data.description.includes("arma alongada")) {
    updateData["data.propriedades.alongada"] = true;
  }
  if (item.data.description.includes("Ataque à Distância")) {
    updateData["data.propriedades.ataqueDistancia"] = true;
  }
  if (item.data.description.includes("Duas Mãos")) {
    updateData["data.propriedades.duasMaos"] = true;
  }
  else if (item.data.description.includes(" Leve")) {
    updateData["data.propriedades.leve"] = true;
  }
  else if (item.data.description.includes("arma dupla")) {
    updateData["data.propriedades.dupla"] = true;
  }
  if (item.data.description.includes("arma versátil")) {
    updateData["data.propriedades.versatil"] = true;
  }
  updateData["data.-=municao"] = null;
  return updateData;
}
