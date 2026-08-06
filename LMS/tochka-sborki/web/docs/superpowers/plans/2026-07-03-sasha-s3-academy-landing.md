# S.A.S.H.A S3 — Academy Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The S.A.S.H.A academy landing at mamaev.coach/academy/ (ru + en) in the hub app — dark cosmic hero, honest skeleton positioning, registry-driven course cards — plus a sovereign manifesto prompt-emitter for the owner.

**Architecture:** Hub reads `LMS/registry.json` via build-time fs-read (`lib/site.ts` blog-manifest idiom — no source imports, no bundler-root concerns). All copy lives in the hub dictionary's new `academy` section; the page component renders dictionary + registry only. `academy.url` in the registry flips null → the landing URL. A zero-dep Node script emits the manifesto-drafting prompt for the owner's agent.

**Tech Stack:** Next.js 16 static export (hub), TypeScript, Vitest, pure CSS (no images/deps).

## Global Constraints

- Two apps touched: `hub/` (main work) and `LMS/registry.json` (one field). LMS app code is NOT touched. The LMS dir is spelled `tochka-sborki` — NO second "s".
- All git from repo root `C:\telo\Efforts\Ongoing\mc_hub`. Commit directly to main (trunk-based).
- No new dependencies. No live LLM/network calls (the manifesto script only PRINTS a prompt).
- Authenticity is enforced by tests: banned lexicon `/скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i` in dictionary values and (plus `|countdown`) in the page source. No fabricated courses/metrics. Component source must not hardcode course names («Точка Сборки»/'Tochka Sborki') — the dictionary positioning naming the first course is fine (it's the honest copy).
- Hub uses RELATIVE imports in components/routes (match `home-page.tsx` / `app/en/page.tsx` idiom).
- Publisher branding (`Mamaev Institute for AI`) untouched.
- Commit messages end with: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: `hub/lib/academy.ts` reader + registry `academy.url` flip (TDD)

**Files:**
- Create: `hub/lib/academy.ts`
- Modify: `LMS/registry.json` (one field)
- Test: `hub/lib/academy.test.ts`

**Interfaces:**
- Consumes: `Locale` from `hub/lib/dictionaries.ts`; the committed `LMS/registry.json`.
- Produces: `AcademyInfo { name: string; fullName: { ru: string; en: string }; url: string | null }`, `AcademyCourse { slug: string; name: string; tagline: string; url: string; status: 'live' | 'coming-soon' }`, `getAcademy(): AcademyInfo`, `getCourses(locale: Locale): AcademyCourse[]` — Task 3 renders these.

- [ ] **Step 1: Write the failing test** — `hub/lib/academy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getAcademy, getCourses } from './academy'

describe('academy registry reader', () => {
  it('reads the academy identity', () => {
    const a = getAcademy()
    expect(a.name).toBe('S.A.S.H.A')
    expect(a.fullName.ru.length).toBeGreaterThan(0)
    expect(a.fullName.en.length).toBeGreaterThan(0)
  })

  it('academy.url points at the hub landing (hub↔registry drift-guard)', () => {
    expect(getAcademy().url).toBe('https://mamaev.coach/academy')
  })

  it('localizes courses ru', () => {
    const c = getCourses('ru').find((x) => x.slug === 'tochka-sborki')
    expect(c).toBeDefined()
    expect(c!.url).toBe('https://ai.mamaev.coach')
    expect(c!.name).toBe('Точка Сборки')
  })

  it('localizes courses en', () => {
    const c = getCourses('en').find((x) => x.slug === 'tochka-sborki')
    expect(c!.name).toBe('Tochka Sborki')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `hub/`): `npx vitest run lib/academy.test.ts`
Expected: FAIL — cannot resolve `./academy`.

- [ ] **Step 3: Create `hub/lib/academy.ts`:**

```ts
// Build-time reader for the academy course registry (LMS/registry.json).
// fs-read, not a source import — mirrors lib/site.ts's blog-manifest bridge.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from './dictionaries'

interface Bi { ru: string; en: string }

export interface AcademyInfo { name: string; fullName: Bi; url: string | null }

export interface AcademyCourse {
  slug: string
  name: string
  tagline: string
  url: string
  status: 'live' | 'coming-soon'
}

interface RegistryFile {
  academy: AcademyInfo
  courses: { slug: string; name: Bi; tagline: Bi; url: string; status: 'live' | 'coming-soon' }[]
}

function registry(): RegistryFile {
  const raw = readFileSync(join(process.cwd(), '..', 'LMS', 'registry.json'), 'utf8')
  return JSON.parse(raw) as RegistryFile
}

export function getAcademy(): AcademyInfo {
  return registry().academy
}

/** Localized course list, registry order, ALL statuses (live + coming-soon). */
export function getCourses(locale: Locale): AcademyCourse[] {
  return registry().courses.map((c) => ({
    slug: c.slug,
    name: c.name[locale],
    tagline: c.tagline[locale],
    url: c.url,
    status: c.status,
  }))
}
```

- [ ] **Step 4: Flip the registry field** — in `LMS/registry.json`, change:

```json
    "url": null
```
to:
```json
    "url": "https://mamaev.coach/academy"
```

(This is the `academy.url` field — the only `null` in the file. Course entries keep their urls.)

- [ ] **Step 5: Run to verify it passes**

Run (from `hub/`): `npx vitest run lib/academy.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Cross-app gate — LMS registry suite still green**

Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts`
Expected: PASS (23 tests — the validator allows https-no-trailing-slash for academy.url).

- [ ] **Step 7: Typecheck gate**

Run (from `hub/`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 8: Commit** (from repo root)

```bash
git add hub/lib/academy.ts hub/lib/academy.test.ts LMS/registry.json
git commit -m "feat(hub): S3 academy registry reader + academy.url flip (fb_7c7eda02a024)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Dictionary `academy` section + authenticity guard (TDD)

**Files:**
- Modify: `hub/lib/dictionaries.ts` (three insertions)
- Test: `hub/lib/dictionaries.academy.test.ts`

**Interfaces:**
- Consumes: existing `Dictionary` interface / `dictionaries` ru+en objects / `getDictionary`.
- Produces: `getDictionary(locale).academy` with keys `eyebrow, wordmark, fullName, positioning: string[], coursesLabel, comingSoon, metaTitle, metaDescription` — Task 3 renders them.

- [ ] **Step 1: Write the failing test** — `hub/lib/dictionaries.academy.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getDictionary } from './dictionaries'

const BANNED = /скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i

describe('academy dictionary block', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`${locale}: all keys filled, >=2 positioning paragraphs`, () => {
      const a = getDictionary(locale).academy
      expect(a.eyebrow.length).toBeGreaterThan(0)
      expect(a.wordmark).toBe('S.A.S.H.A')
      expect(a.fullName.length).toBeGreaterThan(0)
      expect(a.positioning.length).toBeGreaterThanOrEqual(2)
      for (const p of a.positioning) expect(p.trim().length).toBeGreaterThan(0)
      expect(a.coursesLabel.length).toBeGreaterThan(0)
      expect(a.comingSoon.length).toBeGreaterThan(0)
      expect(a.metaTitle.length).toBeGreaterThan(0)
      expect(a.metaDescription.length).toBeGreaterThan(0)
    })

    it(`${locale}: authenticity — no hustle lexicon`, () => {
      expect(JSON.stringify(getDictionary(locale).academy)).not.toMatch(BANNED)
    })
  }

  it('ru and en positioning differ (bilingual)', () => {
    expect(getDictionary('ru').academy.positioning.join('|'))
      .not.toBe(getDictionary('en').academy.positioning.join('|'))
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `hub/`): `npx vitest run lib/dictionaries.academy.test.ts`
Expected: FAIL — `academy` is not a property of the dictionary.

- [ ] **Step 3: Add the section.** In `hub/lib/dictionaries.ts` the key `langSuggest` appears exactly THREE times (interface ~line 30, ru object ~118, en object ~199). Insert an `academy` block immediately BEFORE `langSuggest` in each, matching indentation.

In the `Dictionary` interface:
```ts
  academy: {
    eyebrow: string
    wordmark: string
    fullName: string
    positioning: string[]
    coursesLabel: string
    comingSoon: string
    metaTitle: string
    metaDescription: string
  }
```

In the `ru` object:
```ts
    academy: {
      eyebrow: 'академия',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'S.A.S.H.A — учебная семья курсов, где древняя мудрость встречается с современной наукой и AI-инструментами. Каждый курс — самостоятельный мир; вход в них общий.',
        'Первый курс академии — «Точка Сборки», курс по vibe-кодингу. Семья будет расти — без спешки и без обещаний, которых мы не можем сдержать.',
      ],
      coursesLabel: 'Курсы',
      comingSoon: 'скоро',
      metaTitle: 'S.A.S.H.A — академия курсов',
      metaDescription: 'Учебная семья курсов: древняя мудрость × современная наука и AI-инструменты. Первый курс — «Точка Сборки».',
    },
