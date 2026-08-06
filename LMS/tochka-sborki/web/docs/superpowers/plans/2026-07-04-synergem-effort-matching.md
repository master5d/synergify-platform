# Синергема Effort-Intent Matching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the passive `niche` clustering key on `/alumni` with an active opt-in **effort-intent** (5-key vocabulary), making `niche` a secondary per-card tag — the foundation of the синергема matching engine.

**Architecture:** A keyed-data engine module (`lib/effort.ts`, mirroring `lib/course/niche-map.ts` + `certificate.ts`) holds the 5 bilingual effort intents + a resolver. `lib/synergem.ts` re-keys `clusterAlumni` from `niche` to `effort`. A D1 migration adds `users.alumni_effort`; the worker handlers persist/return it. The `/alumni` client gains an opt-in selector and renders clusters by effort label with a secondary niche tag.

**Tech Stack:** TypeScript, Next.js (App Router, `LMS/tochka-sborki/web`), Cloudflare Workers + D1 (`workers/`), Vitest.

## Global Constraints

- **Effort-intent is the matching key**; `niche` is a secondary per-card tag, no longer a cluster key.
- **Engine + keyed-data**: `lib/effort.ts` holds `Bi { ru; en }` data + `resolveEffort(locale, key)` resolver. `Bi` imported from `@/lib/rpg/types`; `Locale` from `@/lib/dictionaries`.
- **The 5 effort keys, verbatim**: `co-build`, `mastermind`, `teach-swap`, `clients`, `peer-support`.
- **De-hustle**: every effort string passes `lintDehustle` (from `@/lib/authoring/dehustle`); `[]` = clean. No urgency/scarcity/vanity/testimonials.
- **Sole-prop, NEVER nonprofit** — no nonprofit/tax/donation framing.
- **No-Mermaid** — pure React display.
- **Prod D1 migration is additive**, applied via **cloudflare-api MCP `/query`** (NOT wrangler), **before** the branch is pushed.
- **Monorepo boundary**: `workers/` cannot import from the Next app under `LMS/`. The worker's key-validation set is a local `const`, cross-referenced by comment to `lib/effort.ts`.
- **Trunk-based** on `main`; TDD; commit per task.

---

### Task 1: `lib/effort.ts` engine + keyed-data

**Files:**
- Create: `LMS/tochka-sborki/web/lib/effort.ts`
- Test: `LMS/tochka-sborki/web/lib/effort.test.ts`

**Interfaces:**
- Consumes: `Bi` from `@/lib/rpg/types`; `Locale` from `@/lib/dictionaries`; `lintDehustle` from `@/lib/authoring/dehustle`.
- Produces:
  - `interface EffortIntent { key: string; label: Bi; line: Bi }`
  - `const EFFORT_INTENTS: EffortIntent[]` (ordered, 5 entries)
  - `interface ResolvedEffort { label: string; line: string }`
  - `function resolveEffort(locale: Locale, key: string | null): ResolvedEffort | null`

- [ ] **Step 1: Write the failing test**

