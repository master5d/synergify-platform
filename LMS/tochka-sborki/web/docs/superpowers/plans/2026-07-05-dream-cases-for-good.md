# AI-for-good Dream-Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `for-good` showcase category + 4 AI-for-good dream-cases (fb_650d16d2) to the live possibility-menu, with a de-hustle lint over ALL showcase copy.

**Architecture:** Content-only slice inside the existing engine — extend `CategoryKey`/`CATEGORIES`/`DREAM_CASES` in `lib/course/showcase.ts`; the showcase tab appears automatically (categories are derived from used keys). Test extension adds the `for-good` assertions and closes an existing gap: `lintDehustle []` over every dream+real case, both locales.

**Tech Stack:** Next.js (App Router), TypeScript, Vitest.

## Global Constraints

- Content only: NO component changes, NO engine changes beyond the union/data additions.
- De-hustle: `lintDehustle` (from `@/lib/authoring/dehustle`) returns `[]` for the title+blurb+tag of EVERY dream and real case, both locales.
- NO public-shaming framing («доска позора» rejected) — `pattern-shield` is recognition for the person themselves.
- REAL_CASES untouched. The existing 10 dream-cases untouched.
- Sole-prop, never nonprofit framing.
- Web gate (from `LMS/tochka-sborki/web`): `npx tsc --noEmit && npx vitest run && npx next build`.
- Trunk-based `main`, one commit.
- **Ops:** bash-git hangs this session — run all `git` via the PowerShell tool. All paths relative to `LMS/tochka-sborki/web`.

---

### Task 1: `for-good` category + 4 dream-cases + lint test

**Files:**
- Modify: `lib/course/showcase.ts` (three point edits: `CategoryKey` union ~line 6-7, `CATEGORIES` ~line 16-23, end of `DREAM_CASES` ~line 125)
- Test: `lib/course/showcase.test.ts` (append one describe block)

**Interfaces:**
- Consumes: existing `getShowcase(locale)`, `lintDehustle(text: string): string[]` from `@/lib/authoring/dehustle`.
- Produces: nothing new for other tasks — `CategoryKey` gains the `'for-good'` member; `getShowcase().dream.cases` gains 4 entries with `category: 'for-good'`.

- [ ] **Step 1: Write the failing test**

Append to `lib/course/showcase.test.ts` (top of file already imports `getShowcase`; add `lintDehustle` to imports):

```ts
import { lintDehustle } from '@/lib/authoring/dehustle'
```

Append at the end of the file:

```ts
describe('for-good dream cases (fb_650d16d2)', () => {
  for (const loc of ['ru', 'en'] as const) {
    it(`for-good tab appears in categories (${loc})`, () => {
      const s = getShowcase(loc)
      expect(s.categories.some(c => c.key === 'for-good')).toBe(true)
    })
    it(`>=4 for-good dream cases, fully populated (${loc})`, () => {
      const s = getShowcase(loc)
      const fg = s.dream.cases.filter(c => c.category === 'for-good')
      expect(fg.length).toBeGreaterThanOrEqual(4)
      for (const c of fg) {
        expect(c.title.length).toBeGreaterThan(0)
        expect(c.blurb.length).toBeGreaterThan(0)
        expect(c.tag.length).toBeGreaterThan(0)
        expect(c.icon.length).toBeGreaterThan(0)
      }
    })
    it(`ALL showcase copy is de-hustle clean (${loc})`, () => {
      const s = getShowcase(loc)
      const strings = [
        ...s.dream.cases.flatMap(c => [c.title, c.blurb, c.tag]),
        ...s.real.cases.flatMap(c => [c.title, c.blurb, c.tag, c.result]),
      ]
      for (const str of strings) expect(lintDehustle(str)).toEqual([])
    })
  }
  it('for-good ids are the 4 canonical ones', () => {
    const ids = getShowcase('ru').dream.cases.filter(c => c.category === 'for-good').map(c => c.id)
    expect(ids).toEqual(['eco', 'rescue', 'pattern-shield', 'safe-path'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/course/showcase.test.ts`
