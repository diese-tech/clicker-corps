import { useGameStore } from '../store/gameStore'
import { THEMES } from '../data/themes'

export function ThemeSwitcher() {
  const selectedTheme = useGameStore((s) => s.selectedTheme)
  const setTheme = useGameStore((s) => s.setTheme)

  return (
    <section className="panel">
      <h2 className="panel-title">UNIFORM OF THE DAY</h2>
      <div className="theme-grid">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`theme-swatch ${selectedTheme === t.id ? 'active' : ''}`}
            onClick={() => setTheme(t.id)}
            style={{ background: t.bg, borderColor: t.accent }}
          >
            <span className="theme-dot" style={{ background: t.accent }} />
            <span className="theme-name" style={{ color: t.accent }}>
              {t.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
