import { useGameStore } from '../store/gameStore'

export function OfflineModal() {
  const { offlineMessage, dismissOfflineMessage } = useGameStore()
  if (!offlineMessage) return null

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-title">INCOMING TRANSMISSION</div>
        <div className="modal-body">{offlineMessage}</div>
        <button className="feed-btn" onClick={dismissOfflineMessage}>
          HOOAH
        </button>
      </div>
    </div>
  )
}
