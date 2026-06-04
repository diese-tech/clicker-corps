import { create } from 'zustand'
import { GENERATORS } from '../data/generators'
import { UPGRADES, UpgradeEffectState } from '../data/upgrades'
import { MENTORS } from '../data/mentors'
import { ACHIEVEMENTS, AchievementContext } from '../data/achievements'
import { getRank } from '../data/ranks'
import { generatorCost } from '../utils/math'
import { loadSave, writeSave, deleteSave, SaveState } from '../utils/save'

const MAX_OFFLINE_SECONDS = 60 * 60 * 8

interface GameState {
  crayons: number
  lifetimeCrayons: number
  totalClicks: number
  generators: Record<string, number>
  purchasedUpgrades: string[]
  unlockedMentors: string[]
  unlockedAchievements: string[]
  pendingAchievements: string[]
  lastSavedAt: number
  offlineMessage: string | null

  // Derived
  cps: number
  crayonsPerClick: number
  rank: string

  // Actions
  click: () => void
  buyGenerator: (id: string) => void
  buyUpgrade: (id: string) => void
  tick: (deltaSeconds: number) => void
  dismissOfflineMessage: () => void
  dismissAchievementToast: () => void
  resetSave: () => void
}

interface AchievementResult {
  unlockedAchievements: string[]
  pendingAchievements: string[]
}

// Evaluates achievement predicates against the latest state. Newly unlocked
// ids are appended to both the persistent unlocked list and the transient
// toast queue. When `announce` is false (e.g. on load), unlocks are recorded
// silently without queueing a toast — this avoids spamming notifications for
// progress made in a previous session.
function evalAchievements(
  ctx: AchievementContext,
  unlocked: string[],
  pending: string[],
  announce = true
): AchievementResult {
  let newlyUnlocked: string[] | null = null
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.includes(a.id) && a.check(ctx)) {
      ;(newlyUnlocked ??= []).push(a.id)
    }
  }
  if (!newlyUnlocked) return { unlockedAchievements: unlocked, pendingAchievements: pending }
  return {
    unlockedAchievements: [...unlocked, ...newlyUnlocked],
    pendingAchievements: announce ? [...pending, ...newlyUnlocked] : pending,
  }
}

// Convenience wrapper: derives the achievement context from a fully-merged
// state object and evaluates against its current unlocked/pending lists.
function checkAchievements(
  merged: Pick<
    GameState,
    | 'lifetimeCrayons'
    | 'totalClicks'
    | 'generators'
    | 'purchasedUpgrades'
    | 'unlockedMentors'
    | 'cps'
    | 'unlockedAchievements'
    | 'pendingAchievements'
  >
): AchievementResult {
  const ctx: AchievementContext = {
    lifetimeCrayons: merged.lifetimeCrayons,
    totalClicks: merged.totalClicks,
    generators: merged.generators,
    purchasedUpgrades: merged.purchasedUpgrades,
    unlockedMentors: merged.unlockedMentors,
    cps: merged.cps,
  }
  return evalAchievements(ctx, merged.unlockedAchievements, merged.pendingAchievements)
}