Expected: FAIL — TypeScript/`for-good` filter finds 0 cases (`for-good tab appears` and `>=4 for-good` tests fail; `tsc` would also reject `'for-good'` as not in `CategoryKey` — the vitest transform may or may not surface the type error, the behavioral failures are the gate). The `ALL showcase copy` test over EXISTING copy should PASS at this point — if it FAILS, an existing string trips the linter: report it, do not silently edit old copy.

- [ ] **Step 3: Implement — three point edits in `lib/course/showcase.ts`**

Edit 1 — extend the union (current lines 6–7):

```ts
export type CategoryKey =
  | 'co-thinking' | 'launch' | 'flow' | 'knowledge' | 'dictation' | 'platform' | 'for-good'
```

Edit 2 — append to `CATEGORIES` (after the `platform` line):

```ts
  { key: 'for-good',    label: { ru: 'Во благо',      en: 'For good' } },
```

Edit 3 — append these 4 entries at the END of the `DREAM_CASES` array (after the `conveyor` entry):

```ts
  { id: 'eco', icon: '🌱',
    title: { ru: 'Эко-дозор своего места', en: 'An eco-watch for your place' },
    blurb: { ru: 'Собери данные о среде вокруг — воздух, вода, свалки — в живую картину, которая двигает соседей к действию.', en: 'Gather data about your surroundings — air, water, dumping — into a living picture that moves your neighbours to act.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'rescue', icon: '🐾',
    title: { ru: 'Сеть спасения животных', en: 'An animal-rescue network' },
    blurb: { ru: 'В морозы координируй волонтёров: карта точек, быстрые оповещения, никто не потерян.', en: 'In a cold snap, coordinate volunteers: a map of spots, fast alerts, no one lost.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'pattern-shield', icon: '🛡️',
    title: { ru: 'Увидеть паттерн — назвать его', en: 'See the pattern — name it' },
    blurb: { ru: 'Помощник, который помогает человеку распознать разрушительный паттерн в отношениях и увидеть его со стороны.', en: 'A helper that lets a person recognize a destructive pattern in a relationship and see it from the outside.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'safe-path', icon: '🕊️',
    title: { ru: 'Навигатор помощи', en: 'A help navigator' },
    blurb: { ru: 'Для того, кто в трудной ситуации: куда обратиться рядом с домом, шаг за шагом, без осуждения.', en: 'For someone in a hard situation: where to turn near home, step by step, without judgment.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/course/showcase.test.ts`
Expected: PASS — all tests green, including the new describe block (7 new tests).

- [ ] **Step 5: Type-check + full suite + build**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`
Expected: tsc clean; whole suite green; build succeeds.

- [ ] **Step 6: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add LMS/tochka-sborki/web/lib/course/showcase.ts LMS/tochka-sborki/web/lib/course/showcase.test.ts
git commit -m "feat: for-good showcase category + 4 AI-for-good dream-cases (fb_650d16d2)"
```

---

## Self-Review

**1. Spec coverage:** category `for-good` + label ✅ Edit 1-2 · 4 cases with exact spec copy ✅ Edit 3 · tab-appears test ✅ · ≥4 populated test ✅ · lintDehustle over ALL dream+real copy both locales ✅ (includes `result` for real cases — spec says all showcase copy) · REAL_CASES/existing dreams untouched ✅ · no-shaming framing ✅ (pattern-shield copy is self-recognition) · web gate ✅ Step 5.

**2. Placeholder scan:** none — all copy strings final from spec.

**3. Type consistency:** `'for-good'` used identically in union, CATEGORIES, 4 cases, and tests. `lintDehustle` import path matches the project's existing usage (`@/lib/authoring/dehustle`).

One deliberate behavior: if an EXISTING showcase string fails the new lint (Step 2 note), the implementer reports instead of silently editing old copy — that's an owner-visible finding.
