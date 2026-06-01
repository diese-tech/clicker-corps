export interface GeneratorDef {
  id: string
  name: string
  baseCost: number
  baseCps: number
  flavor: string
}

export const GENERATORS: GeneratorDef[] = [
  {
    id: 'crayon_box',
    name: 'Crayon Box',
    baseCost: 15,
    baseCps: 0.1,
    flavor: 'A basic box of government-grade wax nutrition.',
  },
  {
    id: 'px_run',
    name: 'PX Run',
    baseCost: 100,
    baseCps: 1,
    flavor: 'Someone made a suspiciously efficient trip to the PX.',
  },
  {
    id: 'supply_sergeant',
    name: 'Supply Sergeant',
    baseCost: 1100,
    baseCps: 8,
    flavor: "Nobody knows where the crayons came from. Do not ask.",
  },
  {
    id: 'motor_pool_cache',
    name: 'Motor Pool Cache',
    baseCost: 12000,
    baseCps: 47,
    flavor: 'Found behind a broken Humvee. Still edible.',
  },
]
