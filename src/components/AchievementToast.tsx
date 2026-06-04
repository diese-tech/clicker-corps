import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { ACHIEVEMENTS } from '../data/achievements'

const TOAST_DURATION_MS = 4500

export function AchievementToast() {
  const pendingAchievements = useGameStore((s) => s.pendingAchievements)
  const dismissAchievementToast = useGameStore((s) => s.dismissAchievementToast)
  const currentId = pendingAchievements[0]

  // Auto-dismiss the front-of-queue toast. Re-arms when the id changes so a
  // burst of unlocks plays one after another.
  useEffect(() => {
    if (!currentId) return
    const timer = setTimeout(dismissAchievementToast, TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [currentId, dismissAchievementToast])

  if (!currentId) return null
  const def = ACHIEVEMENTS.find((a) => a.id === currentId)
  if (!def) return null

  return (
    <div className="ach-toast" onClick={dismissAchievementToast} role="status">
      <span className="ach-toast-medal">🎖</span>
      <div className="ach-toast-text">
        <span className="ach-toast-label">ACHIEVEMENT UNLOCKED</span>
        <span className="ach-toast-name">{def.name}</span>
        <span className="ach-toast-flavor">{def.flavor}</span>
      </div>
    </div>
  )
}
