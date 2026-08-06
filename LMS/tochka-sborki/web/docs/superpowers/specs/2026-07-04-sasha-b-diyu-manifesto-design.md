# S.A.S.H.A Slice B — DIYU thesis + sovereign manifesto emitter

**Ticket:** fb_43a821d71a64 (DIYU-for-AI-age positioning / manifesto)
**Date:** 2026-07-04
**Status:** approved

## Goal

Capture the DIYU-for-the-AI-age framing (adapted from Anya Kamenetz's *DIYU:
The Do-It-Yourself University*, with attribution) as a sovereign, testable
source-of-truth artifact, plus a prompt-emitter that hands that framing to the
**owner's own agent** to draft the manifesto/essay in the owner's voice. No
live LLM anywhere; no ghost-writing of owner voice.

## Hard constraints

- **Sovereign / prompt-emitter.** No live LLM call. The deliverable emits a
  prompt for the owner's agent; it does not generate the manifesto itself.
  Mirrors the S3 pattern (`scripts/academy-manifesto-prompt.mjs`).
- **Attribution required.** The framing is adapted from **Anya Kamenetz**,
  *DIYU: The Do-It-Yourself University* — credited, not quoted. The drift-guard
  test asserts the attribution is present.
- **Authenticity sacred / de-hustle.** Every thesis string must pass the
  existing `lib/authoring/dehustle.ts` `lintDehustle` lint (no urgency,
  scarcity-marketing, funnels, guru language, fabricated metrics). Note: the
  lint bans the marketing word "scarcity"/"scarce"; the thesis expresses the
  *information-abundance* idea through "rare / no longer rare" to stay clean
  while keeping the meaning.
- **Sole-prop, NEVER nonprofit.** No nonprofit / tax-deductible / donation
  framing in any string.
- **Do not touch S3.** `scripts/academy-manifesto-prompt.mjs` and hub
  `academy.positioning` are left as-is. Slice B is additive.
- **Trunk-based** on `main`; TDD; commit per task.

## Architecture

Three files, mirroring the registry-SoT + sovereign-emitter patterns already
in the codebase:

1. **`LMS/diyu-thesis.json`** — the framing SoT, sitting beside
   `LMS/registry.json`. Read by the emitter (via `readFileSync`) and by the
   drift-guard test. No app module imports it, so there is **zero** Next build
   / turbopack impact.
2. **`scripts/diyu-manifesto-prompt.mjs`** — the sovereign emitter, a sibling
   of `scripts/academy-manifesto-prompt.mjs`. Reads `registry.json` (academy +
   course context) and `diyu-thesis.json` (the framing), prints one prompt for
   the owner's agent.
3. **`LMS/tochka-sborki/web/lib/academy/diyu-thesis.test.ts`** — the drift-guard
   (Vitest, env=node), reusing `lintDehustle`.

### `LMS/diyu-thesis.json` — exact content

