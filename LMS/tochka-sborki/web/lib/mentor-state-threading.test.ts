import { describe, it, expect } from 'vitest'
import { buildLearnPrompt } from './learn-prompt'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { mentorStateAdaptation } from './mentor-persona'
import { COMPANION } from './course/companion'

const learnInput = (locale: 'ru' | 'en') => ({
  locale, moduleTitle: 'Модуль', unitIndex: 0, totalUnits: 3,
})

describe('mentorStateAdaptation threads into both prompt surfaces (no drift)', () => {
  for (const locale of ['ru', 'en'] as const) {
    // Контракт наставника включает курс (COMPANION.mentorPersona, intake LMS#16): у курса
    // практики внимания его нет намеренно — там компаньон не «держит планку» и не толкает дальше.
    it(`buildLearnPrompt threads the adaptation text iff the course enables the mentor persona (${locale})`, () => {
      const p = buildLearnPrompt(learnInput(locale))
      if (COMPANION.mentorPersona) expect(p).toContain(mentorStateAdaptation(locale))
      else expect(p).not.toContain(mentorStateAdaptation(locale))
    })
    it(`buildCompanionRolePrompt (no profile) includes the adaptation text (${locale})`, () => {
      expect(buildCompanionRolePrompt(null, locale)).toContain(mentorStateAdaptation(locale))
    })
  }
})
