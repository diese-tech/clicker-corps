import { GENERATORS } from './generators'
import { MANAGERS } from './managers'
import { MENTORS } from './mentors'
import { PRESTIGE_UPGRADES } from './prestigeUpgrades'

// Each unlocked achievement grants this much extra global production —
// Clicker Corps' take on Cookie Clicker's milk/kitten feedback loop. Earning
// ribbons quietly makes the whole Corps more motivated.
export const MORALE_BONUS_PER_ACHIEVEMENT = 0.01

export function moraleMultiplier(unlockedCount: number): number {
  return 1 + unlockedCount * MORALE_BONUS_PER_ACHIEVEMENT
}

export interface AchievementContext {
  lifetimeCrayons: number
  totalClicks: number
  generators: Record<string, number>
  purchasedUpgrades: string[]
  unlockedMentors: string[]
  cps: number
  commendations: number
  hiredManagers: string[]
  prestigeUpgrades: string[]
}

export interface AchievementDef {
  id: string
  name: string
  flavor: string
  hint: string
  check: (ctx: AchievementContext) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_crayon',
    name: 'First Taste',
    flavor: 'You fed the Marine his first crayon. The red one, naturally.',
    hint: 'Feed your first crayon.',
    check: (c) => c.totalClicks >= 1,
  },
  {
    id: 'trigger_finger',
    name: 'Trigger Finger',
    flavor: 'One hundred motivations. Your index finger now qualifies as a crew-served weapon.',
    hint: 'Reach 100 total clicks.',
    check: (c) => c.totalClicks >= 100,
  },
  {
    id: 'all_thumbs',
    name: 'All Thumbs, No Brakes',
    flavor: 'One thousand clicks. Somebody hide the keyboard.',
    hint: 'Reach 1,000 total clicks.',
    check: (c) => c.totalClicks >= 1000,
  },
  {
    id: 'fresh_boot',
    name: 'Fresh Out of Boot',
    flavor: 'Earned 100 lifetime crayons. Welcome to the fleet, devil.',
    hint: 'Earn 100 lifetime crayons.',
    check: (c) => c.lifetimeCrayons >= 100,
  },
  {
    id: 'salty',
    name: 'Salty',
    flavor: '10,000 lifetime crayons. You now have sea stories nobody asked for.',
    hint: 'Earn 10,000 lifetime crayons.',
    check: (c) => c.lifetimeCrayons >= 10000,
  },
  {
    id: 'logistics_legend',
    name: 'Logistics Legend',
    flavor: '100,000 lifetime crayons consumed. Supply still cannot explain the shortage.',
    hint: 'Earn 100,000 lifetime crayons.',
    check: (c) => c.lifetimeCrayons >= 100000,
  },
  {
    id: 'box_checker',
    name: 'Box Checker',
    flavor: 'Own 5 Crayon Boxes. The E-3 mafia has taken notice.',
    hint: 'Own 5 Crayon Boxes.',
    check: (c) => (c.generators['crayon_box'] ?? 0) >= 5,
  },
  {
    id: 'full_supply_chain',
    name: 'Full Supply Chain',
    flavor: 'At least one of every generator. Vertical integration, baby.',
    hint: 'Own at least one of every generator.',
    check: (c) => GENERATORS.every((g) => (c.generators[g.id] ?? 0) >= 1),
  },
  {
    id: 'requisition_approved',
    name: 'Requisition Approved',
    flavor: 'Bought your first upgrade. The paperwork only took six weeks.',
    hint: 'Purchase any upgrade.',
    check: (c) => c.purchasedUpgrades.length >= 1,
  },
  {
    id: 'quartermaster',
    name: 'Quartermaster',
    flavor: 'Stockpiled 25 upgrades in a single run. You ARE the supply chain now.',
    hint: 'Hold 25 upgrades at once.',
    check: (c) => c.purchasedUpgrades.length >= 25,
  },
  {
    id: 'standing_on_legends',
    name: 'Standing on Legends',
    flavor: 'Unlocked a mentor. Somewhere, a chest is being puffed out.',
    hint: 'Unlock any mentor.',
    check: (c) => c.unlockedMentors.length >= 1,
  },
  {
    id: 'living_history',
    name: 'Living History',
    flavor: 'Every legend mentors you now. The crayons practically eat themselves.',
    hint: 'Unlock every mentor.',
    check: (c) => c.unlockedMentors.length >= MENTORS.length,
  },
  {
    id: 'dangerously_motivated',
    name: 'Dangerously Motivated',
    flavor: 'Hit 100 crayons per second. Please go see your NCO.',
    hint: 'Reach 100 crayons per second.',
    check: (c) => c.cps >= 100,
  },
  {
    id: 'lifer',
    name: 'Lifer',
    flavor: 'Reenlisted at least once. The civilian world can keep waiting.',
    hint: 'Reenlist for your first Commendation.',
    check: (c) => c.commendations >= 1,
  },
  {
    id: 'highly_decorated',
    name: 'Highly Decorated',
    flavor: 'Earned 10 Commendations. Your dress blues need a bigger chest.',
    hint: 'Accumulate 10 Commendations.',
    check: (c) => c.commendations >= 10,
  },
  {
    id: 'put_in_charge',
    name: 'Put In Charge',
    flavor: 'Hired your first NCO. Delegation: the finest military tradition.',
    hint: 'Hire any manager.',
    check: (c) => c.hiredManagers.length >= 1,
  },
  {
    id: 'whole_chain_of_command',
    name: 'Whole Chain of Command',
    flavor: 'Every generator has an NCO. You just supervise the supervisors now.',
    hint: 'Hire every manager.',
    check: (c) => c.hiredManagers.length >= MANAGERS.length,
  },
  {
    id: 'spent_my_ribbons',
    name: 'Spent My Ribbons',
    flavor: 'Cashed in a Commendation at the Exchange. Worth every percent.',
    hint: 'Buy a Commendation Exchange upgrade.',
    check: (c) => c.prestigeUpgrades.length >= 1,
  },
  {
    id: 'fully_vested',
    name: 'Fully Vested',
    flavor: 'Bought out the entire Commendation Exchange. The Corps owes you nothing.',
    hint: 'Buy every Commendation Exchange upgrade.',
    check: (c) => c.prestigeUpgrades.length >= PRESTIGE_UPGRADES.length,
  },
]
