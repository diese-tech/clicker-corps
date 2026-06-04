import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../data/generators'
import {
  bulkGeneratorCost,
  maxAffordableGenerators,
  formatNumber,
} from '../utils/math'
import { totalCostMultiplier } from '../store/effectsHelper'
import { milestoneMultiplier, nextMilestone } from '../data/milestones'

type BuyAmount = 1 | 10 | 100 | 'max'
const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

export function GeneratorList() {
  const { crayons, lifetimeCrayons, generators, purchasedUpgrades, prestigeUpgrades, buyGenerator } =
    useGameStore()
  const [buyAmount, setBuyAmount] = useState<BuyAmount>(1)
  const costMult = totalCostMultiplier(purchasedUpgrades, prestigeUpgrades)

  // Progressive reveal: show a generator once it's owned or the player has
  // earned within reach of its base cost. Keeps the early game uncluttered.
  const visible = GENERATORS.filter(
    (g) => (generators[g.id] ?? 0) > 0 || lifetimeCrayons >= g.baseCost * 0.5
  )

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title no-margin">SUPPLY CHAIN</h2>
        <div className="buy-amount-toggle">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              className={`amount-btn ${buyAmount === a ? 'active' : ''}`}
              onClick={() => setBuyAmount(a)}
            >
              {a === 'max' ? 'MAX' : `x${a}`}
            </button>
          ))}
        </div>
      </div>

      {visible.map((g) => {
        const owned = generators[g.id] ?? 0

        let count: number
        let cost: number
        if (buyAmount === 'max') {
          const m = maxAffordableGenerators(g.baseCost, owned, crayons, costMult)
          count = m.count
          // When nothing is affordable, show the price of the next single unit.
          cost = m.count > 0 ? m.cost : bulkGeneratorCost(g.baseCost, owned, 1, costMult)
        } else {
          count = buyAmount
          cost = bulkGeneratorCost(g.baseCost, owned, count, costMult)
        }

        const affordable = count > 0 && crayons >= cost
        const milestoneMult = milestoneMultiplier(owned)
        const contribution = owned * g.baseCps * milestoneMult
        const next = nextMilestone(owned)
        const label = buyAmount === 'max' ? `MAX${count > 0 ? ` (${count})` : ''}` : `x${count}`

        return (
          <div key={g.id} className={`generator-row ${!affordable ? 'cannot-afford' : ''}`}>
            <div className="gen-info">
              <span className="gen-name">
                {g.name}
                {milestoneMult > 1 && <span className="gen-milestone-badge">×{milestoneMult}</span>}
              </span>
              <span className="gen-flavor">{g.flavor}</span>
              <span className="gen-cps">{formatNumber(contribution)} crayons/sec</span>
              {next !== null && owned > 0 && (
                <span className="gen-milestone-hint">
                  ×2 at {next} ({next - owned} to go)
                </span>
              )}
            </div>
            <div className="gen-right">
              <span className="gen-owned">{owned}</span>
              <button
                className="buy-btn"
                onClick={() => buyGenerator(g.id, count)}
                disabled={!affordable}
              >
                <span className="buy-count">{label}</span>
                <span className="buy-cost">{formatNumber(cost)} 🖍</span>
              </button>
            </div>
          </div>
        )
      })}
    </section>
  )
}
