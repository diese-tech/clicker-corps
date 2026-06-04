import { useGameStore } from '../store/gameStore'
import { ACHIEVEMENTS } from '../data/achievements'

export function AchievementPanel() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements)
  const unlockedCount = unlockedAchievements.length

  return (
    <section className="panel">
      <h2 className="panel-title">
        RIBBON RACK <span className="ach-count">{unlockedCount}/{ACHIEVEMENTS.length}</span>
      </h2>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedAchievements.includes(a.id)
          return (
            <div
              key={a.id}
              className={`ach-row ${unlocked ? 'unlocked' : 'locked'}`}
              title={unlocked ? a.flavor : a.hint}
            >
              <span className="ach-medal">{unlocked ? '🎖' : '🔒'}</span>
              <div className="ach-text">
                <span className="ach-name">{unlocked ? a.name : '???'}</span>
                <span className="ach-desc">{unlocked ? a.flavor : a.hint}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
