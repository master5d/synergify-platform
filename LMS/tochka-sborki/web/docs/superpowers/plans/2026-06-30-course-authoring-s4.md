# Course-Authoring S4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the review pass an executable gate — a deterministic `lintReadability(mdx)` — plus a bilingual `buildPolishPrompt` the author's agent uses to tighten prose, wired into a CLI. Applied exercises fold into a practice-substance check.

**Architecture:** One pure module `lib/authoring/review.ts` (`lintReadability` + `buildPolishPrompt`) + a thin `scripts/review-lesson.ts` CLI that runs S3's `validateDraftMdx` alongside `lintReadability` and prints the polish prompt. No LLM, no network, no dep.

**Tech Stack:** TypeScript, Vitest (env=node), Node/`npx tsx` for the CLI. No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. Paths relative to it; run commands from there. Correct dir spelling **tochka-sborki** (NO second 's'); confirm staged paths before every commit.
- `lms_target: engine`. **S4 of a 5-slice epic** (`fb_8e8eaf0acfdb`); does NOT presume the multi-course registry / S.A.S.H.A. Do NOT mark the epic ticket done.
- Deterministic lint + prompt-emitter; **no live LLM / no network / no key / no new dependency**.
- `Locale = 'ru' | 'en'` from `@/lib/dictionaries`. Reuse `validateDraftMdx`/`draftLesson`/`SAMPLE_NOTES` from `./draft` (S3), `lintDehustle` from `./dehustle` (S1).
- Readability rules: `MAX_SENTENCE_WORDS = 25`, `MIN_PRACTICE_CHARS = 20`. Check **per prose-line** (bullets/callouts lack terminal punctuation — never join them into one sentence). Phase bodies extracted with `new RegExp('<Phase type="'+type+'">([\\s\\S]*?)</Phase>')`.
- A clean S3 draft (`draftLesson` of `SAMPLE_NOTES`) MUST pass `lintReadability` with `[]`.
- Additive only: new files only; `lib/authoring/review.ts` is not imported by the Next.js app.
- Test command: full suite `npm test`; single file `npx vitest run <path>`. Build: `npm run build`. Typecheck gate (final): `npx tsc --noEmit` (required).
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/authoring/review.ts` — `lintReadability`

**Files:**
- Create: `lib/authoring/review.ts`
- Test: `lib/authoring/review.test.ts`

**Interfaces:**
- Consumes: `draftLesson`/`SAMPLE_NOTES` from `./draft` (test only).
- Produces: `lintReadability(mdx: string): string[]`. (`buildPolishPrompt` is added in Task 2.)

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/review.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { lintReadability } from './review'
import { draftLesson, SAMPLE_NOTES } from './draft'

const clean = draftLesson({
  unitTitle: 'Getting started', unitIndex: 0, moduleIndex: 0,
  objective: 'Understand why this module exists', notes: SAMPLE_NOTES, locale: 'en',
})
const LONG = 'This is an intentionally very long sentence that keeps going and going with many many extra words so that it clearly exceeds the twenty five word maximum threshold set by the readability lint today'

describe('lintReadability', () => {
  it('passes a clean S3 draft', () => {
    expect(lintReadability(clean)).toEqual([])
  })
  it('flags a long sentence in a phase', () => {
    const dirty = clean.replace('Run it in your head — where have you met this before?', LONG + '.')
    expect(lintReadability(dirty).some(e => /long sentence/.test(e))).toBe(true)
  })
  it('flags a leftover TODO in a phase body', () => {
    const dirty = clean.replace('Do this:', 'TODO: Do this:')
    expect(lintReadability(dirty).some(e => /leftover TODO/.test(e))).toBe(true)
  })
  it('flags a too-vague practice step', () => {
    const dirty = clean.replace('Do this: name one real task you want this module to help you finish', 'Do this: go')
    expect(lintReadability(dirty).some(e => /too vague/.test(e))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/review.test.ts`
Expected: FAIL — cannot resolve `./review`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/review.ts`:

```ts
// lib/authoring/review.ts
// S4 of the course-authoring engine: a deterministic readability lint (the "review pass"
// as an executable gate) + (Task 2) a polish PROMPT the author's agent uses to tighten prose.
// No live LLM. Pure. Run alongside S3's validateDraftMdx.

const MAX_SENTENCE_WORDS = 25
const MIN_PRACTICE_CHARS = 20
const PHASES = ['activation', 'reflection', 'concept', 'practice'] as const

