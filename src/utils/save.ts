const SAVE_KEY = 'clicker-corps-v0'

export interface SaveState {
  crayons: number
  lifetimeCrayons: number
  totalClicks: number
  generators: Record<string, number>
  purchasedUpgrades: string[]
  unlockedMentors: string[]
  unlockedAchievements: string[]
  commendations: number
  commendationsEarned: number
  prestigeUpgrades: string[]
  hiredManagers: string[]
  autoBuyEnabled: boolean
  autoBuyUpgrades: boolean
  autoCollectEvents: boolean
  playtimeSeconds: number
  selectedTheme: string
  lastDailyClaimDay: string | null
  dailyStreak: number
  lastSavedAt: number
}

export function loadSave(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SaveState
  } catch {
    return null
  }
}

export function writeSave(state: SaveState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}