```json
{
  "attribution": {
    "source": "Anya Kamenetz",
    "work": "DIYU: The Do-It-Yourself University",
    "note": "Концепт адаптирован и атрибутирован, не цитируется дословно."
  },
  "thesis": [
    {
      "id": "cathedral",
      "ru": "Классический университет — «собор рациональности», застывший с эпохи, когда книги были редки и дороги. Его форма отвечала на голод по знанию, которого больше нет.",
      "en": "The classic university is a 'cathedral of rationality', frozen from an era when books were rare and costly. Its shape answered a hunger for knowledge that no longer holds."
    },
    {
      "id": "info-abundant",
      "ru": "Знание перестало быть редким: MIT OpenCourseWare, Khan Academy, Wikipedia, YouTube — оно лежит открыто. Ценность больше не в доставке контента.",
      "en": "Knowledge is no longer rare: MIT OpenCourseWare, Khan Academy, Wikipedia, YouTube — it lies open. Value is no longer in delivering content."
    },
    {
      "id": "ai-manuscript",
      "ru": "AI — следующий сдвиг в этой истории, новая «манускриптная технология»: как печатный станок обрушил монополию на переписанное знание, так агенты меняют сам способ учиться и делать.",
      "en": "AI is the next shift in this story, the new 'manuscript technology': as the printing press broke the monopoly on copied knowledge, agents change how we learn and make."
    },
    {
      "id": "value-shift",
      "ru": "Ценность смещается на три опоры: учись тому, что нужно сейчас; соединяйся с правильным сообществом; доказывай навык делом, а не дипломом.",
      "en": "Value shifts onto three footings: learn what you need now; connect to the right community; demonstrate skill by doing, not by a diploma."
    },
    {
      "id": "sovereign-diy",
      "ru": "Точка Сборки и S.A.S.H.A — открытый, доступный, суверенный DIY-университет AI-эпохи: гильдия мастеров и учеников, независимая от церкви и государства. Открытый и в твоих руках.",
      "en": "Tochka Sborki and S.A.S.H.A are the open, affordable, sovereign DIY-university for the AI age: a guild of masters and scholars independent of church and state. Open and in your hands."
    }
  ],
  "placements": [
    "hub academy.positioning (short — the landing framing)",
    "a 'Горизонты' blog essay (long — the owner's manifesto in their voice)",
    "the S.A.S.H.A manifesto"
  ]
}
```

The thesis strings are neutral framing *seed statements* (an adapted public
concept), not finished manifesto prose — the owner's voice is the expansion
the agent produces from them.

### `scripts/diyu-manifesto-prompt.mjs` — behaviour

Mirrors `academy-manifesto-prompt.mjs`:
- `repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')`
- reads `LMS/registry.json` → `academy.name`, `academy.fullName`, `courses`
- reads `LMS/diyu-thesis.json` → `attribution`, `thesis`, `placements`
- `console.log` one prompt with these sections:
  - **header**: "You are helping the owner draft the DIYU-for-the-AI-age
    manifesto for {name} — {fullName.en}. Write in the OWNER'S voice; this
    prompt hands you the framing, not the finished words."
  - **CONTEXT**: academy name/fullName, course list (`- ru / en (status)`),
    and the attribution line ("Framing adapted from {source}, *{work}* —
    credit it, don't quote it.").
  - **THESIS**: each thesis point numbered, ru then en.
  - **HARD CONSTRAINTS**: attribute Kamenetz explicitly; no urgency/scarcity/
    testimonials/guru/fabricated metrics; modest sovereign tone; sole-prop,
    never nonprofit; write both Russian and English.
  - **PLACEMENT**: the `placements` list, one per line, framed as "choose
    where this lands".

No test for the script itself (mirrors S3); the implementer runs it once and
pastes the output into the task report as a smoke check.

### `diyu-thesis.test.ts` — drift-guard (env=node)

Imports the JSON (`import diyu from '../../../../diyu-thesis.json'`) and
`lintDehustle` from `../authoring/dehustle`, then asserts:

- **attribution present**: `diyu.attribution.source` contains `Kamenetz`;
  `diyu.attribution.work` contains `DIYU`.
- **thesis bilingual & non-empty**: exactly 5 points; each has a non-empty
  `ru` and `en` (trimmed length > 0) and a non-empty `id`.
- **de-hustle clean**: for every `ru` and `en` string across the thesis (and
  the attribution note), `lintDehustle(str)` returns `[]`.
- **placements non-empty**: at least one placement string.

## Testing

- Vitest (env=node) drift-guard as above.
- `npx tsc --noEmit` gate (JSON import + test types).
- Emitter smoke: `node scripts/diyu-manifesto-prompt.mjs` prints a non-empty
  prompt containing the attribution and all five thesis ids' text.

## Out of scope

- The manifesto/essay itself (owner voice — the agent writes it from the
  prompt).
- Any blog post entry or component (the owner creates it when they run the
  prompt).
- Editing `scripts/academy-manifesto-prompt.mjs` or hub `academy.positioning`.
- Any live LLM call. Any UI. Any nonprofit framing.
