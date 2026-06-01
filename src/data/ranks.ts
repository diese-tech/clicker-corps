export interface RankDef {
  name: string
  required: number
}

export const RANKS: RankDef[] = [
  { name: 'Recruit', required: 0 },
  { name: 'Private', required: 100 },
  { name: 'Private First Class', required: 500 },
  { name: 'Lance Corporal', required: 2500 },
  { name: 'Corporal', required: 10000 },
  { name: 'Sergeant', required: 50000 },
]

export function getRank(lifetimeCrayons: number): string {
  let rank = RANKS[0].name
  for (const r of RANKS) {
    if (lifetimeCrayons >= r.required) rank = r.name
  }
  return rank
}
