import { describe, it, expect, vi } from 'vitest'
import { isCorrect, makeTracker, optionNote } from './self-check'

const item = { id: 'c1', unit: 'u1', objective: 'o1', question: 'q', options: ['a', 'b', 'c'], answer: 1, explain: 'e' }

describe('self-check logic', () => {
  it('isCorrect compares the picked index with answer', () => {
    expect(isCorrect(item, 1)).toBe(true)
    expect(isCorrect(item, 0)).toBe(false)
    expect(isCorrect(item, null)).toBe(false)
  })
  it('tracker sends once per question id, and the event carries the module', () => {
    const send = vi.fn()
    const track = makeTracker(send, '01-intro')
    track(item, false)
    track(item, true)
    track({ ...item, id: 'c2' }, true)
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, { module: '01-intro', unit: 'u1', objective: 'o1', correct: false })
  })
  it('dedup does not leak across tracker instances (one per mount)', () => {
    const send = vi.fn()
    makeTracker(send, 'm')(item, true)
    makeTracker(send, 'm')(item, false)
    expect(send).toHaveBeenCalledTimes(2)
  })
  it('optionNote: nothing before check; text markers for correct and picked-wrong (WCAG 1.4.1)', () => {
    expect(optionNote(1, item, 0, false, 'ru')).toBeNull()
    expect(optionNote(1, item, 0, true, 'ru')).toBe('— верный ответ')
    expect(optionNote(0, item, 0, true, 'ru')).toBe('— ваш ответ')
    expect(optionNote(2, item, 0, true, 'ru')).toBeNull()
    expect(optionNote(1, item, 1, true, 'en')).toBe('— correct answer')
    expect(optionNote(0, item, 0, true, 'en')).toBe('— your answer')
  })
})
