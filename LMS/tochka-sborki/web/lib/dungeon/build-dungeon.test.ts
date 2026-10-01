import { describe, it, expect } from 'vitest'
import { buildDungeon } from './build-dungeon'
import type { DungeonInput } from './types'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { PACK_SLUG } from '@/lib/pack'

// Тесты ниже с itDefault пинуют флейвор-копию и applied-challenge-банк Точки Сборки;
// у второго pack'а флейвор нейтральный, а банка вызовов нет. Для tochka-sborki — 1-в-1.
const itDefault = it.runIf(PACK_SLUG === 'tochka-sborki')

function base(over: Partial<DungeonInput> = {}): DungeonInput {
  return {
    locale: 'ru',
    skin: 'slavic-myth',
    niche: 'coach',
    outcome: null,
    isModuleCompleted: () => true,
    ...over,
  }
}

describe('buildDungeon', () => {
  itDefault('names from the flavor bank; module from progress, not from the niche', () => {
    const v = buildDungeon(base())
    expect(v.niche).toBe('coach')
    expect(v.module).toBe('08-agent-engineering') // всё закрыто → самый дальний закрытый модуль спайна
    expect(v.dungeonName).toBe('Чертог Резонанса')
    expect(v.boss.name).toBe('Эхо Сомнения')
  })

  itDefault('produces 3 stages at escalating tiers with cs 15', () => {
    const v = buildDungeon(base())
    expect(v.stages.map(s => s.tier)).toEqual(['task', 'process', 'outcome'])
    expect(v.stages.map(s => s.id)).toEqual(['dungeon:08-agent-engineering:s1', 'dungeon:08-agent-engineering:s2', 'dungeon:08-agent-engineering:s3'])
    expect(v.stages.every(s => s.cs === 15)).toBe(true)
    expect(v.stages.every(s => s.body.length > 0)).toBe(true)
  })

  it('boss has cs 50, namespaced id, and slot-filled body', () => {
    const v = buildDungeon(base({ niche: 'coach', outcome: 'more clients' }))
    expect(v.boss.id).toBe(`dungeon:${v.module}:boss`)
    expect(v.boss.cs).toBe(50)
    expect(v.boss.body).toContain('more clients')
    expect(v.boss.body).not.toContain('{outcome}')
    expect(v.boss.body).not.toContain('{niche}')
  })

  it('is locked when no spine module is completed, unlocked once one is', () => {
    expect(buildDungeon(base({ isModuleCompleted: () => false })).locked).toBe(true)
    expect(buildDungeon(base({ isModuleCompleted: () => true })).locked).toBe(false)
  })

  itDefault('без русла модуль выбирается по прогрессу: первый модуль спайна → самый дальний закрытый', () => {
    const none = buildDungeon(base({ isModuleCompleted: () => false }))
    expect(none.module).toBe('00-kickstart')
    const done = new Set(['00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection', '04-prompt-engineering'])
    const mid = buildDungeon(base({ isModuleCompleted: (s) => done.has(s) }))
    expect(mid.module).toBe('04-prompt-engineering')
    expect(mid.locked).toBe(false)
    expect(mid.boss.id).toBe('dungeon:04-prompt-engineering:boss')
  })

  it('ниша не влияет на выбор модуля — только на флейвор', () => {
    for (const niche of Object.keys(FLAVOR_BANK)) {
      expect(buildDungeon(base({ niche, isModuleCompleted: () => false })).module)
        .toBe(buildDungeon(base({ niche: 'other', isModuleCompleted: () => false })).module)
    }
  })

  it('спайн — модули активного pack-а, если они переданы', () => {
    const v = buildDungeon(base({ courseModules: ['01-living-practice'], isModuleCompleted: () => false }))
    expect(v.module).toBe('01-living-practice')
    expect(v.locked).toBe(true)
    expect(buildDungeon(base({ courseModules: ['01-living-practice'] })).locked).toBe(false)
  })

  itDefault('falls back to the "other" flavor for an unknown/null niche', () => {
    const v = buildDungeon(base({ niche: null }))
    expect(v.niche).toBe('other')
    expect(v.dungeonName).toBe('Безымянный Предел')
    expect(v.boss.id).toBe(`dungeon:${v.module}:boss`)
  })

  it('is deterministic for the same input', () => {
    expect(buildDungeon(base())).toEqual(buildDungeon(base()))
  })

  itDefault('renders flavor names in the EN locale', () => {
    const v = buildDungeon(base({ locale: 'en' }))
    expect(v.dungeonName).toBe('Hall of Resonance')
    expect(v.boss.name).toBe('The Echo of Doubt')
  })

  itDefault('fills the outcome-tier stage body with the learner outcome', () => {
    const v = buildDungeon(base({ niche: 'coach', outcome: 'grow my practice' }))
    const outcomeStage = v.stages.find(s => s.tier === 'outcome')!
    expect(outcomeStage.body).toContain('grow my practice')
  })
})

describe('flavor-bank', () => {
  it('covers the 8 expected niches', () => {
    expect(Object.keys(FLAVOR_BANK).sort()).toEqual(
      ['astrology', 'coach', 'content', 'ecommerce', 'massage', 'other', 'service', 'tech'],
    )
  })
})
