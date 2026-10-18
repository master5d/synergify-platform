// CSV для таблиц инструментов ведущего: UTF-8 с BOM (иначе Excel по двойному щелчку ломает кириллицу), разделитель — по локали,
// как у шаблонов курса: RU «;», EN «,» (Excel берёт разделитель из региональных настроек).

import type { Lang } from '../retreat-calc/engine'

export const BOM = '\uFEFF'
export const separatorFor = (lang: Lang) => (lang === 'ru' ? ';' : ',')

function cell(v: string, sep: string): string {
  return v.includes(sep) || v.includes('"') || v.includes('\n') || v.includes('\r') ? `"${v.replace(/"/g, '""')}"` : v
}

export function toCsv(rows: string[][], lang: Lang): string {
  const sep = separatorFor(lang)
  return BOM + rows.map((r) => r.map((v) => cell(v, sep)).join(sep)).join('\r\n') + '\r\n'
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
  return rows.filter((r) => r.some((v) => v.trim() !== ''))
}
