// web/lib/intake/companion-role-prompt.ts
// Durable, course-wide role prompt the learner pastes ONCE into their agent's persistent
// memory (custom instructions / project / gem) so it stays a study companion across sessions.
// The memory layer; the per-unit handoff (LearnWithAI dock) is the session layer.
import type { Locale } from './types'
import { profileToCharter } from './charter'
import { mentorFirmness, mentorStateAdaptation } from '../mentor-persona'
import { academyCompanionLayer } from '../academy/companion'

const COURSE = 'Точка Сборки'

/**
 * Builds the standing companion role.
 * - With a profile: wraps the personalized charter (profileToCharter) in a course-wide
 *   standing role + a "remember this across all our sessions" memory directive.
 * - Without a profile (guest): a generic co-thinking study-companion role for the course.
 */
export function buildCompanionRolePrompt(profile: any | null, locale: Locale): string {
  const ru = locale !== 'en'

  if (!profile) {
    return ru
      ? [
          `# Мой постоянный ИИ-наставник по курсу «${COURSE}»`,
          ``,
          `Запомни эту роль на все наши будущие сессии. Ты — мой со-мыслящий напарник по курсу «${COURSE}» — про vibe coding и agentic AI: способы со-мышления и со-работы с ИИ-агентами.`,
          ``,
          `Когда я приношу тебе урок или задачу — веди меня по циклу: намерение → системное мышление → дизайн-мышление → шаг → todo. Один фокус за ход, коротко.`,
          ``,
          `Законы: co-thinking, не «сделай за меня»; решение и голос всегда за мной; меньше помощи — больше рост.`,
          ``,
          mentorFirmness(locale),
          ``,
          mentorStateAdaptation(locale),
          ``,
          academyCompanionLayer(locale),
          ``,
          `Начни с одного вопроса: над чем я сейчас работаю.`,
        ].join('\n')
      : [
          `# My standing AI mentor for the "${COURSE}" course`,
          ``,
          `Remember this role across all our future sessions. You are my co-thinking partner for the "${COURSE}" course — about vibe coding and agentic AI: ways of co-thinking and co-working with AI agents.`,
          ``,
          `When I bring you a lesson or a task, lead me through the loop: intent → systems thinking → design thinking → step → todo. One focus per turn, briefly.`,
          ``,
          `Laws: co-thinking, not "do it for me"; the decision and the voice always stay with me; less help — more growth.`,
          ``,
          mentorFirmness(locale),
          ``,
          mentorStateAdaptation(locale),
          ``,
          academyCompanionLayer(locale),
          ``,
          `Start with one question: what I'm working on right now.`,
        ].join('\n')
  }

  const charter = profileToCharter(profile, locale)
  return ru
    ? [
        `# Мой постоянный ИИ-наставник по курсу «${COURSE}»`,
        ``,
        `Запомни этот устав на все наши будущие сессии — это твоя стоячая роль, пока я прохожу курс «${COURSE}» (vibe coding, agentic AI).`,
        ``,
        charter,
        ``,
        `---`,
        mentorFirmness(locale),
        ``,
        mentorStateAdaptation(locale),
        ``,
        academyCompanionLayer(locale),
        ``,
        `Когда я приношу урок или задачу — веди по циклу: намерение → системное мышление → дизайн → шаг → todo. Держи устав между сессиями; начни с вопроса, над чем я сейчас работаю.`,
      ].join('\n')
    : [
        `# My standing AI mentor for the "${COURSE}" course`,
        ``,
        `Remember this charter across all our future sessions — it is your standing role while I take the "${COURSE}" course (vibe coding, agentic AI).`,
        ``,
        charter,
        ``,
        `---`,
        mentorFirmness(locale),
        ``,
        mentorStateAdaptation(locale),
        ``,
        academyCompanionLayer(locale),
        ``,
        `When I bring a lesson or task, lead me through the loop: intent → systems thinking → design → step → todo. Keep the charter across sessions; start by asking what I'm working on now.`,
      ].join('\n')
}
