# New course checklist

Everything a new course must provide. Engine code is reused unchanged; the items below are the
**course-specific** surface (derived from the tochka-sborki audit, 2026-06-17).

## 1. Identity — `web/packs/<pack>/course.config.ts` (Ф1: было `lib/course.ts`)
- [ ] `COURSE.name`, `fullName` (ru+en), `domain` (https, no trailing slash), `locales`, `publisher`.
- [ ] Активный pack выбирается `COURSE_PACK` (alias `@pack`, `lib/pack.ts`); дефолт tochka-sborki.
- Single source for SEO (`sitemap.ts`/`robots.ts`) + PWA manifest. Start from `course.config.template.ts`.
- [ ] Register the course in `LMS/registry.json` (slug / name / tagline / url / status / locales). Values must match `COURSE` — the engine's registry drift-guard test (`lib/academy/registry.test.ts`) enforces url, name.ru and locales.
- [ ] Progress API: send your `course` slug in `/api/progress/*` bodies and namespace lesson slugs (e.g. `<course>/<lesson>`) — the `progress` PK is `(user_id, lesson_slug)` without course, so bare-slug collisions across courses are prevented by convention.

## 2. UI copy — `web/packs/<pack>/dictionaries.ts`
- [ ] Replace every value in the `ru` and `en` objects (nav labels, page copy, feedback, …). **32 components read this** — keep the interface shape, swap the strings.

## 3. Branding / PWA
- [ ] `web/app/icon.svg` (brand glyph) → run `node scripts/gen-pwa-icons.mjs` to regenerate `public/icon-*.png`.
- [ ] `web/app/manifest.ts` name/short_name/colors (or read from `COURSE`).
- [ ] `web/app/layout.tsx` metadata title/description/og.

## 4. Course Materials — `web/packs/<pack>/materials.ts`
- [ ] Fill `COURSE_MATERIALS` groups (templates / course links / external tools). Start from `materials.template.ts`. Put downloadable files in `web/public/materials/`.

## 5. RPG layer data (optional — only if using gamification)
- [ ] `web/packs/<pack>/skins/*.json` + `skins-meta.ts` — themed worlds/mentors.
- [ ] `web/packs/<pack>/course/niche-map.ts` — niche → module mapping.
- [ ] `web/lib/intake/questions.ts` — intake questions (выделение в pack — отдельный слайс).
- [ ] `web/packs/<pack>/course/showcase.ts` — possibilities gallery on home.

## 6. Content — `web/packs/<pack>/content/{ru,en}/<NN-module>/`
- [ ] One folder per module, numbered `NN-slug` (e.g. `01-intro`). See `content/{ru,en}/01-example/`.
- [ ] `_meta.json` per module: `{ module, title, description, duration, level, units:[{slug,title}] }`.
- [ ] `uN-slug.mdx` per unit: frontmatter `{ title, unit, module, duration }` + body. Mirror ru→en.
- [ ] Reflection phases (`<Phase type="activation|reflection">`) are bisociative/mental — no "write/type" verbs (a drift-guard test enforces this).

## 7. Deploy
- [ ] New CF Pages project; add a `deploy.yml` job with a path filter on `LMS/<course>/web`.
- [ ] `npm run test` + `npm run build` green before first push.
