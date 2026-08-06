# Course-authoring engine — S5: authoring-pass orchestrator + SOP (fb_8e8eaf0acfdb)

**Ticket:** `fb_8e8eaf0acfdb`, **final slice S5 of 5** — the internal skill/SOP orchestrator that chains S1–S4 into one authoring pass. S1 spine (outline/lint/scaffold), S2 research prompt-emitter+parser, S3 deterministic MDX draft+validator, S4 readability lint+polish prompt. S5 composes them and closes the epic.

## Decisions (design gate)

1. **Report-only / dry-run** (not write-to-disk). `runAuthoringPass` returns a per-unit report; the CLI prints it and points to the per-unit tools. Writes nothing — honors the no-clobber lesson (S1's CLI clobbered the hand-authored `01-example`) and the sovereign ethos. The author places final MDX themselves.
2. **Include the SOP runbook** (`LMS/_template/AUTHORING.md`) — the "internal skill/SOP" the ticket names; the capstone that makes the pipeline usable end-to-end.

## Context (grep-before-build)

- S1 `outline.ts`: `CourseOutline`/`ModuleOutline`/`UnitOutline`, `validateOutline`. S2 `research.ts`: `ResearchNotes`, `parseResearchNotes`, `buildResearchPrompt`. S3 `draft.ts`: `draftLesson`, `validateDraftMdx`, `SAMPLE_NOTES`. S4 `review.ts`: `lintReadability`, `buildPolishPrompt`. `sample-outline.ts`: `SAMPLE_OUTLINE` (module `01-sample`, units `u1-intro`/`u2-practice`). `Locale` from `@/lib/dictionaries`.
- Unit slugs are unique **within** a module (S1 validator), not globally → key notes by `${moduleSlug}/${unitSlug}`.
- Existing CLIs: `research-prompt.ts` (S2), `draft-lesson.ts` (S3), `review-lesson.ts` (S4).

## Architecture

### 1. `lib/authoring/orchestrate.ts` — pure orchestration

```ts
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
  outlineErrors: string[]        // validateOutline(outline)
  units: UnitResult[]            // in outline order
}

export function runAuthoringPass(
  outline: CourseOutline,
  notesByUnit: Record<string, ResearchNotes>,  // key = `${moduleSlug}/${unitSlug}`
  locale: Locale,
): AuthoringReport
```

Logic (pure, deterministic):
- `outlineErrors = validateOutline(outline)`.
- For each module (index `mi`) × unit (index `ui`), key = `${m.slug}/${u.slug}`:
  - `notesByUnit[key]` absent → `{ moduleSlug, unitSlug, status: 'needs-research' }`.
  - present → `mdx = draftLesson({ unitTitle: u.title[locale], unitIndex: ui, moduleIndex: mi, objective: u.objective[locale], notes, locale })`; `findings = [...validateDraftMdx(mdx), ...lintReadability(mdx)]`; status = `findings.length ? 'needs-polish' : 'ready'`; attach `mdx`, and `findings` when non-empty.
- `units` in outline order. Composes S1 (`validateOutline`) + S3 (`draftLesson`/`validateDraftMdx`) + S4 (`lintReadability`).

### 2. `scripts/author-course.ts` — dry-run report CLI

`npx --yes tsx scripts/author-course.ts [notes-dir] [ru|en]`:
- `outline = SAMPLE_OUTLINE`; `locale` from arg (default `ru`).
- Builds `notesByUnit`: for each module × unit, if `<notes-dir>/<moduleSlug>__<unitSlug>.txt` exists, read + `parseResearchNotes`; on parse errors, print `# <key>: <error>` and skip that unit's notes (so it stays `needs-research`). No `notes-dir` arg → `notesByUnit = {}` (all `needs-research`; demo).
- Runs `runAuthoringPass`; prints:
  - `outline: OK` or the `outlineErrors` as `# ` lines.
  - one line per unit: `[<status>] <moduleSlug>/<unitSlug>` + a next-step hint (`→ research-prompt <m> <u>` for needs-research; `→ review-lesson <draft>` + the findings for needs-polish; nothing extra for ready).
  - a summary tally: `N ready, M needs-research, K needs-polish`.
- Writes nothing. Exits 0 (it is a report, not a gate).

### 3. `LMS/_template/AUTHORING.md` — the SOP runbook

A short markdown runbook documenting the pipeline order and which CLI to run when: (1) write the outline (`lib/authoring/sample-outline.ts` shape) — `validateOutline` gates it; (2) `author-course` → per-unit status dashboard; (3) per `needs-research` unit: `research-prompt <m> <u>` → paste into your agent → save the reply to `<notes-dir>/<m>__<u>.txt`; (4) re-run `author-course <notes-dir>` → units now draft (`ready`/`needs-polish`); (5) per `needs-polish` unit: `draft-lesson <m> <u> <ru|en> <notes>` > `draft.mdx`, then `review-lesson draft.mdx` → paste the polish prompt into your agent → **you** place the final MDX in the content tree (no auto-clobber); (6) de-hustle + `validateDraftMdx` + `lintReadability` gate throughout. Names the sovereign/no-clobber principles.

### 4. Tests (`lib/authoring/orchestrate.test.ts`)

- `runAuthoringPass(SAMPLE_OUTLINE, {}, 'en')`: every unit `needs-research`, no mdx; `outlineErrors` `[]`.
- Invalid outline (a `SAMPLE_OUTLINE` clone with an emptied `en` field) → `outlineErrors` non-empty.
- A unit keyed `01-sample/u1-intro` with `SAMPLE_NOTES` → that unit `ready`, `mdx` present, no `findings`; the un-noted unit stays `needs-research`.
- A unit whose notes trip a check — `SAMPLE_NOTES` clone with a `hook` of 30+ words → that unit `needs-polish` with a `findings` entry (long sentence).
- Full Vitest suite + `npx tsc --noEmit` + `npm run build` green.

## Authenticity / values

Pure/deterministic orchestration, no LLM/dep, report-only (no writes → no clobber, sovereign). Reuses every prior slice's de-hustle + no-write + readability gates, so the pass carries the course's authenticity end-to-end. The SOP keeps the human in the loop at the two agent touchpoints (research, polish).

## Scope

- Single app: `LMS/tochka-sborki/web/` (`lib/authoring/orchestrate.ts` + `scripts/author-course.ts`) + `LMS/_template/AUTHORING.md`. `lms_target: engine`.
- **This slice closes the epic** `fb_8e8eaf0acfdb` (S1–S5 complete) → mark the ticket done on ship.
- **Out of scope:** auto-writing/placing drafts to the content tree, live model calls, duration estimation, loading arbitrary outline files (uses `SAMPLE_OUTLINE`), any change to live course content.

## Backward compatibility

Additive: one new lib + one CLI + one doc. Reuses S1–S4 unchanged; not imported by the Next.js app. No new dependencies.

## Task decomposition (for the plan)

1. `lib/authoring/orchestrate.ts` (`UnitStatus`/`UnitResult`/`AuthoringReport` + `runAuthoringPass`) + `orchestrate.test.ts` (TDD: needs-research / invalid-outline / ready / needs-polish).
2. `scripts/author-course.ts` dry-run report CLI (notes-dir resolution via `parseResearchNotes`, status dashboard + next-step hints + tally); manual run check.
3. `LMS/_template/AUTHORING.md` SOP runbook; full suite + tsc + build green.
