import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function BuffBar() {
  const activeBuffs = useGameStore((s) => s.activeBuffs)
  // Tick locally so the countdown stays live even between buff changes.
  const [, force] = useState(0)
  useEffect(() => {
    if (activeBuffs.length === 0) return
    const id = setInterval(() => force((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [activeBuffs.length])

  const now = Date.now()
  const live = activeBuffs.filter((b) => b.expiresAt > now)
  if (live.length === 0) return null

  return (
    <div className="buff-bar">
      {live.map((b, i) => {
        const secs = Math.ceil((b.expiresAt - now) / 1000)
        return (
          <div key={`${b.label}-${i}`} className="buff-chip">
            <span className="buff-chip-label">
              {b.label} {b.kind === 'cps' ? `x${b.mult}` : `CLICK x${b.mult}`}
            </span>
            <span className="buff-chip-time">{secs}s</span>
          </div>
        )
      })}
    </div>
  )
}
