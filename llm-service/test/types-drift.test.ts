import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { WORLD_SKINS } from '../src/types.js'

// Живой авторитет перечня скинов — union WorldSkin во фронте (LMS/tochka-sborki),
// а не воркер: строку `const skins = '...'` задача 9 убрала из gemini.ts,
// и переезд в сервис не был единственным источником правды — им остался фронт.
const FRONT_SKIN_TYPES = '../../LMS/tochka-sborki/web/lib/intake/types.ts'

/** Извлекает строковые литералы из объявления `export type WorldSkin = 'a' | 'b' | ...`. */
function extractWorldSkinUnion(src: string): string[] | null {
  const m = src.match(/export\s+type\s+WorldSkin\s*=([^\n]*(?:\n\s*\|[^\n]*)*)/)
  if (!m) return null
  const literals = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
  return literals.length > 0 ? literals : null
}

// Явный список ожидаемых полей для каждого интерфейса (из воркера)
const EXPECTED: Record<string, string[]> = {
  ProseInput: ['charClass', 'worldSkin', 'language', 'register', 'niche', 'attributes', 'aspirational', 'firstWin', 'successDef'],
  CatalogEntry: ['slug', 'topic'],
  DemandClassification: ['classification', 'matched_module', 'gap_topic_key', 'gap_topic_label', 'feasibility_note', 'value_tier'],
  BriefProposal: ['proposed_type', 'title', 'learning_objective', 'slot', 'agentic_approach', 'unit_count_estimate', 'source_quotes'],
}

// Функция для извлечения полей интерфейса из исходного кода
function extractInterfaceFields(src: string, interfaceName: string): string[] {
  // Ищем: interface InterfaceName {
  const regex = new RegExp(`interface\\s+${interfaceName}\\s*\\{`, 's')
  const match = src.match(regex)
  if (!match) return []

  const startIdx = match.index! + match[0].length
  let braceCount = 1
  let endIdx = startIdx

  // Находим соответствующую закрывающую скобку
  for (let i = startIdx; i < src.length && braceCount > 0; i++) {
    if (src[i] === '{') braceCount++
    if (src[i] === '}') braceCount--
    if (braceCount === 0) {
      endIdx = i
      break
    }
  }

  const body = src.substring(startIdx, endIdx)

  // Удаляем вложенные объекты (между { и })
  const bodyWithoutNested = body.replace(/\{[^}]*\}/g, '')

  // Парсим поля
  const fields: string[] = []
  const lines = bodyWithoutNested.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//')) continue

    // Разделяем по ; (может быть несколько полей на одной строке)
    const parts = trimmed.split(';')
    for (const part of parts) {
      const cleaned = part.trim()
      if (!cleaned) continue

      // Ищем имя перед : или ?:
      const m = cleaned.match(/^(\w+)\s*\??\s*:/)
      if (m) {
        fields.push(m[1])
      }
    }
  }

  return [...new Set(fields)].sort()
}

// Функция для поиска интерфейса в основном файле или fallback-файле
function findInterfaceSource(
  primaryPath: string,
  fallbackPath: string | null,
  interfaceName: string,
): string | null {
  const paths = [primaryPath, fallbackPath].filter((p) => p !== null) as string[]
  for (const path of paths) {
    const p = new URL(path, import.meta.url)
    if (existsSync(p)) {
      const src = readFileSync(p, 'utf8')
      if (src.includes(`interface ${interfaceName}`)) {
        return src
      }
    }
  }
  return null
}

describe('сверка с оригиналом в воркере', () => {
  it('перечень скинов совпадает с union WorldSkin во фронте (LMS/tochka-sborki)', () => {
    const p = new URL(FRONT_SKIN_TYPES, import.meta.url)
    if (!existsSync(p)) {
      console.warn('SKIP: LMS/tochka-sborki/web/lib/intake/types.ts отсутствует — авторитет перечня скинов недоступен')
      return
    }
    const src = readFileSync(p, 'utf8')
    const literals = extractWorldSkinUnion(src)
    if (!literals) {
      console.warn('SKIP: union `export type WorldSkin = ...` не найден/не распарсен в types.ts')
      return
    }
    expect(literals.sort()).toEqual([...WORLD_SKINS].sort())
  })

  // Проверка интерфейсов
  it('ProseInput: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', '../../workers/src/lib/types.ts', 'ProseInput')
    const workerSrc = findInterfaceSource('../../workers/src/lib/gemini.ts', '../../workers/src/lib/types.ts', 'ProseInput')
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс ProseInput не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'ProseInput').sort()
    const workerFields = extractInterfaceFields(workerSrc, 'ProseInput').sort()
    const expectedFields = EXPECTED['ProseInput'].sort()

    // Три проверки: разборщик не упал (поля не пустые) и оба источника совпадают с ожидаемым
    expect(localFields.length).toBeGreaterThan(0)
    expect(workerFields.length).toBeGreaterThan(0)
    expect(localFields).toEqual(expectedFields)
    expect(workerFields).toEqual(expectedFields)
  })

  it('DemandClassification: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', '../../workers/src/lib/types.ts', 'DemandClassification')
    const workerSrc = findInterfaceSource(
      '../../workers/src/lib/demand-gemini.ts',
      '../../workers/src/lib/types.ts',
      'DemandClassification',
    )
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс DemandClassification не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'DemandClassification').sort()
    const workerFields = extractInterfaceFields(workerSrc, 'DemandClassification').sort()
    const expectedFields = EXPECTED['DemandClassification'].sort()

    expect(localFields.length).toBeGreaterThan(0)
    expect(workerFields.length).toBeGreaterThan(0)
    expect(localFields).toEqual(expectedFields)
    expect(workerFields).toEqual(expectedFields)
  })

  it('BriefProposal: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', '../../workers/src/lib/types.ts', 'BriefProposal')
    const workerSrc = findInterfaceSource(
      '../../workers/src/lib/demand-gemini.ts',
      '../../workers/src/lib/types.ts',
      'BriefProposal',
    )
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс BriefProposal не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'BriefProposal').sort()
    const workerFields = extractInterfaceFields(workerSrc, 'BriefProposal').sort()
    const expectedFields = EXPECTED['BriefProposal'].sort()

    expect(localFields.length).toBeGreaterThan(0)
    expect(workerFields.length).toBeGreaterThan(0)
    expect(localFields).toEqual(expectedFields)
    expect(workerFields).toEqual(expectedFields)
  })

  it('CatalogEntry: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', '../../workers/src/lib/types.ts', 'CatalogEntry')
    const workerSrc = findInterfaceSource('../../workers/src/lib/course-catalog.ts', '../../workers/src/lib/types.ts', 'CatalogEntry')
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс CatalogEntry не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'CatalogEntry').sort()
    const workerFields = extractInterfaceFields(workerSrc, 'CatalogEntry').sort()
    const expectedFields = EXPECTED['CatalogEntry'].sort()

    expect(localFields.length).toBeGreaterThan(0)
    expect(workerFields.length).toBeGreaterThan(0)
    expect(localFields).toEqual(expectedFields)
    expect(workerFields).toEqual(expectedFields)
  })
})
