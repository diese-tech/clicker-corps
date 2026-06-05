import { useGameStore } from '../store/gameStore'
import { UPGRADES, type UpgradeDef, type UpgradeEffectState } from '../data/upgrades'
import { GENERATORS } from '../data/generators'
import { formatNumber, timeToAfford, formatDuration } from '../utils/math'

function describeEffect(u: UpgradeDef): string {
  const base: UpgradeEffectState = {
    clickMultiplier: 1,
    generatorMultipliers: {},
    globalCpsMultiplier: 1,
    generatorCostMultiplier: 1,
  }
  const after = u.applyEffect(base)
  const parts: string[] = []
  if (after.clickMultiplier > 1) parts.push(`×${after.clickMultiplier} click power`)
  if (after.globalCpsMultiplier > 1) parts.push(`×${after.globalCpsMultiplier} all production`)
  if (after.generatorCostMultiplier < 1) {
    parts.push(`−${Math.round((1 - after.generatorCostMultiplier) * 100)}% generator costs`)
  }
  for (const [id, mult] of Object.entries(after.generatorMultipliers)) {
    const gen = GENERATORS.find((g) => g.id === id)
    parts.push(`×${mult} ${gen?.name ?? id} output`)
  }
  return parts.join(' • ')
}

export function UpgradeList() {
  const { crayons, cps, lifetimeCrayons, generators, purchasedUpgrades, buyUpgrade } = useGameStore()

  const available = UPGRADES.filter(
    (u) => !purchasedUpgrades.includes(u.id) && u.unlockCondition(lifetimeCrayons, generators)
  ).sort((a, b) => a.cost - b.cost)

  if (available.length === 0) return null

  const affordable = available.filter((u) => crayons >= u.cost)
  const expensive = available.filter((u) => crayons < u.cost)

  function renderRow(u: UpgradeDef, canAfford: boolean) {
    const effect = describeEffect(u)
    const wait = canAfford ? null : timeToAfford(u.cost, crayons, cps)
    return (
      <div key={u.id} className={`upgrade-row ${!canAfford ? 'cannot-afford' : ''}`}>
        <div className="upgrade-info">
          <span className="upgrade-name">{u.name}</span>
          {effect && <span className="upgrade-effect">{effect}</span>}
          <span className="upgrade-flavor">{u.flavor}</span>
        </div>
        <button className="buy-btn" onClick={() => buyUpgrade(u.id)} disabled={!canAfford}>
          <span className="buy-cost">{formatNumber(u.cost)} 🖍</span>
          {wait !== null && <span className="buy-timer">{formatDuration(wait)}</span>}
        </button>
      </div>
    )
  }

  return (
    <section className="panel">
      <h2 className="panel-title">
        REQUISITIONS <span className="ach-count">{available.length}</span>
      </h2>

      {affordable.length > 0 && (
        <>
          {expensive.length > 0 && (
            <p className="upgrade-group-sep">— READY TO BUY —</p>
          )}
          {affordable.map((u) => renderRow(u, true))}
        </>
      )}

      {expensive.length > 0 && (
        <>
          <p className="upgrade-group-sep">— UNLOCKED, NEED FUNDS —</p>
          {expensive.map((u) => renderRow(u, false))}
        </>
      )}
    </section>
  )
}
