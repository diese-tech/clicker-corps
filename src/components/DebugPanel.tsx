import { useGameStore } from '../store/gameStore'

export function DebugPanel() {
  const { resetSave, lifetimeCrayons } = useGameStore()

  function handleReset() {
    if (window.confirm('RESET ALL PROGRESS? This cannot be undone.')) {
      resetSave()
    }
  }

  return (
    <footer className="debug-panel">
      <span className="debug-info">
        Lifetime: {Math.floor(lifetimeCrayons).toLocaleString()} crayons consumed
      </span>
      <button className="reset-btn" onClick={handleReset}>
        RESET SAVE (DEBUG)
      </button>
    </footer>
  )
}
