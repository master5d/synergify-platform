import { describe, it, expect } from 'vitest'
import { relationalStyle } from './relational-style'

describe('relationalStyle', () => {
  it('captures rhythm / error / anchor / attention', () => {
    expect(relationalStyle({ V_RHYTHM: 'fuego', V_ERR: 'soft_feedback', V_ANCHOR: 'quick_wins', V_ATTN: 'short' }))
      .toEqual({ rhythm: 'fuego', errorStyle: 'soft_feedback', anchor: 'quick_wins', attention: 'short' })
  })
  it('nulls absent fields', () => {
    expect(relationalStyle({})).toEqual({ rhythm: null, errorStyle: null, anchor: null, attention: null })
  })
})
