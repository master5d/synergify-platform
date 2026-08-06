# Ф1 — pack-ификация (план слайсов)

Спека: `../specs/2026-08-06-synergify-platform-extraction-design.md`. Принцип S1:
**шов без разрыва** — данные переезжают в `packs/`, на старых путях тонкие
re-export-стабы (32+ компонентов не трогаются), boundary-гвард фиксирует границу.

## S1 (этот коммит)
- `LMS/tochka-sborki/web/packs/tochka-sborki/`: `course.config.ts` (← lib/course.ts),
  `dictionaries.ts`, `materials.ts` + README контракта.
- Стабы на старых путях: `lib/course.ts`, `lib/dictionaries.ts`, `lib/materials.ts`.
- `lib/pack.ts` — `PACK_SLUG`/`PACK_DIR` резолвер (семя COURSE_PACK; fs-потребители
  обязаны ходить через него).
- `lib/boundary.test.ts` — гвард: (a) движок не импортит `packs/` нигде, кроме
  белого списка стабов; (b) pack не импортит `components/`/`app/`; (c) обязательные
  файлы контракта присутствуют.

## S2 — data-слой lib/course/* и skins
- `lib/course/*` (showcase, certificate, ecosystem, office-hours, try-chains,
  notebook-pack, ai-doubles, skins=SKINS_META…) → pack, стабы тем же паттерном.
- `lib/rpg/skins/*.json` + `skins-meta.ts`: ЖДУТ S4 — динамические
  `import(\`@/lib/rpg/skins/\${skin}.json\`)` в unit-wizard/profile/dashboard
  требуют alias, не стаба. Гоча зафиксирована здесь, чтобы не споткнуться.
- ⚠ CHECKLIST в LMS/_template называет `lib/rpg/niche-map.ts` — файла НЕТ
  (устарел); актуализировать CHECKLIST при S2.

## S3 — content/
- `content/{ru,en}` → pack; `lib/content.ts` читает через PACK_DIR; гварды
  (registry-integrity, links-integrity, reflection drift) параметризуются PACK_DIR.

## S4 — COURSE_PACK переключалка + второй жилец
- next.config: turbopack/webpack `resolveAlias['@pack'] = packs/$COURSE_PACK`;
  стабы переезжают на `@pack/*`; динамические skins-импорты → alias.
- `packs/living-practice/` (курс академии из academy/lib/course/) — второй жилец
  доказывает контракт; registry несёт pack-источник и домен.
- packs/ поднимаются на корень репо (turbopack.root пин — прецедент registry.json).

## Инварианты всех слайсов
- Каждый слайс: vitest + tsc + build зелёные ДО push; прод не задет (стабы = тот же байткод).
- Boundary-гвард расширяется с каждым переездом, белый список стабов только сокращается
  после S4 (стаб → alias).
