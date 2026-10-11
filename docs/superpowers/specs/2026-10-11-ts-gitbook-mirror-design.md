# Зеркало курса «Точка Сборки» на GitHub Pages (`ts-gitbook`) — дизайн

Дата: 2026-10-11 · Статус: на проверке владельцем · Путь: архитектурный (новая площадка публикации + режим сборки)

## Зачем

С июня 2025 российские провайдеры режут соединения с сайтами за Cloudflare (часто проходят первые 16 КБ). Курс
(`ai.synergify.com`, CF Pages) и его API (CF Worker) — за Cloudflare. Ученик в России может не получить урок целиком.
Зеркало на GitHub Pages даёт тот же курс для чтения с инфраструктуры GitHub.

Замер 2026-10-11 (check-host, узлы ru1/ru2/ru3 — датацентры Москвы и Петербурга): `pages.github.com` → 200 за 0,06–0,10 с,
адреса 185.199.108–110.153 (GitHub). Домашние провайдеры не мерены.

## Решения владельца (2026-10-11)

1. Режим — **открытое зеркало для чтения**: без входа и intake, прогресс только в браузере, серверные функции ведут на
   основной сайт (вариант 1A).
2. Ученики зеркала **не попадают в лиды** — осознанная цена (вход в коде назван «дверью, а не сейфом», курс бесплатный).
3. Репо — **`master5d/ts-gitbook`** (имя `tochka-sborki` занято живым mc_hub), адрес `https://master5d.github.io/ts-gitbook/`.
4. Пересборка — **на каждый push в `main`** отдельной задачей в `.github/workflows/deploy.yml`.

## Что уже есть

