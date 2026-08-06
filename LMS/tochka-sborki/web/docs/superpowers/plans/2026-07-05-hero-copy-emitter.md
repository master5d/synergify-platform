# Sovereign Hero-Copy Emitter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a 4th sovereign prompt-emitter (fb_3c88df79) that prints a prompt the owner's agent runs to synthesize one hero-header from 3 frames + an objection layer.

**Architecture:** Exact mirror of the why-free emitter — a JSON-SoT (`LMS/hero-frame.json`) + a standalone Node emitter (`scripts/hero-copy-prompt.mjs`) + a vitest validity/de-hustle test (`lib/academy/hero-frame.test.ts`). No live LLM, no app import, zero build-impact.

**Tech Stack:** Node ESM (no deps), TypeScript/Vitest for the JSON validity test.

## Global Constraints

- Sovereign prompt-emitter: no live LLM, prompt is for the OWNER's agent; owner-voice not ghostwritten.
- Sibling pattern: JSON-SoT next to `LMS/registry.json`; NO app code imports it → zero build-impact.
- De-hustle: `lintDehustle` (from `../authoring/dehustle`) returns `[]` for every string in the JSON.
- Sole-prop, never nonprofit; no-Mermaid; plain-mode / clarity-first.
- Web gate (from `LMS/tochka-sborki/web`): `npx tsc --noEmit && npx vitest run && npx next build`.
- Trunk-based `main`, one commit per task.
- **Ops:** bash-git hangs this session — run all `git` via the PowerShell tool. The emitter is a standalone `.mjs`; run it with `node` via the Bash tool for smoke.

**Reference files to mirror (read them first):** `scripts/why-free-prompt.mjs`, `LMS/why-free-frame.json`, `LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts`.

---

### Task 1: JSON-SoT `LMS/hero-frame.json` + validity/de-hustle test

**Files:**
- Create: `LMS/hero-frame.json` (repo root `LMS/`, sibling to `why-free-frame.json`)
- Test: `LMS/tochka-sborki/web/lib/academy/hero-frame.test.ts`

**Interfaces:**
- Consumes: `lintDehustle` from `../authoring/dehustle` (test only).
- Produces (Task 2 reads this JSON): shape `{ origin:{source,note}, frames:[{id,label:{ru,en},ru,en}×3], objections:[{id,objection:{ru,en},reframe:{ru,en}}×3], placements:string[] }`.

- [ ] **Step 1: Write the failing test**

Create `LMS/tochka-sborki/web/lib/academy/hero-frame.test.ts` (the `../../../../` climbs from `lib/academy/` to the repo root where `hero-frame.json` sits — same depth as `why-free-frame.test.ts`):

```ts
import { describe, it, expect } from 'vitest'
import hero from '../../../../hero-frame.json'
import { lintDehustle } from '../authoring/dehustle'

describe('hero-frame.json', () => {
  it('has a non-empty origin', () => {
    expect(hero.origin.source.trim().length).toBeGreaterThan(0)
    expect(hero.origin.note.trim().length).toBeGreaterThan(0)
  })

  it('has exactly 3 bilingual frames with labels', () => {
    expect(hero.frames).toHaveLength(3)
    for (const f of hero.frames) {
      expect(f.id.trim().length).toBeGreaterThan(0)
      expect(f.label.ru.trim().length).toBeGreaterThan(0)
      expect(f.label.en.trim().length).toBeGreaterThan(0)
      expect(f.ru.trim().length).toBeGreaterThan(0)
      expect(f.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('has at least 3 objection→reframe pairs, bilingual', () => {
    expect(hero.objections.length).toBeGreaterThanOrEqual(3)
    for (const o of hero.objections) {
      expect(o.id.trim().length).toBeGreaterThan(0)
      expect(o.objection.ru.trim().length).toBeGreaterThan(0)
      expect(o.objection.en.trim().length).toBeGreaterThan(0)
      expect(o.reframe.ru.trim().length).toBeGreaterThan(0)
      expect(o.reframe.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      hero.origin.note,
      ...hero.frames.flatMap((f) => [f.label.ru, f.label.en, f.ru, f.en]),
      ...hero.objections.flatMap((o) => [o.objection.ru, o.objection.en, o.reframe.ru, o.reframe.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(hero.placements.length).toBeGreaterThan(0)
  })

  it('frame ids are the 3 canonical ones', () => {
    expect(hero.frames.map((f) => f.id)).toEqual(['chat-vs-system', 'dream-together', 'what-changes'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/academy/hero-frame.test.ts`
Expected: FAIL — cannot resolve `../../../../hero-frame.json` (file does not exist).

- [ ] **Step 3: Create `LMS/hero-frame.json`**

