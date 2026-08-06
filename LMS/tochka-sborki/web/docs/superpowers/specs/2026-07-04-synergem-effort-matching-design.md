# Синергема matching by effort-intent

**Ticket:** fb_bfbdbcf0c2b4 (#3 of the 3-item "all" sequence; core of the Синергема epic fb_7fdd9f891109)
**Date:** 2026-07-04
**Status:** approved

## Goal

Replace the passive `niche` clustering key on `/alumni` with an active,
opt-in **effort-intent** — the type of shared effort a learner wants to
gather a синергема around ("синдицированная экономика на интересах",
"Социальный Дизайн Будущего"). `niche` (business vertical, passively
inherited from intake) becomes a secondary per-card tag. This is the
foundation of the matching engine — clustering IS the matching for now; no
recommender.

## Constraints

- **Effort-intent is the matching key.** A single keyed vocabulary of 5
  intents. `niche` is no longer a cluster key — it is a secondary tag inside
  each card.
- **Engine + keyed-data.** `lib/effort.ts` holds bilingual keyed data
  (`Bi { ru; en }`) + a `resolveEffort(locale, key)` resolver, mirroring
  `lib/course/niche-map.ts` (keyed `Record`) and `lib/course/certificate.ts`
  (resolver). All effort copy lives in this one module.
- **Authenticity / de-hustle.** Grounded, non-glossy tone. No urgency,
  scarcity, vanity metrics, or testimonials. Every effort string passes
  `lib/authoring/dehustle.ts` `lintDehustle` (drift-guard, `[]` = clean).
- **No-Mermaid** (pure React display).
- **Sole-prop, NEVER nonprofit.** No nonprofit / tax / donation framing.
- **Content-track-on-live-surface.** The feature renders on the already-live
  `/alumni` surface.
- **Prod D1 additive migration** applied via cloudflare-api MCP `/query`
  (NOT wrangler), **before** the code is pushed.
- **Trunk-based** on `main`; TDD; commit per task.

## Existing state (grep-verified)

- `/alumni` (email-gated opt-in) clusters by `niche`, passively inherited
  from `intake_profiles.niche` (Module F2 value). Opt-in captures only
  `alumni_contact` + `alumni_blurb` on `users`.
- `lib/synergem.ts` `clusterAlumni(entries)` groups strictly by `niche`
  (null → `'other'`), sorted count↓ then key↑, `'other'` always last.
- `workers/src/handlers/alumni.ts`: `handleAlumniList` / `handleAlumniMe` /
  `handleAlumniOptin`. All wrapped in try/catch that degrades to an
  empty/false response if columns are missing (pre-migration safe).
- Migrations run through `0014_academy.sql` → next is **`0015`**.
- No alumni-handler test exists (the try/catch-degrade handlers are
  build-validated only). `lib/synergem.test.ts` exists and keys on niche.

## Architecture

### 1. Migration `workers/migrations/0015_alumni_effort.sql`

```sql
-- 0015_alumni_effort.sql — synergem matching key (Phase C, fb_bfbdbcf0)
-- Additive, safe. Apply to prod D1 via cloudflare-api MCP /query BEFORE push:
--   INSERT/ALTER executed through mcp__plugin_cloudflare_cloudflare-api__execute (/query), not wrangler.
ALTER TABLE users ADD COLUMN alumni_effort TEXT;  -- effort-intent key: co-build|mastermind|teach-swap|clients|peer-support (null = undeclared)
```

Additive, nullable. Existing opted-in rows get `NULL` → cluster into
`'other'` until the learner re-saves with an intent.

### 2. `lib/effort.ts` — engine + keyed-data

```ts
import type { Bi } from '@/lib/rpg/types'
import type { Locale } from '@/lib/dictionaries'

export interface EffortIntent { key: string; label: Bi; line: Bi }

// Ordered — drives the opt-in selector.
export const EFFORT_INTENTS: EffortIntent[] = [ /* 5 below */ ]

export interface ResolvedEffort { label: string; line: string }

/** Localize an effort key. Returns null for null/unknown keys (e.g. 'other'),
 * so the caller renders its own fallback label. */
export function resolveEffort(locale: Locale, key: string | null): ResolvedEffort | null
```

`resolveEffort` looks the key up in `EFFORT_INTENTS` and maps `label`/`line`
through `[locale]`; unknown/null key → `null`.

#### Exact `EFFORT_INTENTS` content (5)

1. `co-build`
   - label — ru: `Со-строить продукт` · en: `Co-build`
   - line — ru: `Строим продукт или проект вместе.` · en: `Build a product or project together.`
2. `mastermind`
   - label — ru: `Мастермайнд` · en: `Mastermind`
   - line — ru: `Подотчётность и разбор на общей цели.` · en: `Accountability and review on a shared goal.`
3. `teach-swap`
   - label — ru: `Учить друг друга` · en: `Teach each other`
   - line — ru: `Обмен навыками: каждый и ученик, и учитель.` · en: `Trade skills — each of us both learner and teacher.`
4. `clients`
   - label — ru: `Клиенты вместе` · en: `Clients together`
   - line — ru: `Ищем и ведём клиентов сообща.` · en: `Find and serve clients together.`
5. `peer-support`
   - label — ru: `Держаться вместе` · en: `Stay together`
   - line — ru: `Спутники в пути — быть рядом, без общего проекта.` · en: `Companions on the path — presence, not a shared project.`

### 3. `lib/synergem.ts` — cluster on effort

```ts
export interface AlumniEntry {
  effort: string | null   // NEW — the cluster key
  niche: string | null    // now a secondary per-card tag
  contact: string | null
  blurb: string | null
}
export interface SynergemCluster { key: string; entries: AlumniEntry[]; count: number }

// Group by effort (null → 'other'), sorted size↓ then key↑, 'other' last.
export function clusterAlumni(entries: AlumniEntry[]): SynergemCluster[]
```

Same sort contract as today; only the grouping key changes from `niche` to
`effort`. `niche` is carried through on each entry untouched.

### 4. `workers/src/handlers/alumni.ts` — persist/return effort

- `handleAlumniList`: SELECT adds `u.alumni_effort AS effort`; `ORDER BY
  u.alumni_effort, u.created_at`. `niche` still via `LEFT JOIN
  intake_profiles`.
- `handleAlumniMe`: SELECT adds `alumni_effort AS effort`, return it.
- `handleAlumniOptin`: accept `body.effort`; validate against the 5 keys
  (`co-build|mastermind|teach-swap|clients|peer-support`); an unknown/absent
  value persists as `NULL`. `UPDATE ... SET alumni_effort = ?`.
- The interface `AlumniEntry` in this file gains `effort: string | null`.
- try/catch-degrade behaviour preserved (pre-migration → empty/false).

The valid-key list lives here as a small local `const` set (the worker
cannot import from the Next app under `LMS/` — monorepo boundary). The
canonical vocabulary is `lib/effort.ts`; this set mirrors its 5 keys. A code
comment cross-references the two so they stay in sync.

### 5. `components/alumni-client.tsx` — selector + render

- **Opt-in section** gains an effort-intent selector: the 5 `EFFORT_INTENTS`
  as a radio group (each shows `label` + muted `line`), plus the ability to
  leave it unselected ("пока не решил" — persists `NULL`). Wire the chosen
  key into the `save()` POST body as `effort`.
- **`me` load** hydrates the selected effort from `/api/alumni/me`.
- **Cluster headers** render the effort label via `resolveEffort(locale,
  key)` (`⬡ {label} · {count}`); the `'other'` key uses the existing
  `t.other` fallback.
- **Each card** keeps blurb + contact, and adds a small secondary `niche`
  tag (using the existing `NICHE_LABEL`), muted, below the blurb.
- `t.sub` copy nudged to mention gathering "вокруг общего типа усилия" /
  "around a shared type of effort". `invite()` copy unchanged.

### 6. Testing

- `lib/effort.test.ts` (env=node):
  - `EFFORT_INTENTS` has exactly 5 entries; keys are unique and equal
    `['co-build','mastermind','teach-swap','clients','peer-support']`.
  - `resolveEffort('ru'|'en', key)` returns non-empty `label`+`line` for each
    of the 5 keys; a sampled field differs between ru and en.
  - `resolveEffort(locale, null)` and `resolveEffort(locale, 'nonsense')`
    return `null`.
  - de-hustle: `lintDehustle` returns `[]` for every `label` and `line`
    string across both locales.
- `lib/synergem.test.ts` (rewrite): clusters key on `effort` (null →
  `'other'`); count/sort/`'other'`-last contract preserved; an entry's
  `niche` is carried through untouched onto the clustered entry.
- Backend: build-validated only (no handler test — mirrors existing
  precedent).
- Component: build-validated (mirror existing `/alumni` precedent).
- Gates: `npx tsc --noEmit`, `next build`, full `npx vitest run`, plus the
  prod D1 migration applied via cloudflare-api MCP `/query` before push.

## Decomposition → SDD tasks (writing-plans finalizes granularity)

1. `lib/effort.ts` engine + keyed-data + `lib/effort.test.ts`.
2. `lib/synergem.ts` re-key to `effort` + rewrite `lib/synergem.test.ts`.
3. Migration `0015` + `workers/src/handlers/alumni.ts` persist/return effort.
4. `components/alumni-client.tsx` opt-in selector + cluster render + niche tag.

## Out of scope

- Synthetic mentor (fb_c3a3d0), acceleration program (fb_daa79c), Web3/DAO
  governance (fb_029568) — dormant epic pillars.
- A full recommender / scoring / cross-effort suggestions. Clustering is the
  matching for now.
- Composite interest×effort keys (fragments a small alumni base into
  singletons — YAGNI).
- Any nonprofit framing.
- Changing how `niche` is captured (still passive from intake).
