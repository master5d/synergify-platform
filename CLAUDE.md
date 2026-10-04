# CLAUDE.md — lms-engine (synergify-platform)

> Перенесено 2026-10-04 из `mc_hub/CLAUDE.md` при переезде курса, академии и worker в этот репо (2026-08-06).
> Разделы ниже — как были в mc_hub, без переписывания: пути `LMS/…`, `workers/…`, `academy/…` теперь
> относительно корня ЭТОГО репо. Это снимок знаний на момент переезда — при расхождении с кодом прав код;
> найденный дрейф правь здесь. Обзор репо — `README.md`, устройство и контракт pack'а — `docs/README-internal.md`,
> задачи — `BACKLOG.md`.

## Проект
Точка Сборки — открытый курс по agentic AI в потоке. **Agent-agnostic**: концепции работают с Claude Code, Hermes (SOVERN), Aider, Cline, и др. 10 модулей (ядро 00-08 + опциональный 09-ai-notebook) + упражнения + шпаргалка. **Bilingual**: RU (основной) + EN (`/en/` маршруты). Refactor 2026-05-18: добавлен модуль 03-stack-selection (Behind-GFW + Sovereign), модули 03→04 ... 07→08.

## Стек

### Контент (Markdown)
- Markdown (весь контент курса)
- Marp (конвертация .md → слайды HTML/PDF/PPTX)
- Firecrawl (веб-скрапинг в Meeting 5)

### Web / LMS (папка `LMS/tochka-sborki/web/`)
- Next.js 16 App Router, `output: 'export'` (статичный сайт), `trailingSlash: true`
- MDX (`next-mdx-remote`) — контент из `content/{ru,en}/**`
- Локализация: `lib/dictionaries.ts` (RU+EN), компоненты принимают `locale`
- CSS Custom Properties + Tailwind 4 — light/dark темы через `data-theme` (`light`/`dark`), дефолт = система (prefers-color-scheme), выбор в nav (`lib/theme-pref.ts` + `ThemeProvider` + 3-сегментный `ThemeToggle`); FOUC-guard inline-скрипт в `layout`
- Cloudflare Pages хостинг + CF Worker для API (`workers/`)
- GitHub Actions — CI/CD (`.github/workflows/deploy.yml`)
- Vitest — тесты (`lib/content.test.ts`)

### Backend (`workers/`)
- CF Worker на `ai.synergify.com/api/*`. Эндпоинты: auth (magic-link через Resend),
  progress (D1 SQLite), feedback, leads CRM.
- **CRM pipeline** (с 2026-06-15, заменил Notion+n8n): источник правды лидов — D1 `users`
  (email, created_at, language, source, telegram_handle), пишется на signup в `auth.ts`.
  Новый юзер → `ctx.waitUntil(addResendContact())` (`lib/crm.ts`) пушит **глобальный
  Resend-контакт** (`POST /contacts`; Audiences у Resend deprecated → Segments, контакты
  глобальные — `RESEND_AUDIENCE_ID` НЕ нужен, активно при наличии `RESEND_API_KEY`). Витрина —
  owner-gated `/admin/leads` (таблица + CSV + кнопка backfill `POST /api/admin/leads/sync-resend`).
  n8n `mds-crm` и Notion CRM выведены (секреты `N8N_CRM_*` удалены 2026-06-16).
- **Owner learner-stats** (split от fb_fb9fc1f8): `GET /api/admin/stats` (`handlers/stats.ts`, `requireOwner`, 3 D1-COUNT)
  → `{total, learners=COUNT(DISTINCT user_id) progress, intakeCompleted=COUNT(*) intake_profiles WHERE status='completed'}`
  → stat-strip на `/admin/leads` (`leads-client.tsx`, graceful-hide). Honest reporting, НЕ публично, БЕЗ нон-профит-копи.
- **Welcome email** (LIVE с 2026-06-22): новый юзер в `handleSendLink` получает ДВА письма — транзакционный
  magic-link (без изменений, лучшая доставляемость) + welcome (`lib/welcome-email.ts buildWelcomeEmail`/
  `sendWelcomeEmail`, bilingual, best-effort `ctx.waitUntil`, никогда не роняет signup). Идемпотентно через
  `isNewUser`/`newLead` (existing-юзер → только magic-link), без новой колонки. Копия = course-data в билдере
  (де-хастленный Cabral; founder-нота → меню → ОДИН CTA intake → cheatsheet → anti-fluff). `List-Unsubscribe:
  <mailto:OWNER_EMAIL>` (нативная кнопка Gmail/Apple Mail; полный suppression-роут отложен до рекуррентных кампаний).
