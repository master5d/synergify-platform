# S.A.S.H.A Slice B — DIYU thesis + sovereign manifesto emitter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture the DIYU-for-the-AI-age framing (adapted from Anya Kamenetz, attributed) as a tested JSON source-of-truth, plus a sovereign prompt-emitter that hands it to the owner's own agent.

**Architecture:** `LMS/diyu-thesis.json` holds the framing (sits beside `registry.json`, imported by no app module → zero build impact). `scripts/diyu-manifesto-prompt.mjs` (sibling of `academy-manifesto-prompt.mjs`) reads it plus `registry.json` and prints a prompt. A Vitest env=node drift-guard reuses `lib/authoring/dehustle.ts` `lintDehustle`.

**Tech Stack:** Node ESM (`.mjs` emitter), TypeScript + Vitest (env=node, `resolveJsonModule` on). Tests run from `LMS/tochka-sborki/web`; the emitter runs from the repo root.

## Global Constraints

- **Sovereign / prompt-emitter:** no live LLM call anywhere; the emitter prints a prompt for the owner's agent, it does not generate the manifesto.
- **Attribution required:** framing adapted from **Anya Kamenetz**, *DIYU: The Do-It-Yourself University* — credited, not quoted.
- **Authenticity / de-hustle:** every thesis string must pass `lintDehustle` (returns `[]`). The lint bans "scarcity"/"scarce" — the thesis uses "rare / no longer rare" instead.
- **Sole-prop, NEVER nonprofit:** no nonprofit / tax-deductible / donation framing.
- **Do not touch S3:** `scripts/academy-manifesto-prompt.mjs` and hub `academy.positioning` stay as-is; Slice B is additive.
- **Trunk-based** on `main`; TDD; commit per task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Test commands run from `LMS/tochka-sborki/web`; the emitter smoke runs from repo root `C:/telo/Efforts/Ongoing/mc_hub`.

---

## File Structure

- `LMS/diyu-thesis.json` — the framing SoT (attribution + 5 thesis points + placements).
- `LMS/tochka-sborki/web/lib/academy/diyu-thesis.test.ts` — drift-guard (attribution, bilingual non-empty, de-hustle clean, placements present).
- `scripts/diyu-manifesto-prompt.mjs` — the sovereign emitter.

---

## Task 1: DIYU thesis SoT + drift-guard

**Files:**
- Create: `LMS/diyu-thesis.json`
- Test (create): `LMS/tochka-sborki/web/lib/academy/diyu-thesis.test.ts`

**Interfaces:**
- Consumes: `lintDehustle(text: string): string[]` from `lib/authoring/dehustle` (existing).
- Produces: `LMS/diyu-thesis.json` with shape `{ attribution: { source, work, note }, thesis: { id, ru, en }[] (len 5), placements: string[] }`. Read by Task 2's emitter.

- [ ] **Step 1: Write the failing drift-guard test**

Create `LMS/tochka-sborki/web/lib/academy/diyu-thesis.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import diyu from '../../../../diyu-thesis.json'
import { lintDehustle } from '../authoring/dehustle'

describe('diyu-thesis.json', () => {
  it('attributes Kamenetz and the DIYU work', () => {
    expect(diyu.attribution.source).toContain('Kamenetz')
    expect(diyu.attribution.work).toContain('DIYU')
  })

  it('has exactly 5 bilingual, non-empty thesis points', () => {
    expect(diyu.thesis).toHaveLength(5)
    for (const t of diyu.thesis) {
      expect(t.id.trim().length).toBeGreaterThan(0)
      expect(t.ru.trim().length).toBeGreaterThan(0)
      expect(t.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean in every string', () => {
    const strings = [
      diyu.attribution.note,
      ...diyu.thesis.flatMap((t) => [t.ru, t.en]),
    ]
    for (const s of strings) {
      expect(lintDehustle(s), s).toEqual([])
    }
  })

  it('lists at least one placement', () => {
    expect(diyu.placements.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/academy/diyu-thesis.test.ts`
Expected: FAIL — cannot resolve `../../../../diyu-thesis.json` (file does not exist yet).

- [ ] **Step 3: Create the thesis JSON**

Create `LMS/diyu-thesis.json` with EXACTLY this content:

