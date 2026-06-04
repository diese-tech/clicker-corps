// Prestige ("Reenlistment") tuning and formulas.
//
// On reenlistment the player wipes their current run economy (crayons,
// generators, run upgrades, hired NCOs) in exchange for permanent Commendations.
// Each Commendation grants a flat global production bonus applied to both
// passive CPS and manual clicks. Meta progress — rank, mentors, achievements,
// lifetime crayons, and the Commendation Exchange — is preserved.

// +2% to all crayon production per Commendation held (raisable via the Exchange).
export const PRESTIGE_BONUS_PER_COMMENDATION = 0.02

// Lifetime crayons required for the FIRST Commendation.
export const FIRST_COMMENDATION_AT = 1e17

// Each further Commendation requires this many TIMES more lifetime crayons than
// the previous one — so prestige gets exponentially harder the deeper you go.
// (Logarithmic entitlement: hoarding crayons yields very few extra Commendations.)
export const COMMENDATION_GROWTH = 10

// Total Commendations a player is entitled to for their all-time lifetime
// crayons. Logarithmic: 1 at FIRST_COMMENDATION_AT, +1 every COMMENDATION_GROWTH×.
export function prestigePotential(lifetimeCrayons: number): number {
  if (lifetimeCrayons < FIRST_COMMENDATION_AT) return 0
  return Math.floor(Math.log(lifetimeCrayons / FIRST_COMMENDATION_AT) / Math.log(COMMENDATION_GROWTH)) + 1
}

// Global production multiplier from holding `commendations`.
export function prestigeMultiplier(commendations: number): number {
  return 1 + commendations * PRESTIGE_BONUS_PER_COMMENDATION
}

// Lifetime crayons needed to be entitled to `n` Commendations. Inverse of
// prestigePotential — used for the "progress to next Commendation" hint.
export function lifetimeForCommendations(n: number): number {
  if (n <= 0) return 0
  return FIRST_COMMENDATION_AT * Math.pow(COMMENDATION_GROWTH, n - 1)
}
