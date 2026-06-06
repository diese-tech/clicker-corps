// Verifies the Commendation curve after lowering FIRST_COMMENDATION_AT to 1e14.
// Run: npx esbuild scripts/verify-prestige.ts --bundle --platform=node --format=esm --outfile=/tmp/vpr.mjs && node /tmp/vpr.mjs
import {
  FIRST_COMMENDATION_AT,
  prestigePotential,
  lifetimeForCommendations,
} from '../src/data/prestige'

let failures = 0
function assert(name: string, cond: boolean, detail = '') {
  if (cond) console.log(`  ✓ ${name}`)
  else { failures++; console.log(`  ✗ ${name}  ${detail}`) }
}

console.log('First Commendation lands at 100 trillion (1e14):')
assert('FIRST_COMMENDATION_AT === 1e14', FIRST_COMMENDATION_AT === 1e14, `got ${FIRST_COMMENDATION_AT}`)
assert('just under 1e14 ⇒ 0', prestigePotential(9.9e13) === 0, `got ${prestigePotential(9.9e13)}`)
assert('exactly 1e14 ⇒ 1', prestigePotential(1e14) === 1, `got ${prestigePotential(1e14)}`)
assert('1e15 ⇒ 2 (×10 per step)', prestigePotential(1e15) === 2, `got ${prestigePotential(1e15)}`)
assert('1e16 ⇒ 3', prestigePotential(1e16) === 3, `got ${prestigePotential(1e16)}`)
assert('lifetimeForCommendations(1) === 1e14', lifetimeForCommendations(1) === 1e14, `got ${lifetimeForCommendations(1)}`)
assert('lifetimeForCommendations(2) === 1e15', lifetimeForCommendations(2) === 1e15, `got ${lifetimeForCommendations(2)}`)
assert('curve still ×10 per commendation',
  lifetimeForCommendations(4) / lifetimeForCommendations(3) === 10)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
