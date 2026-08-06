#!/usr/bin/env node
// Sovereign hero-header synthesis prompt-emitter (fb_3c88df79) for the S.A.S.H.A academy.
// Prints a prompt for the OWNER's agent (no live LLM anywhere): run it, paste the output into
// your agent, then place the hero copy the agent drafts (in your voice, plain-mode) at one of
// the placements below. Mirror of scripts/why-free-prompt.mjs.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'registry.json'), 'utf8'))
const model = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'hero-frame.json'), 'utf8'))

const { name, fullName } = registry.academy
const courses = registry.courses
  .map((c) => `- ${c.name.ru} / ${c.name.en} (${c.status})`)
  .join('\n')
const frames = model.frames
  .map((f, i) => `${i + 1}. [${f.id}] ${f.label.ru} / ${f.label.en}\n   RU: ${f.ru}\n   EN: ${f.en}`)
  .join('\n')
const objections = model.objections
  .map((o) => `- [${o.id}] «${o.objection.ru}» / "${o.objection.en}"\n  → RU: ${o.reframe.ru}\n  → EN: ${o.reframe.en}`)
  .join('\n')
const placements = model.placements.map((p) => `- ${p}`).join('\n')

console.log(`You are helping the owner synthesize the landing hero-header for ${name} — ${fullName.en}.
Write in the OWNER'S voice, plain-mode — this prompt hands you the frames, not the finished words.

CONTEXT
Academy: ${name} (${fullName.ru})
Courses today:
${courses}

FRAMES (choose ONE, or blend them into a single hero-header — keep the ideas, use your own words)
${frames}

OBJECTIONS TO PRE-EMPT (weave a quiet answer into the hero or its subhead — do not list them)
${objections}

HARD CONSTRAINTS
- Plain-mode, clarity-first: no glossy movement-hype, no spiritual grandiosity.
- No urgency or scarcity (no countdowns, no "limited", no "only today").
- No testimonials, credentials-flexing, guru language, or fabricated metrics.
- Modest, sovereign, honest tone; plain language.
- Sole proprietorship — never frame as a nonprofit or tax-deductible.
- Write both Russian and English.

TASK
Draft ONE hero-header (a short headline + an optional one-line subhead) that either picks the
strongest frame or fuses them, and quietly disarms the objections above.

PLACEMENT (choose where this lands)
${placements}`)
