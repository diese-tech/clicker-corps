import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../data/generators'
import { generatorCost, formatNumber } from '../utils/math'
import { computeEffectsForCostMultiplier } from '../store/effectsHelper'

export function GeneratorList() {
  const { crayons, lifetimeCrayons, generators, purchasedUpgrades, buyGenerator } = useGameStore()
  const costMult = computeEffectsForCostMultiplier(purchasedUpgrades)

  // Progressive reveal: show a generator once it's owned or the player has
  // earned within reach of its base cost. Keeps the early game uncluttered.
  const visible = GENERATORS.filter(
    (g) => (generators[g.id] ?? 0) > 0 || lifetimeCrayons >= g.baseCost * 0.5
  )

  return (
    <section className="panel">
      <h2 className="panel-title">SUPPLY CHAIN</h2>
      {visible.map((g) => {
        const owned = generators[g.id] ?? 0
        const cost = generatorCost(g.baseCost, owned, costMult)
        const affordable = crayons >= cost
        const contribution = owned * g.baseCps

        return (
          <div key={g.id} className={`generator-row ${!affordable ? 'cannot-afford' : ''}`}>
            <div className="gen-info">
              <span className="gen-name">{g.name}</span>
              <span className="gen-flavor">{g.flavor}</span>
              <span className="gen-cps">{contribution.toFixed(1)} crayons/sec</span>
            </div>
            <div className="gen-right">
              <span className="gen-owned">{owned}</span>
              <button
                className="buy-btn"
                onClick={() => buyGenerator(g.id)}
                disabled={!affordable}
              >
                {formatNumber(cost)} 🖍
              </button>
            </div>
          </div>
        )
      })}
    </section>
  )
}
