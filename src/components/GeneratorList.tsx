import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../data/generators'
import {
  bulkGeneratorCost,
  maxAffordableGenerators,
  formatNumber,
  timeToAfford,
  formatDuration,
} from '../utils/math'
import { totalCostMultiplier } from '../store/effectsHelper'
import { milestoneMultiplier, nextMilestone, prevMilestone } from '../data/milestones'

function formatCycleDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h`
}

type BuyAmount = 1 | 10 | 100 | 'max'
const AMOUNTS: BuyAmount[] = [1, 10, 100, 'max']

export function GeneratorList() {
  const { crayons, cps, lifetimeCrayons, generators, purchasedUpgrades, prestigeUpgrades, hiredManagers, generatorCycleProgress, buyGenerator, startGenerator } =
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
        const wait = affordable ? null : timeToAfford(cost, crayons, cps)
        const milestoneMult = milestoneMultiplier(owned)
        const contribution = owned * g.baseCps * milestoneMult
        const next = nextMilestone(owned)
        const prev = prevMilestone(owned)
        const barPct = next ? Math.min(100, ((owned - prev) / (next - prev)) * 100) : 100
        const label = buyAmount === 'max' ? `MAX${count > 0 ? ` (${count})` : ''}` : `x${count}`

        const hasNCO = hiredManagers.includes(`mgr_${g.id}`)
        const cycleProgress = generatorCycleProgress[g.id] ?? 0
        const cycleIdle = !hasNCO && cycleProgress === 0
        const cyclePct = Math.min(100, cycleProgress * 100)

        return (
          <div
            key={g.id}
            className={`generator-row ${!affordable ? 'cannot-afford' : ''}`}
            onClick={cycleIdle && owned > 0 ? () => startGenerator(g.id) : undefined}
            style={cycleIdle && owned > 0 ? { cursor: 'pointer' } : undefined}
          >
            <div className="gen-info">
              <span className="gen-name">
                {g.name}
                {milestoneMult > 1 && <span className="gen-milestone-badge">×{milestoneMult}</span>}
                {hasNCO && <span className="gen-auto-badge">AUTO</span>}
              </span>
              <span className="gen-flavor">{g.flavor}</span>
              <span className="gen-cps">{formatNumber(contribution)} crayons/sec</span>
              {owned > 0 && (
                <div
                  className={`gen-cycle-bar-wrap ${cycleIdle ? 'idle' : ''} ${cyclePct >= 100 ? 'complete' : ''}`}
                  onClick={cycleIdle ? (e) => { e.stopPropagation(); startGenerator(g.id) } : undefined}
                >
                  <div className="gen-cycle-bar-fill" style={{ width: `${cyclePct}%` }} />
                  {cycleIdle && <span className="gen-cycle-tap-cue">TAP ({formatCycleDuration(g.cycleDuration)})</span>}
                </div>
              )}
              {next !== null && (
                <>
                  <div className="gen-milestone-bar-wrap">
                    <div className="gen-milestone-bar-fill" style={{ width: `${barPct}%` }} />
                  </div>
                  <span className="gen-milestone-bar-label">
                    {next - owned} more → ×{milestoneMult * 2} at {next}
                  </span>
                </>
              )}
            </div>
            <div className="gen-right">
              <span className="gen-owned">{owned}</span>
              <button
                className="buy-btn"
                onClick={(e) => { e.stopPropagation(); buyGenerator(g.id, count) }}
                disabled={!affordable}
              >
                <span className="buy-count">{label}</span>
                <span className="buy-cost">{formatNumber(cost)} 🖍</span>
                {wait !== null && (
                  <span className="buy-timer">{formatDuration(wait)}</span>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </section>
  )
}
