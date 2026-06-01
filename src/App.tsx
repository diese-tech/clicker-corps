import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { HeaderStats } from './components/HeaderStats'
import { ClickArea } from './components/ClickArea'
import { GeneratorList } from './components/GeneratorList'
import { UpgradeList } from './components/UpgradeList'
import { MentorPanel } from './components/MentorPanel'
import { DebugPanel } from './components/DebugPanel'
import { OfflineModal } from './components/OfflineModal'

export default function App() {
  const tick = useGameStore((s) => s.tick)

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

  return (
    <div className="app">
      <OfflineModal />
      <HeaderStats />
      <main className="main-layout">
        <div className="left-col">
          <ClickArea />
        </div>
        <div className="right-col">
          <UpgradeList />
          <GeneratorList />
          <MentorPanel />
        </div>
      </main>
      <DebugPanel />
    </div>
  )
}
