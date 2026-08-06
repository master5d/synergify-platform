# AI-mentor state-adaptation — design (fb_c3471241279e, engine-half)

**Ticket:** `fb_c3471241279e` — Live-facilitation playbook: 3 T's (Tone / Tempo / Take a breath) + challenging-learner archetypes (Talkative / Cynical / Disengaged / Quiet), reverse-engineered from Google's Facilitation Bootcamp deck. Two uses: (a) a human-facilitator guide for live offline/cohort events (ties to events calendar `fb_8d2e32ce`); (b) inform the AI-mentor / learn-with-AI layer so it adapts to learner states.

**This slice = engine-half (b) only.** The human-facilitator guide (a) is deferred to its own content ticket. Decided at the design gate.

## Goal

Teach the learn-with-AI mentor to read the learner's *state* and adapt — the 3 T's and the four challenging-learner archetypes reframed from a live-room facilitation deck to 1:1 text mentoring — as a single source of truth that flows into both prompt surfaces without drift.

## Context (audit — grep-before-build)

- **`lib/mentor-persona.ts`** is the established single source of truth for the mentor's warm-but-firm, anti-sycophancy voice. Its file header states its purpose verbatim: *"Imported by both prompt builders (learn-prompt.ts session layer + intake/companion-role-prompt.ts memory layer) so the persona can't drift between surfaces."* It currently exports `mentorFirmness(locale)` (full contract) and `mentorFirmnessCompact(locale)` (a ~30–45 char clause for the space-capped bootstrap deep-link). It is tiny (~20 lines) and is the correct home for new persona guidance.
- **`lib/learn-prompt.ts`** `buildLearnPrompt(i)` includes `mentorFirmness(i.locale)` in both the `ru` and `en` `lines` arrays. It also has `buildBootstrapDeepLink` which uses `mentorFirmnessCompact` (space-capped).
- **`lib/intake/companion-role-prompt.ts`** `buildCompanionRolePrompt(profile, locale)` includes `mentorFirmness(locale)` in all four branches: no-profile × {ru, en} and with-profile × {ru, en}.
- **`lib/mentor-persona.test.ts`** asserts the firmness contract is non-empty, bilingual, warm (not cold), and that compact ≠ full. New tests mirror this style.
- Both builders are pure string assembly (no I/O), unit-tested style consistent with the rest of `lib/`.

## Architecture

### 1. `lib/mentor-persona.ts` — new keyed-data export

Add a sibling to `mentorFirmness`, built engine+keyed-data style so the multi-item content is testable rather than a single opaque literal:

```ts
interface Bi { ru: string; en: string }
interface StatePlay { key: string; cue: Bi; tactic: Bi }

const LEARNER_STATES: StatePlay[] = [ /* 4 archetypes, reframed for 1:1 (below) */ ]
export const LEARNER_STATE_KEYS = ['over_eager', 'cynical', 'disengaged', 'quiet'] as const

export function mentorStateAdaptation(locale: Locale): string
```

`mentorStateAdaptation` renders the 3 T's + the four `LEARNER_STATES` into one compact, warm-firm paragraph suitable for inclusion in a system prompt. It defers tone to `mentorFirmness` (no duplication of the anti-flattery contract).

**3 T's, reframed for 1:1 text mentoring:**
- **Tone** — stay warm-firm whatever the learner's state (this is the existing firmness contract; the adaptation references it rather than restating it).
- **Tempo** — match the learner's pace; one step at a time, don't dump everything at once.
- **Take a breath** — leave space; don't rush; let the learner think before filling the silence.

**Four archetypes (cue → tactic), reframed live-room → 1:1:**

| live deck | 1:1 cue | tactic |
|---|---|---|
| Talkative | over-asks / wants the answer handed over | redirect to their own thinking; ask before telling |
| Cynical | "this won't work for me" | meet with concrete evidence + a small win; don't argue or over-sell |
| Disengaged | drifting, low energy | shrink the step, reconnect to their stated goal; gentle check-in, no guilt |
| Quiet | under-shares | draw out with one specific, low-pressure prompt; don't answer for them |

