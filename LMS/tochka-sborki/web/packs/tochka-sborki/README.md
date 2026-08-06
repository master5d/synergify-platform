# course-pack: tochka-sborki

Данные курса «Точка Сборки» — **ноль кода движка**. Контракт (Ф1 S1, растёт по слайсам
плана `docs/superpowers/plans/2026-08-06-f1-packification.md`):

- `course.config.ts` — identity: name/fullName/domain/locales (SEO, PWA, sitemap).
- `dictionaries.ts` — вся UI-копия RU+EN (читается 32+ компонентами через стаб).
- `materials.ts` — манифест материалов курса.

Правила границы (enforced `lib/boundary.test.ts`):
- pack МОЖЕТ импортировать публичные модули движка (registry, типы);
- pack НЕ импортирует `components/` и `app/`;
- движок входит в pack ТОЛЬКО через стабы `lib/{course,dictionaries,materials}.ts`
  (до @pack-alias в S4).

Ещё не переехали (см. план): `lib/course/*` data-слой, skins, `content/{ru,en}`.
