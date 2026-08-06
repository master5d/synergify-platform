import { describe, it, expect } from 'vitest'
import { runAuthoringPass } from './orchestrate'
import { SAMPLE_OUTLINE } from './sample-outline'
import { SAMPLE_NOTES } from './draft'
import type { ResearchNotes } from './research'

describe('runAuthoringPass', () => {
  it('marks every unit needs-research when no notes are supplied', () => {
    const r = runAuthoringPass(SAMPLE_OUTLINE, {}, 'en')
    expect(r.outlineErrors).toEqual([])
    expect(r.units.length).toBeGreaterThan(0)
    expect(r.units.every(u => u.status === 'needs-research')).toBe(true)
    expect(r.units.every(u => u.mdx === undefined)).toBe(true)
  })

  it('surfaces outline errors', () => {
    const bad = structuredClone(SAMPLE_OUTLINE)
    bad.modules[0].title = { ru: 'Пример модуля', en: '' }
    expect(runAuthoringPass(bad, {}, 'en').outlineErrors.length).toBeGreaterThan(0)
  })

  it('drafts a unit with clean notes as ready (mdx, no findings)', () => {
    const r = runAuthoringPass(SAMPLE_OUTLINE, { '01-sample/u1-intro': SAMPLE_NOTES }, 'en')
    const u1 = r.units.find(u => u.unitSlug === 'u1-intro')!
    expect(u1.status).toBe('ready')
    expect(u1.mdx).toBeDefined()
    expect(u1.findings).toBeUndefined()
    expect(r.units.find(u => u.unitSlug === 'u2-practice')!.status).toBe('needs-research')
  })

  it('flags a unit as needs-polish when its notes trip a check', () => {
    const longHook: ResearchNotes = {
      ...SAMPLE_NOTES,
      hook: 'a very long opening image that keeps going and going with far too many words so that the activation sentence clearly exceeds the twenty five word readability maximum and must be flagged',
    }
    const r = runAuthoringPass(SAMPLE_OUTLINE, { '01-sample/u1-intro': longHook }, 'en')
    const u1 = r.units.find(u => u.unitSlug === 'u1-intro')!
    expect(u1.status).toBe('needs-polish')
    expect(u1.findings?.some(f => /long sentence/.test(f))).toBe(true)
  })
})
