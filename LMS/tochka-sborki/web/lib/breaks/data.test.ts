import { describe, it, expect } from 'vitest'
import { BREAKS, resolveBreaks } from './data'
import type { BreakActivity } from './types'

const sample: BreakActivity[] = [
  { kind: 'passive', key: 'breathe', title: { ru: 'Пауза', en: 'Pause' }, prompt: { ru: 'Сделай вдох', en: 'Take a breath' } },
  { kind: 'passive', key: 'look', title: { ru: 'Взгляд', en: 'Look' }, prompt: { ru: 'Посмотри вдаль', en: 'Look far' }, cta: { ru: 'Дальше', en: 'Onward' } },
]

const puzzle: BreakActivity = {
  kind: 'puzzle',
  key: 'glass',
  title: { ru: 'Паззл', en: 'Puzzle' },
  question: { ru: 'Какой стакан наполнится первым?', en: 'Which glass fills first?' },
  choices: [
    { ru: 'Первый', en: 'First' },
    { ru: 'Третий', en: 'Third' },
  ],
  answer: 1,
  reveal: { ru: 'Труба к третьему открыта', en: 'The pipe to the third is open' },
}

describe('resolveBreaks', () => {
  // Модуль зажжён 2026-08-02: BREAKS больше не пуст, поэтому гвард сторожит не
  // «темноту», а целостность живого содержимого.
  it('ships a non-empty catalogue resolvable in both locales', () => {
    expect(BREAKS.length).toBeGreaterThan(0)
    expect(resolveBreaks('ru')).toHaveLength(BREAKS.length)
    expect(resolveBreaks('en')).toHaveLength(BREAKS.length)
  })

  it('keys are unique', () => {
    const keys = BREAKS.map((b) => b.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('every puzzle answer points at a real choice, and both locales are filled', () => {
    for (const b of BREAKS) {
      if (b.kind !== 'puzzle') continue
      expect(b.choices.length).toBeGreaterThanOrEqual(2)
      expect(b.answer).toBeGreaterThanOrEqual(0)
      expect(b.answer).toBeLessThan(b.choices.length)
      for (const c of b.choices) {
        expect(c.ru.trim().length).toBeGreaterThan(0)
        expect(c.en.trim().length).toBeGreaterThan(0)
      }
      expect(b.reveal.ru.trim().length).toBeGreaterThan(0)
      expect(b.reveal.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('passive cards carry a prompt in both locales', () => {
    for (const b of BREAKS) {
      if (b.kind !== 'passive') continue
      expect(b.prompt.ru.trim().length).toBeGreaterThan(0)
      expect(b.prompt.en.trim().length).toBeGreaterThan(0)
    }
  })

  // Пауза не должна превращаться в экзамен: пассивные карточки разбавляют вопросы.
  it('mixes passive cards into the run so questions never stack too deep', () => {
    let streak = 0
    for (const b of BREAKS) {
      streak = b.kind === 'puzzle' ? streak + 1 : 0
      expect(streak).toBeLessThanOrEqual(3)
    }
    expect(BREAKS.some((b) => b.kind === 'passive')).toBe(true)
  })

  it('maps passive Bi fields to the active locale', () => {
    expect(resolveBreaks('en', sample)[0]).toEqual({
      kind: 'passive', key: 'breathe', title: 'Pause', prompt: 'Take a breath', cta: 'Continue',
    })
    const ru0 = resolveBreaks('ru', sample)[0]
    expect(ru0.title).toBe('Пауза')
    expect(ru0.kind === 'passive' && ru0.prompt).toBe('Сделай вдох')
  })

  it('applies default cta only when cta is omitted (passive)', () => {
    const r = resolveBreaks('ru', sample)
    expect(r[0].cta).toBe('Продолжить') // omitted -> locale default
    expect(r[1].cta).toBe('Дальше')     // provided -> used verbatim
  })

  it('resolves a puzzle activity: localized question/choices/reveal, answer index preserved', () => {
    const r = resolveBreaks('en', [puzzle])[0]
    expect(r).toEqual({
      kind: 'puzzle',
      key: 'glass',
      title: 'Puzzle',
      question: 'Which glass fills first?',
      choices: ['First', 'Third'],
      answer: 1,
      reveal: 'The pipe to the third is open',
      cta: 'Continue',
    })
    const ru = resolveBreaks('ru', [puzzle])[0]
    expect(ru.kind === 'puzzle' && ru.choices).toEqual(['Первый', 'Третий'])
    expect(ru.kind === 'puzzle' && ru.question).toBe('Какой стакан наполнится первым?')
    expect(ru.cta).toBe('Продолжить')
  })

  it('resolves a mixed source by kind', () => {
    const r = resolveBreaks('en', [sample[0], puzzle])
    expect(r[0].kind).toBe('passive')
    expect(r[1].kind).toBe('puzzle')
  })
})
