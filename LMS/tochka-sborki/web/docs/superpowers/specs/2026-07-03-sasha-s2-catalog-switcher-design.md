# S.A.S.H.A — S2: multi-course catalog + course-switcher (fb_b4a9687c5cc3)

**Ticket:** `fb_b4a9687c5cc3` (S.A.S.H.A #3), **slice 2** of umbrella epic `fb_fcf7617373f4`. Consumes S1's registry (`fb_6b2ae75df6fb`, shipped: `LMS/registry.json` + `lib/academy/registry.ts`).

## Decisions (design gate)

1. **Dark-ship wiring:** `CourseSwitcher` is wired into the Footer NOW but renders `null` while the registry holds no other live course — zero visual change today; a second live course in `registry.json` surfaces it automatically. `CourseCatalog` is built + tested but wired NOWHERE — the academy landing (#1) consumes it later.
2. **Self-identity by domain, not slug:** the engine finds "which registry entry am I" via `entry.url === COURSE.domain` (S1's drift-guard already pins url===domain). `COURSE` gains no new fields.
3. **Status semantics:** switcher lists only **live** other courses (it is navigation). Catalog lists **all** courses: live → linked card, `coming-soon` → unlinked card + badge.
4. **Out of scope:** enrollment-awareness (needs #4 accounts), an `/academy/` route, hub consumption, any change to `lib/course.ts`.

## Context (grep-before-build)

- S1 exports (in `lib/academy/registry.ts`): `CourseStatus`, `CourseEntry`, `AcademyRegistry`, `REGISTRY`, `validateRegistry(r): string[]`, `ResolvedCourse { slug; name; tagline; url; status }`, `resolveCourses(locale, r = REGISTRY): ResolvedCourse[]`.
- `COURSE.domain = 'https://ai.mamaev.coach'` (`lib/course.ts`); `Locale = 'ru' | 'en'`, `Dictionary` type + `dictionaries` + `getDictionary(locale)` in `lib/dictionaries.ts` (`footer:` appears exactly three times — type ~145, ru ~406, en ~665; the new `academy` block goes right before `footer` in each of the three).
- `components/footer.tsx`: locale-aware; module-local `labelStyle` / `linkStyle` consts; middle section = auto-fit grid (`repeat(auto-fit, minmax(180px, 1fr))`, footer.tsx:114–198) with 4 columns (Topics / Resources / Author / Project). Insertion point: after the Project column's closing `</div>` (line 197), inside the grid.
- Component drift-guard test pattern: `components/media-transcript.test.ts` / `components/ai-doubles-band.test.ts` — node env, read the component source with `fs`, assert invariants (no DOM render).

## Architecture

### 1. `lib/academy/registry.ts` — append `resolveOtherCourses`

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

### 2. `lib/dictionaries.ts` — additive `academy` section (type + ru + en, before `footer` in each)

```ts
// Dictionary type:
academy: {
  switcherLabel: string   // footer column label
  catalogTitle: string    // catalog heading (used by #1 later)
  comingSoon: string      // badge on not-yet-live catalog cards
}
// ru:
academy: {
  switcherLabel: 'академия',
  catalogTitle: 'Курсы академии',
  comingSoon: 'скоро',
},
// en:
academy: {
  switcherLabel: 'academy',
  catalogTitle: 'Academy courses',
  comingSoon: 'coming soon',
},
```

### 3. `components/academy/course-switcher.tsx`

`CourseSwitcher({ locale }: { locale: Locale })`:
- `const others = resolveOtherCourses(locale, COURSE.domain)`
- `others.length === 0` → `return null` (no wrapper leaks into the footer grid)
- else → one footer-style column: `<div><span style={labelStyle}>{t.academy.switcherLabel}</span>` + one `<a href={c.url} style={linkStyle}>{c.name}</a>` per course (external `target="_blank" rel="noopener noreferrer"` — courses live on separate domains). `labelStyle`/`linkStyle` are small local consts copied from footer.tsx (module-local there, not exported — duplication is two style objects, acceptable; footer look preserved).

### 4. `components/academy/course-catalog.tsx` (unwired)

`CourseCatalog({ locale }: { locale: Locale })`:
- `const courses = resolveCourses(locale)` — ALL statuses.
- Heading `t.academy.catalogTitle`; one card per course: course `name` + `tagline`; `status === 'live'` → the card links to `c.url` (external, same rel attrs); `coming-soon` → unlinked card + `t.academy.comingSoon` badge.
- Registry-driven only: no hardcoded course names, no fabricated entries/metrics.
- Simple semantic markup + inline styles consistent with course look (`var(--…)` tokens); exact card styling is the implementer's transcription from the plan.

### 5. Footer wiring (`components/footer.tsx`)

Import `CourseSwitcher` and render `<CourseSwitcher locale={locale} />` directly after the Project column's closing `</div>`, inside the auto-fit grid (a null render adds nothing; a non-null render becomes the 5th column and the grid reflows).

### 6. Tests

- `lib/academy/registry.test.ts` (append): `resolveOtherCourses` filters self by url; returns `[]` on the single-course REGISTRY (dark-ship proof); excludes `coming-soon` others; includes live others (fixture with a second course).
- `components/academy/course-switcher.test.ts` (source-reading drift-guard, node env): source contains the `others.length === 0` null-guard; calls `resolveOtherCourses`; passes `COURSE.domain` as selfUrl; contains no hardcoded course name literals («Точка Сборки»/'Tochka Sborki').
- `components/academy/course-catalog.test.ts` (same pattern): calls `resolveCourses`; handles `coming-soon` distinctly from `live` (badge + unlinked); uses `t.academy.*` dictionary keys, no hardcoded RU/EN copy; no hardcoded course names.
- Footer drift-guard: assert `footer.tsx` source renders `<CourseSwitcher` (wired, not forgotten) — appended to the switcher test file.
- Gates: full Vitest suite + `npx tsc --noEmit` + `npm run build` green; build output byte-identical pages today is NOT asserted (switcher renders null — verified by the resolver unit test + null-guard drift-guard instead).

## Authenticity / values

Registry-driven only — the UI cannot claim courses that don't exist; `coming-soon` is a factual registry status, unlinked (no fake doors). No metrics, no countdowns, no vanity copy. Dictionary labels lowercase-modest per footer's existing style.

## Backward compatibility

Additive: one resolver, one dictionary section, two new components, one footer insertion that renders null today. No new dependencies. `Dictionary` type gains a required section — both locales are filled in the same commit, so 32 dictionary consumers see no break.

## Task decomposition (for the plan)

1. `resolveOtherCourses` + dictionary `academy` section (type+ru+en) + resolver tests (TDD).
2. `CourseSwitcher` + footer wiring + switcher/footer drift-guard tests.
3. `CourseCatalog` (unwired) + catalog drift-guard tests; full gates (suite/tsc/build).
