export interface MentorDef {
  id: string
  name: string
  unlockAt: number
  cpsBonus: number
  flavor: string
}

export const MENTORS: MentorDef[] = [
  {
    id: 'legendary_chest_puller',
    name: 'Legendary Chest Puller',
    unlockAt: 10000,
    cpsBonus: 0.25,
    flavor: 'When surrounded, produce in every direction.',
  },
]
