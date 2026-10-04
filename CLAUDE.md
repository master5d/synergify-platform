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
- **LMS-scaffold** (задел на будущие курсы): `lib/course.ts` (`COURSE = {name, fullName, domain, locales, publisher}` — единый источник бренда/домена для sitemap/robots/manifest, не хардкод). `lib/materials.ts` — декларативный манифест `MaterialGroup[]` (templates/links/tools). `/syllabus` (RU+EN, nav «Программа») = generic `syllabus-tree.tsx` (дерево модуль→юнит из `getAllModules`) + `materials-section.tsx`. Шаблоны для скачивания — `public/materials/`. Принцип: движок читает данные курса. Future: course-data слой для RPG/intake, `LMS/_template/` boilerplate.
- **Course-authoring engine** (`lib/authoring/` + `LMS/_template/AUTHORING.md`, эпик fb_8e8eaf0acfdb, S1-S5): AI-assisted но **sovereign/prompt-emitter** (0 LLM-клиентов/ключей/deps — prose-стадии гоняет агент ЮЗЕРА, как learn-with-AI). Детерминированная спина: `outline.ts` (contract+`validateOutline`) → `dehustle.ts` (executable de-hustle lint EN+RU banned-list: strip profit/scarcity/avatar) → `scaffold.ts` (pure `scaffoldCourse`→4-Phase MDX skeleton). Prose = emit+parse: `research.ts` (`buildResearchPrompt`+`parseResearchNotes`) → `draft.ts` (детерминированный `draftLesson` ткёт notes в 4-Phase + `validateDraftMdx`) → `review.ts` (`lintReadability` <25слов/no-write/vague-practice, per-prose-line + `buildPolishPrompt`) → `orchestrate.ts` (`runAuthoringPass` per-unit needs-research/ready/needs-polish). 5 CLI (`scaffold-course`/`research-prompt`/`draft-lesson`/`review-lesson`/`author-course`, `npx tsx`), **report-only / no-clobber** (движок НЕ пишет уроки — автор размещает финальный MDX сам). de-hustle+no-write+readability гейты текут сквозь весь pass. SOP = `AUTHORING.md`. `lib/authoring/*` НЕ импортится приложением; tsc-гейт обязателен (vitest/next-build не тайпчекают эти файлы).
- **Clarity-first guardrail** (fb_a1a446f5, контр-сигнал реального ICP к методологии fb_80ebb140): baseline-ясность первична для ВСЕХ сегментов; профилирование-по-стилю/скины/интейк-подстройка — слой ПОВЕРХ, никогда не замена. Enforce: plain-mode (`lib/rpg-mode.ts`), `lintReadability`, clarity-строка в `buildPolishPrompt`.
- **Лендинг-витрина** (LMS home-page, `lib/course/showcase.ts` + `components/showcase-gallery.tsx`): секция «Возможности» с **видео-фасадом** (`showcase-video.tsx` `'use client'` — click-to-play, НЕ грузит iframe/`<video>` до клика; `resolveVideoSource` mp4/webm→file vs YT/Vimeo→embed, `withAutoplay`; `VIDEO.url`+`poster` = `null` плейсхолдер пока контента нет) + **две секции кейсов**: «Реальные истории» (`REAL_CASES` — proof-карточки с result-строкой + автором + locale-aware `deepDive`-slug→блог-разбор (`deepDiveUrl(slug,locale)` в showcase.ts; **4 deep-dive поста SHIPPED** в blog: echo/diagram-canvas/the-site-itself/second-brain, cross-app slug-контракт guard с обоих концов; fb_83d05aa7ee6f); засеяны 4 своими проектами; рендерится ТОЛЬКО при `cases.length>0`, выше мечт) над «О чём можно мечтать» (`DREAM_CASES` аспирационные). Authenticity: result-копи качественное, без выдуманных метрик (fb_2fbf86ac3c67). **Категории кейсов** (`CategoryKey`/`CATEGORIES` → авто-табы из used keys): co-thinking/launch/flow/knowledge/dictation/platform + **`for-good`** («Во благо», 4 dream-кейса eco/rescue/pattern-shield/safe-path для conscious-ЦА, fb_650d16d2 — «доска позора» ОТВЕРГНУТА, pattern-shield = само-распознавание). **Вся showcase-копи (dream+real, обе локали) под `lintDehustle []`-тестом.** **AI-doubles band** (`lib/course/ai-doubles.ts` + `ai-doubles-band.tsx`): 5 «AI-двойников по домену» (mirror lesson `u3-clones`) framing-полоса НАД кейсами (промис→доказательство, НЕ второй фильтр); без vanity-метрик (authenticity-guard тест лочит metrics-free; `saves N ч/день` из урока выкинуты); fb_42e4a1668f80.
- **learn-with-AI** (handoff во внешний ИИ ученика, без ключей/OAuth): session-слой = `LearnWithAI` секция + `LearnWithAIDock` (per-unit, `buildLearnPrompt`/`buildBootstrapDeepLink`); memory-слой = `CompanionSetup` на `/character` (`buildCompanionRolePrompt` + `AGENT_MEMORY` — стоячая роль в память агента). ChatGPT/Claude несут `?q=` deep-link, Gemini/Copilot — copy. Голос ментора = SoT `lib/mentor-persona.ts` («тёплый-но-твёрдый», anti-sycophancy): `mentorFirmness` + **`mentorStateAdaptation`** (3 T's Tone/Tempo/Take-a-breath + 4 challenging-learner архетипа Over-eager/Cynical/Disengaged/Quiet, reframed live-room→1:1; cynical→evidence не persuasion, disengaged→smaller-step не guilt) — threaded в ОБА full-билдера, binding drift-guard что текст течёт без дрейфа между поверхностями; fb_c3471241279e.
- **PWA**: installable (`app/manifest.ts` + `public/icon-*.png` ← `scripts/gen-pwa-icons.mjs` sharp + `public/sw.js` network-first). `InstallPrompt` (iOS-хинт vs beforeinstallprompt-pill), `PwaRegister` в layout. `lib/pwa.ts` SSR-safe.
- **SEO bilingual**: hreflang ru/en/x-default через `app/sitemap.ts` (+pure `lib/sitemap.ts`), `app/robots.ts`, pre-paint lang-скрипт (`<html lang>` по локали), `metadataBase`. ⚠ Metadata-routes требуют `export const dynamic = 'force-static'` под `output: export`. ⚠ НЕ ставить `alternates.canonical` в root-layout metadata — протечёт на все страницы.
- **A11y baseline** (`lib/a11y/`, `app/globals.css`): keyboard-foundations — глобальный `:focus-visible` outline (keyboard-only, не `:focus`) + `prefers-reduced-motion` guard + skip-to-content (`SkipLink` первым в `Nav` через fragment → `#main-content` на 6 core-shells mdx/module/unit/home/certificate/lesson-layout; fb_a2c667a36a64). **Contrast drift-guard** `lib/a11y/contrast.test.ts` (pure `contrastRatio` util) парсит `model-kit.css` оба `[data-theme]` блока → asserts WCAG-AA ≥4.5 на 12 token-парах; правка-токена-ниже-AA ломает CI (light `--text-accent` #0077cc→#0070c0; fb_8cac8d78f49c). ⚠ **4 копии** `model-kit.css` (blog/hub/LMS/mentor) — фикс токена в одной НЕ пропагирует.
- **Lite-mode / low-bandwidth** (`lib/lite-pref.ts` + `LiteProvider`/`useLite()` + `data-lite` FOUC head-script + `lite-toggle` в nav — зеркало theme-pref): pref `on/off/auto`, **default auto** = `navigator.connection` saveData/2g; `[data-lite="on"]` motion-drop (CSS) + `Walkthrough` client click-to-load facade (4MB iframe отложен). ⚠ Контракт (key/`data-lite`-значения/detect/default) ОБЯЗАН совпадать в lib `resolveLite` ↔ inline head-script ↔ provider, иначе pre-paint CSS разойдётся с React-state; mount-effect само-ре-синкает `data-lite` (fb_731d3ee7f748). Defer: broad-ARIA.
- **Captions/transcripts** (`lib/a11y/media.ts` + `components/media-transcript.tsx`, fb_9563271d9ca6): owner-media-gated тёмный движок. `resolveCaptionTrack` — `<track kind="captions">` ТОЛЬКО на self-hosted `<video>` (cross-origin YT/Vimeo embed = платформенные субтитры, VTT инжектить нельзя); `resolveTranscript` → universal `<details>` disclosure (equity: читать вместо стрима, работает и для embed). Wired в `ShowcaseVideo` (track+transcript) + `VideoCheckpoint` (transcript); default `null` → нулевой визуальный сдвиг пока owner не даст .vtt/транскрипт. ⚠ type-ошибка в `*.test.ts` НЕ роняет vitest(esbuild)/next-build → tsc-гейт ловит (поймал pre-existing в breaks/data.test).
- **Learn-mode walkthrough embed** (`components/walkthrough.tsx` + `public/walkthroughs/<slug>.html` + MDX `<Walkthrough slug title minHeight>`): self-contained step-through HTML экспортируется вручную из [[sovern-mindmap]] (Export Learn HTML) → статик-хостинг + sandboxed iframe (`sandbox="allow-scripts"`, НЕ cross-import app-исходники → relative/alias tsc-trap); lite-aware facade. Первый embed = Module 06 unit 2 (RU+EN); диаграмма ~5 узлов (cumulative inline-SVG тяжёлый ~4MB; 13 узлов≈22MB); fb_54dd5739f9ce.
- **Сертификат** (`/certificate`, `components/certificate-svg.tsx` ← engine+data `lib/course/certificate.ts` `resolveCertificate`+`CERT_PALETTE`): «золотой билет» gold-on-dark; **admission настоящий** — страница fire-and-forget POST `/api/academy/admission` (S4), билет рендерится идентично при fail/401 (fb_6ded7b0b7980); publisher теперь single-source из `REGISTRY.academy.org.name` («Synergify Institute for AI», Slice A fb_7f1d36587e18 — переименовано + вынесено в academy-org-config `registry.json`, все 4 потребителя читают registry, wrapper-проза locale-specific на месте; sole-prop, БЕЗ non-profit-формулировок).
- **S.A.S.H.A academy-слой** (umbrella-эпик fb_fcf7617373f4, S1-S5 SHIPPED): академия над мульти-курсовым движком, **registry-SoT-паттерн** — `LMS/registry.json` единственный источник identity, читается всеми поверхностями. **S1** `lib/academy/registry.ts` (`REGISTRY`/`validateRegistry`/`resolveCourses` + COURSE↔registry drift-guard; JSON-импорт из-за границы аппа требует `turbopack.root` пин). **S2** dark-ship UI: `CourseSwitcher` (footer, null пока <2 live-курсов) + `CourseCatalog` (unwired до лендинга). **S3** лендинг — теперь `academy.synergify.com` (апп `academy/`, вынесен из hub при domain split 2026-07-30; исторически hub `lib/academy.ts` fs-bridge читает registry как blog-manifest; CSS-starfield hero; `scripts/academy-manifesto-prompt.mjs` sovereign prompt-emitter под owner-манифест). **S4** admission: D1 migration 0014 (additive: `admissions` + `course`-колонки, применять ЧЕРЕЗ cloudflare-api MCP `/query` ДО push), `/api/academy/admission` (server-verified — прогресс покрывает все 9 модулей `COURSE_CATALOG`, без request-body) + `/api/academy/me`; progress API принял опц. `course` (default `tochka-sborki`). **S5** `lib/academy/companion.ts` `academyCompanionLayer` (registry-driven, в 4 ветки companion-промпта) + synergems academy-reframe. Новый курс = запись в registry.json (drift-guard тест ловит рассинхрон с `COURSE`).
- **Sovereign prompt-emitter семья** (build-time, ноль live-LLM — печатают промпт для агента ВЛАДЕЛЬЦА, он пишет копи своим голосом; каждый читает `LMS/registry.json` + свой JSON-SoT, de-hustle drift-guard переиспользует `lib/authoring/dehustle.ts` `lintDehustle`): `scripts/academy-manifesto-prompt.mjs` (S3, academy-манифест) · `scripts/diyu-manifesto-prompt.mjs` (`LMS/diyu-thesis.json`, DIYU-for-AI-age фрейминг с Kamenetz-атрибуцией, fb_43a821d71a64) · `scripts/why-free-prompt.mjs` (`LMS/why-free-frame.json`, «ключ №4» почему-бесплатно = peer-network/commons, plain-mode, fb_dd3528) · `scripts/hero-copy-prompt.mjs` (`LMS/hero-frame.json`, hero-header синтез из 3 рамок chat-vs-system/dream-together/what-changes + слой из 3 objection→reframe, fb_3c88df79 — первый в семье с `label` на рамках + objection-слоем). JSON-SoT'ы рядом с registry.json, никакой app-код их НЕ импортит → ноль build-impact.
- **ИГИ ритуал** (`lib/igi.ts` engine+data `IGI`+`resolveIgi` зеркало certificate → `components/igi-ritual.tsx` facilitator-guide карта, вшита в `alumni-client.tsx`/`/alumni`; fb_c5d771): self-contained групповой insight-ритуал синергемы (6 карт-категорий Вопрос/Обучение/Знание/Умвельт/Доверие/Мнение + 4 шага + генеративное Q&U-правило, bilingual, contemplative, de-hustle-guarded). Прогоняется вручную с кластером — БЕЗ backend. Синергема-эпик: vocab «синергема» не «alumni». Столбы на `/alumni` (все self-contained, sovereign — dormant infra не блокирует):
- **matching = ЯДРО SHIPPED** (fb_bfbdbcf0): `lib/effort.ts` 5-key keyed-словарь (co-build/mastermind/teach-swap/clients/peer-support) + `resolveEffort`; `lib/synergem.ts clusterAlumni` кеит на **effort-intent** (не пассивный niche → niche стал вторичным тегом); worker `alumni.ts` персистит с local `EFFORT_KEYS` (monorepo-boundary); миграция `0015_alumni_effort` на прод D1 через MCP `/query`. Vocabulary-sync app⇄worker обязателен.
- **group-mentor SHIPPED** (fb_c3a3d0): `lib/synergem-mentor.ts` `buildSynergemMentorPrompt` — sovereign role-prompt (5 `GROUP_MOVES` keyed-data) что синергема вставляет в СВОЙ агент, **reuse `mentorFirmness`** (не дублировать persona); copy-карта `components/synergem-mentor.tsx` на /alumni. Live per-cluster data-анализ = deferred (нет membership/tracking-backend).
- **acceleration SHIPPED** (fb_daa79c): `lib/synergem-acceleration.ts` `resolveAcceleration` engine+keyed-data (5 стадий роста `form→rhythm→output→outward→autonomous`, `AccelStage{key;name;milestone;readiness;move}` Bi) зеркало `lib/igi.ts`; render-only карта `components/synergem-acceleration.tsx` на /alumni после mentor. Ресурсы группа находит сама (НЕ owner-dispensed, НЕ финансовые продукты); финиш = автономность (anti-dependency). **3 /alumni-артефакта читаются gather→facilitate→grow (ИГИ/mentor/acceleration).**
- Dormant far-pillar: только Web3/DAO fb_029568. Детали → [[reference_social_design_synergem]].
- **Auth = провайдер-агностичный session-слой** (worker `workers/src/`): magic-link + Telegram + **Google OAuth** (fb_25d8fa04 SHIPPED) минтят ОДИН `session` JWT-cookie; `requireAuth`/`requireOwner` читают его. OAuth зеркалит `telegram-auth.ts` (verify→link по id-колонке→session): `handlers/oauth.ts` start+callback (state-CSRF + PKCE S256 + open-redirect guard + **email_verified gate** анти-takeover), `lib/oauth-google.ts` (WebCrypto, no libs), миграция `0016` (`google_sub` partial-unique) через MCP `/query`. Dark-ship 503 до `GOOGLE_OAUTH_CLIENT_ID/_SECRET` (owner via `wrangler secret`). Добавить 4-й провайдер = зеркалить паттерн, НЕ трогать session-слой. Детали → [[reference_mc_hub_auth]]. Checkout: bot `/store` deep-link (fb_c20c437f) достроил merch-путь (зеркало `/support`); чекаут-движок был ~95% зашиплен заранее.
- **Speech-курс = ОТДЕЛЬНЫЙ изолированный курс** (fb_015e518d, эпик): S1 dark scaffold SHIPPED в `lib/speech/` + `app/speech/` (НЕ `content/` — иначе засорит AI-курс scanner/RPG/`MODULE_SLUGS`). `lib/speech/course.ts` engine+keyed-data (6 уроков + `resolveSpeechCourse`) + `/speech`+`/en/speech`. **ЗАЖЖЁН 2026-08-02:** noindex снят, 6 уроков прозы написаны (`lib/speech/lessons.ts`, ~600 слов RU / ~680 EN), страницы `[slug]` рендерит `LessonProse`. Копирайт: фундамент public-domain (Аристотель/Цицерон/Квинтилиан), из Карнеги и Леммермана НЕ взято ничего. Гвард `lessons.test.ts`: обе локали, ≥200 слов, lintDehustle, запрет приёмов давления («заставить аудиторию», manipulate the audience). Детали → [[project_mc_hub_speech_course]].
- **Скорочтение = ОТДЕЛЬНЫЙ изолированный hybrid-эпик COMPLETE (S1-S5)** (курс+интерактивные тренажёры, тот же isolation-паттерн что speech: всё под `lib/speedreading/`+`components/speedreading/`+`app/speedreading/`, вне `content/`/registry/nav, `noindex`; sovereign ноль backend/LLM/deps; вся копи `lintDehustle []`; метод public-domain — shaleny-ravlyk только структурно, ноль чужого копирайта). Паттерн каждого тренажёра: **pure-движок (юнит-тест) + localStorage-стор (зеркало `lib/pacing`) + тонкий `'use client'`**. LIVE `ai.synergify.com/speedreading/{,rsvp,schulte,test}`: **хаб** (course.ts syllabus 6 уроков + линки + `progress.ts` сводка + CS) · **rsvp** (RSVP+ORP Spritz-pivot) · **schulte** (mulberry32 grid + центр-точка) · **test** (WPM effective=raw×понимание + Δ до/после, 3 оригинальные пассажи). CS = **односторонний мост** (только `progress.ts` импортит `@/lib/cs applyCredit`; `sr:*` one-time idempotent). **ЗАЖЖЁН 2026-08-02:** noindex снят с 8 страниц, пункт «Тренажёры»/«Trainers» в nav, 4 пути в sitemap, 6 уроков прозы (`lib/speedreading/lessons.ts`, ~500 слов RU / ~580 EN). Честный потолок вшит в содержание (Rayner 2016: выше ~500-600 wpm понимание падает; «фотографическое чтение» — миф), гвард `lessons.test.ts` запрещает обещать 1000+ wpm. Хвост owner-gated: персист `firstEffectiveWpm`. Детали → [[project_mc_hub_speedreading]].
- **`/exercises` опц. треки** (content-track паттерн = append в `content/{ru,en}/exercises.mdx` intro+5 шагов+save-anchors + `lib/content/<x>-track.test.ts` presence-guard): «упакуй экспертизу» / «автоматизируй практику» / «поиск с ИИ» (research С ИИ + ВЕРИФИКАЦИЯ источников; fb_b5457149f581). De-hustle/learner-owned copy-out.

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