function phaseBody(mdx: string, type: string): string {
  return new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`).exec(mdx)?.[1] ?? ''
}

// Prose lines = phase body lines minus structural ones (Phase tags, MDX comments, headers),
// with a leading bullet (`- `) or callout (`> `) marker stripped. Checked per line so that
// bullets (which lack terminal punctuation) are never joined into one giant "sentence".
function phaseProseLines(body: string): string[] {
  return body
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !/^<\/?Phase/.test(l) && !/^\{\/\*/.test(l) && !/^#/.test(l))
    .map(l => l.replace(/^-\s+/, '').replace(/^>\s*/, '').trim())
    .filter(Boolean)
}

export function lintReadability(mdx: string): string[] {
  const findings: string[] = []
  for (const type of PHASES) {
    const body = phaseBody(mdx, type)
    if (body.trim().length === 0) { findings.push(`${type}: empty phase body`); continue }
    if (/\bTODO\b/.test(body)) findings.push(`${type}: leftover TODO`)

    const lines = phaseProseLines(body)
    for (const line of lines) {
      for (const sentence of line.split(/[.!?…]+/)) {
        const n = sentence.trim().split(/\s+/).filter(Boolean).length
        if (n > MAX_SENTENCE_WORDS) findings.push(`${type}: long sentence (${n} words)`)
      }
    }
    if (type === 'practice' && lines.join(' ').length < MIN_PRACTICE_CHARS) {
      findings.push('practice: too vague — needs a concrete applied step')
    }
  }
  return findings
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/review.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/review.ts LMS/tochka-sborki/web/lib/authoring/review.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S4 lintReadability review gate (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `buildPolishPrompt` — bilingual polish prompt-emitter

**Files:**
- Modify: `lib/authoring/review.ts` (add the import + the `buildPolishPrompt` function)
- Test: `lib/authoring/review.test.ts` (append a `describe`)

**Interfaces:**
- Consumes: `Locale` from `@/lib/dictionaries`; `lintDehustle` from `./dehustle` (test); `draftLesson`/`SAMPLE_NOTES` (test).
- Produces: `buildPolishPrompt(mdx: string, findings: string[], locale: Locale): string`.

- [ ] **Step 1: Write the failing test**

Append to `lib/authoring/review.test.ts` (add `buildPolishPrompt` to the top import from `./review` so it reads `import { lintReadability, buildPolishPrompt } from './review'`, and add `import { lintDehustle } from './dehustle'`):

```ts
describe('buildPolishPrompt', () => {
  const findings = ['activation: long sentence (30 words)']
  it('embeds the draft, findings, and constraints (en)', () => {
    const p = buildPolishPrompt(clean, findings, 'en')
    expect(p).toContain('--- DRAFT ---')
    expect(p).toContain('Getting started')
    expect(p).toContain('activation: long sentence (30 words)')
    expect(p).toMatch(/under 25 words/)
    expect(p).toMatch(/activation.*reflection.*concept.*practice/)
    expect(p).toMatch(/mental/)
    expect(p).toMatch(/no selling/)
  })
  it('differs by locale and both are de-hustle clean', () => {
    const en = buildPolishPrompt(clean, findings, 'en')
    const ru = buildPolishPrompt(clean, findings, 'ru')
    expect(en).not.toBe(ru)
    expect(lintDehustle(en)).toEqual([])
    expect(lintDehustle(ru)).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/review.test.ts`
Expected: FAIL — `buildPolishPrompt` is not exported.

- [ ] **Step 3: Implement**

3a. Add the import at the very top of `lib/authoring/review.ts` (above the comment block or right after it, before the constants):

```ts
import type { Locale } from '@/lib/dictionaries'
```

3b. Append the function to the end of `lib/authoring/review.ts`:

```ts
/** A bilingual, de-hustled prompt handing the agent the draft + review findings for a
 *  tightened rewrite. The author re-runs the result through validateDraftMdx + lintReadability. */
export function buildPolishPrompt(mdx: string, findings: string[], locale: Locale): string {
  if (locale === 'en') {
    const f = findings.length
      ? 'Address these review findings:\n' + findings.map(x => `- ${x}`).join('\n')
      : 'No automated findings — just tighten the prose.'
    return [
      `Here is a draft lesson from my course — honest, calm, no selling.`,
      `Tighten it: conversational tone, sentences under 25 words, plain language.`,
      `Keep the frontmatter and the four phases in order (activation, reflection, concept, practice). Keep activation and reflection mental — never ask the learner to write or type. Keep the practice step concrete.`,
      f,
      `Return only the revised MDX, nothing else.`,
      ``,
      `--- DRAFT ---`,
      mdx,
    ].join('\n')
  }
  const f = findings.length
    ? 'Устрани эти замечания ревью:\n' + findings.map(x => `- ${x}`).join('\n')
    : 'Автоматических замечаний нет — просто подтяни текст.'
  return [
    `Вот черновик урока моего курса — честно, спокойно, без продаж.`,
    `Подтяни: разговорный тон, предложения короче 25 слов, простой язык.`,
    `Сохрани фронтматтер и четыре фазы по порядку (activation, reflection, concept, practice). Активацию и рефлексию оставь мысленными — не проси ученика писать или печатать. Практический шаг оставь конкретным.`,
    f,
    `Верни только исправленный MDX, ничего лишнего.`,
    ``,
    `--- DRAFT ---`,
    mdx,
  ].join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/review.test.ts`
Expected: PASS (6 tests — 4 lint + 2 prompt).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/review.ts LMS/tochka-sborki/web/lib/authoring/review.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S4 buildPolishPrompt (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `scripts/review-lesson.ts` CLI + final gates

**Files:**
- Create: `scripts/review-lesson.ts`

**Interfaces:**
- Consumes: `validateDraftMdx` from `../lib/authoring/draft`; `lintReadability`/`buildPolishPrompt` from `../lib/authoring/review`.
- Produces: a runnable CLI that reviews a draft MDX file.

- [ ] **Step 1: Write the CLI**

Create `scripts/review-lesson.ts`:

```ts
// scripts/review-lesson.ts
// Review a lesson-draft MDX file: run structural (validateDraftMdx) + readability (lintReadability)
// checks, print findings to stderr, and print a polish prompt to stdout for the author's agent.
// Run from web/:  npx --yes tsx scripts/review-lesson.ts <mdx-file> [ru|en]
import { readFileSync } from 'node:fs'
import { validateDraftMdx } from '../lib/authoring/draft'
import { lintReadability, buildPolishPrompt } from '../lib/authoring/review'

const [mdxFile, localeArg] = process.argv.slice(2)
const locale: 'ru' | 'en' = localeArg === 'en' ? 'en' : 'ru'

if (!mdxFile) {
  console.error('usage: review-lesson.ts <mdx-file> [ru|en]')
  process.exit(1)
}

let mdx: string
try {
  mdx = readFileSync(mdxFile, 'utf8')
} catch {
  console.error(`cannot read file: ${mdxFile}`)
  process.exit(1)
}

const findings = [...validateDraftMdx(mdx), ...lintReadability(mdx)]
for (const issue of findings) console.error(`# ${issue}`)
console.log(buildPolishPrompt(mdx, findings, locale))
```

- [ ] **Step 2: Run the CLI on a generated draft (happy path)**

Run:
```
npx --yes tsx scripts/draft-lesson.ts 01-sample u1-intro en > _s4probe.mdx
npx --yes tsx scripts/review-lesson.ts _s4probe.mdx en
rm _s4probe.mdx
```
Expected: the review prints a polish prompt to stdout containing `--- DRAFT ---` and `Getting started`; stderr shows no `# ` findings (a clean S3 draft passes both `validateDraftMdx` and `lintReadability`). The temp file is removed.

- [ ] **Step 3: Run the CLI on a missing file (non-zero exit)**

Run: `npx --yes tsx scripts/review-lesson.ts does-not-exist.mdx; echo "exit=$?"`
Expected: prints `cannot read file: does-not-exist.mdx` and `exit=1`.

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the new `review` tests and all prior tests (no regression).

- [ ] **Step 5: Typecheck gate**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new module/CLI are not imported by the app).

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/review-lesson.ts
git -c commit.gpgsign=false commit -m "feat(authoring): S4 review-lesson CLI (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

(If `_s4probe.mdx` still exists after Step 2, ensure it was removed — it must NOT be committed. `git status` should show only `scripts/review-lesson.ts`.)

---

## Self-Review

**Spec coverage:**
- `review.ts` `lintReadability` (empty / TODO / long-sentence>25w / vague-practice per phase, per-prose-line) → Task 1. ✅
- `buildPolishPrompt` (bilingual, de-hustled, embeds draft + findings + constraints) → Task 2. ✅
- `scripts/review-lesson.ts` CLI (validateDraftMdx + lintReadability, print findings + polish prompt, non-zero on missing file) → Task 3. ✅
- Applied-exercises fold = vague-practice check → Task 1. ✅
- Clean S3 draft → `[]` (round-trip) → Task 1 first test. ✅
- No live LLM / no dep / deterministic lint + prompt → both functions pure. ✅
- Tests: lint clean/long/TODO/vague (Task 1); prompt embeds/keywords/bilingual/de-hustle-clean (Task 2); CLI happy + missing-file + full suite + tsc + build (Task 3). ✅

**Placeholder scan:** `MAX_SENTENCE_WORDS`/`MIN_PRACTICE_CHARS` are real constants; the injected `TODO:` and `'Do this: go'` are intentional negative-test fixtures. Every code step has full code. ✅

**Type consistency:** `lintReadability(mdx): string[]` (Task 1) and `buildPolishPrompt(mdx, findings, locale): string` (Task 2) match their CLI call sites (Task 3). `validateDraftMdx` reused from `./draft` (S3, `(mdx): string[]`) — the CLI spreads both into one `findings` array. `Locale` from `@/lib/dictionaries`. The clean-draft fixture uses `draftLesson`'s exact `DraftInput` shape. Phase-body regex matches `draftLesson`'s `<Phase type="…">…</Phase>` output. ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-course-authoring-s4.md`.**
