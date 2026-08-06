import { describe, it, expect } from 'vitest'
import { SKINS_META, skinDecoder, skinCompanion } from './skins-meta'

describe('SKINS_META mentor personas', () => {
  it('every non-wanderer skin has a named mentor with a glyph', () => {
    for (const [skin, meta] of Object.entries(SKINS_META)) {
      if (skin === 'wanderer') continue
      expect(meta.mentor?.name.ru.length ?? 0).toBeGreaterThan(0)
      expect(meta.mentor?.name.en.length ?? 0).toBeGreaterThan(0)
      expect(meta.mentor?.glyph.length ?? 0).toBeGreaterThan(0)
    }
  })
})

describe('SKINS_META companions (familiars / «Machine Elves»)', () => {
  it('every skin has a companion with name, glyph, and vibe in both locales', () => {
    for (const [skin, meta] of Object.entries(SKINS_META)) {
      const c = meta.companion
      expect(c, `companion ${skin}`).toBeTruthy()
      expect(c!.name.ru.length, `name.ru ${skin}`).toBeGreaterThan(0)
      expect(c!.name.en.length, `name.en ${skin}`).toBeGreaterThan(0)
      expect(c!.glyph.length, `glyph ${skin}`).toBeGreaterThan(0)
      expect(c!.vibe.ru.length, `vibe.ru ${skin}`).toBeGreaterThan(0)
      expect(c!.vibe.en.length, `vibe.en ${skin}`).toBeGreaterThan(0)
    }
  })

  it('skinCompanion renders a non-empty line per skin and locale', () => {
    for (const skin of Object.keys(SKINS_META) as (keyof typeof SKINS_META)[]) {
      expect(skinCompanion(skin, 'ru')?.length ?? 0, `ru ${skin}`).toBeGreaterThan(10)
      expect(skinCompanion(skin, 'en')?.length ?? 0, `en ${skin}`).toBeGreaterThan(10)
    }
  })
})

const SKINS = Object.keys(SKINS_META) as (keyof typeof SKINS_META)[]

describe('skinDecoder', () => {
  it('возвращает непустую строку для каждого скина в обоих локалях', () => {
    for (const s of SKINS) {
      expect(skinDecoder(s, 'ru').length, `ru ${s}`).toBeGreaterThan(10)
      expect(skinDecoder(s, 'en').length, `en ${s}`).toBeGreaterThan(10)
    }
  })
  it('каждый из 8 скинов имеет явный decoder (не fallback)', () => {
    for (const s of SKINS) {
      expect(SKINS_META[s].decoder, `decoder ${s}`).toBeTruthy()
    }
  })
  it('даёт непустой fallback, если decoder отсутствует', () => {
    const meta = { ...SKINS_META['wanderer'], decoder: undefined }
    const orig = SKINS_META['wanderer'].decoder
    ;(SKINS_META as any)['wanderer'].decoder = undefined
    expect(skinDecoder('wanderer', 'ru').length).toBeGreaterThan(10)
    ;(SKINS_META as any)['wanderer'].decoder = orig
  })
})
