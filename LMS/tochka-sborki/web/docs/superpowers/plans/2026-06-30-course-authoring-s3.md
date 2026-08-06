# Course-Authoring S3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deterministically weave a unit's `ResearchNotes` (S2) into a valid 4-Phase MDX lesson draft, with a reusable validator, plus a CLI.

**Architecture:** One pure module `lib/authoring/draft.ts` (`draftLesson` assembler + `validateDraftMdx` + `SAMPLE_NOTES`) reusing S1's MDX shape + `lintDehustle`, plus a thin `scripts/draft-lesson.ts` CLI that reads notes via S2's `parseResearchNotes`. No LLM, no network, no dep.

**Tech Stack:** TypeScript, Vitest (env=node), Node/`npx tsx` for the CLI. No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths relative to it; run commands from there. Correct dir spelling is **tochka-sborki** (NO second 's'); confirm staged paths before every commit.
- `lms_target: engine`. This is **S3 of a 5-slice epic** (`fb_8e8eaf0acfdb`); does NOT presume the multi-course registry / S.A.S.H.A. Do NOT mark the epic ticket done.
- Deterministic, pure, **no live LLM / no network / no key / no new dependency**.
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries`. Reuse `ResearchNotes`/`parseResearchNotes` from `./research` (S2), `lintDehustle` from `./dehustle` (S1), `SAMPLE_OUTLINE` from `./sample-outline` (module slug `01-sample`, units `u1-intro`/`u2-practice`).
- MDX contract: frontmatter `{ title, unit, module, duration }`; four `<Phase type="…">` in order `activation → reflection → concept → practice`; activation/reflection carry NO write/type imperatives; de-hustle clean.
- Additive only: new files only; `lib/authoring/draft.ts` is not imported by the Next.js app.
- Test command: full suite `npm test`; single file `npx vitest run <path>`. Build: `npm run build`. Typecheck gate (final): `npx tsc --noEmit` (required — vitest/esbuild and next build do not typecheck these non-app files).
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/authoring/draft.ts` — `draftLesson` assembler + `SAMPLE_NOTES`

**Files:**
- Create: `lib/authoring/draft.ts`
- Test: `lib/authoring/draft.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/lib/dictionaries`; `ResearchNotes` from `./research`; `lintDehustle` from `./dehustle` (test uses it).
- Produces: `DraftInput`, `draftLesson(i: DraftInput): string`, `SAMPLE_NOTES: ResearchNotes`. (`validateDraftMdx` is added in Task 2.)

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/draft.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { draftLesson, SAMPLE_NOTES, type DraftInput } from './draft'
import { lintDehustle } from './dehustle'

const base: Omit<DraftInput, 'locale'> = {
  unitTitle: 'Getting started', unitIndex: 0, moduleIndex: 0,
  objective: 'Understand why this module exists', notes: SAMPLE_NOTES,
}
const block = (mdx: string, type: string) =>
  new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`).exec(mdx)?.[1] ?? ''

describe('draftLesson', () => {
  it('emits frontmatter + the four Phase tags in order', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(mdx).toMatch(/^---\ntitle: "Getting started"/)
    const phases = [...mdx.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
    expect(phases).toEqual(['activation', 'reflection', 'concept', 'practice'])
  })
  it('weaves each note field into its phase', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(block(mdx, 'activation')).toContain(SAMPLE_NOTES.hook)
    expect(block(mdx, 'reflection')).toContain(SAMPLE_NOTES.misconception)
    expect(block(mdx, 'concept')).toContain(SAMPLE_NOTES.concepts[0])
    expect(block(mdx, 'practice')).toContain(SAMPLE_NOTES.practice)
  })
  it('keeps activation/reflection free of write/type imperatives and is de-hustle clean', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(block(mdx, 'activation')).not.toMatch(/\b(type|write)\b/i)
    expect(block(mdx, 'reflection')).not.toMatch(/\b(type|write)\b/i)
    expect(lintDehustle(mdx)).toEqual([])
  })
  it('uses localized wrappers (ru)', () => {
    const mdx = draftLesson({ ...base, locale: 'ru' })
    expect(mdx).toContain('Представь:')
    expect(mdx).toContain('Мысленно')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/draft.test.ts`
