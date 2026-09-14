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
  - `tochka-sborki/` — «Точка Сборки» → ai.synergify.com;
  - `living-practice/` — «Тишина, в которой слышно» → academy.synergify.com/praktika.
  Контракт pack'а: `course.config` (identity + `features` + `gates`) · `dictionaries` ·
  `materials` · `manifest` (исполняемые правила тона) · `skins*` · `course/*` ·
  `content/{ru,en}` (в `_meta.json` — `layout: phases | prose`).
  Граница enforced: `lib/boundary.test.ts`, `lib/content/manifest-guard.test.ts`,
  `lib/pack-resolution.test.ts`, `lib/course-features.test.ts`, `lib/base-path.test.ts`.

  **Курс объявляет сам:** разметку урока (фазовый мастер или сплошная проза), слои
  движка (`features.rpg`, `features.certificate`) и двери (`gates.auth/intake/admission`).
  Ядро гейтит поверхности по флагам, а НЕ по имени pack'а.

  ⚠ **Активный pack материализуется в `packs/_active`** (`scripts/select-pack.mjs`,
  вызывается из `prebuild`/`pretest`). Подпути `@pack/...` резолвятся через tsconfig
  `paths`, который статичен: до этого механизма `COURSE_PACK` подменял только контент,
  а словари и конфиг молча приезжали от дефолтного курса.
- **`LMS/registry.json`** — SoT курсов (slug/имя/домен/status); читается движком,
  академией и витриной.
- **`workers/`** — platform-API, один на все курсы (auth/progress/admission/feedback/
  CRM/telegram/checkout) → `/api/*` на всех доменах.
- **`academy/`** — academy.synergify.com: витрина школы S.A.S.H.A (манифест, правила,
  admission-гейт) + курс «Практика».
- **`synergify/`** — зонтик synergify.com.

## Контракт pack'а: что ещё курс объявляет сам (с 2026-09-14, intake LMS#16)

- **`course/companion.ts`** — компаньон «Учиться с ИИ» и стоячая роль (`standing`): контекст СВОЕГО курса,
  методика, границы (`guardrails`), `usesProfile` (брать ли RPG-анкету), `mentorPersona`. `lib/learn-prompt.ts` и
  `lib/intake/companion-role-prompt.ts` только собирают. Тест: компаньон называет свой курс и никогда чужой.
- **`course/intake-gate.ts`** — копия ворот анкеты (даже при `gates.intake: false`).
- **`public-owned.json`** — какие файлы `web/public/` принадлежат курсу; общие движка — `scripts/public-shared.json`.
  Postbuild `scripts/prune-public.mjs` вырезает чужое из экспорта; гвард `lib/public-ownership.test.ts` — ровно один владелец.
- Числа уроков в реестре/роадмапе/сертификате/описаниях сверяет `lib/content/lesson-count.test.ts`.
- **Учебная связка** — `objectives` и `checks` в `_meta.json` модуля, метка `<SelfCheck id/>` в уроке; гвард
  `lib/content/alignment.test.ts` (у каждой цели вопрос, у вопроса цель, RU = EN), раскатка — храповик
  `lib/content/alignment-pending.ts`. Спека: `docs/superpowers/specs/2026-09-14-learning-alignment-design.md`.
- Чек-лист нового курса — `LMS/_template/CHECKLIST.md` §5a.

## Подпуть курса: сырая навигация (с 2026-09-14)

`basePath` переписывает только `next/link`, `router` и импортированные ассеты. `window.location.*` и `<a href="/…">` —
только через `pagePath()` / `assetPath()` из `lib/base-path.ts`; гвард `lib/raw-navigation.test.ts`. Без этого все
уроки «Тишины» уводили на `/login/` корня академии (404).

## Вход школы: одна сессия на `.synergify.com` (вариант A, с 2026-09-14)

Воркер привязан к `ai.synergify.com/api/*` И `academy.synergify.com/api/*`. Cookie сессии — `workers/src/lib/session-cookie.ts`
(`Domain=.synergify.com` на школьных хостах, при входе стирается host-only, выход стирает обе). Ссылка из письма ведёт на
сайт курса, с которого просили вход: страница входа шлёт `return_to`, воркер принимает только адрес курса из
`LMS/registry.json` (`lib/return-base.ts`); имя курса в письме — оттуда же. Google-вход помнит базу курса (`oauth_base`).
⚠ Redirect URI каждого домена с Google-входом должен быть в Google Cloud Console (клиент `tochka-sborki-web`, проект `synergify-504117`; `ai.` и `academy.` добавлены, 2026-09-14).

Лицензия — MIT (`LICENSE` в корне). Задачи и решения владельца — `BACKLOG.md`; разбор PRD-intake раунда 2026-09-14 —
`docs/superpowers/research/2026-09-14-lms-prd-intake.md`.

