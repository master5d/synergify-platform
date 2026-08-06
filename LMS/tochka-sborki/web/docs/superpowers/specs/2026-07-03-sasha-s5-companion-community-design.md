# S.A.S.H.A — S5 (FINAL): cross-course companion + academy synergems (fb_1319cb1286a9)

**Ticket:** `fb_1319cb1286a9` (S.A.S.H.A #5), **final slice 5/5** of umbrella epic `fb_fcf7617373f4`. On ship: mark #5 done AND close the umbrella (all five sub-tickets shipped).

## Decisions (design gate)

1. **Scope = companion academy-layer + synergems academy-reframe.** No community backend/matching (dormant Синергема cluster territory), no learn-prompt (session-layer) change — the academy frame is a MEMORY-layer concern (the standing role the learner pastes once).
2. **Honest triage finding:** alumni/synergems opt-in is already user-level (`users.alumni_optin`) — the directory is academy-wide by construction; only the COPY says "course synergems". The companion role prompt is the real per-course artifact (`const COURSE = 'Точка Сборки'`, memory directive scoped to the course).
3. **Registry-driven identity:** the academy name comes from `REGISTRY.academy.name` (S1) — no hardcoded 'S.A.S.H.A' in builders.

## Context (grep-before-build)

- `lib/intake/companion-role-prompt.ts`: `buildCompanionRolePrompt(profile, locale)` — 4 string arrays (guest ru / guest en / profile ru / profile en), each threading `mentorFirmness(locale)` + blank + `mentorStateAdaptation(locale)` before a closing line. `Locale` from `./types` (same `'ru' | 'en'`). `const COURSE = 'Точка Сборки'` stays — the course remains the entry context; the academy becomes the frame.
- Threading precedent: `mentorStateAdaptation` (fb_c3471241279e) + binding drift-guard `lib/mentor-state-threading.test.ts` — mirror it.
- `lib/academy/registry.ts` (S1): `REGISTRY`, `AcademyRegistry`; `Locale` from `@/lib/dictionaries`.
- `components/alumni-client.tsx`: inline bilingual `t` object; en `optinLabel: 'List me in the course synergems'`, ru `optinLabel: 'Показывать меня в синергемах курса'`; `sub` copy carries the synergem framing; strict opt-in, email never shown (keep).
- Peer-learning sources (from the ticket's triage): YB Methodology «every student is a teacher and every teacher is a student» (teach-to-learn); Edupunks PLN «you are a contributor, not a consumer».

## Architecture

### 1. `lib/academy/companion.ts` — academy layer for the standing companion role

```ts
// web/lib/academy/companion.ts
// Academy layer of the standing companion role (S.A.S.H.A S5): the companion belongs
// to the academy, not to one course — the role and its memory survive course switches.
// Registry-driven (academy name from LMS/registry.json); peer-learning principles as data.
import type { Locale } from '@/lib/dictionaries'
import { REGISTRY, type AcademyRegistry } from './registry'

export interface PeerPrinciple {
  key: 'teach-to-learn' | 'contributor-not-consumer'
  directive: { ru: string; en: string }
}

export const PEER_PRINCIPLES: PeerPrinciple[] = [
  {
    key: 'teach-to-learn',
    directive: {
      ru: 'Регулярно проси меня объяснить выученное своими словами — объяснение другому лучший тест понимания.',
      en: 'Regularly ask me to explain what I learned in my own words — teaching it back is the best test of understanding.',
    },
  },
  {
    key: 'contributor-not-consumer',
    directive: {
      ru: 'Подталкивай меня делиться наработками с сообществом учеников: я вкладчик, не потребитель.',
      en: 'Nudge me to share what I build with the learner community: I am a contributor, not a consumer.',
    },
  },
]

export function academyCompanionLayer(locale: Locale, r: AcademyRegistry = REGISTRY): string {
  const ru = locale !== 'en'
  const name = r.academy.name
  const head = ru
    ? `Этот курс — часть академии ${name}. Твоя роль — спутник академии, не одного курса: если я перейду на другой курс академии, роль и память сохраняются.`
    : `This course is part of the ${name} academy. Your role belongs to the academy, not to a single course: if I move to another academy course, the role and the memory carry over.`
  const lines = PEER_PRINCIPLES.map(p => `- ${ru ? p.directive.ru : p.directive.en}`)
  return [head, ...lines].join('\n')
}
```

Unit tests (`lib/academy/companion.test.ts`): contains the registry academy name (`S.A.S.H.A`); honors an overridden registry (custom `r` with another name); ru↔en differ; both principle directives present in both locales; de-hustle guard (`/скидк|осталось всего|только сегодня|отзыв|testimonial|discount|hurry|limited/i` never matches either locale's output).

### 2. Threading into `buildCompanionRolePrompt`

In ALL FOUR arrays (guest ru/en, profile ru/en): insert `academyCompanionLayer(locale)` + blank line directly AFTER the `mentorStateAdaptation(locale)` + blank pair (before each closing line). Import joins the existing imports. `COURSE` const untouched.

Binding drift-guard (`lib/academy-companion-threading.test.ts`, mirrors `mentor-state-threading.test.ts`): for both locales × both branches (null profile + minimal fake profile), the built prompt contains the academy name and both principle directives; the source of `companion-role-prompt.ts` contains the `academyCompanionLayer` import and 4 call sites (or ≥1 call verified per-branch via outputs — output assertions are primary).

### 3. Synergems academy-reframe (`components/alumni-client.tsx`, copy only)

- en: `optinLabel` → `'List me in the academy synergems'`; append to `sub`: `' Every learner here is also a teacher — sharing what you learn is how the synergem grows.'`
- ru: `optinLabel` → `'Показывать меня в синергемах академии'`; append to `sub`: `' Каждый ученик здесь — ещё и учитель: делясь тем, что осваиваешь, ты растишь синергему.'`
- Nothing else changes (opt-in mechanics, privacy line, empty/invite copy stay).

Drift-guard (`components/alumni-client.test.ts`, source-reading): no `/course synergems|синергемах курса/` literal; contains `academy synergems` and `синергемах академии`; contains the teach-to-learn line in both locales; still contains the privacy sentence (`email` never shown) — guard against accidental deletion.

### 4. Epic close (ops at ship)

`fb_1319cb1286a9` → done; umbrella `fb_fcf7617373f4` → done (S1 registry, S2 catalog/switcher, S3 landing, S4 admission, S5 companion/community all shipped).

## Authenticity / values

Peer-learning principles are directives to the learner's OWN agent (sovereign prompt-paste — no backend, no tracking of who "teaches"). Copy reframe states what is already true (the directory is user-level). De-hustle guard on the new builder output; alumni privacy line protected by test.

## Scope

- `lib/academy/companion.ts` (+test), `lib/intake/companion-role-prompt.ts` (threading), `lib/academy-companion-threading.test.ts`, `components/alumni-client.tsx` (copy) + `components/alumni-client.test.ts`. All in `LMS/tochka-sborki/web`.
- **Out of scope:** community backend/matching, learn-prompt session layer, workers/hub changes, dictionary changes (alumni copy is inline in the component — follow the file's existing pattern).

## Backward compatibility

Additive builder + threading (prompt grows by one block); copy-only component change; no API/schema/dep changes.

## Task decomposition (for the plan)

1. `lib/academy/companion.ts` + unit tests (TDD).
2. Threading into all 4 branches + binding drift-guard (TDD).
3. Alumni copy reframe + drift-guard; full gates (suite/tsc/build).
