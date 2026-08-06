# Course-authoring engine — S4: review-pass lint + polish prompt (fb_8e8eaf0acfdb)

**Ticket:** `fb_8e8eaf0acfdb`, slice **S4 of 5**. S1 spine, S2 research prompt-emitter, S3 deterministic MDX draft + `validateDraftMdx`. S4 = the review pass (clarity/usability, conversational tone, shorter sentences) + applied exercises.

## Decisions (design gate)

1. **Review = deterministic readability lint + polish prompt-emitter (both).** Mirrors the epic's division: a pure, TDD-able gate (`lintReadability`) + an agent prose step (`buildPolishPrompt`). The lint makes "shorter sentences / clarity" an executable check, not an agent whim.
2. **Applied exercises fold into a practice-substance check.** The S3 draft already emits a `<Phase type="practice">` applied step — that IS the exercise. S4's lint just gates that the practice phase is concrete (not vague/empty). No separate exercises artifact (avoids scope creep / duplicating the practice phase).

## Context (grep-before-build)

- S3 `draft.ts`: `draftLesson(i): string` (4-Phase MDX; frontmatter + `{/* objective */}` + `<Phase type="…">`×4 in order + `{/* sources */}`), `validateDraftMdx(mdx): string[]` (structure / phase-order / no-write in activation-reflection / de-hustle), `SAMPLE_NOTES`. S4 reuses `validateDraftMdx` in the CLI and `draftLesson`/`SAMPLE_NOTES` in tests.
- S1 `dehustle.ts`: `lintDehustle` (reused in the `buildPolishPrompt` test).
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries`.
- Phase-body extraction pattern (from `validateDraftMdx`): `new RegExp('<Phase type="'+type+'">([\\s\\S]*?)</Phase>')`.

## Architecture

### 1. `lib/authoring/review.ts`

```ts
import type { Locale } from '@/lib/dictionaries'

export function lintReadability(mdx: string): string[]                            // [] = clean
export function buildPolishPrompt(mdx: string, findings: string[], locale: Locale): string
```

**`lintReadability`** — deterministic per-phase checks (`activation`/`reflection`/`concept`/`practice`). Constants: `MAX_SENTENCE_WORDS = 25`, `MIN_PRACTICE_CHARS = 20`.
- **empty phase** — the raw phase body has no non-whitespace content → `${type}: empty phase body`.
- **leftover TODO** — the phase body contains `/\bTODO\b/` → `${type}: leftover TODO`.
- **long sentence** — from the phase body, drop structural lines (`<Phase…>` / `</Phase>` tags, `{/* … */}` comments, `#` headers); from the rest strip a leading `- ` bullet marker or `> ⚠️ ` / `> ` callout marker, keep the text; join; split into sentences on `/[.!?…]+/`; any trimmed sentence with `> MAX_SENTENCE_WORDS` words → `${type}: long sentence (${n} words)`.
- **vague practice** (applied-exercises fold) — only for `practice`: if the practice prose (after the same stripping) is shorter than `MIN_PRACTICE_CHARS` → `practice: too vague — needs a concrete applied step`.

A clean S3 draft (`draftLesson` of `SAMPLE_NOTES`) passes with `[]` — readability round-trip (bullets/callouts count as content; every SAMPLE sentence is < 25 words; the practice step is concrete). Mirrors S3's validator round-trip.

**`buildPolishPrompt`** — bilingual (ru/en), de-hustled. Hands the agent the draft **+ the findings**, asking for a tightened rewrite: conversational tone, sentences under 25 words, plain language; **preserve** the frontmatter + the four phases in order; keep activation/reflection mental (never ask the learner to write or type); keep the practice step concrete; no selling; "return only the revised MDX, nothing else." Embeds the `findings` as a `- ` list (or a "no automated findings — just tighten the prose" line when empty) and the draft under a `--- DRAFT ---` marker. The wrapper text is itself de-hustle clean.

### 2. `scripts/review-lesson.ts` — CLI

`npx --yes tsx scripts/review-lesson.ts <mdx-file> [ru|en]` — reads the draft MDX file; runs `validateDraftMdx` (structure/no-write/de-hustle) **and** `lintReadability` (readability); prints the combined findings to stderr as `# ` lines; prints `buildPolishPrompt(mdx, allFindings, locale)` to stdout (the author pipes it to their agent). Exits non-zero if the file argument is missing or unreadable. Closes the pipeline: `draft-lesson (S3) → review-lesson (S4) → agent polish → re-validate`.

### 3. Tests (`lib/authoring/review.test.ts`)

- **`lintReadability`:** a clean S3 draft (`draftLesson` of `SAMPLE_NOTES`) → `[]`; a phase with a >25-word sentence injected → a `long sentence` finding; a `TODO` injected into a phase body → a `leftover TODO` finding; a draft whose practice body is replaced with a too-short step (`Do this: go`) → the `too vague` finding.
- **`buildPolishPrompt`:** output contains the draft text and each supplied finding and the constraint keywords (shorter sentences / four phases / mental / no selling — locale-appropriate); ru ≠ en; `lintDehustle(buildPolishPrompt(cleanDraft, cleanFindings, locale)) === []` for both locales.
- Full Vitest suite + `npx tsc --noEmit` + `npm run build` green.

## Authenticity / values

Deterministic lint (pure, no LLM/dep) + prompt-emitter (sovereign, author's own agent). De-hustled (polish prompt gates clean; review never introduces selling). Pedagogy-first: the polish prompt preserves the 4-Phase spine and the no-write reflection constraint; the practice-substance check keeps the applied step real.

## Scope

- Single app: `LMS/tochka-sborki/web/` (`lib/authoring/review.ts` + `scripts/review-lesson.ts`). `lms_target: engine`.
- **Out of scope (S5):** the orchestrator chaining S1→S4, auto-applying the polish, standalone exercises artifacts, duration estimation, any live model call, and any change to live course content.

## Backward compatibility

Additive: one new `lib/authoring/review.ts` + one CLI. Reuses S1/S3 modules unchanged; not imported by the Next.js app. No new dependencies.

## Task decomposition (for the plan)

1. `lib/authoring/review.ts` `lintReadability` (empty/TODO/long-sentence/vague-practice, per-phase) + `review.test.ts` lint tests (TDD).
2. `buildPolishPrompt` (bilingual, de-hustled, embeds findings + draft) + its tests (embeds/keywords/bilingual/de-hustle-clean).
3. `scripts/review-lesson.ts` CLI (read file, run `validateDraftMdx` + `lintReadability`, print findings + polish prompt, non-zero on missing file); full suite + tsc + build green.
