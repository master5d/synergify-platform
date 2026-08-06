# S.A.S.H.A S1 — Multi-Course Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A repo-level `LMS/registry.json` (academy + course list, SoT) with a typed loader/validator in the LMS engine, so any surface can read which academy courses exist.

**Architecture:** JSON source of truth at `LMS/registry.json` (repo cross-app precedent: emitted JSON, not source imports). The engine gains `lib/academy/registry.ts`: types, a static-import `REGISTRY`, `validateRegistry` (string[] findings, mirrors `validateOutline`), and `resolveCourses(locale)` for the future catalog UI. A drift-guard test pins the registry entry to `COURSE`. Dark-ship: nothing imports the registry yet.

**Tech Stack:** Next.js 16 (`output: 'export'`, Turbopack), TypeScript, Vitest (env=node).

## Global Constraints

- Working app dir: `LMS/tochka-sborki/web` — **`tochka-sborki`, NO second "s"**. Before committing, self-check staged paths: `git diff --cached --name-only | grep tochka-sborski` must print nothing.
- All git commands run from the repo root `C:\telo\Efforts\Ongoing\mc_hub`.
- No new dependencies. No live LLM/network calls. No UI changes in this slice.
- Registry ships with exactly ONE course entry (`tochka-sborki`) — no fabricated/placeholder courses.
- Bi = `{ ru: string; en: string }` from `@/lib/course`; `Locale = 'ru' | 'en'` from `@/lib/dictionaries` (NOT from `@/lib/course`).
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `LMS/registry.json` + typed loader + `validateRegistry` (TDD)

**Files:**
- Create: `LMS/registry.json`
- Create: `LMS/tochka-sborki/web/lib/academy/registry.ts`
- Modify: `LMS/tochka-sborki/web/next.config.ts` (whole file shown below)
- Test: `LMS/tochka-sborki/web/lib/academy/registry.test.ts`

**Interfaces:**
- Consumes: `Bi` from `@/lib/course`, `Locale` from `@/lib/dictionaries`.
- Produces: `CourseStatus`, `CourseEntry`, `AcademyRegistry`, `REGISTRY: AcademyRegistry`, `validateRegistry(r: AcademyRegistry): string[]` — Task 2 builds `resolveCourses` beside them in the same file.

- [ ] **Step 1: Create `LMS/registry.json`** (exact content):

```json
{
  "academy": {
    "name": "S.A.S.H.A",
    "fullName": {
      "ru": "Synergema Authentica Starseed Holon Academy",
      "en": "Synergema Authentica Starseed Holon Academy"
    },
    "url": null
  },
  "courses": [
    {
      "slug": "tochka-sborki",
      "name": { "ru": "Точка Сборки", "en": "Tochka Sborki" },
      "tagline": { "ru": "курс по vibe-кодингу", "en": "a course on vibe coding" },
      "url": "https://ai.mamaev.coach",
      "status": "live",
      "locales": ["ru", "en"]
    }
  ]
}
```

