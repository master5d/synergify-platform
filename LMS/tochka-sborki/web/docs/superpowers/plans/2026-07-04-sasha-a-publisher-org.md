# S.A.S.H.A Slice A — Publisher → academy-org config + rename — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Single-source the publisher/org name in `LMS/registry.json`, rename `Mamaev Institute for AI` → `Synergify Institute for AI`, and point every consumer at that one source.

**Architecture:** `registry.json` gains `academy.org.name` (locale-invariant proper name). The typed loader (`lib/academy/registry.ts`) exposes it via `REGISTRY.academy.org.name` and validates it. The three real consumers (certificate, dictionaries, layout) compose their own locale-specific wrapper prose around that one string; the dead `COURSE.publisher` field is removed.

**Tech Stack:** Next 16 (`output: 'export'`), TypeScript, Vitest (env=node), Tailwind v4. Tests run from `LMS/tochka-sborki/web`.

## Global Constraints

- **No nonprofit framing.** `academy.org` holds a `name` key only — no `nonprofit`, `legalStatus`, `501c3`, `taxDeductible`, `donation`, or entity-type field. The word "Institute" in the brand name is fine; nonprofit/tax claims are forbidden and none are introduced.
- **Publisher name is locale-invariant:** `Synergify Institute for AI`, identical in `ru` and `en`. Locale-specific wrapper prose ("presented by" / "представлено · " / etc.) stays at each consumer.
- **Registry JSON is the SoT.** Consumers read `REGISTRY.academy.org.name`; no file re-declares the literal.
- **Trunk-based** on `main`; TDD; commit per task. `import type` back-edges (`registry.ts` type-imports `Bi`, `Locale`) are erased — value imports of `REGISTRY` create no runtime cycle.
- All commands below run from `LMS/tochka-sborki/web`. Commit messages end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

## File Structure

- `LMS/registry.json` — add `academy.org.name` (the SoT).
- `web/lib/academy/registry.ts` — extend `AcademyRegistry` type + `validateRegistry` rule.
- `web/lib/academy/registry.test.ts` — fixture + validation test + no-nonprofit shape guard.
- `web/lib/course/certificate.ts` — publisher `Bi` composed from `REGISTRY.academy.org.name`.
- `web/lib/course/certificate.test.ts` — replace old-name assertion with a registry-derived drift-guard.
- `web/lib/dictionaries.ts` — two `presentedBy` strings composed from `ORG`.
- `web/app/layout.tsx` — `publisher` metadata + description composed from `REGISTRY.academy.org.name`.
- `web/lib/course.ts` — remove the dead `publisher` field.
- `web/lib/academy/publisher-rename.test.ts` — source drift-guard: old literal gone from all consumers.

---

## Task 1: Registry org SoT + type + validation

**Files:**
- Modify: `LMS/registry.json`
- Modify: `web/lib/academy/registry.ts:20-23` (the `AcademyRegistry` interface) and `web/lib/academy/registry.ts:40-48` (inside `validateRegistry`)
- Test: `web/lib/academy/registry.test.ts`

**Interfaces:**
- Consumes: nothing (foundation task).
- Produces: `REGISTRY.academy.org.name: string` === `'Synergify Institute for AI'`. `AcademyRegistry.academy` gains `org: { name: string }`. `validateRegistry` emits `'academy.org.name is empty'` when blank.

- [ ] **Step 1: Update the test fixture + add the failing validation and shape tests**

In `web/lib/academy/registry.test.ts`, update `sample()` so its `academy` includes `org` (add the line after `url: null,`):

```ts
    academy: {
      name: 'S.A.S.H.A',
      fullName: { ru: 'Академия', en: 'Academy' },
      url: null,
      org: { name: 'Synergify Institute for AI' },
    },
```

Then add two tests inside the `describe('validateRegistry', ...)` block (after the `flags academy.url with trailing slash` test):

```ts
  it('flags empty academy.org.name', () => {
    const r = sample()
    r.academy.org.name = '  '
    expect(validateRegistry(r)).toContain('academy.org.name is empty')
  })
```

And add a new top-level block after the `describe('REGISTRY (committed LMS/registry.json)', ...)` block:

