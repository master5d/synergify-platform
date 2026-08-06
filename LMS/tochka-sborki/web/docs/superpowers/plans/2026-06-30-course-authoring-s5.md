# Course-Authoring S5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compose S1–S4 into one pure `runAuthoringPass` that reports per-unit status, a dry-run dashboard CLI, and the SOP runbook — closing the course-authoring epic.

**Architecture:** One pure module `lib/authoring/orchestrate.ts` (`runAuthoringPass`) reusing `validateOutline` (S1) + `draftLesson`/`validateDraftMdx` (S3) + `lintReadability` (S4); a thin `scripts/author-course.ts` report CLI; and `LMS/_template/AUTHORING.md`. No LLM, no writes, no dep.

**Tech Stack:** TypeScript, Vitest (env=node), Node/`npx tsx` for the CLI, Markdown. No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/` (+ the `_template/AUTHORING.md` doc). Paths relative to the web dir unless noted; run commands from there. Correct dir spelling **tochka-sborki** (NO second 's'); confirm staged paths before every commit.
- `lms_target: engine`. **Final slice S5 of 5** (`fb_8e8eaf0acfdb`) — this closes the epic. It does NOT presume the multi-course registry / S.A.S.H.A.
- Pure orchestration + report-only (**writes nothing to disk** — no-clobber ethos); prompt/LLM stages stay in the author's own agent. No new dependency.
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries`. Reuse: `CourseOutline`/`validateOutline` from `./outline` (S1); `ResearchNotes`/`parseResearchNotes` from `./research` (S2); `draftLesson`/`validateDraftMdx`/`SAMPLE_NOTES` from `./draft` (S3); `lintReadability` from `./review` (S4); `SAMPLE_OUTLINE` from `./sample-outline` (module `01-sample`, units `u1-intro`/`u2-practice`).
- Notes keyed by `` `${moduleSlug}/${unitSlug}` `` (unit slugs unique only within a module). CLI notes files: `<notes-dir>/<moduleSlug>__<unitSlug>.txt`.
- Additive only: new files only; `lib/authoring/orchestrate.ts` is not imported by the Next.js app.
- Test command: full suite `npm test`; single file `npx vitest run <path>`. Build: `npm run build`. Typecheck gate (final): `npx tsc --noEmit` (required).
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/authoring/orchestrate.ts` — `runAuthoringPass`

**Files:**
- Create: `lib/authoring/orchestrate.ts`
- Test: `lib/authoring/orchestrate.test.ts`

**Interfaces:**
- Consumes: `validateOutline` (`./outline`), `draftLesson`/`validateDraftMdx` (`./draft`), `lintReadability` (`./review`), `CourseOutline` (`./outline`), `ResearchNotes` (`./research`), `Locale` (`@/lib/dictionaries`). Tests use `SAMPLE_OUTLINE` (`./sample-outline`), `SAMPLE_NOTES` (`./draft`).
- Produces: `UnitStatus`, `UnitResult`, `AuthoringReport`, `runAuthoringPass(outline, notesByUnit, locale): AuthoringReport`.

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/orchestrate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { runAuthoringPass } from './orchestrate'
import { SAMPLE_OUTLINE } from './sample-outline'
import { SAMPLE_NOTES } from './draft'
import type { ResearchNotes } from './research'

describe('runAuthoringPass', () => {
  it('marks every unit needs-research when no notes are supplied', () => {
    const r = runAuthoringPass(SAMPLE_OUTLINE, {}, 'en')
    expect(r.outlineErrors).toEqual([])
    expect(r.units.length).toBeGreaterThan(0)
    expect(r.units.every(u => u.status === 'needs-research')).toBe(true)
    expect(r.units.every(u => u.mdx === undefined)).toBe(true)
  })

  it('surfaces outline errors', () => {
    const bad = structuredClone(SAMPLE_OUTLINE)
    bad.modules[0].title = { ru: 'Пример модуля', en: '' }
    expect(runAuthoringPass(bad, {}, 'en').outlineErrors.length).toBeGreaterThan(0)
  })

  it('drafts a unit with clean notes as ready (mdx, no findings)', () => {
    const r = runAuthoringPass(SAMPLE_OUTLINE, { '01-sample/u1-intro': SAMPLE_NOTES }, 'en')
    const u1 = r.units.find(u => u.unitSlug === 'u1-intro')!
    expect(u1.status).toBe('ready')
    expect(u1.mdx).toBeDefined()
    expect(u1.findings).toBeUndefined()
    expect(r.units.find(u => u.unitSlug === 'u2-practice')!.status).toBe('needs-research')
  })

  it('flags a unit as needs-polish when its notes trip a check', () => {
    const longHook: ResearchNotes = {
      ...SAMPLE_NOTES,
      hook: 'a very long opening image that keeps going and going with far too many words so that the activation sentence clearly exceeds the twenty five word readability maximum and must be flagged',
    }
    const r = runAuthoringPass(SAMPLE_OUTLINE, { '01-sample/u1-intro': longHook }, 'en')
    const u1 = r.units.find(u => u.unitSlug === 'u1-intro')!
    expect(u1.status).toBe('needs-polish')
    expect(u1.findings?.some(f => /long sentence/.test(f))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/orchestrate.test.ts`
