import { describe, it, expect } from 'vitest'
import { buildLocator } from './locator'
import type { ZoneVM } from './types'

// minimal ZoneVM factory — only fields buildLocator reads matter
function zone(order: number, status: ZoneVM['status'], zoneName: string): ZoneVM {
  return { slug: `m${order}`, order, zoneName, questTitle: zoneName, moduleTitle: zoneName, durationLabel: '', status, isNiche: false, href: '#' }
}

// 9 zones: 0-4 completed, 5 current, 6-8 todo
function nineZones(): ZoneVM[] {
  return Array.from({ length: 9 }, (_, i) =>
    zone(i, i < 5 ? 'completed' : i === 5 ? 'current' : 'todo', i === 5 ? 'Аудио-пайплайн' : `Z${i}`))
}

describe('buildLocator', () => {
  it('locates the current module (ru): 1-based index, total, zone name in caption', () => {
    const loc = buildLocator(nineZones(), 'ru')
    expect(loc.finished).toBe(false)
    expect(loc.hereIndex).toBe(6)
    expect(loc.total).toBe(9)
    expect(loc.zoneName).toBe('Аудио-пайплайн')
    expect(loc.caption).toContain('Вы тут')
    expect(loc.caption).toContain('Аудио-пайплайн')
    expect(loc.caption).toContain('модуль 6 из 9')
  })

  it('renders the english caption', () => {
    const loc = buildLocator(nineZones(), 'en')
    expect(loc.caption).toContain('You are here')
    expect(loc.caption).toContain('module 6 of 9')
  })

  it('handles the first module (order 0)', () => {
    const zones = [zone(0, 'current', 'Старт'), zone(1, 'todo', 'Z1')]
    const loc = buildLocator(zones, 'ru')
    expect(loc.hereIndex).toBe(1)
    expect(loc.caption).toContain('модуль 1 из 2')
  })

  it('reports finished when no zone is current (all completed)', () => {
    const zones = [zone(0, 'completed', 'A'), zone(1, 'completed', 'B')]
    const ru = buildLocator(zones, 'ru')
    expect(ru.finished).toBe(true)
    expect(ru.hereIndex).toBeNull()
    expect(ru.zoneName).toBeNull()
    expect(ru.caption).toContain('Курс пройден')
    expect(buildLocator(zones, 'en').caption).toContain('Course complete')
  })

  it('does not throw on empty zones (treats as finished)', () => {
    const loc = buildLocator([], 'ru')
    expect(loc.finished).toBe(true)
    expect(loc.total).toBe(0)
  })
})
