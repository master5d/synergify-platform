# S.A.S.H.A — S3: academy brand + landing at mamaev.coach/academy/ (fb_7c7eda02a024)

**Ticket:** `fb_7c7eda02a024` (S.A.S.H.A #1), **slice 3** of umbrella epic `fb_fcf7617373f4`. Consumes S1's registry SoT; the LMS-side catalog/switcher (S2) is untouched — hub renders its own landing.

## Decisions (design gate)

1. **Placement: hub route `mamaev.coach/academy/`** (ru) + `/en/academy/` — zero new infra; graduating to an own domain later = one registry field.
2. **Copy: skeleton now + sovereign prompt-emitter.** The landing ships with modest, honest positioning copy in the hub dictionary («древняя мудрость × современная наука» frame, de-hustled, no guru pathos). A CLI emits a manifesto-drafting prompt for the OWNER's agent; the owner replaces the dictionary copy later. No live LLM anywhere.
3. **Vibe-ref honored / deferred:** dark cosmic hero (pure-CSS starfield, zero images/deps), gold-on-dark accents, display wordmark (Unbounded is already loaded in hub layout). Constellation-as-navigation and a graphic logo are DEFERRED (with one course a constellation is decoration; typographic wordmark = the identity for now). Anti-patterns hard-banned: countdown/early-bird, glossy testimonials, price block, grandiose credentials, religious iconography.
4. **`LMS/registry.json` `academy.url`** → `"https://mamaev.coach/academy"` (dark-ship lifted; passes S1's validator: https, no trailing slash).

## Context (grep-before-build)

- Hub app (`hub/`): Next.js 16 static export; ru at root + `en/` mirror routes; page pattern = shared component in `hub/components/` (e.g. `home-page.tsx`) + thin route files; styling idiom = inline styles + embedded `<style>` block for media queries; **relative imports** (`'../lib/dictionaries'`).
- Cross-app data precedent: `hub/lib/site.ts` reads the blog manifest via `readFileSync(join(process.cwd(), '..', 'blog', 'out', 'posts-manifest.json'))` — cwd is `hub/` at build. Registry path: `join(process.cwd(), '..', 'LMS', 'registry.json')`. fs-read, NOT source import (workers gotcha) and NOT a bundler import (no turbopack-root concern).
- `hub/lib/dictionaries.ts`: single `Dictionary` interface (~line 18) + `dictionaries` ru (~75)/en (~166) + `getDictionary`. Section precedent: `founder: { eyebrow; heading; paragraphs: string[] }` with a dedicated test file (`dictionaries.founder.test.ts` idiom).
- `hub/app/sitemap.ts`: `MetadataRoute.Sitemap` entries with `alternates.languages.en`; `force-static`.
- CI: `deploy-hub` builds blog then hub from full checkout; workflow-level `paths` already include `LMS/registry.json` (S1) — a registry change redeploys hub too. Registry values today: academy name `S.A.S.H.A`, fullName both locales `Synergema Authentica Starseed Holon Academy`, one live course `tochka-sborki` → `https://ai.mamaev.coach`.
- Hub tests: Vitest (`npm test`), 5 existing test files; drift-guard = source-reading pattern.

## Architecture

### 1. `hub/lib/academy.ts` — build-time registry reader

```ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Locale } from './dictionaries'

interface Bi { ru: string; en: string }

export interface AcademyInfo { name: string; fullName: Bi; url: string | null }

export interface AcademyCourse {
  slug: string
  name: string      // localized
  tagline: string   // localized
  url: string
  status: 'live' | 'coming-soon'
}

function registry(): {
  academy: AcademyInfo
  courses: { slug: string; name: Bi; tagline: Bi; url: string; status: 'live' | 'coming-soon' }[]
} {
  return JSON.parse(readFileSync(join(process.cwd(), '..', 'LMS', 'registry.json'), 'utf8'))
}

export function getAcademy(): AcademyInfo
export function getCourses(locale: Locale): AcademyCourse[]   // registry order, ALL statuses
```

Tests (`hub/lib/academy.test.ts`, real fs against the committed registry): `getAcademy().name === 'S.A.S.H.A'`; `getAcademy().url === 'https://mamaev.coach/academy'` (hub↔registry drift-guard for the URL this slice claims); `getCourses('ru')` contains `tochka-sborki` with url `https://ai.mamaev.coach` and localized ru name; `getCourses('en')` localizes en.

### 2. Dictionary `academy` section (`hub/lib/dictionaries.ts`, interface + ru + en)

```ts
academy: {
  eyebrow: string          // 'академия' / 'academy'
  wordmark: string         // 'S.A.S.H.A' (both locales)
  fullName: string         // 'Synergema Authentica Starseed Holon Academy' (both)
  positioning: string[]    // 2 modest paragraphs, de-hustled
  coursesLabel: string     // 'Курсы' / 'Courses'
  comingSoon: string       // 'скоро' / 'coming soon'
  metaTitle: string
  metaDescription: string
}
```

Positioning (exact copy, both locales):
- ru[0]: «S.A.S.H.A — учебная семья курсов, где древняя мудрость встречается с современной наукой и AI-инструментами. Каждый курс — самостоятельный мир; вход в них общий.»
- ru[1]: «Первый курс академии — «Точка Сборки», курс по vibe-кодингу. Семья будет расти — без спешки и без обещаний, которых мы не можем сдержать.»
- en[0]: "S.A.S.H.A is a learning family of courses where ancient wisdom meets modern science and AI tools. Each course is a world of its own; the door in is shared."
- en[1]: "The academy's first course is Tochka Sborki, a course on vibe coding. The family will grow — without rush and without promises we can't keep."

(The component drift-guard's «no hardcoded course names» rule applies to the COMPONENT source; the dictionary positioning naming the first course is the honest copy itself, not a violation.)

Test (`hub/lib/dictionaries.academy.test.ts`): all keys non-empty in both locales; `positioning.length >= 2`; **authenticity guard** — the academy section values (joined) match none of `/скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i`.

### 3. `hub/components/academy-page.tsx` — the landing

`AcademyPage({ locale }: { locale: Locale })`, server component, relative imports:
- **Hero:** full-width dark section (deep space `#070810`), pure-CSS starfield (embedded `<style>`: two layered `radial-gradient` star fields via `background-image` on the hero, no images/deps), gold accent `#d9a95c`; `eyebrow` (mono, letter-spaced, gold) → `wordmark` in `var(--font-display)` (Unbounded, loaded in hub layout) → `fullName` subtitle → `positioning` paragraphs (muted white).
- **Courses:** `coursesLabel` heading + card grid from `getCourses(locale)`: `live` → `<a href={c.url} aria-label={c.name} target="_blank" rel="noopener noreferrer">` card (name + tagline), `coming-soon` → unlinked card + `comingSoon` badge (same semantics as the LMS catalog; carries over S2's deferred aria-label minor).
- All copy via `getDictionary(locale).academy`; no hardcoded course names; no metrics/countdown/testimonials.

### 4. Routes + sitemap

- `hub/app/academy/page.tsx`: `metadata` from `getDictionary('ru').academy` (`metaTitle`/`metaDescription`), default export renders `<AcademyPage locale="ru" />`.
- `hub/app/en/academy/page.tsx`: same with `'en'`.
- `hub/app/sitemap.ts`: add `{ url: `${SITE.url}/academy/`, lastModified: today, alternates: { languages: { en: `${SITE.url}/en/academy/` } } }` after the blog entry.

Component drift-guard (`hub/components/academy-page.test.ts`, source-reading): component uses `getCourses` + `getDictionary`, has `status === 'live'` branch + `rel="noopener noreferrer"` + `aria-label`, no hardcoded course names (`Точка Сборки|Tochka Sborki`), no banned-lexicon (same authenticity regex); route files exist and render `<AcademyPage locale="ru" />` / `<AcademyPage locale="en" />`; sitemap source contains `/academy/`.

### 5. `scripts/academy-manifesto-prompt.mjs` — sovereign prompt-emitter (repo root, beside `sync-desops-kit.mjs`)

Zero-dep Node script; prints a bilingual, de-hustled prompt to stdout: embeds the academy identity (name/fullName from `LMS/registry.json`) + current positioning frame, asks the owner's agent to draft a manifesto (ru+en, first person, honest, «ancient wisdom × modern science» frame), hard constraints inlined (no countdown/urgency, no testimonials, no credentials-flexing, no religious iconography, no promises that can't be kept), and ends with placement instructions: paste the result into the `academy.positioning` paragraphs in `hub/lib/dictionaries.ts` (both locales).

### 6. `LMS/registry.json`

`academy.url`: `null` → `"https://mamaev.coach/academy"`. S1's committed-registry round-trip test still passes (rule: null OR https-no-trailing-slash). LMS suite re-run as a gate since the shared SoT changed.

## Authenticity / values

Owner-voice respected: shipped copy is minimal, modest, and explicitly temporary (prompt-emitter hands the manifesto to the owner's own agent). The authenticity regex guards both the dictionary values and the component source. No fabricated courses, metrics, urgency, or testimonials — enforced by tests, not intentions. Publisher branding (`Mamaev Institute for AI`) untouched — the rename ticket is sacred-blocked and out of scope.

## Scope

- Hub: `lib/academy.ts` (+test), `lib/dictionaries.ts` academy section (+test), `components/academy-page.tsx` (+drift-guard test), `app/academy/page.tsx`, `app/en/academy/page.tsx`, `app/sitemap.ts`.
- Repo: `scripts/academy-manifesto-prompt.mjs`, `LMS/registry.json` (one field).
- **Out of scope:** graphic logo, constellation visualization, own domain, publisher rename, unified account (#4), community (#5), any LMS app change.

## Backward compatibility

Additive routes + dictionary section (both locales filled in the same commit); one registry field flips null→url, which S1's validator explicitly allows. Hub deps unchanged; no new dependencies anywhere.

## Task decomposition (for the plan)

1. `hub/lib/academy.ts` + test + `LMS/registry.json` academy.url flip (TDD; includes re-running the LMS registry suite as a cross-app gate).
2. Dictionary `academy` section (interface+ru+en) + `dictionaries.academy.test.ts` incl. authenticity guard (TDD).
3. `AcademyPage` + both routes + sitemap entry + component/route/sitemap drift-guards (TDD).
4. `scripts/academy-manifesto-prompt.mjs` + full gates (hub vitest + hub tsc + hub build; LMS registry test re-run).
