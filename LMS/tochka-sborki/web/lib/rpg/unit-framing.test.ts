import { describe, it, expect } from 'vitest'
import { getUnitFraming } from './unit-framing'
import type { SkinPack } from './types'

const pack = {
  skin: 'slavic-myth', zoneNames: {}, questTitles: {},
  units: {
    '04-prompt-engineering/u2-spec-formula': {
      intro: { ru: 'и', en: 'i' }, mentorHint: { ru: 'м', en: 'm' }, outro: { ru: 'о', en: 'o' },
    },
  },
} as unknown as SkinPack

describe('getUnitFraming', () => {
  it('returns the entry for a present key', () => {
    expect(getUnitFraming(pack, '04-prompt-engineering', 'u2-spec-formula')?.intro.ru).toBe('и')
  })
  it('returns null for a missing key', () => {
    expect(getUnitFraming(pack, '04-prompt-engineering', 'u9-nope')).toBeNull()
  })
  it('returns null when pack is null', () => {
    expect(getUnitFraming(null, 'm', 'u')).toBeNull()
  })
})
