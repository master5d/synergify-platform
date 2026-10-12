import { describe, it, expect } from 'vitest'
import { markUnit, type UnitProgressMap } from '@/lib/unit-progress'
import { NODE_TARGET, type AssemblyMap } from './types'
import { assemblyCaption, assemblyLabels, assemblyState, assemblySummary, moduleHref } from './state'

const MAP: AssemblyMap = {
  nodes: [
    { id: 'conveyor', module: '06-pipe', label: { ru: 'Конвейер', en: 'Conveyor' }, optional: false },
    { id: 'archive', module: '11-brain', label: { ru: 'Архив', en: 'Archive' }, optional: true },
  ],
  parts: [
    { id: 'conveyor.gate', node: 'conveyor', label: { ru: 'Ворота-датчик', en: 'Sensor gate' } },
    { id: 'conveyor.timer', node: 'conveyor', label: { ru: 'Таймер', en: 'Timer' } },
    { id: 'archive.vault', node: 'archive', label: { ru: 'Шкаф', en: 'Cabinet' } },
  ],
  units: {
    '06-pipe/u1-activation': NODE_TARGET,
    '06-pipe/u2-theory': 'conveyor.gate',
    '06-pipe/u5-schedule': 'conveyor.timer',
    '11-brain/u1-own': 'archive.vault',
  },
}

const done = (...keys: string[]): UnitProgressMap =>
  keys.reduce<UnitProgressMap>((m, k) => { const [mod, unit] = k.split('/'); return markUnit(m, mod, unit) }, {})

describe('assemblyState', () => {
  it('пустой прогресс — всё контуром, текущей детали нет', () => {
    const st = assemblyState(MAP, {})
    expect(st.parts).toEqual({ 'conveyor.gate': 'ghost', 'conveyor.timer': 'ghost', 'archive.vault': 'ghost' })
    expect(st.nodes.conveyor).toEqual({ built: 0, total: 3, shell: 'ghost' })
    expect(st.nodes.archive).toEqual({ built: 0, total: 1, shell: 'ghost' })
    expect(st.current).toBeNull()
  })

  it('пройденный юнит собирает свою деталь; юнит-фаза — корпус узла', () => {
    const st = assemblyState(MAP, done('06-pipe/u2-theory', '06-pipe/u1-activation'))
    expect(st.parts['conveyor.gate']).toBe('built')
    expect(st.parts['conveyor.timer']).toBe('ghost')
    expect(st.nodes.conveyor).toEqual({ built: 2, total: 3, shell: 'built' })
  })

  it('узел без юнитов-фаз: корпус собран, как только собрана первая деталь', () => {
    expect(assemblyState(MAP, done('11-brain/u1-own')).nodes.archive).toEqual({ built: 1, total: 1, shell: 'built' })
  })

  it('узел с юнитом-фазой: корпус ждёт фазу, даже если детали собраны', () => {
    const st = assemblyState(MAP, done('06-pipe/u2-theory', '06-pipe/u5-schedule'))
    expect(st.nodes.conveyor.shell).toBe('ghost')
    expect(st.nodes.conveyor.built).toBe(2)
  })

  it('текущий юнит: деталь или корпус; неизвестный юнит — null', () => {
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u5-schedule' }).current).toEqual({ node: 'conveyor', part: 'conveyor.timer' })
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u1-activation' }).current).toEqual({ node: 'conveyor', part: null })
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u9-nope' }).current).toBeNull()
  })

  it('мусор и чужие модули в прогрессе игнорируются', () => {
    const junk = { ...done('03-other/u1', '06-pipe/u7-old'), 'living-practice': { x: true } } as UnitProgressMap
    const st = assemblyState(MAP, junk)
    expect(Object.values(st.parts).every((s) => s === 'ghost')).toBe(true)
    expect(st.nodes.conveyor.built).toBe(0)
  })
})

describe('подписи и ссылки', () => {
  it('assemblyLabels отдаёт подписи узлов и деталей на языке страницы', () => {
    expect(assemblyLabels(MAP, 'en')).toMatchObject({ conveyor: 'Conveyor', 'conveyor.timer': 'Timer' })
    expect(assemblyLabels(MAP, 'ru')['archive.vault']).toBe('Шкаф')
  })

  it('assemblyCaption: узел → деталь; для юнита-фазы — только узел', () => {
    expect(assemblyCaption(MAP, { module: '06-pipe', unit: 'u5-schedule' }, 'ru')).toBe('Ты собираешь: Конвейер → Таймер')
    expect(assemblyCaption(MAP, { module: '06-pipe', unit: 'u1-activation' }, 'en')).toBe("You're building: Conveyor")
    expect(assemblyCaption(MAP, { module: 'xx', unit: 'yy' }, 'ru')).toBe('')
  })

  it('assemblySummary: счёт собранных узлов и текущий узел', () => {
    const st = assemblyState(MAP, done('11-brain/u1-own'), { module: '06-pipe', unit: 'u2-theory' })
    const s = assemblySummary(MAP, st, 'ru')
    expect(s.title).toBe('Машина, которую ты собираешь')
    expect(s.desc).toBe('Собрано узлов: 1 из 2. Сейчас — Конвейер → Ворота-датчик.')
    expect(s.items).toEqual(['Конвейер: 0/3 — сейчас', 'Архив: 1/1'])
    expect(assemblySummary(MAP, assemblyState(MAP, {}), 'en').desc).toBe('Nodes assembled: 0 of 2.')
  })

  it('moduleHref — путь модуля с языковым префиксом (basePath добавляет роутер)', () => {
    expect(moduleHref('06-pipe', 'ru')).toBe('/lessons/06-pipe/')
    expect(moduleHref('06-pipe', 'en')).toBe('/en/lessons/06-pipe/')
  })
})
