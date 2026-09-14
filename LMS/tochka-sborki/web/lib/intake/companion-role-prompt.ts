// web/lib/intake/companion-role-prompt.ts
// Durable, course-wide role prompt the learner pastes ONCE into their agent's persistent
// memory (custom instructions / project / gem) so it stays a study companion across sessions.
// The memory layer; the per-unit handoff (LearnWithAI dock) is the session layer.
// Course-specific wording — which course, the loop, the laws, the boundaries — comes from the
// active course-pack (lib/course/companion → @pack), same as lib/learn-prompt.ts (intake LMS#16):
// before that a non-default course handed its learners a «Точка Сборки» mentor.
import type { Locale } from './types'
import { profileToCharter } from './charter'
import { mentorFirmness, mentorStateAdaptation } from '../mentor-persona'
import { academyCompanionLayer } from '../academy/companion'
import { COMPANION } from '../course/companion'

/**
 * Builds the standing companion role.
 * - With a profile (and a course that uses it): wraps the personalized charter (profileToCharter)
 *   in a course-wide standing role + a "remember this across all our sessions" memory directive.
 * - Otherwise (guest, or a course without the questionnaire): the course's generic standing role.
 */
export function buildCompanionRolePrompt(profile: any | null, locale: Locale): string {
  const L = locale === 'en' ? 'en' : 'ru'
  const C = COMPANION
  const S = C.standing
  const persona = C.mentorPersona ? [mentorFirmness(locale), ``, mentorStateAdaptation(locale), ``] : []
  const guardrails = C.guardrails.length ? [C.guardrailsHeading[L], ...C.guardrails.map((g) => `- ${g[L]}`), ``] : []

  if (!profile || !C.usesProfile) {
    return [
      S.heading[L],
      ``,
      S.guestRole[L],
      ``,
      S.guestLoop[L],
      ``,
      ...(S.guestLaws[L] ? [S.guestLaws[L], ``] : []),
      ...persona,
      ...guardrails,
      academyCompanionLayer(locale),
      ``,
      S.guestOpener[L],
    ].join('\n')
  }

  const charter = profileToCharter(profile, locale)
  return [
    S.heading[L],
    ``,
    S.charterRole[L],
    ``,
    charter,
    ``,
    `---`,
    ...persona,
    ...guardrails,
    academyCompanionLayer(locale),
    ``,
    S.charterClose[L],
  ].join('\n')
}
