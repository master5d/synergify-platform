import { describe, it, expect } from 'vitest'
import {
  DIGIT_LENGTHS, MIN_DELAY_MS, WORD_LENGTHS,
  isDelayedDue, normalizeItem, parseAnswer, pickSeries, scorePercent, scoreRecall,
} from './recall'
import { WORD_BANKS } from './word-banks'
import { lintDehustle } from '../authoring/dehustle'

describe('word banks (keyed by audience)', () => {
  it('adult bank is big enough for the longest series, unique, one word per locale', () => {
    const bank = WORD_BANKS.adult
    expect(bank.length).toBeGreaterThanOrEqual(Math.max(...WORD_LENGTHS))
    for (const loc of ['ru', 'en'] as const) {
      const words = bank.map(w => normalizeItem(w[loc]))
      expect(new Set(words).size, loc).toBe(words.length)
      for (const w of words) {
        expect(w, loc).toMatch(/^\S+$/)
        expect(lintDehustle(w)).toEqual([])
      }
    }
  })
})

describe('pickSeries', () => {
  it('is deterministic per seed and returns the requested length', () => {
    for (const n of WORD_LENGTHS) {
      const a = pickSeries('words', n, 42, 'ru')
      expect(a).toHaveLength(n)
      expect(pickSeries('words', n, 42, 'ru')).toEqual(a)
      expect(new Set(a).size).toBe(n)
    }
    for (const n of DIGIT_LENGTHS) {
      const d = pickSeries('digits', n, 7, 'en')
      expect(d).toHaveLength(n)
      expect(d.join('')).toMatch(/^\d+$/)
      expect(pickSeries('digits', n, 7, 'ru')).toEqual(d)
    }
  })

  it('different seeds give different series', () => {
    expect(pickSeries('words', 10, 1, 'en')).not.toEqual(pickSeries('words', 10, 2, 'en'))
    expect(pickSeries('digits', 20, 1, 'en')).not.toEqual(pickSeries('digits', 20, 2, 'en'))
  })

  it('same seed picks the same items across locales (bilingual pairs)', () => {
    const ru = pickSeries('words', 10, 5, 'ru')
    const en = pickSeries('words', 10, 5, 'en')
    const idx = (loc: 'ru' | 'en', w: string) => WORD_BANKS.adult.findIndex(b => b[loc] === w)
    expect(ru.map(w => idx('ru', w))).toEqual(en.map(w => idx('en', w)))
  })
})

describe('parseAnswer / scoreRecall', () => {
  it('parses words by spaces, commas and newlines; ё equals е', () => {
    expect(parseAnswer('words', 'Мёд, кот\nЛампа;  ')).toEqual(['мед', 'кот', 'лампа'])
  })

  it('parses digits ignoring separators', () => {
    expect(parseAnswer('digits', '31 41-59\n2')).toEqual(['3', '1', '4', '1', '5', '9', '2'])
  })

  it('counts in-order and any-order hits separately', () => {
    const s = scoreRecall(['кот', 'мост', 'лампа', 'зонт'], ['мост', 'кот', 'лампа', 'сова'])
    expect(s).toEqual({ inOrder: 1, anyOrder: 3, total: 4 })
  })

  it('does not over-count repeated answers', () => {
    expect(scoreRecall(['1', '2', '1'], ['1', '1', '1', '1']).anyOrder).toBe(2)
    expect(scoreRecall(['кот'], ['кот', 'кот', 'кот']).anyOrder).toBe(1)
  })

  it('percent uses order for digits and presence for words', () => {
    const s = { inOrder: 2, anyOrder: 8, total: 10 }
    expect(scorePercent('digits', s)).toBe(20)
    expect(scorePercent('words', s)).toBe(80)
    expect(scorePercent('words', { inOrder: 0, anyOrder: 0, total: 0 })).toBe(0)
  })
})

describe('delayed check window', () => {
  it('opens only after MIN_DELAY_MS', () => {
    expect(isDelayedDue(1000, 1000 + MIN_DELAY_MS - 1)).toBe(false)
    expect(isDelayedDue(1000, 1000 + MIN_DELAY_MS)).toBe(true)
  })
})
