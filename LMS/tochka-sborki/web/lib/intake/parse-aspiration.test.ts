import { describe, it, expect } from 'vitest'
import { parseAspiration } from './parse-aspiration'

describe('parseAspiration', () => {
  it('reads G11 from an object answers field', () => {
    expect(parseAspiration({ answers: { G11: 'Ada Lovelace' } })).toBe('Ada Lovelace')
  })
  it('reads G11 from a JSON-string answers field', () => {
    expect(parseAspiration({ answers: JSON.stringify({ G11: 'Ada Lovelace' }) })).toBe('Ada Lovelace')
  })
  it('returns null when G11 is missing, empty, or non-string', () => {
    expect(parseAspiration({ answers: { G11: '  ' } })).toBeNull()
    expect(parseAspiration({ answers: {} })).toBeNull()
    expect(parseAspiration(null)).toBeNull()
    expect(parseAspiration({ answers: 'not json' })).toBeNull()
  })
})
