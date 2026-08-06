# S.A.S.H.A S2 — Catalog + Course-Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Registry-driven academy UI in the LMS engine: a footer course-switcher that dark-ships (null with today's single-course registry) and an unwired course catalog for the future academy landing.

**Architecture:** A pure resolver `resolveOtherCourses` (live courses other than self, self = `COURSE.domain`) joins S1's `lib/academy/registry.ts`. Two thin display components consume the resolvers; the switcher is wired into the Footer grid (renders null today), the catalog is exported but consumed nowhere. Additive `academy` dictionary section carries all copy.

**Tech Stack:** Next.js 16 (static export), TypeScript, Vitest (env=node, source-reading drift-guard pattern for components).

## Global Constraints

- Working app dir: `LMS/tochka-sborki/web` — **`tochka-sborki`, NO second "s"**. Before committing: `git diff --cached --name-only | grep tochka-sborski` must print nothing.
- All git commands from repo root `C:\telo\Efforts\Ongoing\mc_hub`. Commit directly to main (trunk-based).
- No new dependencies. No live LLM/network calls. Zero visual change today (single-course registry ⇒ switcher renders null; catalog unwired).
- Registry-driven only: components must not contain hardcoded course names («Точка Сборки» / 'Tochka Sborki') or fabricated entries/metrics.
- `Locale` from `@/lib/dictionaries`; `COURSE`/`Bi` from `@/lib/course`; S1 registry exports from `@/lib/academy/registry` (relative `./registry` inside `lib/academy/`, `../../lib/academy/registry` from `components/academy/`).
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `resolveOtherCourses` + dictionary `academy` section (TDD)

**Files:**
- Modify: `LMS/tochka-sborki/web/lib/academy/registry.ts` (append after `resolveCourses`)
- Modify: `LMS/tochka-sborki/web/lib/dictionaries.ts` (three insertions)
- Test: `LMS/tochka-sborki/web/lib/academy/registry.test.ts` (append)

**Interfaces:**
- Consumes: `resolveCourses(locale, r = REGISTRY): ResolvedCourse[]`, `REGISTRY`, `AcademyRegistry`, `ResolvedCourse` — already in `lib/academy/registry.ts`.
- Produces: `resolveOtherCourses(locale: Locale, selfUrl: string, r?: AcademyRegistry): ResolvedCourse[]`; dictionary section `academy: { switcherLabel: string; catalogTitle: string; comingSoon: string }` reachable via `getDictionary(locale).academy` — Tasks 2–3 rely on both.

- [ ] **Step 1: Append the failing tests** to `LMS/tochka-sborki/web/lib/academy/registry.test.ts`. Add `resolveOtherCourses` to the existing `./registry` import line (ONE import statement per module — do not add a duplicate import line), then append:

```ts
describe('resolveOtherCourses', () => {
  it('returns [] on the single-course REGISTRY (dark-ship)', () => {
    expect(resolveOtherCourses('ru', COURSE.domain)).toEqual([])
  })

  it('filters self by url', () => {
    const r = sample()
    r.courses.push({
      slug: 'second-course',
      name: { ru: 'Второй курс', en: 'Second Course' },
      tagline: { ru: 'о чём-то ещё', en: 'about something else' },
      url: 'https://second.example.com',
      status: 'live',
      locales: ['ru', 'en'],
    })
    const others = resolveOtherCourses('en', 'https://ai.mamaev.coach', r)
    expect(others.map((c) => c.slug)).toEqual(['second-course'])
    expect(others[0].name).toBe('Second Course')
  })

  it('excludes coming-soon courses', () => {
    const r = sample()
    r.courses.push({
      slug: 'second-course',
      name: { ru: 'Второй курс', en: 'Second Course' },
      tagline: { ru: 'о чём-то ещё', en: 'about something else' },
      url: 'https://second.example.com',
      status: 'coming-soon',
      locales: ['ru', 'en'],
    })
    expect(resolveOtherCourses('ru', 'https://ai.mamaev.coach', r)).toEqual([])
  })
})

describe('dictionary academy section', () => {
  it('has all keys filled in both locales', () => {
    for (const locale of ['ru', 'en'] as const) {
      const a = getDictionary(locale).academy
      expect(a.switcherLabel.trim()).not.toBe('')
      expect(a.catalogTitle.trim()).not.toBe('')
      expect(a.comingSoon.trim()).not.toBe('')
    }
  })
})
```

Also add to the test file's imports: `getDictionary` joins the existing `@/lib/dictionaries` import if one exists; otherwise add `import { getDictionary } from '@/lib/dictionaries'`.

- [ ] **Step 2: Run tests to verify the new ones fail**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: FAIL — `resolveOtherCourses` is not exported.

- [ ] **Step 3: Append the resolver** to `LMS/tochka-sborki/web/lib/academy/registry.ts` (after `resolveCourses`):

