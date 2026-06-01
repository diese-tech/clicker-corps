# Clicker Corps V0 Spec

## Project Summary

**Clicker Corps** is a Marine-themed idle clicker game where the player feeds crayons to an increasingly motivated jarhead, builds absurd crayon production infrastructure, unlocks military-flavored upgrades, and eventually prestiges through reenlistment-style resets.

This V0 is not a full game. It is a playable loop prototype designed to answer one question:

> Can feeding crayons to a jarhead stay funny and satisfying for 5-10 minutes?

## Candidate Taglines

Keep both as future branding options:

- From Private to Legend. One crayon at a time.
- Build the most motivated fighting force ever assembled.

## V0 Design Goal

Build the smallest playable browser prototype that proves the idle loop.

The player should be able to:

1. Click to gain crayons.
2. Spend crayons on generators.
3. Watch crayons-per-second increase.
4. Buy upgrades that multiply output.
5. Unlock one mentor-style boost.
6. Close and reopen the game without losing progress.
7. Gain offline progress based on elapsed time.

## V0 Non-Goals

Do not build these yet:

- Accounts/login
- Backend server
- Cloud saves
- Real-money purchases
- Ads
- Mobile app wrapper
- App Store or Google Play deployment
- Full prestige tree
- Full historical Marine archive
- Multiplayer
- Leaderboards
- Gacha mechanics
- Deep lore system
- Complex animations
- Phaser/Godot migration

V0 should stay boring technically and funny in content.

## Recommended Stack

Use a web-first stack:

- Vite
- React
- TypeScript
- Zustand or equivalent lightweight state store
- localStorage for persistence
- CSS modules, plain CSS, or Tailwind

Avoid a dedicated 2D game engine for V0. The first prototype is mostly state, timers, buttons, numbers, and humor.

## Core Loop

```text
Click jarhead -> gain crayons
Crayons -> buy generators
Generators -> produce crayons/sec
Crayons -> buy upgrades
Upgrades -> multiply production
Milestones -> unlock mentor boost
Save state -> return later with offline progress
```

## Main Resource

### Crayons

Primary currency. Display as a large number.

Initial values:

```ts
crayons = 0
crayonsPerClick = 1
crayonsPerSecond = 0
```

## Manual Click

### Feed Crayon

Action:

```text
+1 crayon per click
```

Initial click text ideas:

- Feed Crayon
- Issue Snack
- Motivate the Marine

Preferred V0 button label:

```text
Feed Crayon
```

## Generators

Generators produce passive crayons per second.

Use exponential cost scaling.

Suggested formula:

```ts
cost = baseCost * Math.pow(1.15, owned)
```

Round costs up with `Math.ceil`.

### Generator Table

| ID | Name | Base Cost | Base CPS | Flavor |
|---|---:|---:|---:|---|
| crayon_box | Crayon Box | 15 | 0.1 | A basic box of government-grade wax nutrition. |
| px_run | PX Run | 100 | 1 | Someone made a suspiciously efficient trip to the PX. |
| supply_sergeant | Supply Sergeant | 1100 | 8 | Nobody knows where the crayons came from. Do not ask. |
| motor_pool_cache | Motor Pool Cache | 12000 | 47 | Found behind a broken Humvee. Still edible. |

V0 can ship with the first 3 only. The fourth is acceptable if implementation remains simple.

## Upgrades

Upgrades are one-time purchases. They apply multipliers.

### Upgrade Table

| ID | Name | Cost | Unlock Condition | Effect | Flavor |
|---|---:|---|---|---|---|
| better_crayons | Better Crayons | 100 | 50 lifetime crayons | 2x click power | The red ones taste faster. |
| bulk_rations | Bulk Rations | 500 | Own 5 Crayon Boxes | 2x Crayon Box output | Now issued by the case. |
| motivated_formation | Motivated Formation | 2500 | 1000 lifetime crayons | 2x all CPS | Somehow yelling helped. |
| field_day_ready | Field Day Ready | 10000 | Own 10 total generators | 10% cheaper generators | Clean room, clean logistics. |

V0 should include at least 3 upgrades.

## Mentor System

Mentors are inspired by historical Marine legacy figures, but V0 should avoid overcomplicating the system.

Use one unlockable mentor-style boost.

### V0 Mentor

