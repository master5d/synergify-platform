# Course-authoring engine — S1: outline contract + scaffolder (fb_8e8eaf0acfdb)

**Ticket:** `fb_8e8eaf0acfdb` — AI-assisted course-authoring engine (internal skill/SOP) that scaffolds a new course into `LMS/_template`: topic & positioning → 5×5 module/lesson outline with learning objectives → per-lesson AI research → MDX lesson-script draft → review pass → applied exercises. Reverse-engineered from the 5-Day APM Course-Creation Challenge but **DE-HUSTLED** (strip profit-first prompts, scarcity, sales/avatar framing). Bilingual RU/EN. Fits the `COURSE` config contract in `lib/course.ts`.

## Epic decomposition (this spec = S1 of 5)

The ticket is an epic; the AI stages need a deterministic spine to write into.

| slice | stage | AI? |
|---|---|---|
| **S1 (this spec)** | typed outline contract + validator + de-hustle lint + pure scaffolder → file skeleton | no |
| S2 | per-lesson AI research pass → notes | yes |
| S3 | MDX draft from outline + research (4-Phase prose) | yes |
| S4 | review pass (clarity/tone/short sentences) + applied exercises | yes |
| S5 | skill/SOP orchestrator wrapping S1–S4 | orchestration |

S1 does **not** presume the multi-course registry (S.A.S.H.A); it is pure, deterministic, fully TDD-able foundation.

## Context (grep-before-build)

- `LMS/_template/` already exists: `CHECKLIST.md`, `course.config.template.ts`, `materials.template.ts`, `README.md`, and **empty** `content/{ru,en}/` dirs. The seed shell exists; the authoring pipeline is what's missing.
- `LMS/_template/README.md` references a `content/{ru,en}/01-example/` skeleton as the shape to copy — **it does not exist** (content dirs are empty). S1 materializes it, closing the dangling reference.
- `lib/course.ts` exports `interface Bi { ru: string; en: string }` and `COURSE` — the config contract. Reuse `Bi`.
- Lesson contract (from `CHECKLIST.md` §6 + live content): module folder `NN-slug`; `_meta.json` = `{ module, title, description, duration, level, units:[{slug,title}] }`; unit `uN-slug.mdx` = frontmatter `{ title, unit, module, duration }` + body. Every lesson has exactly **4 Phase blocks** in order: `activation → reflection → concept → practice` (38 of each across all content).
- Existing drift-guard: **activation/reflection phases are bisociative/mental — no "write/type" verbs.** S1's generated stubs for those phases MUST comply.

## Architecture

Three pure modules in `LMS/tochka-sborki/web/lib/authoring/` + one thin CLI in `web/scripts/`. All paths below are relative to `LMS/tochka-sborki/web/` unless noted.

### 1. `lib/authoring/outline.ts` — typed contract + validator

```ts
import type { Bi } from '@/lib/course'

export interface UnitOutline   { slug: string; title: Bi; objective: Bi }
export interface ModuleOutline { slug: string; title: Bi; description: Bi; level: number; units: UnitOutline[] }
export interface CourseOutline { name: Bi; modules: ModuleOutline[] }

/** Returns [] when valid, else a list of human-readable error messages. */
export function validateOutline(o: CourseOutline): string[]
```

Validator rules (enforce the lesson contract, not a rigid 5×5):
- `name` non-empty in both locales.
- ≥1 module; each module ≥1 unit.
- module `slug` matches `^\d{2}-[a-z0-9-]+$`; unit `slug` matches `^u\d+-[a-z0-9-]+$`.
- module slugs unique across the course; unit slugs unique within a module.
- `level` is an integer ≥ 1.
- every `Bi` field (`name`, module `title`/`description`, unit `title`/`objective`) non-empty in `ru` AND `en`.

(5×5 is the APM heuristic, not a hard rule — the reference course is 9 modules × ~4 units; the validator does not hard-fail on counts.)

### 2. `lib/authoring/dehustle.ts` — de-hustle lint

```ts
export function lintDehustle(text: string): string[]            // banned terms found in one string
export function lintOutlineDehustle(o: CourseOutline): string[] // scans every Bi field (ru+en); dedup'd
```

A module-local bilingual banned-term list strips the APM challenge's profit-first / scarcity / sales / avatar framing. Matching is case-insensitive, substring-based. Initial list (extensible):
- **EN:** `limited time`, `act now`, `only \d+ spots` (and `spots left`), `buyer avatar`, `customer avatar`, `sales funnel`, `passive income`, `6-figure`, `six-figure`, `guru`, `upsell`, `hustle`, `scarcity`, `fomo`.
- **RU:** `успей`, `осталось мест`, `ограниченное предложение`, `аватар клиента`, `воронка продаж`, `инфобизнес`, `пассивный доход`, `гуру`, `допродажа`.

