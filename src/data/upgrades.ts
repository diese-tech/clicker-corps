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
    applyEffect: (s) => ({
      ...s,
      generatorMultipliers: {
        ...s.generatorMultipliers,
        crayon_box: (s.generatorMultipliers['crayon_box'] ?? 1) * 2,
      },
    }),
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
]
