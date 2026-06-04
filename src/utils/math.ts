export function generatorCost(baseCost: number, owned: number, costMultiplier = 1): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned) * costMultiplier)
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