```json
{
  "attribution": {
    "source": "Anya Kamenetz",
    "work": "DIYU: The Do-It-Yourself University",
    "note": "Концепт адаптирован и атрибутирован, не цитируется дословно."
  },
  "thesis": [
    {
      "id": "cathedral",
      "ru": "Классический университет — «собор рациональности», застывший с эпохи, когда книги были редки и дороги. Его форма отвечала на голод по знанию, которого больше нет.",
      "en": "The classic university is a 'cathedral of rationality', frozen from an era when books were rare and costly. Its shape answered a hunger for knowledge that no longer holds."
    },
    {
      "id": "info-abundant",
      "ru": "Знание перестало быть редким: MIT OpenCourseWare, Khan Academy, Wikipedia, YouTube — оно лежит открыто. Ценность больше не в доставке контента.",
      "en": "Knowledge is no longer rare: MIT OpenCourseWare, Khan Academy, Wikipedia, YouTube — it lies open. Value is no longer in delivering content."
    },
    {
      "id": "ai-manuscript",
      "ru": "AI — следующий сдвиг в этой истории, новая «манускриптная технология»: как печатный станок обрушил монополию на переписанное знание, так агенты меняют сам способ учиться и делать.",
      "en": "AI is the next shift in this story, the new 'manuscript technology': as the printing press broke the monopoly on copied knowledge, agents change how we learn and make."
    },
    {
      "id": "value-shift",
      "ru": "Ценность смещается на три опоры: учись тому, что нужно сейчас; соединяйся с правильным сообществом; доказывай навык делом, а не дипломом.",
      "en": "Value shifts onto three footings: learn what you need now; connect to the right community; demonstrate skill by doing, not by a diploma."
    },
    {
      "id": "sovereign-diy",
      "ru": "Точка Сборки и S.A.S.H.A — открытый, доступный, суверенный DIY-университет AI-эпохи: гильдия мастеров и учеников, независимая от церкви и государства. Открытый и в твоих руках.",
      "en": "Tochka Sborki and S.A.S.H.A are the open, affordable, sovereign DIY-university for the AI age: a guild of masters and scholars independent of church and state. Open and in your hands."
    }
  ],
  "placements": [
    "hub academy.positioning (short — the landing framing)",
    "a 'Горизонты' blog essay (long — the owner's manifesto in their voice)",
    "the S.A.S.H.A manifesto"
  ]
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/academy/diyu-thesis.test.ts`
Expected: PASS (all four cases — de-hustle clean confirms no banned term slipped in).

- [ ] **Step 5: Type gate**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors (the JSON import resolves and its inferred shape supports `.attribution`, `.thesis[].ru/en/id`, `.placements`).

- [ ] **Step 6: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add LMS/diyu-thesis.json LMS/tochka-sborki/web/lib/academy/diyu-thesis.test.ts
git commit -m "feat(academy): DIYU thesis SoT + de-hustle drift-guard (Kamenetz-attributed)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Sovereign manifesto prompt-emitter

**Files:**
- Create: `scripts/diyu-manifesto-prompt.mjs`

**Interfaces:**
- Consumes: `LMS/registry.json` (`academy.name`, `academy.fullName`, `courses`) and `LMS/diyu-thesis.json` (`attribution`, `thesis`, `placements`) from Task 1.
- Produces: a stdout prompt. No exported API; no automated test (mirrors the existing `scripts/academy-manifesto-prompt.mjs`), verified by a smoke run whose output goes in the report.

- [ ] **Step 1: Create the emitter**

Create `scripts/diyu-manifesto-prompt.mjs` with EXACTLY this content:

```js
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
```

- [ ] **Step 2: Smoke-run the emitter**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub && node scripts/diyu-manifesto-prompt.mjs`
Expected: prints a non-empty prompt that contains `Anya Kamenetz`, the academy name `S.A.S.H.A`, all five thesis id labels (`[cathedral]`, `[info-abundant]`, `[ai-manuscript]`, `[value-shift]`, `[sovereign-diy]`), and the three placement lines. Paste the full output into the task report.

- [ ] **Step 3: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add scripts/diyu-manifesto-prompt.mjs
git commit -m "feat(academy): sovereign DIYU manifesto prompt-emitter

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- `LMS/diyu-thesis.json` with exact content → Task 1. ✅
- Drift-guard (attribution / bilingual / de-hustle via `lintDehustle` / placements) → Task 1. ✅
- `scripts/diyu-manifesto-prompt.mjs` reading both JSONs, printing CONTEXT/THESIS/HARD CONSTRAINTS/PLACEMENT → Task 2. ✅
- S3 emitter + hub positioning untouched (no task edits them). ✅
- No live LLM, no blog post, no nonprofit framing — nothing in either task introduces them. ✅

**2. Placeholder scan:** No TBD/TODO; JSON and emitter code are complete and verbatim. ✅

**3. Type consistency:** The test reads `diyu.attribution.source/work/note`, `diyu.thesis[].id/ru/en`, `diyu.placements` — all present in the Task 1 JSON. The emitter reads the same fields plus `registry.academy.name/fullName` and `registry.courses[].name.ru/en`/`.status` — all present in the committed `registry.json`. De-hustle: every thesis/attribution-note string was checked against the `BANNED` list (no `scarcity`/`scarce`/`guru`/RU markers). ✅
