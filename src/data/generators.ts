export interface GeneratorDef {
  id: string
  name: string
  baseCost: number
  baseCps: number
  cycleDuration: number
  flavor: string
}

// Escalates from one Marine rooting through a crayon box to entire
// expeditionary forces running on industrial-grade wax logistics. Costs and
// output follow idle-game scaling (~10x cost, ~6x output per tier).
export const GENERATORS: GeneratorDef[] = [
  {
    id: 'crayon_box',
    name: 'Crayon Box',
    baseCost: 15,
    baseCps: 0.1,
    cycleDuration: 3,
    flavor: 'A basic box of government-grade wax nutrition.',
  },
  {
    id: 'px_run',
    name: 'PX Run',
    baseCost: 100,
    baseCps: 1,
    cycleDuration: 6,
    flavor: 'Someone made a suspiciously efficient trip to the PX.',
  },
  {
    id: 'supply_sergeant',
    name: 'Supply Sergeant',
    baseCost: 1100,
    baseCps: 8,
    cycleDuration: 15,
    flavor: 'Nobody knows where the crayons came from. Do not ask.',
  },
  {
    id: 'motor_pool_cache',
    name: 'Motor Pool Cache',
    baseCost: 12000,
    baseCps: 47,
    cycleDuration: 30,
    flavor: 'Found behind a broken Humvee. Still edible.',
  },
  {
    id: 'fire_team_forage',
    name: 'Fire Team Forage',
    baseCost: 130000,
    baseCps: 260,
    cycleDuration: 60,
    flavor: 'Four Marines, one mission: locate snacks. Overwhelming success.',
  },
  {
    id: 'squad_supply_drop',
    name: 'Squad Supply Drop',
    baseCost: 1400000,
    baseCps: 1400,
    cycleDuration: 120,
    flavor: 'Airdropped pallet. 90% crayons, 10% MREs nobody will eat.',
  },
  {
    id: 'platoon_pallet',
    name: 'Platoon Pallet',
    baseCost: 20000000,
    baseCps: 7800,
    cycleDuration: 180,
    flavor: 'Shrink-wrapped, forklift-certified, dangerously delicious.',
  },
  {
    id: 'company_convoy',
    name: 'Company Convoy',
    baseCost: 330000000,
    baseCps: 44000,
    cycleDuration: 300,
    flavor: 'A mile-long convoy hauling nothing but wax. Logistics weeps.',
  },
  {
    id: 'battalion_depot',
    name: 'Battalion Depot',
    baseCost: 5100000000,
    baseCps: 260000,
    cycleDuration: 600,
    flavor: 'An entire warehouse the supply chief swears does not exist.',
  },
  {
    id: 'expeditionary_force',
    name: 'Expeditionary Force',
    baseCost: 75000000000,
    baseCps: 1600000,
    cycleDuration: 900,
    flavor: 'Deployed worldwide to secure the strategic crayon reserve.',
  },
  {
    id: 'joint_task_force',
    name: 'Joint Task Force',
    baseCost: 1050000000000,
    baseCps: 10000000,
    cycleDuration: 1200,
    flavor: 'Every branch, one mission: nobody admits whose crayons these are.',
  },
  {
    id: 'theater_command',
    name: 'Theater Command',
    baseCost: 15000000000000,
    baseCps: 65000000,
    cycleDuration: 1800,
    flavor: 'Coordinates crayon operations across an entire hemisphere.',
  },
  {
    id: 'crayon_armada',
    name: 'Crayon Armada',
    baseCost: 220000000000000,
    baseCps: 420000000,
    cycleDuration: 3600,
    flavor: 'A fleet whose sole cargo manifest reads "wax, assorted."',
  },
  {
    id: 'strategic_reserve',
    name: 'Strategic Crayon Reserve',
    baseCost: 3200000000000000,
    baseCps: 2700000000,
    cycleDuration: 7200,
    flavor: 'A national stockpile released only in the event of severe boredom.',
  },
  {
    id: 'orbital_command',
    name: 'Orbital Crayon Command',
    baseCost: 46000000000000000,
    baseCps: 18000000000,
    cycleDuration: 14400,
    flavor: 'Raining color from low orbit. Allegedly within the rules of engagement.',
  },
  {
    id: 'galactic_reserve',
    name: 'Galactic Crayon Reserve',
    baseCost: 680000000000000000,
    baseCps: 120000000000,
    cycleDuration: 28800,
    flavor: 'The 64-pack, but it is a Dyson sphere.',
  },
]
