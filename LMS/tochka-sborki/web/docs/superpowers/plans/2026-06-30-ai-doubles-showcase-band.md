# AI-Doubles Showcase Band Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the five-AI-doubles device (today only inside the `u3-clones` lesson) on the showcase/possibilities page as a memorable framing band above the example cases.

**Architecture:** A keyed-data source `lib/course/ai-doubles.ts` (mirrors the lesson's five life-domains, `getAiDoubles(locale)` resolver, engine+keyed-data idiom) feeds a server-rendered display component `components/ai-doubles-band.tsx`, wired into `components/showcase-gallery.tsx` between the video and the case filter.

**Tech Stack:** Next.js 16, React (server components), TypeScript, Vitest (`environment: node`). No new dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths relative to it; run commands from there.
- `lms_target: course` (per ticket; implemented as a small lib + component).
- Bilingual content uses `Bi = { ru: string; en: string }`; `Locale = 'ru' | 'en'` from `@/lib/intake/types`.
- The five doubles MUST mirror the `u3-clones` lesson domains in order: `communication, meetings, content, learning, automation`.
- Authenticity: no fabricated/vanity metrics on the marketing band (no "saves N h/day"); de-guru, de-hustle; "you build each one yourself" (co-thinking, not do-it-for-me). Drop the lesson's hour-savings numbers.
- Additive only: do NOT modify `u3-clones.mdx`, the existing showcase data/types, or the case taxonomy. No new dependencies.
- Follow existing idioms: inline styles + `var(--…)` tokens (`var(--content-max)`, `var(--bg-surface)`, `var(--border-color)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--font-mono)`, `var(--section-label-size)`, `var(--radius)`); source-reading drift-guard tests like `lib/a11y/keyboard.test.ts`.
- Test command: full suite `npm test` (= `vitest run`); single file `npx vitest run <path>`. Build: `npm run build`.
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git runs from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/course/ai-doubles.ts` — keyed-data source

**Files:**
- Create: `lib/course/ai-doubles.ts`
- Test: `lib/course/ai-doubles.test.ts`

**Interfaces:**
- Consumes: `Locale` from `@/lib/intake/types`.
- Produces:
  - `export const AI_DOUBLE_KEYS = ['communication','meetings','content','learning','automation'] as const`
  - `export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }`
  - `export interface ResolvedDouble { key: string; icon: string; name: string; does: string }`
  - `export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }`
  - `export function getAiDoubles(locale: Locale): AiDoublesVM`
  - (module-local, not exported: `interface Bi`, `const HEADING`, `const LEAD`, `const AI_DOUBLES`)

- [ ] **Step 1: Write the failing test**

Create `lib/course/ai-doubles.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAiDoubles, AI_DOUBLE_KEYS } from './ai-doubles'