Expected: FAIL — cannot resolve `./draft`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/draft.ts`:

```ts
// lib/authoring/draft.ts
// S3 of the course-authoring engine: deterministically weave a unit's ResearchNotes (S2)
// into a valid 4-Phase MDX lesson draft (S4 polishes the prose later). Pure, no LLM/I/O.
import type { Locale } from '@/lib/dictionaries'
import type { ResearchNotes } from './research'

export interface DraftInput {
  unitTitle: string
  unitIndex: number   // 0-based
  moduleIndex: number // 0-based
  objective: string
  notes: ResearchNotes
  locale: Locale
}

// A clean, de-hustle-safe English fixture aligned to 01-sample/u1-intro. No write/type verbs.
export const SAMPLE_NOTES: ResearchNotes = {
  concepts: [
    'A course module is a small arc: one idea, built up and then applied',
    'You learn by doing a real step, not by collecting theory',
  ],
  hook: 'a hall of mirrors where each reflection already knows one slice of your work',
  misconception: 'that you must understand everything before you can start',
  practice: 'name one real task you want this module to help you finish',
  sources: ['the course README', 'your own weekly workflow'],
}

export function draftLesson(i: DraftInput): string {
  const { notes } = i
  const concepts = notes.concepts.map(c => `- ${c}`).join('\n')
  const frontmatter = [
    `---`,
    `title: "${i.unitTitle}"`,
    `unit: ${i.unitIndex + 1}`,
    `module: ${i.moduleIndex + 1}`,
    `duration: "TODO"`,
    `---`,
    ``,
    `{/* objective: ${i.objective} */}`,
    ``,
  ].join('\n')
  const sources = `\n{/* sources: ${notes.sources.join('; ')} */}\n`

  if (i.locale === 'en') {
    return frontmatter + [
      `<Phase type="activation">`,
      ``,
      `Picture this: ${notes.hook}.`,
      ``,
      `Run it in your head — where have you met this before?`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="reflection">`,
      ``,
      `Many assume: ${notes.misconception}.`,
      ``,
      `Check it in your head: is that true for you?`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="concept">`,
      ``,
      concepts,
      ``,
      `> ⚠️ Common misconception: ${notes.misconception}`,
      ``,
      `</Phase>`,
      ``,
      `<Phase type="practice">`,
      ``,
      `Do this: ${notes.practice}`,
      ``,
      `</Phase>`,
    ].join('\n') + sources
  }

  return frontmatter + [
    `<Phase type="activation">`,
    ``,
    `Представь: ${notes.hook}.`,
    ``,
    `Прокрути это в голове — где это уже встречалось тебе?`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="reflection">`,
    ``,
    `Многие думают: ${notes.misconception}.`,
    ``,
    `Мысленно проверь: так ли это в твоём случае?`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="concept">`,
    ``,
    concepts,
    ``,
    `> ⚠️ Частое заблуждение: ${notes.misconception}`,
    ``,
    `</Phase>`,
    ``,
    `<Phase type="practice">`,
    ``,
    `Сделай: ${notes.practice}`,
    ``,
    `</Phase>`,
  ].join('\n') + sources
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/draft.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/draft.ts LMS/tochka-sborki/web/lib/authoring/draft.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S3 draftLesson MDX assembler + SAMPLE_NOTES (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `validateDraftMdx` — reusable MDX conformance validator

**Files:**
- Modify: `lib/authoring/draft.ts` (add the import + the `validateDraftMdx` function)
- Test: `lib/authoring/draft.test.ts` (append a `describe`)

**Interfaces:**
- Consumes: `lintDehustle` from `./dehustle`; `draftLesson`/`SAMPLE_NOTES` (test).
- Produces: `validateDraftMdx(mdx: string): string[]`.

- [ ] **Step 1: Write the failing test**

Append to `lib/authoring/draft.test.ts` (add `validateDraftMdx` to the top import from `./draft`, so it reads `import { draftLesson, validateDraftMdx, SAMPLE_NOTES, type DraftInput } from './draft'`):

```ts
describe('validateDraftMdx', () => {
  const valid = draftLesson({ ...base, locale: 'en' })
  it('accepts a well-formed draft', () => {
    expect(validateDraftMdx(valid)).toEqual([])
  })
  it('flags a missing/reordered phase', () => {
    const noReflection = valid.replace(/<Phase type="reflection">[\s\S]*?<\/Phase>\n\n/, '')
    expect(validateDraftMdx(noReflection).some(e => /phase/i.test(e))).toBe(true)
  })
  it('flags a write/type imperative in activation', () => {
    const dirty = valid.replace('Run it in your head', 'Write it down and run it')
    expect(validateDraftMdx(dirty).some(e => /activation/.test(e))).toBe(true)
  })
  it('flags a de-hustle term', () => {
    const dirty = valid.replace('Do this:', 'Do this for passive income:')
    expect(validateDraftMdx(dirty).some(e => /passive income/.test(e))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/draft.test.ts`
Expected: FAIL — `validateDraftMdx` is not exported.

- [ ] **Step 3: Implement**

3a. Add the import right after the existing `import type { ResearchNotes } from './research'` line in `lib/authoring/draft.ts`:

```ts
import { lintDehustle } from './dehustle'
```

3b. Append the validator to the end of `lib/authoring/draft.ts`:

```ts
/** Reusable MDX conformance check (also validates S4's polished output later).
 *  [] = conforms. */
export function validateDraftMdx(mdx: string): string[] {
  const errors: string[] = []
  if (!/^---\ntitle: "/.test(mdx)) errors.push('frontmatter: missing title')

  const phases = [...mdx.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
  const expected = ['activation', 'reflection', 'concept', 'practice']
  if (phases.join(',') !== expected.join(',')) {
    errors.push(`phases must be ${expected.join(' -> ')} (got ${phases.join(' -> ') || 'none'})`)
  }

  const block = (type: string) =>
    new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`).exec(mdx)?.[1] ?? ''
  for (const type of ['activation', 'reflection']) {
    if (/\b(напиши|запиши|type|write)\b/i.test(block(type))) {
      errors.push(`${type}: contains a write/type imperative (must be mental)`)
    }
  }

  for (const term of lintDehustle(mdx)) errors.push(`de-hustle: banned term "${term}"`)
  return errors
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/draft.test.ts`
Expected: PASS (8 tests — 4 assembler + 4 validator).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/draft.ts LMS/tochka-sborki/web/lib/authoring/draft.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S3 validateDraftMdx conformance validator (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `scripts/draft-lesson.ts` CLI + final gates

**Files:**
- Create: `scripts/draft-lesson.ts`

**Interfaces:**
- Consumes: `draftLesson`/`validateDraftMdx`/`SAMPLE_NOTES` from `../lib/authoring/draft`; `parseResearchNotes` from `../lib/authoring/research`; `SAMPLE_OUTLINE` from `../lib/authoring/sample-outline`.
- Produces: a runnable CLI that prints a unit's MDX draft.

- [ ] **Step 1: Write the CLI**

Create `scripts/draft-lesson.ts`:

```ts
// scripts/draft-lesson.ts
// Print a deterministic MDX lesson draft for a unit, woven from research notes.
// Run from web/:  npx --yes tsx scripts/draft-lesson.ts <module-slug> <unit-slug> [ru|en] [notes-file]
// notes-file: a saved agent reply in the S2 labeled format; omit to use the bundled SAMPLE_NOTES.
import { readFileSync } from 'node:fs'
import { draftLesson, validateDraftMdx, SAMPLE_NOTES } from '../lib/authoring/draft'
import { parseResearchNotes } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [moduleSlug, unitSlug, localeArg, notesFile] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!moduleSlug || !unitSlug) {
  console.error('usage: draft-lesson.ts <module-slug> <unit-slug> [ru|en] [notes-file]')
  process.exit(1)
}

