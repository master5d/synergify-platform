# Точка Сборки — Web (LMS)

Публичный сайт открытого курса «Точка Сборки» на [ai.synergify.com](https://ai.synergify.com).
**Bilingual**: русский (`/`) + английский (`/en/`). Часть мульти-сайтового репо
(`web/` = курс, `hub/` = mamaev.coach, `mentor/` = mentor.mamaev.coach).

## Стек

| Слой | Технология |
|------|-----------|
| Framework | Next.js 16 App Router, `output: 'export'`, `trailingSlash: true` |
| Контент | MDX (`next-mdx-remote` + `gray-matter`) |
| Локализация | `lib/dictionaries.ts` (RU+EN), компоненты принимают `locale` prop |
| Стилизация | CSS Custom Properties + Tailwind 4 (`data-theme="light\|dark"`, дефолт = система) |
| Шрифты | Geist / Geist Mono / Unbounded (display) |
| Backend | CF Worker `workers/` на `ai.synergify.com/api/*` (auth, progress, feedback, CRM) |
| Хостинг | Cloudflare Pages (проект `tochka-sborki`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`, job `deploy-web`) |
| Тесты | Vitest |

## Структура

```
web/
├── app/
│   ├── layout.tsx                 — root layout, тема, LangSuggestBanner
│   ├── page.tsx                   — RU главная (HomePage locale="ru")
│   ├── en/                        — EN зеркало всех маршрутов
│   │   ├── page.tsx               — EN главная
│   │   ├── feedback/page.tsx
│   │   ├── lessons/...
│   │   ├── roadmap, cheatsheet, exercises, certificate/
│   ├── lessons/[slug]/page.tsx        — landing модуля (ModulePage)
│   ├── lessons/[slug]/[unit]/page.tsx — unit-урок (UnitPage + UnitWizard)
│   ├── quest-intake/              — RPG-онбординг: опросник → профиль (см. RPG-слой)
│   ├── dashboard/                 — квест-лог (World Map, daily quests, CS, dungeon-card)
│   ├── character/                 — лист персонажа (атрибуты из intake)
│   ├── dungeon/                   — niche dungeon (арка под нишу студента)
│   ├── roadmap, cheatsheet, exercises, feedback, certificate/
│   ├── login, onboarding, auth/verify/, admin/  — auth flow + админка
│   └── globals.css
├── components/
│   ├── nav.tsx                    — навигация + active-state + theme/OS/lang switch
│   ├── theme-provider.tsx         — ThemeProvider + useTheme (live system follow)
│   ├── theme-toggle.tsx           — 3-сегментный переключатель темы (light/dark/system)
│   ├── footer.tsx                 — footer (showCertificateCta опционально)
│   ├── sidebar.tsx                — оглавление модулей/units
│   ├── lesson-layout.tsx          — обёртка landing модуля
│   ├── unit-wizard.tsx            — пошаговый wizard фаз урока (+ режим/CS/help)
│   ├── phase.tsx                  — фаза урока (chip + маркер «в уме» для reflection)
│   ├── mdx-components.tsx         — регистрация всех MDX-компонентов
│   ├── os-toggle.tsx / os-block.tsx        — Mac/Windows переключатель (авто-детект ОС)
│   ├── agent-toggle.tsx / agent-block.tsx  — выбор стека (4 варианта)
│   ├── stack-matrix.tsx           — интерактивная матрица стеков (модуль 03)
│   ├── mobile-gate.tsx            — desktop-gate на unit-страницах (email/QR)
│   ├── lang-suggest-banner.tsx    — баннер смены языка по navigator.language
│   ├── feedback-form.tsx          — форма фидбека (locale-aware)
│   ├── pages/                     — home-page, module-page, unit-page, mdx-page, certificate-page
│   ├── rpg/                       — character-strip, world-map, quest-feed
│   ├── cs/                        — shard-balance, mode-selector, vault, cycle-complete
│   ├── quests/                    — daily-panel
│   ├── dungeon/                   — dungeon-view, dungeon-card
│   ├── intake/                    — компоненты опросника
│   ├── help/                      — help-tip, intro-card
│   └── wellbeing/                 — wellbeing-panel (SP4 nudges)
├── content/
│   ├── ru/                        — 9 модулей × units (00-kickstart … 08-agent-engineering)
│   │   ├── 03-stack-selection/    — выбор стека, Behind-GFW, Hermes
│   │   ├── cheatsheet.mdx, roadmap.mdx, exercises.mdx
│   └── en/                        — полное зеркало ru/
├── lib/
│   ├── content.ts                 — getAllModules, getUnitContent, навигация
│   ├── dictionaries.ts            — RU+EN словарь всего UI-текста
│   ├── unit-progress.ts           — прогресс юнитов (localStorage), эталон store-паттерна
│   ├── os-pref.ts                 — детект/хранение выбранной ОС (cheatsheet)
│   ├── theme-pref.ts              — детект/хранение темы (light/dark/system)
│   ├── use-pretext.ts
│   ├── rpg/ cs/ quests/ dungeon/ intake/ help/ pacing/ wellbeing/  — RPG-слой (см. ниже)
│   ├── content/reflection-prompts.test.ts       — drift-guard reflection-фаз
│   └── content.test.ts            — Vitest
├── public/author.jpg
└── next.config.ts
```

## RPG / геймификация

Поверх LMS построен RPG-слой. **Статичный сайт** (`output: 'export'`) — поэтому вся
игровая логика клиентская: чистые helpers + localStorage-store + React-hook
(эталон — `lib/unit-progress.ts`). Сервер хранит только intake-профиль и прогресс уроков (D1).

| Подсистема | Где | Что делает |
|------------|-----|-----------|
| **Intake** | `app/quest-intake/`, `lib/intake/` | Опросник → профиль `{ niche, cog_tier, world_skin, F3-outcome }` в D1 `intake_profiles`. `scoring.ts`, `attributes.ts`, `parse-outcome.ts` |
| **Квест-лог** | `app/dashboard/`, `lib/rpg/` | World Map (зоны = модули), QuestFeed, CharacterStrip. `quest-log.ts`, `map-layout.ts`, `niche-map.ts` |
| **Лист персонажа** | `app/character/` | Атрибуты, выведенные из intake-ответов |
| **Themed skins** | `lib/rpg/skins/*.json`, `skins-meta.ts`, `unit-framing.ts` | 7 миров; переформулировка юнитов под выбранный скин |
| **Cognitive Shards** | `lib/cs/` | Единая валюта (вместо XP). Режимы commander 1.0× / copilot 1.5× / archmage 2.5×. `wallet.ts`, `award.ts`, `modes.ts`, `applied-challenge.ts` |
| **Daily Quests** | `app` (на dashboard), `lib/quests/` | Дневные квесты, детерминированный seed (FNV-1a + mulberry32) |
| **Niche Dungeons** | `app/dungeon/`, `lib/dungeon/` | Арка-подземелье под нишу студента, `flavor-bank.ts` (8 ниш) |
| **Help-система** | `components/help/`, `lib/help/` | `<HelpTip>` (tap-popover) + `<IntroCard>` (авто-онбординг). Маркер «💭 в уме» на reflection-фазах |
| **Pacing & Wellbeing** (SP4) | `lib/pacing/`, `lib/wellbeing/`, `components/wellbeing/` | `pacing`-store (таймстемпы завершений/режимы/калибровки). `<WellbeingPanel>` — один мягкий nudge по приоритету: re-engage (якорь G11) > anxiety check-in > rest-day > post-Boss калибровка → suggest-only бейдж режима |

**localStorage-ключи** (изолированы, без коллизий): `cs_wallet`, `unit_progress`,
`daily_quests`, `niche_dungeon`, `help_seen`, `pacing`, `os`, `theme-pref`, `stack`, `lang-preference`.

**Bisociation**: фазы `activation`/`reflection` урока — бисоциативные провокации
(мысленные, без полей ввода). `lib/content/reflection-prompts.test.ts` (drift-guard)
запрещает «вводные» глаголы (`запиши`/`опиши`/`type`/`write down`…) в этих блоках.

## Запуск локально

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

## Сборка и деплой

```bash
npm run build      # генерирует web/out/ (~112 страниц: RU+EN)
```

Деплой **автоматический** при `git push main`, если изменены `web/`. Воркер деплоится
отдельным job при изменениях в `workers/`.

Ручной деплой:
```bash
CLOUDFLARE_API_TOKEN=<token> npx wrangler pages deploy out --project-name=tochka-sborki --branch=main
```

## Локализация (bilingual)

- Весь UI-текст — в `lib/dictionaries.ts` (`dictionaries.ru` / `dictionaries.en`).
  Компоненты получают `locale` и берут строки через `getDictionary(locale)`.
- Контент уроков — параллельные деревья `content/ru/` и `content/en/`.
- EN-маршруты живут в `app/en/**` и рендерят те же компоненты с `locale="en"`.
- `LangSuggestBanner` (в `layout.tsx`) предлагает сменить язык по `navigator.language`,
  выбор сохраняется в `localStorage.lang-preference`.

## Контент уроков (MDX)

Модуль = папка `content/{ru,en}/NN-slug/` с `_meta.json` (module, title, description,
duration, level, units[]) и `uX-*.mdx` файлами. Frontmatter unit-а: `title, unit, module, duration`.

Спец-компоненты в MDX:
- `<OsToggle />` + `<OsBlock os="mac|windows">…</OsBlock>` — Mac/Win команды
- `<AgentToggle />` + `<AgentBlock stack="claude|sovereign|cloud-oss|behind-gfw">…</AgentBlock>`
- `<StackMatrix />` — карта 4 стеков (модуль 03)
- `<Phase type="activation|reflection|concept|practice">` — фазы урока

## Backend / API (`workers/`)

CF Worker обслуживает `ai.synergify.com/api/*`:
- `auth/send-link`, `auth/verify`, `auth/me`, `auth/logout` — magic-link через Resend
- `progress/*` — прогресс по урокам (D1 `tochka-sborki-db`)
- `feedback` — приём формы фидбека
- CRM: новый юзер → webhook `N8N_CRM_WEBHOOK_URL` → n8n `mds-crm` → Notion

CORS разрешает `ai./mamaev.coach/mentor.mamaev.coach`. Секреты — `wrangler secret put`.

## Тесты

```bash
npm test           # vitest run
npm run test:watch
```

## CI/CD секреты

В GitHub репо (`master5d/tochka-sborki`):
- `CLOUDFLARE_API_TOKEN` — токен CF с правами Pages:Edit + Workers
