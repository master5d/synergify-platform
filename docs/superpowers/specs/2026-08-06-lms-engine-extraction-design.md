# lms-engine — standalone образовательная платформа synergify (экстракция из mc_hub)

**Дата:** 2026-08-06 · **Статус:** approved by owner (диалог 08-06; развилки закрыты)
**Закрывает:** fb_8f1a05ce1150 (engine extraction) · fb_31371f4fdd19 (thin course shape)

## Решения владельца

1. Репо: `C:\telo\Efforts\On\lms-engine`, remote **master5d/lms-engine** (private).
2. Разделение по доменам: **lms-engine = вся образовательная платформа synergify**
   (движок LMS + workers platform-API + synergify.com витрина + academy-апп).
   **mc_hub остаётся mamaev.coach** (hub, blog, mentor). Название mc_hub = mamaev coach.
3. Домены курсов: Точка Сборки = ai.synergify.com (как есть); тантра = **raviji.love**
   (запаркован); будущие — TBD, домен задаётся в registry per-pack.
4. **Авторинг: мастера делают МОДУЛИ внутри существующих курсов** (пример: Наташа —
   модуль астрологии в академии, в рамках манифеста академии). Wizard ведёт к
   module-pack; целые курсы гостям не выдаются.

## Архитектура (модель C — движок-апп + course-pack)

- **Engine** (Next.js апп, бывший `LMS/tochka-sborki/web/` минус курс-данные):
  content-loader, i18n, PWA, SEO, RPG-слой, auth-клиент, learn-with-AI,
  syllabus/materials, guard-тесты. Билд читает `COURSE_PACK` → собирает сайт курса.
- **Course-pack** (чистые данные, ноль кода движка): `course.config`, dictionaries-значения,
  materials, content/{ru,en}/**, skins/niche-map/intake (опц.), showcase, домен.
  Состоит из **модулей**; модуль несёт `author` (владелец или гость) и наследует
  манифест курса.
- **Манифест курса = исполняемый гейт**: de-hustle/no-write/readability линты уже в
  движке; добавляется manifest-guard pack'а (hard constraints курса — например,
  академические: no-scarcity, anti-dependency, мистика-образ-без-апроприации).
  Гостевой модуль не проходит CI, пока не в рамках манифеста.
- **Workers** (auth/progress/admission/feedback/CRM/telegram/checkout) переезжают в
  lms-engine как `platform/` — это API платформы, не личного сайта.
- **Registry** (`registry.json`) переезжает в lms-engine, остаётся SoT: курс = slug,
  имя, tagline, домен, status, locales, pack-источник.
- **CI**: push в main → матрица по pack'ам → build+guards+deploy каждого курсового
  сайта (CF Pages) + workers deploy. Обновление движка = автоапгрейд всех курсов.
- **Packs №1-2 живут в репо движка** (`packs/`), выделение в отдельные репо гостевых
  авторов — при первом госте (том же механизмом: pack-источник в registry).

## Фазы

- **Ф0 — вырезание (эта сессия, без cutover прода):** копия web/ + workers/ + academy/ +
  synergify/ в новый репо; данные ТС собраны в `packs/tochka-sborki/`; build+тесты
  зелёные; репо запушен. Прод ПРОДОЛЖАЕТ деплоиться из mc_hub до явного cutover.
- **Ф0.5 — cutover:** CF Pages/Workers проекты переключаются на lms-engine CI;
  mc_hub чистится от переехавшего (deploy.yml ужимается до hub/mentor).
- **Ф1 — второй жилец:** «Практика в живой связи» → pack академии (валидация контракта).
- **Ф2 — wizard:** authoring-цепочка → module-pack флоу для гостей (паттерн
  фрактальных MAS в research-стадии; Plan→Build→Improve из LearnWorlds-харвеста;
  cohort-акселератор как онбординг мастеров — бэклог).
- **Ф3 — тантра (raviji.love):** первый курс, собранный wizard-путём.

## Не в скоупе

Мультитенантный SaaS с логинами авторов; RPG-слой обязателен только там, где pack его
включает; email-дрипы из харвеста — отдельный бэклог поверх Resend.
