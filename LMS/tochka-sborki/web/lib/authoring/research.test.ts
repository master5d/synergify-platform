import { describe, it, expect } from 'vitest'
import { buildResearchPrompt, parseResearchNotes } from './research'
import { lintDehustle } from './dehustle'

const base = {
  courseName: 'Точка Сборки', moduleTitle: 'Знакомство',
  unitTitle: 'Пять клонов', objective: 'Понять устройство пяти AI-двойников',
}

describe('buildResearchPrompt', () => {
  it('embeds course/module/unit/objective and all five labels (ru)', () => {
    const p = buildResearchPrompt({ ...base, locale: 'ru' })
    for (const s of ['Точка Сборки', 'Знакомство', 'Пять клонов', 'Понять устройство пяти AI-двойников',
      'CONCEPTS:', 'HOOK:', 'MISCONCEPTION:', 'PRACTICE:', 'SOURCES:']) {
      expect(p).toContain(s)
    }
  })
  it('differs by locale and both are de-hustle clean', () => {
    const ru = buildResearchPrompt({ ...base, locale: 'ru' })
    const en = buildResearchPrompt({ ...base, locale: 'en' })
    expect(ru).not.toBe(en)
    expect(lintDehustle(ru)).toEqual([])
    expect(lintDehustle(en)).toEqual([])
  })
  it('names the mental/no-write constraint for the activation hook', () => {
    expect(buildResearchPrompt({ ...base, locale: 'en' })).toMatch(/write|type/i)
    expect(buildResearchPrompt({ ...base, locale: 'ru' })).toMatch(/писать|печат/i)
  })
})

const good = `CONCEPTS:
- First concept
- Second concept
HOOK: A hall of mirrors
MISCONCEPTION: That the AI decides for you
PRACTICE: Draft one prompt and run it
SOURCES:
- Some doc
- Another doc`

describe('parseResearchNotes', () => {
  it('parses a well-formed reply into structured notes', () => {
    const { notes, errors } = parseResearchNotes(good)
    expect(errors).toEqual([])
    expect(notes.concepts).toEqual(['First concept', 'Second concept'])
    expect(notes.hook).toBe('A hall of mirrors')
    expect(notes.misconception).toBe('That the AI decides for you')
    expect(notes.practice).toBe('Draft one prompt and run it')
    expect(notes.sources).toEqual(['Some doc', 'Another doc'])
  })
  it('flags a missing HOOK section', () => {
    const { errors } = parseResearchNotes(good.replace(/HOOK:.*\n/, ''))
    expect(errors.some(e => /HOOK/.test(e))).toBe(true)
  })
  it('folds de-hustle hits into errors', () => {
    const dirty = good.replace('- First concept', '- A funnel for passive income')
    const { errors } = parseResearchNotes(dirty)
    expect(errors.some(e => /passive income/.test(e))).toBe(true)
  })
})