```ts
describe('academy.org sacred shape', () => {
  it('carries a name only — no nonprofit/legal-status keys', () => {
    expect(Object.keys(REGISTRY.academy.org)).toEqual(['name'])
    expect(REGISTRY.academy.org.name).toBe('Synergify Institute for AI')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/academy/registry.test.ts`
Expected: FAIL — `org` does not exist on the fixture's `academy` type / `REGISTRY.academy.org` is undefined.

- [ ] **Step 3: Add `org` to the registry JSON**

In `LMS/registry.json`, change the `academy` object to (add the `org` line):

```json
  "academy": {
    "name": "S.A.S.H.A",
    "fullName": {
      "ru": "Synergema Authentica Starseed Holon Academy",
      "en": "Synergema Authentica Starseed Holon Academy"
    },
    "url": "https://mamaev.coach/academy",
    "org": { "name": "Synergify Institute for AI" }
  },
```

- [ ] **Step 4: Extend the type + validation**

In `web/lib/academy/registry.ts`, change the `AcademyRegistry` interface's `academy` line to:

```ts
export interface AcademyRegistry {
  academy: { name: string; fullName: Bi; url: string | null; org: { name: string } }
  courses: CourseEntry[]
}
```

Then, inside `validateRegistry`, add this rule right after the `academy.url` check (the `if (r.academy.url !== null ...)` block):

```ts
  if (r.academy.org.name.trim().length === 0) errors.push('academy.org.name is empty')
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run lib/academy/registry.test.ts`
Expected: PASS (all cases, including the untouched `round-trips validation cleanly`).

- [ ] **Step 6: Commit**

```bash
git add LMS/registry.json LMS/tochka-sborki/web/lib/academy/registry.ts LMS/tochka-sborki/web/lib/academy/registry.test.ts
git commit -m "feat(academy): add org.name to registry SoT (Synergify Institute for AI)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: Certificate publisher from registry

**Files:**
- Modify: `web/lib/course/certificate.ts:6-8` (imports) and `:63-66` (the `publisher` block)
- Test: `web/lib/course/certificate.test.ts:36-39`

**Interfaces:**
- Consumes: `REGISTRY.academy.org.name` from Task 1.
- Produces: `resolveCertificate(locale).publisher` contains `REGISTRY.academy.org.name`.

- [ ] **Step 1: Rewrite the failing publisher test**

In `web/lib/course/certificate.test.ts`, add the import at the top (after line 3):

```ts
import { REGISTRY } from '@/lib/academy/registry'
```

Replace the test at lines 36-39 (`keeps the publisher referencing the current institute …`) with:

```ts
  it('derives the publisher from the academy org registry in both locales', () => {
    const org = REGISTRY.academy.org.name
    expect(org).toBe('Synergify Institute for AI')
    expect(resolveCertificate('en').publisher).toContain(org)
    expect(resolveCertificate('ru').publisher).toContain(org)
  })
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/course/certificate.test.ts`
Expected: FAIL — `publisher` still contains `Mamaev Institute for AI`, not `Synergify Institute for AI`.

- [ ] **Step 3: Compose the certificate publisher from the registry**

In `web/lib/course/certificate.ts`, add the import after the existing `import type { Locale }` line (line 6):

```ts
import { REGISTRY } from '@/lib/academy/registry'
```

Add a module-scope constant right after the imports (before `interface Bi`):

```ts
const ORG = REGISTRY.academy.org.name
```

Replace the `publisher` block (lines 63-66):

```ts
  publisher: {
    ru: `представлено · ${ORG}`,
    en: `presented by · ${ORG}`,
  },
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/course/certificate.test.ts`
Expected: PASS (all five cases).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/course/certificate.ts LMS/tochka-sborki/web/lib/course/certificate.test.ts
git commit -m "feat(academy): certificate publisher reads registry org name

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 3: Dictionaries + layout consumers, remove dead field, source drift-guard

**Files:**
- Modify: `web/lib/dictionaries.ts:1` (add import + `ORG`), `:430` (ru `presentedBy`), `:694` (en `presentedBy`)
- Modify: `web/app/layout.tsx` (imports, `:51` description, `:52` publisher)
- Modify: `web/lib/course.ts:19` (remove dead `publisher`)
- Test (create): `web/lib/academy/publisher-rename.test.ts`

**Interfaces:**
- Consumes: `REGISTRY.academy.org.name` from Task 1.
- Produces: no consumer source contains the literal `Mamaev Institute for AI`; `COURSE` no longer has a `publisher` field.

- [ ] **Step 1: Write the failing source drift-guard**

Create `web/lib/academy/publisher-rename.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Vitest runs from the web/ package root, so these are web-relative paths.
const SOURCES = [
  'lib/course.ts',
  'lib/course/certificate.ts',
  'lib/dictionaries.ts',
  'app/layout.tsx',
]

