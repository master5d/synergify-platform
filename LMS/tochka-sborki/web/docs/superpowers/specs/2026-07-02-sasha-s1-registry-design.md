# S.A.S.H.A — S1: multi-course registry / config contract (fb_6b2ae75df6fb)

**Ticket:** `fb_6b2ae75df6fb` (S.A.S.H.A #2), **first slice** of the umbrella epic `fb_fcf7617373f4`. Approved sequencing: engine-first — #2 registry → #3 catalog/switcher → #1 academy landing → #4 unified account → #5 community.

## Decisions (design gate)

1. **SoT = `LMS/registry.json`** (repo-level JSON) + a typed loader in the engine. Follows the repo's cross-app precedent: blog→hub data bridge is an emitted JSON read by the consumer, NOT source imports (the workers↔web relative source-import gotcha is the counter-example). Any surface — course apps, hub, future courses — reads the same file.
2. **Dark-ship:** `academy.url` is `null` until the academy landing (#1) exists. No UI, no visual change in this slice.

## Context (grep-before-build)

- `lib/course.ts` exports `Bi { ru; en }` + `COURSE` (`name`, `shortName`, `fullName: Bi`, `domain: 'https://ai.mamaev.coach'` no trailing slash, `locales: ['ru','en']`, `publisher`). Consumers: `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`, `lib/authoring/outline.ts`.
- Courses are **separate static-export Next.js apps** (`output: 'export'`) on separate domains — a "registry" is build-time data, not runtime routing.
- `LMS/_template/` holds docs + config templates only (`AUTHORING.md`, `CHECKLIST.md`, `README.md`, `course.config.template.ts`, `content/`) — no web app, so the registry contract lands there as a doc step.
- CI (`.github/workflows/deploy.yml`): `deploy-web` does `npm ci` + build inside `LMS/tochka-sborki/web` from a full repo checkout — `LMS/registry.json` is present in CI. Paths filter currently misses `LMS/registry.json`.
- `tsconfig.json` has `resolveJsonModule: true`; Vitest env=node; validator style mirrors `lib/authoring/outline.ts` `validateOutline(o): string[]`.

## Architecture

### 1. `LMS/registry.json` — source of truth

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

### 2. `lib/academy/registry.ts` — typed loader + validation (engine)

```ts
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'
import registryJson from '../../../../registry.json'   // LMS/registry.json

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

export const REGISTRY: AcademyRegistry = registryJson as AcademyRegistry

export function validateRegistry(r: AcademyRegistry): string[]

export interface ResolvedCourse {
  slug: string
  name: string      // name[locale]
  tagline: string   // tagline[locale]
  url: string
  status: CourseStatus
}

/** Localized course list, outline order preserved — the interface #3 (catalog/switcher) consumes. */
export function resolveCourses(locale: Locale, r: AcademyRegistry = REGISTRY): ResolvedCourse[]
```

`validateRegistry` rules (each violation = one message string; `[]` = valid):
- `academy.name` non-empty; `academy.fullName.ru`/`.en` non-empty; `academy.url` is `null` or `https://…` without trailing slash
- course slugs unique; each slug matches `^[a-z0-9-]+$`
- each course `name`/`tagline` non-empty in **both** `ru` and `en`
- each `url` starts with `https://` and has no trailing slash
- each `status` is `'live' | 'coming-soon'`
- each `locales` non-empty and ⊆ `['ru','en']`
- at least one course with `status === 'live'`

**Turbopack root:** the JSON import crosses the app boundary (`LMS/registry.json` sits outside `web/`). In CI, Turbopack's auto-detected root is `web/` itself (the repo root has no lockfile), which can reject imports outside the root. Pin it in `next.config.ts` exactly as hub does since `af2cd303`:

```ts
turbopack: { root: path.join(__dirname, '../../..') }   // mc_hub repo root
```

### 3. Tests (`lib/academy/registry.test.ts`)

- Unit cases per rule (clone a valid fixture, break one field, assert the specific message appears).
- Round-trip: `validateRegistry(REGISTRY)` → `[]` (the committed JSON is always valid).
- `resolveCourses('ru')` / `('en')` pick the right locale strings, preserve order.
- **Drift-guard (COURSE↔registry coherence):** the entry with `slug === 'tochka-sborki'` exists, and `entry.url === COURSE.domain`, `entry.name.ru === COURSE.name`, `entry.locales` deep-equals `COURSE.locales`. The registry cannot silently diverge from the course's own config.
- Gates: full Vitest suite + `npx tsc --noEmit` + `npm run build` green.

### 4. `LMS/_template/CHECKLIST.md` — contract doc

Add one checklist step: register the new course in `LMS/registry.json` (slug/name/tagline/url/status/locales), matching the values in the course's `lib/course.ts`; the engine's registry drift-guard test enforces the match.

### 5. `.github/workflows/deploy.yml` — paths trigger

Add `LMS/registry.json` to the `on.push.paths` list so a registry change rebuilds/redeploys the course app.

## Authenticity / values

Pure data + validation, no LLM, no dep, no UI. `status: 'coming-soon'` is the only forward-looking state — no fabricated course entries; the registry ships with exactly the one real course.

## Scope

- `LMS/registry.json` (new), `lib/academy/registry.ts` + test (new, in `LMS/tochka-sborki/web`), `next.config.ts` (turbopack.root pin), `LMS/_template/CHECKLIST.md` (one step), `deploy.yml` (one path line).
- **Out of scope:** catalog/switcher UI (#3), hub/academy-landing consumption (#1), sitemap/robots changes, per-course app scaffolding, any change to `lib/course.ts`.

## Backward compatibility

Additive: new JSON + new lib module + doc line + CI path line. Nothing existing imports the registry yet (dark-ship). No new dependencies.

## Task decomposition (for the plan)

1. `LMS/registry.json` + `lib/academy/registry.ts` types/`REGISTRY`/`validateRegistry` + TDD tests (unit rules, round-trip).
2. `resolveCourses` + locale tests + COURSE↔registry drift-guard test.
3. `LMS/_template/CHECKLIST.md` step + `deploy.yml` paths line; full suite + tsc + build green.