Expected: FAIL — cannot resolve `./orchestrate`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/orchestrate.ts`:

```ts
// lib/authoring/orchestrate.ts
// S5 of the course-authoring engine: compose S1-S4 into one pure authoring pass that reports
// per-unit status (needs-research / ready / needs-polish). Report-only, no I/O, no writes.
import type { CourseOutline } from './outline'
import type { ResearchNotes } from './research'
import type { Locale } from '@/lib/dictionaries'
import { validateOutline } from './outline'
import { draftLesson, validateDraftMdx } from './draft'
import { lintReadability } from './review'

export type UnitStatus = 'needs-research' | 'ready' | 'needs-polish'

export interface UnitResult {
  moduleSlug: string
  unitSlug: string
  status: UnitStatus
  mdx?: string          // present when a draft was produced (ready | needs-polish)
  findings?: string[]   // present + non-empty for needs-polish
}

export interface AuthoringReport {
  outlineErrors: string[]
  units: UnitResult[]
}

/** Pure: compose S1 (validateOutline) + S3 (draftLesson/validateDraftMdx) + S4 (lintReadability)
 *  into a per-unit report. notesByUnit is keyed `${moduleSlug}/${unitSlug}`. No writes. */
export function runAuthoringPass(
  outline: CourseOutline,
  notesByUnit: Record<string, ResearchNotes>,
  locale: Locale,
): AuthoringReport {
  const outlineErrors = validateOutline(outline)
  const units: UnitResult[] = []
  outline.modules.forEach((m, mi) => {
    m.units.forEach((u, ui) => {
      const notes = notesByUnit[`${m.slug}/${u.slug}`]
      if (!notes) {
        units.push({ moduleSlug: m.slug, unitSlug: u.slug, status: 'needs-research' })
        return
      }
      const mdx = draftLesson({
        unitTitle: u.title[locale], unitIndex: ui, moduleIndex: mi,
        objective: u.objective[locale], notes, locale,
      })
      const findings = [...validateDraftMdx(mdx), ...lintReadability(mdx)]
      units.push({
        moduleSlug: m.slug, unitSlug: u.slug,
        status: findings.length ? 'needs-polish' : 'ready',
        mdx,
        ...(findings.length ? { findings } : {}),
      })
    })
  })
  return { outlineErrors, units }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/orchestrate.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/orchestrate.ts LMS/tochka-sborki/web/lib/authoring/orchestrate.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S5 runAuthoringPass orchestrator (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `scripts/author-course.ts` — dry-run dashboard CLI

**Files:**
- Create: `scripts/author-course.ts`

**Interfaces:**
- Consumes: `runAuthoringPass` (`../lib/authoring/orchestrate`), `parseResearchNotes`/`ResearchNotes` (`../lib/authoring/research`), `SAMPLE_OUTLINE` (`../lib/authoring/sample-outline`).
- Produces: a runnable report CLI.

- [ ] **Step 1: Write the CLI**

Create `scripts/author-course.ts`:

```ts
// scripts/author-course.ts
// Dry-run authoring dashboard: for each unit of SAMPLE_OUTLINE, report needs-research / ready /
// needs-polish + the next step. Reads research notes from <notes-dir>/<module>__<unit>.txt.
// Writes nothing. Run from web/:  npx --yes tsx scripts/author-course.ts [notes-dir] [ru|en]
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runAuthoringPass } from '../lib/authoring/orchestrate'
import { parseResearchNotes } from '../lib/authoring/research'
import type { ResearchNotes } from '../lib/authoring/research'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const [notesDir, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

const notesByUnit: Record<string, ResearchNotes> = {}
if (notesDir) {
  for (const m of SAMPLE_OUTLINE.modules) {
    for (const u of m.units) {
      const file = join(notesDir, `${m.slug}__${u.slug}.txt`)
      if (!existsSync(file)) continue
      const parsed = parseResearchNotes(readFileSync(file, 'utf8'))
      if (parsed.errors.length) {
        console.error(`# ${m.slug}/${u.slug}: notes parse errors: ${parsed.errors.join('; ')}`)
        continue
      }
      notesByUnit[`${m.slug}/${u.slug}`] = parsed.notes
    }
  }
}

