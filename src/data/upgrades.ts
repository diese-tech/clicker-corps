export interface UpgradeDef {
  id: string
  name: string
  cost: number
  flavor: string
  unlockCondition: (lifetimeCrayons: number, generators: Record<string, number>) => boolean
  applyEffect: (state: UpgradeEffectState) => UpgradeEffectState
}

export interface UpgradeEffectState {
  clickMultiplier: number
  generatorMultipliers: Record<string, number>
  globalCpsMultiplier: number
  generatorCostMultiplier: number
}

// Helper for the common "double a single generator's output" upgrade.
function doubleGenerator(id: string) {
  return (s: UpgradeEffectState): UpgradeEffectState => ({
    ...s,
    generatorMultipliers: {
      ...s.generatorMultipliers,
      [id]: (s.generatorMultipliers[id] ?? 1) * 2,
    },
  })
}

export const UPGRADES: UpgradeDef[] = [
  {
    id: 'better_crayons',
    name: 'Better Crayons',
    cost: 100,
    flavor: 'The red ones taste faster.',
    unlockCondition: (lifetime) => lifetime >= 50,
    applyEffect: (s) => ({ ...s, clickMultiplier: s.clickMultiplier * 2 }),
  },
  {
    id: 'bulk_rations',
    name: 'Bulk Rations',
    cost: 500,
    flavor: 'Now issued by the case.',
    unlockCondition: (_lifetime, generators) => (generators['crayon_box'] ?? 0) >= 5,
    applyEffect: doubleGenerator('crayon_box'),
  },
  {
    id: 'motivated_formation',
    name: 'Motivated Formation',
    cost: 2500,
    flavor: 'Somehow yelling helped.',
    unlockCondition: (lifetime) => lifetime >= 1000,
    applyEffect: (s) => ({ ...s, globalCpsMultiplier: s.globalCpsMultiplier * 2 }),
  },
  {
    id: 'field_day_ready',
    name: 'Field Day Ready',
    cost: 10000,
    flavor: 'Clean room, clean logistics.',
    unlockCondition: (_lifetime, generators) =>
      Object.values(generators).reduce((a, b) => a + b, 0) >= 10,
    applyEffect: (s) => ({ ...s, generatorCostMultiplier: s.generatorCostMultiplier * 0.9 }),
  },
  {
    id: 'crayon_sharpener',
    name: 'Crayon Sharpener',
    cost: 8000,
    flavor: 'Sharpened to a fine, edible point.',
    unlockCondition: (lifetime) => lifetime >= 5000,
    applyEffect: (s) => ({ ...s, clickMultiplier: s.clickMultiplier * 2 }),
  },
  {
    id: 'px_loyalty_card',
    name: 'PX Loyalty Card',
    cost: 6000,
    flavor: 'Earn points redeemable for more points.',
    unlockCondition: (_lifetime, generators) => (generators['px_run'] ?? 0) >= 10,
    applyEffect: doubleGenerator('px_run'),
  },
  {
    id: 'supply_racket',
    name: 'Supply Racket',
    cost: 60000,
    flavor: 'Allegedly. Nothing was ever proven.',
    unlockCondition: (_lifetime, generators) => (generators['supply_sergeant'] ?? 0) >= 10,
    applyEffect: doubleGenerator('supply_sergeant'),
  },
  {
    id: 'motor_pool_grease',
    name: 'Motor Pool Grease',
    cost: 600000,
    flavor: 'The squeaky wheel gets the crayons.',
    unlockCondition: (_lifetime, generators) => (generators['motor_pool_cache'] ?? 0) >= 10,
    applyEffect: doubleGenerator('motor_pool_cache'),
  },
  {
    id: 'esprit_de_corps',
    name: 'Esprit de Corps',
    cost: 2000000,
    flavor: 'Yelling, but organized.',
    unlockCondition: (lifetime) => lifetime >= 1000000,
    applyEffect: (s) => ({ ...s, globalCpsMultiplier: s.globalCpsMultiplier * 2 }),
  },
  {
    id: 'fire_team_protein',
    name: 'Fire Team Protein',
    cost: 6500000,
    flavor: 'Gains. Tactical, waxy gains.',
    unlockCondition: (_lifetime, generators) => (generators['fire_team_forage'] ?? 0) >= 10,
    applyEffect: doubleGenerator('fire_team_forage'),
  },
  {
    id: 'logistics_doctrine',
    name: 'Logistics Doctrine',
    cost: 100000000,
    flavor: 'A 400-page manual nobody read, but it works.',
    unlockCondition: (lifetime) => lifetime >= 50000000,
    applyEffect: (s) => ({ ...s, globalCpsMultiplier: s.globalCpsMultiplier * 2 }),
  },
  {
    id: 'squad_tactics',
    name: 'Squad Tactics',
    cost: 70000000,
    flavor: 'Bounding overwatch, but for snacks.',
    unlockCondition: (_lifetime, generators) => (generators['squad_supply_drop'] ?? 0) >= 10,
    applyEffect: doubleGenerator('squad_supply_drop'),
  },
  {
    id: 'industrial_efficiency',
    name: 'Industrial Efficiency',
    cost: 250000000,
    flavor: 'Economies of scale, achieved entirely by accident.',
    unlockCondition: (_lifetime, generators) =>
      Object.values(generators).reduce((a, b) => a + b, 0) >= 50,
    applyEffect: (s) => ({ ...s, generatorCostMultiplier: s.generatorCostMultiplier * 0.9 }),
  },
  {
    id: 'semper_supply',
    name: 'Semper Supply',
    cost: 20000000000,
    flavor: 'Always faithful. Always resupplying.',
    unlockCondition: (lifetime) => lifetime >= 10000000000,
    applyEffect: (s) => ({ ...s, globalCpsMultiplier: s.globalCpsMultiplier * 2 }),
  },
]
