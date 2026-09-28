import { describe, it, expect } from 'vitest'
import { draftLesson, validateDraftMdx, hasWriteTypeImperative, SAMPLE_NOTES, type DraftInput } from './draft'
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
  it('does not flag write/type inside quotes, code or descriptive use (EN false positives, wave 18)', () => {
    // 01-introduction/u2-four-shifts (activation): quoted prompt
    const quoted = valid.replace('Run it in your head', 'Think of a task you handed to AI — say, "write me an Instagram post."')
    // 07-tools/u5-practice (reflection): descriptive past
    const descriptive = valid.replace('Run it in your head', 'Module 04: learned to write prompts.')
    // 08-agent-engineering/u4-production-infra (activation): descriptive inside a quote
    const infra = valid.replace('Run it in your head', `Don't picture this as "code you still need to write" — picture it as the city's grid.`)
    for (const mdx of [quoted, descriptive, infra]) expect(validateDraftMdx(mdx)).toEqual([])
  })
  it('flags real write/type directives but not quoted/code/blockquote ones', () => {
    expect(hasWriteTypeImperative('Write down three tasks you did today.')).toBe(true)
    expect(hasWriteTypeImperative('Pause, then type the command into the terminal.')).toBe(true)
    expect(hasWriteTypeImperative('Open the chat and write your first prompt.')).toBe(true)
    expect(hasWriteTypeImperative('- Type "hello" in the box.')).toBe(true)
    expect(hasWriteTypeImperative('Вспомни задачу и запиши её на листке.')).toBe(true)
    expect(hasWriteTypeImperative('Напиши три слова.')).toBe(true)
    expect(hasWriteTypeImperative('Before: `Write a function`')).toBe(false)
    expect(hasWriteTypeImperative('> Write it down — someone else said so.')).toBe(false)
    expect(hasWriteTypeImperative('Он сказал: «напиши мне пост».')).toBe(false)
    expect(hasWriteTypeImperative('What type of task was it?')).toBe(false)
  })
  it('flags a de-hustle term', () => {
    const dirty = valid.replace('Do this:', 'Do this for passive income:')
    expect(validateDraftMdx(dirty).some(e => /passive income/.test(e))).toBe(true)
  })
})
