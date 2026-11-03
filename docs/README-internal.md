# Внутренние заметки (бывший корневой README)

Перенесено дословно из корневого `README.md` при переводе публичной витрины на
шаблон VibeRuler (BACKLOG.md, «README репо — привести в порядок и обновить по
шаблону VibeRuler», решение владельца 2026-09-14; решения контроллера
2026-09-26 — `docs/superpowers/specs/2026-09-26-readme-showcase-design.md`).
Публичная витрина теперь в корневом `README.md`, эти заметки — устройство,
CI, гочи — остаются здесь без изменений.

---

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
- **Представления урока** (конспект / карточки / карта) — артефакты `packs/<pack>/views/{ru,en}/<module>/<unit>.json`,
  выводятся из MDX и `checks` генератором `node scripts/gen-lesson-views.ts` (детерминированно, без LLM); весь курс ТС
  и «Тишина». Пересказ конспекта — оффлайн `… <pack> --paraphrase` (гейтвей, пул `prose-pool`, `LITELLM_KEY`), гвард
  `lib/lesson-views/paraphrase.ts`. Гвард `lib/lesson-views/views.test.ts`: хэш источника свежий (правка MDX юнита
  требует перегенерации), пункты дословно из урока, пересказ без чужих чисел/имён. Вкладки на юните — `components/lesson-views.tsx`. Спека: `docs/superpowers/specs/2026-09-28-lesson-views.md`.
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

## База знаний в Notion (с 2026-11, `lib/notion-kb/`)

Третья витрина курса «Точка Сборки» (после сайта и зеркала): книга (модуль → юнит) и словарь понятий в Notion. Текст пишется
только в репо; синхронизация односторонняя, ручная правка в Notion будет перезаписана. Спека —
`docs/superpowers/specs/2026-11-01-notion-kb-design.md`, план — `docs/superpowers/plans/2026-11-01-notion-kb.md`.

- **Код:** `LMS/tochka-sborki/web/lib/notion-kb/` — `client` (Notion API, таймаут и повтор), `md` + `render-mdx` (MDX → Markdown Notion),
  `site` (`loadSiteInput`: курс → вход синхронизации), `concepts` (формы слов, первое упоминание → ссылка), `check` (проверка
  контента без сети), `manifest`/`keys` (стабильные id страниц), `sync`, `cli`, `footer-link` (ссылка в подвале сайта).
  Запуск — `node scripts/notion-kb.ts <check|sync|status|smoke>` из `LMS/tochka-sborki/web`; `npm run check:notion`,
  `notion:sync`, `notion:status`. Аргументы строгие: у команды свой список флагов (`check --out`, `sync --only`, `smoke --out`).
- **Данные pack'а:** `packs/tochka-sborki/concepts.ts` (словарь: «Коротко» — дословная цитата из юнита), `notion-kb.config.ts`
  (`servicePageId`, заголовки, ссылки автора), поле `notionKbUrl` в `course.config.ts` (ссылка в подвале; `null` — ссылки нет;
  в зеркале ссылки нет никогда: Notion закрыт для читателей зеркала).
- **Секрет:** `NOTION_KB_TOKEN` (internal integration в пространстве «RAM»; BWS → секрет Actions репо). В код, argv и логи не
  попадает; клиент маскирует токен в сообщениях об ошибках.
- **CI:** задача `deploy-notion` в `deploy.yml` (с 2026-11-02): после `npm test`, с теми же `paths`, что у сайта и зеркала, `check` перед `sync`;
  `concurrency: notion-kb` (`cancel-in-progress: false`) — два push подряд не пишут в Notion одновременно. Сайт и зеркало публикуются независимо:
  сбой Notion их не останавливает. Локальные прогоны (`smoke`, `status`, ручной `sync`) берут токен с M4 по ssh в env дочернего процесса.
- **Публикация.** Корень опубликован в вебе: `https://synergify.notion.site/40d96060a52d81f3b3fedd4be382f733` (индексация поисковиками выкл.,
  «Duplicate as template» — по умолчанию вкл.; публичная страница показывает имена авторов правок). Адрес — `notionKbUrl` у tochka-sborki;
  `scripts/check-mirror.mjs` считает нарушением любой `href` на `notion.site`/`notion.so` в сборке зеркала.
- **Сериализатор под Notion** (`md.ts`): безъязыковой забор получает язык `text` (иначе Notion читает его как javascript); имя файла с
  расширением из пересечения «файл ∩ TLD» (`md|sh|py|rs|pl|cc|so|zip|mov`) вне кода и подписей ссылок идёт inline-кодом (иначе Notion делает из
  `AGENTS.md` ссылку `http://AGENTS.md`). Ссылка на страницу `notion.so` остаётся ссылкой, но не-блочный якорь теряет.
- **Поведение при удалении.** Юнит или понятие, исчезнувшие из курса, уходят в корзину Notion (`in_trash`), а не удаляются
  насовсем; Notion хранит корзину 30 дней. Подстраницу, которую владелец руками добавил внутрь страницы, управляемой
  синхронизацией, корзина унесёт вместе с этой страницей. Пока страница жива, синхронизация останавливается на ручной
  подстранице с понятной ошибкой, а не затирает её. Не создавайте ручных подстраниц внутри базы.
- **Лимит блоков.** Если в пространстве «RAM» больше одного участника (member) любой роли, на Free-плане включается пожизненный
  лимит блоков, и запись получает 403 `restricted_resource`. В «RAM» не приглашать участников, только гостей.
- **Проверки:** `lib/notion-kb/*.test.ts` на фикстуре `FakeNotion` (без сети); `loadSiteInput` на настоящем курсе — pack-тест в `cli.test.ts`; `check` — в
  `deploy-notion`; `smoke` — только вручную против живого Notion (пробы защиты от ручных подстраниц, формы Markdown).

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
