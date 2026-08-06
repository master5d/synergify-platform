import { describe, it, expect } from 'vitest'
import { ATTRIBUTES } from './attributes'

describe('ATTRIBUTES', () => {
  it('has all 6 attributes with ru+en names, meanings, max', () => {
    const codes = ATTRIBUTES.map(a => a.code)
    expect(codes).toEqual(['INT', 'WIS', 'CON', 'DEX', 'CHA', 'STR'])
    for (const a of ATTRIBUTES) {
      expect(a.name.ru).toBeTruthy()
      expect(a.name.en).toBeTruthy()
      expect(a.meaning.ru).toBeTruthy()
      expect(a.max).toBeGreaterThan(0)
    }
  })
  it('uses the agreed russified names', () => {
    const int = ATTRIBUTES.find(a => a.code === 'INT')!
    expect(int.name.ru).toBe('Тех-разум')
    expect(int.max).toBe(30)
  })
})