```

In the `en` object:
```ts
    academy: {
      eyebrow: 'academy',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'S.A.S.H.A is a learning family of courses where ancient wisdom meets modern science and AI tools. Each course is a world of its own; the door in is shared.',
        "The academy's first course is Tochka Sborki, a course on vibe coding. The family will grow — without rush and without promises we can't keep.",
      ],
      coursesLabel: 'Courses',
      comingSoon: 'coming soon',
      metaTitle: 'S.A.S.H.A — course academy',
      metaDescription: 'A learning family of courses: ancient wisdom × modern science and AI tools. First course — Tochka Sborki.',
    },
```

- [ ] **Step 4: Run to verify it passes**

Run (from `hub/`): `npx vitest run lib/dictionaries.academy.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Typecheck gate**

Run (from `hub/`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 6: Commit** (from repo root)

```bash
git add hub/lib/dictionaries.ts hub/lib/dictionaries.academy.test.ts
git commit -m "feat(hub): S3 academy dictionary section + authenticity guard (fb_7c7eda02a024)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: `AcademyPage` + routes + sitemap + drift-guards (TDD)

**Files:**
- Create: `hub/components/academy-page.tsx`
- Create: `hub/app/academy/page.tsx`
- Create: `hub/app/en/academy/page.tsx`
- Modify: `hub/app/sitemap.ts` (one entry)
- Test: `hub/components/academy-page.test.ts`

**Interfaces:**
- Consumes: `getCourses(locale)` (Task 1), `getDictionary(locale).academy` (Task 2), `SITE.url` (existing `lib/site.ts`).
- Produces: `AcademyPage({ locale }: { locale: Locale })`; routes `/academy/` and `/en/academy/`.

- [ ] **Step 1: Write the failing drift-guard tests** — `hub/components/academy-page.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'academy-page.tsx'), 'utf8')
const ruRoute = readFileSync(join(HERE, '..', 'app', 'academy', 'page.tsx'), 'utf8')
const enRoute = readFileSync(join(HERE, '..', 'app', 'en', 'academy', 'page.tsx'), 'utf8')
const sitemap = readFileSync(join(HERE, '..', 'app', 'sitemap.ts'), 'utf8')

