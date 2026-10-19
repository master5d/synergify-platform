// CSV для таблиц инструментов ведущего: UTF-8 с BOM (иначе Excel по двойному щелчку ломает кириллицу), разделитель — по локали,
// как у шаблонов курса: RU «;», EN «,» (Excel берёт разделитель из региональных настроек).

import type { Lang } from '../retreat-calc/engine'

export const BOM = '\uFEFF'
export const separatorFor = (lang: Lang) => (lang === 'ru' ? ';' : ',')

export function isSpreadsheetBytes(bytes: Uint8Array): boolean {
  return (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04)
    || (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0)
}

const FORMULA_START = /^[=+\-@\t\r]/
const NUMBER = /^[-+]?\d+([.,]\d+)?$/
const PHONE = /^\+[\d\s()\-]+$/

/** Текст, который Excel принял бы за формулу (`=`, `+`, `-`, `@`, табуляция в начале), получает апостроф.
 *  Числа вроде «-6» и телефоны вроде «+7 900 123-45-67» — нет: их видят водители и встречающие. */
function safe(v: string): string {
  return FORMULA_START.test(v) && !NUMBER.test(v) && !PHONE.test(v) ? `'${v}` : v
}

/** Обратно: апостроф, поставленный `safe`, снимается — круг «выгрузил — загрузил» без потерь. */
const unsafe = (v: string) => (v.startsWith("'") && FORMULA_START.test(v.slice(1)) ? v.slice(1) : v)

function cell(raw: string, sep: string): string {
  const v = safe(raw)
  return v.includes(sep) || v.includes('"') || v.includes('\n') || v.includes('\r') ? `"${v.replace(/"/g, '""')}"` : v
}

export function toCsv(rows: string[][], lang: Lang): string {
  const sep = separatorFor(lang)
  return BOM + rows.map((r) => r.map((v) => cell(v, sep)).join(sep)).join('\r\n') + '\r\n'
}

/** Байты файла → текст: UTF-8, а если файл не в UTF-8 — кодировка Excel по языку страницы: cp1251 (русский Excel)
 *  или cp1252 (английский). Без этого кириллица молча превращалась бы в «�», а «José» — в «Josй». */
export function decodeCsvBytes(bytes: Uint8Array, fallback: 'windows-1251' | 'windows-1252' = 'windows-1251'): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder(fallback).decode(bytes)
  }
}

/** Разбор CSV (RFC 4180): BOM, разделитель `;` или `,` — по первой строке, кавычки с `;`, `,` и переводом строки внутри.
 *  У записи — её номер в файле (с 1, как строка таблицы): пустые строки отброшены, номера остальных не сдвинуты. */
export function parseCsvNumbered(text: string): { row: number; cells: string[] }[] {
  const s = text.startsWith(BOM) ? text.slice(1) : text
  const firstLine = s.split(/\r?\n/, 1)[0] ?? ''
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"' && field === '') quoted = true
    else if (c === sep) { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.map((r, i) => ({ row: i + 1, cells: r.map(unsafe) })).filter((r) => r.cells.some((v) => v.trim() !== ''))
}

/** Записи без номеров. */
export function parseCsv(text: string): string[][] {
  return parseCsvNumbered(text).map((r) => r.cells)
}
