// Quantity milestones, AdVenture-Capitalist style: owning enough of a single
// generator permanently multiplies THAT generator's output. The same
// thresholds apply to every generator, and each crossed threshold doubles its
// production — turning the smooth buying curve into satisfying leaps.
export const MILESTONE_THRESHOLDS = [25, 50, 100, 150, 200, 300, 400, 500]

// Output multiplier for a generator given how many are owned: x2 per threshold.
export function milestoneMultiplier(owned: number): number {
  let crossed = 0
  for (const t of MILESTONE_THRESHOLDS) {
    if (owned >= t) crossed++
    else break
  }
  return Math.pow(2, crossed)
}

// The next threshold the player is working toward, or null once all are met.
export function nextMilestone(owned: number): number | null {
  for (const t of MILESTONE_THRESHOLDS) {
    if (owned < t) return t
  }
  return null
}
