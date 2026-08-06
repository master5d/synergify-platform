import { describe, it, expect } from 'vitest'
import { buildLearnPrompt } from './learn-prompt'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { mentorStateAdaptation } from './mentor-persona'

const learnInput = (locale: 'ru' | 'en') => ({
  locale, moduleTitle: 'Модуль', unitIndex: 0, totalUnits: 3,
})

describe('mentorStateAdaptation threads into both prompt surfaces (no drift)', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`buildLearnPrompt includes the adaptation text (${locale})`, () => {
      expect(buildLearnPrompt(learnInput(locale))).toContain(mentorStateAdaptation(locale))
    })
    it(`buildCompanionRolePrompt (no profile) includes the adaptation text (${locale})`, () => {
      expect(buildCompanionRolePrompt(null, locale)).toContain(mentorStateAdaptation(locale))
    })
  }
})
