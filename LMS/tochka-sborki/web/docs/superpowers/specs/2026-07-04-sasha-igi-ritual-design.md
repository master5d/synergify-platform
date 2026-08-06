# ИГИ — Игра в Групповой Инсайт (self-contained ritual)

**Ticket:** fb_c5d771f00e9a (#2 of the 3-item "all" sequence)
**Date:** 2026-07-04
**Status:** approved

## Goal

Capture the ИГИ ritual (Игра в Групповой Инсайт) — a group-bonding insight
game for a синергема — as a self-contained engine+data artifact: a 6-category
card deck + a 4-step protocol + the generative Q&U rule, rendered as a
facilitator's-guide card on the synergem surface (`/alumni`). Runnable
manually with a cluster now; no matching backend needed.

## Constraints

- **Self-contained.** No backend, no live session state, no matching
  dependency (that is #3, dormant). The ritual is a protocol a formed (or
  forming) cluster runs offline. No interactive draw-a-card UI (YAGNI).
- **Engine + keyed-data.** `lib/igi.ts` holds bilingual data (`Bi { ru; en }`)
  + a `resolveIgi(locale)` resolver, mirroring `lib/course/certificate.ts`
  and `lib/course/office-hours.ts`. All ИГИ copy lives in this one module —
  no `dictionaries.ts` edits.
- **Authenticity / de-hustle.** Contemplative, grounded tone. Every ИГИ
  string passes `lib/authoring/dehustle.ts` `lintDehustle` (drift-guard).
- **No-Mermaid** (respected — pure React display, no diagram lib).
- **Sole-prop, NEVER nonprofit.** No nonprofit / tax / donation framing.
- **Trunk-based** on `main`; TDD; commit per task.

## Architecture

### 1. `lib/igi.ts` — engine + data

```ts
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface IgiCard { id: string; name: Bi; prompt: Bi }
export interface IgiStep { id: string; title: Bi; body: Bi }
export interface IgiRitual {
  title: Bi
  intro: Bi
  generative: Bi
  cards: IgiCard[]   // 6
  steps: IgiStep[]   // 4
}

export const IGI: IgiRitual = { /* content below */ }

export interface ResolvedIgiCard { id: string; name: string; prompt: string }
export interface ResolvedIgiStep { id: string; title: string; body: string }
export interface ResolvedIgi {
  title: string; intro: string; generative: string
  cards: ResolvedIgiCard[]; steps: ResolvedIgiStep[]
}

export function resolveIgi(locale: Locale, source: IgiRitual = IGI): ResolvedIgi {
  // maps every Bi field through [locale]
}
```

The resolver mirrors `resolveCertificate` (localize each field, pass `id`
through). `source` param exists for fixture-testing.

#### Exact `IGI` content

**title** — ru: `«ИГИ» — Игра в Групповой Инсайт` · en: `"GII" — the Group Insight Game`

**intro** —
- ru: `Ритуал для синергемы: как из группы соучеников вырастить общий инсайт. Проведите вместе — вслух, по кругу.`
- en: `A ritual for the synergem: how a group of fellow learners grows a shared insight. Run it together — aloud, in a circle.`

**generative** —
- ru: `Генеративный вопрос рождается на пересечении Вопроса и Умвельта: возьмите один вопрос группы и чей-то Умвельт — личный мир восприятия — и спросите, как этот вопрос выглядит изнутри этого мира.`
- en: `The generative question is born where a Question meets an Umwelt: take one of the group's questions and one person's Umwelt — their perceptual world — and ask how that question looks from inside it.`

**cards** (6 — `id`, `name`, `prompt`):

1. `question` — «Вопрос» / "Question"
   - ru: `Что мы на самом деле хотим понять? Сформулируй живой вопрос, а не задачу.`
   - en: `What do we actually want to understand? Phrase a living question, not a task.`
2. `learning` — «Обучение» / "Learning"
   - ru: `Чему каждый из нас сейчас учится? Назови свой текущий край роста.`
   - en: `What is each of us learning right now? Name your current growth edge.`
3. `knowledge` — «Знание» / "Knowledge"
   - ru: `Что мы уже знаем по этому вопросу? Выложи общее на стол.`
   - en: `What do we already know about this? Put the shared knowledge on the table.`
4. `umwelt` — «Умвельт» / "Umwelt"
   - ru: `Из какого мира восприятия ты смотришь? Опиши, как вопрос выглядит изнутри тебя.`
   - en: `From which perceptual world do you look? Describe how the question looks from inside you.`
5. `trust` — «Доверие» / "Trust"
   - ru: `Что даёт группе безопасность быть открытой? Назови одно условие доверия.`
   - en: `What lets the group feel safe to be open? Name one condition of trust.`
6. `opinion` — «Мнение» / "Opinion"
   - ru: `Какое у тебя мнение — и где его край? Держи его как гипотезу, а не как истину.`
   - en: `What is your opinion — and where is its edge? Hold it as a hypothesis, not a truth.`

**steps** (4 — `id`, `title`, `body`):

1. `frame` — «Постановка вопроса» / "Framing the question"
   - ru: `Соберите вопросы (карта «Вопрос»). Выберите один живой вопрос, важный для всех.`
   - en: `Gather questions (the Question card). Choose one living question that matters to everyone.`
2. `choose` — «Выбор карт» / "Choosing cards"
   - ru: `Каждый берёт 1–2 карты (Умвельт, Знание, Мнение…) и отвечает на вопрос через них. Слушайте, не спорьте.`
   - en: `Each person takes 1–2 cards (Umwelt, Knowledge, Opinion…) and answers the question through them. Listen, don't argue.`
3. `cultivate` — «Культивация понимания» / "Cultivating understanding"
   - ru: `Сформируйте генеративный вопрос Q&U и пройдите по кругу ещё раз. Понимание растёт из встречи миров.`
   - en: `Form the generative Q&U question and go around the circle again. Understanding grows from the meeting of worlds.`
4. `wisdom` — «Практическая мудрость» / "Practical wisdom"
   - ru: `Назовите один общий вывод и один маленький шаг, который сделает группа. Инсайт без шага остывает.`
   - en: `Name one shared conclusion and one small step the group will take. An insight without a step goes cold.`

### 2. `components/igi-ritual.tsx` — presentational card

- **Not** `'use client'` (pure display; imported into the client `AlumniClient`
  tree). Mirrors `office-hours-card.tsx` chrome: a `<section>` with a heading,
  intro, a highlighted generative-rule callout, a grid of the 6 cards
  (name + prompt), and an ordered list of the 4 steps. Inline styles on
  CSS-vars (`--border-color`, `--bg-surface`, `--text-primary/secondary/accent`,
  `--font-mono`), matching `alumni-client.tsx`.
- Props: `{ locale: Locale }`. Calls `resolveIgi(locale)`.
- Cards grid uses `role="list"`; steps use an `<ol>` (semantic ordinal).

### 3. Wire into `alumni-client.tsx`

Render `<IgiRitual locale={locale} />` inside `<main>`, after the opt-in
`<section>` (line ~81) and before the cluster list. One import + one element;
no logic change to the directory.

## Testing

- `lib/igi.test.ts` (env=node):
  - `resolveIgi('ru'|'en')` returns 6 cards + 4 steps, every field a non-empty
    string.
  - card `id`s equal `['question','learning','knowledge','umwelt','trust','opinion']`;
    step `id`s equal `['frame','choose','cultivate','wisdom']`.
  - localization: a sampled field differs between ru and en.
  - `resolveIgi` from an injected fixture source (mirror certificate test).
  - de-hustle: `lintDehustle` returns `[]` for every ИГИ string (title, intro,
    generative, all card names/prompts, all step titles/bodies).
- Component: build-validated (no unit test — mirror `office-hours-card`).
- Gates: `npx tsc --noEmit`, `next build`, full `npx vitest run`.

## Out of scope

- Interactive draw-a-card UI, live group-session state, any backend.
- The matching engine (#3, fb_bfbdbcf0).
- Physical/printable card generation.
- `dictionaries.ts` edits (ИГИ copy is self-contained in `lib/igi.ts`).
- Any nonprofit framing.
