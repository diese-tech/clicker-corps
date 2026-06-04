import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/math'
import { computePrestigeEffects } from '../data/prestigeUpgrades'

export function HeaderStats() {
  const { crayons, cps, rank, commendations, prestigeUpgrades } = useGameStore()
  const bonusPer = computePrestigeEffects(prestigeUpgrades).bonusPerCommendation
  const prestigeBonusPct = Math.round(commendations * bonusPer * 100)

  return (
    <header className="topbar">
      <div className="topbar-brand">CLICKER&nbsp;CORPS</div>
      <div className="currency-row">
        <div className="currency hero">
          <span className="currency-value">{formatNumber(crayons)}</span>
          <span className="currency-label">🖍 CRAYONS</span>
        </div>
        <div className="currency">
          <span className="currency-value">{formatNumber(cps)}/s</span>
          <span className="currency-label">PER SEC</span>
        </div>
        <div className="currency">
          <span className="currency-value rank">{rank}</span>
          <span className="currency-label">RANK</span>
        </div>
        {commendations > 0 && (
          <div className="currency">
            <span className="currency-value">
              {commendations} <span className="commendation-bonus">+{prestigeBonusPct}%</span>
            </span>
            <span className="currency-label">🎖 COMMEND</span>
          </div>
        )}
      </div>
    </header>
  )
}
