import { describe, it, expect } from 'vitest'
import { scoreProfileV2 } from './scoring-v2'

const core = {
  V_WHY: 'project', V_HOOK: 'build', V_NICHE: 'coach', V_RHYTHM: 'fuego',
  V_ERR: 'calm', V_ATTN: 'mid', V_MODE: 'game', V_ANCHOR: 'quick_wins',
  V_SKIN: 'cyber-noir', V_OS: 'mac', V_MBTI_SR: 'ENFP',
}

describe('scoreProfileV2', () => {
  it('maps direct fields from the core', () => {
    const s = scoreProfileV2(core, 'ru')
    expect(s.niche).toBe('coach')
    expect(s.worldSkin).toBe('cyber-noir')
    expect(s.worldSkinSource).toBe('v2')
    expect(s.os).toBe('mac')
    expect(s.cogTier).toBe(2)
    expect(s.mbti).toBe('ENFP')
    expect(s.relationalStyle?.rhythm).toBe('fuego')
  })
  it('core-only is low confidence', () => {
    expect(scoreProfileV2(core, 'ru').strLowConfidence).toBe(true)
  })
  it('depth battery raises confidence and returns valid attributes', () => {
    const s = scoreProfileV2({ ...core, V_DEEPEN: 'yes', VD_INT: 'comfortable', VD_WIS: 'do_now', VD_CON: 'm6_plus', VD_DEX: 'h5_plus', VD_STR: 'small' }, 'ru')
    expect(s.strLowConfidence).toBe(false)
    for (const v of [s.int, s.wis, s.con, s.dex, s.cha, s.str]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(30)
    }
    expect(['artificer','mage','operator','healer','sovereign','wanderer']).toContain(s.charClass)
  })
  it('empty answers degrade gracefully', () => {
    const s = scoreProfileV2({}, 'en')
    expect(s.niche).toBeNull()
    expect(s.worldSkin).toBe('wanderer')
    expect(s.worldSkinSource).toBe('wanderer-fallback')
    expect(s.mbti).toBeNull()
    expect(s.sheetLanguage).toBe('en')
  })
})

describe('scoreProfileV2 multi-select V_HOOK', () => {
  it('берёт max замапленного веса по массиву (не сумму)', () => {
    const multi = scoreProfileV2({ V_HOOK: ['understand', 'talk'] }, 'ru')   // understand=6, talk=2
    const single = scoreProfileV2({ V_HOOK: 'understand' }, 'ru')             // 6
    expect(multi.int).toBe(single.int)
  })
  it('одиночный V_HOOK по-прежнему работает', () => {
    const r = scoreProfileV2({ V_HOOK: 'build' }, 'ru')
    expect(r.int).toBeGreaterThan(0)
  })
  it('пустой массив → нулевой вклад, не падает', () => {
    expect(() => scoreProfileV2({ V_HOOK: [] }, 'ru')).not.toThrow()
  })
})
