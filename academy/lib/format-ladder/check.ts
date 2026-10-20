import { CHANNELS, EVENT_CLASSES, RUNGS_ORDER } from './axes'
import { KNOWN_COURSES } from './families'
import type { Family, Format } from './types'

// Замечание проверки целостности данных
export interface LadderIssue {
  id: string
  where: string
}

// Рекурсивный поиск пустых двуязычных строк Bi
function walkBi(val: unknown, path: string, issues: LadderIssue[]): void {
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

// Проверка реестра форматов и семейств на корректность
export function checkFormats(formats: Format[], families: Family[]): LadderIssue[] {
  const issues: LadderIssue[] = []
  const seenIds = new Set<string>()
  const validFamilyIds = new Set<string>(families.map((f) => f.id))
  const validRungs = new Set<string>(RUNGS_ORDER)
  const validChannels = new Set<string>(CHANNELS.map((c) => c.id))
  const validClasses = new Set<string>(EVENT_CLASSES.map((e) => e.id))

  for (const format of formats) {
    // Проверка уникальности идентификатора
    if (seenIds.has(format.id)) {
      issues.push({ id: 'dup-id', where: format.id })
    } else {
      seenIds.add(format.id)
    }

    // Проверка принадлежности к семейству
    if (!validFamilyIds.has(format.family)) {
      issues.push({ id: 'family', where: `${format.id}.family` })
    }

    // Рекурсивная проверка текстовых Bi полей
    if (!format.name || typeof format.name !== 'object') {
      issues.push({ id: 'empty', where: `${format.id}.name.ru` })
      issues.push({ id: 'empty', where: `${format.id}.name.en` })
    } else {
      walkBi(format.name, `${format.id}.name`, issues)
    }

    if (!format.about || typeof format.about !== 'object') {
      issues.push({ id: 'empty', where: `${format.id}.about.ru` })
      issues.push({ id: 'empty', where: `${format.id}.about.en` })
    } else {
      walkBi(format.about, `${format.id}.about`, issues)
    }

    // Проверка наличия клеток
    if (!Array.isArray(format.cells) || format.cells.length === 0) {
      issues.push({ id: 'no-cells', where: `${format.id}.cells` })
    } else {
      // Проверка допустимости координат каждой клетки
      format.cells.forEach((cell, idx) => {
        if (
          !cell ||
          !validRungs.has(cell.rung) ||
          !validChannels.has(cell.channel) ||
          !validClasses.has(cell.eventClass)
        ) {
          issues.push({ id: 'cell-axis', where: `${format.id}.cells.${idx}` })
        }
      })
    }
  }

  // Проверка ссылок на курсы в семействах
  for (const family of families) {
    if (family.course !== null && family.course !== undefined) {
      const isKnown = KNOWN_COURSES.some(
        (course) =>
          course.ru === family.course?.ru && course.en === family.course?.en
      )
      if (!isKnown) {
        issues.push({ id: 'course', where: `family.${family.id}.course` })
      }
    }
  }

  return issues
}
