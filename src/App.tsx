import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { HeaderStats } from './components/HeaderStats'
import { ClickArea } from './components/ClickArea'
import { GeneratorList } from './components/GeneratorList'
import { UpgradeList } from './components/UpgradeList'
import { MentorPanel } from './components/MentorPanel'
import { ManagerPanel } from './components/ManagerPanel'
import { ReenlistPanel } from './components/ReenlistPanel'
import { AchievementPanel } from './components/AchievementPanel'
import { StatsPanel } from './components/StatsPanel'
import { AchievementToast } from './components/AchievementToast'
import { MarineEvent } from './components/MarineEvent'
import { BuffBar } from './components/BuffBar'
import { DebugPanel } from './components/DebugPanel'
import { OfflineModal } from './components/OfflineModal'
import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from './data/events'

export default function App() {
  const tick = useGameStore((s) => s.tick)
  const spawnEvent = useGameStore((s) => s.spawnEvent)

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
      const delay =
        EVENT_MIN_INTERVAL_MS + Math.random() * (EVENT_MAX_INTERVAL_MS - EVENT_MIN_INTERVAL_MS)
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
      <AchievementToast />
      <MarineEvent />
      <BuffBar />
      <HeaderStats />
      <main className="main-layout">
        <div className="left-col">
          <ClickArea />
        </div>
        <div className="right-col">
          <UpgradeList />
          <GeneratorList />
          <ManagerPanel />
          <ReenlistPanel />
          <MentorPanel />
          <AchievementPanel />
          <StatsPanel />
        </div>
      </main>
      <DebugPanel />
    </div>
  )
}
