#!/usr/bin/env node
// Sovereign "why the course is free" value-frame prompt-emitter (key #4) for the
// S.A.S.H.A academy. Prints a prompt for the OWNER's agent (no live LLM anywhere):
// run it, paste the output into your agent, then place the copy the agent drafts
// (in your voice, plain-mode) at one of the placements below.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'registry.json'), 'utf8'))
const model = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'why-free-frame.json'), 'utf8'))

const { name, fullName } = registry.academy
const courses = registry.courses
  .map((c) => `- ${c.name.ru} / ${c.name.en} (${c.status})`)
  .join('\n')
const { origin } = model
const frame = model.frame
  .map((f, i) => `${i + 1}. [${f.id}]\n   RU: ${f.ru}\n   EN: ${f.en}`)
  .join('\n')
const placements = model.placements.map((p) => `- ${p}`).join('\n')

console.log(`You are helping the owner write the "why the course is free" value-frame (key #4) for ${name} — ${fullName.en}.
Write in the OWNER'S voice, plain-mode — this prompt hands you the framing, not the finished words.

CONTEXT
Academy: ${name} (${fullName.ru})
Courses today:
${courses}
Key #4 of the why-free model, from ${origin.source}.

FRAME (adapt into the copy; keep the ideas, use your own words)
${frame}

HARD CONSTRAINTS
- Plain-mode, clarity-first: no glossy movement-hype, no spiritual grandiosity.
- No urgency or scarcity (no countdowns, no "limited", no "only today").
- No testimonials, credentials-flexing, guru language, or fabricated metrics.
- Modest, sovereign, honest tone; plain language.
- Sole proprietorship — never frame as a nonprofit or tax-deductible.
- Write both Russian and English.

PLACEMENT (choose where this lands)
${placements}`)
