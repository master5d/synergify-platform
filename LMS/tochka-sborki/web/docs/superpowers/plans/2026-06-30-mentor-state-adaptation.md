# AI-Mentor State-Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the learn-with-AI mentor to read the learner's state and adapt (3 T's + four challenging-learner archetypes, reframed for 1:1 text mentoring), as a single source of truth that flows into both prompt builders without drift.

**Architecture:** Add a keyed-data export `mentorStateAdaptation(locale)` to the existing persona SoT `lib/mentor-persona.ts` (built from a typed `LEARNER_STATES` array), then thread it beside the existing `mentorFirmness` inclusions in `buildLearnPrompt` and `buildCompanionRolePrompt`. A binding drift-guard test asserts both builder outputs contain the adaptation text.

**Tech Stack:** TypeScript, Vitest (`environment: node`), Next.js 16. Pure string-assembly modules, no I/O, no new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths below are relative to it; run commands from there.
- `lms_target: engine`.
- Bilingual content uses `Bi = { ru: string; en: string }`. `Locale = 'ru' | 'en'` (from `./dictionaries`).
- Authenticity (warm-firm, de-guru, no manipulation): cynical → evidence not persuasion; disengaged → smaller step not guilt; quiet → invitation not pressure; over-eager → redirect to their own thinking not hand over answers. Co-thinking, not do-it-for-me; decision/voice stay with the learner.
- Additive only: do NOT change `mentorFirmness` / `mentorFirmnessCompact` or any existing prompt text. Do NOT touch `buildBootstrapDeepLink` / `mentorFirmnessCompact` (space-capped, out of scope).
- No new dependencies.
- Test command: full suite `npm test` (= `vitest run`); single file `npx vitest run <path>`.
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git runs from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT create a branch).

---

### Task 1: `mentorStateAdaptation` + `LEARNER_STATES` in `lib/mentor-persona.ts`

**Files:**
- Modify: `lib/mentor-persona.ts` (append after the existing `mentorFirmnessCompact` function, line ~20)
- Test: `lib/mentor-persona.test.ts` (extend the existing file)

**Interfaces:**
- Consumes: `Locale` from `./dictionaries` (already imported in the file).
- Produces:
  - `export const LEARNER_STATE_KEYS = ['over_eager', 'cynical', 'disengaged', 'quiet'] as const`
  - `export function mentorStateAdaptation(locale: Locale): string`
  - (module-local, not exported: `interface Bi`, `interface StatePlay`, `const LEARNER_STATES: StatePlay[]`)

- [ ] **Step 1: Write the failing tests**

Append these blocks to the END of `lib/mentor-persona.test.ts` (keep the existing `describe` blocks intact). Also add `mentorStateAdaptation, LEARNER_STATE_KEYS` to the existing import on line 2 so it reads:
`import { mentorFirmness, mentorFirmnessCompact, mentorStateAdaptation, LEARNER_STATE_KEYS } from './mentor-persona'`

