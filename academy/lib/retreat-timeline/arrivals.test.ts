import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { arrivalsToCsv, checkArrivals, emptyArrival, parseArrivalsCsv, type ArrivalRow } from './arrivals'

const row = (over: Partial<ArrivalRow>): ArrivalRow => ({ ...emptyArrival(), meetBy: 'трансфер площадки', ...over })
const PASSPORT = { start: '2027-05-10', nights: 6 }

describe('лист прибытия — CSV', () => {
  it('круг arrivalsToCsv → parseArrivalsCsv на обоих языках', () => {
    const rows = [row({ guest: 'Гость 1', flightIn: 'XX 101', dateIn: '2027-05-10', meetPoint: 'Терминал 2; выход B' })]
    for (const lang of ['ru', 'en'] as const) expect(parseArrivalsCsv(arrivalsToCsv(rows, lang))).toEqual(rows)
  })
  it('CSV из таблицы: BOM, запятая, кавычки с разделителем и переводом строки', () => {
    const text = '﻿Guest,Phone on the way,Arrival flight\r\n"Guest, 1",+1,"XX 1\nlate"\r\n'
    const [r] = parseArrivalsCsv(text)
    expect(r.guest).toBe('Guest, 1')
    expect(r.flightIn).toBe('XX 1\nlate')
  })
  it('даты из RU-таблиц (ДД.ММ.ГГГГ) приводятся к ISO, американские М/Д не угадываются', () => {
    const text = '﻿Гость;Телефон в дороге;Рейс прибытия;Дата прибытия;Время прибытия;Аэропорт;Кто встречает;Место встречи;Рейс отъезда;Дата отъезда\r\n'
      + 'Гость 1;;;9.5.2027;;;трансфер;;;16.05.2027\r\nГость 2;;;05/09/2027;;;трансфер;;;\r\n'
    const [a, b] = parseArrivalsCsv(text)
    expect([a.dateIn, a.dateOut]).toEqual(['2027-05-09', '2027-05-16'])
    expect(b.dateIn).toBe('05/09/2027')
    expect(checkArrivals([a, b], PASSPORT)).toEqual([{ row: 2, id: 'bad-date' }])
  })
  it('шаблон курса читается: заголовок пропущен, пустые строки отброшены', () => {
    const tpl = readFileSync(join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials', 'arrival-list.ru.csv'), 'utf8')
    expect(parseArrivalsCsv(tpl)).toEqual([])
  })
})

describe('лист прибытия — проверки', () => {
  it('дата, набранная руками как ДД.ММ.ГГГГ, проверяется как ISO', () => {
    expect(checkArrivals([row({ dateIn: '11.05.2027' })], PASSPORT)).toEqual([{ row: 1, id: 'arrival-after-start' }])
  })
  it('каждая проблема — в своей строке', () => {
    const rows = [
      row({ dateIn: '2027-05-11' }),                         // 1: после старта
      row({ dateIn: '2027-05-07' }),                         // 2: слишком рано
      row({ dateIn: '2027-05-10', dateOut: '2027-05-15' }),  // 3: уезжает до конца
      row({ dateIn: '2027-05-09', meetBy: '' }),             // 4: никто не встречает
      row({ dateIn: '05/10/2027' }),                         // 5: американский М/Д — не угадываем
      row({ dateIn: '2027-05-08', dateOut: '2027-05-16' }),  // 6: всё в порядке
    ]
    expect(checkArrivals(rows, PASSPORT)).toEqual([
      { row: 1, id: 'arrival-after-start' },
      { row: 2, id: 'arrival-too-early' },
      { row: 3, id: 'departure-before-end' },
      { row: 4, id: 'no-meeter' },
      { row: 5, id: 'bad-date' },
    ])
  })
})