const moduleIndex = SAMPLE_OUTLINE.modules.findIndex(m => m.slug === moduleSlug)
if (moduleIndex < 0) {
  console.error(`module "${moduleSlug}" not found. available: ${SAMPLE_OUTLINE.modules.map(m => m.slug).join(', ')}`)
  process.exit(1)
}
const mod = SAMPLE_OUTLINE.modules[moduleIndex]
const unitIndex = mod.units.findIndex(u => u.slug === unitSlug)
if (unitIndex < 0) {
  console.error(`unit "${unitSlug}" not found in ${moduleSlug}. available: ${mod.units.map(u => u.slug).join(', ')}`)
  process.exit(1)
}
const unit = mod.units[unitIndex]

let notes = SAMPLE_NOTES
if (notesFile) {
  const parsed = parseResearchNotes(readFileSync(notesFile, 'utf8'))
  if (parsed.errors.length) {
    console.error('notes parse errors:\n' + parsed.errors.join('\n'))
    process.exit(1)
  }
  notes = parsed.notes
}

const mdx = draftLesson({
  unitTitle: unit.title[locale], unitIndex, moduleIndex,
  objective: unit.objective[locale], notes, locale,
})

for (const issue of validateDraftMdx(mdx)) console.error(`# ${issue}`)
console.log(mdx)
```

- [ ] **Step 2: Run the CLI (happy path, bundled notes)**

Run: `npx --yes tsx scripts/draft-lesson.ts 01-sample u1-intro en`
Expected: prints MDX starting with `---` / `title: "Getting started"`, containing the four `<Phase>` tags and the `SAMPLE_NOTES` hook/practice; no `# ` issue lines on stderr.

