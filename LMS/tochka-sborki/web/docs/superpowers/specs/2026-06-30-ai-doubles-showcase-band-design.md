# AI-doubles showcase band — design (fb_42e4a1668f80)

**Ticket:** `fb_42e4a1668f80` — Curriculum / marketing device: frame AI capabilities as "AI doubles/agents per life-domain" (à la Mindvalley's "5 AI Clones": communication, meetings, content/video, learning, automation). A memorable structure for the showcase / curriculum: each domain = an AI double the learner builds. Maps onto the companion/agent concept + the imagination→task→automation spine.

## Grep-before-build finding (component-overlap)

The device is **already shipped in the curriculum**: `content/{ru,en}/01-introduction/u3-clones.mdx` is a full "Five clones" lesson naming the exact five life-domains (Communication, Meeting-intelligence, Content, Learning, Automation), a Capture→Build→Test→Refine cycle, and a "describe your first clone → becomes your first real AI project" practice. It is woven through `u4-practice` ("the four shifts and the five clones"), `00-kickstart`, and the `anime-quest` RPG skin ("Five Legendary Clones"). The **unshipped half** is the ticket's "memorable structure for the **showcase**": the showcase/possibilities page does not use the doubles device — it groups cases on a different axis (co-thinking/launch/flow/knowledge/dictation/platform). And the five doubles exist only as prose in one MDX table, so nothing else can reuse them.

**Decided at the design gate:** surface the device on the showcase (the unshipped half). Not chosen: rewiring `u3-clones.mdx` to consume an extracted SoT, or closing the ticket as already-shipped.

## Goal

Bring the five-AI-doubles device onto the showcase/possibilities page as a memorable framing band — *what you'll build* — positioned as the lens above the example cases, without duplicating the curriculum lesson or competing with the case taxonomy.

## Positioning (resolves the two-axis risk)

The showcase already shows cases on a capability axis. The doubles band sits **above** the cases with a clear role split:
- **Doubles band** = the *promise / device*: the five life-domains the learner builds.
- **Cases below** (real stories + dream cases) = the *evidence / examples*.

Framing-then-evidence, one above the other — not two competing filters on the same row.

## Architecture

### 1. `lib/course/ai-doubles.ts` — keyed-data source

Follows the `lib/course/showcase.ts` engine+keyed-data idiom (module-local `Bi`, `Locale` from `@/lib/intake/types`, a `get…(locale)` resolver returning locale-flattened display data).

```ts
import type { Locale } from '@/lib/intake/types'

interface Bi { ru: string; en: string }

export interface AiDouble { key: string; icon: string; name: Bi; does: Bi }

export const AI_DOUBLE_KEYS = ['communication', 'meetings', 'content', 'learning', 'automation'] as const

export interface ResolvedDouble { key: string; icon: string; name: string; does: string }

export interface AiDoublesVM { heading: string; lead: string; doubles: ResolvedDouble[] }

export function getAiDoubles(locale: Locale): AiDoublesVM
```

The five `AiDouble` entries **mirror the `u3-clones` lesson's five domains**, each with a one-line *what it does*. The lesson remains the curriculum source (not rewired); this is the showcase's compact preview.

**Content (authored verbatim in the plan).** Names + one-liners:
- `communication` 📨 — Коммуникация / Communication — «отвечает на письма твоим голосом» / "replies to emails in your voice"
- `meetings` 🎧 — Разбор встреч / Meeting intelligence — «конспект встречи и задачи после звонка» / "summaries and tasks after calls"
- `content` ✍️ — Контент / Content — «посты, клипы и идеи в твоём стиле» / "posts, clips and ideas in your style"
- `learning` 📚 — Обучение / Learning — «учит тебя новому по расписанию» / "teaches you new things on a schedule"
- `automation` ⚙️ — Автоматизация / Automation — «пайплайн: данные → отчёт, ссылка → конспект» / "pipeline: data → report, link → summary"

**Heading:** «Пять AI-двойников, которых ты соберёшь» / "Five AI doubles you'll build".
**Lead (one line, echoes the lesson's swarm framing + the sacred not-do-for-me spine):** «Не „сделай за меня" — это рой, который ты отправляешь строить. Каждого собираешь сам.» / "Not 'do it for me' — it's a swarm you send to build. You build each one yourself."

**Authenticity:** the lesson's "saves 2–4 h/day" style numbers are **dropped** — no fabricated/vanity metrics on the marketing page. De-guru, de-hustle; "you build each one yourself" (co-thinking, not do-it-for-me).

### 2. `components/ai-doubles-band.tsx` — display

Server-renderable, dependency-free. A `home-section`-idiom band: heading + lead + a compact responsive grid of five cards (icon · name · one-liner). Inline styles + `var(--…)` tokens, matching the gallery/`showcase-gallery.tsx` look (`var(--content-max)`, `var(--bg-*)`, `var(--border-color)`, `var(--font-mono)` for the label). Takes `{ locale: Locale }`, calls `getAiDoubles(locale)`.

### 3. Wire into `components/showcase-gallery.tsx`

Render `<AiDoublesBand locale={locale} />` immediately after `<ShowcaseVideo … />` and before `<ShowcaseFilter … />` (framing → cases). The gallery already receives `locale`.

### 4. Tests

- **`lib/course/ai-doubles.test.ts`:**
  - `getAiDoubles('ru'|'en')` returns exactly five doubles, `.map(d => d.key)` equals `AI_DOUBLE_KEYS` in order.
  - Each double's `name` and `does` non-empty for both locales; `icon` non-empty.
  - `heading`/`lead` non-empty and `ru` ≠ `en`.
  - **Drift-guard:** `AI_DOUBLE_KEYS` equals `['communication','meetings','content','learning','automation']` — the five curriculum domains; guards the band↔lesson from silent divergence.
  - **Authenticity guard:** no rendered `does`/`lead`/`heading` string contains a time-savings metric marker (`/\d+\s*(ч|h)\b/i` or `/час|hour/i` for "saves N hours") — keeps the marketing band metrics-free.
- **`components/ai-doubles-band.test.ts`** (source drift-guard, node env, mirrors `keyboard.test.ts` style): the component imports `getAiDoubles`, maps over `doubles` (renders all five), and contains no hardcoded clone-domain strings (data-driven, not duplicated in JSX).
- Wiring **build-validated** (`npm run build`); full Vitest suite green, no regression.

## Scope

- Single app: `LMS/tochka-sborki/web/`. `lms_target: course` (per ticket; implemented as a small lib + component).
- **Out of scope:** rewiring `u3-clones.mdx` to consume `ai-doubles.ts`; interactive double→case linking/filtering; progress-tracking of "your doubles"; any change to the existing case taxonomy or the curriculum lesson.

## Backward compatibility

Additive: one new lib + one new component + one render line in the gallery. No existing data, types, or components change. No new dependencies. The showcase gains a framing band above the cases; everything else renders as before.

## Task decomposition (for the plan)

1. `lib/course/ai-doubles.ts` (types, `AI_DOUBLE_KEYS`, five `AiDouble` entries, `getAiDoubles`) + `ai-doubles.test.ts` (TDD: order/keys, non-empty bilingual, heading/lead distinct, drift-guard keys, authenticity no-metrics guard).
2. `components/ai-doubles-band.tsx` + source drift-guard test, then wire into `showcase-gallery.tsx`; build-validated + full suite green.