```ts
describe('mentorStateAdaptation', () => {
  it('returns a non-empty, distinct string per locale', () => {
    expect(mentorStateAdaptation('ru').length).toBeGreaterThan(0)
    expect(mentorStateAdaptation('en').length).toBeGreaterThan(0)
    expect(mentorStateAdaptation('ru')).not.toBe(mentorStateAdaptation('en'))
  })

  it('covers the 3 T's (tone/tempo/breath) in both locales', () => {
    const ru = mentorStateAdaptation('ru')
    expect(ru).toMatch(/тёплым и твёрдым/) // tone
    expect(ru).toMatch(/Темп/)             // tempo
    expect(ru).toMatch(/Пауза/)            // take a breath
    const en = mentorStateAdaptation('en')
    expect(en).toMatch(/warm and firm/)    // tone
    expect(en).toMatch(/Tempo/)            // tempo
    expect(en).toMatch(/Take a breath/)    // take a breath
  })

  it('covers each archetype tactic in both locales', () => {
    const ru = mentorStateAdaptation('ru')
    expect(ru).toMatch(/прежде чем/) // over_eager: ask before I tell
    expect(ru).toMatch(/конкретным/) // cynical: concrete example
    expect(ru).toMatch(/без вины/)   // disengaged: no guilt
    expect(ru).toMatch(/вытяну/)     // quiet: draw out
    const en = mentorStateAdaptation('en')
    expect(en).toMatch(/before I tell/) // over_eager
    expect(en).toMatch(/concrete/)      // cynical
    expect(en).toMatch(/no guilt/)      // disengaged
    expect(en).toMatch(/draw you out/)  // quiet
  })

  it('stays warm-firm, never shaming (no guilt/laziness markers)', () => {
    for (const l of ['ru', 'en'] as const) {
      const s = mentorStateAdaptation(l)
      expect(s).not.toMatch(/ленив|lazy|стыд|shame/i)
    }
  })
})

describe('LEARNER_STATES data integrity (via LEARNER_STATE_KEYS)', () => {
  it('exposes exactly the four archetype keys in order', () => {
    expect(LEARNER_STATE_KEYS).toEqual(['over_eager', 'cynical', 'disengaged', 'quiet'])
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/mentor-persona.test.ts`
Expected: FAIL — `mentorStateAdaptation` / `LEARNER_STATE_KEYS` are not exported yet.

- [ ] **Step 3: Implement**

Append the following to the END of `lib/mentor-persona.ts` (after the closing `}` of `mentorFirmnessCompact`):

```ts

// --- Learner-state adaptation (3 T's + challenging-learner archetypes, reframed
// from Google's Facilitation Bootcamp deck for 1:1 text mentoring). Lives here so
// the adaptation can't drift between the session and memory prompt surfaces.

interface Bi { ru: string; en: string }
interface StatePlay { key: string; cue: Bi; tactic: Bi }

export const LEARNER_STATE_KEYS = ['over_eager', 'cynical', 'disengaged', 'quiet'] as const

const LEARNER_STATES: StatePlay[] = [
  {
    key: 'over_eager',
    cue: { ru: 'ты хочешь, чтобы я выдал ответ за тебя', en: 'you want me to hand the answer over' },
    tactic: { ru: 'верну тебя к твоему мышлению — спрошу, прежде чем подсказывать', en: 'I redirect you to your own thinking — I ask before I tell' },
  },
  {
    key: 'cynical',
    cue: { ru: 'ты говоришь «это у меня не сработает»', en: 'you say it won\'t work for you' },
    tactic: { ru: 'отвечу конкретным примером и маленьким шагом, а не уговорами', en: 'I answer with a concrete example and a small win, not persuasion' },
  },
  {
    key: 'disengaged',
    cue: { ru: 'ты уплываешь, энергии мало', en: 'you\'re drifting, low on energy' },
    tactic: { ru: 'уменьшу шаг и свяжу его с твоей же целью; мягко спрошу, без вины', en: 'I shrink the step and tie it to your own goal; a gentle check-in, no guilt' },
  },
  {
    key: 'quiet',
    cue: { ru: 'ты мало делишься', en: 'you share little' },
    tactic: { ru: 'вытяну одним конкретным необременительным вопросом — не отвечу за тебя', en: 'I draw you out with one specific, low-pressure question — I won\'t answer for you' },
  },
]

/** Warm-firm guidance on adapting to the learner's state (3 T's + four archetypes). */
export function mentorStateAdaptation(locale: Locale): string {
  if (locale === 'en') {
    const states = LEARNER_STATES.map(s => `when ${s.cue.en} — ${s.tactic.en}`).join('; ')
    return `Adapt to my state while staying warm and firm (tone). Tempo: keep my pace — one step at a time, don't dump everything at once. Take a breath: leave space — let me think, don't fill the silence for me. Read what state I'm in and respond like this: ${states}.`
  }
  const states = LEARNER_STATES.map(s => `если ${s.cue.ru} — ${s.tactic.ru}`).join('; ')
  return `Подстраивайся под моё состояние, оставаясь тёплым и твёрдым (тон). Темп: держи мой темп — один шаг за раз, не вываливай всё сразу. Пауза: оставляй паузу — дай мне подумать, не заполняй тишину за меня. Читай, в каком я состоянии, и реагируй так: ${states}.`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/mentor-persona.test.ts`
Expected: PASS (all existing firmness tests + the new state-adaptation + data-integrity tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/mentor-persona.ts LMS/tochka-sborki/web/lib/mentor-persona.test.ts
git -c commit.gpgsign=false commit -m "feat(mentor): learner-state adaptation in persona SoT (fb_c3471241279e)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Thread `mentorStateAdaptation` into both prompt builders + binding drift-guard

**Files:**
- Modify: `lib/learn-prompt.ts` (import line 9; the `ru` and `en` `lines` arrays in `buildLearnPrompt`)
- Modify: `lib/intake/companion-role-prompt.ts` (import line 7; all four branches of `buildCompanionRolePrompt`)
- Test: `lib/mentor-state-threading.test.ts` (new)

**Interfaces:**
- Consumes (from Task 1): `mentorStateAdaptation` from `./mentor-persona` (in `learn-prompt.ts`) and from `../mentor-persona` (in `intake/companion-role-prompt.ts`).
- Produces: no new exports; both builders' outputs now contain `mentorStateAdaptation(locale)` verbatim.

- [ ] **Step 1: Write the failing test**

Create `lib/mentor-state-threading.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildLearnPrompt } from './learn-prompt'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { mentorStateAdaptation } from './mentor-persona'

