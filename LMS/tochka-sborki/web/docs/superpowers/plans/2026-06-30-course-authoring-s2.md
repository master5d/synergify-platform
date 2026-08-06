# Course-Authoring S2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Emit a per-lesson research PROMPT the author runs in their own agent (no live LLM call), and parse the returned notes into a typed `ResearchNotes` structure for the S3 draft stage.

**Architecture:** One pure module `lib/authoring/research.ts` (`buildResearchPrompt` + `parseResearchNotes`, mirroring `learn-prompt.ts`'s prompt-paste pattern) reusing S1's `lintDehustle`, plus a thin `scripts/research-prompt.ts` CLI. No LLM client, no network, no key.

**Tech Stack:** TypeScript, Vitest (env=node), Node/`npx tsx` for the CLI. No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths relative to it; run commands from there. Correct dir spelling is **tochka-sborki** (NO second 's').
- `lms_target: engine`. This is **S2 of a 5-slice epic** (`fb_8e8eaf0acfdb`); it does NOT presume the multi-course registry / S.A.S.H.A. Do NOT mark the epic ticket done.
- **No live LLM call / no LLM SDK / no network / no key** — prompt-emitter only (sovereign / prompt-paste ethos). No new dependencies.
- `Locale = 'ru' | 'en'` imported from `@/lib/dictionaries` (NOT `@/lib/course`). Reuse S1's `lintDehustle` from `./dehustle` and `SAMPLE_OUTLINE` from `./sample-outline` (its module slug is `01-sample`, units `u1-intro`/`u2-practice`).
- Authenticity: the research prompt and the parsed notes are both de-hustle clean (gated via `lintDehustle`); pedagogy-first (bisociative mental hook, 4-Phase Kolb, short sentences).
- Additive only: new files only; `lib/authoring/research.ts` is not imported by the Next.js app.
- Test command: full suite `npm test`; single file `npx vitest run <path>`. Build: `npm run build`. Typecheck gate (final): `npx tsc --noEmit` (required — vitest/esbuild and next build do not typecheck these non-app files).
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/authoring/research.ts` — types + `buildResearchPrompt`

**Files:**
- Create: `lib/authoring/research.ts`
- Test: `lib/authoring/research.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/lib/dictionaries`; `lintDehustle` from `./dehustle` (test only).
- Produces: `ResearchNotes`, `ResearchInput`, `buildResearchPrompt(i: ResearchInput): string`.

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/research.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildResearchPrompt } from './research'
import { lintDehustle } from './dehustle'

const base = {
  courseName: 'Точка Сборки', moduleTitle: 'Знакомство',
  unitTitle: 'Пять клонов', objective: 'Понять устройство пяти AI-двойников',
}

describe('buildResearchPrompt', () => {
  it('embeds course/module/unit/objective and all five labels (ru)', () => {
    const p = buildResearchPrompt({ ...base, locale: 'ru' })
    for (const s of ['Точка Сборки', 'Знакомство', 'Пять клонов', 'Понять устройство пяти AI-двойников',
      'CONCEPTS:', 'HOOK:', 'MISCONCEPTION:', 'PRACTICE:', 'SOURCES:']) {
      expect(p).toContain(s)
    }
  })
  it('differs by locale and both are de-hustle clean', () => {
    const ru = buildResearchPrompt({ ...base, locale: 'ru' })
    const en = buildResearchPrompt({ ...base, locale: 'en' })
    expect(ru).not.toBe(en)
    expect(lintDehustle(ru)).toEqual([])
    expect(lintDehustle(en)).toEqual([])
  })
  it('names the mental/no-write constraint for the activation hook', () => {
    expect(buildResearchPrompt({ ...base, locale: 'en' })).toMatch(/write|type/i)
    expect(buildResearchPrompt({ ...base, locale: 'ru' })).toMatch(/писать|печат/i)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/research.test.ts`
Expected: FAIL — cannot resolve `./research`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/research.ts`:

```ts
// lib/authoring/research.ts
// S2 of the course-authoring engine: emit a per-lesson research PROMPT the author runs
// in their own agent (mirrors learn-prompt.ts / sovereign BYO ethos — no live LLM call),
// and (Task 2) parse the returned notes for the S3 draft stage. Pure, no I/O.
import type { Locale } from '@/lib/dictionaries'

export interface ResearchNotes {
  concepts: string[]     // key concepts to teach (CONCEPT phase)
  hook: string           // bisociative/analogy seed for ACTIVATION (mental, not "write")
  misconception: string  // a common wrong mental model to pre-empt
  practice: string       // a concrete applied-step seed for PRACTICE
  sources: string[]      // 2–3 credible things to verify against
}

export interface ResearchInput {
  courseName: string
  moduleTitle: string
  unitTitle: string
  objective: string
  locale: Locale
}

/** A de-hustled, bilingual, pedagogy-encoded research prompt for the author's own agent. */
export function buildResearchPrompt(i: ResearchInput): string {
  if (i.locale === 'en') {
    return [
      `You are helping me research one lesson of my course "${i.courseName}" — honest, calm, no selling.`,
      `Module: "${i.moduleTitle}". Lesson: "${i.unitTitle}". Objective: ${i.objective}`,
      ``,
      `Research the lesson toward that objective. I teach in a four-phase rhythm (activation → reflection → concept → practice); the activation hook is a BISOCIATIVE, purely mental image — never ask the learner to write or type.`,
      ``,
      `Reply in EXACTLY this labeled format, nothing else:`,
      `CONCEPTS:`,
      `- <key concept, short sentence>`,
      `- <key concept, short sentence>`,
      `HOOK: <one mental bisociative image that opens the lesson — no "write"/"type">`,
      `MISCONCEPTION: <one common wrong mental model to pre-empt>`,
      `PRACTICE: <one concrete applied step the learner does for real>`,
      `SOURCES:`,
      `- <credible source to verify against>`,
      `- <credible source to verify against>`,
    ].join('\n')
  }
  return [
    `Помоги мне исследовать один урок моего курса «${i.courseName}» — честно, спокойно, без продаж.`,
    `Модуль: «${i.moduleTitle}». Урок: «${i.unitTitle}». Цель: ${i.objective}`,
    ``,
    `Исследуй урок под эту цель. Я преподаю в четырёхфазном ритме (активация → рефлексия → концепт → практика); хук активации — БИСОЦИАТИВНЫЙ, чисто мысленный образ — никогда не проси ученика писать или печатать.`,
    ``,
    `Ответь СТРОГО в этом размеченном формате, без лишнего:`,
    `CONCEPTS:`,
    `- <ключевой концепт, короткое предложение>`,
    `- <ключевой концепт, короткое предложение>`,
    `HOOK: <один мысленный бисоциативный образ, открывающий урок — без «напиши»/«печатай»>`,
    `MISCONCEPTION: <одна частая ошибочная ментальная модель, которую надо предупредить>`,
    `PRACTICE: <один конкретный прикладной шаг, который ученик делает по-настоящему>`,
    `SOURCES:`,
    `- <надёжный источник для проверки>`,
    `- <надёжный источник для проверки>`,
  ].join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/research.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/research.ts LMS/tochka-sborki/web/lib/authoring/research.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S2 research prompt-emitter (buildResearchPrompt) (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `parseResearchNotes` — label parser + de-hustle-folded errors

**Files:**
- Modify: `lib/authoring/research.ts` (add the import + the `parseResearchNotes` function)
- Test: `lib/authoring/research.test.ts` (append a `describe`)

**Interfaces:**
- Consumes: `ResearchNotes` (Task 1); `lintDehustle` from `./dehustle`.
- Produces: `parseResearchNotes(text: string): { notes: ResearchNotes; errors: string[] }`.

- [ ] **Step 1: Write the failing test**

Append to `lib/authoring/research.test.ts` (add `parseResearchNotes` to the top import from `./research`, so the import line reads `import { buildResearchPrompt, parseResearchNotes } from './research'`):

```ts
const good = `CONCEPTS:
- First concept
- Second concept
HOOK: A hall of mirrors
MISCONCEPTION: That the AI decides for you
PRACTICE: Draft one prompt and run it
SOURCES:
- Some doc
- Another doc`

describe('parseResearchNotes', () => {
  it('parses a well-formed reply into structured notes', () => {
    const { notes, errors } = parseResearchNotes(good)
    expect(errors).toEqual([])
    expect(notes.concepts).toEqual(['First concept', 'Second concept'])
    expect(notes.hook).toBe('A hall of mirrors')
    expect(notes.misconception).toBe('That the AI decides for you')
    expect(notes.practice).toBe('Draft one prompt and run it')
    expect(notes.sources).toEqual(['Some doc', 'Another doc'])
  })
  it('flags a missing HOOK section', () => {
    const { errors } = parseResearchNotes(good.replace(/HOOK:.*\n/, ''))
    expect(errors.some(e => /HOOK/.test(e))).toBe(true)
  })
  it('folds de-hustle hits into errors', () => {
    const dirty = good.replace('- First concept', '- A funnel for passive income')
    const { errors } = parseResearchNotes(dirty)
    expect(errors.some(e => /passive income/.test(e))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/research.test.ts`
Expected: FAIL — `parseResearchNotes` is not exported.

- [ ] **Step 3: Implement**

3a. Add the import near the top of `lib/authoring/research.ts` (right after the existing `import type { Locale }` line):

```ts
import { lintDehustle } from './dehustle'
```

3b. Append the parser to the end of `lib/authoring/research.ts`:

```ts
/** Pure parser: a labeled agent reply -> ResearchNotes + a list of problems
 *  (missing/empty required sections, and any de-hustle hits in the parsed content). */
export function parseResearchNotes(text: string): { notes: ResearchNotes; errors: string[] } {
  const notes: ResearchNotes = { concepts: [], hook: '', misconception: '', practice: '', sources: [] }
  const errors: string[] = []

  let section: 'concepts' | 'sources' | null = null
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (/^CONCEPTS:/i.test(line)) { section = 'concepts'; continue }
    if (/^SOURCES:/i.test(line)) { section = 'sources'; continue }
    const hook = /^HOOK:\s*(.*)$/i.exec(line)
    if (hook) { notes.hook = hook[1].trim(); section = null; continue }
    const mis = /^MISCONCEPTION:\s*(.*)$/i.exec(line)
    if (mis) { notes.misconception = mis[1].trim(); section = null; continue }
    const prac = /^PRACTICE:\s*(.*)$/i.exec(line)
    if (prac) { notes.practice = prac[1].trim(); section = null; continue }
    if (section && /^-\s+/.test(line)) {
      const item = line.replace(/^-\s+/, '').trim()
      if (item) notes[section].push(item)
    }
  }

  if (notes.concepts.length === 0) errors.push('CONCEPTS: at least one concept required')
  if (!notes.hook) errors.push('HOOK: missing or empty')
  if (!notes.misconception) errors.push('MISCONCEPTION: missing or empty')
  if (!notes.practice) errors.push('PRACTICE: missing or empty')
  if (notes.sources.length === 0) errors.push('SOURCES: at least one source required')

  const all = [...notes.concepts, notes.hook, notes.misconception, notes.practice, ...notes.sources].join(' ')
  for (const term of lintDehustle(all)) errors.push(`de-hustle: banned term "${term}"`)

  return { notes, errors }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/research.test.ts`
Expected: PASS (6 tests — 3 builder + 3 parser).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/research.ts LMS/tochka-sborki/web/lib/authoring/research.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S2 parseResearchNotes (label parser + de-hustle gate) (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `scripts/research-prompt.ts` CLI + final gates

**Files:**
- Create: `scripts/research-prompt.ts`

**Interfaces:**
- Consumes: `buildResearchPrompt` (Task 1); `SAMPLE_OUTLINE` from `../lib/authoring/sample-outline`.
- Produces: a runnable CLI that prints a unit's research prompt.

- [ ] **Step 1: Write the CLI**

Create `scripts/research-prompt.ts`:

```ts
// scripts/research-prompt.ts
// Print a per-lesson research prompt for the author to paste into their own agent.
// Run from web/:  npx --yes tsx scripts/research-prompt.ts <module-slug> <unit-slug> [ru|en]
import { buildResearchPrompt } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [moduleSlug, unitSlug, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!moduleSlug || !unitSlug) {
  console.error('usage: research-prompt.ts <module-slug> <unit-slug> [ru|en]')
  process.exit(1)
}

const mod = SAMPLE_OUTLINE.modules.find(m => m.slug === moduleSlug)
if (!mod) {
  console.error(`module "${moduleSlug}" not found. available: ${SAMPLE_OUTLINE.modules.map(m => m.slug).join(', ')}`)
  process.exit(1)
}
const unit = mod.units.find(u => u.slug === unitSlug)
if (!unit) {
  console.error(`unit "${unitSlug}" not found in ${moduleSlug}. available: ${mod.units.map(u => u.slug).join(', ')}`)
  process.exit(1)
}

console.log(buildResearchPrompt({
  courseName: SAMPLE_OUTLINE.name[locale],
  moduleTitle: mod.title[locale],
  unitTitle: unit.title[locale],
  objective: unit.objective[locale],
  locale,
}))
```

- [ ] **Step 2: Run the CLI (happy path)**

Run: `npx --yes tsx scripts/research-prompt.ts 01-sample u1-intro`
Expected: prints a Russian research prompt containing `CONCEPTS:` … `SOURCES:` and the unit's title/objective. (First run may fetch `tsx`.)

- [ ] **Step 3: Run the CLI (unknown slug → non-zero exit)**

Run: `npx --yes tsx scripts/research-prompt.ts 99-nope u1-intro; echo "exit=$?"`
Expected: prints `module "99-nope" not found. available: 01-sample` and `exit=1`.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the new `research` tests and all prior tests (no regression).

- [ ] **Step 5: Typecheck gate**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new module/CLI are not imported by the app).

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/research-prompt.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S2 research-prompt CLI (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `research.ts` `ResearchNotes`/`ResearchInput` + `buildResearchPrompt` (bilingual, de-hustled, labeled format, mental-hook constraint) → Task 1. ✅
- `parseResearchNotes` (label parser, required-section errors, de-hustle-folded errors reusing S1) → Task 2. ✅
- `scripts/research-prompt.ts` CLI (resolve from `SAMPLE_OUTLINE`, print prompt, error on unknown slug) → Task 3. ✅
- No live LLM / no dep / prompt-paste ethos → encoded (builder emits a prompt; CLI prints it). ✅
- Tests: builder embeds/labels/bilingual/de-hustle-clean/mental-hook (Task 1); parser well-formed/missing-section/hustle-term (Task 2); CLI happy + unknown-slug + full suite + tsc + build (Task 3). ✅

**Placeholder scan:** The `<key concept>` / `<надёжный источник>` angle-bracket tokens are intentional *prompt-format placeholders* shown to the agent, not plan gaps. Every code step has full code. ✅

**Type consistency:** `ResearchNotes`/`ResearchInput` defined in Task 1, used by Task 2's parser and Task 3's CLI. `buildResearchPrompt(i: ResearchInput): string` and `parseResearchNotes(text): { notes; errors }` signatures match across tasks. `Locale` from `@/lib/dictionaries`. `notes[section]` where `section: 'concepts' | 'sources'` — both are `string[]`, so `.push` type-checks. `SAMPLE_OUTLINE` module slug `01-sample` matches the CLI examples. ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-course-authoring-s2.md`.**
