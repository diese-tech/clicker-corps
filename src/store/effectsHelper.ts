import { UPGRADES, UpgradeEffectState } from '../data/upgrades'
import { computePrestigeEffects } from '../data/prestigeUpgrades'

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

// Combined generator cost multiplier from run upgrades and permanent prestige
// upgrades. Used wherever a generator's price is computed.
export function totalCostMultiplier(purchased: string[], prestigeUpgrades: string[]): number {
  return (
    computeEffectsForCostMultiplier(purchased) *
    computePrestigeEffects(prestigeUpgrades).costMult
  )
}