- [ ] **Step 2: Write the failing tests** — `LMS/tochka-sborki/web/lib/academy/registry.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { REGISTRY, validateRegistry, type AcademyRegistry } from './registry'

/** Fresh valid registry per test — mutate freely. */
function sample(): AcademyRegistry {
  return structuredClone({
    academy: {
      name: 'S.A.S.H.A',
      fullName: { ru: 'Академия', en: 'Academy' },
      url: null,
    },
    courses: [
      {
        slug: 'tochka-sborki',
        name: { ru: 'Точка Сборки', en: 'Tochka Sborki' },
        tagline: { ru: 'курс по vibe-кодингу', en: 'a course on vibe coding' },
        url: 'https://ai.mamaev.coach',
        status: 'live' as const,
        locales: ['ru', 'en'] as const,
      },
    ],
  }) as AcademyRegistry
}

describe('validateRegistry', () => {
  it('accepts a valid registry', () => {
    expect(validateRegistry(sample())).toEqual([])
  })

  it('flags empty academy.name', () => {
    const r = sample()
    r.academy.name = '  '
    expect(validateRegistry(r)).toContain('academy.name is empty')
  })

  it('flags academy.fullName missing a locale', () => {
    const r = sample()
    r.academy.fullName.en = ''
    expect(validateRegistry(r)).toContain('academy.fullName must be non-empty in ru and en')
  })

  it('flags academy.url with trailing slash', () => {
    const r = sample()
    r.academy.url = 'https://academy.example.com/'
    expect(validateRegistry(r)).toContain('academy.url must be null or https:// without trailing slash')
  })

  it('flags a bad slug', () => {
    const r = sample()
    r.courses[0].slug = 'Tochka_Sborki'
    expect(validateRegistry(r)).toContain('courses[Tochka_Sborki]: slug must match ^[a-z0-9-]+$')
  })

  it('flags duplicate slugs', () => {
    const r = sample()
    r.courses.push(structuredClone(r.courses[0]))
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: duplicate slug')
  })

  it('flags a course name missing a locale', () => {
    const r = sample()
    r.courses[0].name.ru = ''
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: name must be non-empty in ru and en')
  })

  it('flags a course tagline missing a locale', () => {
    const r = sample()
    r.courses[0].tagline.en = '   '
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: tagline must be non-empty in ru and en')
  })

  it('flags a non-https course url', () => {
    const r = sample()
    r.courses[0].url = 'http://ai.mamaev.coach'
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: url must be https:// without trailing slash')
  })

  it('flags an unknown status', () => {
    const r = sample()
    ;(r.courses[0] as { status: string }).status = 'archived'
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: status must be one of live, coming-soon')
  })

  it('flags empty locales', () => {
    const r = sample()
    ;(r.courses[0] as { locales: string[] }).locales = []
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: locales must be a non-empty subset of ru, en')
  })

  it('flags an unknown locale', () => {
    const r = sample()
    ;(r.courses[0] as { locales: string[] }).locales = ['ru', 'de']
    expect(validateRegistry(r)).toContain('courses[tochka-sborki]: locales must be a non-empty subset of ru, en')
  })

  it('flags a registry with no live course', () => {
    const r = sample()
    r.courses[0].status = 'coming-soon'
    expect(validateRegistry(r)).toContain('registry must contain at least one live course')
  })
})

describe('REGISTRY (committed LMS/registry.json)', () => {
  it('round-trips validation cleanly', () => {
    expect(validateRegistry(REGISTRY)).toEqual([])
  })
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: FAIL — cannot resolve `./registry`.

- [ ] **Step 4: Implement `LMS/tochka-sborki/web/lib/academy/registry.ts`:**

```ts
// web/lib/academy/registry.ts
// Typed loader + validation for the academy course registry.
// SoT is LMS/registry.json (repo-level, shared by every surface) — this module
// gives the engine types, the parsed REGISTRY, and validateRegistry.
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'
import registryJson from '../../../../registry.json'

export type CourseStatus = 'live' | 'coming-soon'

export interface CourseEntry {
  slug: string
  name: Bi
  tagline: Bi
  url: string
  status: CourseStatus
  locales: readonly Locale[]
}

export interface AcademyRegistry {
  academy: { name: string; fullName: Bi; url: string | null }
  courses: CourseEntry[]
}

export const REGISTRY = registryJson as AcademyRegistry

const SLUG_RE = /^[a-z0-9-]+$/
const STATUSES: readonly CourseStatus[] = ['live', 'coming-soon']
const KNOWN_LOCALES: readonly Locale[] = ['ru', 'en']

function isValidUrl(url: string): boolean {
  return url.startsWith('https://') && !url.endsWith('/')
}

function biFilled(v: Bi): boolean {
  return v.ru.trim().length > 0 && v.en.trim().length > 0
}

