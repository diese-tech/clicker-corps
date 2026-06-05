import { useEffect, useState } from 'react'
import { useGameStore } from './store/gameStore'
import { HeaderStats } from './components/HeaderStats'
import { DailyBonus } from './components/DailyBonus'
import { FeedButton } from './components/FeedButton'
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
import { MilestonesPanel } from './components/MilestonesPanel'
import { DebugPanel } from './components/DebugPanel'
import { OfflineModal } from './components/OfflineModal'
import { TimeTravelModal } from './components/TimeTravelModal'
import { EVENT_MAX_INTERVAL_MS, EVENT_MIN_INTERVAL_MS } from './data/events'
import { computePrestigeEffects } from './data/prestigeUpgrades'

type TabId = 'supply' | 'upgrades' | 'corps' | 'prestige' | 'records' | 'settings'

const TABS: { id: TabId; icon: string; label: string; intro: string }[] = [
  { id: 'supply', icon: '🏭', label: 'Supply', intro: 'Buy crayon generators — hit quantity milestones for ×2 output.' },
  { id: 'upgrades', icon: '📦', label: 'Upgrades', intro: 'One-time requisitions that multiply your production.' },
  { id: 'corps', icon: '🪖', label: 'Corps', intro: 'Hire NCOs to permanently double individual generator output.' },
  { id: 'prestige', icon: '⭐', label: 'Prestige', intro: 'Reenlist for Commendations, then spend them on permanent power.' },
  { id: 'records', icon: '📋', label: 'Records', intro: 'Your ribbon rack and full service record.' },
  { id: 'settings', icon: '⚙️', label: 'Settings', intro: 'Tune automation, change your uniform, or reset your save.' },
]

export default function App() {
  const tick = useGameStore((s) => s.tick)
  const spawnEvent = useGameStore((s) => s.spawnEvent)
  const selectedTheme = useGameStore((s) => s.selectedTheme)
  const [activeTab, setActiveTab] = useState<TabId>('supply')

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

  const intro = TABS.find((t) => t.id === activeTab)?.intro

  return (
    <div className="app">
      <OfflineModal />
      <TimeTravelModal />
      <AchievementToast />
      <MarineEvent />

      <HeaderStats />
      <DailyBonus />
      <BuffBar />

      <nav className="tab-bar" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {intro && <p className="tab-intro">{intro}</p>}

        {activeTab === 'supply' && (
          <>
            <GeneratorList />
            <MilestonesPanel />
          </>
        )}
        {activeTab === 'upgrades' && <UpgradeList />}
        {activeTab === 'corps' && <ManagerPanel />}
        {activeTab === 'prestige' && (
          <>
            <ReenlistPanel />
            <CommendationExchange />
            <MentorPanel />
          </>
        )}
        {activeTab === 'records' && (
          <>
            <AchievementPanel />
            <StatsPanel />
          </>
        )}
        {activeTab === 'settings' && (
          <>
            <AutomationPanel />
            <ThemeSwitcher />
            <DebugPanel />
          </>
        )}
      </main>

      <FeedButton />
    </div>
  )
}