The `cue`/`tactic` text is authored bilingually in `LEARNER_STATES`; the rendered paragraph keeps the warm-firm register and is one focus per state, terse.

### 2. Thread into both *full* prompt builders

- `lib/learn-prompt.ts` `buildLearnPrompt` — add `mentorStateAdaptation(i.locale)` to both the `ru` and `en` `lines` arrays, immediately after the existing `mentorFirmness(i.locale)` entry (with a blank-line separator entry, matching the surrounding array style).
- `lib/intake/companion-role-prompt.ts` `buildCompanionRolePrompt` — add `mentorStateAdaptation(locale)` immediately after `mentorFirmness(locale)` in all four branches (no-profile ru/en, with-profile ru/en), matching each branch's array/join style.
- **Not** `buildBootstrapDeepLink` / `mentorFirmnessCompact` — that line is space-capped; adding state guidance there is out of scope (YAGNI).

### 3. Tests

- **`lib/mentor-persona.test.ts`** (extend):
  - `mentorStateAdaptation` returns non-empty, distinct strings for `ru` and `en`.
  - Output contains a marker for each of the 3 T's (tempo/pace marker, breath/space marker — tone is the firmness contract) and a marker for each archetype tactic (e.g. evidence for cynical, smaller-step for disengaged, draw-out for quiet, redirect-to-thinking for over-eager) — in both locales.
  - Warm-firm register preserved: no shaming/cold markers; the existing firmness tests still pass unchanged.
  - `LEARNER_STATES` data integrity: exactly the 4 `LEARNER_STATE_KEYS`, each with non-empty `cue.ru/en` and `tactic.ru/en`.
- **Drift-guard (binding, the key cross-surface test):** assert that `buildLearnPrompt(<minimal input>)` AND `buildCompanionRolePrompt(null, locale)` outputs both *contain* a stable substring from `mentorStateAdaptation(locale)`, for both locales. This enforces the file-header invariant ("can't drift between surfaces") the same way `mentorFirmness` is implicitly relied upon. Place these wherever the respective builder's existing tests live (or add a focused test file if none).
- Full Vitest suite + `npm run build` green, no regression.

## Authenticity / values

Warm-firm, de-guru, no manipulation. The adaptation serves the learner's thinking and never pressures or upsells: **cynical → evidence, not persuasion; disengaged → a smaller step, not guilt; quiet → an invitation, not pressure; over-eager → redirect to their own thinking, not hand over answers.** Consistent with the course's sacred constraints (co-thinking not do-it-for-me; decision and voice stay with the learner; less help, more growth).

## Scope

- Single app: `LMS/tochka-sborki/web/`. `lms_target: engine`.
- **Out of scope:** the human-facilitator guide (deferred to its own content ticket; ties to events `fb_8d2e32ce`), the compact bootstrap deep-link line, any UI, live-event tooling, and any change to `mentorFirmness` itself.

## Backward compatibility

Additive only: one new export + new `LEARNER_STATES` data + six insertion points across two builders. The existing `mentorFirmness`/`mentorFirmnessCompact` exports and all current prompt text are unchanged; outputs only gain the new adaptation paragraph. No new dependencies.

## Task decomposition (for the plan)

1. `lib/mentor-persona.ts`: add `Bi`/`StatePlay` types, `LEARNER_STATES` data, `LEARNER_STATE_KEYS`, and `mentorStateAdaptation(locale)` renderer + extend `mentor-persona.test.ts` (TDD: data integrity + per-T + per-archetype markers + bilingual/distinct + warm-firm preserved).
2. Thread `mentorStateAdaptation` into `buildLearnPrompt` (ru + en) and `buildCompanionRolePrompt` (4 branches) + the binding drift-guard test that both builder outputs contain the adaptation text; full suite + build green.
