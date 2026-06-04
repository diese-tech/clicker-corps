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
  { name: 'Staff Sergeant', required: 250000 },
  { name: 'Gunnery Sergeant', required: 1000000 },
  { name: 'Master Sergeant', required: 5000000 },
  { name: 'First Sergeant', required: 20000000 },
  { name: 'Master Gunnery Sergeant', required: 100000000 },
  { name: 'Sergeant Major', required: 500000000 },
  { name: 'Sergeant Major of the Corps', required: 2500000000 },
  { name: 'Crayon Czar', required: 15000000000 },
  { name: 'Supreme Allied Crayon Commander', required: 100000000000 },
  { name: 'Joint Crayon Chief', required: 750000000000 },
  { name: 'Theater Crayon Marshal', required: 6000000000000 },
  { name: 'Field Marshal of Wax', required: 50000000000000 },
  { name: 'Planetary Crayon Warlord', required: 400000000000000 },
  { name: 'Solar System Crayon Emperor', required: 4000000000000000 },
  { name: 'Galactic Crayon Overlord', required: 40000000000000000 },
  { name: 'Crayon Deity, First Class', required: 500000000000000000 },
]

export function getRank(lifetimeCrayons: number): string {
  let rank = RANKS[0].name
  for (const r of RANKS) {
    if (lifetimeCrayons >= r.required) rank = r.name
  }
  return rank
}