const report = runAuthoringPass(SAMPLE_OUTLINE, notesByUnit, locale)

if (report.outlineErrors.length) {
  for (const e of report.outlineErrors) console.log(`# outline: ${e}`)
} else {
  console.log('outline: OK')
}

const tally: Record<string, number> = { ready: 0, 'needs-research': 0, 'needs-polish': 0 }
for (const u of report.units) {
  tally[u.status]++
  let hint = ''
  if (u.status === 'needs-research') hint = `  → research-prompt ${u.moduleSlug} ${u.unitSlug}`
  else if (u.status === 'needs-polish') hint = `  → review-lesson <draft>  [${(u.findings ?? []).join('; ')}]`
  console.log(`[${u.status}] ${u.moduleSlug}/${u.unitSlug}${hint}`)
}
console.log(`summary: ${tally.ready} ready, ${tally['needs-research']} needs-research, ${tally['needs-polish']} needs-polish`)
```

- [ ] **Step 2: Run the CLI (no notes → all needs-research)**

Run: `npx --yes tsx scripts/author-course.ts`
Expected: prints `outline: OK`, then a `[needs-research] 01-sample/u1-intro  → research-prompt 01-sample u1-intro` line (and one for `u2-practice`), then `summary: 0 ready, 2 needs-research, 0 needs-polish`. (First run may fetch `tsx`.) Writes nothing.

- [ ] **Step 3: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/author-course.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S5 author-course dry-run dashboard CLI (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `LMS/_template/AUTHORING.md` SOP runbook + final gates

**Files:**
- Create: `LMS/_template/AUTHORING.md`

**Interfaces:**
- Consumes: nothing (documentation). References the four CLIs.
- Produces: the SOP runbook (epic capstone doc).

- [ ] **Step 1: Write the runbook**

Create `LMS/_template/AUTHORING.md`:

```markdown
# Authoring a new course (AI-assisted, de-hustled)

The `web/lib/authoring/` toolchain turns a typed outline into de-hustled, 4-Phase MDX lessons.
Deterministic where it can be; you + your own agent supply the prose. No lesson content is
auto-written — you place the final MDX, so nothing is ever clobbered. Run the CLIs from `web/`.

## Pipeline

