# Course-authoring engine — S2: per-lesson research prompt-emitter (fb_8e8eaf0acfdb)

**Ticket:** `fb_8e8eaf0acfdb` — AI-assisted course-authoring engine, slice **S2 of 5**. S1 shipped the deterministic spine (outline contract + de-hustle lint + scaffolder + CLI). S2 is the "per-lesson AI research pass": produce, per unit, structured research notes the S3 MDX-draft stage will use.

## Decision (design gate): prompt-emitter, no live LLM call

The app has **no server-side LLM client and no LLM SDK dependency**; the entire learn-with-AI layer is prompt-paste (`buildLearnPrompt` + `agentUrl` deep-link the author to their own agent — sovereign / BYO-account ethos). S1 was pure/deterministic/TDD with no network. S2 mirrors this exactly: it **emits a research prompt** the author runs in their own agent (Claude Code / ChatGPT — dogfoods "build with AI"), and **parses** the returned notes into a typed structure for S3. No live call, no key, no network, no new dependency. 100% pure/TDD.

(Rejected at the gate: a live LLM call via a mockable seam, and a hybrid pure-core + optional-adapter — both add a gateway/key dependency into a build tool and diverge from the app's prompt-paste philosophy.)

## Context (grep-before-build)

- No LLM client / SDK anywhere in `lib/` or `scripts/` (`grep openai|anthropic|chat/completions|/v1/messages` → none; `package.json` → no LLM dep).
- `lib/learn-prompt.ts` is the pattern to mirror: a pure prompt-builder (`buildLearnPrompt(input): string`) + `agentUrl(agent, prompt)` deep-link. S2's builder mirrors its shape.
- S1 (already merged, `lib/authoring/`): `outline.ts` (`CourseOutline`/`ModuleOutline`/`UnitOutline`, `validateOutline`), `dehustle.ts` (`lintDehustle`/`lintOutlineDehustle`), `scaffold.ts` (`scaffoldCourse`), `sample-outline.ts` (`SAMPLE_OUTLINE`), `scripts/scaffold-course.ts`.
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries` (NOT `@/lib/course`, which exports only `Bi`/`COURSE`). Lesson pedagogy (from S1 + content): 4-Phase Kolb spine (activation→reflection→concept→practice); activation/reflection are bisociative/mental (no write/type imperatives); short sentences.

## Architecture

### 1. `lib/authoring/research.ts` — pure builder + parser

```ts
import type { Locale } from '@/lib/dictionaries'  // 'ru' | 'en' (NOT exported from @/lib/course)

export interface ResearchNotes {
  concepts: string[]     // key concepts to teach (the CONCEPT phase substance)
  hook: string           // a bisociative/analogy seed for the ACTIVATION phase (mental, not "write")
  misconception: string  // a common wrong mental model to pre-empt
  practice: string       // a concrete applied-step seed for the PRACTICE phase
  sources: string[]      // 2–3 credible things to verify the lesson against
}

export interface ResearchInput {
  courseName: string
  moduleTitle: string
  unitTitle: string
  objective: string
  locale: Locale
}

/** A de-hustled, bilingual, pedagogy-encoded research prompt for the author's own agent. */
export function buildResearchPrompt(i: ResearchInput): string

/** Pure parser: labeled agent reply -> ResearchNotes + a list of problems (missing sections, hustle terms). */
export function parseResearchNotes(text: string): { notes: ResearchNotes; errors: string[] }
```

**`buildResearchPrompt`** — locale-driven (ru/en branches). It frames the task honestly (research *toward the unit's objective*, no selling), encodes the pedagogy (bisociative mental hook — explicitly "not «напиши/write»"; core concepts in short sentences; a misconception to pre-empt; a concrete practice seed; 2–3 sources to verify), and **demands a parseable labeled reply** using exactly these five uppercase labels, each on its own line:

```
CONCEPTS:
- <concept>
- <concept>
HOOK: <one-line bisociative hook seed>
MISCONCEPTION: <one common wrong mental model>
PRACTICE: <one concrete applied step>
SOURCES:
- <source>
- <source>
```

The prompt itself carries no profit/scarcity/avatar framing (asserted clean through `lintDehustle`).

**`parseResearchNotes`** — pure, deterministic:
- Splits the reply on the five labels. `CONCEPTS`/`SOURCES` collect the `- ` bullet lines beneath their label until the next label; `HOOK`/`MISCONCEPTION`/`PRACTICE` take the trimmed remainder of their line.
- `errors` accumulates: a required section missing or empty (`concepts` empty, `hook`/`misconception`/`practice` blank, `sources` empty), and — reusing S1 — any `lintDehustle` hit across the parsed fields (so hustle-y research is flagged before it reaches a lesson).
- Always returns a best-effort `notes` object plus `errors`; S3 gates on `errors.length === 0`.

### 2. Reuse S1's de-hustle lint

`buildResearchPrompt`'s output is verified clean by `lintDehustle` in tests; `parseResearchNotes` runs `lintDehustle` over the parsed `concepts`/`hook`/`misconception`/`practice`/`sources` and folds any hits into `errors`. Authenticity carried forward from S1 without duplication.

### 3. `scripts/research-prompt.ts` — thin CLI (usable now)

`npx --yes tsx scripts/research-prompt.ts <module-slug> <unit-slug> [ru|en]` — resolves the unit from `SAMPLE_OUTLINE` (matching module slug + unit slug), builds the `ResearchInput` (course name = outline `name[locale]`, module title, unit title, objective — all localized), and prints `buildResearchPrompt(input)` to stdout. If the module/unit slug is not found, prints an error listing available slugs and exits non-zero. Default locale `ru`. Makes S2 end-to-end usable immediately: author runs it, pastes the prompt into their agent, feeds the reply into S3 (next slice).

### 4. Tests (`lib/authoring/research.test.ts`)

- **`buildResearchPrompt`:** output contains the `courseName`, `moduleTitle`, `unitTitle`, and `objective`; contains all five labels (`CONCEPTS:`, `HOOK:`, `MISCONCEPTION:`, `PRACTICE:`, `SOURCES:`); ru and en outputs differ (bilingual); `lintDehustle(output)` returns `[]` (the prompt is itself de-hustle clean); the prompt names the mental/no-write constraint for the hook (assert it references a bisociative/mental framing and forbids "write/напиши").
- **`parseResearchNotes`:** a well-formed fixture → `concepts` (multi-item), `hook`/`misconception`/`practice` (trimmed singles), `sources` (multi-item), `errors: []`; a fixture missing the `HOOK:` line → `errors` names the missing hook; a fixture with a banned term seeded in a concept → the de-hustle hit appears in `errors`.
- Full Vitest suite + `npm run build` + `npx tsc --noEmit` green (tsc gate per the S1 lurking-type lesson).

## Authenticity / values

Sovereign-consistent (author's own agent, no vendored key). De-hustled (prompt + parser both gate on `lintDehustle`). Pedagogy-first (bisociative mental hook, Kolb spine, short sentences). No fabricated content — the author supplies real research; the parser just structures it.

## Scope

- Single app: `LMS/tochka-sborki/web/` (`lib/authoring/research.ts` + `scripts/research-prompt.ts`). `lms_target: engine`.
- **Out of scope (later slices):** the S3 MDX-draft stage (consumes `ResearchNotes`), any live model call / gateway integration, loading arbitrary outline files (uses `SAMPLE_OUTLINE`), review/exercises (S4), the SOP orchestrator (S5).

## Backward compatibility

Additive: one new `lib/authoring/research.ts` + one CLI. Reuses S1's `dehustle`/`outline`/`sample-outline`; changes nothing existing. Not imported by the Next.js app. No new dependencies.

## Task decomposition (for the plan)

1. `lib/authoring/research.ts`: `ResearchNotes`/`ResearchInput` types + `buildResearchPrompt` (bilingual, de-hustled, labeled format) + `research.test.ts` builder tests (TDD).
2. `parseResearchNotes` (label parser + de-hustle-folded errors) + parser tests (well-formed / missing-section / hustle-term).
3. `scripts/research-prompt.ts` CLI (resolve from `SAMPLE_OUTLINE`, print prompt, error on unknown slug); full suite + tsc + build green.
