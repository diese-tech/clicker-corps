import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/math'

export function HeaderStats() {
  const { crayons, cps, rank } = useGameStore()

  return (
    <header className="header-stats">
      <div className="game-title">CLICKER CORPS</div>
      <div className="tagline">From Private to Legend. One crayon at a time.</div>
      <div className="stats-row">
        <div className="stat-block">
          <span className="stat-label">RANK</span>
          <span className="stat-value rank-value">{rank}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">CRAYONS</span>
          <span className="stat-value crayon-count">{formatNumber(crayons)}</span>
        </div>
        <div className="stat-block">
          <span className="stat-label">PER SEC</span>
          <span className="stat-value">{cps.toFixed(1)}/s</span>
        </div>
      </div>
    </header>
  )
}
