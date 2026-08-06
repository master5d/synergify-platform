import { describe, it, expect } from 'vitest'
import { GROUP_MOVES, buildSynergemMentorPrompt } from './synergem-mentor'
import { mentorFirmness } from './mentor-persona'
import { lintDehustle } from './authoring/dehustle'

describe('GROUP_MOVES', () => {
  it('has exactly the 5 expected keys in order', () => {
    expect(GROUP_MOVES.map(m => m.key)).toEqual([
      'voices', 'friction', 'goal', 'rotate', 'graduation',
    ])
  })

  it('has unique keys', () => {
    const keys = GROUP_MOVES.map(m => m.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('is de-hustle clean across every directive, both locales', () => {
    for (const m of GROUP_MOVES) {
      expect(lintDehustle(m.directive.ru)).toEqual([])
      expect(lintDehustle(m.directive.en)).toEqual([])
    }
  })
})

describe('buildSynergemMentorPrompt', () => {
  it('returns a non-empty prompt with the header, all 5 directives, and the reused mentorFirmness', () => {
    for (const loc of ['ru', 'en'] as const) {
      const p = buildSynergemMentorPrompt(loc)
      expect(p.length).toBeGreaterThan(0)
      expect(p).toContain(loc === 'en' ? '# AI mentor for our synergem' : '# ИИ-наставник нашей синергемы')
      for (const m of GROUP_MOVES) expect(p).toContain(m.directive[loc])
      // REUSE proof: the persona text comes from mentor-persona, not a local copy
      expect(p).toContain(mentorFirmness(loc))
    }
  })

  it('localizes (ru output differs from en)', () => {
    expect(buildSynergemMentorPrompt('ru')).not.toBe(buildSynergemMentorPrompt('en'))
  })

  it('the full built prompt is de-hustle clean in both locales', () => {
    expect(lintDehustle(buildSynergemMentorPrompt('ru'))).toEqual([])
    expect(lintDehustle(buildSynergemMentorPrompt('en'))).toEqual([])
  })
})
