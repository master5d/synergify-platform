import { describe, expect, it } from 'vitest'
import { toCsv } from '../retreat-core/csv'
import { arrivalsToCsv, ARRIVAL_CSV_HEADER } from '../retreat-timeline/arrivals'
import { arrivalsOf, chefToCsv, matchColumns, readAnswers, safetyToCsv, summarize, type SummaryIssueId } from './answers'
import { summaryIssueText } from './labels'
import { DEFAULT_ON, QUESTIONS, type QuestionId } from './questions'

const q = (id: QuestionId) => QUESTIONS.find((x) => x.id === id)!
const COLS: QuestionId[] = ['name', 'phone', 'emergency', 'dateIn', 'pickup', 'diet', 'allergySeverity']
const ON = COLS

/** Ответы, как их выгружает Google Forms: «Отметка времени» и полный текст вопросов. */
function formsCsv(rows: string[][]): string {
  return toCsv([['Отметка времени', ...COLS.map((id) => q(id).text.ru)], ...rows.map((r) => ['14.03.2028 10:00:00', ...r])], 'ru')
}
const row = (name: string, diet: string, extra: Partial<Record<QuestionId, string>> = {}) =>
  COLS.map((id) => (id === 'name' ? name : id === 'diet' ? diet : extra[id] ?? (id === 'emergency' ? 'Сестра, +7 900 000-00-00' : '')))

const ids = (issues: { id: SummaryIssueId }[]) => issues.map((i) => i.id)

describe('сопоставление колонок', () => {
  it('заголовки Google Forms и шаблона узнаются; «Отметка времени» — нет', () => {
    const t = readAnswers(formsCsv([]))
    expect(matchColumns(t.header, ON)).toEqual({ name: 1, phone: 2, emergency: 3, dateIn: 4, pickup: 5, diet: 6, allergySeverity: 7 })
    expect(matchColumns(['Guest', 'Diet', '3. Emergency contact:'], ON)).toEqual({ name: 0, diet: 1, emergency: 2 })
  })
  it('переименованная колонка — missing-column; ручная карта её возвращает', () => {
    const text = formsCsv([row('Анна К.', 'веган')]).replace(q('diet').text.ru, 'Ваше питание')
    const t = readAnswers(text)
    const auto = matchColumns(t.header, ON)
    expect(auto.diet).toBeUndefined()
    expect(summarize(t, auto, ON).issues).toContainEqual({ id: 'missing-column', question: 'diet' })
    const fixed = summarize(t, { ...auto, diet: 6 }, ON)
    expect(ids(fixed.issues)).not.toContain('missing-column')
    expect(fixed.diets).toEqual({ vegan: 1 })
  })
})

describe('сводка диет', () => {
  it('варианты на любом языке, «другое» с текстом и ответ вне вариантов', () => {
    const t = readAnswers(formsCsv([
      row('Анна К.', 'всё'), row('Борис Л.', 'everything'), row('Вера М.', 'Всё'),
      row('Глеб Н.', 'веган'), row('Дина О.', 'vegan'), row('Егор П.', 'без глютена'),
      row('Жанна Р.', 'пескетарианец'), row('Захар С.', 'Other: без лактозы'),
    ]))
    const s = summarize(t, matchColumns(t.header, ON), ON)
    expect(s.diets).toEqual({ standard: 3, vegan: 2, 'gluten-free': 1, other: 2 })
    expect(s.otherDiets).toEqual([{ guest: 'Жанна Р.', row: 8, text: 'пескетарианец' }, { guest: 'Захар С.', row: 9, text: 'без лактозы' }])
    expect(s.issues.filter((i) => i.id === 'unknown-choice')).toEqual([{ id: 'unknown-choice', row: 8, question: 'diet' }])
  })
  it('повторная отправка: остаётся последняя строка, гость один', () => {
    const t = readAnswers(formsCsv([row('Анна К.', 'веган'), row('Борис Л.', 'всё'), row('анна к. ', 'всё')]))
    const s = summarize(t, matchColumns(t.header, ON), ON)
    expect(s.guests.map((g) => g.row)).toEqual([4, 3])
    expect(s.diets).toEqual({ standard: 2 })
    expect(s.issues).toContainEqual({ id: 'duplicate-guest', row: 2, guest: 'анна к.' })
  })
  it('вытесненная повтором строка уносит свои проблемы; номер строки не сдвигается после пустой строки', () => {
    const text = formsCsv([row('Анна К.', 'пескетарианец'), row('Борис Л.', 'всё'), row('Анна К.', 'всё')]).replace('\r\n', '\r\n;;;;;;;;\r\n')
    const t = readAnswers(text)
    const s = summarize(t, matchColumns(t.header, ON), ON)
    expect(s.guests.map((g) => g.row)).toEqual([5, 4])
    expect(s.issues).toEqual([{ id: 'duplicate-guest', row: 3, guest: 'Анна К.' }])
  })
  it('строка без имени — «Гость из строки N» и no-name', () => {
    const t = readAnswers(formsCsv([row('', 'всё')]))
    const s = summarize(t, matchColumns(t.header, ON), ON)
    expect(s.issues).toContainEqual({ id: 'no-name', row: 2 })
    expect(arrivalsOf(s, 'ru')[0].guest).toBe('Гость из строки 2')
  })
})

