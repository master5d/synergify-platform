import { CHANNELS, EVENT_CLASSES, RUNGS_ORDER } from './axes'
import type { Bi, Cell, Format } from './types'

// Ключ для хранения карты в LocalStorage
export const MY_MAP_KEY = 'lesenka.my-map.v1'

// Структура сохраненного состояния «Моей карты»
export interface MyMap {
  now: Cell | null
  next: {
    formatId: string | null
    formatName: Bi | null
    text: string
    date: string
  }
  signal: string
}

// Пустая карта — каждый раз новый объект, чтобы правка состояния на странице не портила общий образец
function emptyMap(): MyMap {
  return { now: null, next: { formatId: null, formatName: null, text: '', date: '' }, signal: '' }
}

// Начальное пустое состояние карты
export const EMPTY_MAP: MyMap = emptyMap()

// Регулярное выражение для формата даты YYYY-MM-DD
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Проверка валидности клетки на осях
function isValidCell(cell: unknown): cell is Cell {
  if (!cell || typeof cell !== 'object' || Array.isArray(cell)) return false
  const c = cell as Record<string, unknown>
  const validRungs = new Set<string>(RUNGS_ORDER)
  const validChannels = new Set<string>(CHANNELS.map((ch) => ch.id))
  const validClasses = new Set<string>(EVENT_CLASSES.map((e) => e.id))

  return (
    typeof c.rung === 'string' &&
    validRungs.has(c.rung) &&
    typeof c.channel === 'string' &&
    validChannels.has(c.channel) &&
    typeof c.eventClass === 'string' &&
    validClasses.has(c.eventClass)
  )
}

// Безопасный разбор сериализованного состояния карты
export function parseMyMap(raw: string | null): MyMap {
  if (raw === null || typeof raw !== 'string') {
    return emptyMap()
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return emptyMap()
    }

    if (parsed.v !== 1) {
      return emptyMap()
    }

    if (typeof parsed.signal !== 'string') {
      return emptyMap()
    }

    if (parsed.now !== null && !isValidCell(parsed.now)) {
      return emptyMap()
    }

    if (
      !parsed.next ||
      typeof parsed.next !== 'object' ||
      Array.isArray(parsed.next)
    ) {
      return emptyMap()
    }

    const { formatId, formatName, text, date } = parsed.next

    if (formatId !== null && typeof formatId !== 'string') {
      return emptyMap()
    }

    if (formatName !== null) {
      if (
        !formatName ||
        typeof formatName !== 'object' ||
        Array.isArray(formatName) ||
        typeof formatName.ru !== 'string' ||
        typeof formatName.en !== 'string'
      ) {
        return emptyMap()
      }
    }

    if (typeof text !== 'string' || typeof date !== 'string') {
      return emptyMap()
    }

    const validDate = DATE_REGEX.test(date) ? date : ''

    return {
      now: parsed.now
        ? {
            rung: parsed.now.rung,
            channel: parsed.now.channel,
            eventClass: parsed.now.eventClass,
          }
        : null,
      next: {
        formatId,
        formatName: formatName
          ? {
              ru: formatName.ru,
              en: formatName.en,
            }
          : null,
        text,
        date: validDate,
      },
      signal: parsed.signal,
    }
  } catch {
    return emptyMap()
  }
}

// Сериализация карты с сохранением названия выбранного формата
export function serializeMyMap(m: MyMap, formats: Format[]): string {
  const found = m.next.formatId
    ? formats.find((f) => f.id === m.next.formatId)
    : null

  const payload = {
    v: 1,
    now: m.now,
    next: {
      formatId: m.next.formatId,
      formatName: found ? found.name : m.next.formatName,
      text: m.next.text,
      date: m.next.date,
    },
    signal: m.signal,
  }

  return JSON.stringify(payload)
}

// Определение подписи следующего шага с учетом локали и истории
export function nextLabel(
  m: MyMap,
  formats: Format[],
  locale: 'ru' | 'en'
): string {
  if (m.next.formatId) {
    const found = formats.find((f) => f.id === m.next.formatId)
    if (found) {
      return found.name[locale]
    }
  }
  if (m.next.formatName) {
    return m.next.formatName[locale]
  }
  return m.next.text
}
