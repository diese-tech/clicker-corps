import { GENERATORS } from '../data/generators'
import { UPGRADES, UpgradeEffectState } from '../data/upgrades'
import { MENTORS } from '../data/mentors'
import { milestoneMultiplier } from '../data/milestones'
import { moraleMultiplier } from '../data/achievements'
import { computePrestigeEffects } from '../data/prestigeUpgrades'

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all crayon-production math.
//
// Every surface that shows or banks production — the HUD "PER SEC" total, each
// generator row, the per-tick payout loop, and the offline-catch-up loop —
// derives its numbers from the helpers below. Before this module existed each
// of those had its OWN formula, and the generator rows used a partial one
// (`owned * baseCps * milestoneMult`) that silently dropped every upgrade,
// global, mentor, prestige, morale, and frenzy multiplier — so a row never
// moved when those changed. Centralizing the math guarantees the row and the
// HUD can never diverge and no modifier can be dropped from one path.
//
// The effective per-second output of a single generator is:
//
//   owned
//   × baseCps
//   × generator-upgrade multiplier   (per-generator "Mark" upgrades)
//   × quantity-milestone multiplier  (25/50/100/... owned ⇒ ×2 each)
//   × globalProductionFactor         (everything below)
//
// where globalProductionFactor folds in every modifier that applies regardless
// of which generator produced the crayon:
//
//   global CPS upgrades
//   × mentor bonus            (1 + Σ cpsBonus)
//   × prestige commendation bonus (1 + commendations × bonusPerCommendation)
//   × permanent prestige cpsMult
//   × achievement morale      (1 + achievements × 0.01)
//   × active CPS frenzy        (event / weekly-morale timed buffs)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductionInput {
  generators: Record<string, number>
  purchasedUpgrades: string[]
  unlockedMentors: string[]
  hiredManagers: string[]
  commendations: number
  prestigeUpgrades: string[]
  unlockedAchievements: string[]
  // Multiplier from any active timed CPS frenzy (event / weekly morale). 1 = none.
  buffCpsMult?: number
}

// Folds the player's purchased run-upgrades into a single effect bundle:
// click multiplier, per-generator multipliers, global CPS multiplier, and
// generator cost multiplier.
export function computeUpgradeEffects(purchased: string[]): UpgradeEffectState {
  const base: UpgradeEffectState = {
    clickMultiplier: 1,
    generatorMultipliers: {},
    globalCpsMultiplier: 1,
    generatorCostMultiplier: 1,
  }
  return purchased.reduce((acc, id) => {
    const def = UPGRADES.find((u) => u.id === id)
    return def ? def.applyEffect(acc) : acc
  }, base)
}

// The product of every GLOBAL production modifier (see header). `effects` may be
// passed in to avoid recomputing the upgrade bundle when the caller already has it.
export function globalProductionFactor(
  input: ProductionInput,
  effects: UpgradeEffectState = computeUpgradeEffects(input.purchasedUpgrades)
): number {
  const pe = computePrestigeEffects(input.prestigeUpgrades)
  const prestige = 1 + input.commendations * pe.bonusPerCommendation
  const morale = moraleMultiplier(input.unlockedAchievements.length)
  const mentorBonus = input.unlockedMentors.reduce((sum, mid) => {
    const m = MENTORS.find((x) => x.id === mid)
    return sum + (m?.cpsBonus ?? 0)
  }, 0)
  return (
    effects.globalCpsMultiplier *
    (1 + mentorBonus) *
    prestige *
    pe.cpsMult *
    morale *
    (input.buffCpsMult ?? 1)
  )
}

// Precomputed context so per-generator lookups inside a render/tick loop are
// cheap and every generator shares ONE evaluation of the global modifiers.
export interface ProductionContext {
  generators: Record<string, number>
  hiredManagers: string[]
  effects: UpgradeEffectState
  globalFactor: number
}

export function buildProductionContext(input: ProductionInput): ProductionContext {
  const effects = computeUpgradeEffects(input.purchasedUpgrades)
  return {
    generators: input.generators,
    hiredManagers: input.hiredManagers,
    effects,
    globalFactor: globalProductionFactor(input, effects),
  }
}

// The output rate (crayons/sec) a generator sustains WHILE its cycle is running,
// with every applicable modifier applied. The quantity-milestone multiplier is
// the cycle-SPEED effect (×N faster cycles ⇒ ×N effective rate), which is why it
// belongs in the rate here even though the per-cycle payout in tick() omits it.
export function generatorEffectiveRate(id: string, ctx: ProductionContext): number {
  const g = GENERATORS.find((x) => x.id === id)
  if (!g) return 0
  const owned = ctx.generators[id] ?? 0
  if (owned === 0) return 0
  const upgradeMult = ctx.effects.generatorMultipliers[id] ?? 1
  const milestoneMult = milestoneMultiplier(owned)
  return owned * g.baseCps * upgradeMult * milestoneMult * ctx.globalFactor
}

// The crayons/sec a generator is ACTUALLY contributing to passive income right
// now. Only NCO-managed generators auto-cycle; un-managed ones are tap-driven
// and contribute nothing passively, so they report 0. This is the per-row
// figure — summing it over all generators yields exactly the HUD total.
export function calculateGeneratorProduction(id: string, ctx: ProductionContext): number {
  if (!ctx.hiredManagers.includes(`mgr_${id}`)) return 0
  return generatorEffectiveRate(id, ctx)
}

// Total passive crayons/sec — the HUD "PER SEC" value. Equal to the sum of
// every generator's calculateGeneratorProduction, by construction.
export function calculateTotalProduction(ctx: ProductionContext): number {
  return GENERATORS.reduce((sum, g) => sum + calculateGeneratorProduction(g.id, ctx), 0)
}