describe('publisher rename drift-guard', () => {
  it('no consumer source still hardcodes the old institute name', () => {
    for (const rel of SOURCES) {
      const src = readFileSync(join(process.cwd(), rel), 'utf8')
      expect(src, rel).not.toContain('Mamaev Institute for AI')
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/academy/publisher-rename.test.ts`
Expected: FAIL — `lib/dictionaries.ts` and `app/layout.tsx` still contain `Mamaev Institute for AI`.

- [ ] **Step 3: Compose the dictionaries `presentedBy` strings**

In `web/lib/dictionaries.ts`, add as the very first line of the file:

```ts
import { REGISTRY } from './academy/registry'
```

Add this constant on the next line after that import (before `export type Locale`):

```ts
const ORG = REGISTRY.academy.org.name
```

Change the ru `presentedBy` (line ~430) to:

```ts
      presentedBy: `Курс представлен ${ORG}`,
```

Change the en `presentedBy` (line ~694) to:

```ts
      presentedBy: `Presented by ${ORG}`,
```

- [ ] **Step 4: Point layout metadata at the registry**

In `web/app/layout.tsx`, add after the existing `COURSE` import:

```ts
import { REGISTRY } from '@/lib/academy/registry'
```

Change the description (line 51) and publisher (line 52) to:

```ts
  description: `Открытый курс по AI-разработке и агентному программированию. Presented by ${REGISTRY.academy.org.name}.`,
  publisher: REGISTRY.academy.org.name,
```

- [ ] **Step 5: Remove the dead `publisher` field from COURSE**

In `web/lib/course.ts`, delete line 19 entirely:

```ts
  publisher: 'Mamaev Institute for AI',
```

(The closing `} as const` and every other field stay. No consumer reads `COURSE.publisher` — verified by grep.)

- [ ] **Step 6: Run the drift-guard + the full suite to verify green**

Run: `npx vitest run lib/academy/publisher-rename.test.ts`
Expected: PASS.

Run: `npx vitest run`
Expected: PASS — whole suite green (dictionaries, certificate, registry, layout consumers all consistent).

- [ ] **Step 7: Type gate (lurking-tsc)**

Run: `npx tsc --noEmit`
Expected: no errors. (Catches type errors that Vitest/esbuild and `next build` would otherwise miss, e.g. a stale `COURSE.publisher` reference or the new `org` type.)

- [ ] **Step 8: Commit**

```bash
git add LMS/tochka-sborki/web/lib/dictionaries.ts LMS/tochka-sborki/web/app/layout.tsx LMS/tochka-sborki/web/lib/course.ts LMS/tochka-sborki/web/lib/academy/publisher-rename.test.ts
git commit -m "feat(academy): single-source publisher across dictionaries + layout, drop dead COURSE.publisher

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage:**
- Registry SoT `academy.org.name` → Task 1. ✅
- Type + validation rule → Task 1. ✅
- Rename to `Synergify Institute for AI` → Tasks 1-3 (all consumers). ✅
- Remove dead `COURSE.publisher` → Task 3. ✅
- certificate/dictionaries/layout consumers → Tasks 2-3. ✅
- Tests: registry validation, no-nonprofit shape guard (Task 1); certificate registry-derived drift-guard (Task 2); source drift-guard (Task 3); tsc + full-suite gates (Task 3). ✅
- No JSON-LD/oferta work (do not exist) — correctly out of scope. ✅

**2. Placeholder scan:** No TBD/TODO; every code step shows exact content. ✅

**3. Type consistency:** `ORG` / `REGISTRY.academy.org.name` used identically across Tasks 2-3; `AcademyRegistry.academy.org: { name: string }` defined in Task 1 matches every consumer read; the string literal `'Synergify Institute for AI'` is consistent in the JSON, the fixture, and both assertions. ✅