/** Returns one message per violation; [] = valid. Mirrors validateOutline's shape. */
export function validateRegistry(r: AcademyRegistry): string[] {
  const errors: string[] = []
  if (r.academy.name.trim().length === 0) errors.push('academy.name is empty')
  if (!biFilled(r.academy.fullName)) {
    errors.push('academy.fullName must be non-empty in ru and en')
  }
  if (r.academy.url !== null && !isValidUrl(r.academy.url)) {
    errors.push('academy.url must be null or https:// without trailing slash')
  }
  const seen = new Set<string>()
  for (const c of r.courses) {
    const at = `courses[${c.slug}]`
    if (!SLUG_RE.test(c.slug)) errors.push(`${at}: slug must match ^[a-z0-9-]+$`)
    if (seen.has(c.slug)) errors.push(`${at}: duplicate slug`)
    seen.add(c.slug)
    if (!biFilled(c.name)) errors.push(`${at}: name must be non-empty in ru and en`)
    if (!biFilled(c.tagline)) errors.push(`${at}: tagline must be non-empty in ru and en`)
    if (!isValidUrl(c.url)) errors.push(`${at}: url must be https:// without trailing slash`)
    if (!STATUSES.includes(c.status)) {
      errors.push(`${at}: status must be one of ${STATUSES.join(', ')}`)
    }
    if (c.locales.length === 0 || c.locales.some((l) => !KNOWN_LOCALES.includes(l))) {
      errors.push(`${at}: locales must be a non-empty subset of ${KNOWN_LOCALES.join(', ')}`)
    }
  }
  if (!r.courses.some((c) => c.status === 'live')) {
    errors.push('registry must contain at least one live course')
  }
  return errors
}
```

- [ ] **Step 5: Replace `LMS/tochka-sborki/web/next.config.ts`** with (whole file — adds the Turbopack root pin so the out-of-app JSON import builds in CI, same pattern hub uses since `af2cd303`):

```ts
import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Repo root, so Turbopack accepts the LMS/registry.json import from outside web/.
  turbopack: { root: path.join(__dirname, '../../..') },
}

export default config
```

- [ ] **Step 6: Run tests to verify they pass**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: PASS (14 tests).

- [ ] **Step 7: Typecheck + build gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected: no output, exit 0. (`vitest run` does NOT typecheck test files; this gate is mandatory.)
Run (from `LMS/tochka-sborki/web`): `npm run build` — expected: build succeeds.

- [ ] **Step 8: Commit** (from repo root)

```bash
git add LMS/registry.json LMS/tochka-sborki/web/lib/academy/registry.ts LMS/tochka-sborki/web/lib/academy/registry.test.ts LMS/tochka-sborki/web/next.config.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S1 registry SoT + typed loader + validateRegistry (fb_6b2ae75df6fb)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `resolveCourses` + COURSE↔registry drift-guard (TDD)

**Files:**
- Modify: `LMS/tochka-sborki/web/lib/academy/registry.ts` (append after `validateRegistry`)
- Test: `LMS/tochka-sborki/web/lib/academy/registry.test.ts` (append)

**Interfaces:**
- Consumes: `REGISTRY`, `AcademyRegistry`, `CourseStatus` from Task 1; `COURSE` from `@/lib/course`; `Locale` from `@/lib/dictionaries`.
- Produces: `ResolvedCourse { slug: string; name: string; tagline: string; url: string; status: CourseStatus }`, `resolveCourses(locale: Locale, r?: AcademyRegistry): ResolvedCourse[]` — the interface S.A.S.H.A #3 (catalog/switcher) will consume.

- [ ] **Step 1: Append the failing tests** to `registry.test.ts`:

