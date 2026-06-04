export interface MentorDef {
  id: string
  name: string
  unlockAt: number
  cpsBonus: number
  flavor: string
}

// Parody-inspired legends (per the guardrails: fantasy naming, no real-person
// likeness systems). Each evokes a famous Marine archetype and grants a
// permanent, stacking production bonus when their lifetime-crayon milestone
// is reached.
export const MENTORS: MentorDef[] = [
  {
    id: 'legendary_chest_puller',
    name: 'Legendary Chest Puller',
    unlockAt: 10000,
    cpsBonus: 0.25,
    flavor: 'When surrounded, produce in every direction.',
  },
  {
    id: 'fighting_quartermaster',
    name: 'The Fighting Quartermaster',
    unlockAt: 250000,
    cpsBonus: 0.4,
    flavor: 'Busted every racket, then redistributed the crayons to the troops.',
  },
  {
    id: 'twice_decorated_danny',
    name: 'Twice-Decorated Danny',
    unlockAt: 5000000,
    cpsBonus: 0.6,
    flavor: 'Earned every medal twice. Asked the crayons if they wanted to live forever.',
  },
  {
    id: 'manila_machine_gun',
    name: 'Manila Machine-Gun Johnny',
    unlockAt: 100000000,
    cpsBonus: 0.85,
    flavor: 'Held the line single-handed, reloading crayons under fire.',
  },
  {
    id: 'grand_old_quartermaster',
    name: 'The Grand Old Quartermaster',
    unlockAt: 2500000000,
    cpsBonus: 1.25,
    flavor: 'Ran the Corps so long they forgot how to replace him.',
  },
]
