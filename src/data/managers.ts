import { GENERATORS } from './generators'

// An NCO you hire (with crayons) to take charge of a generator. Once hired,
// the manager automatically buys that generator whenever crayons allow —
// hands-off reinvestment, AdVenture-Capitalist style.
export interface ManagerDef {
  id: string
  generatorId: string
  name: string
  flavor: string
  cost: number
}

// Flavor per generator tier, keyed by generator id.
const NCO_FLAVOR: Record<string, { name: string; flavor: string }> = {
  crayon_box: { name: 'Lance Corporal Crayola', flavor: 'Keeps the box stocked. Tastes-tests every color.' },
  px_run: { name: 'Cpl. Five-Finger Discount', flavor: 'Knows a guy at the PX. Knows every guy at the PX.' },
  supply_sergeant: { name: 'SSgt. Shady', flavor: 'Inventory is a state of mind. Do not audit him.' },
  motor_pool_cache: { name: 'GySgt. Grease', flavor: 'If it has wheels, it has a hidden crayon stash.' },
  fire_team_forage: { name: 'Sgt. Scrounge', flavor: 'Four Marines enter. A pallet of snacks leaves.' },
  squad_supply_drop: { name: '1stSgt. Airborne', flavor: 'Calls in drops with suspicious accuracy.' },
  platoon_pallet: { name: 'MSgt. Forklift', flavor: 'Certified on every lift, licensed on none.' },
  company_convoy: { name: 'MGySgt. Logistics', flavor: 'Moves mountains of wax and never files the paperwork.' },
  battalion_depot: { name: 'SgtMaj. Warehouse', flavor: 'Runs a depot that legally does not exist.' },
  expeditionary_force: { name: 'The Crayon Czar', flavor: 'Commands the global strategic crayon reserve.' },
}

export const MANAGERS: ManagerDef[] = GENERATORS.map((g) => {
  const f = NCO_FLAVOR[g.id]
  return {
    id: `mgr_${g.id}`,
    generatorId: g.id,
    name: f?.name ?? `${g.name} Manager`,
    flavor: f?.flavor ?? 'Keeps things running.',
    // Roughly the price of ~18 of the generator — a meaningful sink once
    // you're invested in that tier.
    cost: Math.ceil(g.baseCost * 18),
  }
})
