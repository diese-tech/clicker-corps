# Clicker Corps

**Clicker Corps** is a Marine-themed idle clicker prototype where the player feeds crayons to an increasingly motivated jarhead, buys absurd crayon-production upgrades, unlocks mentor-style boosts, and climbs the ranks through increasingly unreasonable quantities of wax-based logistics.

## Candidate Taglines

- From Private to Legend. One crayon at a time.
- Build the most motivated fighting force ever assembled.

## Current Status

This repository is currently in **V0 prototype planning**.

The immediate goal is not to build a polished game. The goal is to prove the core loop:

```text
Click jarhead -> gain crayons
Crayons -> buy generators
Generators -> produce crayons/sec
Crayons -> buy upgrades
Upgrades -> multiply production
Milestones -> unlock mentor boost
Save state -> return later with offline progress
```

## V0 Scope

The first playable prototype should include:

- Manual clicking to gain crayons
- Passive crayon generators
- Upgrade purchases
- One mentor-style boost
- Rank progression based on lifetime crayons
- localStorage save/load
- Offline progress capped at 8 hours
- Reset-save debug button

See [`docs/V0_SPEC.md`](docs/V0_SPEC.md) for the full implementation spec.

## Recommended V0 Stack

Use a web-first stack:

- Vite
- React
- TypeScript
- Zustand or equivalent lightweight state store
- localStorage
- Plain CSS, CSS modules, or Tailwind

Do not use Phaser, Godot, backend services, ads, payments, auth, or mobile wrappers for V0 unless the spec is deliberately updated.

## Design Principle

V0 should be technically boring and comedically useful.

The key validation question is:

> Can feeding crayons to a jarhead stay funny and satisfying for 5-10 minutes?

If the answer is yes, the project can expand into prestige systems, historical mentor mechanics, mobile builds, cosmetics, ads, or premium monetization later.

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
