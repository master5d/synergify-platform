# LMS course template

Scaffold for spinning up a **new course** under `LMS/<course-slug>/`. The first course,
`tochka-sborki/`, is the reference implementation.

This is an **authoring scaffold**, not a runnable app copy. The LMS engine (the Next.js app in
`tochka-sborki/web/`) is currently fused with that course's data — extracting a shared engine is
tracked separately (`fb_8f1a05ce1150`). Until then, a new course is created by **copying the web
app and swapping the course-specific data** listed in [`CHECKLIST.md`](./CHECKLIST.md).

## Engine vs. course data

| Layer | Where | New course… |
|---|---|---|
| **Engine** (reuse as-is) | content-loader, i18n structure, PWA, SEO (sitemap/robots), RPG layer (rpg/cs/dungeon/quests/wellbeing/intake), auth/guards, learn-with-AI, syllabus/materials renderers | keeps unchanged |
| **Course data** (fill in) | `lib/course.ts`, `lib/dictionaries.ts` values, `lib/materials.ts`, `lib/rpg/skins/*` + `skins-meta`, `lib/rpg/niche-map.ts`, `lib/showcase.ts`, `content/{ru,en}/` | replaces |

## Quickstart (current, copy-based)

1. `cp -r LMS/tochka-sborki/web LMS/<course>/web` (then `rm -rf web/out web/.next web/node_modules`).
2. Work through [`CHECKLIST.md`](./CHECKLIST.md) top to bottom.
3. Start from the stubs here:
   - `course.config.template.ts` → `web/lib/course.ts`
   - `materials.template.ts` → `web/lib/materials.ts`
   - `content/{ru,en}/01-example/` → shape for your first `content/{ru,en}/<NN-module>/`
4. `cd web && npm i && npm run test && npm run build`.
5. Add a CF Pages project + a `deploy.yml` job pointing at `LMS/<course>/web`.

## Future (after `fb_8f1a05ce1150`)

Once the engine is extracted into a shared package, a new course becomes a thin **data + content**
folder (no engine copy). This template will then ship that thin shape instead of the copy steps.
See also `fb_31371f4dfd19`.
