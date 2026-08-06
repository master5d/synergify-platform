# Authoring a new course (AI-assisted, de-hustled)

The `web/lib/authoring/` toolchain turns a typed outline into de-hustled, 4-Phase MDX lessons.
Deterministic where it can be; you + your own agent supply the prose. No lesson content is
auto-written — you place the final MDX, so nothing is ever clobbered. Run the CLIs from `web/`.

## Pipeline

1. **Outline.** Write your course as a `CourseOutline` (see `lib/authoring/sample-outline.ts`):
   modules (`NN-slug`) x units (`uN-slug`), each with a bilingual `title` + `objective`.
   `validateOutline` enforces the shape; `lintOutlineDehustle` strips profit/scarcity/avatar framing.

2. **Status dashboard.**
   `npx tsx scripts/author-course.ts [notes-dir] [ru|en]`
   Reports each unit as `needs-research`, `ready`, or `needs-polish`, plus the next step.

3. **Research (per `needs-research` unit).**
   `npx tsx scripts/research-prompt.ts <module> <unit> [ru|en]`
   Paste the printed prompt into your agent (Claude Code / ChatGPT). Save its reply to
   `<notes-dir>/<module>__<unit>.txt` (the labeled `CONCEPTS:/HOOK:/MISCONCEPTION:/PRACTICE:/SOURCES:` format).

4. **Re-run the dashboard** with `<notes-dir>` — noted units now draft to `ready` or `needs-polish`.

5. **Draft + review (per `needs-polish`, or to inspect any draft).**
   `npx tsx scripts/draft-lesson.ts <module> <unit> [ru|en] <notes-file> > draft.mdx`
   `npx tsx scripts/review-lesson.ts draft.mdx [ru|en]`
   Paste the printed polish prompt into your agent; it returns tightened MDX.

6. **Place it.** Put the final `<unit>.mdx` in `content/<locale>/<module>/`. Re-run
   `review-lesson` on it to confirm `validateDraftMdx` + `lintReadability` are clean.

## Gates (always on)

- **de-hustle** — no profit-first / scarcity / sales / avatar framing (`lintDehustle`).
- **no-write reflection** — activation & reflection stay mental (`validateDraftMdx`).
- **4-Phase structure** — activation -> reflection -> concept -> practice, in order.
- **readability** — sentences under 25 words, concrete practice step (`lintReadability`).

Sovereign: the AI stages run in *your* agent; no key or model is vendored here.
