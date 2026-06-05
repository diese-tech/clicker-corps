// Standalone verification of the centralized production system.
// Run: npx esbuild scripts/verify-production.ts --bundle --platform=node --format=esm --outfile=/tmp/vp.mjs && node /tmp/vp.mjs
import { GENERATORS } from '../src/data/generators'
import { UPGRADES } from '../src/data/upgrades'
import { MENTORS } from '../src/data/mentors'
import { milestoneMultiplier } from '../src/data/milestones'
import { moraleMultiplier } from '../src/data/achievements'
import { computePrestigeEffects } from '../src/data/prestigeUpgrades'
import {
  ProductionInput,
  computeUpgradeEffects,
  buildProductionContext,
  calculateGeneratorProduction,
  calculateTotalProduction,
} from '../src/store/production'

let failures = 0
function assert(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`)
  } else {
    failures++
    console.log(`  ✗ ${name}  ${detail}`)
  }
}
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b))

// The EXACT pre-refactor HUD formula, transcribed from the old gameStore
// computeCps + buildDerived, used as the oracle to prove no economic change.
function oldHudCps(input: ProductionInput): number {
  const effects = computeUpgradeEffects(input.purchasedUpgrades)
  let cps = GENERATORS.reduce((sum, g) => {
    if (!input.hiredManagers.includes(`mgr_${g.id}`)) return sum
    const owned = input.generators[g.id] ?? 0
    const upgradeMult = effects.generatorMultipliers[g.id] ?? 1
    return sum + owned * g.baseCps * upgradeMult * milestoneMultiplier(owned)
  }, 0)
  cps *= effects.globalCpsMultiplier
  const mentorBonus = input.unlockedMentors.reduce((s, mid) => {
    const m = MENTORS.find((x) => x.id === mid)
    return s + (m?.cpsBonus ?? 0)
  }, 0)
  cps *= 1 + mentorBonus
  const pe = computePrestigeEffects(input.prestigeUpgrades)
  const prestige = 1 + input.commendations * pe.bonusPerCommendation
  const morale = moraleMultiplier(input.unlockedAchievements.length)
  return cps * prestige * pe.cpsMult * morale * (input.buffCpsMult ?? 1)
}

const newTotal = (input: ProductionInput) => calculateTotalProduction(buildProductionContext(input))

// A representative mid-game state: several generators, some managed, a mix of
// generator/global/click upgrades, mentors, prestige, achievements, and a frenzy.
const base: ProductionInput = {
  generators: {
    crayon_box: 120,        // milestone ×4 (>=100)
    px_run: 55,             // milestone ×2 (>=50)
    supply_sergeant: 30,    // milestone ×2 (>=25)
    motor_pool_cache: 25,   // milestone ×2 (>=25)
    fire_team_forage: 10,   // no milestone, no NCO (tap-driven)
  },
  purchasedUpgrades: UPGRADES.slice(0, 6).map((u) => u.id),
  unlockedMentors: [MENTORS[0].id, MENTORS[1].id],
  hiredManagers: ['mgr_crayon_box', 'mgr_px_run', 'mgr_supply_sergeant', 'mgr_motor_pool_cache'],
  commendations: 7,
  prestigeUpgrades: ['veteran_instincts', 'well_oiled_machine'],
  unlockedAchievements: ['a', 'b', 'c', 'd', 'e'],
  buffCpsMult: 7, // active CPS frenzy
}

console.log('Parity with the pre-refactor HUD formula (no economic change):')
assert('mid-game state matches old formula', close(newTotal(base), oldHudCps(base)), `new=${newTotal(base)} old=${oldHudCps(base)}`)
assert('no buffs matches old formula', close(newTotal({ ...base, buffCpsMult: 1 }), oldHudCps({ ...base, buffCpsMult: 1 })))
assert('no managers ⇒ 0 (tap-driven only)', newTotal({ ...base, hiredManagers: [] }) === 0)

console.log('\nConsistency: SUM(generator row production) === HUD total:')
const ctx = buildProductionContext(base)
const sumRows = GENERATORS.reduce((s, g) => s + calculateGeneratorProduction(g.id, ctx), 0)
assert('sum of per-generator rows equals total', close(sumRows, calculateTotalProduction(ctx)), `sum=${sumRows} total=${calculateTotalProduction(ctx)}`)
assert('unmanaged generator contributes 0 to total', calculateGeneratorProduction('fire_team_forage', ctx) === 0)
assert('managed generator contributes > 0', calculateGeneratorProduction('crayon_box', ctx) > 0)

console.log('\nEvery modifier flows through (production strictly increases):')
const t0 = newTotal(base)
// Milestone: push px_run from 55 (×2) to 100 (×4).
assert('milestone unlock increases total', newTotal({ ...base, generators: { ...base.generators, px_run: 100 } }) > t0)
// Generator-specific upgrade: bulk_rations doubles crayon_box (it's managed).
assert('generator upgrade increases total', newTotal({ ...base, purchasedUpgrades: [...base.purchasedUpgrades, 'bulk_rations'] }) > t0)
// Global upgrade: motivated_formation ×2 global.
assert('global upgrade increases total', newTotal({ ...base, purchasedUpgrades: [...base.purchasedUpgrades, 'motivated_formation'] }) > t0)
// Prestige: another commendation.
assert('prestige (commendation) increases total', newTotal({ ...base, commendations: base.commendations + 1 }) > t0)
// Prestige cpsMult: industrial complex ×3.
assert('prestige cpsMult increases total', newTotal({ ...base, prestigeUpgrades: [...base.prestigeUpgrades, 'industrial_complex'] }) > t0)
// Morale: one more achievement.
assert('morale (achievement) increases total', newTotal({ ...base, unlockedAchievements: [...base.unlockedAchievements, 'f'] }) > t0)
// Mentor: add a third mentor.
assert('mentor bonus increases total', newTotal({ ...base, unlockedMentors: [...base.unlockedMentors, MENTORS[2].id] }) > t0)
// Frenzy: a ×2 buff exactly doubles output.
assert('×2 frenzy exactly doubles total', close(newTotal({ ...base, buffCpsMult: base.buffCpsMult! * 2 }), t0 * 2))

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