```ts
/** Live courses of the academy other than this app (self identified by url === selfUrl).
 *  What the CourseSwitcher renders; [] with a single-course registry (dark-ship). */
export function resolveOtherCourses(
  locale: Locale,
  selfUrl: string,
  r: AcademyRegistry = REGISTRY,
): ResolvedCourse[] {
  return resolveCourses(locale, r).filter(
    (c) => c.status === 'live' && c.url !== selfUrl,
  )
}
```

- [ ] **Step 4: Add the `academy` dictionary section** to `LMS/tochka-sborki/web/lib/dictionaries.ts`. The key `footer:` appears exactly THREE times (Dictionary type ~line 145, `ru` object ~line 406, `en` object ~line 665). Insert an `academy` block immediately BEFORE `footer:` in each, matching the file's indentation:

In the `Dictionary` type:
```ts
  academy: {
    switcherLabel: string
    catalogTitle: string
    comingSoon: string
  }
```

In the `ru` object:
```ts
    academy: {
      switcherLabel: 'академия',
      catalogTitle: 'Курсы академии',
      comingSoon: 'скоро',
    },
```

In the `en` object:
```ts
    academy: {
      switcherLabel: 'academy',
      catalogTitle: 'Academy courses',
      comingSoon: 'coming soon',
    },
```

- [ ] **Step 5: Run tests to verify they pass**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: PASS (23 tests: 19 existing + 4 new).

- [ ] **Step 6: Typecheck gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0, no output. (vitest does NOT typecheck.)

- [ ] **Step 7: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/lib/academy/registry.ts LMS/tochka-sborki/web/lib/academy/registry.test.ts LMS/tochka-sborki/web/lib/dictionaries.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S2 resolveOtherCourses + academy dictionary section (fb_b4a9687c5cc3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `CourseSwitcher` + Footer wiring + drift-guards (TDD)

**Files:**
- Create: `LMS/tochka-sborki/web/components/academy/course-switcher.tsx`
- Modify: `LMS/tochka-sborki/web/components/footer.tsx` (import + one render line)
- Test: `LMS/tochka-sborki/web/components/academy/course-switcher.test.ts`

**Interfaces:**
- Consumes: `resolveOtherCourses(locale, selfUrl, r?)` and dictionary `academy.switcherLabel` from Task 1; `COURSE` from `@/lib/course`.
- Produces: `CourseSwitcher({ locale }: { locale: Locale })` — rendered by Footer.

- [ ] **Step 1: Write the failing drift-guard tests** — `LMS/tochka-sborki/web/components/academy/course-switcher.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'course-switcher.tsx'), 'utf8')
const footerSrc = readFileSync(join(HERE, '..', 'footer.tsx'), 'utf8')

describe('CourseSwitcher', () => {
  it('dark-ships: null-guard when there are no other live courses', () => {
    expect(src).toMatch(/others\.length === 0/)
    expect(src).toContain('return null')
  })

  it('is registry-driven via resolveOtherCourses with COURSE.domain as self', () => {
    expect(src).toContain('resolveOtherCourses')
    expect(src).toContain('COURSE.domain')
    expect(src).not.toMatch(/Точка Сборки|Tochka Sborki/)
  })

  it('labels from the academy dictionary, links open external safely', () => {
    expect(src).toContain('academy.switcherLabel')
    expect(src).toContain('rel="noopener noreferrer"')
  })
})

describe('Footer wiring', () => {
  it('footer renders CourseSwitcher', () => {
    expect(footerSrc).toContain('<CourseSwitcher locale={locale} />')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/academy/course-switcher.test.ts`
Expected: FAIL — `course-switcher.tsx` does not exist (readFileSync ENOENT).

- [ ] **Step 3: Create `LMS/tochka-sborki/web/components/academy/course-switcher.tsx`:**

```tsx
import { COURSE } from '@/lib/course'
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { resolveOtherCourses } from '@/lib/academy/registry'

// Footer column look — footer.tsx keeps these consts module-local, so the two
// small style objects are duplicated here to stay visually identical.
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  color: 'var(--text-accent)',
  textTransform: 'lowercase',
  letterSpacing: '0.12em',
  marginBottom: '1rem',
  display: 'block',
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  padding: '0.25rem 0',
  textDecoration: 'none',
  lineHeight: 1.5,
}

/** Footer column linking to the academy's OTHER live courses.
 *  Dark-ship: renders null while the registry holds no other live course. */
export function CourseSwitcher({ locale }: { locale: Locale }) {
  const others = resolveOtherCourses(locale, COURSE.domain)
  if (others.length === 0) return null
  const t = getDictionary(locale)
  return (
    <div>
      <span style={labelStyle}>{t.academy.switcherLabel}</span>
      {others.map((c) => (
        <a
          key={c.slug}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {c.name}
        </a>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Wire the Footer** — in `LMS/tochka-sborki/web/components/footer.tsx`:

(a) Add to the imports at the top (after the existing `@/lib/dictionaries` import):

```ts
import { CourseSwitcher } from '@/components/academy/course-switcher'
```

(b) Inside the middle grid (the `{/* ── Middle: 4 columns ──────────────────────────────────── */}` block), the last column is `{/* Project */}` ending with the `mamaev.coach ↗` anchor. Insert the switcher between that column's closing `</div>` and the grid's closing `</div>`:

```tsx
          </div>

          <CourseSwitcher locale={locale} />
        </div>
```

(The exact anchor: the two consecutive closing `</div>` lines directly after the `mamaev.coach ↗` `</a>`; the render line goes between them.)

- [ ] **Step 5: Run tests to verify they pass**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/academy/course-switcher.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Typecheck gate**

Run (from `LMS/tochka-sborki/web`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 7: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/components/academy/course-switcher.tsx LMS/tochka-sborki/web/components/academy/course-switcher.test.ts LMS/tochka-sborki/web/components/footer.tsx
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S2 CourseSwitcher wired into footer, dark-shipped (fb_b4a9687c5cc3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `CourseCatalog` (unwired) + full gates (TDD)

**Files:**
- Create: `LMS/tochka-sborki/web/components/academy/course-catalog.tsx`
- Test: `LMS/tochka-sborki/web/components/academy/course-catalog.test.ts`

**Interfaces:**
- Consumes: `resolveCourses(locale)` (S1) and dictionary `academy.catalogTitle` / `academy.comingSoon` from Task 1.
- Produces: `CourseCatalog({ locale }: { locale: Locale })` — consumed by NOTHING in this slice (the academy landing #1 takes it later). Do not import it anywhere.

- [ ] **Step 1: Write the failing drift-guard tests** — `LMS/tochka-sborki/web/components/academy/course-catalog.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'course-catalog.tsx'), 'utf8')

