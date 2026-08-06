# lib/course — course-data layer

Course-**specific** data the LMS engine reads. The engine (components, hooks, the rest of `lib/`)
imports from here; a future course swaps these files instead of editing the engine. First step
toward the multi-course platform (see `LMS/_template/`, `docs/curriculum-backlog.md`).

## Here now
**Phase 1 — web-only (safe with the `@/` alias):**
- `showcase.ts` — possibilities gallery data (`getShowcase`, `videoEmbedUrl`).
- `dungeon-flavor.ts` — niche dungeon flavor bank (`FLAVOR_BANK`).
- `niche-map.ts` — niche → module / slot mapping (`NICHE_MODULE`, `NICHE_SLOT`).

**Phase 2 — workers cross-consumed (RELATIVE imports only, Gotcha 2):**
- `skins.ts` — `SKINS_META` world-skin data. `lib/rpg/skins-meta.ts` keeps the helpers
  (`skinDecoder`, `skinCompanion`) and re-exports `SKINS_META` from here. Workers pulls it
  via that re-export, so `skins.ts` imports types relatively (`../rpg/types`).
- `intake-questions.ts` — `QUESTIONS_V2`, `MODULE_INTROS_V2`. `lib/intake/instrument.ts`
  (workers-pulled) imports it relatively (`../course/intake-questions`); the file imports
  types relatively (`../intake/types`).

## Convention
- Course data lives here; engine logic stays in `lib/`.
- **Web-only data** (showcase, dungeon-flavor, niche-map): import via `@/lib/course/*`.
- **Workers cross-consumed data** (skins, intake-questions): import/export with **relative**
  paths only — workers tsc can't resolve the `@/` alias (Gotcha 2).
