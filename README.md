# Clicker Corps

**Clicker Corps** is a Marine-themed idle clicker prototype where the player feeds crayons to an increasingly motivated jarhead, buys absurd crayon-production upgrades, unlocks mentor-style boosts, and climbs the ranks through increasingly unreasonable quantities of wax-based logistics.

## Candidate Taglines

- From Private to Legend. One crayon at a time.
- Build the most motivated fighting force ever assembled.

## Current Status

**V0 PROTOTYPE — PLAYABLE**

The core loop is implemented and runs in the browser. This is a rough prototype intended to answer one question:

> Can feeding crayons to a jarhead stay funny and satisfying for 5-10 minutes?

### What's in V0

- Click jarhead to gain crayons
- 4 passive crayon generators with exponential cost scaling
- 4 one-time upgrades with multiplier effects
- 1 mentor unlock (Legendary Chest Puller — +25% all production at 10,000 lifetime crayons)
- Rank progression: Recruit → Private → PFC → Lance Corporal → Corporal → Sergeant
- localStorage autosave every 5 seconds
- Offline progress calculated on load, capped at 8 hours
- Reset-save debug button
- Offline return message ("While you were gone, the Corps consumed X crayons.")
- 12 achievements ("Ribbon Rack") tracked across clicks, lifetime crayons, generators, upgrades, and mentors, with a pop-up toast on unlock

### What's NOT in V0 (by design)

Auth, backend, database, cloud saves, ads, payments, analytics, mobile wrappers, Phaser, Godot, multiplayer, leaderboards, prestige systems.

## Running Locally

**Prerequisites:** Node.js 18+ and npm.

```bash
# Install dependencies
npm install

# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

The dev server runs at `http://localhost:5173` by default.

## Stack

- [Vite](https://vitejs.dev/) — build tool
- [React 18](https://react.dev/) + TypeScript
- [Zustand](https://github.com/pmndrs/zustand) — lightweight state store
- localStorage — save/load
- Plain CSS — military green terminal aesthetic

## Project Structure

```
src/
  main.tsx              Entry point
  App.tsx               Game loop (rAF tick) and layout
  index.css             Global styles (military green terminal)
  data/
    generators.ts       Generator definitions and costs
    upgrades.ts         Upgrade definitions and effects
    ranks.ts            Rank thresholds and lookup
    mentors.ts          Mentor unlock definitions
    achievements.ts     Achievement definitions and unlock predicates
  store/
    gameStore.ts        Zustand store — all game state and actions
    effectsHelper.ts    Upgrade effect computation helper
  utils/
    math.ts             Cost formula and number formatting
    save.ts             localStorage read/write/delete
  components/
    HeaderStats.tsx     Rank, crayons, CPS display
    ClickArea.tsx       Jarhead button + Feed Crayon button
    GeneratorList.tsx   Buy generators panel
    UpgradeList.tsx     Available upgrades panel
    MentorPanel.tsx     Mentor unlock + progress bar
    AchievementPanel.tsx  Ribbon rack — locked/unlocked achievements
    AchievementToast.tsx  Pop-up notification on achievement unlock
    DebugPanel.tsx      Lifetime stats + reset button
    OfflineModal.tsx    Offline progress notification
public/
  assets/placeholders/
    jarhead-default.png   Main clickable mascot placeholder
    crayon-placeholder.png  Crayon icon placeholder
```

## V0 Scope

See [`docs/V0_SPEC.md`](docs/V0_SPEC.md) for the full implementation spec.

## Design Principle

V0 should be technically boring and comedically useful.

## Humor Guidelines

Use:

- Crayon jokes
- Barracks jokes
- Field day jokes
- E-3 mafia jokes
- Supply/logistics absurdity
- Motivational Marine language

Avoid:

- Mocking combat trauma
- Real casualties
- Current political military topics
- Official USMC branding, seals, or insignia
- Monetized use of real living Marines
- Mean-spirited stereotypes

## Agent Instructions

Before implementing, read:

1. [`docs/V0_SPEC.md`](docs/V0_SPEC.md)
2. [`docs/AI_GUARDRAILS.md`](docs/AI_GUARDRAILS.md)

Do not add features outside V0 without an explicit spec update.
