import type { RegionGuide } from './types'
import { AUDIENCES, THEMES } from './vocab'

// Замечание валидации гайда по региону
export interface GuideIssue {
  id: string
  where: string
}

// Регулярное выражение для формата даты YYYY-MM-DD
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Проверка формата и корректности календарной даты YYYY-MM-DD
function isIsoDate(str: unknown): boolean {
  if (typeof str !== 'string' || !DATE_RE.test(str)) return false
  const parts = str.split('-').map(Number)
  const month = parts[1]
  const day = parts[2]
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  return !isNaN(Date.parse(str))
}

// Рекурсивный поиск пустых двуязычных строк Bi
function walkBi(val: unknown, path: string, issues: GuideIssue[]): void {
  if (!val || typeof val !== 'object') return

  if (Array.isArray(val)) {
    val.forEach((item, idx) => {
      walkBi(item, path ? `${path}.${idx}` : `${idx}`, issues)
    })
    return
  }

  const obj = val as Record<string, unknown>
  if ('ru' in obj || 'en' in obj) {
    if (typeof obj.ru !== 'string' || obj.ru.trim() === '') {
      issues.push({ id: 'empty', where: `${path}.ru` })
    }
    if (typeof obj.en !== 'string' || obj.en.trim() === '') {
      issues.push({ id: 'empty', where: `${path}.en` })
    }
    return
  }

  for (const key of Object.keys(obj)) {
    walkBi(obj[key], path ? `${path}.${key}` : key, issues)
  }
}

// Проверка гайда региона на полноту данных и соответствие правилам
export function checkGuide(g: RegionGuide): GuideIssue[] {
  const issues: GuideIssue[] = []

  // 1. Проверка наличия обязательных Bi-блоков
  const topBiKeys: (keyof RegionGuide)[] = ['name', 'character', 'whoGoes']
  for (const key of topBiKeys) {
    const val = g[key]
    if (!val || typeof val !== 'object' || (!('ru' in val) && !('en' in val))) {
      issues.push({ id: 'empty', where: `${key}.ru` })
      issues.push({ id: 'empty', where: `${key}.en` })
    }
  }

  if (!g.culture || typeof g.culture !== 'object') {
    issues.push({ id: 'empty', where: 'culture.lands.ru' })
    issues.push({ id: 'empty', where: 'culture.lands.en' })
    issues.push({ id: 'empty', where: 'culture.asks.ru' })
    issues.push({ id: 'empty', where: 'culture.asks.en' })
  } else {
    if (!g.culture.lands || typeof g.culture.lands !== 'object' || (!('ru' in g.culture.lands) && !('en' in g.culture.lands))) {
      issues.push({ id: 'empty', where: 'culture.lands.ru' })
      issues.push({ id: 'empty', where: 'culture.lands.en' })
    }
    if (!g.culture.asks || typeof g.culture.asks !== 'object' || (!('ru' in g.culture.asks) && !('en' in g.culture.asks))) {
      issues.push({ id: 'empty', where: 'culture.asks.ru' })
      issues.push({ id: 'empty', where: 'culture.asks.en' })
    }
  }

  if (!g.verdict || typeof g.verdict !== 'object') {
    issues.push({ id: 'empty', where: 'verdict.yes.ru' })
    issues.push({ id: 'empty', where: 'verdict.yes.en' })
    issues.push({ id: 'empty', where: 'verdict.no.ru' })
    issues.push({ id: 'empty', where: 'verdict.no.en' })
  } else {
    if (!g.verdict.yes || typeof g.verdict.yes !== 'object' || (!('ru' in g.verdict.yes) && !('en' in g.verdict.yes))) {
      issues.push({ id: 'empty', where: 'verdict.yes.ru' })
      issues.push({ id: 'empty', where: 'verdict.yes.en' })
    }
    if (!g.verdict.no || typeof g.verdict.no !== 'object' || (!('ru' in g.verdict.no) && !('en' in g.verdict.no))) {
      issues.push({ id: 'empty', where: 'verdict.no.ru' })
      issues.push({ id: 'empty', where: 'verdict.no.en' })
    }
  }

  // Рекурсивная проверка всех существующих Bi-полей на пустые строки после trim
  walkBi(g, '', issues)

  // 2. Проверка заполнения тем и аудиторий
  for (const theme of THEMES) {
    if (!g.themes || !g.themes[theme.id]) {
      issues.push({ id: 'fit-missing', where: `themes.${theme.id}` })
    }
  }
  for (const audience of AUDIENCES) {
    if (!g.audiences || !g.audiences[audience.id]) {
      issues.push({ id: 'fit-missing', where: `audiences.${audience.id}` })
    }
  }

  // 3. Проверка площадок
  if (Array.isArray(g.venues)) {
    // Количество площадок
    if (g.venues.length > 10) {
      issues.push({ id: 'venue-count', where: 'venues' })
    }

    // Алфавитный порядок по названию
    if (g.venues.length > 1) {
      let ordered = true
      for (let i = 1; i < g.venues.length; i++) {
        if (g.venues[i - 1].name.localeCompare(g.venues[i].name, 'en') > 0) {
          ordered = false
          break
        }
      }
      if (!ordered) {
        issues.push({ id: 'venue-order', where: 'venues' })
      }
    }

    // Ссылки и даты проверки площадок
    g.venues.forEach((venue, i) => {
      const urlWhere = `venues.${i}.url`
      if (typeof venue.url !== 'string' || !venue.url.startsWith('https://')) {
        issues.push({ id: 'venue-url', where: urlWhere })
      } else {
        try {
          const parsed = new URL(venue.url)
          if (parsed.protocol !== 'https:') {
            issues.push({ id: 'venue-url', where: urlWhere })
          } else {
            for (const key of parsed.searchParams.keys()) {
              const lower = key.toLowerCase()
              if (lower === 'ref' || lower === 'aff' || lower.startsWith('utm_')) {
                issues.push({ id: 'venue-url', where: urlWhere })
                break
              }
            }
          }
        } catch {
          issues.push({ id: 'venue-url', where: urlWhere })
        }
      }

      if (!isIsoDate(venue.checked)) {
        issues.push({ id: 'venue-date', where: `venues.${i}.checked` })
      }
    })
  }

  // 4. Проверка дат источников и ссылок культуры
  if (Array.isArray(g.sources)) {
    g.sources.forEach((source, i) => {
      if (!isIsoDate(source.accessed)) {
        issues.push({ id: 'source-date', where: `sources.${i}.accessed` })
      }
    })
  }

  if (g.culture && Array.isArray(g.culture.links)) {
    g.culture.links.forEach((link, i) => {
      if (!isIsoDate(link.accessed)) {
        issues.push({ id: 'source-date', where: `culture.links.${i}.accessed` })
      }
    })
  }

  return issues
}

// Проверка устаревания даты проверки площадки (более 365 дней)
export function venueStale(checked: string, today: string): boolean {
  const dChecked = Date.parse(checked)
  const dToday = Date.parse(today)
  if (isNaN(dChecked) || isNaN(dToday)) return true
  const diffDays = (dToday - dChecked) / (1000 * 60 * 60 * 24)
  return diffDays > 365
}
