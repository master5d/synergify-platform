#!/usr/bin/env node
// Sovereign DIYU-for-the-AI-age manifesto prompt-emitter for the S.A.S.H.A academy.
// Prints a prompt for the OWNER's agent (no live LLM anywhere): run it, paste the
// output into your agent, then place the manifesto/essay the agent drafts (in your
// voice) at one of the placements below.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'registry.json'), 'utf8'))
const diyu = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'diyu-thesis.json'), 'utf8'))

const { name, fullName } = registry.academy
const courses = registry.courses
  .map((c) => `- ${c.name.ru} / ${c.name.en} (${c.status})`)
  .join('\n')
const { attribution } = diyu
const thesis = diyu.thesis
  .map((t, i) => `${i + 1}. [${t.id}]\n   RU: ${t.ru}\n   EN: ${t.en}`)
  .join('\n')
const placements = diyu.placements.map((p) => `- ${p}`).join('\n')

console.log(`You are helping the owner draft the DIYU-for-the-AI-age manifesto for ${name} — ${fullName.en}.
Write in the OWNER'S voice — this prompt hands you the framing, not the finished words.

CONTEXT
Academy: ${name} (${fullName.ru})
Courses today:
${courses}
Framing adapted from ${attribution.source}, "${attribution.work}" — credit it, don't quote it.

THESIS (adapt into the manifesto; keep the ideas, use your own words)
${thesis}

HARD CONSTRAINTS
- Attribute ${attribution.source} explicitly (a line crediting the DIYU concept).
- No urgency or scarcity (no countdowns, no "limited", no "only today").
- No testimonials, credentials-flexing, guru language, or fabricated metrics.
- Modest, sovereign, honest tone; plain language.
- Sole proprietorship — never frame as a nonprofit or tax-deductible.
- Write both Russian and English.

PLACEMENT (choose where this lands)
${placements}`)