`lintDehustle` returns the matched banned terms (lowercased) for a single string; `lintOutlineDehustle` runs it over every bilingual field of the outline and returns the deduplicated union. A non-empty result means the authoring pass must fail (caller's responsibility). This makes the de-hustle requirement executable.

### 3. `lib/authoring/scaffold.ts` — pure emitter

```ts
export interface ScaffoldFile { path: string; content: string }
/** Pure: maps a (valid) outline to the file skeleton. Paths are repo-relative
 *  under content/<locale>/<module>/… ; the caller writes them to a chosen root. */
export function scaffoldCourse(o: CourseOutline): ScaffoldFile[]
```

For each `module` × each `locale ∈ {ru, en}`:
- `content/<locale>/<module.slug>/_meta.json` — `{ module: <1-based index>, title, description, duration: "TODO", level, units: [{ slug, title }] }` (title/description localized; `module` index derived from array position; `duration` a `"TODO"` placeholder since the outline carries no duration).
- For each `unit`: `content/<locale>/<module.slug>/<unit.slug>.mdx` with this exact skeleton (localized `title`; `unit`/`module` are 1-based indices; objective embedded as an authoring guide comment):

```mdx
---
title: "<unit.title[locale]>"
unit: <unitIndex+1>
module: <moduleIndex+1>
duration: "TODO"
---

{/* objective: <unit.objective[locale]> */}

<Phase type="activation">

TODO: a bisociative mental hook — collide the learner's familiar frame with a foreign one. Mental only; do not ask them to write or type.

</Phase>

<Phase type="reflection">

TODO: a second, different frame on the same idea. Mental, bisociative; no write/type verbs.

</Phase>

<Phase type="concept">

TODO: the core idea, plainly. Short sentences.

</Phase>

<Phase type="practice">

TODO: one concrete applied step the learner does for real.

</Phase>
```

The activation/reflection placeholder copy deliberately contains **no "write"/"type" verbs as imperatives directed at the learner** (it *names* the constraint, in the meta-instruction, but does not instruct the learner to write) — consistent with the existing reflection drift-guard. The MDX comment uses the JSX form `{/* … */}` so it is valid inside MDX.

### 4. `scripts/scaffold-course.mjs` — thin writer CLI

A small Node script: imports a sample outline, runs `validateOutline` + `lintOutlineDehustle` (aborts printing errors if either is non-empty), calls `scaffoldCourse`, and writes each `ScaffoldFile` to `<root>/<path>` (default `root = ../../_template` relative to `web/`, i.e. `LMS/_template`), creating dirs as needed. Used once in S1 to materialize the `01-example` skeleton; reusable for real courses later. (The writer is a trivial `fs` loop; the tested logic lives in the pure modules.)

S1 commits: a tiny **sample outline** (`lib/authoring/sample-outline.ts`, a 1-module × 2-unit `01-example` outline, bilingual, de-hustle-clean) and the **generated `LMS/_template/content/{ru,en}/01-example/` skeleton** it produces — closing the README's dangling reference.

## Testing

`lib/authoring/outline.test.ts`, `dehustle.test.ts`, `scaffold.test.ts`:
- **outline:** a valid sample → `validateOutline` returns `[]`; a missing-locale `Bi` field → non-empty errors; a bad module slug (`1-x`) and bad unit slug (`x`) → errors; duplicate module slug and duplicate unit-within-module → errors; `level: 0` → error.
- **dehustle:** `lintDehustle('Act now — only 3 spots left, passive income!')` includes the EN terms; `lintDehustle('успей, осталось мест')` includes the RU terms; clean copy → `[]`; `lintOutlineDehustle(sample)` → `[]` (the sample is clean); an outline seeded with a banned term → that term in the result.
- **scaffold:** `scaffoldCourse(sample)` emits `content/ru/...` and `content/en/...` paths (both locales); each `_meta.json` `JSON.parse`s to an object with `module`/`title`/`units` of the right shape and unit count; every `.mdx` contains the four `<Phase type="…">` tags in order and a `title:` frontmatter line; no `.mdx` activation/reflection block contains a write/type imperative (assert against a `/\b(напиши|запиши|type|write)\b/i` probe scoped to those blocks); `lintOutlineDehustle(sample)` clean ⇒ no banned terms leak into output.
- Full Vitest suite + `npm run build` green, no regression. (The new `lib/authoring` modules are not imported by the Next.js app, so they don't affect the build output; the build run confirms no type breakage.)

## Authenticity / values

The de-hustle lint is the authenticity-sacred constraint made executable: no profit-first/scarcity/avatar framing can pass. Scaffold stubs are pedagogy-first (4-Phase Kolb spine, bisociative reflection), de-guru, de-hustle. No fabricated metrics, no sales language.

## Scope

- Single app: `LMS/tochka-sborki/web/` (new `lib/authoring/` + `scripts/scaffold-course.mjs`) + generated `LMS/_template/content/01-example/`. `lms_target: engine`.
- **Out of scope (later slices):** AI research (S2), MDX prose drafting (S3), review/exercises (S4), the skill/SOP orchestrator (S5), multi-course registry / S.A.S.H.A, duration estimation, and any change to the live `tochka-sborki` course content or the engine runtime.

## Backward compatibility

Additive: new `lib/authoring/` modules + one CLI script + new files under `_template/content/01-example/`. Nothing existing changes; the modules are not imported by the running app. No new dependencies (Node `fs`/`path` only).

## Task decomposition (for the plan)

1. `lib/authoring/outline.ts` (`CourseOutline`/`ModuleOutline`/`UnitOutline`, `validateOutline`) + `outline.test.ts` (TDD).
2. `lib/authoring/dehustle.ts` (`lintDehustle`, `lintOutlineDehustle`, banned list) + `dehustle.test.ts` (TDD).
3. `lib/authoring/scaffold.ts` (`scaffoldCourse`, `ScaffoldFile`) + `lib/authoring/sample-outline.ts` + `scaffold.test.ts` (TDD).
4. `scripts/scaffold-course.mjs` writer CLI; run it to materialize `LMS/_template/content/{ru,en}/01-example/`; commit the script + generated skeleton; full suite + build green.
