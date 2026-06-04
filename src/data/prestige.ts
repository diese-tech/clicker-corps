// Prestige ("Reenlistment") tuning and formulas.
//
// On reenlistment the player wipes their current run economy (crayons,
// generators, upgrades) in exchange for permanent Commendations. Each
// Commendation grants a flat global production bonus that applies to both
// passive CPS and manual clicks. Meta progress — rank, mentors, achievements,
// lifetime crayons — is intentionally preserved.

// +2% to all crayon production per Commendation held.
export const PRESTIGE_BONUS_PER_COMMENDATION = 0.02

// Lifetime crayons required for the first Commendation. The square-root curve
// below means each additional Commendation costs progressively more.
export const COMMENDATION_DIVISOR = 50000

// Total Commendations a player is entitled to for their all-time lifetime
// crayons. Square-root scaling keeps prestige rewarding without runaway gains.
export function prestigePotential(lifetimeCrayons: number): number {
  if (lifetimeCrayons <= 0) return 0
  return Math.floor(Math.sqrt(lifetimeCrayons / COMMENDATION_DIVISOR))
}

// Global production multiplier from holding `commendations`.
export function prestigeMultiplier(commendations: number): number {
  return 1 + commendations * PRESTIGE_BONUS_PER_COMMENDATION
}

// Lifetime crayons needed to be entitled to `n` Commendations. Used to show a
// "progress to next Commendation" hint in the UI.
export function lifetimeForCommendations(n: number): number {
  return n * n * COMMENDATION_DIVISOR
}
