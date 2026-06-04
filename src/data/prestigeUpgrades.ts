// Permanent meta-upgrades bought with Commendations at the Commendation
// Exchange. These survive every reenlistment. Crucially, none of them grant
// crayons or generators on reset — every reenlistment remains a true crayon
// clean slate. They only adjust multipliers, the offline cap, and event tuning.

export interface PrestigeEffects {
  bonusPerCommendation: number // passive production bonus per Commendation held
  cpsMult: number // extra global CPS multiplier
  clickMult: number // extra click-power multiplier
  costMult: number // generator cost multiplier (lower = cheaper)
  offlineCapSeconds: number // offline-progress cap
  eventIntervalMult: number // event spawn cadence (lower = more frequent)
  eventRewardMult: number // windfall payout multiplier
  frenzyDurationMult: number // timed-buff duration multiplier
}

export const DEFAULT_OFFLINE_SECONDS = 60 * 60 * 8

export function basePrestigeEffects(): PrestigeEffects {
  return {
    bonusPerCommendation: 0.02,
    cpsMult: 1,
    clickMult: 1,
    costMult: 1,
    offlineCapSeconds: DEFAULT_OFFLINE_SECONDS,
    eventIntervalMult: 1,
    eventRewardMult: 1,
    frenzyDurationMult: 1,
  }
}

export interface PrestigeUpgradeDef {
  id: string
  name: string
  cost: number // in Commendations
  flavor: string
  requires?: string
  apply: (e: PrestigeEffects) => PrestigeEffects
}

// Definition order matters: effects are applied in this order so that tiered
// upgrades (e.g. Seasoned Veteran after Veteran Instincts) override cleanly.
export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  {
    id: 'veteran_instincts',
    name: 'Veteran Instincts',
    cost: 1,
    flavor: 'Each Commendation now grants +4% production instead of +2%.',
    apply: (e) => ({ ...e, bonusPerCommendation: 0.04 }),
  },
  {
    id: 'seasoned_veteran',
    name: 'Seasoned Veteran',
    cost: 6,
    requires: 'veteran_instincts',
    flavor: 'Each Commendation now grants +7% production.',
    apply: (e) => ({ ...e, bonusPerCommendation: 0.07 }),
  },
  {
    id: 'iron_thumb',
    name: 'Iron Thumb',
    cost: 2,
    flavor: 'Permanent x5 click power. The callus is now load-bearing.',
    apply: (e) => ({ ...e, clickMult: e.clickMult * 5 }),
  },
  {
    id: 'well_oiled_machine',
    name: 'Well-Oiled Machine',
    cost: 3,
    flavor: 'Permanent x2 to all crayon production.',
    apply: (e) => ({ ...e, cpsMult: e.cpsMult * 2 }),
  },
  {
    id: 'industrial_complex',
    name: 'Crayon-Industrial Complex',
    cost: 12,
    requires: 'well_oiled_machine',
    flavor: 'Permanent x3 to all crayon production. Eisenhower warned us.',
    apply: (e) => ({ ...e, cpsMult: e.cpsMult * 3 }),
  },
  {
    id: 'bulk_logistics',
    name: 'Bulk Logistics',
    cost: 4,
    flavor: 'All generators are permanently 20% cheaper.',
    apply: (e) => ({ ...e, costMult: e.costMult * 0.8 }),
  },
  {
    id: 'extended_liberty',
    name: 'Extended Liberty',
    cost: 3,
    flavor: 'Offline progress cap raised from 8 to 24 hours.',
    apply: (e) => ({ ...e, offlineCapSeconds: 60 * 60 * 24 }),
  },
  {
    id: 'permanent_liberty',
    name: 'Permanent Change of Station',
    cost: 10,
    requires: 'extended_liberty',
    flavor: 'Offline progress cap raised to 72 hours.',
    apply: (e) => ({ ...e, offlineCapSeconds: 60 * 60 * 72 }),
  },
  {
    id: 'mess_hall_privileges',
    name: 'Mess Hall Privileges',
    cost: 5,
    flavor: 'Crayon drops appear twice as often and windfalls pay double.',
    apply: (e) => ({
      ...e,
      eventIntervalMult: e.eventIntervalMult * 0.5,
      eventRewardMult: e.eventRewardMult * 2,
    }),
  },
  {
    id: 'frenzy_focus',
    name: 'Frenzy Focus',
    cost: 7,
    flavor: 'Event frenzies last 50% longer. Stay motivated, longer.',
    apply: (e) => ({ ...e, frenzyDurationMult: e.frenzyDurationMult * 1.5 }),
  },
]

export function computePrestigeEffects(purchased: string[]): PrestigeEffects {
  let e = basePrestigeEffects()
  for (const def of PRESTIGE_UPGRADES) {
    if (purchased.includes(def.id)) e = def.apply(e)
  }
  return e
}
