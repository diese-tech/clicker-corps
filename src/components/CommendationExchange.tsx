import { useGameStore } from '../store/gameStore'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'

export function CommendationExchange() {
  const { commendations, commendationsEarned, prestigeUpgrades, buyPrestigeUpgrade } =
    useGameStore()

  // Reveal once the player has ever earned a Commendation.
  if (commendationsEarned === 0 && prestigeUpgrades.length === 0) return null

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title no-margin">COMMENDATION EXCHANGE</h2>
        <span className="exchange-balance">{commendations.toLocaleString()} 🎖 to spend</span>
      </div>
      <p className="exchange-note">
        Spending Commendations lowers your production bonus — choose between hoarding for the
        multiplier and cashing in for permanent power.
      </p>

      {PRESTIGE_UPGRADES.map((u) => {
        const owned = prestigeUpgrades.includes(u.id)
        const locked = !!u.requires && !prestigeUpgrades.includes(u.requires)
        const affordable = commendations >= u.cost
        const reqDef = u.requires ? PRESTIGE_UPGRADES.find((p) => p.id === u.requires) : undefined

        return (
          <div key={u.id} className={`exchange-row ${owned ? 'owned' : ''} ${locked ? 'locked' : ''}`}>
            <div className="exchange-info">
              <span className="exchange-name">{u.name}</span>
              <span className="exchange-flavor">{u.flavor}</span>
              {locked && reqDef && (
                <span className="exchange-req">Requires: {reqDef.name}</span>
              )}
            </div>
            {owned ? (
              <span className="exchange-owned-badge">✓ EARNED</span>
            ) : (
              <button
                className="buy-btn"
                onClick={() => buyPrestigeUpgrade(u.id)}
                disabled={locked || !affordable}
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