- [ ] **Step 3: Run the CLI (unknown slug → non-zero exit)**

Run: `npx --yes tsx scripts/draft-lesson.ts 99-nope u1-intro; echo "exit=$?"`
Expected: prints `module "99-nope" not found. available: 01-sample` and `exit=1`.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the new `draft` tests and all prior tests (no regression).

- [ ] **Step 5: Typecheck gate**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new module/CLI are not imported by the app).

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/draft-lesson.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S3 draft-lesson CLI (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `draft.ts` `DraftInput` + `draftLesson` (bilingual weaving: hook→activation, misconception→reflection, concepts→concept, practice→practice; frontmatter; sources comment) + `SAMPLE_NOTES` → Task 1. ✅
- `validateDraftMdx` (frontmatter / phase-order / no-write / de-hustle, reusable) → Task 2. ✅
- `scripts/draft-lesson.ts` CLI (resolve from `SAMPLE_OUTLINE`, notes-file via `parseResearchNotes` or `SAMPLE_NOTES`, print draft + stderr issues, non-zero on unknown slug) → Task 3. ✅
- No live LLM / no dep / deterministic → assembler is pure string building. ✅
- Tests: assembler frontmatter/phases/weaving/no-write/de-hustle/ru-wrappers (Task 1); validator valid/missing-phase/write-verb/de-hustle (Task 2); CLI happy + unknown-slug + full suite + tsc + build (Task 3). ✅

**Placeholder scan:** `duration: "TODO"` and the `{hook}`-style descriptions are intentional MDX *output*/format content, not plan gaps. Every code step has full code. ✅

**Type consistency:** `DraftInput`/`draftLesson`/`SAMPLE_NOTES` defined in Task 1, used by Task 2's tests and Task 3's CLI. `validateDraftMdx(mdx): string[]` defined Task 2, used Task 3. `ResearchNotes` imported from `./research` (S2); `parseResearchNotes` returns `{ notes; errors }` (S2) — CLI reads `parsed.errors`/`parsed.notes` correctly. `SAMPLE_OUTLINE` module slug `01-sample` matches CLI examples. `Locale` from `@/lib/dictionaries`. Frontmatter regex `/^---\ntitle: "/` matches `draftLesson`'s output (starts with `---\ntitle: "`). ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-course-authoring-s3.md`.**
