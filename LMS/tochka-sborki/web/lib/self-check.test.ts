import { describe, it, expect, vi } from 'vitest'
import { isCorrect, makeTracker } from './self-check'

const item = { id: 'c1', unit: 'u1', objective: 'o1', question: 'q', options: ['a', 'b'], answer: 1, explain: 'e' }

describe('self-check logic', () => {
  it('isCorrect compares the picked index with answer', () => {
    expect(isCorrect(item, 1)).toBe(true)
    expect(isCorrect(item, 0)).toBe(false)
    expect(isCorrect(item, null)).toBe(false)
  })
  it('tracker sends once per question id', () => {
    const send = vi.fn()
    const track = makeTracker(send)
    track(item, false)
    track(item, true)
    track({ ...item, id: 'c2' }, true)
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, { unit: 'u1', objective: 'o1', correct: false })
  })
  it('dedup does not leak across tracker instances (one per mount)', () => {
    const send = vi.fn()
    makeTracker(send)(item, true)
    makeTracker(send)(item, false)
    expect(send).toHaveBeenCalledTimes(2)
  })
})
