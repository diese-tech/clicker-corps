import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { HeaderStats } from './components/HeaderStats'
import { DailyBonus } from './components/DailyBonus'
import { ClickArea } from './components/ClickArea'
import { GeneratorList } from './components/GeneratorList'
import { UpgradeList } from './components/UpgradeList'
import { MentorPanel } from './components/MentorPanel'
import { ManagerPanel } from './components/ManagerPanel'
import { AutomationPanel } from './components/AutomationPanel'
import { ReenlistPanel } from './components/ReenlistPanel'
import { CommendationExchange } from './components/CommendationExchange'
import { AchievementPanel } from './components/AchievementPanel'
import { StatsPanel } from './components/StatsPanel'
import { ThemeSwitcher } from './components/ThemeSwitcher'
import { AchievementToast } from './components/AchievementToast'
import { MarineEvent } from './components/MarineEvent'
import { BuffBar } from './components/BuffBar'
import { DebugPanel } from './components/DebugPanel'
import { OfflineModal } from './components/OfflineModal'
import { TimeTravelModal } from './components/TimeTravelModal'
import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from './data/events'
import { computePrestigeEffects } from './data/prestigeUpgrades'

export default function App() {
  const tick = useGameStore((s) => s.tick)
  const spawnEvent = useGameStore((s) => s.spawnEvent)
  const selectedTheme = useGameStore((s) => s.selectedTheme)

  // Apply the cosmetic theme by setting a data-theme attribute the CSS keys off.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', selectedTheme)
  }, [selectedTheme])

  useEffect(() => {
    let last = performance.now()
    let id: number

    function frame(now: number) {
      const delta = (now - last) / 1000
      last = now
      tick(delta)
      id = requestAnimationFrame(frame)
    }

    id = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(id)
  }, [tick])

  // Periodically spawn a collectible event at a random interval.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    function schedule() {
      // Mess Hall Privileges (and other prestige perks) can shorten the gap.
      const mult = computePrestigeEffects(useGameStore.getState().prestigeUpgrades).eventIntervalMult
      const delay =
        (EVENT_MIN_INTERVAL_MS + Math.random() * (EVENT_MAX_INTERVAL_MS - EVENT_MIN_INTERVAL_MS)) *
        mult
      timer = setTimeout(() => {
        spawnEvent()
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [spawnEvent])

  return (
    <div className="app">
      <OfflineModal />
      <TimeTravelModal />
      <AchievementToast />
      <MarineEvent />
      <BuffBar />
      <HeaderStats />
      <DailyBonus />
      <main className="main-layout">
        <div className="left-col">
          <ClickArea />
        </div>
        <div className="right-col">
          <UpgradeList />
          <GeneratorList />
          <ManagerPanel />
          <AutomationPanel />
          <ReenlistPanel />
          <CommendationExchange />
          <MentorPanel />
          <AchievementPanel />
          <ThemeSwitcher />
          <StatsPanel />
        </div>
      </main>
      <DebugPanel />
    </div>
  )
}