1. **Outline.** Write your course as a `CourseOutline` (see `lib/authoring/sample-outline.ts`):
   modules (`NN-slug`) x units (`uN-slug`), each with a bilingual `title` + `objective`.
   `validateOutline` enforces the shape; `lintOutlineDehustle` strips profit/scarcity/avatar framing.

2. **Status dashboard.**
   `npx tsx scripts/author-course.ts [notes-dir] [ru|en]`
   Reports each unit as `needs-research`, `ready`, or `needs-polish`, plus the next step.

3. **Research (per `needs-research` unit).**
   `npx tsx scripts/research-prompt.ts <module> <unit> [ru|en]`
   Paste the printed prompt into your agent (Claude Code / ChatGPT). Save its reply to
   `<notes-dir>/<module>__<unit>.txt` (the labeled `CONCEPTS:/HOOK:/MISCONCEPTION:/PRACTICE:/SOURCES:` format).

4. **Re-run the dashboard** with `<notes-dir>` — noted units now draft to `ready` or `needs-polish`.

5. **Draft + review (per `needs-polish`, or to inspect any draft).**
   `npx tsx scripts/draft-lesson.ts <module> <unit> [ru|en] <notes-file> > draft.mdx`
   `npx tsx scripts/review-lesson.ts draft.mdx [ru|en]`
   Paste the printed polish prompt into your agent; it returns tightened MDX.

6. **Place it.** Put the final `<unit>.mdx` in `content/<locale>/<module>/`. Re-run
   `review-lesson` on it to confirm `validateDraftMdx` + `lintReadability` are clean.

## Gates (always on)

- **de-hustle** — no profit-first / scarcity / sales / avatar framing (`lintDehustle`).
- **no-write reflection** — activation & reflection stay mental (`validateDraftMdx`).
- **4-Phase structure** — activation -> reflection -> concept -> practice, in order.
- **readability** — sentences under 25 words, concrete practice step (`lintReadability`).

Sovereign: the AI stages run in *your* agent; no key or model is vendored here.
```

- [ ] **Step 2: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the new `orchestrate` tests and all prior tests (no regression).

- [ ] **Step 3: Typecheck gate**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new module/CLI are not imported by the app).

- [ ] **Step 5: Commit**

```bash
git add "LMS/_template/AUTHORING.md"
git -c commit.gpgsign=false commit -m "docs(authoring): S5 AUTHORING.md SOP runbook — closes epic (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `orchestrate.ts` `UnitStatus`/`UnitResult`/`AuthoringReport` + `runAuthoringPass` (compose S1+S3+S4; per-unit needs-research/ready/needs-polish; keyed `${m}/${u}`) → Task 1. ✅
- `author-course.ts` dry-run dashboard (notes-dir via `parseResearchNotes`, status lines + hints + tally, writes nothing) → Task 2. ✅
- `LMS/_template/AUTHORING.md` SOP runbook → Task 3. ✅
- Report-only / no writes / no LLM / reuse all prior modules → orchestrator is pure; CLI only prints. ✅
- Tests: needs-research (no notes) / invalid outline / ready (clean notes) / needs-polish (long hook) → Task 1; CLI manual run → Task 2; full suite + tsc + build → Task 3. ✅

**Placeholder scan:** The `<module>`/`<notes-dir>` tokens are CLI-usage placeholders in the runbook/comments, not plan gaps. Every code step has full code. ✅

**Type consistency:** `runAuthoringPass(outline, notesByUnit, locale): AuthoringReport` (Task 1) matches the CLI call site (Task 2). `UnitResult.status`/`findings`/`mdx` used consistently in the CLI's hint logic. `notesByUnit` key `${m.slug}/${u.slug}` matches between orchestrator and CLI; CLI notes file `${m.slug}__${u.slug}.txt`. `SAMPLE_NOTES` reused from `./draft`; `parseResearchNotes` returns `{ notes; errors }` (S2) — CLI reads both. `u.title[locale]`/`u.objective[locale]` are `Bi` indexed by `Locale`. `structuredClone` available (Node 25). ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-course-authoring-s5.md`.**
