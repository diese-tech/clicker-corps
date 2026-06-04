import { useGameStore } from '../store/gameStore'

export function AutomationPanel() {
  const {
    hiredManagers,
    commendations,
    autoBuyUpgrades,
    autoCollectEvents,
    toggleAutoBuyUpgrades,
    toggleAutoCollectEvents,
  } = useGameStore()

  // Reveal once the player has started automating (hired an NCO) or prestiged.
  if (hiredManagers.length === 0 && commendations === 0) return null

  return (
    <section className="panel">
      <h2 className="panel-title">CRAYON FACTORY AUTOMATION</h2>

      <div className="automation-row">
        <div className="automation-info">
          <span className="automation-name">Auto-Requisition</span>
          <span className="automation-flavor">
            Automatically buys any upgrade you can afford.
          </span>
        </div>
        <button
          className={`autobuy-toggle ${autoBuyUpgrades ? 'on' : 'off'}`}
          onClick={toggleAutoBuyUpgrades}
        >
          {autoBuyUpgrades ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="automation-row">
        <div className="automation-info">
          <span className="automation-name">Auto-Collect Events</span>
          <span className="automation-flavor">
            A motivated boot grabs every crayon drop for you.
          </span>
        </div>
        <button
          className={`autobuy-toggle ${autoCollectEvents ? 'on' : 'off'}`}
          onClick={toggleAutoCollectEvents}
        >
          {autoCollectEvents ? 'ON' : 'OFF'}
        </button>
      </div>
    </section>
  )
}