Create `LMS/tochka-sborki/web/lib/effort.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { EFFORT_INTENTS, resolveEffort } from './effort'
import { lintDehustle } from './authoring/dehustle'

describe('EFFORT_INTENTS', () => {
  it('has exactly the 5 expected keys in order', () => {
    expect(EFFORT_INTENTS.map(i => i.key)).toEqual([
      'co-build', 'mastermind', 'teach-swap', 'clients', 'peer-support',
    ])
  })

  it('has unique keys', () => {
    const keys = EFFORT_INTENTS.map(i => i.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has non-empty ru+en label and line for every intent', () => {
    for (const i of EFFORT_INTENTS) {
      expect(i.label.ru.trim().length).toBeGreaterThan(0)
      expect(i.label.en.trim().length).toBeGreaterThan(0)
      expect(i.line.ru.trim().length).toBeGreaterThan(0)
      expect(i.line.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('is de-hustle clean across every label and line, both locales', () => {
    for (const i of EFFORT_INTENTS) {
      for (const s of [i.label.ru, i.label.en, i.line.ru, i.line.en]) {
        expect(lintDehustle(s)).toEqual([])
      }
    }
  })
})

describe('resolveEffort', () => {
  it('localizes each known key (ru differs from en)', () => {
    const ru = resolveEffort('ru', 'co-build')!
    const en = resolveEffort('en', 'co-build')!
    expect(ru.label.length).toBeGreaterThan(0)
    expect(en.label.length).toBeGreaterThan(0)
    expect(ru.label).not.toBe(en.label)
  })

  it('resolves all 5 keys to non-empty label+line', () => {
    for (const i of EFFORT_INTENTS) {
      const r = resolveEffort('ru', i.key)!
      expect(r.label.length).toBeGreaterThan(0)
      expect(r.line.length).toBeGreaterThan(0)
    }
  })

  it('returns null for a null key', () => {
    expect(resolveEffort('ru', null)).toBeNull()
  })

  it('returns null for an unknown key', () => {
    expect(resolveEffort('ru', 'nonsense')).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/effort.test.ts`
Expected: FAIL — `Cannot find module './effort'`.

- [ ] **Step 3: Write minimal implementation**

Create `LMS/tochka-sborki/web/lib/effort.ts`:

```ts
// lib/effort.ts
// Синергема matching engine (Phase C, fb_bfbdbcf0). Keyed-data vocabulary of effort-intents —
// the ACTIVE opt-in signal a learner declares to gather a синергема. This replaces the passive
// `niche` as the clustering key (niche becomes a secondary per-card tag). Mirrors the
// engine+keyed-data pattern of lib/course/niche-map.ts + certificate.ts. All effort copy lives
// here; every string is de-hustle clean (lib/effort.test.ts asserts lintDehustle []).
import type { Bi } from '@/lib/rpg/types'
import type { Locale } from '@/lib/dictionaries'

export interface EffortIntent { key: string; label: Bi; line: Bi }

// Ordered — drives the /alumni opt-in selector. The 5 keys are canonical; the worker mirrors
// them in a local validation set (monorepo boundary — see workers/src/handlers/alumni.ts).
export const EFFORT_INTENTS: EffortIntent[] = [
  {
    key: 'co-build',
    label: { ru: 'Со-строить продукт', en: 'Co-build' },
    line: { ru: 'Строим продукт или проект вместе.', en: 'Build a product or project together.' },
  },
  {
    key: 'mastermind',
    label: { ru: 'Мастермайнд', en: 'Mastermind' },
    line: { ru: 'Подотчётность и разбор на общей цели.', en: 'Accountability and review on a shared goal.' },
  },
  {
    key: 'teach-swap',
    label: { ru: 'Учить друг друга', en: 'Teach each other' },
    line: { ru: 'Обмен навыками: каждый и ученик, и учитель.', en: 'Trade skills — each of us both learner and teacher.' },
  },
  {
    key: 'clients',
    label: { ru: 'Клиенты вместе', en: 'Clients together' },
    line: { ru: 'Ищем и ведём клиентов сообща.', en: 'Find and serve clients together.' },
  },
  {
    key: 'peer-support',
    label: { ru: 'Держаться вместе', en: 'Stay together' },
    line: { ru: 'Спутники в пути — быть рядом, без общего проекта.', en: 'Companions on the path — presence, not a shared project.' },
  },
]

export interface ResolvedEffort { label: string; line: string }

/** Localize an effort key. Returns null for a null/unknown key (e.g. 'other'),
 *  so the caller renders its own fallback label. */
export function resolveEffort(locale: Locale, key: string | null): ResolvedEffort | null {
  if (!key) return null
  const intent = EFFORT_INTENTS.find(i => i.key === key)
  if (!intent) return null
  return { label: intent.label[locale], line: intent.line[locale] }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/effort.test.ts`