const learnInput = (locale: 'ru' | 'en') => ({
  locale, moduleTitle: 'Модуль', unitIndex: 0, totalUnits: 3,
})

describe('mentorStateAdaptation threads into both prompt surfaces (no drift)', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`buildLearnPrompt includes the adaptation text (${locale})`, () => {
      expect(buildLearnPrompt(learnInput(locale))).toContain(mentorStateAdaptation(locale))
    })
    it(`buildCompanionRolePrompt (no profile) includes the adaptation text (${locale})`, () => {
      expect(buildCompanionRolePrompt(null, locale)).toContain(mentorStateAdaptation(locale))
    })
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/mentor-state-threading.test.ts`
Expected: FAIL — neither builder output contains the adaptation text yet.

- [ ] **Step 3: Add the import in `lib/learn-prompt.ts`**

Replace line 9:

```ts
import { mentorFirmness, mentorFirmnessCompact } from './mentor-persona'
```

with:

```ts
import { mentorFirmness, mentorFirmnessCompact, mentorStateAdaptation } from './mentor-persona'
```

- [ ] **Step 4: Thread into `buildLearnPrompt` (both branches)**

4a. In the `ru` branch (inside `if (ru) {`, 6-space indent), replace:

```ts
      mentorFirmness(i.locale),
      '',
      'Контекст: я прохожу курс «Точка Сборки»
```

with:

```ts
      mentorFirmness(i.locale),
      '',
      mentorStateAdaptation(i.locale),
      '',
      'Контекст: я прохожу курс «Точка Сборки»
```

(Leave the rest of that `'Контекст: …'` line exactly as it is — only the lines shown above change.)

4b. In the `en` branch (the top-level `const lines = [`, 4-space indent), replace:

```ts
    mentorFirmness(i.locale),
    '',
    'Context: I am taking the "Точка Сборки" course
```

with:

```ts
    mentorFirmness(i.locale),
    '',
    mentorStateAdaptation(i.locale),
    '',
    'Context: I am taking the "Точка Сборки" course
```

(Only the shown lines change; the rest of the `'Context: …'` line stays as-is.)

- [ ] **Step 5: Add the import in `lib/intake/companion-role-prompt.ts`**

Replace line 7:

```ts
import { mentorFirmness } from '../mentor-persona'
```

with:

```ts
import { mentorFirmness, mentorStateAdaptation } from '../mentor-persona'
```

- [ ] **Step 6: Thread into all four `buildCompanionRolePrompt` branches**

6a. No-profile **ru** branch — replace:

```ts
          mentorFirmness(locale),
          ``,
          `Начни с одного вопроса: над чем я сейчас работаю.`,
```

with:

```ts
          mentorFirmness(locale),
          ``,
          mentorStateAdaptation(locale),
          ``,
          `Начни с одного вопроса: над чем я сейчас работаю.`,
```

6b. No-profile **en** branch — replace:

```ts
          mentorFirmness(locale),
          ``,
          `Start with one question: what I'm working on right now.`,
```

with:

```ts
          mentorFirmness(locale),
          ``,
          mentorStateAdaptation(locale),
          ``,
          `Start with one question: what I'm working on right now.`,
```

6c. With-profile **ru** branch — replace:

```ts
        mentorFirmness(locale),
        ``,
        `Когда я приношу урок или задачу — веди по циклу: намерение → системное мышление → дизайн → шаг → todo. Держи устав между сессиями; начни с вопроса, над чем я сейчас работаю.`,
```

with:

```ts
        mentorFirmness(locale),
        ``,
        mentorStateAdaptation(locale),
        ``,
        `Когда я приношу урок или задачу — веди по циклу: намерение → системное мышление → дизайн → шаг → todo. Держи устав между сессиями; начни с вопроса, над чем я сейчас работаю.`,
```

6d. With-profile **en** branch — replace:

```ts
        mentorFirmness(locale),
        ``,
        `When I bring a lesson or task, lead me through the loop: intent → systems thinking → design → step → todo. Keep the charter across sessions; start by asking what I'm working on now.`,
```

with:

```ts
        mentorFirmness(locale),
        ``,
        mentorStateAdaptation(locale),
        ``,
        `When I bring a lesson or task, lead me through the loop: intent → systems thinking → design → step → todo. Keep the charter across sessions; start by asking what I'm working on now.`,
```

- [ ] **Step 7: Run the drift-guard test to verify it passes**

Run: `npx vitest run lib/mentor-state-threading.test.ts`
Expected: PASS (4 tests — both builders × both locales).

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including Task 1's persona tests, the new threading test, and all prior tests (no regression).

- [ ] **Step 9: Build-validate**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 10: Commit**

```bash
git add LMS/tochka-sborki/web/lib/learn-prompt.ts LMS/tochka-sborki/web/lib/intake/companion-role-prompt.ts LMS/tochka-sborki/web/lib/mentor-state-threading.test.ts
git -c commit.gpgsign=false commit -m "feat(mentor): thread state-adaptation into both prompt builders (fb_c3471241279e)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `mentorStateAdaptation` keyed-data export with 3 T's + 4 archetypes reframed for 1:1 → Task 1. ✅
- Single-source-of-truth in `lib/mentor-persona.ts` → Task 1. ✅
- Thread into `buildLearnPrompt` (ru+en) and `buildCompanionRolePrompt` (4 branches), NOT the compact deep-link → Task 2 steps 4, 6. ✅
- Tests: non-empty/distinct, 3-T markers, per-archetype tactic markers, warm-firm preserved, data integrity → Task 1; binding cross-surface drift-guard → Task 2. ✅
- Authenticity (evidence/smaller-step/invitation/redirect; no shaming) → encoded in `LEARNER_STATES` tactics + the "never shaming" test. ✅

**Placeholder scan:** No TBD/TODO/vague steps. Every code step shows full code with exact before/after blocks. ✅

**Type consistency:** `mentorStateAdaptation(locale: Locale): string` and `LEARNER_STATE_KEYS` are defined in Task 1 and consumed identically in Task 2's imports and test. `Bi`/`StatePlay` are module-local to `mentor-persona.ts`. The test's `learnInput` supplies exactly the required `LearnPromptInput` fields (`locale`, `moduleTitle`, `unitIndex`, `totalUnits`; the rest are optional). ✅

**Note on anchors:** The four `companion-role-prompt.ts` blocks each include their distinct trailing line, so the four `mentorFirmness(locale),`/empty/`trailing` Edits are unique despite identical leading lines. If any Edit fails to match, Read the file to find the true text and preserve the intent (insert `mentorStateAdaptation(locale),` + empty line after the `mentorFirmness` line in that branch).

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-mentor-state-adaptation.md`.**
