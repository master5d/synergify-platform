import { describe, it, expect } from 'vitest'
import { markCleared, isCleared } from './dungeon-store'

describe('markCleared / isCleared', () => {
  it('marks an id once and reports it cleared', () => {
    const s = { clearedIds: [] as string[] }
    const next = markCleared(s, 'dungeon:coach:s1')
    expect(isCleared(next, 'dungeon:coach:s1')).toBe(true)
  })
  it('is idempotent for a repeated id', () => {
    const s = { clearedIds: ['x'] }
    expect(markCleared(s, 'x').clearedIds).toEqual(['x'])
  })
  it('does not mutate the input', () => {
    const s = { clearedIds: [] as string[] }
    markCleared(s, 'y')
    expect(s.clearedIds).toEqual([])
  })
  it('isCleared is false for unknown id', () => {
    expect(isCleared({ clearedIds: ['a'] }, 'b')).toBe(false)
  })
})