```text
Name: Legendary Chest Puller
Unlock: 10,000 lifetime crayons
Effect: +25% all crayon production
Flavor: When surrounded, produce in every direction.
```

Important: use parody/fantasy naming for V0 until legal/name/likeness risk is reviewed. Historical figures can be researched and handled later with more care.

## Rank Progression

Rank is cosmetic in V0 and based on lifetime crayons earned.

| Rank | Lifetime Crayons Required |
|---|---:|
| Recruit | 0 |
| Private | 100 |
| Private First Class | 500 |
| Lance Corporal | 2,500 |
| Corporal | 10,000 |
| Sergeant | 50,000 |

Display current rank near the main resource.

## Save System

Use localStorage.

Persist:

```ts
{
  crayons: number,
  lifetimeCrayons: number,
  totalClicks: number,
  generators: Record<string, number>,
  purchasedUpgrades: string[],
  unlockedMentors: string[],
  lastSavedAt: number
}
```

Autosave every 5 seconds and after purchases/click milestones.

## Offline Progress

When loading, calculate elapsed time:

```ts
elapsedSeconds = (Date.now() - lastSavedAt) / 1000
offlineGain = currentCps * elapsedSeconds
```

Cap offline progress for V0:

```ts
maxOfflineSeconds = 60 * 60 * 8
```

This allows up to 8 hours of offline gains.

Show a return message:

```text
While you were gone, the Corps consumed X crayons.
```

## UI Layout

Simple single-page layout.

Suggested sections:

1. Header
   - Game name
   - Current rank
   - Crayons
   - Crayons per second
2. Main click area
   - Large jarhead/crayon button
   - Feed Crayon button
   - Total clicks
3. Generators panel
   - Name
   - Owned count
   - Cost
   - CPS contribution
   - Buy button
4. Upgrades panel
   - Available upgrades only
   - Purchased upgrades hidden or marked purchased
5. Mentor panel
   - Locked/unlocked status
6. Footer/debug panel
   - Save status
   - Reset save button for testing

## Visual Direction

V0 does not need final art.

Use placeholders:

- Big emoji/icon button is acceptable for first pass.
- Military green/cream/black palette is acceptable.
- Pixel/retro styling is acceptable.
- No copyrighted insignia, official seals, or real USMC logos.

Potential visual tone:

```text
retro barracks terminal + absurd military clipboard UI
```

## Humor Rules

The joke should feel like it was made by someone who understands Marine culture, not someone punching down from the outside.

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
- Official USMC branding
- Real living Marines as monetized characters
- Overly mean-spirited stereotypes

## Acceptance Criteria

V0 is complete when:

- Player can click to gain crayons.
- Crayon count updates immediately.
- Player can buy at least 3 generators.
- CPS updates correctly.
- Player can buy at least 3 upgrades.
- At least one mentor unlock exists.
- Rank changes based on lifetime crayons.
- Progress saves to localStorage.
- Offline gains work after closing/reopening.
- Reset save button works.
- The loop can be played for 5 minutes without breaking.

## Suggested File Structure

```text
src/
  main.tsx
  App.tsx
  data/
    generators.ts
    upgrades.ts
    ranks.ts
    mentors.ts
  store/
    gameStore.ts
  utils/
    math.ts
    save.ts
  components/
    HeaderStats.tsx
    ClickArea.tsx
    GeneratorList.tsx
    UpgradeList.tsx
    MentorPanel.tsx
    DebugPanel.tsx
```

## First Implementation Prompt

Use this prompt with an implementation agent:

```text
Build the V0 browser prototype for Clicker Corps using Vite + React + TypeScript. Follow docs/V0_SPEC.md exactly. Prioritize the playable idle loop over styling. Implement click-to-gain crayons, generators with exponential cost scaling, upgrades, one mentor unlock, rank progression, localStorage autosave, offline progress capped at 8 hours, and a reset-save debug button. Keep the UI single-page and simple. Do not add backend, auth, ads, payments, mobile wrappers, or complex animations.
```

## Next Design Questions After V0

Only revisit these after the playable prototype exists:

1. Should the main brand be Clicker Corps or Crayon Corps?
2. Should prestige be called Reenlistment, EAS, or Campaign Reset?
3. Should historical Marines be used directly or as parody-inspired mentor archetypes?
4. Should monetization start with ads, premium remove-ads, cosmetics, or supporter pack?
5. Should the game remain web-first or move toward mobile-first?
