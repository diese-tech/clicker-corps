import { useGameStore } from '../store/gameStore'
import { UPGRADES } from '../data/upgrades'
import { formatNumber } from '../utils/math'

export function UpgradeList() {
  const { crayons, lifetimeCrayons, generators, purchasedUpgrades, buyUpgrade } = useGameStore()

  const available = UPGRADES.filter(
    (u) =>
      !purchasedUpgrades.includes(u.id) &&
      u.unlockCondition(lifetimeCrayons, generators)
  )

  if (available.length === 0) return null

  return (
    <section className="panel">
      <h2 className="panel-title">REQUISITIONS</h2>
      {available.map((u) => {
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
    </section>
  )
}
