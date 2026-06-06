import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { formatNumber } from '../utils/math'

// Holding feeds automatically at a steady — and deliberately slower-than-tapping
// — rate. Rapid tapping always out-earns holding.
const HOLD_INTERVAL_MS = 300
// How long a floating "+N" lives before it's removed (matches the CSS animation).
const FLOAT_LIFETIME_MS = 900

interface FloatNum {
  id: number
  amount: number
  x: number // horizontal offset in px so rapid taps don't perfectly overlap
}

export function FeedButton() {
  const click = useGameStore((s) => s.click)
  const crayonsPerClick = useGameStore((s) => s.crayonsPerClick)
  const holdRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [floats, setFloats] = useState<FloatNum[]>([])
  const floatId = useRef(0)

  function stopHold() {
    if (holdRef.current) {
      clearInterval(holdRef.current)
      holdRef.current = null
    }
  }
  // Clean up any running hold if the component unmounts mid-press.
  useEffect(() => stopHold, [])

  // One feed: bank the crayons AND spawn a short-lived floating "+N" showing the
  // amount earned. The float reads the live crayonsPerClick (the value this press
  // gained) and self-removes after the animation completes.
  function feed() {
    click()
    const id = floatId.current++
    const amount = useGameStore.getState().crayonsPerClick
    setFloats((fs) => [...fs, { id, amount, x: Math.round((Math.random() - 0.5) * 56) }])
    setTimeout(() => setFloats((fs) => fs.filter((f) => f.id !== id)), FLOAT_LIFETIME_MS)
  }

  function startHold(e: React.PointerEvent<HTMLButtonElement>) {
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* setPointerCapture can throw on some browsers — safe to ignore */
    }
    feed() // immediate feed (also covers a plain tap)
    stopHold()
    holdRef.current = setInterval(feed, HOLD_INTERVAL_MS)
  }

  return (
    <div className="feed-dock">
      {floats.map((f) => (
        <span key={f.id} className="feed-float" style={{ left: `calc(50% + ${f.x}px)` }}>
          +{formatNumber(f.amount)}
        </span>
      ))}
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
