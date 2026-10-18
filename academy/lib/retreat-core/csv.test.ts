import { describe, expect, it } from 'vitest'
import { decodeCsvBytes, parseCsv, toCsv } from './csv'

describe('CSV ядра', () => {
  it('в файле текст, похожий на формулу, — с апострофом; числа со знаком и телефоны — без', () => {
    const csv = toCsv([['=HYPERLINK("x")', '+7 900 123-45-67', '-6', '@sum', '-12,5', '-салат', '+'], ['обычный', '', '', '', '', '', '']], 'en')
    const firstLine = csv.split('\r\n')[0]
    expect(firstLine).toBe(`\uFEFF"'=HYPERLINK(""x"")",+7 900 123-45-67,-6,'@sum,"-12,5",'-салат,'+`)
  })
  it('круг «выгрузил — загрузил» без потерь: апостроф снимается', () => {
    const rows = [['=HYPERLINK("x")', '+7 900 123-45-67', '-6', '@sum', '-салат', '+', "'цитата"]]
    for (const lang of ['ru', 'en'] as const) expect(parseCsv(toCsv(rows, lang))).toEqual(rows)
  })
  it('файл из русского Excel в cp1251 читается, UTF-8 — как есть', () => {
    const cp1251 = Uint8Array.from([0xc3, 0xee, 0xf1, 0xf2, 0xfc, 0x3b, 0x31])     // «Гость;1»
    expect(decodeCsvBytes(cp1251)).toBe('Гость;1')
    expect(decodeCsvBytes(new TextEncoder().encode('Гость;1'))).toBe('Гость;1')
  })
})
