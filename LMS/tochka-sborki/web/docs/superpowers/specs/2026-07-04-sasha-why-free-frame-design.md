# Why-free value-frame (key #4) — sovereign artifact

**Ticket:** fb_dd3528fa625c ("ключ №4" of the why-free trust-model; #1 of the 3-item "all" sequence)
**Date:** 2026-07-04
**Status:** approved

## Goal

Capture key #4 of the "почему курс бесплатный" trust-model — the free course
as building a **peer network / commons of sovereign practitioners working for
collective benefit** — as a grounded, sovereign, testable value-frame artifact
plus a prompt-emitter that hands it to the owner's own agent. Plain-mode
register (no esoterica, no glossy movement-hype). No live LLM; no ghost-writing
of owner voice.

This mirrors the Slice B (DIYU) pattern exactly — a JSON SoT beside
`registry.json` / `diyu-thesis.json`, a sibling emitter in `scripts/`, and a
de-hustle drift-guard reusing `lib/authoring/dehustle.ts`.

## Hard constraints

- **Sovereign / prompt-emitter.** No live LLM. Emits a prompt for the owner's
  agent; does not write the copy.
- **Plain-mode / clarity-first.** The seed statements stay grounded — "peer
  network", "commons", "sovereign practice", "collective benefit" — not
  spiritual/movement register. (Owner-chosen; the ticket's original
  "Работники Света / во благо всех живых существ" register is deliberately
  translated down to plain-mode.)
- **Authenticity / de-hustle.** Every frame string + the origin note passes
  `lintDehustle` (returns `[]`).
- **Sole-prop, NEVER nonprofit.** No nonprofit / tax / donation framing.
- **Additive.** Does not touch the shipped why-free FAQ answer
  (`dictionaries.ts`), the S3/DIYU emitters, or `academy.positioning`.
- **Trunk-based** on `main`; TDD; commit per task.

## Architecture

Three files, mirroring the registry-SoT + sovereign-emitter family:

1. **`LMS/why-free-frame.json`** — the value-frame SoT, beside
   `registry.json` and `diyu-thesis.json`. No app module imports it → zero Next
   build / turbopack impact.
2. **`scripts/why-free-prompt.mjs`** — sovereign emitter, sibling of
   `scripts/diyu-manifesto-prompt.mjs`. Reads `registry.json` (academy + course
   context) and `why-free-frame.json`, prints one prompt for the owner's agent.
3. **`LMS/tochka-sborki/web/lib/academy/why-free-frame.test.ts`** — drift-guard
   (Vitest, env=node), reusing `lintDehustle`.

### `LMS/why-free-frame.json` — exact content

```json
{
  "origin": {
    "source": "Наташа (feedback)",
    "note": "Ключ №4 модели «почему курс бесплатный» (родитель fb_ed319653; ключ №1 — FAQ loss-leader — уже опубликован)."
  },
  "frame": [
    {
      "id": "commons",
      "ru": "Курс — открытый commons: знание передаётся, а не продаётся. Бери, форкай, передавай дальше — оно остаётся общим.",
      "en": "The course is an open commons: knowledge is passed on, not sold. Take it, fork it, pass it on — it stays shared."
    },
    {
      "id": "peer-network",
      "ru": "Выпускники образуют распределённую сеть практиков, а не список клиентов — их связывает общая практика, а не платформа.",
      "en": "Graduates form a distributed network of practitioners, not a customer list — held together by shared practice, not a platform."
    },
    {
      "id": "sovereign-practice",
      "ru": "Каждый держит свои инструменты, своего агента и свой метод. Сеть суверенна: она не зависит от единого центра или провайдера.",
      "en": "Each person keeps their own tools, their own agent, and their own method. The network is sovereign: it does not depend on a single center or provider."
    },
    {
      "id": "collective-benefit",
      "ru": "Работа сети складывается во благо общего — из множества малых суверенных практик, а не из движения, спущенного сверху.",
      "en": "The network's work adds up to a shared benefit — from many small sovereign practices, not from a movement handed down from above."
    },
    {
      "id": "free-is-the-point",
      "ru": "Бесплатно — это суть, а не приманка: низкий порог даёт сети расти. Коучинг и работа с командами — отдельный честный шаг, а не скрытый замок.",
      "en": "Free is the point, not the bait: a low barrier lets the network grow. Coaching and team work are a separate, honest step — not a hidden lock."
    }
  ],
  "placements": [
    "FAQ «почему бесплатно» expansion (short — beside the shipped answer)",
    "a landing value-section (medium)",
    "the why-free narrative (long — the owner's voice)"
  ]
}
```

The frame strings are neutral, grounded seed statements — not finished copy.
The owner's voice is the expansion the agent produces from them.

### `scripts/why-free-prompt.mjs` — behaviour

Mirrors `diyu-manifesto-prompt.mjs`:
- `repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')`
- reads `LMS/registry.json` → `academy.name`, `academy.fullName`, `courses`
- reads `LMS/why-free-frame.json` → `origin`, `frame`, `placements`
- `console.log` one prompt with:
  - **header**: "You are helping the owner write the 'why the course is free'
    value-frame (key #4) for {name} — {fullName.en}. Write in the OWNER'S
    voice, plain-mode; this prompt hands you the framing, not the finished
    words."
  - **CONTEXT**: academy name/fullName, course list (`- ru / en (status)`),
    and the origin line ("Key #4 of the why-free model, from {source}.").
  - **FRAME**: each frame point numbered, ru then en.
  - **HARD CONSTRAINTS**: plain-mode / clarity-first (no glossy movement-hype,
    no spiritual grandiosity); no urgency/scarcity/testimonials/guru/fabricated
    metrics; modest sovereign honest tone; sole-prop — never nonprofit; write
    both Russian and English.
  - **PLACEMENT**: the `placements` list, one per line.

No test for the script itself (mirrors the family); the implementer runs it
once and pastes the output into the task report as a smoke check.

### `why-free-frame.test.ts` — drift-guard (env=node)

Imports the JSON (`import frame from '../../../../why-free-frame.json'`) and
`lintDehustle` from `../authoring/dehustle`, then asserts:

- **origin present**: `frame.origin.source` non-empty; `frame.origin.note`
  non-empty.
- **frame bilingual & non-empty**: exactly 5 points; each has a non-empty
  `id`, `ru`, `en` (trimmed length > 0).
- **de-hustle clean**: for `origin.note` and every `ru`/`en` string,
  `lintDehustle(str)` returns `[]`.
- **placements non-empty**: at least one placement.

## Testing

- Vitest (env=node) drift-guard as above.
- `npx tsc --noEmit` gate (JSON import + test types).
- Emitter smoke: `node scripts/why-free-prompt.mjs` prints a non-empty prompt
  containing the academy name, the origin source, all five frame id texts, and
  the three placement lines.

## Out of scope

- The final copy (owner voice — the agent writes it from the prompt).
- Editing the shipped why-free FAQ answer, the S3/DIYU emitters, or
  `academy.positioning`.
- Keys #1–3 of the trust-model (not ticketed — not fabricated).
- Any live LLM call. Any UI. Any nonprofit framing. The spiritual/"Lightworker"
  register (translated down to plain-mode by owner choice).
