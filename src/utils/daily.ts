// Local-date helpers for the daily morale bonus. Everything keys off the
// player's local calendar day so "come back tomorrow" matches their clock.

const DAY_MS = 24 * 60 * 60 * 1000

// "YYYY-MM-DD" for the given date in LOCAL time.
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// A daily bonus is available whenever today's local day differs from the day
// of the last claim (null = never claimed).
export function dailyAvailable(lastClaimDay: string | null): boolean {
  return lastClaimDay !== dateKey()
}

// The streak the player will have AFTER claiming today: continues only if the
// last claim was exactly yesterday, otherwise it resets to 1.
export function streakAfterClaim(lastClaimDay: string | null, currentStreak: number): number {
  if (!lastClaimDay) return 1
  const yesterday = dateKey(new Date(Date.now() - DAY_MS))
  return lastClaimDay === yesterday ? currentStreak + 1 : 1
}

export const DAILY_STREAK_CAP = 7

// Crayon reward for claiming on a given streak day. Scales with production
// (90s worth) and streak, capped at 7 days, with a floor for new players.
// Single source of truth for both the store and the UI.
export function dailyReward(cps: number, streak: number): number {
  const capped = Math.min(streak, DAILY_STREAK_CAP)
  return Math.max(cps * 90 * capped, 50 * capped)
}
