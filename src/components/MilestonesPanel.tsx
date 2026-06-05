import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../data/generators'
import { MILESTONE_THRESHOLDS, milestoneMultiplier, nextMilestone, prevMilestone } from '../data/milestones'

export function MilestonesPanel() {
  const generators = useGameStore((s) => s.generators)
  const lifetimeCrayons = useGameStore((s) => s.lifetimeCrayons)

  const visible = GENERATORS.filter(
    (g) => (generators[g.id] ?? 0) > 0 || lifetimeCrayons >= g.baseCost * 0.5
  )

  // Build one card per generator showing all pending thresholds (up to 3 next ones).
  const cards: { key: string; genName: string; target: number; reward: string; pct: number; toGo: number }[] = []

  for (const g of visible) {
    const owned = generators[g.id] ?? 0
    const currentMult = milestoneMultiplier(owned)
    let shown = 0
    for (const t of MILESTONE_THRESHOLDS) {
      if (owned >= t) continue
      if (shown >= 3) break
      const prev = prevMilestone(owned)
      // prevMilestone from the perspective of this threshold
      const fromPrev = shown === 0 ? prev : MILESTONE_THRESHOLDS[MILESTONE_THRESHOLDS.indexOf(t) - 1] ?? 0
      const pct = Math.min(100, ((owned - fromPrev) / (t - fromPrev)) * 100)
      const mult = currentMult * Math.pow(2, shown + 1)
      cards.push({
        key: `${g.id}-${t}`,
        genName: g.name,
        target: t,
        reward: `×${mult} output`,
        pct: shown === 0 ? pct : 0,
        toGo: t - owned,
      })
      shown++
    }
  }

  const completed = GENERATORS.filter((g) => {
    const owned = generators[g.id] ?? 0
    return owned > 0 && nextMilestone(owned) === null
  }).length

  if (cards.length === 0 && completed === 0) return null

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title no-margin">MILESTONES</h2>
        {completed > 0 && (
          <span className="milestone-completed-count">{completed} MAXED ✓</span>
        )}
      </div>
      {cards.length === 0 ? (
        <p className="upgrade-more">All generator milestones completed. Semper Fi.</p>
      ) : (
        <div className="milestone-grid">
          {cards.map((c) => (
            <div key={c.key} className={`milestone-card ${c.pct === 0 && c.toGo > 0 ? 'milestone-card-future' : ''}`}>
              <div className="milestone-card-target">{c.target}</div>
              <div className="milestone-card-name">{c.genName}</div>
              <div className="milestone-card-reward">{c.reward}</div>
              <div className="milestone-card-bar-wrap">
                <div className="milestone-card-bar-fill" style={{ width: `${c.pct}%` }} />
              </div>
              <div className="milestone-card-togo">
                {c.toGo} to go
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
