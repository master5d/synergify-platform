// CSV для таблиц инструментов ведущего: UTF-8 с BOM (иначе Excel по двойному щелчку ломает кириллицу), разделитель — по локали,
// как у шаблонов курса: RU «;», EN «,» (Excel берёт разделитель из региональных настроек).

import type { Lang } from '../retreat-calc/engine'

export const BOM = '\uFEFF'
export const separatorFor = (lang: Lang) => (lang === 'ru' ? ';' : ',')

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

/** Байты файла → текст: UTF-8, а если файл не в UTF-8 — cp1251 (так сохраняет «CSV (разделители — запятые)»
 *  русский Excel). Без этого кириллица молча превращалась бы в «�». */
export function decodeCsvBytes(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1251').decode(bytes)
  }
}

/** Разбор CSV (RFC 4180): BOM, разделитель `;` или `,` — по первой строке, кавычки с `;`, `,` и переводом строки внутри. */
export function parseCsv(text: string): string[][] {
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
  return rows.filter((r) => r.some((v) => v.trim() !== '')).map((r) => r.map(unsafe))
}