Expected: PASS (all tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/effort.ts LMS/tochka-sborki/web/lib/effort.test.ts
git commit -m "feat(synergem): effort-intent keyed-data engine (fb_bfbdbcf0)"
```

---

### Task 2: `lib/synergem.ts` re-key to effort

**Files:**
- Modify: `LMS/tochka-sborki/web/lib/synergem.ts`
- Test: `LMS/tochka-sborki/web/lib/synergem.test.ts` (rewrite)

**Interfaces:**
- Consumes: nothing new (self-contained clustering).
- Produces:
  - `interface AlumniEntry { effort: string | null; niche: string | null; contact: string | null; blurb: string | null }`
  - `interface SynergemCluster { key: string; entries: AlumniEntry[]; count: number }` (unchanged shape)
  - `function clusterAlumni(entries: AlumniEntry[]): SynergemCluster[]` — now keys on `effort`.

- [ ] **Step 1: Rewrite the test to key on effort**

Replace the entire contents of `LMS/tochka-sborki/web/lib/synergem.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { clusterAlumni, type AlumniEntry } from './synergem'

const e = (effort: string | null, niche: string | null = null, blurb = 'x'): AlumniEntry =>
  ({ effort, niche, contact: 'c', blurb })

describe('clusterAlumni', () => {
  it('groups entries by effort into synergem clusters with counts', () => {
    const clusters = clusterAlumni([e('co-build'), e('co-build'), e('mastermind')])
    const cobuild = clusters.find(c => c.key === 'co-build')!
    expect(cobuild.count).toBe(2)
    expect(cobuild.entries).toHaveLength(2)
    expect(clusters.find(c => c.key === 'mastermind')!.count).toBe(1)
  })

  it('maps a null effort to the "other" cluster', () => {
    const clusters = clusterAlumni([e(null)])
    expect(clusters).toHaveLength(1)
    expect(clusters[0].key).toBe('other')
  })

  it('sorts clusters by count desc, then key asc, with "other" always last', () => {
    const clusters = clusterAlumni([e(null), e('mastermind'), e('co-build'), e('co-build')])
    expect(clusters.map(c => c.key)).toEqual(['co-build', 'mastermind', 'other'])
  })

  it('carries each entry\'s niche through untouched', () => {
    const clusters = clusterAlumni([e('co-build', 'coach')])
    expect(clusters[0].entries[0].niche).toBe('coach')
  })

  it('returns an empty array for no entries', () => {
    expect(clusterAlumni([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/synergem.test.ts`
Expected: FAIL — current `clusterAlumni` keys on `niche` and `AlumniEntry` has no `effort` field (type error / wrong cluster keys).

- [ ] **Step 3: Re-key the implementation**

Replace the entire contents of `LMS/tochka-sborki/web/lib/synergem.ts`:

```ts
// web/lib/synergem.ts
// Phase C of the синергема networking feature (epic fb_7fdd9f891109): cluster opted-in learners
// by their ACTIVE opt-in EFFORT-INTENT («синдицированная экономика на интересах»,
// "Социальный Дизайн Будущего") — the type of shared effort they want to gather a синергема
// around. `niche` (business vertical, passive from intake) is now a secondary per-card tag, not
// the cluster key. Vocabulary lives in lib/effort.ts. Pure clustering only; synthetic mentors /
// acceleration / ИГИ / DAO governance are split into follow-on tickets.

export interface AlumniEntry {
  effort: string | null   // the cluster key (effort-intent)
  niche: string | null    // secondary per-card tag
  contact: string | null
  blurb: string | null
}
export interface SynergemCluster { key: string; entries: AlumniEntry[]; count: number }

/** Group entries into synergem clusters by effort (null → 'other'), sorted by size then key,
 * with 'other' always last. */
export function clusterAlumni(entries: AlumniEntry[]): SynergemCluster[] {
  const byKey = new Map<string, AlumniEntry[]>()
  for (const e of entries) {
    const k = e.effort ?? 'other'
    ;(byKey.get(k) ?? byKey.set(k, []).get(k)!).push(e)
  }
  return [...byKey.entries()]
    .map(([key, es]) => ({ key, entries: es, count: es.length }))
    .sort((a, b) => {
      if (a.key === 'other') return 1
      if (b.key === 'other') return -1
      return b.count - a.count || a.key.localeCompare(b.key)
    })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd LMS/tochka-sborki/web && npx vitest run lib/synergem.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/synergem.ts LMS/tochka-sborki/web/lib/synergem.test.ts
git commit -m "feat(synergem): cluster by effort-intent, niche becomes secondary tag (fb_bfbdbcf0)"
```

---

### Task 3: Migration `0015` + worker handlers persist/return effort

**Files:**
- Create: `workers/migrations/0015_alumni_effort.sql`
- Modify: `workers/src/handlers/alumni.ts`

**Interfaces:**
- Consumes: the 5 canonical effort keys (mirrored locally — monorepo boundary).
- Produces: `AlumniEntry` in this handler file gains `effort: string | null`; `/api/alumni`, `/api/alumni/me` return `effort`; `/api/alumni/optin` accepts and persists `effort`.

> **Note — no handler unit test exists for this file** (the try/catch-degrade handlers are build-validated only, per the existing precedent). This task is verified by `npx tsc --noEmit` in `workers/` and does not add a handler test. Do not fabricate one.

- [ ] **Step 1: Create the migration**

Create `workers/migrations/0015_alumni_effort.sql`:

```sql
-- 0015_alumni_effort.sql — synergem matching key (Phase C, fb_bfbdbcf0)
-- Additive, safe. Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE push.
-- Existing opted-in rows get NULL → they cluster into 'other' until the learner re-saves.
ALTER TABLE users ADD COLUMN alumni_effort TEXT;  -- effort-intent key: co-build|mastermind|teach-swap|clients|peer-support (null = undeclared)
```

- [ ] **Step 2: Update the handlers**

Replace the entire contents of `workers/src/handlers/alumni.ts`:

```ts
// Alumni networking directory (Phase C) — strict opt-in, no email exposed.
// A learner opts in with a contact handle + one-line blurb + an EFFORT-INTENT (the type of
// shared effort they want to gather a синергема around). Opted-in learners see each other
// clustered by effort. `niche` (from intake_profiles) is a secondary tag, not the cluster key.
import type { Env } from '../lib/types'

// Canonical effort-intent keys. MIRRORS lib/effort.ts EFFORT_INTENTS (monorepo boundary:
// workers/ cannot import from the Next app under LMS/). Keep these two in sync.
const EFFORT_KEYS = new Set(['co-build', 'mastermind', 'teach-swap', 'clients', 'peer-support'])

export interface AlumniEntry {
  effort: string | null
  niche: string | null
  contact: string | null
  blurb: string | null
}

/** List opted-in alumni (visible to any authed learner). Degrades to [] if the migration
 *  hasn't been applied yet (missing columns) so prod never 500s before go-live. */
export async function handleAlumniList(db: D1Database): Promise<Response> {
  try {
    const { results } = await db.prepare(
      `SELECT u.alumni_effort AS effort, p.niche AS niche, u.alumni_contact AS contact, u.alumni_blurb AS blurb
       FROM users u LEFT JOIN intake_profiles p ON p.user_id = u.id
       WHERE u.alumni_optin = 1
       ORDER BY u.alumni_effort, u.created_at`
    ).all<AlumniEntry>()
    return Response.json({ alumni: results ?? [] })
  } catch {
    // Columns not present yet (pre-migration) — empty directory rather than an error.
    return Response.json({ alumni: [] })
  }
}

/** Get / set the requester's own opt-in state. */
export async function handleAlumniMe(db: D1Database, userId: string): Promise<Response> {
  try {
    const row = await db.prepare(
      'SELECT alumni_optin AS optin, alumni_contact AS contact, alumni_blurb AS blurb, alumni_effort AS effort FROM users WHERE id = ?'
    ).bind(userId).first<{ optin: number; contact: string | null; blurb: string | null; effort: string | null }>()
    return Response.json({ optin: !!row?.optin, contact: row?.contact ?? null, blurb: row?.blurb ?? null, effort: row?.effort ?? null })
  } catch {
    return Response.json({ optin: false, contact: null, blurb: null, effort: null })
  }
}

export async function handleAlumniOptin(
  db: D1Database,
  userId: string,
  body: { optin?: boolean; contact?: string; blurb?: string; effort?: string }
): Promise<Response> {
  const optin = body.optin ? 1 : 0
  const contact = (body.contact ?? '').trim().slice(0, 120) || null
  const blurb = (body.blurb ?? '').trim().slice(0, 200) || null
  const effort = body.effort && EFFORT_KEYS.has(body.effort) ? body.effort : null
  if (optin && !contact) return Response.json({ error: 'contact required to opt in' }, { status: 400 })
  try {
    await db.prepare('UPDATE users SET alumni_optin = ?, alumni_contact = ?, alumni_blurb = ?, alumni_effort = ? WHERE id = ?')
      .bind(optin, contact, blurb, effort, userId).run()
    return Response.json({ ok: true, optin: !!optin, contact, blurb, effort })
  } catch {
    return Response.json({ error: 'alumni storage not ready (migration 0015 pending)' }, { status: 503 })
  }
}
```

- [ ] **Step 3: Typecheck the worker**

Run: `cd workers && npx tsc --noEmit`
Expected: PASS (no type errors). If `Env` is reported unused, it was already imported in the original file — leave the import as-is (it matches the file's existing style); if tsc flags it as an error under the worker's config, remove the now-unused `import type { Env }` line.

- [ ] **Step 4: Commit**

```bash
git add workers/migrations/0015_alumni_effort.sql workers/src/handlers/alumni.ts
git commit -m "feat(synergem): persist/return alumni effort-intent + migration 0015 (fb_bfbdbcf0)"
```

> **Migration application (controller, not the implementer):** after this task's commit and before the final push, apply `0015` to prod D1 via cloudflare-api MCP `/query` (NOT wrangler). Verify `alumni_effort` exists on `users` before pushing.

---

### Task 4: `/alumni` opt-in selector + cluster render by effort

**Files:**
- Modify: `LMS/tochka-sborki/web/components/alumni-client.tsx`

**Interfaces:**
- Consumes: `EFFORT_INTENTS`, `resolveEffort` from `@/lib/effort`; `clusterAlumni`, `AlumniEntry` from `@/lib/synergem` (now `effort`-keyed with a `niche` field); existing `NICHE_LABEL`.
- Produces: nothing downstream (leaf UI). Build-validated.

> **Note:** this task is presentational and has no unit test (mirrors the existing `/alumni` precedent). Verified by `npx tsc --noEmit` + `npx next build`.

- [ ] **Step 1: Add the effort import**

In `LMS/tochka-sborki/web/components/alumni-client.tsx`, after the existing `import { clusterAlumni, type AlumniEntry as Entry } from '@/lib/synergem'` line, add:

```ts
import { EFFORT_INTENTS, resolveEffort } from '@/lib/effort'
```

- [ ] **Step 2: Add effort state and hydrate it**

Add an `effort` state alongside the existing `contact`/`blurb` state (after the `const [blurb, setBlurb] = useState('')` line):

```ts
  const [effort, setEffort] = useState<string>('')
```

In the `fetch('/api/alumni/me', ...)` `.then(me => {...})` callback, extend the hydration to include effort:

```ts
      .then(me => { if (me) { setOptin(!!me.optin); setContact(me.contact ?? ''); setBlurb(me.blurb ?? ''); setEffort(me.effort ?? '') } })
```

- [ ] **Step 3: Send effort in the save() POST**

In `save()`, extend the POST body to include `effort`:

```ts
      body: JSON.stringify({ optin, contact, blurb, effort: effort || undefined }),
```

- [ ] **Step 4: Render the effort selector**

Inside the opt-in `<section>`, after the `<input ... placeholder={t.blurb} .../>` line and before the save `<button>`, add a radio-group selector. Use the existing `input` CSS-var style vocabulary for consistency:

```tsx
            <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
              <legend style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{t.effortLegend}</legend>
              {EFFORT_INTENTS.map(i => {
                const r = resolveEffort(locale, i.key)!
                return (
                  <label key={i.key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input type="radio" name="effort" checked={effort === i.key} onChange={() => setEffort(i.key)} style={{ marginTop: '0.2rem' }} />
                    <span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{r.label}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}> — {r.line}</span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
```

- [ ] **Step 5: Add the effort legend copy**

Extend both the `en` and `ru` branches of the `t` object with an `effortLegend` key. In the `en` branch add:

```ts
      effortLegend: 'What do you want to gather a synergem around?',
```

In the `ru` branch add:

```ts
      effortLegend: 'Вокруг чего хочешь собрать синергему?',
```

- [ ] **Step 6: Render clusters by effort label + niche secondary tag**

Replace the cluster `nicheLabel` helper and the cluster-header `<h2>` so the header uses the resolved **effort** label (falling back to `t.other` for the `'other'` key), and add a small secondary niche tag on each card.

First, replace the existing `nicheLabel` helper line:

```ts
  const nicheLabel = (k: string) => k === 'other' ? t.other : (NICHE_LABEL[k]?.[en ? 'en' : 'ru'] ?? k)
```

with an effort-label helper (kept alongside the existing `NICHE_LABEL` for the per-card tag):

```ts
  const effortLabel = (k: string) => k === 'other' ? t.other : (resolveEffort(locale, k)?.label ?? k)
  const nicheTag = (k: string | null) => k ? (NICHE_LABEL[k]?.[en ? 'en' : 'ru'] ?? k) : null
```

Then, in the cluster header `<h2>`, replace `{nicheLabel(k)}` with `{effortLabel(k)}`.

Then, inside each card `<li>`, after the `contact` `<div>`, add the niche tag:

```tsx
                  {nicheTag(e.niche) && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>⬡ {nicheTag(e.niche)}</div>}
```

- [ ] **Step 7: Nudge the `sub` copy to mention effort**

In the `t` object, update the `sub` copy so it names the effort framing. In the `en` branch, change the opening of `sub` from `Opt-in clusters of fellow learners forming around a shared interest and effort.` to:

```
Opt-in clusters of fellow learners, gathered by the type of shared effort you choose.
```

In the `ru` branch, change the opening of `sub` from `Opt-in кластеры соучеников, что собираются вокруг общего интереса и усилия.` to:

```
Opt-in кластеры соучеников, собранные по выбранному типу общего усилия.
```

(Leave the rest of each `sub` string unchanged.)

- [ ] **Step 8: Typecheck and build**

Run: `cd LMS/tochka-sborki/web && npx tsc --noEmit && npx next build`
Expected: PASS — no type errors, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add LMS/tochka-sborki/web/components/alumni-client.tsx
git commit -m "feat(synergem): /alumni effort-intent selector + cluster-by-effort render (fb_bfbdbcf0)"
```

---

## Notes for the controller

- **Migration before push**: after Task 3, apply `0015_alumni_effort.sql` to prod D1 via cloudflare-api MCP `/query` (NOT wrangler); confirm the column exists before the branch is pushed.
- **Final gates** (whole branch): `cd LMS/tochka-sborki/web && npx vitest run && npx tsc --noEmit && npx next build`; `cd workers && npx tsc --noEmit`.
- **Vocabulary sync**: `lib/effort.ts` `EFFORT_INTENTS` keys and the worker's `EFFORT_KEYS` set must list the same 5 keys.
