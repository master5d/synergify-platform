import { describe, it, expect } from 'vitest'
import { lintReadability, buildPolishPrompt } from './review'
import { draftLesson, SAMPLE_NOTES } from './draft'
import { lintDehustle } from './dehustle'

const clean = draftLesson({
  unitTitle: 'Getting started', unitIndex: 0, moduleIndex: 0,
  objective: 'Understand why this module exists', notes: SAMPLE_NOTES, locale: 'en',
})
const LONG = 'This is an intentionally very long sentence that keeps going and going with many many extra words so that it clearly exceeds the twenty five word maximum threshold set by the readability lint today'

describe('lintReadability', () => {
  it('passes a clean S3 draft', () => {
    expect(lintReadability(clean)).toEqual([])
  })
  it('flags a long sentence in a phase', () => {
    const dirty = clean.replace('Run it in your head — where have you met this before?', LONG + '.')
    expect(lintReadability(dirty).some(e => /long sentence/.test(e))).toBe(true)
  })
  it('flags a leftover TODO in a phase body', () => {
    const dirty = clean.replace('Do this:', 'TODO: Do this:')
    expect(lintReadability(dirty).some(e => /leftover TODO/.test(e))).toBe(true)
  })
  it('flags a too-vague practice step', () => {
    const dirty = clean.replace('Do this: name one real task you want this module to help you finish', 'Do this: go')
    expect(lintReadability(dirty).some(e => /too vague/.test(e))).toBe(true)
  })
})

describe('buildPolishPrompt', () => {
  const findings = ['activation: long sentence (30 words)']
  it('embeds the draft, findings, and constraints (en)', () => {
    const p = buildPolishPrompt(clean, findings, 'en')
    expect(p).toContain('--- DRAFT ---')
    expect(p).toContain('Getting started')
    expect(p).toContain('activation: long sentence (30 words)')
    expect(p).toMatch(/under 25 words/)
    expect(p).toMatch(/activation.*reflection.*concept.*practice/)
    expect(p).toMatch(/mental/)
    expect(p).toMatch(/no selling/)
  })
  it('differs by locale and both are de-hustle clean', () => {
    const en = buildPolishPrompt(clean, findings, 'en')
    const ru = buildPolishPrompt(clean, findings, 'ru')
    expect(en).not.toBe(ru)
    expect(lintDehustle(en)).toEqual([])
    expect(lintDehustle(ru)).toEqual([])
  })
  it('carries the clarity-first guardrail in both locales (fb_a1a446f5)', () => {
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'en')).toContain('clarity comes first')
    expect(buildPolishPrompt('<Phase type="activation">x</Phase>', [], 'ru')).toContain('ясность первична')
  })
})
