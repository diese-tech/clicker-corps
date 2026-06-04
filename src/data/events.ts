// Random "golden crayon" events that periodically appear for the player to
// click, granting an instant windfall or a short-lived production buff.

export type EventId = 'windfall' | 'motivation_surge' | 'crayon_frenzy'

export interface GameEventDef {
  id: EventId
  label: string
  flavor: string
  weight: number
}

export const EVENT_DEFS: GameEventDef[] = [
  {
    id: 'windfall',
    label: 'AMMO CRATE',
    flavor: 'Supply botched the paperwork — in your favor. Instant crayons!',
    weight: 3,
  },
  {
    id: 'motivation_surge',
    label: 'MOTIVATION SURGE',
    flavor: 'The CO is watching. All production x7 for 15 seconds!',
    weight: 2,
  },
  {
    id: 'crayon_frenzy',
    label: 'CRAYON FRENZY',
    flavor: 'Someone cracked the 64-pack. Click power x10 for 12 seconds!',
    weight: 2,
  },
]

// Tuning
export const EVENT_LIFESPAN_MS = 12000 // how long an uncollected event lingers
export const EVENT_MIN_INTERVAL_MS = 60000 // shortest gap between spawns
export const EVENT_MAX_INTERVAL_MS = 150000 // longest gap between spawns

export const FRENZY_CPS_MULT = 7
export const FRENZY_CPS_MS = 15000
export const FRENZY_CLICK_MULT = 10
export const FRENZY_CLICK_MS = 12000

export function pickWeightedEvent(rng = Math.random): GameEventDef {
  const total = EVENT_DEFS.reduce((sum, e) => sum + e.weight, 0)
  let roll = rng() * total
  for (const e of EVENT_DEFS) {
    roll -= e.weight
    if (roll < 0) return e
  }
  return EVENT_DEFS[0]
}
