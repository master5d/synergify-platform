# Синергема acceleration — sovereign self-run progression ladder (fb_daa79c)

**Ticket:** `fb_daa79c74eff9` — «Синергема: встроенная акселерационная программа (сетевые
ресурсы/прогрессия)». Epic-split of `fb_7fdd9f891109` (synergem far-pillar).

## Problem & scope decision

The ticket text asks for an "acceleration program" — synergems getting *networked resources,
hybrid learning, financial/management tools for autonomous cluster growth*. Taken literally that
presupposes: (a) formed clusters with membership state, (b) a progression/resource backend, and
(c) — the part that violates the brand — owner-provided **financial products**. None of that is
buildable now (dormant infra), and the financial-product framing conflicts with the sole-prop,
de-hustle, authenticity-sacred constraints.

**Buildable-now delta (4th instance of the established synergem pattern).** ИГИ (`fb_c5d771`),
matching (`fb_bfbdbcf0`), and group-mentor (`fb_c3a3d0`) all shipped as **self-contained
sovereign artifacts on the live `/alumni` surface** despite presupposing dormant infra. This
ticket ships the same way: a **progression ladder** — a static keyed-data map of the stages a
synergem grows through, which a formed cluster reads together and self-navigates. No backend, no
hosted LLM, no membership state, no financial products. Resources are **self-sourced by the
group**, never dispensed by the owner.

The three shipped artifacts divide cleanly:
- **ИГИ** — the group-bonding *ritual* (one meeting).
- **group-mentor** — the *facilitation prompt* (per meeting, run by the group's own agent).
- **acceleration** — the *growth trajectory* (across the cluster's whole life). This spec.

## Architecture

Mirrors `lib/igi.ts` + `components/igi-ritual.tsx` exactly — engine + keyed bilingual data +
render-only presentational card.

### `lib/synergem-acceleration.ts` (engine + keyed-data)

```ts
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export interface AccelStage {
  key: string
  name: Bi        // stage name, e.g. «Собрались» / "Gathered"
  milestone: Bi   // what defines this stage — where the cluster is
  readiness: Bi   // "you're ready for the next stage when…" self-check
  move: Bi        // one concrete move to grow into / through the stage
}

export const ACCEL_STAGES: AccelStage[]           // exactly 5, ordered
export interface ResolvedAccelStage { key; name; milestone; readiness; move }  // all string
export interface ResolvedAcceleration { intro: string; stages: ResolvedAccelStage[] }
export function resolveAcceleration(locale: Locale, source?): ResolvedAcceleration
```

`intro` is a short bilingual framing line (sovereign / self-navigated / anti-dependency).

### The 5 stages (ordered)

1. **`form`** — Собрались / Gathered. The cluster exists; people opted in around a shared effort.
   Ready-when: everyone knows why they're here and what they gather around.
2. **`rhythm`** — Ритм / Rhythm. A dependable cadence of meetings and a rotating lead.
   Ready-when: the group meets without anyone chasing everyone.
3. **`output`** — Первый результат / First output. The cluster ships one shared thing —
   however small — that none of you would have made alone.
   Ready-when: there's a concrete artifact you point to together.
4. **`outward`** — Наружу / Outward. The synergem turns outward: serves, finds clients together,
   teaches what it learned. Resources are found and shared by the group itself.
   Ready-when: value flows out of the cluster, not only within it.
5. **`autonomous`** — Автономность / Autonomous. The synergem sustains itself and no longer needs
   the academy to hold it. Graduation, not retention.
   Ready-when: the cluster would keep going if the academy vanished tomorrow.

Copy echoes the group-mentor `graduation` move ("the goal is for the synergem to lead itself,
without you") — the trajectory ends in autonomy, never in dependency.

### `components/synergem-acceleration.tsx` (render-only)

Server component (no `'use client'`, no clipboard) — mirrors `IgiRitual` chrome:
`<section>` with the same border/radius/padding/`marginBottom: '2.5rem'`; `<h2>` title +
`<p>` intro; an `<ol>` of the 5 stages, each rendering name (mono/accent/⬡, like IGI cards),
milestone (primary text), readiness (secondary, "готов когда…"), move (accent left-border, like
IGI's generative line). Localized via `resolveAcceleration(locale)`.

### Wiring

`components/alumni-client.tsx`: one import + `<SynergemAcceleration locale={locale} />` placed
after the existing `<SynergemMentor locale={locale} />`, before the cluster list. Trajectory sits
below ritual + mentor — the three artifacts read top-to-bottom as gather → facilitate → grow.

## Testing

`lib/synergem-acceleration.test.ts`:
- `ACCEL_STAGES` has exactly 5 entries with unique keys equal to
  `['form','rhythm','output','outward','autonomous']` in order.
- `resolveAcceleration('ru')` / `('en')` return `intro` non-empty and 5 stages, each with
  non-empty `name`/`milestone`/`readiness`/`move`.
- ru ≠ en for the intro and for every stage field (real translation, not a copy).
- `lintDehustle` returns `[]` over the intro and every stage field, both locales (import
  `lintDehustle` from `@/lib/authoring/dehustle`).

## Global constraints

- **Engine + keyed-data** (`Bi {ru;en}` + resolver), mirror `lib/igi.ts` / `certificate.ts`.
- **Sovereign** — no hosted LLM, no backend, no membership state; a formed cluster self-runs it.
- **De-hustle** — `lintDehustle []` over all copy; **no financial-product / scarcity / hustle
  framing**; resources are self-sourced by the group, not owner-dispensed.
- **Anti-dependency** — the ladder ends in autonomy/graduation, echoing `mentor-persona`'s ethic.
- **Live surface** — renders on `/alumni` beside ИГИ + mentor (content-track-on-live-surface).
- **Isolation** — `Bi` from `@/lib/course`, `Locale` from `@/lib/dictionaries`; no new deps.
- **Web gate** — `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx vitest run && npx next build`.
- No-Mermaid · sole-prop (never nonprofit) · trunk-based main, one commit per task.
- **Ops:** bash-git hangs this session — all git via the PowerShell tool.

## Out of scope (deferred, stays dormant)

Live per-cluster progression tracking, membership/state store, owner-provided resources or
financial/management tooling, DAO/Web3 (`fb_029568`). This artifact is the map; walking it is the
group's own work.
