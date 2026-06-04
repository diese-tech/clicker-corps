export interface MentorDef {
  id: string
  name: string
  unlockAt: number
  cpsBonus: number
  flavor: string
}

// Real, deceased legendary Marines, used as respectful homage (project-owner
// decision — see docs/AI_GUARDRAILS.md). Living service members are NOT used;
// their slots are filled with original names instead. Each mentor grants a
// permanent, stacking production bonus at an escalating lifetime-crayon
// milestone. Flavor cites the real achievement; the honor is the joke's target,
// never the Marine.
export const MENTORS: MentorDef[] = [
  {
    id: 'mentor_henderson',
    name: 'Bvt. Brig. Gen. Archibald Henderson',
    unlockAt: 10000,
    cpsBonus: 0.2,
    flavor: 'Commandant for 39 years — the "Grand Old Man" who set the standard the Corps still salutes.',
  },
  {
    id: 'mentor_opha_johnson',
    name: 'Pvt. Opha May Johnson',
    unlockAt: 100000,
    cpsBonus: 0.3,
    flavor: 'The first woman to wear the Eagle, Globe, and Anchor (1918). Opened the door the rest marched through.',
  },
  {
    id: 'mentor_dan_daly',
    name: 'Sgt. Maj. Dan Daly',
    unlockAt: 1000000,
    cpsBonus: 0.4,
    flavor: 'Two Medals of Honor, and the immortal rally at Belleau Wood: "Come on — do you want to live forever?"',
  },
  {
    id: 'mentor_smedley_butler',
    name: 'Maj. Gen. Smedley Butler',
    unlockAt: 10000000,
    cpsBonus: 0.55,
    flavor: 'Two Medals of Honor across two decades, then literally wrote the book on hard truths.',
  },
  {
    id: 'mentor_lejeune',
    name: 'Lt. Gen. John A. Lejeune',
    unlockAt: 500000000,
    cpsBonus: 0.75,
    flavor: 'The "Greatest of All Leathernecks" — the namesake every Marine knows and the standard every Marine chases.',
  },
  {
    id: 'mentor_basilone',
    name: 'GySgt. John Basilone',
    unlockAt: 10000000000,
    cpsBonus: 1.0,
    flavor: 'Held the line at Guadalcanal with a machine gun and sheer will; gave everything again at Iwo Jima.',
  },
  {
    id: 'mentor_chesty_puller',
    name: 'Lt. Gen. Lewis "Chesty" Puller',
    unlockAt: 1000000000000,
    cpsBonus: 1.3,
    flavor: 'Five Navy Crosses — the most decorated Marine in history. "Great. Now we can fire in any direction."',
  },
  {
    id: 'mentor_vandegrift',
    name: 'Gen. Alexander Vandegrift',
    unlockAt: 100000000000000,
    cpsBonus: 1.7,
    flavor: 'Earned the Medal of Honor holding Guadalcanal, then led the entire Corps as its 18th Commandant.',
  },
  {
    id: 'mentor_boyington',
    name: 'Col. Gregory "Pappy" Boyington',
    unlockAt: 1000000000000000,
    cpsBonus: 2.2,
    flavor: 'Ace of aces and skipper of the Black Sheep — 28 kills and a Medal of Honor.',
  },
  {
    id: 'mentor_woody_williams',
    name: 'CWO Hershel "Woody" Williams',
    unlockAt: 10000000000000000,
    cpsBonus: 3.0,
    flavor: 'Cleared seven pillboxes with a flamethrower at Iwo Jima; carried the WWII Medal of Honor for us all until 2022.',
  },
]
