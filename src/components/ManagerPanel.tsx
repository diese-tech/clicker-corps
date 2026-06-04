import { useGameStore } from '../store/gameStore'
import { MANAGERS } from '../data/managers'
import { GENERATORS } from '../data/generators'
import { formatNumber } from '../utils/math'

export function ManagerPanel() {
  const { crayons, generators, hiredManagers, autoBuyEnabled, hireManager, toggleAutoBuy } =
    useGameStore()

  // Only offer a manager once the player owns the generator it runs.
  const visible = MANAGERS.filter(
    (m) => (generators[m.generatorId] ?? 0) > 0 || hiredManagers.includes(m.id)
  )
  if (visible.length === 0) return null

  const anyHired = hiredManagers.length > 0

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title no-margin">NCO CORPS</h2>
        {anyHired && (
          <button
            className={`autobuy-toggle ${autoBuyEnabled ? 'on' : 'off'}`}
            onClick={toggleAutoBuy}
            title="When on, hired NCOs automatically reinvest crayons into their generator."
          >
            AUTO-BUY: {autoBuyEnabled ? 'ON' : 'OFF'}
          </button>
        )}
      </div>

      {visible.map((m) => {
        const hired = hiredManagers.includes(m.id)
        const gen = GENERATORS.find((g) => g.id === m.generatorId)
        const affordable = crayons >= m.cost

        return (
          <div key={m.id} className={`manager-row ${hired ? 'hired' : ''}`}>
            <div className="manager-info">
              <span className="manager-name">{m.name}</span>
              <span className="manager-flavor">{m.flavor}</span>
              <span className="manager-runs">Runs: {gen?.name ?? m.generatorId}</span>
            </div>
            {hired ? (
              <span className="manager-hired-badge">✓ ON DUTY</span>
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