const BANNED = /скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited|countdown/i

describe('AcademyPage', () => {
  it('is registry- and dictionary-driven', () => {
    expect(src).toContain('getCourses')
    expect(src).toContain('getDictionary')
    expect(src).not.toMatch(/Точка Сборки|Tochka Sborki/)
  })

  it('live cards link out safely, coming-soon stays unlinked', () => {
    expect(src).toMatch(/status === 'live'/)
    expect(src).toContain('rel="noopener noreferrer"')
    expect(src).toContain('aria-label')
  })

  it('authenticity: no hustle lexicon in the page source', () => {
    expect(src).not.toMatch(BANNED)
  })
})

describe('routes + sitemap', () => {
  it('ru and en routes render AcademyPage', () => {
    expect(ruRoute).toContain('<AcademyPage locale="ru" />')
    expect(enRoute).toContain('<AcademyPage locale="en" />')
  })

  it('sitemap lists /academy/', () => {
    expect(sitemap).toContain('/academy/')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run (from `hub/`): `npx vitest run components/academy-page.test.ts`
Expected: FAIL — `academy-page.tsx` does not exist (ENOENT).

- [ ] **Step 3: Create `hub/components/academy-page.tsx`:**

```tsx
import { getDictionary, type Locale } from '../lib/dictionaries'
import { getCourses } from '../lib/academy'

interface Props { locale: Locale }

const GOLD = '#d9a95c'

export function AcademyPage({ locale }: Props) {
  const t = getDictionary(locale).academy
  const courses = getCourses(locale)

  return (
    <main style={{ background: '#070810', color: 'rgba(255,255,255,0.92)', minHeight: '100vh' }}>
      <style>{`
        .academy-hero {
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8) 0, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.6) 0, transparent 100%),
            radial-gradient(1.5px 1.5px at 60% 20%, rgba(255,255,255,0.9) 0, transparent 100%),
            radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.5) 0, transparent 100%),
            radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.7) 0, transparent 100%),
            radial-gradient(1.5px 1.5px at 90% 85%, rgba(217,169,92,0.8) 0, transparent 100%),
            radial-gradient(1px 1px at 50% 45%, rgba(217,169,92,0.6) 0, transparent 100%);
        }
        @media (max-width: 720px) {
          .academy-hero { padding: 4rem 1.25rem 3rem !important; }
          .academy-hero h1 { font-size: clamp(2.2rem, 11vw, 4.5rem) !important; }
        }
      `}</style>

      <section className="academy-hero" style={{ padding: '7rem 2rem 5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: '0.75rem', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '0.05em', margin: '1rem 0 0.5rem', color: '#fff' }}>
          {t.wordmark}
        </h1>
        <p style={{ color: GOLD, fontSize: '0.9rem', letterSpacing: '0.08em', margin: '0 0 2.5rem' }}>
          {t.fullName}
        </p>
        <div style={{ maxWidth: '38rem', margin: '0 auto', textAlign: 'left' }}>
          {t.positioning.map((p, i) => (
            <p key={i} style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontSize: '1rem' }}>{p}</p>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '52rem', margin: '0 auto', padding: '0 2rem 6rem' }}>
        <h2 style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase', letterSpacing: '0.12em', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
          {t.coursesLabel}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {courses.map((c) =>
            c.status === 'live' ? (
              <a
                key={c.slug}
                href={c.url}
                aria-label={c.name}
                target="_blank"
                rel="noopener noreferrer"
                style={{ border: '1px solid rgba(217,169,92,0.35)', borderRadius: '10px', padding: '1.5rem', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', display: 'block' }}
              >
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.5 }}>{c.tagline}</div>
              </a>
            ) : (
              <div
                key={c.slug}
                style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}
              >
                <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: '0.4rem' }}>{c.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.6rem' }}>{c.tagline}</div>
                <span style={{ fontFamily: 'var(--font-mono)', color: GOLD, fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'lowercase' }}>{t.comingSoon}</span>
              </div>
            ),
          )}
        </div>
      </section>
    </main>
  )
}
```

