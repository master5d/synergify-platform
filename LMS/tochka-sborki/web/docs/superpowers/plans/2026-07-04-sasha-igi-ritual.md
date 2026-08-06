# ИГИ — Group Insight Ritual — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the ИГИ ritual (6-card deck + 4-step protocol + generative Q&U rule) as a self-contained engine+data module rendered as a facilitator's-guide card on the synergem (`/alumni`) surface.

**Architecture:** `lib/igi.ts` holds bilingual data (`Bi { ru; en }`) + a `resolveIgi(locale)` resolver, mirroring `lib/course/certificate.ts`. A presentational `components/igi-ritual.tsx` (mirroring `office-hours-card.tsx` chrome) renders it; it is wired into `alumni-client.tsx`. No backend.

**Tech Stack:** Next 16 (`output: 'export'`), React, TypeScript, Vitest (env=node). Tests run from `LMS/tochka-sborki/web`.

## Global Constraints

- **Self-contained:** no backend / session state / matching dependency. No interactive draw-a-card UI.
- **Engine + keyed-data:** all ИГИ copy lives in `lib/igi.ts`; no `dictionaries.ts` edits.
- **Authenticity / de-hustle:** every ИГИ string passes `lintDehustle` (returns `[]`); contemplative grounded tone.
- **No-Mermaid** (pure React display). **Sole-prop, NEVER nonprofit.**
- **Trunk-based** on `main`; TDD; commit per task. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- All commands run from `LMS/tochka-sborki/web`.

---

## File Structure

- `lib/igi.ts` — engine + data (`IGI`, `resolveIgi`, types).
- `lib/igi.test.ts` — resolver + shape + localization + de-hustle drift-guard.
- `components/igi-ritual.tsx` — presentational facilitator-guide card.
- `components/alumni-client.tsx` — one import + one element (wire).

---

## Task 1: `lib/igi.ts` engine+data + drift-guard

**Files:**
- Create: `lib/igi.ts`
- Test (create): `lib/igi.test.ts`

**Interfaces:**
- Consumes: `Bi` from `@/lib/course`; `Locale` from `@/lib/dictionaries`; `lintDehustle` from `./authoring/dehustle`.
- Produces: `resolveIgi(locale: Locale, source?: IgiRitual): ResolvedIgi` where `ResolvedIgi = { title, intro, generative: string; cards: {id,name,prompt}[]; steps: {id,title,body}[] }`; the `IGI` const; the `IgiRitual` type. Consumed by Task 2's component.

- [ ] **Step 1: Write the failing test**

Create `lib/igi.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { IGI, resolveIgi, type IgiRitual } from './igi'
import { lintDehustle } from './authoring/dehustle'

const CARD_IDS = ['question', 'learning', 'knowledge', 'umwelt', 'trust', 'opinion']
const STEP_IDS = ['frame', 'choose', 'cultivate', 'wisdom']

describe('resolveIgi', () => {
  it('returns 6 cards and 4 steps with non-empty strings in both locales', () => {
    for (const locale of ['ru', 'en'] as const) {
      const r = resolveIgi(locale)
      expect(r.title.trim().length).toBeGreaterThan(0)
      expect(r.intro.trim().length).toBeGreaterThan(0)
      expect(r.generative.trim().length).toBeGreaterThan(0)
      expect(r.cards).toHaveLength(6)
      expect(r.steps).toHaveLength(4)
      for (const c of r.cards) {
        expect(c.name.trim().length).toBeGreaterThan(0)
        expect(c.prompt.trim().length).toBeGreaterThan(0)
      }
      for (const s of r.steps) {
        expect(s.title.trim().length).toBeGreaterThan(0)
        expect(s.body.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('carries the expected card and step ids', () => {
    const r = resolveIgi('ru')
    expect(r.cards.map((c) => c.id)).toEqual(CARD_IDS)
    expect(r.steps.map((s) => s.id)).toEqual(STEP_IDS)
  })

  it('localizes ru and en differently', () => {
    expect(resolveIgi('ru').generative).not.toBe(resolveIgi('en').generative)
    expect(resolveIgi('ru').cards[0].name).not.toBe(resolveIgi('en').cards[0].name)
  })

  it('resolves from an injected source', () => {
    const fake: IgiRitual = { ...IGI, title: { ru: 'РУ', en: 'EN' } }
    expect(resolveIgi('ru', fake).title).toBe('РУ')
    expect(resolveIgi('en', fake).title).toBe('EN')
  })
})

describe('ИГИ de-hustle', () => {
  it('is clean in every string', () => {
    const strings: string[] = []
    for (const locale of ['ru', 'en'] as const) {
      const r = resolveIgi(locale)
      strings.push(r.title, r.intro, r.generative)
      for (const c of r.cards) strings.push(c.name, c.prompt)
      for (const s of r.steps) strings.push(s.title, s.body)
    }
    for (const s of strings) expect(lintDehustle(s), s).toEqual([])
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/igi.test.ts`
Expected: FAIL — `./igi` does not exist.

