import { describe, it, expect } from 'vitest'
import { draftLesson, validateDraftMdx, SAMPLE_NOTES, type DraftInput } from './draft'
import { lintDehustle } from './dehustle'

const base: Omit<DraftInput, 'locale'> = {
  unitTitle: 'Getting started', unitIndex: 0, moduleIndex: 0,
  objective: 'Understand why this module exists', notes: SAMPLE_NOTES,
}
const block = (mdx: string, type: string) =>
  new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`).exec(mdx)?.[1] ?? ''

describe('draftLesson', () => {
  it('emits frontmatter + the four Phase tags in order', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(mdx).toMatch(/^---\ntitle: "Getting started"/)
    const phases = [...mdx.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
    expect(phases).toEqual(['activation', 'reflection', 'concept', 'practice'])
  })
  it('weaves each note field into its phase', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(block(mdx, 'activation')).toContain(SAMPLE_NOTES.hook)
    expect(block(mdx, 'reflection')).toContain(SAMPLE_NOTES.misconception)
    expect(block(mdx, 'concept')).toContain(SAMPLE_NOTES.concepts[0])
    expect(block(mdx, 'practice')).toContain(SAMPLE_NOTES.practice)
  })
  it('keeps activation/reflection free of write/type imperatives and is de-hustle clean', () => {
    const mdx = draftLesson({ ...base, locale: 'en' })
    expect(block(mdx, 'activation')).not.toMatch(/\b(type|write)\b/i)
    expect(block(mdx, 'reflection')).not.toMatch(/\b(type|write)\b/i)
    expect(lintDehustle(mdx)).toEqual([])
  })
  it('uses localized wrappers (ru)', () => {
    const mdx = draftLesson({ ...base, locale: 'ru' })
    expect(mdx).toContain('Представь:')
    expect(mdx).toContain('Мысленно')
  })
})

describe('validateDraftMdx', () => {
  const valid = draftLesson({ ...base, locale: 'en' })
  it('accepts a well-formed draft', () => {
    expect(validateDraftMdx(valid)).toEqual([])
  })
  it('flags a missing/reordered phase', () => {
    const noReflection = valid.replace(/<Phase type="reflection">[\s\S]*?<\/Phase>\n\n/, '')
    expect(validateDraftMdx(noReflection).some(e => /phase/i.test(e))).toBe(true)
  })
  it('flags a write/type imperative in activation', () => {
    const dirty = valid.replace('Run it in your head', 'Write it down and run it')
    expect(validateDraftMdx(dirty).some(e => /activation/.test(e))).toBe(true)
  })
  it('flags a de-hustle term', () => {
    const dirty = valid.replace('Do this:', 'Do this for passive income:')
    expect(validateDraftMdx(dirty).some(e => /passive income/.test(e))).toBe(true)
  })
})
