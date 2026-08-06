# Why-free value-frame (key #4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture key #4 of the "why the course is free" trust-model (the free course as a peer network / commons of sovereign practitioners) as a tested JSON source-of-truth plus a sovereign prompt-emitter for the owner's own agent.

**Architecture:** `LMS/why-free-frame.json` holds the grounded value-frame beside `registry.json` / `diyu-thesis.json` (imported by no app module → zero build impact). `scripts/why-free-prompt.mjs` (sibling of `diyu-manifesto-prompt.mjs`) reads it plus `registry.json` and prints a prompt. A Vitest env=node drift-guard reuses `lib/authoring/dehustle.ts` `lintDehustle`.

**Tech Stack:** Node ESM (`.mjs` emitter), TypeScript + Vitest (env=node, `resolveJsonModule` on). Tests run from `LMS/tochka-sborki/web`; the emitter runs from the repo root.

## Global Constraints

- **Sovereign / prompt-emitter:** no live LLM call anywhere; the emitter prints a prompt for the owner's agent, it does not write the copy.
- **Plain-mode / clarity-first:** the seed statements stay grounded (peer network / commons / sovereign practice / collective benefit) — no spiritual/movement register, no glossy hype.
- **Authenticity / de-hustle:** every frame string + the origin note passes `lintDehustle` (returns `[]`).
- **Sole-prop, NEVER nonprofit:** no nonprofit / tax / donation framing.
- **Additive:** does not touch the shipped why-free FAQ answer, the S3/DIYU emitters, or `academy.positioning`.
- **Trunk-based** on `main`; TDD; commit per task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Test commands run from `LMS/tochka-sborki/web`; the emitter smoke runs from repo root `C:/telo/Efforts/Ongoing/mc_hub`.

---

## File Structure

- `LMS/why-free-frame.json` — the value-frame SoT (origin + 5 frame points + placements).
- `LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts` — drift-guard.
- `scripts/why-free-prompt.mjs` — the sovereign emitter.

---

## Task 1: Why-free value-frame SoT + drift-guard

**Files:**
- Create: `LMS/why-free-frame.json`
- Test (create): `LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts`

**Interfaces:**
- Consumes: `lintDehustle(text: string): string[]` from `lib/authoring/dehustle` (existing).
- Produces: `LMS/why-free-frame.json` with shape `{ origin: { source, note }, frame: { id, ru, en }[] (len 5), placements: string[] }`. Read by Task 2's emitter.

- [ ] **Step 1: Write the failing drift-guard test**

Create `LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import frame from '../../../../why-free-frame.json'
import { lintDehustle } from '../authoring/dehustle'

describe('why-free-frame.json', () => {
  it('has a non-empty origin', () => {
    expect(frame.origin.source.trim().length).toBeGreaterThan(0)
    expect(frame.origin.note.trim().length).toBeGreaterThan(0)
  })

  it('has exactly 5 bilingual, non-empty frame points', () => {
    expect(frame.frame).toHaveLength(5)
    for (const f of frame.frame) {
      expect(f.id.trim().length).toBeGreaterThan(0)
      expect(f.ru.trim().length).toBeGreaterThan(0)
      expect(f.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      frame.origin.note,
      ...frame.frame.flatMap((f) => [f.ru, f.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(frame.placements.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/academy/why-free-frame.test.ts`
Expected: FAIL — cannot resolve `../../../../why-free-frame.json` (file does not exist yet).

- [ ] **Step 3: Create the value-frame JSON**

Create `LMS/why-free-frame.json` with EXACTLY this content:

