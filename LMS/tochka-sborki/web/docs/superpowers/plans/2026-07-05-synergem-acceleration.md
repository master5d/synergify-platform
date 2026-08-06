# Синергема acceleration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a sovereign self-run progression ladder for a синергема — a render-only 5-stage growth map on the live `/alumni` surface (fb_daa79c).

**Architecture:** Engine + keyed bilingual data (`lib/synergem-acceleration.ts`, mirroring `lib/igi.ts`) feeding a render-only server component (`components/synergem-acceleration.tsx`, mirroring `components/igi-ritual.tsx`), wired into `components/alumni-client.tsx` after the existing group-mentor card. No backend, no hosted LLM, no membership state.

**Tech Stack:** Next.js (App Router), TypeScript, React (server component), Vitest.

## Global Constraints

- Engine + keyed-data: `Bi { ru; en }` + a `resolveAcceleration(locale)` resolver, mirroring `lib/igi.ts` / `lib/course/certificate.ts`.
- `Bi` imported from `@/lib/course`; `Locale` from `@/lib/dictionaries`. No new dependencies.
- Sovereign: no hosted LLM, no backend, no membership state — a formed cluster self-runs it.
- De-hustle: `lintDehustle` (from `@/lib/authoring/dehustle`) returns `[]` over every copy string, both locales. No financial-product / scarcity / hustle framing; resources are self-sourced by the group.
- Anti-dependency: the ladder ends in autonomy/graduation.
- Render-only card: NO `'use client'`, NO clipboard/copy button (unlike the mentor card).
- Live surface: renders on `/alumni` beside ИГИ + mentor.
- No-Mermaid · sole-prop (never nonprofit) · trunk-based `main`, one commit per task.
- Web gate (run from `LMS/tochka-sborki/web`): `npx tsc --noEmit && npx vitest run && npx next build`.
- **Ops:** bash-git hangs this session — run all `git` via the PowerShell tool. All paths below are relative to `LMS/tochka-sborki/web`.

---

### Task 1: Engine + keyed-data (`lib/synergem-acceleration.ts`)

**Files:**
- Create: `lib/synergem-acceleration.ts`
- Test: `lib/synergem-acceleration.test.ts`

**Interfaces:**
- Consumes: `Bi` from `@/lib/course`, `Locale` from `@/lib/dictionaries`, `lintDehustle` from `@/lib/authoring/dehustle` (test only).
- Produces (Task 2 relies on these):
  - `resolveAcceleration(locale: Locale, source?: Acceleration): ResolvedAcceleration`
  - `interface ResolvedAcceleration { intro: string; stages: ResolvedAccelStage[] }`
  - `interface ResolvedAccelStage { key: string; name: string; milestone: string; readiness: string; move: string }`

- [ ] **Step 1: Write the failing test**

