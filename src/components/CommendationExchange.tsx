import { useGameStore } from '../store/gameStore'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { formatNumber } from '../utils/math'
import { lifetimeForCommendations } from '../data/prestige'

export function CommendationExchange() {
  const { lifetimeCrayons, commendations, commendationsEarned, prestigeUpgrades, buyPrestigeUpgrade } =
    useGameStore()

  const preview = commendationsEarned === 0 && prestigeUpgrades.length === 0
  const firstAt = lifetimeForCommendations(1)
  const progressPct = preview ? Math.min(100, (lifetimeCrayons / firstAt) * 100) : 100

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title no-margin">COMMENDATION EXCHANGE</h2>
        {!preview && (
          <span className="exchange-balance">{commendations.toLocaleString()} 🎖 to spend</span>
        )}
      </div>

      {preview ? (
        <div className="exchange-preview">
          <p className="exchange-preview-note">
            Reenlist once to unlock permanent upgrades. Your first Commendation
            unlocks at {formatNumber(firstAt)} lifetime crayons.
          </p>
          <div className="exchange-preview-bar-wrap">
            <div className="exchange-preview-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="exchange-preview-pct">
            {formatNumber(lifetimeCrayons)} / {formatNumber(firstAt)} ({Math.floor(progressPct)}%)
          </p>
        </div>
      ) : (
        <p className="exchange-note">
          Spending Commendations lowers your production bonus — choose between hoarding for the
          multiplier and cashing in for permanent power.
        </p>
      )}

      {PRESTIGE_UPGRADES.map((u) => {
        const owned = prestigeUpgrades.includes(u.id)
        const prereqLocked = !!u.requires && !prestigeUpgrades.includes(u.requires)
        const affordable = commendations >= u.cost
        const reqDef = u.requires ? PRESTIGE_UPGRADES.find((p) => p.id === u.requires) : undefined

        return (
          <div
            key={u.id}
            className={`exchange-row ${owned ? 'owned' : ''} ${prereqLocked || preview ? 'locked' : ''}`}
          >
            <div className="exchange-info">
              <span className="exchange-name">{u.name}</span>
              <span className="exchange-flavor">{u.flavor}</span>
              {!preview && prereqLocked && reqDef && (
                <span className="exchange-req">Requires: {reqDef.name}</span>
              )}
              {preview && (
                <span className="exchange-req">Costs {u.cost} 🎖 — unlocks after reenlistment</span>
              )}
            </div>
            {owned ? (
              <span className="exchange-owned-badge">✓ EARNED</span>
            ) : (
              <button
                className="buy-btn"
                onClick={() => buyPrestigeUpgrade(u.id)}
                disabled={prereqLocked || preview || !affordable}
              >
                {u.cost} 🎖
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
