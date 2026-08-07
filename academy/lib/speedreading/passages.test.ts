import { describe, it, expect } from 'vitest'
import { PASSAGES, resolvePassage, pickPassage } from './passages'
import { lintDehustle } from '../authoring/dehustle'

describe('PASSAGES', () => {
  it('has 3 passages with unique ids', () => {
    expect(PASSAGES).toHaveLength(3)
    const ids = PASSAGES.map(p => p.id)
    expect(new Set(ids).size).toBe(3)
    expect(ids).toEqual(['attention', 'memory', 'vision'])
  })
  it('each passage has >= 3 questions, each with >= 3 choices and a valid answer index', () => {
    for (const p of PASSAGES) {
      expect(p.questions.length).toBeGreaterThanOrEqual(3)
      for (const q of p.questions) {
        expect(q.choices.length).toBeGreaterThanOrEqual(3)
        expect(q.answer).toBeGreaterThanOrEqual(0)
        expect(q.answer).toBeLessThan(q.choices.length)
      }
    }
  })
  it('is de-hustle clean across text, prompts, and choices in both locales', () => {
    const strings: string[] = []
    for (const p of PASSAGES) {
      strings.push(p.text.ru, p.text.en)
      for (const q of p.questions) {
        strings.push(q.prompt.ru, q.prompt.en, ...q.choices.flatMap(c => [c.ru, c.en]))
      }
    }
    for (const s of strings) expect(lintDehustle(s)).toEqual([])
  })
})

describe('resolvePassage', () => {
  it('localizes text and questions', () => {
    const ru = resolvePassage(PASSAGES[0], 'ru')
    const en = resolvePassage(PASSAGES[0], 'en')
    expect(ru.text).not.toBe(en.text)
    expect(ru.text.length).toBeGreaterThan(0)
    expect(ru.questions[0].choices.length).toBeGreaterThanOrEqual(3)
    expect(ru.questions[0].choices[0]).not.toBe(en.questions[0].choices[0])
    expect(ru.questions[0].answer).toBe(PASSAGES[0].questions[0].answer)
  })
})

describe('pickPassage', () => {
  it('rotates by count', () => {
    expect(pickPassage(0).id).toBe(PASSAGES[0].id)
    expect(pickPassage(1).id).toBe(PASSAGES[1].id)
    expect(pickPassage(PASSAGES.length).id).toBe(pickPassage(0).id)
    expect(pickPassage(0).id).not.toBe(pickPassage(1).id)
  })
})
