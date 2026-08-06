# Course-Authoring S1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the deterministic spine of the course-authoring engine — a typed course-outline contract + validator, an executable de-hustle lint, and a pure scaffolder that emits the canonical bilingual module/unit skeleton — plus a writer CLI that materializes the `_template/01-example` skeleton.

**Architecture:** Three pure TS modules in `lib/authoring/` (`outline`, `dehustle`, `scaffold`) + a sample outline + a thin `npx tsx` writer CLI. No AI, no multi-course registry. Tested with the existing Vitest (env=node).

**Tech Stack:** TypeScript, Vitest, Node `fs`/`path`, `npx tsx` for the CLI. No new package dependencies.

## Global Constraints

- Single app: `LMS/tochka-sborki/web/`. All paths relative to it unless noted. Run commands from there.
- `lms_target: engine`. This is S1 of a 5-slice epic (`fb_8e8eaf0acfdb`); S1 is pure/deterministic, no AI, does NOT presume the multi-course registry / S.A.S.H.A.
- Reuse `import type { Bi } from '@/lib/course'` (`Bi = { ru: string; en: string }`). Bilingual = both `ru` and `en` non-empty.
- Lesson contract the scaffolder must emit: module `_meta.json` = `{ module, title, description, duration, level, units:[{slug,title}] }`; unit `<slug>.mdx` = frontmatter `{ title, unit, module, duration }` + exactly four `<Phase type="…">` blocks in order `activation → reflection → concept → practice`.
- **Authenticity-sacred:** the de-hustle lint strips profit-first/scarcity/sales/avatar framing; scaffold stubs are de-guru/de-hustle; activation/reflection stub copy carries NO write/type imperatives (parity with the existing reflection drift-guard).
- Additive only: new files only; do NOT modify existing app code or the live `tochka-sborki` course content. The new `lib/authoring/` modules are not imported by the Next.js app. No new dependencies.
- Test command: full suite `npm test` (= `vitest run`); single file `npx vitest run <path>`. Build: `npm run build`. Typecheck gate (final): `npx tsc --noEmit` (must be clean — type errors in non-app/test files do not fail vitest or next build, so this gate is required).
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`; use `git -c commit.gpgsign=false commit`. Git runs from repo root `C:\telo\Efforts\Ongoing\mc_hub` — prefix the app path in `git add`. Commit directly to `main` (trunk-based; do NOT branch).

---

### Task 1: `lib/authoring/outline.ts` — contract + validator

**Files:**
- Create: `lib/authoring/outline.ts`
- Test: `lib/authoring/outline.test.ts`

**Interfaces:**
- Consumes: `Bi` from `@/lib/course`.
- Produces: `CourseOutline`, `ModuleOutline`, `UnitOutline`, `validateOutline(o: CourseOutline): string[]`.

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/outline.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateOutline, type CourseOutline } from './outline'

const good: CourseOutline = {
  name: { ru: 'Курс', en: 'Course' },
  modules: [
    {
      slug: '01-intro', level: 1,
      title: { ru: 'Введение', en: 'Intro' },
      description: { ru: 'Опис', en: 'Desc' },
      units: [
        { slug: 'u1-start', title: { ru: 'Старт', en: 'Start' }, objective: { ru: 'Цель', en: 'Goal' } },
        { slug: 'u2-next', title: { ru: 'Дальше', en: 'Next' }, objective: { ru: 'Цель2', en: 'Goal2' } },
      ],
    },
  ],
}

describe('validateOutline', () => {
  it('accepts a well-formed bilingual outline', () => {
    expect(validateOutline(good)).toEqual([])
  })
  it('flags a missing locale in a Bi field', () => {
    const bad = structuredClone(good); bad.modules[0].units[0].objective = { ru: 'Цель', en: '' }
    expect(validateOutline(bad).some(e => /objective/.test(e))).toBe(true)
  })
  it('flags a bad module slug', () => {
    const bad = structuredClone(good); bad.modules[0].slug = '1-intro'
    expect(validateOutline(bad).some(e => /module slug/.test(e))).toBe(true)
  })
  it('flags a bad unit slug', () => {
    const bad = structuredClone(good); bad.modules[0].units[0].slug = 'start'
    expect(validateOutline(bad).some(e => /unit slug/.test(e))).toBe(true)
  })
  it('flags duplicate module slugs', () => {
    const bad = structuredClone(good); bad.modules.push(structuredClone(good.modules[0]))
    expect(validateOutline(bad).some(e => /duplicate module/.test(e))).toBe(true)
  })
  it('flags duplicate unit slugs within a module', () => {
    const bad = structuredClone(good); bad.modules[0].units[1].slug = 'u1-start'
    expect(validateOutline(bad).some(e => /duplicate unit/.test(e))).toBe(true)
  })
  it('flags level < 1', () => {
    const bad = structuredClone(good); bad.modules[0].level = 0
    expect(validateOutline(bad).some(e => /level/.test(e))).toBe(true)
  })
  it('flags an empty course', () => {
    expect(validateOutline({ name: { ru: 'К', en: 'C' }, modules: [] }).some(e => /at least one module/.test(e))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/outline.test.ts`