- [ ] **Step 3: Create the engine+data module**

Create `lib/igi.ts` with EXACTLY this content:

```ts
// lib/igi.ts
// ИГИ — Игра в Групповой Инсайт (fb_c5d771f00e9a). Self-contained group-bonding
// insight ritual for a синергема: a 6-card deck + 4-step protocol + the generative
// Q&U rule. Engine + keyed bilingual data (mirror lib/course/certificate.ts); the
// presentational card is components/igi-ritual.tsx. No backend — a formed cluster
// runs it offline.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface IgiCard { id: string; name: Bi; prompt: Bi }
export interface IgiStep { id: string; title: Bi; body: Bi }
export interface IgiRitual {
  title: Bi
  intro: Bi
  generative: Bi
  cards: IgiCard[]
  steps: IgiStep[]
}

export const IGI: IgiRitual = {
  title: { ru: '«ИГИ» — Игра в Групповой Инсайт', en: '"GII" — the Group Insight Game' },
  intro: {
    ru: 'Ритуал для синергемы: как из группы соучеников вырастить общий инсайт. Проведите вместе — вслух, по кругу.',
    en: 'A ritual for the synergem: how a group of fellow learners grows a shared insight. Run it together — aloud, in a circle.',
  },
  generative: {
    ru: 'Генеративный вопрос рождается на пересечении Вопроса и Умвельта: возьмите один вопрос группы и чей-то Умвельт — личный мир восприятия — и спросите, как этот вопрос выглядит изнутри этого мира.',
    en: "The generative question is born where a Question meets an Umwelt: take one of the group's questions and one person's Umwelt — their perceptual world — and ask how that question looks from inside it.",
  },
  cards: [
    { id: 'question', name: { ru: 'Вопрос', en: 'Question' }, prompt: { ru: 'Что мы на самом деле хотим понять? Сформулируй живой вопрос, а не задачу.', en: 'What do we actually want to understand? Phrase a living question, not a task.' } },
    { id: 'learning', name: { ru: 'Обучение', en: 'Learning' }, prompt: { ru: 'Чему каждый из нас сейчас учится? Назови свой текущий край роста.', en: 'What is each of us learning right now? Name your current growth edge.' } },
    { id: 'knowledge', name: { ru: 'Знание', en: 'Knowledge' }, prompt: { ru: 'Что мы уже знаем по этому вопросу? Выложи общее на стол.', en: 'What do we already know about this? Put the shared knowledge on the table.' } },
    { id: 'umwelt', name: { ru: 'Умвельт', en: 'Umwelt' }, prompt: { ru: 'Из какого мира восприятия ты смотришь? Опиши, как вопрос выглядит изнутри тебя.', en: 'From which perceptual world do you look? Describe how the question looks from inside you.' } },
    { id: 'trust', name: { ru: 'Доверие', en: 'Trust' }, prompt: { ru: 'Что даёт группе безопасность быть открытой? Назови одно условие доверия.', en: 'What lets the group feel safe to be open? Name one condition of trust.' } },
    { id: 'opinion', name: { ru: 'Мнение', en: 'Opinion' }, prompt: { ru: 'Какое у тебя мнение — и где его край? Держи его как гипотезу, а не как истину.', en: 'What is your opinion — and where is its edge? Hold it as a hypothesis, not a truth.' } },
  ],
  steps: [
    { id: 'frame', title: { ru: 'Постановка вопроса', en: 'Framing the question' }, body: { ru: 'Соберите вопросы (карта «Вопрос»). Выберите один живой вопрос, важный для всех.', en: 'Gather questions (the Question card). Choose one living question that matters to everyone.' } },
    { id: 'choose', title: { ru: 'Выбор карт', en: 'Choosing cards' }, body: { ru: 'Каждый берёт 1–2 карты (Умвельт, Знание, Мнение…) и отвечает на вопрос через них. Слушайте, не спорьте.', en: "Each person takes 1–2 cards (Umwelt, Knowledge, Opinion…) and answers the question through them. Listen, don't argue." } },
    { id: 'cultivate', title: { ru: 'Культивация понимания', en: 'Cultivating understanding' }, body: { ru: 'Сформируйте генеративный вопрос Q&U и пройдите по кругу ещё раз. Понимание растёт из встречи миров.', en: 'Form the generative Q&U question and go around the circle again. Understanding grows from the meeting of worlds.' } },
    { id: 'wisdom', title: { ru: 'Практическая мудрость', en: 'Practical wisdom' }, body: { ru: 'Назовите один общий вывод и один маленький шаг, который сделает группа. Инсайт без шага остывает.', en: 'Name one shared conclusion and one small step the group will take. An insight without a step goes cold.' } },
  ],
}

export interface ResolvedIgiCard { id: string; name: string; prompt: string }
export interface ResolvedIgiStep { id: string; title: string; body: string }
export interface ResolvedIgi {
  title: string
  intro: string
  generative: string
  cards: ResolvedIgiCard[]
  steps: ResolvedIgiStep[]
}

export function resolveIgi(locale: Locale, source: IgiRitual = IGI): ResolvedIgi {
  return {
    title: source.title[locale],
    intro: source.intro[locale],
    generative: source.generative[locale],
    cards: source.cards.map((c) => ({ id: c.id, name: c.name[locale], prompt: c.prompt[locale] })),
    steps: source.steps.map((s) => ({ id: s.id, title: s.title[locale], body: s.body[locale] })),
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run lib/igi.test.ts`
Expected: PASS (all cases, including de-hustle clean).

