import { useGameStore } from '../store/gameStore'

export function ClickArea() {
  const { click, totalClicks, crayonsPerClick } = useGameStore()

  return (
    <section className="click-area">
      <button className="jarhead-btn" onClick={click} aria-label="Feed Crayon">
        <img
          src="/assets/placeholders/jarhead-default.png"
          alt="Jarhead"
          className="jarhead-img"
          draggable={false}
        />
      </button>
      <button className="feed-btn" onClick={click}>
        FEED CRAYON
      </button>
      <div className="click-stats">
        <span>+{crayonsPerClick} per click</span>
        <span>{totalClicks.toLocaleString()} total motivations</span>
      </div>
    </section>
  )
}
