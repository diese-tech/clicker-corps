# Clicker Corps AI Guardrails

## Mission

Build the smallest playable idle-game prototype possible.

The objective is gameplay validation, not platform construction.

## Priority Order

1. Gameplay loop
2. Save/load reliability
3. UI clarity
4. Humor and flavor
5. Visual polish
6. Expansion systems

## V0 Rule

If a proposed feature does not improve the first 5-10 minutes of gameplay, it probably does not belong in V0.

## Explicitly Allowed

- Clicking
- Resource generation
- Generators
- Upgrades
- Rank progression
- Mentor unlocks
- Save/load
- Offline progress
- UI improvements
- Bug fixes
- Balance adjustments

## Explicitly Forbidden

Unless requested through a spec update:

- Authentication
- User accounts
- Backend APIs
- Databases
- Multiplayer
- Chat systems
- Leaderboards
- Analytics platforms
- Real-money purchases
- Ad integration
- Cloud saves
- Seasonal systems
- Guilds/clans
- NFTs/blockchain
- AI-generated gameplay
- Complex deployment pipelines

## Historical Figures

Historical Marine figures may inspire mechanics and flavor.

Do not introduce real-person likeness systems, monetized hero collections, or legal-risk content without deliberate review.

### Approved decision (project owner, 2026): mentors

The mentor roster uses the **real names of deceased, historically significant Marines** as respectful homage. Rules:

- **Deceased only.** Living service members are never represented — no real name, no likeness, no parody stand-in. Out of respect for their ongoing service and commitment, living recipients (e.g. recent Medal of Honor recipients) are simply left off the roster entirely.
- **Respectful framing.** Mentor flavor text cites the Marine's real achievement as an honor. The crayon humor never targets the person, their service, or real casualties.
- **Non-monetized.** Mentors are earned through play, never sold, and there is no likeness/gacha collection system.
- Before adding any mentor, verify the individual is deceased.

One sanctioned exception honors a *living* recipient **indirectly and respectfully**: the hidden `DDG-148` upgrade references the public hull number of the U.S. Navy destroyer **USS Kyle Carpenter**. No living person's name or likeness appears in shipped text — only the ship's official designation. This is an owner-approved, name-free homage, not a precedent for naming living service members.

## Art Direction

Use placeholder assets whenever possible.

Functionality is more important than presentation during V0.

## Architecture Rule

Prefer the simplest implementation that works.

When evaluating two approaches:

- Choose fewer files.
- Choose fewer dependencies.
- Choose fewer abstractions.
- Choose less code.

## Success Criteria

Success is not:

- Launching on Steam
- Launching on mobile
- Monetization
- Large content volume

Success is:

A player voluntarily plays the prototype for several minutes and wants to continue progressing.