Expected: FAIL — cannot resolve `./outline`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/outline.ts`:

```ts
// lib/authoring/outline.ts
// Typed course-outline contract + a pure validator. The deterministic spine the
// AI authoring stages (research/draft/review) later write into. No I/O.
import type { Bi } from '@/lib/course'

export interface UnitOutline { slug: string; title: Bi; objective: Bi }
export interface ModuleOutline { slug: string; title: Bi; description: Bi; level: number; units: UnitOutline[] }
export interface CourseOutline { name: Bi; modules: ModuleOutline[] }

const MODULE_SLUG = /^\d{2}-[a-z0-9-]+$/
const UNIT_SLUG = /^u\d+-[a-z0-9-]+$/

function biComplete(b: Bi | undefined | null): boolean {
  return !!b && typeof b.ru === 'string' && b.ru.trim().length > 0
    && typeof b.en === 'string' && b.en.trim().length > 0
}

/** Returns [] when valid, else a list of human-readable error messages. */
export function validateOutline(o: CourseOutline): string[] {
  const errors: string[] = []
  if (!biComplete(o.name)) errors.push('course name must be non-empty in ru and en')
  if (!o.modules || o.modules.length === 0) errors.push('course must have at least one module')

  const moduleSlugs = new Set<string>()
  for (const m of o.modules ?? []) {
    if (!MODULE_SLUG.test(m.slug)) errors.push(`module slug "${m.slug}" must match NN-slug (e.g. 01-intro)`)
    if (moduleSlugs.has(m.slug)) errors.push(`duplicate module slug "${m.slug}"`)
    moduleSlugs.add(m.slug)
    if (!Number.isInteger(m.level) || m.level < 1) errors.push(`module "${m.slug}" level must be an integer >= 1`)
    if (!biComplete(m.title)) errors.push(`module "${m.slug}" title must be non-empty in ru and en`)
    if (!biComplete(m.description)) errors.push(`module "${m.slug}" description must be non-empty in ru and en`)
    if (!m.units || m.units.length === 0) errors.push(`module "${m.slug}" must have at least one unit`)

    const unitSlugs = new Set<string>()
    for (const u of m.units ?? []) {
      if (!UNIT_SLUG.test(u.slug)) errors.push(`unit slug "${u.slug}" must match uN-slug (e.g. u1-intro)`)
      if (unitSlugs.has(u.slug)) errors.push(`duplicate unit slug "${u.slug}" in module "${m.slug}"`)
      unitSlugs.add(u.slug)
      if (!biComplete(u.title)) errors.push(`unit "${u.slug}" title must be non-empty in ru and en`)
      if (!biComplete(u.objective)) errors.push(`unit "${u.slug}" objective must be non-empty in ru and en`)
    }
  }
  return errors
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/outline.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/outline.ts LMS/tochka-sborki/web/lib/authoring/outline.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): course-outline contract + validator (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `lib/authoring/dehustle.ts` — de-hustle lint

**Files:**
- Create: `lib/authoring/dehustle.ts`
- Test: `lib/authoring/dehustle.test.ts`

**Interfaces:**
- Consumes: `CourseOutline` from `./outline`.
- Produces: `lintDehustle(text: string): string[]`, `lintOutlineDehustle(o: CourseOutline): string[]`.

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/dehustle.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { lintDehustle, lintOutlineDehustle } from './dehustle'
import type { CourseOutline } from './outline'

describe('lintDehustle', () => {
  it('catches EN profit/scarcity/avatar terms', () => {
    const hits = lintDehustle('Act now — only 3 spots left! Build your buyer avatar for passive income.')
    expect(hits).toEqual(expect.arrayContaining(['act now', 'passive income']))
    expect(hits.some(h => /spot/.test(h))).toBe(true)
    expect(hits.some(h => /avatar/.test(h))).toBe(true)
  })
  it('catches RU terms', () => {
    const hits = lintDehustle('Успей — осталось мест! Это инфобизнес про пассивный доход.')
    expect(hits).toEqual(expect.arrayContaining(['успей', 'инфобизнес', 'пассивный доход']))
  })
  it('returns [] for clean copy', () => {
    expect(lintDehustle('A calm, honest lesson about thinking with AI.')).toEqual([])
  })
})

const clean: CourseOutline = {
  name: { ru: 'Курс', en: 'Course' },
  modules: [{
    slug: '01-intro', level: 1,
    title: { ru: 'Введение', en: 'Intro' }, description: { ru: 'Спокойно', en: 'Calm' },
    units: [{ slug: 'u1-start', title: { ru: 'Старт', en: 'Start' }, objective: { ru: 'Понять основу', en: 'Grasp the basics' } }],
  }],
}

describe('lintOutlineDehustle', () => {
  it('returns [] for a clean outline', () => {
    expect(lintOutlineDehustle(clean)).toEqual([])
  })
  it('surfaces banned terms seeded into a field (deduplicated)', () => {
    const dirty = structuredClone(clean)
    dirty.modules[0].description = { ru: 'инфобизнес', en: 'passive income' }
    const hits = lintOutlineDehustle(dirty)
    expect(hits).toEqual(expect.arrayContaining(['инфобизнес', 'passive income']))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/dehustle.test.ts`
Expected: FAIL — cannot resolve `./dehustle`.

- [ ] **Step 3: Write the implementation**

Create `lib/authoring/dehustle.ts`:

```ts
// lib/authoring/dehustle.ts
// Executable de-hustle lint: strips profit-first / scarcity / sales / avatar framing
// (reverse-engineered from the APM challenge, then DE-HUSTLED). Authenticity-sacred.
import type { CourseOutline } from './outline'

// Case-insensitive markers. EN uses word boundaries (ASCII); RU uses plain substrings
// (\b is unreliable around Cyrillic in JS RegExp).
const BANNED: RegExp[] = [
  /limited time/i, /act now/i, /only \d+ spots?/i, /spots? left/i,
  /buyer avatar/i, /customer avatar/i, /sales funnel/i, /passive income/i,
  /6-?figure/i, /six-?figure/i, /\bguru\b/i, /\bupsell\b/i, /\bhustle\b/i,
  /\bscarcity\b/i, /\bfomo\b/i,
  /успей/i, /осталось мест/i, /ограниченное предложение/i, /аватар клиента/i,
  /воронк[аи] продаж/i, /инфобизнес/i, /пассивный доход/i, /гуру/i, /допродаж/i,
]

/** Banned marketing terms found in one string (lowercased matches). */
export function lintDehustle(text: string): string[] {
  const found: string[] = []
  for (const re of BANNED) {
    const m = re.exec(text)
    if (m) found.push(m[0].toLowerCase())
  }
  return found
}

/** Scans every Bi field of an outline (ru + en); returns the deduplicated union. */
export function lintOutlineDehustle(o: CourseOutline): string[] {
  const hits = new Set<string>()
  const scan = (s: string) => { for (const t of lintDehustle(s)) hits.add(t) }
  scan(o.name.ru); scan(o.name.en)
  for (const m of o.modules) {
    scan(m.title.ru); scan(m.title.en); scan(m.description.ru); scan(m.description.en)
    for (const u of m.units) {
      scan(u.title.ru); scan(u.title.en); scan(u.objective.ru); scan(u.objective.en)
    }
  }
  return [...hits]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/authoring/dehustle.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/dehustle.ts LMS/tochka-sborki/web/lib/authoring/dehustle.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): executable de-hustle lint (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: `lib/authoring/scaffold.ts` + sample outline — pure emitter

**Files:**
- Create: `lib/authoring/scaffold.ts`
- Create: `lib/authoring/sample-outline.ts`
- Test: `lib/authoring/scaffold.test.ts`

**Interfaces:**
- Consumes: `CourseOutline` from `./outline`; `validateOutline` (test); `lintOutlineDehustle` (test); `SAMPLE_OUTLINE` from `./sample-outline`.
- Produces: `ScaffoldFile { path: string; content: string }`, `scaffoldCourse(o: CourseOutline): ScaffoldFile[]`, `SAMPLE_OUTLINE`.

- [ ] **Step 1: Write the failing test**

Create `lib/authoring/scaffold.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { scaffoldCourse } from './scaffold'
import { SAMPLE_OUTLINE } from './sample-outline'
import { validateOutline } from './outline'
import { lintOutlineDehustle } from './dehustle'

const files = scaffoldCourse(SAMPLE_OUTLINE)
const byPath = (p: string) => files.find(f => f.path === p)

describe('SAMPLE_OUTLINE', () => {
  it('is itself valid and de-hustle clean', () => {
    expect(validateOutline(SAMPLE_OUTLINE)).toEqual([])
    expect(lintOutlineDehustle(SAMPLE_OUTLINE)).toEqual([])
  })
})

describe('scaffoldCourse', () => {
  it('emits both locales for each module + unit', () => {
    expect(byPath('content/ru/01-example/_meta.json')).toBeDefined()
    expect(byPath('content/en/01-example/_meta.json')).toBeDefined()
    expect(byPath('content/ru/01-example/u1-intro.mdx')).toBeDefined()
    expect(byPath('content/en/01-example/u2-practice.mdx')).toBeDefined()
  })

  it('_meta.json parses to the right shape with localized fields', () => {
    const meta = JSON.parse(byPath('content/ru/01-example/_meta.json')!.content)
    expect(meta.module).toBe(1)
    expect(meta.level).toBe(1)
    expect(meta.title).toBe('Пример модуля')
    expect(meta.units.map((u: { slug: string }) => u.slug)).toEqual(['u1-intro', 'u2-practice'])
  })

  it('every .mdx has a title frontmatter line and the four Phase tags in order', () => {
    for (const f of files.filter(f => f.path.endsWith('.mdx'))) {
      expect(f.content).toMatch(/^---\ntitle: "/)
      const phases = [...f.content.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
      expect(phases).toEqual(['activation', 'reflection', 'concept', 'practice'])
    }
  })

  it('activation/reflection stubs carry no write/type imperatives (drift-guard parity)', () => {
    const block = (mdx: string, type: string) => {
      const re = new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`)
      return re.exec(mdx)?.[1] ?? ''
    }
    for (const f of files.filter(f => f.path.endsWith('.mdx'))) {
      for (const type of ['activation', 'reflection']) {
        expect(block(f.content, type)).not.toMatch(/\b(напиши|запиши|type|write)\b/i)
      }
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/authoring/scaffold.test.ts`
Expected: FAIL — cannot resolve `./scaffold` / `./sample-outline`.

- [ ] **Step 3: Write the sample outline**

Create `lib/authoring/sample-outline.ts`:

```ts
// lib/authoring/sample-outline.ts
// A tiny, de-hustle-clean example outline used to materialize _template's 01-example.
import type { CourseOutline } from './outline'

export const SAMPLE_OUTLINE: CourseOutline = {
  name: { ru: 'Пример курса', en: 'Example Course' },
  modules: [
    {
      slug: '01-example', level: 1,
      title: { ru: 'Пример модуля', en: 'Example module' },
      description: { ru: 'Как устроен модуль курса', en: 'How a course module is shaped' },
      units: [
        {
          slug: 'u1-intro',
          title: { ru: 'Знакомство', en: 'Getting started' },
          objective: { ru: 'Понять, зачем этот модуль', en: 'Understand why this module exists' },
        },
        {
          slug: 'u2-practice',
          title: { ru: 'Первый шаг', en: 'First step' },
          objective: { ru: 'Сделать один конкретный шаг', en: 'Take one concrete step' },
        },
      ],
    },
  ],
}
```

- [ ] **Step 4: Write the scaffolder**

Create `lib/authoring/scaffold.ts`:

```ts
// lib/authoring/scaffold.ts
// Pure emitter: maps a (valid) outline to the file skeleton the AI stages fill in.
// No I/O — the caller writes the returned files to a chosen root.
import type { CourseOutline, ModuleOutline, UnitOutline } from './outline'

export interface ScaffoldFile { path: string; content: string }

const LOCALES = ['ru', 'en'] as const

function metaJson(moduleIndex: number, m: ModuleOutline, locale: 'ru' | 'en'): string {
  const meta = {
    module: moduleIndex + 1,
    title: m.title[locale],
    description: m.description[locale],
    duration: 'TODO',
    level: m.level,
    units: m.units.map(u => ({ slug: u.slug, title: u.title[locale] })),
  }
  return JSON.stringify(meta, null, 2) + '\n'
}

function unitMdx(moduleIndex: number, unitIndex: number, u: UnitOutline, locale: 'ru' | 'en'): string {
  return `---
title: "${u.title[locale]}"
unit: ${unitIndex + 1}
module: ${moduleIndex + 1}
duration: "TODO"
---

{/* objective: ${u.objective[locale]} */}

<Phase type="activation">

TODO: a bisociative mental hook — collide the learner's familiar frame with a foreign one. Mental only.

</Phase>

<Phase type="reflection">

TODO: a second, different frame on the same idea. Mental, bisociative.

</Phase>

<Phase type="concept">

TODO: the core idea, plainly. Short sentences.

</Phase>

<Phase type="practice">

TODO: one concrete applied step the learner does for real.

</Phase>
`
}

export function scaffoldCourse(o: CourseOutline): ScaffoldFile[] {
  const files: ScaffoldFile[] = []
  o.modules.forEach((m, mi) => {
    for (const locale of LOCALES) {
      files.push({ path: `content/${locale}/${m.slug}/_meta.json`, content: metaJson(mi, m, locale) })
      m.units.forEach((u, ui) => {
        files.push({ path: `content/${locale}/${m.slug}/${u.slug}.mdx`, content: unitMdx(mi, ui, u, locale) })
      })
    }
  })
  return files
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/authoring/scaffold.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add LMS/tochka-sborki/web/lib/authoring/scaffold.ts LMS/tochka-sborki/web/lib/authoring/sample-outline.ts LMS/tochka-sborki/web/lib/authoring/scaffold.test.ts
git -c commit.gpgsign=false commit -m "feat(authoring): pure course scaffolder + sample outline (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: writer CLI + materialize `_template/01-example`

**Files:**
- Create: `scripts/scaffold-course.ts`
- Create (generated): `LMS/_template/content/{ru,en}/01-example/_meta.json`, `u1-intro.mdx`, `u2-practice.mdx` (6 files)

**Interfaces:**
- Consumes (from Tasks 1–3): `scaffoldCourse`, `validateOutline`, `lintOutlineDehustle`, `SAMPLE_OUTLINE`.
- Produces: a runnable CLI; the committed `01-example` skeleton.

- [ ] **Step 1: Write the CLI**

Create `scripts/scaffold-course.ts`:

```ts
// scripts/scaffold-course.ts
// Thin writer CLI: validate + de-hustle-lint the sample outline, then write the scaffold
// skeleton to a target root. Run from web/:  npx --yes tsx scripts/scaffold-course.ts [root]
// Default root: ../../_template (i.e. LMS/_template), relative to web/.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scaffoldCourse } from '../lib/authoring/scaffold'
import { validateOutline } from '../lib/authoring/outline'
import { lintOutlineDehustle } from '../lib/authoring/dehustle'
import { SAMPLE_OUTLINE } from '../lib/authoring/sample-outline'

const HERE = dirname(fileURLToPath(import.meta.url))
const root = resolve(HERE, '..', process.argv[2] ?? '../../_template')

const errors = validateOutline(SAMPLE_OUTLINE)
if (errors.length) { console.error('Outline invalid:\n' + errors.join('\n')); process.exit(1) }

const banned = lintOutlineDehustle(SAMPLE_OUTLINE)
if (banned.length) { console.error('De-hustle lint failed: ' + banned.join(', ')); process.exit(1) }

for (const f of scaffoldCourse(SAMPLE_OUTLINE)) {
  const dest = join(root, f.path)
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, f.content, 'utf8')
  console.log('wrote ' + dest)
}
```

- [ ] **Step 2: Run the CLI to materialize the skeleton**

Run (from `LMS/tochka-sborki/web`): `npx --yes tsx scripts/scaffold-course.ts`
Expected: prints `wrote …/_template/content/ru/01-example/_meta.json` and five more lines (ru+en × `_meta.json` + `u1-intro.mdx` + `u2-practice.mdx`).

- [ ] **Step 3: Verify the generated tree**

Run: `npx vitest run lib/authoring/scaffold.test.ts && ls LMS/../_template/content/ru/01-example`
Expected: the scaffold test passes and the directory lists `_meta.json`, `u1-intro.mdx`, `u2-practice.mdx`. (If the `ls` path is awkward from `web/`, instead run `find ../../_template/content -type f` and confirm 6 files exist.)

- [ ] **Step 4: Run the full suite**

Run: `npm test`
Expected: PASS — all suites green, including the three new `lib/authoring` test files and all prior tests (no regression).

- [ ] **Step 5: Typecheck gate**

Run: `npx tsc --noEmit`
Expected: no errors. (The new modules/CLI are TS but not in the Next build graph; vitest uses esbuild without type-checking — this gate catches type errors that would otherwise lurk.)

- [ ] **Step 6: Build-validate**

Run: `npm run build`
Expected: build succeeds (the new modules are not imported by the app; confirms no breakage).

- [ ] **Step 7: Commit**

```bash
git add LMS/tochka-sborki/web/scripts/scaffold-course.ts "LMS/_template/content/ru/01-example" "LMS/_template/content/en/01-example"
git -c commit.gpgsign=false commit -m "feat(authoring): writer CLI + materialize _template/01-example skeleton (fb_8e8eaf0acfdb)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- `outline.ts` contract + validator (slug regex, bilingual, level, uniqueness) → Task 1. ✅
- `dehustle.ts` `lintDehustle` + `lintOutlineDehustle` with EN+RU banned list → Task 2. ✅
- `scaffold.ts` `scaffoldCourse` emitting `_meta.json` + 4-Phase MDX per locale + `sample-outline.ts` → Task 3. ✅
- writer CLI + materialized `01-example` closing the README's dangling reference → Task 4. ✅
- Tests: validator truth tables (Task 1), dehustle EN/RU + clean + outline scan (Task 2), scaffold paths/shape/phases/no-write-verbs + sample valid&clean (Task 3); full suite + tsc + build (Task 4). ✅
- Authenticity (de-hustle executable; no write/type in activation/reflection stubs) → Tasks 2, 3 + the no-verbs test. ✅

**Placeholder scan:** "TODO" appears only as intentional scaffold *output* content, never as a plan gap. Every code step has full code. ✅

**Type consistency:** `CourseOutline`/`ModuleOutline`/`UnitOutline` defined in Task 1, imported by Tasks 2–4. `validateOutline`, `lintDehustle`/`lintOutlineDehustle`, `scaffoldCourse`/`ScaffoldFile`, `SAMPLE_OUTLINE` signatures match across tasks and the CLI. `Bi` reused from `@/lib/course`. `structuredClone` is available (Node ≥17; runner is Node 25). ✅

---

**Plan complete and saved to `LMS/tochka-sborki/web/docs/superpowers/plans/2026-06-30-course-authoring-s1.md`.**