describe('getAiDoubles', () => {
  it('returns exactly the five domains in order, both locales', () => {
    for (const l of ['ru', 'en'] as const) {
      expect(getAiDoubles(l).doubles.map(d => d.key)).toEqual([...AI_DOUBLE_KEYS])
    }
  })

  it('keys match the u3-clones lesson domains (drift-guard)', () => {
    expect([...AI_DOUBLE_KEYS]).toEqual(['communication', 'meetings', 'content', 'learning', 'automation'])
  })

  it('has non-empty icon/name/does for every double in both locales', () => {
    for (const l of ['ru', 'en'] as const) {
      for (const d of getAiDoubles(l).doubles) {
        expect(d.icon.length).toBeGreaterThan(0)
        expect(d.name.length).toBeGreaterThan(0)
        expect(d.does.length).toBeGreaterThan(0)
      }
    }
  })

  it('has a non-empty heading and lead, distinct per locale', () => {
    expect(getAiDoubles('ru').heading).not.toBe(getAiDoubles('en').heading)
    expect(getAiDoubles('ru').lead.length).toBeGreaterThan(0)
    expect(getAiDoubles('en').lead.length).toBeGreaterThan(0)
  })

  it('carries no time-savings metrics (metrics-free marketing band)', () => {
    for (const l of ['ru', 'en'] as const) {
      const vm = getAiDoubles(l)
      const all = [vm.heading, vm.lead, ...vm.doubles.flatMap(d => [d.name, d.does])].join(' ')
      expect(all).not.toMatch(/\d+\s*(ч|h)\b/i)
      expect(all).not.toMatch(/час|hour/i)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/course/ai-doubles.test.ts`
Expected: FAIL — cannot resolve `./ai-doubles`.

- [ ] **Step 3: Write the implementation**

Create `lib/course/ai-doubles.ts`:

```ts
// lib/course/ai-doubles.ts
// The five "AI doubles" the learner builds — a compact, metrics-free preview of the
// u3-clones curriculum lesson, surfaced on the showcase. Keyed bilingual data + a
// locale-flattening resolver (mirrors lib/course/showcase.ts).
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['communication', 'meetings', 'content', 'learning', 'automation'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

const HEADING: Bi = { ru: 'Пять AI-двойников, которых ты соберёшь', en: "Five AI doubles you'll build" }

const LEAD: Bi = {
  ru: 'Не «сделай за меня» — это рой, который ты отправляешь строить. Каждого собираешь сам.',
  en: "Not 'do it for me' — it's a swarm you send to build. You build each one yourself.",
}

const AI_DOUBLES: AiDouble[] = [
  { key: 'communication', icon: '📨',
    name: { ru: 'Коммуникация', en: 'Communication' },
    does: { ru: 'отвечает на письма твоим голосом', en: 'replies to emails in your voice' } },
  { key: 'meetings', icon: '🎧',
    name: { ru: 'Разбор встреч', en: 'Meeting intelligence' },
    does: { ru: 'конспект встречи и задачи после звонка', en: 'summaries and tasks after calls' } },
  { key: 'content', icon: '✍️',
    name: { ru: 'Контент', en: 'Content' },
    does: { ru: 'посты, клипы и идеи в твоём стиле', en: 'posts, clips and ideas in your style' } },
  { key: 'learning', icon: '📚',
    name: { ru: 'Обучение', en: 'Learning' },
    does: { ru: 'учит тебя новому по расписанию', en: 'teaches you new things on a schedule' } },
  { key: 'automation', icon: '⚙️',
    name: { ru: 'Автоматизация', en: 'Automation' },
    does: { ru: 'пайплайн: данные → отчёт, ссылка → конспект', en: 'pipeline: data → report, link → summary' } },
]

export function getAiDoubles(locale: Locale): AiDoublesVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  return {
    heading: HEADING[L],
    lead: LEAD[L],
    doubles: AI_DOUBLES.map(d => ({ key: d.key, icon: d.icon, name: d.name[L], does: d.does[L] })),
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/course/ai-doubles.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/course/ai-doubles.ts LMS/tochka-sborki/web/lib/course/ai-doubles.test.ts
git -c commit.gpgsign=false commit -m "feat(showcase): AI-doubles keyed-data source (fb_42e4a1668f80)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `AiDoublesBand` component + wire into the gallery

**Files:**
- Create: `components/ai-doubles-band.tsx`
- Test: `components/ai-doubles-band.test.ts`
- Modify: `components/showcase-gallery.tsx`

**Interfaces:**
- Consumes (from Task 1): `getAiDoubles` from `@/lib/course/ai-doubles`; `Locale` from `@/lib/intake/types`.
- Produces: `export function AiDoublesBand({ locale }: { locale: Locale }): React.ReactElement`.

- [ ] **Step 1: Write the failing test**

Create `components/ai-doubles-band.test.ts` (source drift-guard, node env — mirrors `lib/a11y/keyboard.test.ts`):

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'ai-doubles-band.tsx'), 'utf8')

describe('AiDoublesBand', () => {
  it('is data-driven from getAiDoubles (renders the list, no hardcoded domain copy)', () => {
    expect(src).toContain('getAiDoubles')
    expect(src).toMatch(/doubles\.map/)
    expect(src).not.toMatch(/Communication|Коммуникация/)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ai-doubles-band.test.ts`
Expected: FAIL — cannot read `ai-doubles-band.tsx` (does not exist).

- [ ] **Step 3: Write the component**

Create `components/ai-doubles-band.tsx`:

```tsx
// components/ai-doubles-band.tsx
// Framing band on the showcase: the five AI doubles the learner builds.
// Data-driven from getAiDoubles; sits above the example cases as the "what you'll build" lens.
import { getAiDoubles } from '@/lib/course/ai-doubles'
import type { Locale } from '@/lib/intake/types'

export function AiDoublesBand({ locale }: { locale: Locale }) {
  const { heading, lead, doubles } = getAiDoubles(locale)
  return (
    <div style={{ margin: '0 0 2.5rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--section-label-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>{heading}</div>
      <p style={{ margin: '0 0 1.4rem', color: 'var(--text-secondary)', maxWidth: '52ch', lineHeight: 1.6 }}>{lead}</p>
      <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {doubles.map(d => (
          <div key={d.key} style={{ padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }} aria-hidden="true">{d.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{d.name}</div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>{d.does}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run the drift-guard test to verify it passes**

Run: `npx vitest run components/ai-doubles-band.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Wire into `components/showcase-gallery.tsx`**

5a. Add the import after the existing `ShowcaseFilter` import (line 3):

```tsx
import { ShowcaseFilter } from '@/components/showcase-filter'
import { AiDoublesBand } from '@/components/ai-doubles-band'
```

5b. Render the band between the video and the filter. Replace:

```tsx
        <ShowcaseVideo source={t.video.source} poster={t.video.poster} caption={t.video.caption} title={t.real.heading} captionTrack={t.video.captionTrack} transcript={t.video.transcript} locale={locale === 'en' ? 'en' : 'ru'} />

        <ShowcaseFilter data={t} locale={locale} />
```

with:

```tsx
        <ShowcaseVideo source={t.video.source} poster={t.video.poster} caption={t.video.caption} title={t.real.heading} captionTrack={t.video.captionTrack} transcript={t.video.transcript} locale={locale === 'en' ? 'en' : 'ru'} />

        <AiDoublesBand locale={locale} />

        <ShowcaseFilter data={t} locale={locale} />
```

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including Task 1's `ai-doubles` tests, the new band drift-guard, and all prior tests (no regression).

- [ ] **Step 7: Build-validate**

Run: `npm run build`
Expected: build succeeds with no type errors; the showcase page renders the band between the video and the case filter.

- [ ] **Step 8: Commit**

```bash
git add LMS/tochka-sborki/web/components/ai-doubles-band.tsx LMS/tochka-sborki/web/components/ai-doubles-band.test.ts LMS/tochka-sborki/web/components/showcase-gallery.tsx
git -c commit.gpgsign=false commit -m "feat(showcase): render AI-doubles band above the cases (fb_42e4a1668f80)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `lib/course/ai-doubles.ts` keyed-data with five mirrored domains + `getAiDoubles` → Task 1. ✅
- Heading/lead/icons/one-liners authored, metrics dropped → Task 1 data + the no-metrics test. ✅
- `AiDoublesBand` display, data-driven, gallery idiom → Task 2. ✅
- Wired between video and filter (framing → cases) → Task 2 step 5. ✅
- Tests: order/keys, bilingual non-empty, heading/lead distinct, drift-guard keys, authenticity no-metrics → Task 1; component source drift-guard + full suite/build → Task 2. ✅
- Additive only (no `u3-clones.mdx` / showcase-data / taxonomy change) → confirmed; only new files + one gallery render line. ✅

**Placeholder scan:** No TBD/TODO/vague steps; full code in every code step. ✅

**Type consistency:** `getAiDoubles(locale: Locale): AiDoublesVM`, `AI_DOUBLE_KEYS`, `ResolvedDouble` defined in Task 1 and consumed identically in Task 2's component + tests. The component destructures `{ heading, lead, doubles }` matching `AiDoublesVM`. `Bi` is module-local to `ai-doubles.ts`. ✅

**Authenticity guard:** the no-metrics test regex (`/\d+\s*(ч|h)\b/i`, `/час|hour/i`) — none of the authored strings contain digit+ч/h or час/hour, so the test passes and locks the band metrics-free. ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-ai-doubles-showcase-band.md`.**
