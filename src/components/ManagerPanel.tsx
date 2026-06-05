import { useGameStore } from '../store/gameStore'
import { MANAGERS } from '../data/managers'
import { GENERATORS } from '../data/generators'
import { formatNumber } from '../utils/math'

export function ManagerPanel() {
  const { crayons, generators, hiredManagers, hireManager } = useGameStore()

  // Show all managers whose generator the player has at least heard of (visible
  // in the supply chain) so they can plan ahead, but lock ones for generators
  // they haven't reached yet.
  const lifetimeCrayons = useGameStore((s) => s.lifetimeCrayons)

  const visible = MANAGERS.filter((m) => {
    const gen = GENERATORS.find((g) => g.id === m.generatorId)
    if (!gen) return false
    return (generators[m.generatorId] ?? 0) > 0 || lifetimeCrayons >= gen.baseCost * 0.5
  })

  if (visible.length === 0) return null

  return (
    <section className="panel">
      <h2 className="panel-title">NCO CORPS</h2>

      {visible.map((m) => {
        const hired = hiredManagers.includes(m.id)
        const gen = GENERATORS.find((g) => g.id === m.generatorId)
        const owned = generators[m.generatorId] ?? 0
        const locked = owned === 0
        const affordable = !locked && !hired && crayons >= m.cost

        return (
          <div
            key={m.id}
            className={`manager-row ${hired ? 'hired' : ''} ${locked ? 'locked' : ''}`}
          >
            <div className="manager-info">
              <span className="manager-name">{m.name}</span>
              <span className="manager-assignment">×2 {gen?.name ?? m.generatorId} output</span>
              <span className="manager-flavor">{m.flavor}</span>
            </div>
            {hired ? (
              <span className="manager-hired-badge">✓ ON DUTY</span>
            ) : locked ? (
              <span className="manager-locked-badge">LOCKED</span>
            ) : (
              <button
                className="buy-btn"
                onClick={() => hireManager(m.id)}
                disabled={!affordable}
              >
                {formatNumber(m.cost)} 🖍
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
