import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseCsv } from '../retreat-core/csv'
import { gridHeader, gridToCsv } from './export'
import { emptyCard } from './practices'

const root = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials')

describe('program grid CSV', () => {
  it('T9 exports a missing practice using its block title', () => {
    const csv = parseCsv(gridToCsv({ nights: 6 }, [{ day: 2, start: '10:00', minutes: 30, kind: 'practice', practiceId: 'gone', title: 'Старая практика' }], [], 'ru'))
    expect(csv[7][2]).toBe('Старая практика')
  })
  it('T11 matches localized templates and an explicit CSV round trip', () => {
    const card = { ...emptyCard('a'), name: 'Старая практика', groupMinutes: 90 }
    const blocks = [{ day: 2, start: '10:00', minutes: 90, kind: 'practice' as const, practiceId: 'a' }, { day: 2, start: '12:00', minutes: 90, kind: 'free' as const }, { day: 3, start: '10:15', minutes: 30, kind: 'transfer' as const }]
    for (const lang of ['ru', 'en'] as const) {
      const output = gridToCsv({ nights: 6 }, blocks, [card], lang); const template = readFileSync(join(root, `program-grid.${lang}.csv`), 'utf8')
      expect(output.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0]).toBe(template.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0])
      const rows = parseCsv(output)
      expect(rows).toHaveLength(33); expect(rows[7][2]).toBe('Старая практика'); expect(rows[8][2]).toBe('↓'); expect(rows[9][2]).toBe('↓'); expect(rows.at(-1)?.[2]).toBe(lang === 'ru' ? '1,5' : '1.5')
      const expected = [gridHeader({ nights: 6 }, lang), ...Array.from({ length: 30 }, (_, i) => [`${String(7 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`, ...(i === 6 ? ['', 'Старая практика', '', '', '', '', ''] : i === 7 || i === 8 ? ['', '↓', '', '', '', '', ''] : i === 10 ? ['', lang === 'ru' ? 'Свободное время' : 'Free time', '', '', '', '', ''] : i === 11 || i === 12 ? ['', '↓', '', '', '', '', ''] : Array(7).fill(''))]), [lang === 'ru' ? 'Нагрузка дня (низкая / средняя / высокая)' : 'Day load (low / medium / high)', '', lang === 'ru' ? 'низкая' : 'low', '', '', '', '', ''], [lang === 'ru' ? 'Свободное время, часов' : 'Free time, hours', '0', lang === 'ru' ? '1,5' : '1.5', '0', '0', '0', '0', '0']]
      expect(rows).toEqual(expected)
    }
  })
  it('starts CSV at an early practice time', () => {
    const early = [{ day: 2, start: '05:30', minutes: 150, kind: 'practice' as const, practiceId: 'a' }]
    const card = { ...emptyCard('a'), name: 'Ранняя практика', groupMinutes: 150 }
    const rows = parseCsv(gridToCsv({ nights: 6 }, early, [card], 'ru'))
    expect(rows[1][0]).toBe('05:30')
    expect(rows[1][2]).toBe('Ранняя практика')
  })
})