describe('лист прибытия и проверки', () => {
  it('даты ДД.ММ.ГГГГ — в ISO, американские — как есть; «нужна встреча» — в примечании', () => {
    const t = readAnswers(formsCsv([row('Анна К.', 'всё', { dateIn: '14.05.2028', pickup: 'да' }), row('Борис Л.', 'всё', { dateIn: '5/14/2028', pickup: 'no' })]))
    const a = arrivalsOf(summarize(t, matchColumns(t.header, ON), ON), 'ru')
    expect(a.map((r) => [r.dateIn, r.note])).toEqual([['2028-05-14', 'нужна встреча'], ['5/14/2028', '']])
    expect(a[0].meetBy).toBe('')
    expect(arrivalsToCsv(a, 'ru').split('\r\n')[0]).toBe('\uFEFF' + ARRIVAL_CSV_HEADER.ru.join(';'))
  })
  it('пустой экстренный контакт, опасная аллергия и ответов больше, чем гостей', () => {
    const t = readAnswers(formsCsv([row('Анна К.', 'всё', { emergency: ' ', allergySeverity: 'опасно для жизни' }), row('Борис Л.', 'всё')]))
    const s = summarize(t, matchColumns(t.header, ON), ON, 1)
    expect(s.issues).toEqual(expect.arrayContaining([
      { id: 'no-emergency', row: 2, guest: 'Анна К.' },
      { id: 'severe-allergy', row: 2, guest: 'Анна К.' },
      { id: 'more-answers-than-guests' },
    ]))
    expect(ids(summarize(t, matchColumns(t.header, ON), ON, 2).issues)).not.toContain('more-answers-than-guests')
  })
  it('файлы шефу и «важно знать»: BOM, заголовок локали, строка на гостя, без чужих колонок', () => {
    const t = readAnswers(formsCsv([row('Анна К.', 'Other: без лактозы', { allergySeverity: 'severe' })]))
    const s = summarize(t, matchColumns(t.header, DEFAULT_ON), DEFAULT_ON)
    const chef = chefToCsv(s, 'en').split('\r\n')
    expect(chef[0]).toBe('\uFEFFGuest,Diet,Allergies,How serious,Does not eat')
    expect(chef[1]).toBe('Анна К.,other: без лактозы,,life-threatening,')
    const safety = safetyToCsv(s, 'ru').split('\r\n')
    expect(safety[0]).toBe('\uFEFFГость;Телефон в дороге;Экстренный контакт;Аллергии;Насколько серьёзно;Нагрузка;Дыхательные практики;Касание;Страховка;Фото и видео')
    expect(safety[0]).not.toContain('Питание')
    expect(safety.filter(Boolean)).toHaveLength(2)
  })
})

describe('тексты проблем сводки', () => {
  const ALL: SummaryIssueId[] = ['missing-column', 'duplicate-guest', 'unknown-choice', 'no-emergency', 'more-answers-than-guests', 'severe-allergy', 'no-name']
  it('у каждой есть текст RU и EN, фразы короче 25 слов', () => {
    for (const lang of ['ru', 'en'] as const) {
      for (const id of ALL) {
        const t = summaryIssueText({ id, row: 3, question: 'diet', guest: 'Анна К.' }, lang)
        expect(t.length).toBeGreaterThan(0)
        for (const s of t.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length).toBeLessThan(25)
      }
    }
  })
})