```json
{
  "origin": {
    "source": "Наташа (feedback)",
    "note": "Ключ №4 модели «почему курс бесплатный» (родитель fb_ed319653; ключ №1 — FAQ loss-leader — уже опубликован)."
  },
  "frame": [
    {
      "id": "commons",
      "ru": "Курс — открытый commons: знание передаётся, а не продаётся. Бери, форкай, передавай дальше — оно остаётся общим.",
      "en": "The course is an open commons: knowledge is passed on, not sold. Take it, fork it, pass it on — it stays shared."
    },
    {
      "id": "peer-network",
      "ru": "Выпускники образуют распределённую сеть практиков, а не список клиентов — их связывает общая практика, а не платформа.",
      "en": "Graduates form a distributed network of practitioners, not a customer list — held together by shared practice, not a platform."
    },
    {
      "id": "sovereign-practice",
      "ru": "Каждый держит свои инструменты, своего агента и свой метод. Сеть суверенна: она не зависит от единого центра или провайдера.",
      "en": "Each person keeps their own tools, their own agent, and their own method. The network is sovereign: it does not depend on a single center or provider."
    },
    {
      "id": "collective-benefit",
      "ru": "Работа сети складывается во благо общего — из множества малых суверенных практик, а не из движения, спущенного сверху.",
      "en": "The network's work adds up to a shared benefit — from many small sovereign practices, not from a movement handed down from above."
    },
    {
      "id": "free-is-the-point",
      "ru": "Бесплатно — это суть, а не приманка: низкий порог даёт сети расти. Коучинг и работа с командами — отдельный честный шаг, а не скрытый замок.",
      "en": "Free is the point, not the bait: a low barrier lets the network grow. Coaching and team work are a separate, honest step — not a hidden lock."
    }
  ],
  "placements": [
    "FAQ «почему бесплатно» expansion (short — beside the shipped answer)",
    "a landing value-section (medium)",
    "the why-free narrative (long — the owner's voice)"
  ]
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/academy/why-free-frame.test.ts`
Expected: PASS (all four cases — de-hustle clean confirms no banned term slipped in).

- [ ] **Step 5: Type gate**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors (the JSON import resolves; `.origin`, `.frame[].id/ru/en`, `.placements` are inferred).

- [ ] **Step 6: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add LMS/why-free-frame.json LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts
git commit -m "feat(academy): why-free value-frame SoT (key #4) + de-hustle drift-guard

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Sovereign why-free prompt-emitter

**Files:**
- Create: `scripts/why-free-prompt.mjs`

**Interfaces:**
- Consumes: `LMS/registry.json` (`academy.name`, `academy.fullName`, `courses`) and `LMS/why-free-frame.json` (`origin`, `frame`, `placements`) from Task 1.
- Produces: a stdout prompt. No exported API; no automated test (mirrors the existing `scripts/diyu-manifesto-prompt.mjs`), verified by a smoke run whose output goes in the report.

- [ ] **Step 1: Create the emitter**

Create `scripts/why-free-prompt.mjs` with EXACTLY this content:

```js
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
```

- [ ] **Step 2: Smoke-run the emitter**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub && node scripts/why-free-prompt.mjs`
Expected: prints a non-empty prompt that contains the academy name `S.A.S.H.A`, the origin source `Наташа`, all five frame id labels (`[commons]`, `[peer-network]`, `[sovereign-practice]`, `[collective-benefit]`, `[free-is-the-point]`), and the three placement lines. Paste the full output into the task report.

- [ ] **Step 3: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add scripts/why-free-prompt.mjs
git commit -m "feat(academy): sovereign why-free value-frame prompt-emitter

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- `LMS/why-free-frame.json` with exact content → Task 1. ✅
- Drift-guard (origin / bilingual / de-hustle via `lintDehustle` / placements) → Task 1. ✅
- `scripts/why-free-prompt.mjs` reading both JSONs, printing header/CONTEXT/FRAME/HARD CONSTRAINTS/PLACEMENT → Task 2. ✅
- Shipped FAQ + S3/DIYU emitters + hub positioning untouched (no task edits them). ✅
- No live LLM, no UI, no nonprofit framing, plain-mode register — nothing in either task introduces the excluded items. ✅

**2. Placeholder scan:** No TBD/TODO; JSON and emitter code are complete and verbatim. ✅

**3. Type consistency:** The test reads `frame.origin.source/note`, `frame.frame[].id/ru/en`, `frame.placements` — all present in the Task 1 JSON. The emitter reads the same fields (as `model.origin/frame/placements`) plus `registry.academy.name/fullName` and `registry.courses[].name.ru/en`/`.status` — all present in the committed `registry.json`. De-hustle: every frame/origin-note string was checked against the `BANNED` list (no `scarcity`/`guru`/`passive income`/RU markers; "приманка"/"замок"/"движение" are not banned). ✅
