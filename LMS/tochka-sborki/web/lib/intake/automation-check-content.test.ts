import { describe, it, expect } from 'vitest'
import { buildAutomationCheckContent } from './automation-check-content'

describe('buildAutomationCheckContent', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`returns all top-level fields for ${locale}`, () => {
      const c = buildAutomationCheckContent(locale)
      expect(c.eyebrow).toBeTruthy()
      expect(c.heading).toBeTruthy()
      expect(c.lead).toBeTruthy()
      expect(c.incomplete).toBeTruthy()
      expect(c.uncertainBuild).toBeTruthy()
      expect(c.monthUnit).toBeTruthy()
      expect(c.hourUnit).toBeTruthy()
    })

    it(`has copy for all three verdicts for ${locale}`, () => {
      const c = buildAutomationCheckContent(locale)
      for (const v of ['automate', 'partial', 'skip'] as const) {
        expect(c.verdicts[v].badge, v).toBeTruthy()
        expect(c.verdicts[v].headline, v).toBeTruthy()
        expect(c.verdicts[v].body, v).toBeTruthy()
      }
    })
  }
})
