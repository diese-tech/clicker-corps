import { useGameStore } from '../store/gameStore'

export function TimeTravelModal() {
  const timeTamperMessage = useGameStore((s) => s.timeTamperMessage)
  const dismissTimeTamper = useGameStore((s) => s.dismissTimeTamper)
  if (!timeTamperMessage) return null

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">⏰ TEMPORAL VIOLATION</div>
        <div className="modal-body">{timeTamperMessage}</div>
        <button className="feed-btn" onClick={dismissTimeTamper}>
          AYE AYE
        </button>
      </div>
    </div>
  )
}