- [ ] **Step 4: Create the routes.**

`hub/app/academy/page.tsx`:
```tsx
import { AcademyPage } from '../../components/academy-page'
import { getDictionary } from '../../lib/dictionaries'

const t = getDictionary('ru').academy

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <AcademyPage locale="ru" />
}
```

`hub/app/en/academy/page.tsx`:
```tsx
import { AcademyPage } from '../../../components/academy-page'
import { getDictionary } from '../../../lib/dictionaries'

const t = getDictionary('en').academy

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
}

export default function Page() {
  return <AcademyPage locale="en" />
}
```

- [ ] **Step 5: Add the sitemap entry.** In `hub/app/sitemap.ts`, directly after the `/blog/` entry line (the one with `url: \`${SITE.url}/blog/\``), insert:

```ts
    { url: `${SITE.url}/academy/`, lastModified: today, alternates: { languages: { en: `${SITE.url}/en/academy/` } } },
```

- [ ] **Step 6: Run to verify tests pass**

Run (from `hub/`): `npx vitest run components/academy-page.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 7: Typecheck gate**

Run (from `hub/`): `npx tsc --noEmit` — expected exit 0.

- [ ] **Step 8: Commit** (from repo root)

```bash
git add hub/components/academy-page.tsx hub/components/academy-page.test.ts hub/app/academy/page.tsx hub/app/en/academy/page.tsx hub/app/sitemap.ts
git commit -m "feat(hub): S3 AcademyPage + /academy/ routes + sitemap (fb_7c7eda02a024)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Manifesto prompt-emitter + full gates

