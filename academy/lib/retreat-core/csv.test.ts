import { describe, expect, it } from 'vitest'
import { parseCsv, toCsv } from './csv'

describe('CSV ядра', () => {
  it('текст, похожий на формулу, получает апостроф; числа со знаком — нет', () => {
    const csv = toCsv([['=HYPERLINK("x")', '+7 900', '-6', '@sum', '-12,5', 'обычный'], ['-салат', '+', '1', '', '', '']], 'en')
    const rows = parseCsv(csv)
    expect(rows[0]).toEqual(["'=HYPERLINK(\"x\")", "'+7 900", '-6', "'@sum", '-12,5', 'обычный'])
    expect(rows[1].slice(0, 3)).toEqual(["'-салат", "'+", '1'])
  })
})