- `COURSE_BASE_PATH` → `basePath`/`assetPrefix` в `next.config.ts`; `lib/base-path.ts` (`assetPath`, `pagePath`) для сырых
  ссылок и сервис-воркера (Ф4 S2, intake LMS#16).
- `output: 'export'`, `trailingSlash: true` — каждая страница = `…/index.html`, это ровно то, что отдаёт GitHub Pages.
- API: `lib/platform-api.ts` (`PLATFORM_API`, абсолютный `https://ai.synergify.com`) и относительные `/api/*`
  (`progress-provider`, `intake-guard`, `mobile-gate` и др.). На `github.io` абсолютные упрутся в Cloudflare и
  чужой cookie, относительные дадут 404.
- Уроки закрыты: `components/lesson-layout.tsx` оборачивает их в `AuthGuard` → `IntakeGuard` → `MobileGate`.
  Без режима зеркала каждый урок уводит на вход.

## Подход

Флаг сборки **`COURSE_MIRROR=1`** → `NEXT_PUBLIC_COURSE_MIRROR` (инлайнится в бандл, как `NEXT_PUBLIC_COURSE_BASE_PATH`).
Единственная точка правды — новый `lib/mirror.ts`:

- `IS_MIRROR: boolean`;
- `MAIN_SITE = 'https://ai.synergify.com'` (из `COURSE.domain`, не хардкод — инвариант `lib/course.ts`);
- `mainSiteUrl(path)` — тот же путь на основном сайте (без префикса зеркала).

Отклонено: отдельный pack (pack — контент, а меняется поведение движка); патч готового `out/` (ломается от любой правки
компонентов).

Основная сборка (`COURSE_MIRROR` не задан) по поведению не меняется: каждая ветка зеркала — `if (IS_MIRROR)` с ранним выходом.

## Компоненты

### 1. Защиты уроков
`AuthGuard`, `IntakeGuard`, `MobileGate`: при `IS_MIRROR` сразу отдают `children`, без сетевых вызовов и редиректов.
`AdmissionGuard` (гейт академии) у Точки Сборки на уроках не стоит; при `IS_MIRROR` тоже пропускает — на случай переиспользования.

### 2. Прогресс
`ProgressProvider` (+ `lib/progress-sync.ts`, `lib/spaced-review.ts`): при `IS_MIRROR` не ходит в `/api/progress/*`,
читает и пишет прогресс в `localStorage` (ключ `mirror_unit_progress`, отдельный от RPG-ключей). Интерфейс
`useProgress()` не меняется — `unit-wizard` и карта курса работают как есть. RPG-слой (кристаллы, ежедневные задания,
pacing) и так клиентский — без изменений.

### 3. Серверные страницы → заглушка
Новый `components/mirror-stub.tsx`: «Это доступно на основном сайте» + ссылка `mainSiteUrl(текущий путь)`, RU/EN из словаря.
Рендерится вместо содержимого при `IS_MIRROR` на маршрутах: `login`, `auth/verify`, `dashboard`, `character`, `dungeon`,
`quest-intake`, `certificate` (+ проверка сертификата), `feedback`, `support`, `care`, `alumni`, `admin` — RU и `/en/`.

### 4. Компоненты внутри уроков и страниц, которые ходят в API
Инвентарь на 2026-10-11 (вне админки, 33 файла): `module-survey`, `role-play`, `interest-example/client`, `capture-form`,
`hero-secondary-cta`, `intake/unit-route-step`, `character-sheet`, `nav` (вход/выход), `telegram-auth-bridge`,
`certificate-evidence`/`graduate-retro`/`care` и др. Правило: каждый такой компонент при `IS_MIRROR` либо не рендерится,
либо показывает строку-ссылку на основной сайт. Решение по каждому — в плане.
**Гвард:** тест `lib/mirror-coverage.test.ts` находит все файлы, упоминающие `PLATFORM_API` или `'/api/`, и требует, чтобы
каждый либо импортировал `IS_MIRROR`, либо стоял в явном списке исключений с причиной (например, маршрут целиком
закрыт заглушкой). Новый API-компонент без ветки зеркала = красный тест.

### 5. Оболочка зеркала
- Плашка на всех страницах (layout): «Зеркало курса. Вход, прогресс на сервере и сертификат — на ai.synergify.com»
  со ссылкой на тот же путь; закрывается, выбор помнится в `localStorage` (try/catch).
- SEO: `<meta name="robots" content="noindex">` и `<link rel="canonical">` на `mainSiteUrl(path)`; `sitemap.xml` в
  зеркале не публикуется, `robots.txt` — `Disallow: /`.
- PWA: сервис-воркер регистрируется со scope `/ts-gitbook/` через `assetPath` (уже так); манифест — с префиксом.
- Аналитика: в зеркале не подключается (если есть — гасится тем же флагом).

### 6. Публикация
Задача `deploy-mirror` в `.github/workflows/deploy.yml` (те же `on.push.paths`, что у `deploy-web`):
`npm ci` → `npm test` → `npm run build` с `COURSE_MIRROR=1 COURSE_BASE_PATH=/ts-gitbook` → проверка зеркала (ниже) →
`touch out/.nojekyll` → `git push --force` содержимого `out/` в ветку `gh-pages` репо `master5d/ts-gitbook` (история ветки
= только сборки, перезапись безопасна).
Доступ — deploy key с правом записи **только в `ts-gitbook`**, приватная часть — секрет `TS_GITBOOK_DEPLOY_KEY` в
`master5d/synergify-platform`. Настройка — агентом через `gh` (ключ не печатается, передаётся пайпом):
создать публичный репо `ts-gitbook` (README: что это зеркало и где основной сайт), сгенерировать ключ, добавить deploy key
(write), положить секрет, включить Pages с ветки `gh-pages` (`/`).

### 7. Ссылка с основного сайта
03/u3 (RU/EN), блок «Россия» → «Если курс грузится наполовину — открой зеркало: master5d.github.io/ts-gitbook/».

## Ошибки и края

- Сетевой вызов, случайно оставшийся в зеркале, на `github.io` упадёт: относительный — 404, абсолютный — CORS/Cloudflare.
  Защита — гвард из п. 4 и проверка сборки из п. «Проверка».
- `localStorage` недоступен (приватный режим) — прогресс не сохраняется, урок открывается (try/catch, без падения).
- Ссылки `<a href="/…">` без `pagePath` уводят на `master5d.github.io/` (чужой корень) — проверка сборки ловит ссылки без
  префикса `/ts-gitbook`.
- Deploy key утёк — запись возможна только в `ts-gitbook`; ротация = новый ключ + секрет.
- GitHub Pages недоступен из РФ у конкретного провайдера — зеркало не помогает; честно указано в тексте u3 («если открывается»).

## Проверка

1. Vitest (основная сборка и режим зеркала через мок флага):
   `lib/mirror.ts` (флаг, `mainSiteUrl`); защиты пропускают в зеркале и проверяют в основной сборке; прогресс в зеркале
   локальный и не трогает `fetch`; заглушка на серверных маршрутах; гвард покрытия (п. 4).
2. `scripts/check-mirror.mjs` по `out/` зеркала: каждая внутренняя ссылка/ассет начинается с `/ts-gitbook/`; на каждой
   странице есть `noindex` и плашка; в HTML уроков нет `/api/` вызовов; `sitemap.xml` отсутствует. Ненулевой код при нарушении.
3. Основная сборка: полный `npm test`, `tsc` под оба pack'а, `next build` — без изменений поведения.
4. После деплоя: обход `https://master5d.github.io/ts-gitbook/` (главная, урок RU и EN, шпаргалка, материалы, заглушка
   входа); проба с российских узлов check-host.

## Не делаем

Вход на зеркале; сбор лидов; синхронизацию прогресса между сайтами; свой домен; зеркало академии и других pack'ов.