Create `lib/synergem-acceleration.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { ACCEL_STAGES, resolveAcceleration } from './synergem-acceleration'
import { lintDehustle } from '@/lib/authoring/dehustle'

const KEYS = ['form', 'rhythm', 'output', 'outward', 'autonomous']

describe('synergem-acceleration', () => {
  it('has exactly the 5 canonical stages in order with unique keys', () => {
    expect(ACCEL_STAGES.map(s => s.key)).toEqual(KEYS)
    expect(new Set(ACCEL_STAGES.map(s => s.key)).size).toBe(5)
  })

  it('resolves ru with non-empty intro and 5 fully-populated stages', () => {
    const a = resolveAcceleration('ru')
    expect(a.intro.length).toBeGreaterThan(0)
    expect(a.stages).toHaveLength(5)
    for (const s of a.stages) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.milestone.length).toBeGreaterThan(0)
      expect(s.readiness.length).toBeGreaterThan(0)
      expect(s.move.length).toBeGreaterThan(0)
    }
  })

  it('resolves en with non-empty intro and 5 fully-populated stages', () => {
    const a = resolveAcceleration('en')
    expect(a.intro.length).toBeGreaterThan(0)
    expect(a.stages).toHaveLength(5)
    for (const s of a.stages) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.milestone.length).toBeGreaterThan(0)
      expect(s.readiness.length).toBeGreaterThan(0)
      expect(s.move.length).toBeGreaterThan(0)
    }
  })

  it('ru differs from en for intro and every stage field (real translation)', () => {
    const ru = resolveAcceleration('ru')
    const en = resolveAcceleration('en')
    expect(ru.intro).not.toBe(en.intro)
    ru.stages.forEach((s, i) => {
      expect(s.name).not.toBe(en.stages[i].name)
      expect(s.milestone).not.toBe(en.stages[i].milestone)
      expect(s.readiness).not.toBe(en.stages[i].readiness)
      expect(s.move).not.toBe(en.stages[i].move)
    })
  })

  it('is de-hustle clean across intro and every stage field, both locales', () => {
    for (const loc of ['ru', 'en'] as const) {
      const a = resolveAcceleration(loc)
      const strings = [a.intro, ...a.stages.flatMap(s => [s.name, s.milestone, s.readiness, s.move])]
      for (const str of strings) {
        expect(lintDehustle(str)).toEqual([])
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/synergem-acceleration.test.ts`
Expected: FAIL — cannot resolve `./synergem-acceleration` (module does not exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `lib/synergem-acceleration.ts`:

```ts
// lib/synergem-acceleration.ts
// Синергема acceleration (fb_daa79c). A sovereign self-run progression ladder: the stages a
// синергема grows through, from gathering to autonomy. Engine + keyed bilingual data (mirror
// lib/igi.ts); the presentational card is components/synergem-acceleration.tsx. No backend, no
// hosted LLM, no membership state — a formed cluster reads it together and self-navigates.
// Resources are self-sourced by the group, never owner-dispensed. Every string is de-hustle clean
// (lib/synergem-acceleration.test.ts asserts lintDehustle []). The ladder ends in autonomy —
// graduation, not retention — echoing lib/mentor-persona.ts.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface AccelStage {
  key: string
  name: Bi       // stage name
  milestone: Bi  // what defines this stage — where the cluster is
  readiness: Bi  // "ready for the next stage when…" self-check
  move: Bi       // one concrete move to grow through the stage
}

export interface Acceleration {
  intro: Bi
  stages: AccelStage[]
}

export const ACCELERATION: Acceleration = {
  intro: {
    ru: 'Лестница роста синергемы: путь от «собрались» до автономии. Читайте вместе, сверяйте, где вы сейчас, и берите один шаг. Ведёте себя сами — ресурсы находите сами.',
    en: 'A synergem growth ladder: the path from gathering to autonomy. Read it together, check where you are now, and take one move. You lead yourselves — you find the resources yourselves.',
  },
  stages: [
    {
      key: 'form',
      name: { ru: 'Собрались', en: 'Gathered' },
      milestone: {
        ru: 'Синергема существует: несколько соучеников открылись вокруг общего усилия.',
        en: 'The synergem exists: a few fellow learners have opened up around a shared effort.',
      },
      readiness: {
        ru: 'Готовы к следующей стадии, когда каждый может назвать, зачем он здесь и вокруг чего вы собрались.',
        en: 'Ready for the next stage when each of you can name why they are here and what you gathered around.',
      },
      move: {
        ru: 'Назовите вслух по кругу общее усилие — одной фразой, с которой согласны все.',
        en: 'Say the shared effort aloud around the circle — in one phrase everyone agrees on.',
      },
    },
    {
      key: 'rhythm',
      name: { ru: 'Ритм', en: 'Rhythm' },
      milestone: {
        ru: 'У группы есть надёжный ритм встреч и ведение, что переходит по кругу.',
        en: 'The group has a dependable meeting cadence and a lead that passes around the circle.',
      },
      readiness: {
        ru: 'Готовы, когда встречи держатся сами — никому не нужно всех догонять.',
        en: 'Ready when the meetings hold themselves — no one has to chase everyone.',
      },
      move: {
        ru: 'Договоритесь об одном повторяющемся времени встречи и о том, кто ведёт следующую.',
        en: 'Agree on one recurring meeting time and on who leads the next one.',
      },
    },
    {
      key: 'output',
      name: { ru: 'Первый результат', en: 'First output' },
      milestone: {
        ru: 'Синергема сделала один общий результат — пусть маленький, — которого никто не сделал бы в одиночку.',
        en: 'The synergem has made one shared result — however small — that none of you would have made alone.',
      },
      readiness: {
        ru: 'Готовы, когда есть конкретная вещь, на которую вы показываете вместе.',
        en: 'Ready when there is a concrete thing you point to together.',
      },
      move: {
        ru: 'Выберите одну маленькую вещь, что вы доведёте до конца вместе к следующей встрече.',
        en: 'Choose one small thing you will finish together by the next meeting.',
      },
    },
    {
      key: 'outward',
      name: { ru: 'Наружу', en: 'Outward' },
      milestone: {
        ru: 'Синергема поворачивается вовне: служит, ведёт клиентов сообща, учит тому, что освоила. Ресурсы группа находит и делит сама.',
        en: 'The synergem turns outward: it serves, finds clients together, teaches what it learned. The group finds and shares resources itself.',
      },
      readiness: {
        ru: 'Готовы, когда ценность течёт из кластера наружу, а не только внутри него.',
        en: 'Ready when value flows out of the cluster, not only within it.',
      },
      move: {
        ru: 'Найдите одного человека вне группы, которому ваш общий результат уже полезен, и предложите его.',
        en: 'Find one person outside the group your shared result already helps, and offer it.',
      },
    },
    {
      key: 'autonomous',
      name: { ru: 'Автономность', en: 'Autonomous' },
      milestone: {
        ru: 'Синергема держит себя сама и больше не нуждается в академии, чтобы существовать.',
        en: 'The synergem sustains itself and no longer needs the academy to exist.',
      },
      readiness: {
        ru: 'Вы на этой стадии, когда кластер продолжил бы жить, исчезни академия завтра.',
        en: 'You are at this stage when the cluster would keep going if the academy vanished tomorrow.',
      },
      move: {
        ru: 'Решите вместе, что делает синергему живой дальше — и запишите это своими словами.',
        en: 'Decide together what keeps the synergem alive from here — and write it in your own words.',
      },
    },
  ],
}

export interface ResolvedAccelStage {
  key: string
  name: string
  milestone: string
  readiness: string
  move: string
}
export interface ResolvedAcceleration {
  intro: string
  stages: ResolvedAccelStage[]
}

export const ACCEL_STAGES = ACCELERATION.stages

export function resolveAcceleration(locale: Locale, source: Acceleration = ACCELERATION): ResolvedAcceleration {
  return {
    intro: source.intro[locale],
    stages: source.stages.map((s) => ({
      key: s.key,
      name: s.name[locale],
      milestone: s.milestone[locale],
      readiness: s.readiness[locale],
      move: s.move[locale],
    })),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/synergem-acceleration.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Type-check**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add LMS/tochka-sborki/web/lib/synergem-acceleration.ts LMS/tochka-sborki/web/lib/synergem-acceleration.test.ts
git commit -m "feat: synergem acceleration engine + keyed-data (fb_daa79c)"
```

---

### Task 2: Render-only card + wiring (`components/synergem-acceleration.tsx`)

**Files:**
- Create: `components/synergem-acceleration.tsx`
- Modify: `components/alumni-client.tsx` (one import + one element after `<SynergemMentor locale={locale} />`)

**Interfaces:**
- Consumes: `resolveAcceleration`, `ResolvedAcceleration` from `@/lib/synergem-acceleration` (Task 1); `Locale` from `@/lib/dictionaries`.
- Produces: `SynergemAcceleration({ locale }: { locale: Locale })` React component.

- [ ] **Step 1: Create the card component**

Create `components/synergem-acceleration.tsx` (render-only server component — mirrors `components/igi-ritual.tsx` chrome; NO `'use client'`, NO clipboard):

```tsx
import type { Locale } from '@/lib/dictionaries'
import { resolveAcceleration } from '@/lib/synergem-acceleration'

export function SynergemAcceleration({ locale }: { locale: Locale }) {
  const a = resolveAcceleration(locale)
  const title = locale === 'en' ? 'Growth ladder' : 'Лестница роста'
  const readyLabel = locale === 'en' ? 'Ready when' : 'Готовы, когда'
  const moveLabel = locale === 'en' ? 'Move' : 'Шаг'
  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h2 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{a.intro}</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1rem' }}>
        {a.stages.map((s, i) => (
          <li key={s.key} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '.8rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}>
              <span aria-hidden="true">⬡ </span>{i + 1}. {s.name}
            </div>
            <div style={{ fontSize: '.9rem', color: 'var(--text-primary)', marginTop: '.15rem' }}>{s.milestone}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.35rem' }}>
              <span style={{ fontWeight: 600 }}>{readyLabel}:</span> {s.readiness}
            </div>
            <div style={{ fontSize: '.88rem', color: 'var(--text-primary)', marginTop: '.35rem', borderLeft: '3px solid var(--text-accent)', paddingLeft: '.7rem' }}>
              <span style={{ fontWeight: 600 }}>{moveLabel}:</span> {s.move}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 2: Wire into `alumni-client.tsx` — add the import**

In `components/alumni-client.tsx`, add the import beside the existing `SynergemMentor` import (currently `import { SynergemMentor } from '@/components/synergem-mentor'`):

```tsx
import { SynergemAcceleration } from '@/components/synergem-acceleration'
```

- [ ] **Step 3: Wire into `alumni-client.tsx` — render after the mentor card**

In `components/alumni-client.tsx`, the JSX currently reads:

```tsx
        <IgiRitual locale={locale} />

        <SynergemMentor locale={locale} />
```

Change it to add the acceleration card immediately after the mentor card:

```tsx
        <IgiRitual locale={locale} />

        <SynergemMentor locale={locale} />

        <SynergemAcceleration locale={locale} />
```

- [ ] **Step 4: Type-check**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Full test run**

Run: `cd LMS/tochka-sborki/web && npx vitest run`
Expected: PASS — the whole suite green, including `synergem-acceleration.test.ts`.

- [ ] **Step 6: Production build**

Run: `cd LMS/tochka-sborki/web && npx next build`
Expected: build succeeds; `/alumni` and `/en/alumni` compile without error.

- [ ] **Step 7: Commit** (PowerShell tool — bash-git hangs)

```
Set-Location C:\telo\Efforts\Ongoing\mc_hub
git add LMS/tochka-sborki/web/components/synergem-acceleration.tsx LMS/tochka-sborki/web/components/alumni-client.tsx
git commit -m "feat: synergem acceleration ladder card on /alumni (fb_daa79c)"
```

---

## Self-Review

**1. Spec coverage:**
- Engine + keyed-data (`lib/synergem-acceleration.ts`, `AccelStage`, `ACCEL_STAGES`, `resolveAcceleration`) → Task 1. ✅
- 5 stages `form/rhythm/output/outward/autonomous` with milestone/readiness/move → Task 1 data + test key assertion. ✅
- De-hustle clean over all copy both locales → Task 1 Step 1 test. ✅
- ru ≠ en real translation → Task 1 Step 1 test. ✅
- Render-only card mirroring IgiRitual, no clipboard → Task 2 Step 1. ✅
- Wire after `<SynergemMentor/>` → Task 2 Steps 2–3. ✅
- Web gate (tsc + vitest + next build) → Task 2 Steps 4–6. ✅
- Sovereign / no backend / anti-dependency → encoded in data (`autonomous` stage) + no worker/migration touched. ✅

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code. ✅

**3. Type consistency:** `resolveAcceleration`, `ResolvedAcceleration`, `ResolvedAccelStage`, `ACCEL_STAGES`, `AccelStage`, field names `name/milestone/readiness/move` used identically in Task 1 (definition), the test, and Task 2 (consumption). Component prop `{ locale: Locale }` matches `SynergemMentor`/`IgiRitual`. ✅

No gaps found.
