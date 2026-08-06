# S.A.S.H.A Slice A — Publisher → academy-org config + rename

**Ticket:** fb_7f1d36587e18 (publisher rename, S.A.S.H.A follow-on)
**Date:** 2026-07-04
**Status:** approved

## Goal

Give the publisher/org name a single source of truth in `LMS/registry.json`
(`academy.org.name`), rename it from `Mamaev Institute for AI` to
`Synergify Institute for AI`, and point every consumer at that one source.
Today the name is a dead field on `COURSE` plus three independently
hardcoded copies. This slice removes the dead field and the duplication.

## Hard constraints

- **No nonprofit framing.** Sole-prop safe: the config holds a plain org
  *name* only — no `legalStatus`, `nonprofit`, `501c3`, `taxDeductible`,
  `donation`, or entity-type field. The word "Institute" in the brand name
  is acceptable; nonprofit/tax claims are not, and none are introduced.
- **Name is locale-invariant.** `Synergify Institute for AI` is a proper
  name — identical in `ru` and `en`. The locale-specific *wrapper prose*
  ("presented by" / "представлено · " / "Presented by" / "Курс представлен")
  stays where it already lives (dictionaries, certificate), composed around
  the org name.
- **Registry JSON is the SoT.** Consumers read `REGISTRY.academy.org.name`;
  no file re-declares the literal.
- **Trunk-based** on `main`; TDD; frequent commits.

## Scope — grep-verified sites

The current literal `Mamaev Institute for AI` appears in exactly these places
(nothing else; no JSON-LD publisher and no oferta page names it):

| File | Current | After |
|---|---|---|
| `lib/course.ts:19` | `publisher: 'Mamaev Institute for AI'` | **removed** — dead field, no consumer reads `COURSE.publisher` |
| `lib/course/certificate.ts:63-65` | hardcoded `publisher` `Bi` | composed: `{ ru: \`представлено · ${ORG}\`, en: \`presented by · ${ORG}\` }` |
| `lib/dictionaries.ts:430` | ru `presentedBy: 'Курс представлен Mamaev Institute for AI'` | composed with `${ORG}` |
| `lib/dictionaries.ts:694` | en `presentedBy: 'Presented by Mamaev Institute for AI'` | composed with `${ORG}` |
| `app/layout.tsx:51` | description `'…Presented by Mamaev Institute for AI.'` | composed with `ORG` |
| `app/layout.tsx:52` | `publisher: 'Mamaev Institute for AI'` (Next metadata) | `ORG` |
| `lib/course/certificate.test.ts:36-38` | asserts old name | asserts new name + derives from registry |

`ORG = REGISTRY.academy.org.name`.

## Design

### 1. Registry SoT

`LMS/registry.json` — `academy` object gains an `org`:

```json
"academy": {
  "name": "S.A.S.H.A",
  "fullName": { "ru": "Synergema Authentica Starseed Holon Academy", "en": "Synergema Authentica Starseed Holon Academy" },
  "url": "https://mamaev.coach/academy",
  "org": { "name": "Synergify Institute for AI" }
}
```

The academy *brand* (`name` = "S.A.S.H.A") and the publishing *org*
(`org.name` = "Synergify Institute for AI") are deliberately distinct fields:
the brand is what learners see, the org is who publishes/certifies.

### 2. Type + validation — `lib/academy/registry.ts`

- `AcademyRegistry.academy` gains `org: { name: string }`.
- `validateRegistry` gains one rule: `academy.org.name.trim().length === 0`
  → push `'academy.org.name is empty'`.
- No resolver needed; consumers read `REGISTRY.academy.org.name` directly
  (it is a plain, locale-invariant string).

### 3. Consumers

Each real consumer imports `REGISTRY` from `@/lib/academy/registry` and reads
`REGISTRY.academy.org.name`, composing its own locale-specific wrapper:

- **`lib/course.ts`** — delete the `publisher` line from `COURSE`. `Bi`
  stays (defined and exported here; `registry.ts` type-imports it).
- **`lib/course/certificate.ts`** — the `source.publisher` `Bi` is built from
  the org name: `{ ru: \`представлено · ${ORG}\`, en: \`presented by · ${ORG}\` }`.
- **`lib/dictionaries.ts`** — the two `presentedBy` strings compose the org
  name via template literal (`const ORG = REGISTRY.academy.org.name` at module
  top).
- **`app/layout.tsx`** — `publisher` metadata = `ORG`; the description string
  composes `ORG`.

### 4. Import-cycle note

`registry.ts` type-imports `Bi` from `course.ts` and `Locale` from
`dictionaries.ts`. These are `import type` — erased at compile, no runtime
edge. Consumers (`dictionaries.ts`, `certificate.ts`, `layout.tsx`) adding a
*value* import of `REGISTRY` therefore create no runtime cycle. Verified by a
successful `next build` + `tsc --noEmit` gate.

## Testing

- **registry validation** — a case where `academy.org.name` is `''` yields the
  `'academy.org.name is empty'` message; a valid registry yields `[]`.
- **certificate** — `resolveCertificate('ru'|'en').publisher` contains
  `REGISTRY.academy.org.name` (drift-guard: derives from registry, not a
  literal) and contains `Synergify Institute for AI`.
- **source drift-guard** — read the sources of `course.ts`, `certificate.ts`,
  `dictionaries.ts`, `layout.tsx`; assert none contains the literal
  `Mamaev Institute for AI`. (env=node source-read pattern, per
  media-transcript.test.ts.)
- **no-nonprofit guard** — assert `registry.json`'s `academy.org` has only a
  `name` key (no `nonprofit`/`legalStatus`/`taxDeductible`/etc.), locking the
  sacred constraint into a test.
- Gates: `npx tsc --noEmit` (lurking-tsc), `next build`.

## Out of scope

Nonprofit hub page (fb_3dc7f76f5f4e, sacred-blocked), JSON-LD / oferta
(do not exist), graphic logo, Slice B (DIYU manifesto). No engine behavior
change beyond the rename + single-sourcing.
