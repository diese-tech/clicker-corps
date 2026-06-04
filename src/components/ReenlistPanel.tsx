import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/math'
import { lifetimeForCommendations, prestigePotential } from '../data/prestige'
import { computePrestigeEffects } from '../data/prestigeUpgrades'

// Reveal the panel a little before the first Commendation is reachable so the
// player can see the goal coming.
const REVEAL_AT = lifetimeForCommendations(1) / 2

export function ReenlistPanel() {
  const lifetimeCrayons = useGameStore((s) => s.lifetimeCrayons)
  const commendations = useGameStore((s) => s.commendations)
  const commendationsEarned = useGameStore((s) => s.commendationsEarned)
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades)
  const reenlist = useGameStore((s) => s.reenlist)

  if (lifetimeCrayons < REVEAL_AT && commendationsEarned === 0) return null

  const potential = prestigePotential(lifetimeCrayons)
  // New Commendations are based on total ever earned, not the current balance.
  const gain = potential - commendationsEarned
  const bonusPer = computePrestigeEffects(prestigeUpgrades).bonusPerCommendation
  const currentBonusPct = Math.round(commendations * bonusPer * 100)

  // Progress toward the next unclaimed Commendation.
  const floorAt = lifetimeForCommendations(potential)
  const nextAt = lifetimeForCommendations(potential + 1)
  const progress = Math.min(
    100,
    ((lifetimeCrayons - floorAt) / (nextAt - floorAt)) * 100
  )

  function handleReenlist() {
    if (gain <= 0) return
    const ok = window.confirm(
      `Reenlist for ${gain} Commendation${gain === 1 ? '' : 's'}?\n\n` +
        'This wipes your crayons, generators, and upgrades. ' +
        'Your rank, mentors, achievements, and Commendations are kept forever.'
    )
    if (ok) reenlist()
  }

  return (
    <section className="panel">
      <h2 className="panel-title">REENLISTMENT</h2>

      <div className="reenlist-summary">
        <div className="reenlist-stat">
          <span className="reenlist-stat-value">{commendations.toLocaleString()}</span>
          <span className="reenlist-stat-label">COMMENDATIONS</span>
        </div>
        <div className="reenlist-stat">
          <span className="reenlist-stat-value">+{currentBonusPct}%</span>
          <span className="reenlist-stat-label">ALL PRODUCTION</span>
        </div>
      </div>

      <p className="reenlist-flavor">
        Sign on the dotted line. Keep your stories, dump your gear, and come back
        permanently more motivated.
      </p>

      {gain > 0 ? (
        <button className="reenlist-btn ready" onClick={handleReenlist}>
          REENLIST &nbsp;+{gain} 🎖
        </button>
      ) : (
        <>
          <button className="reenlist-btn" disabled>
            REENLIST &nbsp;+0 🎖
          </button>
          <div className="reenlist-progress-row">
            <div className="reenlist-progress-bar">
              <div className="reenlist-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="reenlist-progress-hint">
              Next Commendation at {formatNumber(nextAt)} lifetime crayons
            </span>
          </div>
        </>
      )}
    </section>
  )
}
