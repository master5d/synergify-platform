// Соответствие юнит → деталь сквозной картины (спека 2026-10-12-assembly-map, §2). Новый юнит без детали — красный тест,
// а не молча пропавшая деталь: страницы уроков строятся из _meta.json, картина — из этого соответствия.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { CONTENT_ROOT } from '../pack'
import { COURSE } from '../course'
import { ASSEMBLY_MAP } from '../course/assembly-map'
import { NODE_TARGET } from '../assembly/types'
import { OPTIONAL_MODULE_SLUGS } from '../rpg/modules'

const LOCALES = ['ru', 'en'] as const

function modules(locale: string): string[] {
  return readdirSync(join(CONTENT_ROOT, locale), { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
    .map((e) => e.name)
    .sort()
}

function unitKeys(locale: string): string[] {
  return modules(locale).flatMap((m) =>
    (JSON.parse(readFileSync(join(CONTENT_ROOT, locale, m, '_meta.json'), 'utf8')).units as { slug: string }[])
      .map((u) => `${m}/${u.slug}`))
}

describe.runIf(COURSE.features.assemblyMap)('сквозная картина ↔ контент', () => {
  it.each(LOCALES)('у каждого юнита (%s) есть запись соответствия, лишних записей нет', (locale) => {
    expect(Object.keys(ASSEMBLY_MAP.units).sort()).toEqual(unitKeys(locale).sort())
  })

  it('у каждого модуля ровно один узел', () => {
    const byModule = ASSEMBLY_MAP.nodes.map((n) => n.module).sort()
    expect(byModule).toEqual(modules('ru'))
  })

  it('id узлов и деталей уникальны', () => {
    const ids = [...ASSEMBLY_MAP.nodes.map((n) => n.id), ...ASSEMBLY_MAP.parts.map((p) => p.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('запись юнита ведёт на деталь узла своего модуля или на корпус', () => {
    const nodeOfModule = new Map(ASSEMBLY_MAP.nodes.map((n) => [n.module, n.id]))
    const partNode = new Map(ASSEMBLY_MAP.parts.map((p) => [p.id, p.node]))
    for (const [key, target] of Object.entries(ASSEMBLY_MAP.units)) {
      if (target === NODE_TARGET) continue
      expect(partNode.get(target), `${key} → ${target}: детали нет`).toBeDefined()
      expect(partNode.get(target), `${key} → ${target}: деталь чужого узла`).toBe(nodeOfModule.get(key.split('/')[0]))
    }
  })

  it('каждая деталь принадлежит ровно одному юниту (сирот нет)', () => {
    const used = Object.values(ASSEMBLY_MAP.units).filter((t) => t !== NODE_TARGET)
    expect([...used].sort()).toEqual(ASSEMBLY_MAP.parts.map((p) => p.id).sort())
  })

  it('опциональные узлы совпадают с каноном OPTIONAL_MODULE_SLUGS', () => {
    const optional = ASSEMBLY_MAP.nodes.filter((n) => n.optional).map((n) => n.module).sort()
    expect(optional).toEqual([...OPTIONAL_MODULE_SLUGS].sort())
  })

  it('у каждого узла и детали есть подписи RU и EN', () => {
    for (const x of [...ASSEMBLY_MAP.nodes, ...ASSEMBLY_MAP.parts]) {
      expect(x.label.ru.trim(), `${x.id}: нет RU`).not.toBe('')
      expect(x.label.en.trim(), `${x.id}: нет EN`).not.toBe('')
    }
  })
})

describe.runIf(!COURSE.features.assemblyMap)('курс без картины', () => {
  it('соответствие пустое', () => {
    expect(ASSEMBLY_MAP.nodes).toHaveLength(0)
    expect(ASSEMBLY_MAP.parts).toHaveLength(0)
    expect(Object.keys(ASSEMBLY_MAP.units)).toHaveLength(0)
  })
})
