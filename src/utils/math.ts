export function generatorCost(baseCost: number, owned: number, costMultiplier = 1): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned) * costMultiplier)
}

// Total cost to buy `amount` consecutive units starting from `owned`.
export function bulkGeneratorCost(
  baseCost: number,
  owned: number,
  amount: number,
  costMultiplier = 1
): number {
  let total = 0
  for (let k = 0; k < amount; k++) {
    total += generatorCost(baseCost, owned + k, costMultiplier)
  }
  return total
}

// How many units `budget` can buy starting from `owned`, plus their total
// cost. Costs grow 15% per unit, so the count is bounded logarithmically;
// the cap is a safety net against pathological inputs.
export function maxAffordableGenerators(
  baseCost: number,
  owned: number,
  budget: number,
  costMultiplier = 1
): { count: number; cost: number } {
  let count = 0
  let cost = 0
  while (count < 100000) {
    const next = generatorCost(baseCost, owned + count, costMultiplier)
    if (cost + next > budget) break
    cost += next
    count++
  }
  return { count, cost }
}

// Suffixes for short-scale large numbers: thousand, million, billion,
// trillion, then quadrillion onward.
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc']

export function formatNumber(n: number): string {
  if (!isFinite(n)) return '∞'
  if (n < 1000) return Math.floor(n).toString()

  const tier = Math.min(Math.floor(Math.log10(n) / 3), SUFFIXES.length - 1)
  const scaled = n / Math.pow(10, tier * 3)
  return scaled.toFixed(2) + SUFFIXES[tier]
}

// Formats a duration in seconds as a compact "1d 2h 3m" string.
export function formatDuration(totalSeconds: number): string {
  const s = Math.floor(totalSeconds)
  const days = Math.floor(s / 86400)
  const hours = Math.floor((s % 86400) / 3600)
  const mins = Math.floor((s % 3600) / 60)
  const secs = s % 60
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}