## LLM-вызовы: только через `llm-service` (с 2026-09-04)

Воркер БОЛЬШЕ НЕ ходит в Gemini напрямую. Все четыре LLM-операции (проза листа, классификация
скина по фильму, разбор спроса, черновик брифа) идут в узкий сервис `llm-service/`, который живёт
контейнером на hetzner и зовёт SOVERN-гейтвей по тайнету.

Почему не напрямую в гейтвей: воркер работает на эдже Cloudflare и до тайнета не достаёт, а
выставлять гейтвей наружу запрещено. Наружу выставлен только сервис — `lms-llm.mamaev.coach`
за CF Access, с собственным bearer поверх.

- Контракт и коды отказа: `llm-service/README.md`
- Дизайн и обоснование: `NAUTILUS/docs/superpowers/specs/2026-09-04-lms-llm-service-design.md`
- Секреты воркера: `LLM_SERVICE_TOKEN`, `LLM_CF_ACCESS_CLIENT_ID/SECRET` (НЕ те же, что
  `CF_ACCESS_CLIENT_*` — те принадлежат Listmonk).

**Деградация не изменилась:** отказ сервиса даёт шаблонную прозу и `prose_source='template'`,
анкета собирается. Если в D1 массово `template` — сервис недоступен, смотреть логи воркера
(в них с 2026-09-04 пишется машинный код отказа; раньше этот путь молчал).

## Авторинг (sovereign: прозу пишет агент автора, движок детерминирован)

- **Новый курс:** `scripts/course-plan-prompt.ts "<идея>" ru --domain <url>` →
  outline.json своим агентом → `scripts/scaffold-course.ts --outline …` (no-clobber) →
  pack по `LMS/_template/CHECKLIST.md` → registry.json → matrix в deploy.yml.
  SOP: `LMS/_template/AUTHORING.md`.
- **Гостевой мастер = МОДУЛЬ внутри существующего курса**, в рамках его манифеста:
  `module-plan-prompt` → outline.json → `author-module` (скаффолд + штамп `_module.json`)
  → research/draft/review CLI → PR; мерджит владелец после зелёного CI.
  SOP: `LMS/_template/AUTHORING-MODULE.md`.

## Путевой роутинг и склейка домена

Курс может жить не в корне домена, а в подпути школы: `COURSE_BASE_PATH=/praktika`
проставляет префикс ссылкам, ассетам и PWA-манифесту, а сервис-воркеру — postbuild-шаг
`scripts/stamp-sw.mjs` (он статический файл, `basePath` его не трогает). Вызовы `/api/*`
остаются в корне домена: platform-API один на все курсы.

`scripts/merge-course.mjs <pack> <sub-path>` вкладывает экспорт курса в экспорт оболочки
(паттерн блог→хаб). ⚠ При `basePath` Next кладёт страницы в КОРЕНЬ `out/`, а префикс
ставит только в ссылках — поэтому каталог целиком садится в подпуть. EN-локаль курса
живёт ВНУТРИ его подпути (`/praktika/en/`), у курса своя маршрутизация.

## CI (`.github/workflows/deploy.yml`)

push в main → deploy-web (ТС) · deploy-academy (оболочка + курс + склейка) ·
deploy-workers + **build-packs** — матрица остальных pack'ов (build+vitest под их
`COURSE_PACK`) с кросс-проверкой изоляции бренда. Апгрейд движка пересобирает все курсы.
Новый pack = slug в matrix. Секрет: `CLOUDFLARE_API_TOKEN`.

## Локальная проверка

```bash
cd LMS/tochka-sborki/web
npm test                                      # активный pack (дефолт tochka-sborki)
COURSE_PACK=living-practice npm test          # любой другой pack
COURSE_PACK=living-practice npm run build

# ⚠ Только через npm: pretest/prebuild материализуют packs/_active.
# ⚠ Это про WEB. У workers/ своего pretest НЕТ, и материализация паков там не помогает:
#   `@pack/*` — голый спецификатор, его резолвит АЛИАС в workers/vitest.config.ts, а не
#   наличие файлов. Без алиаса intake.test.ts падает на импорте даже при живом _active
#   (проверено 2026-09-04). Алиас опирается на packs/_active — гитигнорируемый симлинк,
#   которого нет в свежем клоне и в git-worktree; там сперва собрать web или создать ссылку.
# Голый `npx vitest run` возьмёт тот pack, что лежит в _active с прошлого раза —
# гвард pack-resolution об этом скажет, но лучше не наступать.
# ⚠ Windows/git-bash: COURSE_BASE_PATH=/praktika превращается в C:/Program Files/...
# (MSYS переписывает путь) — префиксные сборки гонять из PowerShell.
```
