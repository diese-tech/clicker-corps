# Clicker Corps

**Clicker Corps** is a Marine-themed idle clicker where the player feeds crayons to an increasingly motivated jarhead, builds absurd crayon-production infrastructure, hires NCOs to run it, climbs the ranks, and reenlists for permanent power — wax-based logistics taken to unreasonable, expeditionary scale.

## Candidate Taglines

- From Private to Legend. One crayon at a time.
- Build the most motivated fighting force ever assembled.

## Current Status

**PLAYABLE — FULL CORE GAME**

A complete idle loop in the spirit of Cookie Clicker and AdVenture Capitalist, running entirely in the browser with no backend.

### Features

- **Clicking** — feed crayons by hand; click power scales with upgrades, prestige, and frenzies.
- **10 generators** escalating from a Crayon Box to a worldwide Expeditionary Force, with exponential cost scaling.
- **Bulk buying** — purchase generators x1 / x10 / x100 / Max.
- **Quantity milestones** — owning 25/50/100/150/200/300/400/500 of a generator doubles its output at each threshold (AdVenture-Capitalist style), with a badge and next-milestone hint.
- **14 upgrades** — per-generator output doublers, global CPS tiers, click tiers, and cost reductions.
- **Managers (NCO Corps)** — hire NCOs that auto-reinvest crayons into their generator, with a master Auto-Buy toggle.
- **Crayon Factory Automation** — opt-in Auto-Requisition (buys affordable upgrades) and Auto-Collect Events.
- **Random Marine Events** — golden-crayon drops granting instant windfalls or timed production / click frenzies, with a live buff bar.
- **Prestige / "Reenlistment"** — every reset is a true crayon clean slate; you earn Commendations (each grants a passive production bonus) based on total lifetime crayons.
- **Commendation Exchange** — spend Commendations on ~10 permanent meta-upgrades (production/click multipliers, cheaper generators, longer offline cap, faster/bigger events, longer frenzies). Spending lowers your balance — and thus your passive bonus — so it's a real hoard-vs-invest decision (AdVenture-Capitalist-style).
- **5 mentor legends** — parody-inspired Marine archetypes granting stacking permanent bonuses.
- **15-tier rank ladder** — Recruit all the way to Supreme Allied Crayon Commander.
- **26 achievements** ("Ribbon Rack") with pop-up unlock toasts. Each earned achievement also grants **+1% to all production** (a Cookie-Clicker-style morale/feedback loop).
- **Daily morale bonus** — a once-per-day claimable reward that scales with production and a consecutive-day login streak (weekly frenzy every 7 days).
- **Statistics** — a Service Record modal summarizing your whole career, including time in service.
- **Cosmetic themes** — Woodland, Desert, Dress Blues, and Night Ops palettes.
- **Persistence** — localStorage autosave every 5s, offline progress capped at 8 hours (extendable via prestige), and a reset-save button.
- **Time-travel detection** — a local clock-tamper check (no backend) that greets clock-cheaters with a tongue-in-cheek "Temporal Violation" Easter egg.

### Out of scope (by design)

Auth, backend, database, cloud saves, ads, payments, analytics, mobile wrappers, Phaser, Godot, multiplayer, leaderboards.

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
  App.tsx               Game loop (rAF tick) + tabbed single-screen layout
  index.css             Global styles (military green terminal)
  data/
    generators.ts       Generator definitions and costs
    upgrades.ts         Upgrade definitions and effects
    ranks.ts            Rank thresholds and lookup
    mentors.ts          Mentor unlock definitions
    achievements.ts     Achievement definitions and unlock predicates
    prestige.ts         Reenlistment formulas (Commendations + bonus)
    managers.ts         NCO (manager) definitions per generator
    events.ts           Random event definitions and buff tuning
    themes.ts           Cosmetic palette definitions
  store/
    gameStore.ts        Zustand store — all game state, actions, automation loops
    effectsHelper.ts    Upgrade effect computation helper
  utils/
    math.ts             Cost/bulk-cost formulas, number + duration formatting
    save.ts             localStorage read/write/delete
  components/
    HeaderStats.tsx     Rank, crayons, CPS, Commendations display
    FeedButton.tsx      Bottom Egg-Inc-style feed control (tap + hold)
    GeneratorList.tsx   Buy generators panel + x1/x10/x100/Max toggle
    UpgradeList.tsx     Available upgrades panel
    ManagerPanel.tsx    NCO Corps — hire managers + auto-buy toggle
    AutomationPanel.tsx Auto-requisition + auto-collect toggles
    MentorPanel.tsx     Mentor unlocks + progress bars
    ReenlistPanel.tsx   Prestige panel — Commendations + reenlist button
    AchievementPanel.tsx  Ribbon rack — locked/unlocked achievements
    AchievementToast.tsx  Pop-up notification on achievement unlock
    MarineEvent.tsx     Floating collectible event
    BuffBar.tsx         Active-buff countdown chips
    StatsPanel.tsx      Service Record statistics modal
    ThemeSwitcher.tsx   Cosmetic theme picker
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