function computeEffects(purchased: string[]): UpgradeEffectState {
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

function computeCps(
  generators: Record<string, number>,
  effects: UpgradeEffectState,
  unlockedMentors: string[]
): number {
  let cps = GENERATORS.reduce((sum, g) => {
    const owned = generators[g.id] ?? 0
    const mult = effects.generatorMultipliers[g.id] ?? 1
    return sum + owned * g.baseCps * mult
  }, 0)

  cps *= effects.globalCpsMultiplier

  const mentorBonus = unlockedMentors.reduce((sum, mid) => {
    const m = MENTORS.find((x) => x.id === mid)
    return sum + (m?.cpsBonus ?? 0)
  }, 0)
  cps *= 1 + mentorBonus

  return cps
}

function buildDerived(
  state: Pick<GameState, 'generators' | 'purchasedUpgrades' | 'unlockedMentors' | 'lifetimeCrayons'>
) {
  const effects = computeEffects(state.purchasedUpgrades)
  return {
    cps: computeCps(state.generators, effects, state.unlockedMentors),
    crayonsPerClick: effects.clickMultiplier,
    rank: getRank(state.lifetimeCrayons),
  }
}

function fromSave(saved: SaveState) {
  const base = {
    crayons: saved.crayons,
    lifetimeCrayons: saved.lifetimeCrayons,
    totalClicks: saved.totalClicks,
    generators: saved.generators,
    purchasedUpgrades: saved.purchasedUpgrades,
    unlockedMentors: saved.unlockedMentors,
    unlockedAchievements: saved.unlockedAchievements ?? [],
    lastSavedAt: saved.lastSavedAt,
  }
  const derived = buildDerived(base)
  // Silently reconcile achievements already earned (covers saves written
  // before achievements existed). No toast queue on load.
  const { unlockedAchievements } = evalAchievements(
    { ...base, cps: derived.cps },
    base.unlockedAchievements,
    [],
    false
  )
  return { ...base, ...derived, unlockedAchievements }
}

function initialState() {
  return {
    crayons: 0,
    lifetimeCrayons: 0,
    totalClicks: 0,
    generators: {} as Record<string, number>,
    purchasedUpgrades: [] as string[],
    unlockedMentors: [] as string[],
    unlockedAchievements: [] as string[],
    pendingAchievements: [] as string[],
    lastSavedAt: Date.now(),
    cps: 0,
    crayonsPerClick: 1,
    rank: 'Recruit',
    offlineMessage: null as string | null,
  }
}

export const useGameStore = create<GameState>((set, get) => {
  // Load save and apply offline progress on init
  const saved = loadSave()
  let init = initialState()
  let offlineMessage: string | null = null

  if (saved) {
    const elapsed = Math.min((Date.now() - saved.lastSavedAt) / 1000, MAX_OFFLINE_SECONDS)
    const loaded = fromSave(saved)
    const offlineGain = loaded.cps * elapsed

    if (offlineGain > 0.5) {
      const gained = Math.floor(offlineGain)
      offlineMessage = `While you were gone, the Corps consumed ${gained.toLocaleString()} crayons.`
      const newLifetime = loaded.lifetimeCrayons + offlineGain
      const derived = buildDerived({ ...loaded, lifetimeCrayons: newLifetime })
      // Offline gains can cross achievement thresholds — record them silently.
      const { unlockedAchievements } = evalAchievements(
        { ...loaded, lifetimeCrayons: newLifetime, cps: derived.cps },
        loaded.unlockedAchievements,
        [],
        false
      )
      init = {
        ...loaded,
        crayons: loaded.crayons + offlineGain,
        lifetimeCrayons: newLifetime,
        lastSavedAt: Date.now(),
        offlineMessage,
        unlockedAchievements,
        pendingAchievements: [],
        ...derived,
      }
    } else {
      init = { ...loaded, pendingAchievements: [], offlineMessage: null }
    }
  }

  // Autosave helper
  let saveTimer: ReturnType<typeof setInterval> | null = null
  function startAutosave() {
    if (saveTimer) return
    saveTimer = setInterval(() => {
      const s = get()
      writeSave({
        crayons: s.crayons,
        lifetimeCrayons: s.lifetimeCrayons,
        totalClicks: s.totalClicks,
        generators: s.generators,
        purchasedUpgrades: s.purchasedUpgrades,
        unlockedMentors: s.unlockedMentors,
        unlockedAchievements: s.unlockedAchievements,
        lastSavedAt: Date.now(),
      })
    }, 5000)
  }
  startAutosave()

  return {
    ...init,

    click() {
      set((s) => {
        const gained = s.crayonsPerClick
        const newLifetime = s.lifetimeCrayons + gained
        const newClicks = s.totalClicks + 1

        // Check mentor unlocks
        const newMentors = [...s.unlockedMentors]
        for (const m of MENTORS) {
          if (!newMentors.includes(m.id) && newLifetime >= m.unlockAt) {
            newMentors.push(m.id)
          }
        }

        const next = {
          crayons: s.crayons + gained,
          lifetimeCrayons: newLifetime,
          totalClicks: newClicks,
          unlockedMentors: newMentors,
        }
        const merged = { ...s, ...next, ...buildDerived({ ...s, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    buyGenerator(id: string) {
      const s = get()
      const def = GENERATORS.find((g) => g.id === id)
      if (!def) return
      const effects = computeEffects(s.purchasedUpgrades)
      const owned = s.generators[id] ?? 0
      const cost = generatorCost(def.baseCost, owned, effects.generatorCostMultiplier)
      if (s.crayons < cost) return

      set((state) => {
        const newGenerators = { ...state.generators, [id]: (state.generators[id] ?? 0) + 1 }
        const next = { crayons: state.crayons - cost, generators: newGenerators }
        const merged = { ...state, ...next, ...buildDerived({ ...state, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    buyUpgrade(id: string) {
      const s = get()
      const def = UPGRADES.find((u) => u.id === id)
      if (!def || s.purchasedUpgrades.includes(id)) return
      if (s.crayons < def.cost) return

      set((state) => {
        const newPurchased = [...state.purchasedUpgrades, id]
        const next = { crayons: state.crayons - def.cost, purchasedUpgrades: newPurchased }
        const merged = { ...state, ...next, ...buildDerived({ ...state, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    tick(deltaSeconds: number) {
      set((s) => {
        if (s.cps === 0) return {}
        const gained = s.cps * deltaSeconds
        const newLifetime = s.lifetimeCrayons + gained

        // Check mentor unlocks
        const newMentors = [...s.unlockedMentors]
        for (const m of MENTORS) {
          if (!newMentors.includes(m.id) && newLifetime >= m.unlockAt) {
            newMentors.push(m.id)
          }
        }

        const next = {
          crayons: s.crayons + gained,
          lifetimeCrayons: newLifetime,
          unlockedMentors: newMentors,
        }
        const merged = { ...s, ...next, ...buildDerived({ ...s, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    dismissOfflineMessage() {
      set({ offlineMessage: null })
    },

    dismissAchievementToast() {
      set((s) => ({ pendingAchievements: s.pendingAchievements.slice(1) }))
    },

    resetSave() {
      deleteSave()
      const fresh = initialState()
      set(fresh)
    },
  }
})