describe('CourseCatalog', () => {
  it('is registry-driven via resolveCourses, no hardcoded course names', () => {
    expect(src).toContain('resolveCourses')
    expect(src).not.toMatch(/Точка Сборки|Tochka Sborki/)
  })

  it('copy comes from the academy dictionary', () => {
    expect(src).toContain('academy.catalogTitle')
    expect(src).toContain('academy.comingSoon')
    expect(src).not.toMatch(/Курсы академии|Academy courses/)
  })

  it('coming-soon cards are unlinked, live cards link out safely', () => {
    expect(src).toMatch(/status === 'live'/)
    expect(src).toContain('rel="noopener noreferrer"')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/academy/course-catalog.test.ts`
Expected: FAIL — `course-catalog.tsx` does not exist.

- [ ] **Step 3: Create `LMS/tochka-sborki/web/components/academy/course-catalog.tsx`:**

```tsx
import { getDictionary, type Locale } from '@/lib/dictionaries'
import { resolveCourses } from '@/lib/academy/registry'

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius)',
  background: 'var(--bg-secondary)',
  padding: '1.25rem',
  display: 'block',
  textDecoration: 'none',
}

const nameStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '0.35rem',
}

const taglineStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
}

const badgeStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  color: 'var(--text-accent)',
  textTransform: 'lowercase',
  letterSpacing: '0.12em',
}

/** Card list of ALL academy courses from the registry: live → linked,
 *  coming-soon → unlinked + badge. Unwired in this slice — the academy
 *  landing (#1) consumes it. */
export function CourseCatalog({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const courses = resolveCourses(locale)
  return (
    <section>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        {t.academy.catalogTitle}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {courses.map((c) =>
          c.status === 'live' ? (
            <a
              key={c.slug}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              style={cardStyle}
            >
              <div style={nameStyle}>{c.name}</div>
              <div style={taglineStyle}>{c.tagline}</div>
            </a>
          ) : (
            <div key={c.slug} style={cardStyle}>
              <div style={nameStyle}>{c.name}</div>
              <div style={taglineStyle}>{c.tagline}</div>
              <span style={badgeStyle}>{t.academy.comingSoon}</span>
            </div>
          ),
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run (from `LMS/tochka-sborki/web`): `npx vitest run components/academy/course-catalog.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Full gates** (from `LMS/tochka-sborki/web`)

Run: `npx vitest run` — expected: all files pass (96 existing + 2 new = 98 files).
Run: `npx tsc --noEmit` — expected exit 0, no output.
Run: `npm run build` — expected: success.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add LMS/tochka-sborki/web/components/academy/course-catalog.tsx LMS/tochka-sborki/web/components/academy/course-catalog.test.ts
git diff --cached --name-only | grep tochka-sborski && echo "WRONG DIR — STOP" || git commit -m "feat(academy): S2 CourseCatalog engine component, unwired dark-ship (fb_b4a9687c5cc3)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
