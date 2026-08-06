import { describe, it, expect } from 'vitest'
import { dailySeed, pick } from './seed'

describe('dailySeed', () => {
  it('is stable for the same key + date', () => {
    expect(dailySeed('slavic-myth', '2026-05-24')).toBe(dailySeed('slavic-myth', '2026-05-24'))
  })
  it('differs across dates', () => {
    expect(dailySeed('slavic-myth', '2026-05-24')).not.toBe(dailySeed('slavic-myth', '2026-05-25'))
  })
  it('differs across keys', () => {
    expect(dailySeed('a', '2026-05-24')).not.toBe(dailySeed('b', '2026-05-24'))
  })
})

describe('pick', () => {
  const items = ['00', '01', '02', '03', '04']
  it('returns n items for n <= length', () => {
    expect(pick(items, 123, 2)).toHaveLength(2)
  })
  it('returns all items (copy) when n >= length', () => {
    const out = pick(items, 123, 10)
    expect(out).toHaveLength(5)
    expect(out).not.toBe(items)
  })
  it('is deterministic for the same seed', () => {
    expect(pick(items, 999, 3)).toEqual(pick(items, 999, 3))
  })
  it('only returns items from the input set', () => {
    for (const x of pick(items, 7, 3)) expect(items).toContain(x)
  })
})
