import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { GENERATORS } from '../data/generators'
import { UPGRADES } from '../data/upgrades'
import { MANAGERS } from '../data/managers'
import { MENTORS } from '../data/mentors'
import { ACHIEVEMENTS } from '../data/achievements'
import { PRESTIGE_BONUS_PER_COMMENDATION, prestigePotential } from '../data/prestige'
import { formatNumber, formatDuration } from '../utils/math'

interface StatRow {
  label: string
  value: string
}

export function StatsPanel() {
  const [open, setOpen] = useState(false)
  const s = useGameStore()

  if (!open) {
    return (
      <section className="panel stats-trigger-panel">
        <button className="stats-trigger-btn" onClick={() => setOpen(true)}>
          📋 VIEW SERVICE RECORD
        </button>
      </section>
    )
  }

  const generatorsOwned = Object.values(s.generators).reduce((a, b) => a + b, 0)
  const claimable = Math.max(0, prestigePotential(s.lifetimeCrayons) - s.commendations)

  const sections: { title: string; rows: StatRow[] }[] = [
    {
      title: 'PRODUCTION',
      rows: [
        { label: 'Crayons (current)', value: formatNumber(s.crayons) },
        { label: 'Lifetime crayons', value: formatNumber(s.lifetimeCrayons) },
        { label: 'Crayons / sec', value: `${formatNumber(s.cps)}/s` },
        { label: 'Crayons / click', value: formatNumber(s.crayonsPerClick) },
        { label: 'Total clicks', value: s.totalClicks.toLocaleString() },
      ],
    },
    {
      title: 'CAREER',
      rows: [
        { label: 'Rank', value: s.rank },
        { label: 'Time in service', value: formatDuration(s.playtimeSeconds) },
        { label: 'Generators owned', value: generatorsOwned.toLocaleString() },
        { label: 'Generator types', value: `${GENERATORS.length}` },
        {
          label: 'Upgrades',
          value: `${s.purchasedUpgrades.length} / ${UPGRADES.length}`,
        },
        { label: 'NCOs hired', value: `${s.hiredManagers.length} / ${MANAGERS.length}` },
        { label: 'Mentors', value: `${s.unlockedMentors.length} / ${MENTORS.length}` },
        {
          label: 'Achievements',
          value: `${s.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`,
        },
      ],
    },
    {
      title: 'PRESTIGE',
      rows: [
        { label: 'Commendations', value: s.commendations.toLocaleString() },
        {
          label: 'Production bonus',
          value: `+${Math.round(s.commendations * PRESTIGE_BONUS_PER_COMMENDATION * 100)}%`,
        },
        { label: 'Reenlist now for', value: `${claimable.toLocaleString()} 🎖` },
      ],
    },
  ]

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal-box stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">SERVICE RECORD</div>
        {sections.map((sec) => (
          <div key={sec.title} className="stats-section">
            <h3 className="stats-section-title">{sec.title}</h3>
            {sec.rows.map((r) => (
              <div key={r.label} className="stats-row">
                <span className="stats-row-label">{r.label}</span>
                <span className="stats-row-value">{r.value}</span>
              </div>
            ))}
          </div>
        ))}
        <button className="feed-btn" onClick={() => setOpen(false)}>
          DISMISSED
        </button>
      </div>
    </div>
  )
}
