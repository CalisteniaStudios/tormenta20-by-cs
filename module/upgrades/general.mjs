export const T20GeneralUpgrades = {};

T20GeneralUpgrades.status = {
	golden: 'DONE',
	gems: 'DONE',
	discreet: 'DONE',
	macabre: 'DONE',
};

T20GeneralUpgrades.golden = {
  name: "T20.ItemUpgradesGoldPlated",
	description: "T20.ItemUpgradesTooltipGoldPlated",
  tint: "#FFD700",
  changes: [
    {
      key: "system.pericias.dipl.bonus",
      value: "2",
      mode: 2,
      priority: 0
    }
  ],
  flags: {
    tormenta20: {
      onuse: false,
      durationScene: false,
      upgrade: "golden",
      self: false,
    }
  },
  disabled: false,
  transfer: true
};

T20GeneralUpgrades.gems = {
  name: "T20.ItemUpgradesGemsStudded",
	description: "T20.ItemUpgradesTooltipGemsStudded",
  tint: "#8B008B",
  changes: [
    {
      key: "system.pericias.enga.bonus",
      value: "2",
      mode: 2,
      priority: 0
    }
  ],
  flags: {
    tormenta20: {
      onuse: false,
      durationScene: false,
      upgrade: "gems",
      self: false,
    }
  },
  disabled: false,
  transfer: true
};

T20GeneralUpgrades.discreet = {
  name: "T20.ItemUpgradesDiscreet",
	description: "T20.ItemUpgradesTooltipDiscreet",
  tint: "#808080",
  changes: [
    {
      key: "system.attributes.carga.bonus",
      value: "-1",
      mode: 2,
      priority: 0
    },
    {
      key: "system.pericias.furt.bonus",
      value: "5",
      mode: 2,
      priority: 0
    }
  ],
  flags: {
    tormenta20: {
      onuse: false,
      durationScene: false,
      upgrade: "discreet",
      self: false,
    }
  },
  disabled: false,
  transfer: true
};

T20GeneralUpgrades.macabre = {
  name: "T20.ItemUpgradesMacabre",
	description: "T20.ItemUpgradesTooltipMacabre",
  tint: "#8B0000",
  changes: [
    {
      key: "system.pericias.inti.bonus",
      value: "2",
      mode: 2,
      priority: 0
    },
    {
      key: "system.pericias.dipl.bonus",
      value: "-2",
      mode: 2,
      priority: 0
    }
  ],
  flags: {
    tormenta20: {
      onuse: false,
      durationScene: false,
      upgrade: "macabre",
      self: false,
    }
  },
  disabled: false,
  transfer: true
};
