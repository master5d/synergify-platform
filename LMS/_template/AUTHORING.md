# Authoring a new course (AI-assisted, de-hustled)

The `web/lib/authoring/` toolchain turns a typed outline into de-hustled, 4-Phase MDX lessons.
Deterministic where it can be; you + your own agent supply the prose. No lesson content is
auto-written — you place the final MDX, so nothing is ever clobbered. Run the CLIs from `web/`.

## Pipeline

1. **Outline.** Write your course as a `CourseOutline` (see `lib/authoring/sample-outline.ts`):
   modules (`NN-slug`) x units (`uN-slug`), each with a bilingual `title` + `objective`.
   `validateOutline` enforces the shape; `lintOutlineDehustle` strips profit/scarcity/avatar framing.
   Save it as an `outline.json` file — every CLI below takes `--outline <path.json>`
   (`lib/authoring/outline-io.ts` loads + validates it; omit the flag for the bundled sample).

2. **Status dashboard.**
   `npx tsx scripts/author-course.ts [notes-dir] [ru|en] [--outline outline.json]`
   Reports each unit as `needs-research`, `ready`, or `needs-polish`, plus the next step.

3. **Research (per `needs-research` unit).**
   `npx tsx scripts/research-prompt.ts <module> <unit> [ru|en] [--outline outline.json]`
   Paste the printed prompt into your agent (Claude Code / ChatGPT). Save its reply to
   `<notes-dir>/<module>__<unit>.txt` (the labeled `CONCEPTS:/HOOK:/MISCONCEPTION:/PRACTICE:/SOURCES:` format).

4. **Re-run the dashboard** with `<notes-dir>` — noted units now draft to `ready` or `needs-polish`.

5. **Draft + review (per `needs-polish`, or to inspect any draft).**
   `npx tsx scripts/draft-lesson.ts <module> <unit> [ru|en] <notes-file> [--outline outline.json] > draft.mdx`
   `npx tsx scripts/review-lesson.ts draft.mdx [ru|en]`
   Paste the printed polish prompt into your agent; it returns tightened MDX.

6. **Place it.** Put the final `<unit>.mdx` in `content/<locale>/<module>/`. Re-run
   `review-lesson` on it to confirm `validateDraftMdx` + `lintReadability` are clean.

## Рождение нового курса (pack)

Механика от идеи до CI-факта (контент пишешь ты со своим агентом — тут только каркас):

1. **Plan.** `npx tsx scripts/course-plan-prompt.ts "<идея курса в одну строку>" [ru|en] [--domain <url>]`
   печатает sovereign-промпт (референсы домена → ICP → «для кого / вход / выход» →
   фрактально модули/юниты → CourseOutline JSON; рамка тона = CORE_MANIFEST + де-hustle).
   Вставь его в своего агента, JSON-ответ сохрани как `outline.json`.
2. **Scaffold.** `npx tsx scripts/scaffold-course.ts <root> --outline outline.json` — пишет
   `content/{ru,en}/<NN-module>/` скелет (no-clobber: существующие файлы = отказ целиком).
   `root` — путь относительно `web/`, например `packs/<slug>` нового pack'а.
3. **Pack surface.** Пройди чеклист `LMS/_template/CHECKLIST.md`: `packs/<slug>/course.config.ts`,
   `dictionaries.ts`, `manifest.ts` (CORE_MANIFEST + доменные правила), `materials.ts`, брендинг.
4. **Registry.** Добавь запись курса в `LMS/registry.json` (slug / name / tagline / url /
   status / locales) — registry drift-guard сверяет её с `COURSE`.
5. **CI.** Добавь slug в `matrix.pack` job'а `build-packs` в `.github/workflows/deploy.yml` —
   с этого момента «движок обновился → курс пересобрался» проверяется на каждом push.

Дальше — обычный конвейер выше (`--outline outline.json` во всех трёх CLI) под
`COURSE_PACK=<slug>`.

## Gates (always on)

- **de-hustle** — no profit-first / scarcity / sales / avatar framing (`lintDehustle`).
- **no-write reflection** — activation & reflection stay mental (`validateDraftMdx`).
- **4-Phase structure** — activation -> reflection -> concept -> practice, in order.
- **readability** — sentences under 25 words, concrete practice step (`lintReadability`).

Sovereign: the AI stages run in *your* agent; no key or model is vendored here.
