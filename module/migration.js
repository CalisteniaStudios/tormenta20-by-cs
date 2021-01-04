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
  _migrateItemArmor(item, updateData);
  return updateData;
};

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