```json
{
  "origin": {
    "source": "Owner hero-header synthesis (fb_3c88df79)",
    "note": "Три рамки главного экрана + слой возражений; грани зашиплены по fb_85c12d9a / fb_b1bf63a0+fb_2fbf86ac / fb_39f6ccee+fb_8423715c / fb_a6c79aa2. Здесь — выбор и синтез одного заголовка."
  },
  "frames": [
    {
      "id": "chat-vs-system",
      "label": { "ru": "Чат против системы", "en": "Chat vs a system" },
      "ru": "Что ты получаешь сверх своего чата: не разговор, а собранную под тебя систему — она держит контекст твоего дела и работает, а не отвечает на реплику.",
      "en": "What you get beyond your chat: not a conversation but a system assembled for you — it holds the context of your work and runs, instead of just replying to a prompt."
    },
    {
      "id": "dream-together",
      "label": { "ru": "О чём можно помечтать", "en": "What you can dream about" },
      "ru": "Приглашение увидеть, что станет для тебя возможным — витрина реального, а не обещание. Смотри и выбирай, что соберёшь первым.",
      "en": "An invitation to see what becomes possible for you — a gallery of the real, not a promise. Look, and choose what you will build first."
    },
    {
      "id": "what-changes",
      "label": { "ru": "Что изменится", "en": "What changes" },
      "ru": "Честный исход в терминах «ты сможешь делать X сам» — то, что останется с тобой после курса, а не цифры и не громкие обещания.",
      "en": "An honest outcome in terms of \"you'll be able to do X yourself\" — what stays with you after the course, not numbers and not loud promises."
    }
  ],
  "objections": [
    {
      "id": "freelancer",
      "objection": { "ru": "Проще заказать у фрилансера.", "en": "Easier to just hire a freelancer." },
      "reframe": { "ru": "Фрилансер делает это один раз; ты учишься собирать сам — и дальше делаешь без него.", "en": "A freelancer does it once; you learn to assemble it yourself — and go on without them." }
    },
    {
      "id": "chat-remembers",
      "objection": { "ru": "Мой чат и так всё помнит.", "en": "My chat already remembers everything." },
      "reframe": { "ru": "Память — не система: важен контекст, который ведёт дело, а не тред, который теряется.", "en": "Memory is not a system: what matters is context that carries the work, not a thread that gets lost." }
    },
    {
      "id": "automation-fear",
      "objection": { "ru": "Боюсь автоматизировать общение с людьми.", "en": "I'm afraid to automate talking to people." },
      "reframe": { "ru": "ИИ снимает рутину, а живой контакт и суждение остаются за тобой — ты решаешь, что доверить, а что оставить себе.", "en": "AI takes the routine off your plate, while live contact and judgment stay with you — you decide what to delegate and what to keep." }
    }
  ],
  "placements": [
    "hero-header (короткий — главный экран)",
    "подзаголовок-раскрытие (medium — под заголовком)",
    "FAQ «чем это лучше моего чата» (короткий — рядом с рамкой)"
  ]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/academy/hero-frame.test.ts`
Expected: PASS — all 6 tests green. If the de-hustle test flags an objection/reframe string, reword the offending string (do NOT weaken the lint) and re-run.

- [ ] **Step 5: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add LMS/hero-frame.json LMS/tochka-sborki/web/lib/academy/hero-frame.test.ts
git commit -m "feat: hero-frame.json SoT + validity/de-hustle test (fb_3c88df79)"
```

---

### Task 2: Emitter `scripts/hero-copy-prompt.mjs`

**Files:**
- Create: `scripts/hero-copy-prompt.mjs` (repo root `scripts/`, sibling to `why-free-prompt.mjs`)

**Interfaces:**
- Consumes: `LMS/registry.json` (`academy.name`, `academy.fullName.{ru,en}`, `courses[]`), `LMS/hero-frame.json` (Task 1 shape).
- Produces: prints the prompt to stdout; no exports.

- [ ] **Step 1: Create the emitter (mirror `scripts/why-free-prompt.mjs`)**

```js
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
const { origin } = model
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
```

- [ ] **Step 2: Smoke-run the emitter**

Run: `cd "C:/telo/Efforts/Ongoing/mc_hub" && node scripts/hero-copy-prompt.mjs`
Expected: prints the full prompt with academy name, the 3 courses, all 3 frames (labels + ru/en), the 3 objection→reframe pairs, HARD CONSTRAINTS, the TASK line, and 3 placements. No error, exit 0.

- [ ] **Step 3: Web gate (confirms Task 1 test still green + nothing broke)**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`
Expected: tsc clean; whole suite green (incl. `hero-frame.test.ts`); build succeeds. (The emitter `.mjs` is standalone — not typechecked/bundled; the JSON is not imported by the app.)

- [ ] **Step 4: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add scripts/hero-copy-prompt.mjs
git commit -m "feat: sovereign hero-copy prompt-emitter (fb_3c88df79)"
```

---

## Self-Review

**1. Spec coverage:** JSON-SoT with origin/3 frames+label/3 objections/placements → Task 1 Step 3 ✅ · validity+de-hustle+canonical-ids test → Task 1 Step 1 ✅ · emitter mirroring why-free (registry+hero JSON, frames+objections+HARD CONSTRAINTS+TASK+placements) → Task 2 Step 1 ✅ · smoke run → Task 2 Step 2 ✅ · web gate → Task 2 Step 3 ✅ · zero build-impact (no app import; JSON at repo root, emitter standalone) ✅ · owner-voice not ghostwritten (prompt hands frames, TASK says "in your own words") ✅.

**2. Placeholder scan:** none — full JSON and full emitter source inline.

**3. Type consistency:** JSON shape in Task 1 (`frames[].label.{ru,en}`, `objections[].objection/reframe.{ru,en}`) is exactly what Task 2's emitter reads (`f.label.ru`, `o.objection.ru`, `o.reframe.ru`). Canonical frame ids `['chat-vs-system','dream-together','what-changes']` match between the test and the JSON. `registry.academy.{name,fullName}` + `registry.courses[].name.{ru,en}` reads are copied verbatim from the working why-free emitter.
