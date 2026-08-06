import { describe, it, expect } from 'vitest'
import { COURSE_CATALOG } from './course-catalog'

describe('COURSE_CATALOG', () => {
  it('has all 9 module slugs in order', () => {
    expect(COURSE_CATALOG.map(e => e.slug)).toEqual([
      '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection',
      '04-prompt-engineering', '05-context-memory', '06-audio-pipeline', '07-tools', '08-agent-engineering',
    ])
  })
  it('every entry has bilingual topic text', () => {
    for (const e of COURSE_CATALOG) {
      expect(e.topic.ru.length).toBeGreaterThan(0)
      expect(e.topic.en.length).toBeGreaterThan(0)
    }
  })
})
