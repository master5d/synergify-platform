# New course checklist

Everything a new course must provide. Engine code is reused unchanged; the items below are the
**course-specific** surface (derived from the tochka-sborki audit, 2026-06-17).

## 1. Identity — `web/packs/<pack>/course.config.ts` (Ф1: было `lib/course.ts`)
- [ ] `COURSE.name`, `fullName` (ru+en), `domain` (https, no trailing slash), `locales`, `publisher`.
- [ ] Активный pack выбирается `COURSE_PACK`; он материализуется в `packs/_active`
      (`scripts/select-pack.mjs` из `prebuild`/`pretest`) — туда смотрят tsconfig, vitest и next.
- [ ] `COURSE.features` — какие слои движка включены (`rpg`, `certificate`). Курс без RPG
      не получает квест-лог, режимы прохождения и шарды.
- [ ] `COURSE.gates` — какие двери на уроках (`auth`, `intake`, `admission`). Курс школы:
      `auth: true, intake: false, admission: true`.
- [ ] `COURSE.domain` совпадает с `url` записи в `LMS/registry.json` (drift-guard).
      Курс в подпути домена школы: домен вида `https://<школа>/<подпуть>` +
      сборка с `COURSE_BASE_PATH=/<подпуть>` + склейка `scripts/merge-course.mjs`.
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

## 5a. Companion «Учиться с ИИ» — `web/packs/<pack>/course/companion.ts` (обязателен, не только для RPG)
- [ ] `COMPANION`: `identity` / `context` (имя СВОЕГО курса) / `method` / `guardrails` / `opener` / `bootstrap`.
- [ ] `usesProfile` — брать ли профиль RPG-анкеты (скин, ниша, запрос, режим); курс без RPG ставит `false`.
- [ ] `mentorPersona` — нужен ли тёплый-но-твёрдый контракт наставника (`lib/mentor-persona.ts`).
- [ ] Границы, которые курс обещает студенту в тексте, ОБЯЗАНЫ быть в `guardrails` — иначе обещание пустое (intake LMS#16).
- [ ] `standing` — стоячая роль для памяти агента (устав на `/character`): заголовок, роль, петля, законы, первый вопрос.
- [ ] `web/packs/<pack>/course/intake-gate.ts` — копия ворот анкеты (даже если `gates.intake: false` — честный текст).
- [ ] `web/packs/<pack>/public-owned.json` — какие файлы `web/public/` принадлежат курсу; чужое вырезается из экспорта
      (`scripts/prune-public.mjs`), у каждого файла ровно один владелец (`lib/public-ownership.test.ts`).
- [ ] Числа уроков в реестре, роадмапе, сертификате и описаниях модулей сверяет `lib/content/lesson-count.test.ts`.
- [ ] Учебная связка — в `_meta.json` каждого модуля (RU и EN): `objectives` (3–5 проверяемых целей) и `checks`
      (вопросы «проверь себя»: урок, цель, 2–5 вариантов, `answer`, объяснение); в MDX урока — метка
      `<SelfCheck id="…"/>` внутри `<Phase type="concept">`. Сверяет `lib/content/alignment.test.ts`.

## 6. Content — `web/packs/<pack>/content/{ru,en}/<NN-module>/`
- [ ] One folder per module, numbered `NN-slug` (e.g. `01-intro`). See `content/{ru,en}/01-example/`.
- [ ] `_meta.json` per module: `{ module, title, description, duration, level, units:[{slug,title}] }`
      + `layout: "phases" | "prose"` — фазовый мастер (4 фазы, `<Phase>` в каждом юните)
      или сплошная проза. Гвард сверяет заявленную разметку с телами уроков.
- [ ] `uN-slug.mdx` per unit: frontmatter `{ title, unit, module, duration }` + body. Mirror ru→en.
- [ ] Reflection phases (`<Phase type="activation|reflection">`) are bisociative/mental — no "write/type" verbs (a drift-guard test enforces this).

## 7. Deploy
- [ ] New CF Pages project; add a `deploy.yml` job with a path filter on `LMS/<course>/web`.
- [ ] `npm run test` + `npm run build` green before first push.