- [ ] **Step 5: Type gate**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add LMS/tochka-sborki/web/lib/igi.ts LMS/tochka-sborki/web/lib/igi.test.ts
git commit -m "feat(synergem): ИГИ ritual engine+data (deck + protocol) + de-hustle drift-guard

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Presentational card + wire into alumni-client

**Files:**
- Create: `components/igi-ritual.tsx`
- Modify: `components/alumni-client.tsx` (import + one element after the opt-in `</section>`, ~line 81)

**Interfaces:**
- Consumes: `resolveIgi` from `@/lib/igi`; `Locale` from `@/lib/dictionaries` (Task 1).
- Produces: `IgiRitual` component (`{ locale: Locale }`), rendered on `/alumni`.

- [ ] **Step 1: Create the presentational card**

Create `components/igi-ritual.tsx` with EXACTLY this content (chrome mirrors `office-hours-card.tsx` + `alumni-client.tsx` inline-CSS-var style):

```tsx
import type { Locale } from '@/lib/dictionaries'
import { resolveIgi } from '@/lib/igi'

export function IgiRitual({ locale }: { locale: Locale }) {
  const igi = resolveIgi(locale)
  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h2 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{igi.title}</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{igi.intro}</p>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.88rem', lineHeight: 1.55, color: 'var(--text-primary)', borderLeft: '3px solid var(--text-accent)', paddingLeft: '.8rem' }}>{igi.generative}</p>
      <div role="list" style={{ display: 'grid', gap: '.7rem', marginBottom: '1.25rem' }}>
        {igi.cards.map((c) => (
          <div role="listitem" key={c.id} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '.8rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}><span aria-hidden="true">⬡ </span>{c.name}</div>
            <div style={{ fontSize: '.9rem', color: 'var(--text-primary)' }}>{c.prompt}</div>
          </div>
        ))}
      </div>
      <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '.5rem' }}>
        {igi.steps.map((s) => (
          <li key={s.id} style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.title}.</span> {s.body}
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the synergem page**

In `components/alumni-client.tsx`, add the import after the existing `clusterAlumni` import (line 6):

```tsx
import { IgiRitual } from '@/components/igi-ritual'
```

Then, immediately after the opt-in `</section>` (line 81) and before the `{loaded && list.length === 0 && ...}` line, insert:

```tsx
        <IgiRitual locale={locale} />

```

(So the ИГИ facilitator card renders between the opt-in box and the cluster list.)

- [ ] **Step 3: Type gate + build (the component's verification — no unit test, mirrors office-hours-card)**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx tsc --noEmit`
Expected: no errors.

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx next build`
Expected: build succeeds; `/alumni` and `/en/alumni` compile with the new element.

- [ ] **Step 4: Full suite**

Run: `cd C:/telo/Efforts/Ongoing/mc_hub/LMS/tochka-sborki/web && npx vitest run`
Expected: PASS — whole suite green (igi + existing alumni tests unaffected).

- [ ] **Step 5: Commit**

```bash
cd C:/telo/Efforts/Ongoing/mc_hub
git add LMS/tochka-sborki/web/components/igi-ritual.tsx LMS/tochka-sborki/web/components/alumni-client.tsx
git commit -m "feat(synergem): ИГИ facilitator-guide card wired into the synergem page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- `lib/igi.ts` engine+data (6 cards, 4 steps, generative, resolver) → Task 1. ✅
- Drift-guard (shape, ids, localization, injected source, de-hustle) → Task 1. ✅
- `components/igi-ritual.tsx` presentational card → Task 2. ✅
- Wire into `alumni-client.tsx` → Task 2. ✅
- No dictionaries edit, no backend, no interactive UI, no nonprofit — nothing in either task introduces them. ✅

**2. Placeholder scan:** No TBD/TODO; every code block is complete and verbatim. ✅

**3. Type consistency:** `resolveIgi(locale, source?)` signature and `ResolvedIgi` shape (`title/intro/generative: string`, `cards: {id,name,prompt}[]`, `steps: {id,title,body}[]`) are identical across the module, the test, and the component. Card ids `question/learning/knowledge/umwelt/trust/opinion` and step ids `frame/choose/cultivate/wisdom` match between `IGI` and the test's `CARD_IDS`/`STEP_IDS`. `Locale` imported from `@/lib/dictionaries` in both `lib/igi.ts` and the component (consistent with `alumni-client.tsx`). De-hustle: every string checked against the `BANNED` list (no `scarcity`/`guru`/RU markers; "спорьте"/"истину"/"остывает" are not banned). ✅
