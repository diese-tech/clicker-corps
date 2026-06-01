export function generatorCost(baseCost: number, owned: number, costMultiplier = 1): number {
  return Math.ceil(baseCost * Math.pow(1.15, owned) * costMultiplier)
}

export function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K'
  return Math.floor(n).toString()
}
