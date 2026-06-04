import { useGameStore } from '../store/gameStore'
import { dailyAvailable, streakAfterClaim, dailyReward, DAILY_STREAK_CAP } from '../utils/daily'
import { formatNumber } from '../utils/math'

export function DailyBonus() {
  const lastDailyClaimDay = useGameStore((s) => s.lastDailyClaimDay)
  const dailyStreak = useGameStore((s) => s.dailyStreak)
  const cps = useGameStore((s) => s.cps)
  const claimDaily = useGameStore((s) => s.claimDaily)

  const available = dailyAvailable(lastDailyClaimDay)

  // Already claimed today — show a slim streak reminder (nothing if never claimed).
  if (!available) {
    if (dailyStreak === 0) return null
    return (
      <section className="daily-bonus claimed">
        <span className="daily-label">DAILY MORALE</span>
        <span className="daily-streak">🔥 {dailyStreak}-day streak · report back tomorrow</span>
      </section>
    )
  }

  const streak = streakAfterClaim(lastDailyClaimDay, dailyStreak)
  const reward = dailyReward(cps, streak)
  const weekly = streak % DAILY_STREAK_CAP === 0

  return (
    <section className="daily-bonus available">
      <div className="daily-info">
        <span className="daily-label">DAILY MORALE BONUS</span>
        <span className="daily-sub">
          Day {streak} · +{formatNumber(reward)} 🖍{weekly ? ' · WEEKLY FRENZY!' : ''}
        </span>
      </div>
      <button className="daily-claim-btn" onClick={claimDaily}>
        CLAIM
      </button>
    </section>
  )
}