- D1 база `tochka-sborki-db`; секреты через `wrangler secret put` (не в коде). Миграции **0001–0011** применены
  (0008 telegram_id, 0009 nudge cols, 0010 questions, 0011 purchases); additive-миграции прода накатываются через
  Cloudflare-api MCP `/query` (zero-token), НЕ `wrangler migrations apply`.
- **Telegram** (Mini App Phase 0 + companion bot Phase 1, оба LIVE; бот **@tochka_sborki_lms_bot**):
  - `POST /api/auth/telegram` — auth-мост: верифицирует подписанный `initData` (HMAC, `lib/telegram-initdata.ts`)
    → выдаёт тот же `session` JWT-cookie; hybrid identity (telegram_id → handle → native synthetic email). Web:
    `<TelegramAuthBridge>` авто-логинит когда LMS открыт как Telegram WebApp.
  - `POST /api/telegram/webhook` — бот (raw, без grammY; secret-token verify). Команды `/start` `/continue`
    (advisory drip — следующий незавершённый модуль из `lib/course-order.ts`) `/stop` `/ask` `/support`. `/ask` →
    лид в `questions` + owner-email (`lib/owner-notify.ts`) + handoff. Bilingual copy в `lib/bot-copy.ts`.
  - **`scheduled()` cron `0 16 * * *`** → `runDailyNudge` (`handlers/nudge-cron.ts`): один daily nudge по
    guard-chain `lib/nudge-policy.ts` (optout/throttle 20h/active/lapse 14d; reuse паттерна wellbeing select-nudge).
  - Go-live скрипты: `workers/scripts/telegram-go-live.ps1` (token + menu button + `-RegisterWebhook`).
  - Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`. Спека: `docs/superpowers/specs/2026-06-22-telegram-*`.
- **Stripe checkout** (engine; курсы всегда БЕСПЛАТНЫ — checkout только для support/tips + digital goods + physical
  later). **Framing = «поддержка/покупка у автора (ИП)», НЕ «нонпрофит/tax-deductible»** (нон-профит не
  зарегистрирован; до `fb_3dc7f76f5f4e`). Stripe-hosted Checkout Sessions (no PCI). Secrets `STRIPE_SECRET_KEY`
  (sandbox-LIVE; прод = restricted `rk_live` scope Checkout-Sessions-Write + новый аккаунт, НЕ Luma-managed) +
  `STRIPE_WEBHOOK_SECRET`. Скрипт `workers/scripts/stripe-set-key.ps1`.
  - **Slice 1 (support/PWYW)**: `POST /api/checkout/support` (`handlers/checkout.ts`), amount server-side $1–$1000
    (`lib/checkout.ts`), `submit_type=donate`. Web `/support` (пресеты $3/$7/$15 + custom) + бот `/support`.
  - **Slice 2 (digital goods, SHIPPED dark 2026-06-22)**: статичный каталог `lib/products.ts` (`PRODUCTS=[]` пока →
    фича тёмная; web-зеркало `lib/store/products.data.ts`, держать в синхроне). `POST /api/checkout/product` —
    цена из каталога (НЕ от клиента), `submit_type=pay`, `metadata[product_id/locale]`. `POST /api/stripe/webhook`
    (`handlers/stripe-webhook.ts`) — `Stripe-Signature` HMAC-verify (`lib/stripe-webhook.ts`, WebCrypto, 300s replay),
    идемпотентность `purchases.stripe_session_id UNIQUE` + `meta.changes`, доставка asset-ссылки письмом
    (`lib/purchase-email.ts`, Resend best-effort, `delivered_at` = retry-маркер). **Магазин переехал на `mamaev.coach` (2026-08-02)**: страницы в `hub/`, из LMS и nav убраны;
    у product-чекаута свой `STORE_BASE`, support остался на курсе. Доставка: `delivery {kind:'url'}` реализована; `{kind:'r2'}` (presigned) отложена в свой слайс.
    Go-live (owner): добавить товары в ОБА products-файла + зарегистрировать webhook-эндпоинт + set `STRIPE_WEBHOOK_SECRET`.

## RPG / геймификация (LMS/tochka-sborki/web/)
Поверх LMS построен RPG-слой. Все статичные данные — клиентские (localStorage); сервер хранит только intake-профиль и прогресс уроков.
- **Intake** (`/quest-intake`, `lib/intake/`): опросник → профиль `{ niche, cog_tier, world_skin, F3-outcome }` в D1 `intake_profiles`. `scoring.ts`, `attributes.ts`, `parse-outcome.ts`. V2-инструмент (`questions.v2.ts`+`scoring-v2.ts`) — короткие evocative вопросы (фидбэк по старым вопросам часто устарел); V_HOOK/V_MODE — multi-select (`num()` берёт max по массиву); на `charter-reveal` — кнопка self-profile (`self-profile-prompt.ts`). Онбординг-мост (intake→quest-log) разоружает RPG-жаргон для нонгеймеров (`onboarding-bridge`).
- **Квест-лог** (`/dashboard`): QuestFeed, CharacterStrip, Daily, Dungeon, Vault. **Профиль** (`/character`, таб в nav): лист героя + **World Map** (зоны = модули; перенесён сюда с dashboard; **«Вы тут / You are here» локатор** = ✦-маркер на текущем узле + bilingual caption под картой, `lib/rpg/locator.ts buildLocator`) + карточка companion-charter (`profileToCharter` пересобирает устав из профиля). `lib/rpg/` — `quest-log.ts`, `map-layout.ts`, `locator.ts`, `niche-map.ts`, `unit-framing.ts`, `transformations.ts` (micro from→to per-модуль, `<title>`), `macro-phases.ts` (3 макро-фазы → `transformation-arc.tsx` над картой). Карточный стек `/character`: **Learning Plan** (`buildLearningPlan`+`LearningPlanCard`, DIY copy-out) + **Charter** + **Companion Setup** + **Office-hours AMA bridge** (`components/office-hours-card.tsx` ← engine `lib/course/office-hours.ts`: free групповой AMA — CTA тёмный пока `amaRegisterUrl` пуст; 1:1 линк-аут на `mentor.mamaev.coach`; fb_57c6302d436f). **Ecosystem-диаграмма** (`lib/course/ecosystem.ts` Learn/Connect/Prove + Connect-узлы AMA `planned`/1:1 `live`).
- **Themed skins**: `lib/rpg/skins/*.json` (7 скинов) + `skins-meta.ts` — переосмысление формулировок юнитов под выбранный мир.
- **Cognitive Shards (CS)** — единая валюта вместо XP. 3 режима прохождения (commander 1.0× / copilot 1.5× / archmage 2.5×). `lib/cs/`: `wallet.ts`, `award.ts`, `modes.ts`, `applied-challenge.ts` (персонализация под niche/outcome).
- **Daily Quests** (`lib/quests/`) и **Niche Dungeons** (`/dungeon`, `lib/dungeon/`) — детерминированная генерация (FNV-1a seed + mulberry32).
- **Help-система** (`lib/help/`, `components/help/`): `<HelpTip>` (tap-popover) + `<IntroCard>` (авто-онбординг). Маркер «💭 в уме» на reflection-фазах.
- **Bisociation**: фазы `activation`/`reflection` урока — бисоциативные провокации (мысленные, без полей ввода). Drift-guard тест `lib/content/reflection-prompts.test.ts` запрещает «вводные» глаголы в этих блоках.
- **Pacing & Wellbeing (SP4)** (`lib/pacing/`, `lib/wellbeing/`, `components/wellbeing/`): `pacing`-store логирует таймстемпы завершений + режимы + калибровки. `<WellbeingPanel>` на dashboard показывает ОДИН мягкий dismissible-nudge по приоритету (re-engage на якоре G11 > anxiety check-in > rest-day > post-Boss калибровка). Калибровка → suggest-only бейдж режима в `ModeSelector`. Всё клиентское. **Dopamine-break interstitial** (`lib/breaks/`): pure `shouldBreak(ctx)` 5-gate decider (availableCount/MIN_STEP/cooldown/cap/restMode) + `BreakInterstitial` overlay на `unit-wizard handleNext` (hold-step→advance-on-continue, restMode reuse pacing-derive); тёмный пока `BREAKS=[]`. `BreakActivity`/`ResolvedBreak` = discriminated-union `passive|puzzle`; **интерактивная MC-puzzle ветка** оверлея (pick→lock→✓/✗+reveal→Continue, без score/streak/shaming; fb_282cf1c678f7) поверх того же триггера (fb_a03db93a5bbe).
- **localStorage-ключи** (изолированы): `cs_wallet`, `unit_progress`, `daily_quests`, `niche_dungeon`, `help_seen`, `pacing`, `os`, `theme-pref`, `stack`, `lang-preference`, `pwa_install_dismissed`, `lwai_dock_dismissed`.

## Платформа / scaffold + learn-with-AI (LMS/tochka-sborki/web/)
Карта фич платформы с путями и статусами эпиков — `docs/features.md` (перенесено дословно 2026-10-04).
Здесь — только перечень, чтобы не изобретать существующее, и инварианты, которые ломают сборку или изоляцию:
- LMS-scaffold
- Course-authoring engine
- Clarity-first guardrail
- Лендинг-витрина
- learn-with-AI
- PWA
- SEO bilingual
- A11y baseline
- Lite-mode / low-bandwidth
- Captions/transcripts
- Learn-mode walkthrough embed
- Сертификат
- S.A.S.H.A academy-слой
- Sovereign prompt-emitter семья
- ИГИ ритуал
- matching = ЯДРО SHIPPED
- group-mentor SHIPPED
- acceleration SHIPPED
- Dormant far-pillar: только Web3/DAO fb_029568. Детали → [[…
- Auth = провайдер-агностичный session-слой
- Speech-курс = ОТДЕЛЬНЫЙ изолированный курс
- Скорочтение = ОТДЕЛЬНЫЙ изолированный hybrid-эпик COMPLETE (S1-S5)
- `/exercises` опц. треки

**Инварианты (полный текст — в карте):**
- Speech-курс и Скорочтение — ОТДЕЛЬНЫЕ изолированные курсы под `lib/speech/`, `lib/speedreading/` (НЕ `content/`: засорит scanner/RPG/`MODULE_SLUGS`).
- Metadata-routes (`app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`) требуют `export const dynamic = 'force-static'` — иначе static export падает.
- Authoring и prompt-emitter семья — sovereign: ноль LLM-клиентов/ключей/deps в репо, прозу пишет агент автора.
- `resolveCaptionTrack` ставит `<track kind="captions">` ТОЛЬКО на self-hosted `<video>`, не на cross-origin embed.
- Auth: все провайдеры (magic-link, Telegram, Google OAuth) минтят ОДИН `session` JWT-cookie; `requireAuth`/`requireOwner` читают только его.
- `LMS/registry.json` — единственный источник identity курсов (registry-SoT); `lib/course.ts` `COURSE` — единый источник бренда/домена, не хардкод.

## Шапка курса и гварды контента (сессия 2026-08-03/04)

- **Шапка переполняться не должна.** Правила макета — БАЗОВЫЕ, вне медиазапросов:
  полоса `.nav-secondary-links` тянется/сжимается (`min-width:0`) и прокручивается
  сама, бренд и служебные элементы `flex: 0 0 auto`. Дважды чинили брейкпоинтом —
  и дважды следующая ширина оказывалась непокрытой. Гвард `nav-layout.test.ts`.
- **Переключатели свёрнуты в кнопку ⚙** (`components/settings-menu.tsx`): тема,
  режим подачи, экономия трафика, ОС. Служебная часть 460 → 131px (191px у вошедшего).
  Снаружи только язык и вход — это навигация. Гвард `settings-menu.test.ts` следит,
  чтобы ни один переключатель не потерялся и не отвалилась доступность.
- **Email в шапке — часть до @**, полный в `title`: полный адрес занимал 158px и
  выдавливал «Сертификат» за край.
- **`.skip-link:focus` — `position: static`** (в потоке): всплывая поверх, ссылка
  закрывала логотип и первые пункты, то есть ту навигацию, мимо которой предлагает
  перепрыгнуть.
- **Страницы уроков генерируются из `_meta.json`**, а контент-гварды ходят по файлам.
  Между списками нет ничего, кроме `registry-integrity.test.ts`: без него .mdx без
  записи в `_meta` исчезает из навигации, sitemap и сборки при 895 зелёных тестах
  (проверено экспериментом). Пропажа локали тоже молчала — гварды параметризованы
  по НАЙДЕННЫМ файлам, и вместе с файлом исчезают его проверки.
- **Ссылки на уроки держит `links-integrity.test.ts`**: существование модуля/юнита,
  локаль ссылки (из `/en/` нельзя вести в русскую версию), файлы материалов в `public/`.
  Он и нашёл дорожную карту со старой нумерацией модулей.
- **`/try` — открытая страница для нерешившихся** (`lib/course/try-chains.ts`):
  шесть цепочек по 3-4 шага. Инвариант, который стерегут тесты: у цепочек с
  `touchesFiles` первый шаг ЯВНО запрещает агенту менять файлы, а переписывающие
  оставляют путь назад (журнал отката или копии). Доступ без почты — тест ловит
  появление обмена «оставь email».
- **Блок «Для кого» — стадии пути** (читает / понимает зачем но не знает как /
  упёрся в доступ / строит и ищет равных), НЕ мотивы. Чужие проценты туда не
  переносить — гвард в `dictionaries.test.ts`.

## Гварды контента после семантического аудита (2026-10-04)

Отчёт — `docs/superpowers/research/2026-10-04-ts-semantic-audit.md` (7 аудиторов, 8 осей, пакеты P1–P9 на Codex).
Что теперь стережёт регресс (все в `lib/content/`, все `describe.runIf(PACK_SLUG === 'tochka-sborki')` там, где
артефакт есть только у Точки Сборки):
- **`mdx-compile.test.ts`** — каждый `.mdx` pack'а компилируется `@mdx-js/mdx`; `<OsBlock os>` только `mac|windows`.
  Повод: 3587 зелёных текстовых тестов пропустили `<OsBlock>` внутри незакрытого ```-блока — упал `next build`.
- **`roadmap-integrity.test.ts`** — `roadmap.mdx` ↔ `_meta.json`: длительности, названия юнитов, ссылки на уроки и
  файлы результатов, счёт модулей/уроков. Roadmap пишется руками, но дрейф от `_meta` — красный тест.
- **`cheatsheet-cli.test.ts`** — флаги `claude …` в шпаргалке существуют в снимке `lib/content/fixtures/claude-help-<версия>.txt`;
  шапка шпаргалки несёт «проверено на версии». Новая версия CLI = новый снимок + строка в шапке.
- **`phase-image.test.ts`** — фазы activation/reflection без таблиц, длинных списков и кода; правило курса «один образ
  на юнит» (решение владельца 2026-10-04): reflection возвращает образ activation, концепт живёт в concept.
- **`glossary.test.ts`** + `packs/tochka-sborki/glossary.ts` — канон терминов (агент / AI-клон, pipeline, Hook, Skill, AI,
  юнит, модуль, субагент, промпт, шлюз к моделям, vibe coding); запрещённые варианты и allow по контексту.
- Правила без теста: RU и EN правятся одним коммитом (EN — построчное зеркало); контент-пакеты делегатов принимать
  только после `gen-lesson-views` + полного vitest + `tsc` под ОБА pack'а (`COURSE_PACK=living-practice npx tsc --noEmit`);
  при ревизии стека лаборатории (NAUTILUS `docs/history/stack.md`) — grep курса по снятым продуктам и узлам: курс
  описывает только то, что реально работает у автора, с датой.

## Gemini-Notebook слой (2026-08-04, спек `2026-08-04-notebook-module-design`)
- **`/notebook`** (и `/en/notebook`, открыто, без почты) — «пакет тетрадки»: `lib/course/notebook-pack.ts` (паттерн `/try`: engine+data, `Bi{ru;en}` и resolvers) — 3 пака источников, PROMPT_KIT (каждый промпт ТРЕБУЕТ цитату — под тестом), VERIFY_CHECKLIST «где тетрадка врёт». В nav НЕ добавлен (шапка ужата); входы — модуль 09 и sitemap.
- **Модуль `09-ai-notebook`** — 5 юнитов, инверсия fast.ai (intake #102): u1 = рабочая тетрадка за 15 минут ДО теории; agent-agnostic (Gemini Notebook как референс, в каждом юните путь «если тетрадки нет»). **Опциональный**: НЕ в `workers/src/lib/course-catalog.ts` (admission-гейт академии не ужесточён) и НЕ в ядре прогрессии.
- **`OPTIONAL_MODULE_SLUGS`** (`lib/rpg/modules.ts`) — канон опциональности: ядро `MODULE_SLUGS` (00-08) несёт quest-lines/macro-phases/quest-log/admission; опциональные модули живут в контенте/скинах/World Map/transformations через тип `CourseModuleSlug`. Новый опциональный модуль = запись в канон, content ×2 локали, framing в 7 скин-паках, transformations. Тестовые списки ВЫВОДИТЬ из канона, не копировать локально.
- ⚠ Гоча: stale `npx serve` на `web/out` держит каталог — `next build` падает EBUSY на rmdir; лечение — найти и убить процесс (Get-CimInstance Win32_Process), не чистить каталог.
