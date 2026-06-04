import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/math'

// Holding feeds automatically at a steady — and deliberately slower-than-tapping
// — rate. Rapid tapping always out-earns holding.
const HOLD_INTERVAL_MS = 300

export function FeedButton() {
  const click = useGameStore((s) => s.click)
  const crayonsPerClick = useGameStore((s) => s.crayonsPerClick)
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopHold() {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
  }
  // Clean up any running hold if the component unmounts mid-press.
  useEffect(() => stopHold, [])

  function startHold(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* setPointerCapture can throw on some browsers — safe to ignore */
    }
    click() // immediate feed (also covers a plain tap)
    stopHold()
    holdRef.current = setInterval(click, HOLD_INTERVAL_MS)
  }

  return (
    <div className="feed-dock">
      <span className="feed-rate">+{formatNumber(crayonsPerClick)} per feed</span>
      <button
        className="feed-circle"
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Feed crayon — tap to feed, hold to auto-feed"
      >
        <img
          src="/assets/placeholders/jarhead-default.png"
          alt="Jarhead"
          className="feed-img"
          draggable={false}
        />
        <span className="feed-circle-label">FEED</span>
      </button>
    </div>
  )
}
