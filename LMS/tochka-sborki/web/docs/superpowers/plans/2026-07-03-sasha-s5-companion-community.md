# S.A.S.H.A S5 — Cross-Course Companion + Academy Synergems Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The standing companion role becomes academy-aware (registry-driven name, role survives course switches, peer-learning principles threaded), and the synergems copy states its already-true academy-wide scope. Final slice — closes the S.A.S.H.A epic.

**Architecture:** New pure builder `academyCompanionLayer(locale, r = REGISTRY)` in `lib/academy/companion.ts` with `PEER_PRINCIPLES` keyed data; threaded into all four branches of `buildCompanionRolePrompt` (mirrors the mentorStateAdaptation threading + binding drift-guard pattern); copy-only reframe in `alumni-client.tsx`.

**Tech Stack:** TypeScript, Vitest (env=node), zero new deps, zero backend changes.

## Global Constraints

- Single app: `LMS/tochka-sborki/web` — dir spelled `tochka-sborki`, NO second "s". Before committing: `git diff --cached --name-only | grep tochka-sborski` must print nothing.
- All git from repo root `C:\telo\Efforts\Ongoing\mc_hub`. Commit directly to main (trunk-based).
- No hardcoded academy name in builders — it comes from `REGISTRY.academy.name`. The `const COURSE = 'Точка Сборки'` in `companion-role-prompt.ts` stays untouched.
- Copy strings must be transcribed CHARACTER-EXACT (— dashes, ё, «» where shown).
- De-hustle: builder output must never match `/скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i`.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `lib/academy/companion.ts` + unit tests (TDD)

**Files:**
- Create: `LMS/tochka-sborki/web/lib/academy/companion.ts`
- Test: `LMS/tochka-sborki/web/lib/academy/companion.test.ts`

**Interfaces:**
- Consumes: `REGISTRY`, `AcademyRegistry` from `./registry` (S1); `Locale` from `@/lib/dictionaries`.
- Produces: `PEER_PRINCIPLES: PeerPrinciple[]`, `academyCompanionLayer(locale: Locale, r?: AcademyRegistry): string` — Task 2 threads it.

- [ ] **Step 1: Write the failing tests** — `LMS/tochka-sborki/web/lib/academy/companion.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { academyCompanionLayer, PEER_PRINCIPLES, type PeerPrinciple } from './companion'
import { REGISTRY, type AcademyRegistry } from './registry'

const BANNED = /скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i

describe('academyCompanionLayer', () => {
  it('is registry-driven (academy name from REGISTRY)', () => {
    expect(academyCompanionLayer('ru')).toContain(REGISTRY.academy.name)
    expect(academyCompanionLayer('en')).toContain(REGISTRY.academy.name)
  })

  it('honors an overridden registry', () => {
    const r = { ...REGISTRY, academy: { ...REGISTRY.academy, name: 'TEST-ACADEMY' } } as AcademyRegistry
    expect(academyCompanionLayer('en', r)).toContain('TEST-ACADEMY')
    expect(academyCompanionLayer('en', r)).not.toContain('S.A.S.H.A')
  })

  it('locales differ and both carry both principles', () => {
    const ru = academyCompanionLayer('ru')
    const en = academyCompanionLayer('en')
    expect(ru).not.toBe(en)
    for (const p of PEER_PRINCIPLES) {
      expect(ru).toContain(p.directive.ru)
      expect(en).toContain(p.directive.en)
    }
  })

  it('has exactly the two named principles', () => {
    expect(PEER_PRINCIPLES.map((p: PeerPrinciple) => p.key)).toEqual(['teach-to-learn', 'contributor-not-consumer'])
  })

  it('is de-hustled in both locales', () => {
    expect(academyCompanionLayer('ru')).not.toMatch(BANNED)
    expect(academyCompanionLayer('en')).not.toMatch(BANNED)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/companion.test.ts`
Expected: FAIL — cannot resolve `./companion`.

- [ ] **Step 3: Create `LMS/tochka-sborki/web/lib/academy/companion.ts`:**

```ts
// web/lib/academy/companion.ts
// Academy layer of the standing companion role (S.A.S.H.A S5): the companion belongs
// to the academy, not to one course — the role and its memory survive course switches.
// Registry-driven (academy name from LMS/registry.json); peer-learning principles as data.
import type { Locale } from '@/lib/dictionaries'
import { REGISTRY, type AcademyRegistry } from './registry'

export interface PeerPrinciple {
  key: 'teach-to-learn' | 'contributor-not-consumer'
  directive: { ru: string; en: string }
}

export const PEER_PRINCIPLES: PeerPrinciple[] = [
  {
    key: 'teach-to-learn',
    directive: {
      ru: 'Регулярно проси меня объяснить выученное своими словами — объяснение другому лучший тест понимания.',
      en: 'Regularly ask me to explain what I learned in my own words — teaching it back is the best test of understanding.',
    },
  },
  {
    key: 'contributor-not-consumer',
    directive: {
      ru: 'Подталкивай меня делиться наработками с сообществом учеников: я вкладчик, не потребитель.',
      en: 'Nudge me to share what I build with the learner community: I am a contributor, not a consumer.',
    },
  },
]

export function academyCompanionLayer(locale: Locale, r: AcademyRegistry = REGISTRY): string {
  const ru = locale !== 'en'
  const name = r.academy.name
  const head = ru
    ? `Этот курс — часть академии ${name}. Твоя роль — спутник академии, не одного курса: если я перейду на другой курс академии, роль и память сохраняются.`
    : `This course is part of the ${name} academy. Your role belongs to the academy, not to a single course: if I move to another academy course, the role and the memory carry over.`
  const lines = PEER_PRINCIPLES.map(p => `- ${ru ? p.directive.ru : p.directive.en}`)
  return [head, ...lines].join('\n')
}
```

