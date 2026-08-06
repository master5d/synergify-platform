# Course-authoring engine — S3: deterministic MDX draft assembler (fb_8e8eaf0acfdb)

**Ticket:** `fb_8e8eaf0acfdb`, slice **S3 of 5**. S1 = deterministic spine (outline/lint/scaffolder). S2 = research prompt-emitter + parser. S3 = the MDX lesson-script draft: weave a unit's `ResearchNotes` (S2) into a valid 4-Phase MDX lesson, deterministically.

## Decision (design gate): deterministic assembler (no LLM)

Chosen over a prompt-emitter. Crisp slice roles: **S2 gather substance (agent) → S3 structure it deterministically → S4 polish prose (agent)**. S3 is 100% pure/TDD, no author-in-loop, and emits a committable draft. The research notes ARE the substance; the assembler places them in the pedagogical structure. Reuses S1's MDX shape + `lintDehustle`, and honors the existing no-write reflection drift-guard.

## Context (grep-before-build)

- S1 `scaffold.ts` `unitMdx`: frontmatter `{ title, unit, module, duration }` + `{/* objective: … */}` + four `<Phase type="…">` blocks in order `activation → reflection → concept → practice` with TODO stubs. S3 mirrors this shape but fills the phases from notes.
- S2 `research.ts`: `ResearchNotes = { concepts: string[]; hook: string; misconception: string; practice: string; sources: string[] }`, and `parseResearchNotes(text)` (reused by S3's CLI to read a saved agent reply).
- S1 `dehustle.ts`: `lintDehustle` (reused). Existing drift-guard: activation/reflection phases carry no write/type imperatives.
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries`.

## Architecture

### 1. `lib/authoring/draft.ts` — assembler + validator + sample

```ts
import type { Locale } from '@/lib/dictionaries'
import type { ResearchNotes } from './research'
import { lintDehustle } from './dehustle'

export interface DraftInput {
  unitTitle: string
  unitIndex: number   // 0-based
  moduleIndex: number // 0-based
  objective: string
  notes: ResearchNotes
  locale: Locale
}

export function draftLesson(i: DraftInput): string        // valid 4-Phase MDX
export function validateDraftMdx(mdx: string): string[]   // [] = conforms
export const SAMPLE_NOTES: ResearchNotes                  // clean fixture (English) for CLI/tests
```

**`draftLesson`** — bilingual by `locale`; same frontmatter (`title`, 1-based `unit`/`module`, `duration: "TODO"`) + `{/* objective: … */}` as S1's scaffold, phases filled from `notes`:
- **activation** ← `hook` (a bisociative mental image): RU `«Представь: {hook}.»` + a mental prompt (`Прокрути это в голове — где это уже встречалось тебе?`); EN `"Picture this: {hook}."` + `Run it in your head — where have you met this before?`. **No write/type verbs.**
- **reflection** ← `misconception`, reframed as a *mental* check: RU `«Многие думают: {misconception}. Мысленно проверь: так ли это в твоём случае?»`; EN `"Many assume: {misconception}. Check it in your head: is that true for you?"`. **No write/type verbs.**
- **concept** ← `concepts` as a `- ` markdown list + a misconception callout (`> ⚠️ Частое заблуждение: {misconception}` / `> ⚠️ Common misconception: {misconception}`). Markdown allowed here.
- **practice** ← `practice`: RU `«Сделай: {practice}»`; EN `"Do this: {practice}"` (the practice phase may use do/make).
- **sources** → a trailing author-facing `{/* sources: a; b */}` comment (guides verification; does not render to the learner).

**`validateDraftMdx`** — reusable (also validates S4's polished output later): the MDX starts with `---\ntitle: "`; the four `<Phase type="…">` appear in order `activation → reflection → concept → practice`; the activation and reflection blocks contain no `/\b(напиши|запиши|type|write)\b/i` (drift-guard parity — catches a hook the S2 agent wrongly made write-y); `lintDehustle(mdx)` hits folded into errors. Returns `[]` when all pass.

**`SAMPLE_NOTES`** — a clean, de-hustle-safe English `ResearchNotes` fixture aligned to `01-sample`'s `u1-intro` objective, used by the CLI default and tests. Its `hook`/`misconception` contain no write/type verbs.

### 2. `scripts/draft-lesson.ts` — CLI

`npx --yes tsx scripts/draft-lesson.ts <module-slug> <unit-slug> [ru|en] [notes-file]` — resolves the unit from `SAMPLE_OUTLINE` (module + unit indices from `findIndex`); if `notes-file` is given, reads it and parses with S2's `parseResearchNotes` (dogfoods the pipeline; exits non-zero listing parse errors); otherwise uses `SAMPLE_NOTES`. Builds `DraftInput` (localized `unitTitle`/`objective`), prints `draftLesson(input)` to stdout (author redirects to the `.mdx`), and prints any `validateDraftMdx` issues to stderr as `# `-prefixed comments (draft still emitted). Exits non-zero on unknown module/unit slug.

### 3. Tests (`lib/authoring/draft.test.ts`)

- **`draftLesson`** (input built from `SAMPLE_NOTES`, `locale: 'en'`): output starts with the `title:` frontmatter; the four `<Phase>` tags appear in order; the `hook` text is inside the activation block, a concept inside the concept block, the `misconception` inside the reflection block, the `practice` inside the practice block; the activation and reflection blocks contain no `/\b(type|write)\b/i`; `lintDehustle(output) === []`; `validateDraftMdx(output) === []` (self-consistency). A second assertion with `locale: 'ru'` checks the RU wrapper phrases (`Представь:`, `Мысленно`) appear.
- **`validateDraftMdx`:** a valid `draftLesson` output → `[]`; the same MDX with the reflection `<Phase>` block removed → a phase-order error; the same MDX with `write` injected into the activation block → an activation write-verb error; the same MDX with a banned term (`passive income`) injected → a de-hustle error.
- Full Vitest suite + `npx tsc --noEmit` + `npm run build` green.

## Authenticity / values

Deterministic and pure (no LLM, no key, no dep — sovereign-consistent). De-hustled (validator gates on `lintDehustle`). Pedagogy-first: 4-Phase Kolb spine, bisociative mental activation, no-write reflection honored by construction and by the validator. The draft is honest scaffold-from-research, not fabricated prose.

## Scope

- Single app: `LMS/tochka-sborki/web/` (`lib/authoring/draft.ts` + `scripts/draft-lesson.ts`). `lms_target: engine`.
- **Out of scope (later slices):** S4 review pass / applied exercises, S5 orchestrator, duration estimation, any live model call, writing drafts to disk automatically (the CLI prints; the author redirects), and any change to the live course content.

## Backward compatibility

Additive: one new `lib/authoring/draft.ts` + one CLI. Reuses S1/S2 modules unchanged; not imported by the Next.js app. No new dependencies.

## Task decomposition (for the plan)

1. `lib/authoring/draft.ts`: `DraftInput` + `draftLesson` (bilingual weaving) + `SAMPLE_NOTES` + `draft.test.ts` `draftLesson` tests (TDD).
2. `validateDraftMdx` (frontmatter / phase-order / no-write / de-hustle) + its tests (valid / missing-phase / write-verb / de-hustle).
3. `scripts/draft-lesson.ts` CLI (resolve from `SAMPLE_OUTLINE`, notes-file via `parseResearchNotes` or `SAMPLE_NOTES`, print draft + stderr issues); full suite + tsc + build green.
