# synergify-platform

Standalone образовательная платформа synergify (монорепо, PUBLIC): мульти-курсовой
LMS-движок + course-pack'и + platform-API + витрины. Прод деплоится ОТСЮДА (Ф0.5
cutover 2026-08-06; mc_hub остался личным контуром mamaev.coach).

Спека: `docs/superpowers/specs/2026-08-06-synergify-platform-extraction-design.md`
План pack-ификации: `docs/superpowers/plans/2026-08-06-f1-packification.md`
Схемы топологии: `docs/diagrams/` (вариант А монорепо — принят; Б «чистый движок» — будущее расщепление)

## Устройство

- **`LMS/tochka-sborki/web/`** — LMS-движок (Next.js 16, static export). Собирает сайт
  активного pack'а: env `COURSE_PACK` → alias `@pack` → `packs/<slug>/` (`lib/pack.ts`).
- **`…/web/packs/`** — course-pack'и (чистые данные, ноль кода движка):
  - `tochka-sborki/` — «Точка Сборки» → ai.synergify.com (live);
  - `living-practice/` — «Практика в живой связи» (coming-soon; курс также живёт на
    academy.synergify.com/praktika до решения о домене).
  Контракт pack'а: `course.config` · `dictionaries` · `materials` · `manifest`
  (исполняемые правила тона курса) · `skins*` · `course/*` · `content/{ru,en}`.
  Граница enforced: `lib/boundary.test.ts` + `lib/content/manifest-guard.test.ts`.
- **`LMS/registry.json`** — SoT курсов (slug/имя/домен/status); читается движком,
  академией и витриной.
- **`workers/`** — platform-API, один на все курсы (auth/progress/admission/feedback/
  CRM/telegram/checkout) → `/api/*` на всех доменах.
- **`academy/`** — academy.synergify.com: витрина школы S.A.S.H.A (манифест, правила,
  admission-гейт) + курс «Практика».
- **`synergify/`** — зонтик synergify.com.

## Авторинг (sovereign: прозу пишет агент автора, движок детерминирован)

- **Новый курс:** `scripts/course-plan-prompt.ts "<идея>" ru --domain <url>` →
  outline.json своим агентом → `scripts/scaffold-course.ts --outline …` (no-clobber) →
  pack по `LMS/_template/CHECKLIST.md` → registry.json → matrix в deploy.yml.
  SOP: `LMS/_template/AUTHORING.md`.
- **Гостевой мастер = МОДУЛЬ внутри существующего курса**, в рамках его манифеста:
  `module-plan-prompt` → outline.json → `author-module` (скаффолд + штамп `_module.json`)
  → research/draft/review CLI → PR; мерджит владелец после зелёного CI.
  SOP: `LMS/_template/AUTHORING-MODULE.md`.

## CI (`.github/workflows/deploy.yml`)

push в main → deploy-web (ТС) · deploy-academy · deploy-workers + **build-packs** —
матрица остальных pack'ов (build+vitest под их `COURSE_PACK`): апгрейд движка
пересобирает все курсы. Новый pack = slug в matrix. Секрет: `CLOUDFLARE_API_TOKEN`.

## Локальная проверка

```bash
cd LMS/tochka-sborki/web
npx vitest run                                # активный pack (дефолт tochka-sborki)
COURSE_PACK=living-practice npx vitest run    # любой другой pack
COURSE_PACK=living-practice npm run build
```