- [ ] **Step 4: Run to verify it passes**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/companion.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/lib/academy/companion.ts LMS/tochka-sborki/web/lib/academy/companion.test.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S5 academyCompanionLayer — registry-driven academy frame + peer principles (fb_1319cb1286a9)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Threading into `buildCompanionRolePrompt` + binding drift-guard (TDD)

**Files:**
- Modify: `LMS/tochka-sborki/web/lib/intake/companion-role-prompt.ts`
- Test: `LMS/tochka-sborki/web/lib/academy-companion-threading.test.ts`

**Interfaces:**
- Consumes: `academyCompanionLayer`, `PEER_PRINCIPLES` (Task 1); `buildCompanionRolePrompt` (existing).
- Produces: the standing role prompt now carries the academy layer in all four branches.

- [ ] **Step 1: Write the failing test** — `LMS/tochka-sborki/web/lib/academy-companion-threading.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { academyCompanionLayer, PEER_PRINCIPLES } from './academy/companion'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'intake', 'companion-role-prompt.ts'), 'utf8')

describe('academyCompanionLayer threads into the standing companion role (no drift)', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`guest branch carries the academy layer (${locale})`, () => {
      const out = buildCompanionRolePrompt(null, locale)
      expect(out).toContain(academyCompanionLayer(locale))
      for (const p of PEER_PRINCIPLES) {
        expect(out).toContain(locale === 'en' ? p.directive.en : p.directive.ru)
      }
    })
  }

  it('all four branches call the layer (guest+profile × ru+en)', () => {
    const calls = src.match(/academyCompanionLayer\(locale\)/g) ?? []
    expect(calls.length).toBe(4)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy-companion-threading.test.ts`
Expected: FAIL — prompt does not contain the layer; 0 call sites.

- [ ] **Step 3: Thread the layer.** In `LMS/tochka-sborki/web/lib/intake/companion-role-prompt.ts`:

(a) Add to the imports (after the `mentor-persona` import line):
```ts
import { academyCompanionLayer } from '../academy/companion'
```

(b) In EACH of the four string arrays (guest-ru, guest-en, profile-ru, profile-en) there is the pair:
```ts
          mentorStateAdaptation(locale),
          ``,
```
Directly after that pair (before the closing line of the array), insert:
```ts
          academyCompanionLayer(locale),
          ``,
```
(The profile branches use 8-space indentation — match each array's existing indentation. Result: 4 call sites.)

- [ ] **Step 4: Run to verify it passes**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy-companion-threading.test.ts lib/mentor-state-threading.test.ts lib/intake/companion-role-prompt.test.ts`
Expected: ALL PASS (new drift-guard + the two existing prompt suites stay green).

- [ ] **Step 5: Typecheck gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/lib/intake/companion-role-prompt.ts LMS/tochka-sborki/web/lib/academy-companion-threading.test.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S5 thread academy layer into standing companion role, all branches (fb_1319cb1286a9)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Synergems academy-reframe + drift-guard + full gates (TDD)

**Files:**
- Modify: `LMS/tochka-sborki/web/components/alumni-client.tsx` (copy only, 4 string edits)
- Test: `LMS/tochka-sborki/web/components/alumni-client.test.ts`

**Interfaces:**
- Consumes: nothing new — copy-only change.
- Produces: academy-wide synergems copy; closes the slice.

- [ ] **Step 1: Write the failing test** — `LMS/tochka-sborki/web/components/alumni-client.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'alumni-client.tsx'), 'utf8')

describe('synergems — academy-wide framing (S5)', () => {
  it('no course-scoped synergem copy remains', () => {
    expect(src).not.toMatch(/course synergems|синергемах курса/)
  })

  it('academy framing present in both locales', () => {
    expect(src).toContain('academy synergems')
    expect(src).toContain('синергемах академии')
  })

  it('teach-to-learn principle present in both locales', () => {
    expect(src).toContain('Every learner here is also a teacher')
    expect(src).toContain('Каждый ученик здесь — ещё и учитель')
  })

  it('privacy line survives (email never shown)', () => {
    expect(src).toContain('Your email is never shown')
    expect(src).toContain('Твой email никогда не показывается')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/alumni-client.test.ts`
Expected: FAIL — course-scoped copy still present; academy strings absent.

- [ ] **Step 3: Edit the copy** in `LMS/tochka-sborki/web/components/alumni-client.tsx` (the inline `t` object; 4 edits, nothing else):

1. en `optinLabel`: `'List me in the course synergems'` → `'List me in the academy synergems'`
2. en `sub`: append after `Your email is never shown.` (inside the same string): ` Every learner here is also a teacher — sharing what you learn is how the synergem grows.`
3. ru `optinLabel`: `'Показывать меня в синергемах курса'` → `'Показывать меня в синергемах академии'`
4. ru `sub`: append after `Твой email никогда не показывается.` (inside the same string): ` Каждый ученик здесь — ещё и учитель: делясь тем, что осваиваешь, ты растишь синергему.`

- [ ] **Step 4: Run to verify it passes**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/alumni-client.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Full gates**

Run (from `LMS/tochka-sborki/web`): `npx vitest run` — expected: 102 test files pass (99 + 3 new).
Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0.
Run (from `LMS/tochka-sborki/web`): `npm run build` — expected: success.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/components/alumni-client.tsx LMS/tochka-sborki/web/components/alumni-client.test.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S5 synergems academy-wide reframe + teach-to-learn principle (fb_1319cb1286a9)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
