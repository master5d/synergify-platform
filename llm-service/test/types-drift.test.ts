import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { WORLD_SKINS } from '../src/types.js'

const WORKER_SKIN_LINE = '../../workers/src/lib/gemini.ts'

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
  it('перечень скинов совпадает со списком в classifyFilmSkin', () => {
    const p = new URL(WORKER_SKIN_LINE, import.meta.url)
    const src = existsSync(p) ? readFileSync(p, 'utf8') : null
    if (src === null) {
      console.warn('SKIP: workers/src/lib/gemini.ts отсутствует — оригинал переехал в сервис')
      return
    }
    const m = src.match(/const skins = '([^']+)'/)
    if (!m) {
      console.warn('SKIP: строка `const skins` в gemini.ts не найдена — classifyFilmSkin переехал в сервис')
      return
    }
    expect(m[1].split('|').sort()).toEqual([...WORLD_SKINS].sort())
  })

  // Проверка интерфейсов
  it('ProseInput: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', null, 'ProseInput')
    const workerSrc = findInterfaceSource('../../workers/src/lib/gemini.ts', null, 'ProseInput')
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс ProseInput не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'ProseInput')
    const workerFields = extractInterfaceFields(workerSrc, 'ProseInput')
    expect(localFields).toEqual(workerFields)
  })

  it('DemandClassification: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', null, 'DemandClassification')
    const workerSrc = findInterfaceSource(
      '../../workers/src/lib/demand-gemini.ts',
      '../../workers/src/lib/types.ts',
      'DemandClassification',
    )
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс DemandClassification не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'DemandClassification')
    const workerFields = extractInterfaceFields(workerSrc, 'DemandClassification')
    expect(localFields).toEqual(workerFields)
  })

  it('BriefProposal: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', null, 'BriefProposal')
    const workerSrc = findInterfaceSource(
      '../../workers/src/lib/demand-gemini.ts',
      '../../workers/src/lib/types.ts',
      'BriefProposal',
    )
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс BriefProposal не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'BriefProposal')
    const workerFields = extractInterfaceFields(workerSrc, 'BriefProposal')
    expect(localFields).toEqual(workerFields)
  })

  it('CatalogEntry: поля совпадают', () => {
    const localSrc = findInterfaceSource('../src/types.ts', null, 'CatalogEntry')
    const workerSrc = findInterfaceSource('../../workers/src/lib/course-catalog.ts', null, 'CatalogEntry')
    
    if (!localSrc || !workerSrc) {
      console.warn('SKIP: интерфейс CatalogEntry не найден в одном из источников')
      return
    }

    const localFields = extractInterfaceFields(localSrc, 'CatalogEntry')
    const workerFields = extractInterfaceFields(workerSrc, 'CatalogEntry')
    expect(localFields).toEqual(workerFields)
  })
})
