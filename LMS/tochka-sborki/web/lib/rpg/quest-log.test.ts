// web/lib/rpg/quest-log.test.ts
import { describe, it, expect } from 'vitest'
import { buildQuestLog } from './quest-log'
import { getTransformation } from './transformations'
import type { SkinPack } from './types'

const modules = {
  '00-kickstart': { title: 'Kickstart', duration: '25 мин' },
  '01-introduction': { title: 'Введение', duration: '40 мин' },
} as any

const pack: SkinPack = {
  skin: 'slavic-myth',
  zoneNames: { '00-kickstart': { ru: 'Деревня', en: 'Village' } },
  questTitles: { '00-kickstart': { ru: 'Зов тропы', en: 'Call of the path' } },
}

const profile = { char_class: 'healer', world_skin: 'slavic-myth', niche: 'massage', char_level: 1, legendary_title: 'Знахарка' } as any

describe('buildQuestLog', () => {
  it('orders by class, marks first non-completed as current', () => {
    const vm = buildQuestLog(profile, modules, ['00-kickstart'], (s: string) => s === '00-kickstart' ? 'completed' : 'none', pack, 'ru')
    // healer order starts 00,01,...; 00 completed → current is 01
    expect(vm.zones[0].status).toBe('completed')
    const current = vm.zones.find(z => z.status === 'current')
    expect(current?.slug).toBe('01-introduction')
  })
  it('uses skin pack name when present, falls back to module title', () => {
    const vm = buildQuestLog(profile, modules, [], () => 'none', pack, 'ru')
    expect(vm.zones.find(z => z.slug === '00-kickstart')!.questTitle).toBe('Зов тропы')
    expect(vm.zones.find(z => z.slug === '01-introduction')!.questTitle).toBe('Введение') // fallback
  })
  // Зона подземелья без русла — по прогрессу в спайне квест-линии, ниша не влияет.
  it('flags the dungeon zone by progress, not by niche', () => {
    const fresh = buildQuestLog(profile, modules, [], () => 'none', pack, 'ru')
    expect(fresh.zones.filter(z => z.isNiche).map(z => z.slug)).toEqual(['00-kickstart'])
    const done = new Set(['00-kickstart', '01-introduction', '02-setup-guide'])
    const vm = buildQuestLog({ ...profile, niche: 'tech' }, modules, [...done], (s: string) => done.has(s) ? 'completed' : 'none', pack, 'ru')
    expect(vm.zones.filter(z => z.isNiche).map(z => z.slug)).toEqual(['02-setup-guide'])
  })
  it('summary counts completed', () => {
    const vm = buildQuestLog(profile, modules, ['00-kickstart'], (s) => s === '00-kickstart' ? 'completed' : 'none', pack, 'ru')
    expect(vm.summary.completedCount).toBe(1)
    expect(vm.summary.total).toBe(9)
  })
  it('populates each zone with its micro-transformation (ru)', () => {
    const vm = buildQuestLog(profile, modules, [], () => 'none', pack, 'ru')
    const intro = vm.zones.find(z => z.slug === '01-introduction')
    expect(intro?.transform).toEqual(getTransformation('01-introduction', 'ru'))
    // every zone whose slug is a known module has a transform
    for (const z of vm.zones) {
      if (getTransformation(z.slug, 'ru')) expect(z.transform).toBeTruthy()
    }
  })
})
