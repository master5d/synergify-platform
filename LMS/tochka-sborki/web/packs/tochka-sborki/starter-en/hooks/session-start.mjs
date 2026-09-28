#!/usr/bin/env node
// Session-start hook: prints STATE.md and TODO.md, and the agent receives them as context.
// Claude Code and Codex add the text a SessionStart hook prints to stdout to the session
// context (see README.md, section "What your agent reads at start").
// The hook does NOT print AGENTS.md: the agent reads it on its own, and a second copy would only
// eat context (the Claude Code memory docs say exactly this).
//
// What it does: it only READS two files next to it and prints them. It writes nothing,
// doesn't touch the network, doesn't run other programs. Read this before approving the hook.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LIMIT = 4000 // characters per file: memory should be short, a long one eats context

function show(name) {
  const path = join(ROOT, name)
  if (!existsSync(path)) {
    console.log(`[${name}] file not found: create it (the template is in the course starter).`)
    return
  }
  let text = readFileSync(path, 'utf8').trim()
  if (text.length > LIMIT) {
    text = `${text.slice(0, LIMIT)}\n… [truncated: ${name} is longer than ${LIMIT} characters, time to shorten it]`
  }
  console.log(`===== ${name} =====\n${text}\n`)
}

try {
  console.log('Project memory (session-start hook):\n')
  show('STATE.md')
  show('TODO.md')
} catch (err) {
  // The hook must not break the agent's start, but it must not hide a failure either.
  console.log(`The memory hook could not read the files: ${err.message}. Read STATE.md and TODO.md yourself.`)
}
