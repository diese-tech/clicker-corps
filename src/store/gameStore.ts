import { create } from 'zustand'
import { GENERATORS } from '../data/generators'
import { UPGRADES, UpgradeEffectState } from '../data/upgrades'
import { MENTORS } from '../data/mentors'
import { MANAGERS } from '../data/managers'
import { milestoneMultiplier } from '../data/milestones'
import { ACHIEVEMENTS, AchievementContext, moraleMultiplier } from '../data/achievements'
import { prestigePotential } from '../data/prestige'
import { computePrestigeEffects, PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { DEFAULT_THEME, THEMES } from '../data/themes'
import { getRank } from '../data/ranks'
import {
  EventId,
  EVENT_LIFESPAN_MS,
  FRENZY_CLICK_MS,
  FRENZY_CLICK_MULT,
  FRENZY_CPS_MS,
  FRENZY_CPS_MULT,
  pickWeightedEvent,
} from '../data/events'
import { bulkGeneratorCost, maxAffordableGenerators } from '../utils/math'
import { dateKey, dailyAvailable, streakAfterClaim, dailyReward } from '../utils/daily'
import { loadSave, writeSave, deleteSave, SaveState } from '../utils/save'

// Clock-tamper detection: if the device clock is ever seen running more than
// this far BEHIND the highest timestamp we've recorded, the player almost
// certainly time-traveled forward (to bank bonuses) and set the clock back.
// Generous tolerance avoids false positives from NTP corrections / DST.
const CLOCK_TAMPER_TOLERANCE_MS = 10 * 60 * 1000

const TIME_TAMPER_MESSAGE =
  "Nice try, time traveler. The Crayon Inspector General noticed your device clock jump backward. " +
  "Chrono-shenanigans earn you exactly zero bonus crayons and one (1) deeply disappointed Drill Instructor. Carry on, devil."

// Transient, time-limited production buff granted by a collected event.
export interface Buff {
  kind: 'cps' | 'click'
  mult: number
  expiresAt: number
  label: string
}

// On-screen collectible event awaiting a click.
export interface ActiveEvent {
  id: EventId
  label: string
  flavor: string
  // Position as a percentage of the viewport so it renders responsively.
  xPct: number
  yPct: number
  expiresAt: number
}

interface BuffMultipliers {
  cps: number
  click: number
}

const NO_BUFFS: BuffMultipliers = { cps: 1, click: 1 }

function activeBuffMultipliers(buffs: Buff[], now: number): BuffMultipliers {
  let cps = 1
  let click = 1
  for (const b of buffs) {
    if (b.expiresAt <= now) continue
    if (b.kind === 'cps') cps *= b.mult
    else click *= b.mult
  }
  return { cps, click }
}

function pruneBuffs(buffs: Buff[], now: number): Buff[] {
  const live = buffs.filter((b) => b.expiresAt > now)
  return live.length === buffs.length ? buffs : live
}

interface GameState {
  crayons: number
  lifetimeCrayons: number
  totalClicks: number
  generators: Record<string, number>
  purchasedUpgrades: string[]
  unlockedMentors: string[]
  unlockedAchievements: string[]
  pendingAchievements: string[]
  commendations: number
  commendationsEarned: number
  prestigeUpgrades: string[]
  hiredManagers: string[]
  autoBuyEnabled: boolean
  autoBuyUpgrades: boolean
  autoCollectEvents: boolean
  playtimeSeconds: number
  selectedTheme: string
  lastDailyClaimDay: string | null
  dailyStreak: number
  clockHighWater: number
  timeTamperMessage: string | null
  activeBuffs: Buff[]
  activeEvent: ActiveEvent | null
  lastSavedAt: number
  offlineMessage: string | null

  // Derived
  cps: number
  crayonsPerClick: number
  rank: string

  // Actions
  click: () => void
  buyGenerator: (id: string, amount?: number) => void
  buyUpgrade: (id: string) => void
  tick: (deltaSeconds: number) => void
  reenlist: () => void
  buyPrestigeUpgrade: (id: string) => void
  claimDaily: () => void
  hireManager: (id: string) => void
  toggleAutoBuy: () => void
  toggleAutoBuyUpgrades: () => void
  toggleAutoCollectEvents: () => void
  setTheme: (id: string) => void
  dismissTimeTamper: () => void
  spawnEvent: () => void
  collectEvent: () => void
  expireEvent: () => void
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
    | 'commendations'
    | 'hiredManagers'
    | 'prestigeUpgrades'
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
    commendations: merged.commendations,
    hiredManagers: merged.hiredManagers,
    prestigeUpgrades: merged.prestigeUpgrades,
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
    return sum + owned * g.baseCps * mult * milestoneMultiplier(owned)
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
  state: Pick<
    GameState,
    | 'generators'
    | 'purchasedUpgrades'
    | 'unlockedMentors'
    | 'lifetimeCrayons'
    | 'commendations'
    | 'prestigeUpgrades'
    | 'unlockedAchievements'
  >,
  buffs: BuffMultipliers = NO_BUFFS
) {
  const effects = computeEffects(state.purchasedUpgrades)
  const pe = computePrestigeEffects(state.prestigeUpgrades)
  // Passive Commendation bonus (rate set by prestige upgrades) times any
  // permanent prestige production multipliers.
  const prestige = 1 + state.commendations * pe.bonusPerCommendation
  // Morale: each earned achievement nudges all production up.
  const morale = moraleMultiplier(state.unlockedAchievements.length)
  return {
    cps:
      computeCps(state.generators, effects, state.unlockedMentors) *
      prestige *
      pe.cpsMult *
      morale *
      buffs.cps,
    crayonsPerClick: effects.clickMultiplier * prestige * pe.clickMult * morale * buffs.click,
    rank: getRank(state.lifetimeCrayons),
  }
}

// Recomputes derived values with the player's currently-active event buffs
// folded in, so clicks/purchases/ticks all reflect live frenzies.
function deriveWithBuffs(state: Parameters<typeof buildDerived>[0] & { activeBuffs: Buff[] }) {
  return buildDerived(state, activeBuffMultipliers(state.activeBuffs, Date.now()))
}

function fromSave(saved: SaveState) {
  // Heal saves created under the old square-root prestige formula: a player
  // can never have earned more Commendations than the current curve entitles
  // them to for their lifetime crayons. Clamp both the earned total and the
  // spendable balance so old "nuclear" saves snap back to a sane value.
  const earnedCap = prestigePotential(saved.lifetimeCrayons)
  const healedEarned = Math.min(saved.commendationsEarned ?? saved.commendations ?? 0, earnedCap)
  const healedBalance = Math.min(saved.commendations ?? 0, healedEarned)

  const base = {
    crayons: saved.crayons,
    lifetimeCrayons: saved.lifetimeCrayons,
    totalClicks: saved.totalClicks,
    generators: saved.generators,
    purchasedUpgrades: saved.purchasedUpgrades,
    unlockedMentors: saved.unlockedMentors,
    unlockedAchievements: saved.unlockedAchievements ?? [],
    commendations: healedBalance,
    commendationsEarned: healedEarned,
    prestigeUpgrades: saved.prestigeUpgrades ?? [],
    hiredManagers: saved.hiredManagers ?? [],
    autoBuyEnabled: saved.autoBuyEnabled ?? true,
    autoBuyUpgrades: saved.autoBuyUpgrades ?? false,
    autoCollectEvents: saved.autoCollectEvents ?? false,
    playtimeSeconds: saved.playtimeSeconds ?? 0,
    selectedTheme: saved.selectedTheme ?? DEFAULT_THEME,
    lastDailyClaimDay: saved.lastDailyClaimDay ?? null,
    dailyStreak: saved.dailyStreak ?? 0,
    clockHighWater: Math.max(saved.clockHighWater ?? 0, saved.lastSavedAt ?? 0),
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
  return {
    ...base,
    ...derived,
    unlockedAchievements,
    activeBuffs: [] as Buff[],
    activeEvent: null as ActiveEvent | null,
  }
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
    commendations: 0,
    commendationsEarned: 0,
    prestigeUpgrades: [] as string[],
    hiredManagers: [] as string[],
    autoBuyEnabled: true,
    autoBuyUpgrades: false,
    autoCollectEvents: false,
    playtimeSeconds: 0,
    selectedTheme: DEFAULT_THEME,
    lastDailyClaimDay: null as string | null,
    dailyStreak: 0,
    clockHighWater: Date.now(),
    timeTamperMessage: null as string | null,
    activeBuffs: [] as Buff[],
    activeEvent: null as ActiveEvent | null,
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
    const loaded = fromSave(saved)

    // Clock-tamper check: the device clock reading earlier than the highest
    // timestamp we've ever recorded means the player likely time-traveled and
    // set the clock back. Offline gains from a negative elapsed are already
    // nil; this just surfaces the Easter egg. Advance the high-water mark.
    const now = Date.now()
    const tampered = now < loaded.clockHighWater - CLOCK_TAMPER_TOLERANCE_MS
    const clockHighWater = Math.max(loaded.clockHighWater, now)
    const timeTamperMessage = tampered ? TIME_TAMPER_MESSAGE : null

    const offlineCap = computePrestigeEffects(loaded.prestigeUpgrades).offlineCapSeconds
    const elapsed = Math.min((now - saved.lastSavedAt) / 1000, offlineCap)
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
        lastSavedAt: now,
        offlineMessage,
        unlockedAchievements,
        pendingAchievements: [],
        clockHighWater,
        timeTamperMessage,
        ...derived,
      }
    } else {
      init = {
        ...loaded,
        pendingAchievements: [],
        offlineMessage: null,
        clockHighWater,
        timeTamperMessage,
      }
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
        commendations: s.commendations,
        commendationsEarned: s.commendationsEarned,
        prestigeUpgrades: s.prestigeUpgrades,
        hiredManagers: s.hiredManagers,
        autoBuyEnabled: s.autoBuyEnabled,
        autoBuyUpgrades: s.autoBuyUpgrades,
        autoCollectEvents: s.autoCollectEvents,
        playtimeSeconds: s.playtimeSeconds,
        selectedTheme: s.selectedTheme,
        lastDailyClaimDay: s.lastDailyClaimDay,
        dailyStreak: s.dailyStreak,
        clockHighWater: Math.max(s.clockHighWater, Date.now()),
        lastSavedAt: Date.now(),
      })
    }, 5000)
  }
  startAutosave()

  // Auto-buy helper: hired managers reinvest crayons into their generator.
  // Runs on a gentle cadence (not every frame) and buys cheapest-tier first
  // so spare crayons cascade up the supply chain.
  let autoBuyTimer: ReturnType<typeof setInterval> | null = null
  function startAutoBuy() {
    if (autoBuyTimer) return
    autoBuyTimer = setInterval(() => {
      const s = get()

      // Auto-requisition: buy any affordable, unlocked upgrade (cheapest
      // first) before reinvesting into generators.
      if (s.autoBuyUpgrades) {
        const affordable = UPGRADES.filter(
          (u) =>
            !get().purchasedUpgrades.includes(u.id) &&
            u.unlockCondition(get().lifetimeCrayons, get().generators) &&
            get().crayons >= u.cost
        ).sort((a, b) => a.cost - b.cost)
        for (const u of affordable) {
          if (get().crayons >= u.cost) get().buyUpgrade(u.id)
        }
      }

      // Managers reinvest crayons into their generator.
      if (s.autoBuyEnabled && s.hiredManagers.length > 0) {
        const costMult =
          computeEffects(get().purchasedUpgrades).generatorCostMultiplier *
          computePrestigeEffects(get().prestigeUpgrades).costMult
        for (const mgr of MANAGERS) {
          if (!s.hiredManagers.includes(mgr.id)) continue
          const def = GENERATORS.find((g) => g.id === mgr.generatorId)
          if (!def) continue
          const owned = get().generators[mgr.generatorId] ?? 0
          const { count } = maxAffordableGenerators(def.baseCost, owned, get().crayons, costMult)
          const buy = Math.min(count, 25) // cap per cycle to keep purchases gradual
          if (buy > 0) get().buyGenerator(mgr.generatorId, buy)
        }
      }
    }, 250)
  }
  startAutoBuy()

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
        const merged = { ...s, ...next, ...deriveWithBuffs({ ...s, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    buyGenerator(id: string, amount = 1) {
      const s = get()
      const def = GENERATORS.find((g) => g.id === id)
      if (!def || amount < 1) return
      const costMult =
        computeEffects(s.purchasedUpgrades).generatorCostMultiplier *
        computePrestigeEffects(s.prestigeUpgrades).costMult
      const owned = s.generators[id] ?? 0
      const cost = bulkGeneratorCost(def.baseCost, owned, amount, costMult)
      if (s.crayons < cost) return

      set((state) => {
        const newGenerators = { ...state.generators, [id]: (state.generators[id] ?? 0) + amount }
        const next = { crayons: state.crayons - cost, generators: newGenerators }
        const merged = { ...state, ...next, ...deriveWithBuffs({ ...state, ...next }) }
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
        const merged = { ...state, ...next, ...deriveWithBuffs({ ...state, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    tick(deltaSeconds: number) {
      set((s) => {
        const now = Date.now()
        const buffs = pruneBuffs(s.activeBuffs, now)
        // Nothing to do when idle with no buffs to age out.
        if (s.cps === 0 && buffs === s.activeBuffs && buffs.length === 0) return {}

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
          activeBuffs: buffs,
          playtimeSeconds: s.playtimeSeconds + deltaSeconds,
          clockHighWater: Math.max(s.clockHighWater, now),
        }
        const merged = {
          ...s,
          ...next,
          ...buildDerived({ ...s, ...next }, activeBuffMultipliers(buffs, now)),
        }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    reenlist() {
      const s = get()
      // New Commendations are based on total ever EARNED, so spending them at
      // the Exchange never gets refunded by a later reenlistment.
      const gain = prestigePotential(s.lifetimeCrayons) - s.commendationsEarned
      if (gain <= 0) return

      set((state) => {
        // Wipe the run economy AND everything bought during the run — crayons,
        // generators, run upgrades, and hired NCOs all reset. Only meta
        // progression is preserved: lifetime crayons, rank, mentors,
        // achievements, total clicks, and the Commendation Exchange. Awarded
        // Commendations add to both the spendable balance and earned total.
        const base = {
          crayons: 0,
          generators: {} as Record<string, number>,
          purchasedUpgrades: [] as string[],
          hiredManagers: [] as string[],
          commendations: state.commendations + gain,
          commendationsEarned: state.commendationsEarned + gain,
        }
        const merged = { ...state, ...base, ...deriveWithBuffs({ ...state, ...base }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    buyPrestigeUpgrade(id: string) {
      const s = get()
      const def = PRESTIGE_UPGRADES.find((u) => u.id === id)
      if (!def || s.prestigeUpgrades.includes(id)) return
      if (def.requires && !s.prestigeUpgrades.includes(def.requires)) return
      if (s.commendations < def.cost) return

      set((state) => {
        // Spending lowers the Commendation balance — and therefore the passive
        // production bonus — in exchange for a permanent upgrade.
        const next = {
          commendations: state.commendations - def.cost,
          prestigeUpgrades: [...state.prestigeUpgrades, id],
        }
        const merged = { ...state, ...next, ...deriveWithBuffs({ ...state, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    claimDaily() {
      const s = get()
      if (!dailyAvailable(s.lastDailyClaimDay)) return
      const streak = streakAfterClaim(s.lastDailyClaimDay, s.dailyStreak)
      const gain = dailyReward(s.cps, streak)

      set((state) => {
        const next = {
          crayons: state.crayons + gain,
          lifetimeCrayons: state.lifetimeCrayons + gain,
          lastDailyClaimDay: dateKey(),
          dailyStreak: streak,
        }
        // Every 7th consecutive day also kicks off a production frenzy.
        const activeBuffs =
          streak % 7 === 0
            ? [
                ...state.activeBuffs,
                {
                  kind: 'cps' as const,
                  mult: FRENZY_CPS_MULT,
                  expiresAt: Date.now() + FRENZY_CPS_MS,
                  label: 'WEEKLY MORALE',
                },
              ]
            : state.activeBuffs
        const merged = {
          ...state,
          ...next,
          activeBuffs,
          ...deriveWithBuffs({ ...state, ...next, activeBuffs }),
        }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    hireManager(id: string) {
      const s = get()
      const def = MANAGERS.find((m) => m.id === id)
      if (!def || s.hiredManagers.includes(id) || s.crayons < def.cost) return

      set((state) => {
        const next = {
          crayons: state.crayons - def.cost,
          hiredManagers: [...state.hiredManagers, id],
        }
        const merged = { ...state, ...next, ...deriveWithBuffs({ ...state, ...next }) }
        return { ...merged, ...checkAchievements(merged) }
      })
    },

    toggleAutoBuy() {
      set((s) => ({ autoBuyEnabled: !s.autoBuyEnabled }))
    },

    toggleAutoBuyUpgrades() {
      set((s) => ({ autoBuyUpgrades: !s.autoBuyUpgrades }))
    },

    toggleAutoCollectEvents() {
      set((s) => ({ autoCollectEvents: !s.autoCollectEvents }))
    },

    setTheme(id: string) {
      if (THEMES.some((t) => t.id === id)) set({ selectedTheme: id })
    },

    dismissTimeTamper() {
      set({ timeTamperMessage: null })
    },

    spawnEvent() {
      // Don't stack events; one collectible on screen at a time.
      if (get().activeEvent) return
      const def = pickWeightedEvent()
      set({
        activeEvent: {
          id: def.id,
          label: def.label,
          flavor: def.flavor,
          xPct: 12 + Math.random() * 70, // keep clear of the screen edges
          yPct: 22 + Math.random() * 56,
          expiresAt: Date.now() + EVENT_LIFESPAN_MS,
        },
      })
    },

    collectEvent() {
      const s = get()
      const ev = s.activeEvent
      if (!ev) return
      const now = Date.now()
      const pe = computePrestigeEffects(s.prestigeUpgrades)

      if (ev.id === 'windfall') {
        // A lump worth ~40s of current production, with a floor so early-game
        // crates still feel rewarding. Scaled by prestige event-reward bonus.
        const gain = Math.max(s.cps * 40, s.crayons * 0.13, 25) * pe.eventRewardMult
        set((state) => {
          const next = {
            crayons: state.crayons + gain,
            lifetimeCrayons: state.lifetimeCrayons + gain,
            activeEvent: null,
          }
          const merged = { ...state, ...next, ...deriveWithBuffs({ ...state, ...next }) }
          return { ...merged, ...checkAchievements(merged) }
        })
        return
      }

      const dur = pe.frenzyDurationMult
      const buff: Buff =
        ev.id === 'motivation_surge'
          ? { kind: 'cps', mult: FRENZY_CPS_MULT, expiresAt: now + FRENZY_CPS_MS * dur, label: ev.label }
          : { kind: 'click', mult: FRENZY_CLICK_MULT, expiresAt: now + FRENZY_CLICK_MS * dur, label: ev.label }

      set((state) => {
        const next = { activeBuffs: [...state.activeBuffs, buff], activeEvent: null }
        return { ...next, ...deriveWithBuffs({ ...state, ...next }) }
      })
    },

    expireEvent() {
      if (get().activeEvent) set({ activeEvent: null })
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
