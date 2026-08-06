import { describe, it, expect } from 'vitest'
import { buildIntakeGateContent } from './intake-gate-content'

describe('buildIntakeGateContent', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`returns all fields for ${locale}`, () => {
      const c = buildIntakeGateContent(locale)
      expect(c.eyebrow).toBeTruthy()
      expect(c.title).toBeTruthy()
      expect(c.lead).toBeTruthy()
      expect(c.keep).toBeTruthy()
      expect(c.frame).toBeTruthy()
      expect(c.enterLabel).toBeTruthy()
      expect(c.moreLabel).toBeTruthy()
      expect(c.beforeLabel).toBeTruthy()
      expect(c.afterLabel).toBeTruthy()
    })

    it(`has exactly 3 chat→system rows for ${locale}`, () => {
      const c = buildIntakeGateContent(locale)
      expect(c.rows).toHaveLength(3)
      for (const r of c.rows) {
        expect(r.before).toBeTruthy()
        expect(r.after).toBeTruthy()
      }
    })
  }

  it('secondary link points to locale-correct landing', () => {
    expect(buildIntakeGateContent('ru').moreHref).toBe('/')
    expect(buildIntakeGateContent('en').moreHref).toBe('/en')
  })
})
