import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReviewList, SpacedReview, ruDays } from './spaced-review'
import { Cards } from './lesson-views'
import type { DueCard } from '@/lib/spaced-review'
import type { LessonViewsData } from '@/lib/lesson-views/load'

const card = (id: string): DueCard => ({
  key: `m1/${id}`,
  record: { module: 'm1', unit: 'u1', id, box: 1, due: 0, last: 0, correct: true, n: 2, q: {} },
  snapshot: { question: `Вопрос ${id}?`, options: ['Да', 'Нет'], answer: 0, explain: `Объяснение ${id}.` },
})

describe('«Вспомни» — рендер', () => {
  it('нет карточек — блока нет', () => {
    expect(renderToStaticMarkup(<ReviewList cards={[]} locale="ru" />)).toBe('')
  })
  it('на сервере блока нет: выбор идёт из localStorage только в браузере', () => {
    expect(renderToStaticMarkup(<SpacedReview moduleSlug="m2" unitSlug="u1" locale="ru" />)).toBe('')
  })
  it('вопросы видны, варианты — радио, объяснение до ответа скрыто', () => {
    const html = renderToStaticMarkup(<ReviewList cards={[card('c1'), card('c2')]} locale="ru" />)
    expect(html).toContain('Вспомни')
    expect(html).toContain('Вопрос c1?')
    expect(html).toContain('Вопрос c2?')
    expect(html.match(/type="radio"/g)).toHaveLength(4)
    expect(html).toContain('aria-live="polite"')
    expect(html).not.toContain('Объяснение c1.')
    expect(html).not.toContain('— верный ответ')
  })
  it('EN', () => {
    expect(renderToStaticMarkup(<ReviewList cards={[card('c1')]} locale="en" />)).toContain('Recall')
  })
  it('склонение дней', () => {
    expect([1, 3, 7, 21, 11, 22, 25].map(n => `${n} ${ruDays(n)}`)).toEqual(['1 день', '3 дня', '7 дней', '21 день', '11 дней', '22 дня', '25 дней'])
  })
})

describe('Карточки — режим вспоминания', () => {
  const data: LessonViewsData = {
    title: 'X', outline: [], paraphrased: null, summaryDefault: 'verbatim',
    cards: [{ id: 'c1', question: 'Что делать при стоп-сигнале?', answer: 'Остановиться', explain: 'Остановиться и вернуться.', module: 'm1', unit: 'u1', options: ['Остановиться', 'Углубиться'], correctIndex: 0 }],
  }
  it('сначала вопрос и подсказка вспомнить; ответ скрыт до «Показать ответ»; самооценки до показа нет', () => {
    const html = renderToStaticMarkup(<Cards data={data} locale="ru" />)
    expect(html).toContain('Что делать при стоп-сигнале?')
    expect(html).toContain('Сначала вспомни ответ сам')
    expect(html).toContain('Показать ответ')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toMatch(/<div id="[^"]+" hidden=""/)
    // Самооценка живёт внутри скрытого блока ответа.
    const hiddenPart = html.slice(html.search(/<div id="[^"]+" hidden=""/))
    expect(hiddenPart).toContain('Остановиться и вернуться.')
    expect(hiddenPart).toContain('Вспомнил')
  })
})