**Files:**
- Create: `scripts/academy-manifesto-prompt.mjs` (repo root `scripts/`, beside `sync-desops-kit.mjs`)

**Interfaces:**
- Consumes: `LMS/registry.json` (academy identity + course list).
- Produces: a prompt on stdout for the owner's agent; no files written, no network.

- [ ] **Step 1: Create `scripts/academy-manifesto-prompt.mjs`:**

```js
#!/usr/bin/env node
// Sovereign manifesto prompt-emitter for the S.A.S.H.A academy.
// Prints a prompt for the OWNER's agent (no live LLM call anywhere): run it,
// paste the output into your agent, then paste the resulting manifesto into
// hub/lib/dictionaries.ts (academy.positioning, both locales).
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const registry = JSON.parse(readFileSync(join(repoRoot, 'LMS', 'registry.json'), 'utf8'))
const { name, fullName } = registry.academy
const courses = registry.courses
  .map((c) => `- ${c.name.ru} / ${c.name.en} (${c.status})`)
  .join('\n')

console.log(`You are drafting the public manifesto for ${name} — ${fullName.en}.

CONTEXT
Academy: ${name} (${fullName.ru})
Courses today:
${courses}
Frame: ancient wisdom × modern science and AI tools. A family of courses over one engine; each course is a world of its own, the door in is shared.

TASK
Write the academy manifesto in TWO languages (Russian first, then English): 3-5 short paragraphs each, first person plural, warm and specific.

HARD CONSTRAINTS
- No urgency or scarcity (no countdowns, no "limited", no "only today").
- No testimonials, credentials-flexing, or grand titles.
- No religious iconography and no appropriating a specific tradition — keep the cosmos abstract.
- No promises that cannot be kept; modest, honest tone.
- Plain language over guru language.

PLACEMENT
Paste the final paragraphs into hub/lib/dictionaries.ts → academy.positioning (the ru array and the en array), replacing the skeleton copy. Keep academy.metaTitle / academy.metaDescription in sync if the framing shifts.`)
```

- [ ] **Step 2: Smoke-run the script**

Run (from repo root): `node scripts/academy-manifesto-prompt.mjs`
Expected: the prompt prints with `S.A.S.H.A`, the course line for Точка Сборки, and the PLACEMENT section. Exit 0.

- [ ] **Step 3: Full gates**

Run (from `hub/`): `npx vitest run` — expected: 8 test files pass (5 existing + 3 new).
Run (from `hub/`): `npx tsc --noEmit` — expected exit 0.
Run (from `hub/`): `npm run build` — expected: success, `/academy/` and `/en/academy/` in the route list.
Run (from `LMS/tochka-sborki/web`): `npx vitest run lib/academy/registry.test.ts` — expected: 23 pass.

- [ ] **Step 4: Commit** (from repo root)

```bash
git add scripts/academy-manifesto-prompt.mjs
git commit -m "feat(academy): S3 sovereign manifesto prompt-emitter (fb_7c7eda02a024)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
