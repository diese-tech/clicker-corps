#!/usr/bin/env node
// PreToolUse(Bash) guard: inspects the command string and asks for confirmation
// before running operations that can destroy or overwrite files / git state.
// Non-destructive commands pass through untouched (exit 0, no output) so the
// normal permission flow proceeds.
import { readFileSync } from 'node:fs'

let cmd = ''
try {
  cmd = (JSON.parse(readFileSync(0, 'utf8')).tool_input || {}).command || ''
} catch {
  process.exit(0) // can't parse input — don't interfere
}
if (!cmd.trim()) process.exit(0)

const rules = [
  [/\bgit\s+reset\s+[^|;&]*--hard/, 'git reset --hard (discards uncommitted working-tree changes)'],
  [/\bgit\s+clean\s+[^|;&]*-[a-zA-Z]*[fdx]/, 'git clean -f/-d/-x (deletes untracked files)'],
  [/\bgit\s+checkout\s+(--|\.(\s|$))/, 'git checkout -- / . (discards working-tree changes)'],
  [/\bgit\s+push\s+[^|;&]*(--force(-with-lease)?|\s-f\b)/, 'git push --force (rewrites remote history)'],
  [/\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*|--recursive|--force)/, 'rm -r/-f (deletes files)'],
  [/\b(mv|cp)\s+(-[a-zA-Z]*f[a-zA-Z]*|--force)\b/, 'mv/cp -f (overwrites destination without prompt)'],
  [/\bdd\s+[^|;&]*\bof=/, 'dd of= (overwrites a device/file)'],
  [/\bmkfs(\.\w+)?\b/, 'mkfs (formats a filesystem)'],
  [/\bshred\b/, 'shred (irrecoverably destroys files)'],
  [/\bfind\b[^|;&]*(-delete|-exec\s+rm)/, 'find -delete / -exec rm (bulk deletion)'],
]

const matches = []
for (const [re, label] of rules) if (re.test(cmd)) matches.push(label)

// git restore discards the working tree unless it's only touching the index.
if (/\bgit\s+restore\b/.test(cmd) && !/--staged/.test(cmd)) {
  matches.push('git restore (discards working-tree changes)')
}

// Overwriting (truncating) redirection: a single `>` to a real file. Ignore
// append (>>), stderr/combined (2>, &>, >&), and /dev/null.
const redir = cmd.replace(/>>/g, '').replace(/2>/g, '').replace(/&>/g, '').replace(/>&/g, '')
if (/(^|[^>&\d])>\s*(?!\/dev\/null\b)\S/.test(redir)) {
  matches.push('> redirection (overwrites/truncates a file)')
}

if (matches.length === 0) process.exit(0)

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        'Destructive command detected — confirm it only affects files you intend to change:\n- ' +
        matches.join('\n- '),
    },
  })
)
process.exit(0)