```ts
// added imports at the top of the file:
import { COURSE } from '@/lib/course'
import { resolveCourses } from './registry'

describe('resolveCourses', () => {
  it('localizes ru', () => {
    const [c] = resolveCourses('ru', sample())
    expect(c).toEqual({
      slug: 'tochka-sborki',
      name: 'Точка Сборки',
      tagline: 'курс по vibe-кодингу',
      url: 'https://ai.mamaev.coach',
      status: 'live',
    })
  })

  it('localizes en', () => {
    const [c] = resolveCourses('en', sample())
    expect(c.name).toBe('Tochka Sborki')
    expect(c.tagline).toBe('a course on vibe coding')
  })

  it('defaults to REGISTRY and preserves order', () => {
    const list = resolveCourses('ru')
    expect(list.map((c) => c.slug)).toEqual(REGISTRY.courses.map((c) => c.slug))
  })
})

describe('COURSE ↔ registry drift-guard', () => {
  const entry = REGISTRY.courses.find((c) => c.slug === 'tochka-sborki')

  it('this course is registered', () => {
    expect(entry).toBeDefined()
  })

  it('registry entry matches lib/course COURSE', () => {
    expect(entry!.url).toBe(COURSE.domain)
    expect(entry!.name.ru).toBe(COURSE.name)
    expect([...entry!.locales]).toEqual([...COURSE.locales])
  })
})
```

Note: `resolveCourses` and `COURSE` join the EXISTING import lines — keep a single import statement per module.

- [ ] **Step 2: Run tests to verify the new ones fail**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: FAIL — `resolveCourses` is not exported.

- [ ] **Step 3: Append the implementation** to `registry.ts`:

```ts
export interface ResolvedCourse {
  slug: string
  name: string
  tagline: string
  url: string
  status: CourseStatus
}

/** Localized course list (registry order preserved) — what the catalog/switcher renders. */
export function resolveCourses(locale: Locale, r: AcademyRegistry = REGISTRY): ResolvedCourse[] {
  return r.courses.map((c) => ({
    slug: c.slug,
    name: c.name[locale],
    tagline: c.tagline[locale],
    url: c.url,
    status: c.status,
  }))
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: PASS (19 tests).

- [ ] **Step 5: Typecheck gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected: no output, exit 0.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/lib/academy/registry.ts LMS/tochka-sborki/web/lib/academy/registry.test.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S1 resolveCourses + COURSE↔registry drift-guard (fb_6b2ae75df6fb)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Contract doc + CI paths trigger + full gates

**Files:**
- Modify: `LMS/_template/CHECKLIST.md` (section "## 1. Identity — `web/lib/course.ts`")
- Modify: `.github/workflows/deploy.yml` (the `on.push.paths` list, lines 6–12)

**Interfaces:**
- Consumes: registry contract from Tasks 1–2 (file `LMS/registry.json`; drift-guard enforces url/name.ru/locales against `COURSE`).
- Produces: nothing code-level — documentation + CI trigger.

- [ ] **Step 1: Add the registry step to `LMS/_template/CHECKLIST.md`** — append this checkbox at the END of section `## 1. Identity — web/lib/course.ts` (after the "Single source for SEO…" line):

```markdown
- [ ] Register the course in `LMS/registry.json` (slug / name / tagline / url / status / locales). Values must match `COURSE` — the engine's registry drift-guard test (`lib/academy/registry.test.ts`) enforces url, name.ru and locales.
```

- [ ] **Step 2: Add the registry path to `.github/workflows/deploy.yml`** — in the `on.push.paths` list, insert after the `- 'LMS/tochka-sborki/web/**'` line:

```yaml
      - 'LMS/registry.json'
```

- [ ] **Step 3: Full gates** (from `LMS/tochka-sborki/web`)

Run: `npx vitest run` — expected: all files pass (95 existing + 1 new = 96 files).
Run: `npx tsc --noEmit` — expected: exit 0, no output.
Run: `npm run build` — expected: success.

- [ ] **Step 4: Commit** (from repo root)

```bash
git add LMS/_template/CHECKLIST.md .github/workflows/deploy.yml
git commit -m "docs(academy): S1 registry contract in new-course checklist + CI paths trigger (fb_6b2ae75df6fb)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
