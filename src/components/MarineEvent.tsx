import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export function MarineEvent() {
  const activeEvent = useGameStore((s) => s.activeEvent)
  const collectEvent = useGameStore((s) => s.collectEvent)
  const expireEvent = useGameStore((s) => s.expireEvent)
  const autoCollectEvents = useGameStore((s) => s.autoCollectEvents)

  // Auto-expire the collectible if the player doesn't grab it in time.
  useEffect(() => {
    if (!activeEvent) return
    const remaining = Math.max(0, activeEvent.expiresAt - Date.now())
    const timer = setTimeout(expireEvent, remaining)
    return () => clearTimeout(timer)
  }, [activeEvent, expireEvent])

  // Auto-collect (if unlocked) after a short delay so the player still sees it.
  useEffect(() => {
    if (!activeEvent || !autoCollectEvents) return
    const timer = setTimeout(collectEvent, 1500)
    return () => clearTimeout(timer)
  }, [activeEvent, autoCollectEvents, collectEvent])

  if (!activeEvent) return null

  return (
    <button
      className="marine-event"
      style={{ left: `${activeEvent.xPct}%`, top: `${activeEvent.yPct}%` }}
      onClick={collectEvent}
      title={activeEvent.flavor}
      aria-label={`Collect event: ${activeEvent.label}`}
    >
      <span className="marine-event-icon">🖍️</span>
      <span className="marine-event-label">{activeEvent.label}</span>
    </button>
  )
}
