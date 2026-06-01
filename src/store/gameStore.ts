import { create } from 'zustand'
import { GENERATORS } from '../data/generators'
import { UPGRADES, UpgradeEffectState } from '../data/upgrades'
import { MENTORS } from '../data/mentors'
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
  resetSave: () => void
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
    lastSavedAt: saved.lastSavedAt,
  }
  return { ...base, ...buildDerived(base) }
}

function initialState() {
  return {
    crayons: 0,
    lifetimeCrayons: 0,
    totalClicks: 0,
    generators: {} as Record<string, number>,
    purchasedUpgrades: [] as string[],
    unlockedMentors: [] as string[],
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
      init = {
        ...loaded,
        crayons: loaded.crayons + offlineGain,
        lifetimeCrayons: loaded.lifetimeCrayons + offlineGain,
        lastSavedAt: Date.now(),
        offlineMessage,
        ...buildDerived({
          ...loaded,
          lifetimeCrayons: loaded.lifetimeCrayons + offlineGain,
        }),
      }
    } else {
      init = { ...loaded, offlineMessage: null }
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
        return { ...next, ...buildDerived({ ...s, ...next }) }
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
        return { ...next, ...buildDerived({ ...state, ...next }) }
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
        return { ...next, ...buildDerived({ ...state, ...next }) }
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
        return { ...next, ...buildDerived({ ...s, ...next }) }
      })
    },

    dismissOfflineMessage() {
      set({ offlineMessage: null })
    },

    resetSave() {
      deleteSave()
      const fresh = initialState()
      set(fresh)
    },
  }
})
