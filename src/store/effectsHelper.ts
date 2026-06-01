import { UPGRADES, UpgradeEffectState } from '../data/upgrades'

export function computeEffectsForCostMultiplier(purchased: string[]): number {
  const base: UpgradeEffectState = {
    clickMultiplier: 1,
    generatorMultipliers: {},
    globalCpsMultiplier: 1,
    generatorCostMultiplier: 1,
  }
  const effects = purchased.reduce((acc, id) => {
    const def = UPGRADES.find((u) => u.id === id)
    return def ? def.applyEffect(acc) : acc
  }, base)
  return effects.generatorCostMultiplier
}
