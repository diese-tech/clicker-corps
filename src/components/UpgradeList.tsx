import { useGameStore } from '../store/gameStore'
import { UPGRADES } from '../data/upgrades'
import { formatNumber } from '../utils/math'

const MAX_SHOWN = 18

export function UpgradeList() {
  const { crayons, lifetimeCrayons, generators, purchasedUpgrades, buyUpgrade } = useGameStore()

  // Cheapest-first so the next worthwhile purchases surface; cap the list so a
  // large unlocked backlog doesn't overwhelm the panel.
  const available = UPGRADES.filter(
    (u) => !purchasedUpgrades.includes(u.id) && u.unlockCondition(lifetimeCrayons, generators)
  ).sort((a, b) => a.cost - b.cost)

  if (available.length === 0) return null

  const shown = available.slice(0, MAX_SHOWN)
  const hidden = available.length - shown.length

  return (
    <section className="panel">
      <h2 className="panel-title">
        REQUISITIONS{' '}
        <span className="ach-count">{available.length}</span>
      </h2>
      {shown.map((u) => {
        const affordable = crayons >= u.cost
        return (
          <div key={u.id} className={`upgrade-row ${!affordable ? 'cannot-afford' : ''}`}>
            <div className="upgrade-info">
              <span className="upgrade-name">{u.name}</span>
              <span className="upgrade-flavor">{u.flavor}</span>
            </div>
            <button
              className="buy-btn"
              onClick={() => buyUpgrade(u.id)}
              disabled={!affordable}
            >
              {formatNumber(u.cost)} 🖍
            </button>
          </div>
        )
      })}
      {hidden > 0 && <p className="upgrade-more">+{hidden} more unlocked — buy these first</p>}
    </section>
  )
}
