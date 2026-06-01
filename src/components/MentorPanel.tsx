import { useGameStore } from '../store/gameStore'
import { MENTORS } from '../data/mentors'
import { formatNumber } from '../utils/math'

export function MentorPanel() {
  const { lifetimeCrayons, unlockedMentors } = useGameStore()

  return (
    <section className="panel">
      <h2 className="panel-title">MENTOR PROGRAM</h2>
      {MENTORS.map((m) => {
        const unlocked = unlockedMentors.includes(m.id)
        const progress = Math.min((lifetimeCrayons / m.unlockAt) * 100, 100)

        return (
          <div key={m.id} className={`mentor-row ${unlocked ? 'unlocked' : 'locked'}`}>
            <div className="mentor-info">
              <span className="mentor-name">{unlocked ? m.name : '??? CLASSIFIED ???'}</span>
              {unlocked ? (
                <>
                  <span className="mentor-effect">+{(m.cpsBonus * 100).toFixed(0)}% all production</span>
                  <span className="mentor-flavor">{m.flavor}</span>
                </>
              ) : (
                <>
                  <span className="mentor-locked-hint">
                    Unlock at {formatNumber(m.unlockAt)} lifetime crayons
                  </span>
                  <div className="mentor-progress-bar">
                    <div className="mentor-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </>
              )}
            </div>
            <div className="mentor-badge">{unlocked ? '★ ACTIVE' : '🔒'}</div>
          </div>
        )
      })}
    </section>
  )
}
