import { describe, it, expect, vi } from 'vitest'
import {
  DAY_MS, INTERVAL_DAYS, LAST_BOX, REVIEW_LIMIT,
  answerPayload, applyAnswer, parseStore, pickDue, reviewKey, scheduleNext, storageKey, syncAnswer,
  type ReviewStore,
} from './spaced-review'

const T0 = 1_790_000_000_000
const item = (id: string, unit = 'u1') => ({ id, unit, question: `Q ${id}?`, options: ['a', 'b'], answer: 0, explain: `E ${id}` })

describe('scheduleNext — коробки Лейтнера 1/3/7/21', () => {
  it('интервалы именно 1/3/7/21 дня', () => {
    expect([...INTERVAL_DAYS]).toEqual([1, 3, 7, 21])
    expect(LAST_BOX).toBe(3)
  })
  it('первый ответ — коробка 0, повтор завтра, верный он или нет', () => {
    expect(scheduleNext(null, true, T0)).toEqual({ box: 0, due: T0 + DAY_MS })
    expect(scheduleNext(null, false, T0)).toEqual({ box: 0, due: T0 + DAY_MS })
  })
  it('верный в срок — коробка выше: 0→1 (3 дня), 1→2 (7), 2→3 (21)', () => {
    expect(scheduleNext({ box: 0, due: T0 }, true, T0)).toEqual({ box: 1, due: T0 + 3 * DAY_MS })
    expect(scheduleNext({ box: 1, due: T0 }, true, T0 + 5)).toEqual({ box: 2, due: T0 + 5 + 7 * DAY_MS })
    expect(scheduleNext({ box: 2, due: T0 }, true, T0)).toEqual({ box: 3, due: T0 + 21 * DAY_MS })
  })
  it('последняя коробка — потолок: верный там оставляет раз в 21 день', () => {
    expect(scheduleNext({ box: 3, due: T0 }, true, T0)).toEqual({ box: 3, due: T0 + 21 * DAY_MS })
  })
  it('неверный — в начало из любой коробки, даже раньше срока', () => {
    expect(scheduleNext({ box: 3, due: T0 }, false, T0)).toEqual({ box: 0, due: T0 + DAY_MS })
    expect(scheduleNext({ box: 2, due: T0 + 9 * DAY_MS }, false, T0)).toEqual({ box: 0, due: T0 + DAY_MS })
  })
  it('верный раньше срока — ничего не меняет (не повтор через паузу)', () => {
    expect(scheduleNext({ box: 1, due: T0 + DAY_MS }, true, T0)).toEqual({ box: 1, due: T0 + DAY_MS })
  })
})

describe('applyAnswer', () => {
  it('кладёт запись с копией вопроса, временем и счётчиком; вход не мутирует', () => {
    const s0: ReviewStore = {}
    const s1 = applyAnswer(s0, { module: 'm1', item: item('c1'), correct: false, locale: 'ru', now: T0 })
    expect(s0).toEqual({})
    const r = s1[reviewKey('m1', 'c1')]
    expect(r).toMatchObject({ module: 'm1', unit: 'u1', id: 'c1', box: 0, due: T0 + DAY_MS, last: T0, correct: false, n: 1 })
    expect(r.q.ru).toEqual({ question: 'Q c1?', options: ['a', 'b'], answer: 0, explain: 'E c1' })
    const s2 = applyAnswer(s1, { module: 'm1', item: item('c1'), correct: true, locale: 'en', now: T0 + DAY_MS })
    expect(s2[reviewKey('m1', 'c1')]).toMatchObject({ box: 1, n: 2, correct: true })
    expect(Object.keys(s2[reviewKey('m1', 'c1')].q).sort()).toEqual(['en', 'ru'])
  })
  it('одинаковый id в разных модулях — разные записи', () => {
    const s = applyAnswer(applyAnswer({}, { module: 'm1', item: item('c1'), correct: true, locale: 'ru', now: T0 }),
      { module: 'm2', item: item('c1'), correct: true, locale: 'ru', now: T0 })
    expect(Object.keys(s).sort()).toEqual(['m1/c1', 'm2/c1'])
  })
})

describe('parseStore', () => {
  it('пусто и мусор — пустое хранилище', () => {
    for (const raw of [null, '', '{', '"x"', '[1]', 'null', '42']) expect(parseStore(raw)).toEqual({})
  })
  it('отбрасывает битые записи, чинит коробку, сохраняет годные', () => {
    const good = applyAnswer({}, { module: 'm1', item: item('c1'), correct: true, locale: 'ru', now: T0 })
    const raw = JSON.stringify({
      ...good,
      'm1/bad': { module: 'm1', unit: 'u1', id: 'bad' },                                   // нет due/last
      'm9/zz': { module: 'm1', unit: 'u1', id: 'c2', due: 1, last: 1 },                     // ключ не совпал
      'm1/c3': { module: 'm1', unit: 'u1', id: 'c3', due: 1, last: 1, box: 99, q: { ru: { question: 'q', options: ['x'], answer: 5, explain: '' } } },
    })
    const s = parseStore(raw)
    expect(Object.keys(s).sort()).toEqual(['m1/c1', 'm1/c3'])
    expect(s['m1/c1']).toEqual(good['m1/c1'])
    expect(s['m1/c3'].box).toBe(LAST_BOX)
    expect(s['m1/c3'].q).toEqual({})     // answer вне options — копия отброшена
  })
  it('ключ хранилища — на курс', () => {
    expect(storageKey('tochka-sborki')).not.toBe(storageKey('living-practice'))
  })
})

describe('pickDue — что повторить сейчас', () => {
  const build = () => {
    let s: ReviewStore = {}
    const add = (module: string, id: string, unit: string, now: number, locale: 'ru' | 'en' = 'ru') => {
      s = applyAnswer(s, { module, item: item(id, unit), correct: true, locale, now })
    }
    add('m1', 'c1', 'u1', T0 - 5 * DAY_MS)       // due T0-4d
    add('m1', 'c2', 'u2', T0 - 2 * DAY_MS)       // due T0-1d
    add('m2', 'c3', 'u1', T0 - 3 * DAY_MS)       // due T0-2d
    add('m2', 'c4', 'u2', T0)                    // due завтра — рано
    add('m3', 'c5', 'u1', T0 - 9 * DAY_MS)       // юнит не пройден
    add('m1', 'c6', 'u3', T0 - 9 * DAY_MS, 'en') // только EN-копия
    return s
  }
  const done = (m: string, u: string) => m !== 'm3'
  const current = { module: 'm9', unit: 'u9' }

  it('только подошедшие по сроку и из пройденных юнитов; просроченные первыми; не больше лимита', () => {
    const got = pickDue(build(), { now: T0, locale: 'ru', current, isCompleted: done })
    expect(got.map(c => c.key)).toEqual(['m1/c6', 'm1/c1', 'm2/c3'])
    expect(got).toHaveLength(REVIEW_LIMIT)
  })
  it('нет копии на языке страницы — берётся другая', () => {
    const got = pickDue(build(), { now: T0, locale: 'ru', current, isCompleted: done })
    expect(got[0].snapshot.question).toBe('Q c6?')
  })
  it('вопросы текущего юнита не повторяются в нём же', () => {
    const got = pickDue(build(), { now: T0, locale: 'ru', current: { module: 'm1', unit: 'u3' }, isCompleted: done, limit: 10 })
    expect(got.map(c => c.key)).not.toContain('m1/c6')
    expect(got.map(c => c.key)).toEqual(['m1/c1', 'm2/c3', 'm1/c2'])
  })
  it('при равном сроке сначала нижняя коробка', () => {
    let s: ReviewStore = {}
    s = applyAnswer(s, { module: 'm1', item: item('hi'), correct: true, locale: 'ru', now: T0 - 10 * DAY_MS })
    s = applyAnswer(s, { module: 'm1', item: item('hi'), correct: true, locale: 'ru', now: T0 - 9 * DAY_MS })   // box 1, due T0-6d
    s = applyAnswer(s, { module: 'm1', item: item('lo'), correct: true, locale: 'ru', now: T0 - 7 * DAY_MS })   // box 0, due T0-6d
    const got = pickDue(s, { now: T0, locale: 'ru', current, isCompleted: () => true })
    expect(got.map(c => c.key)).toEqual(['m1/lo', 'm1/hi'])
  })
  it('пустые случаи: нет записей, ничего не пройдено, ничего не подошло', () => {
    expect(pickDue({}, { now: T0, locale: 'ru', current, isCompleted: () => true })).toEqual([])
    expect(pickDue(build(), { now: T0, locale: 'ru', current, isCompleted: () => false })).toEqual([])
    expect(pickDue(build(), { now: T0 - 30 * DAY_MS, locale: 'ru', current, isCompleted: () => true })).toEqual([])
  })
})

describe('syncAnswer — копия ответа на сервер (POST /api/checks/answer)', () => {
  const a = { course: 'tochka-sborki', module: 'm1', unit: 'u1', checkId: 'c1', correct: true, source: 'review' as const }
  it('тело — в формате воркера (check_id, source)', () => {
    expect(answerPayload(a)).toEqual({ course: 'tochka-sborki', module: 'm1', unit: 'u1', check_id: 'c1', correct: true, source: 'review' })
  })
  it('аноним — запроса нет вовсе', async () => {
    const f = vi.fn()
    await syncAnswer(false, a, f as unknown as typeof fetch)
    expect(f).not.toHaveBeenCalled()
  })
  it('вошедший — один POST с куками на /api/checks/answer', async () => {
    const f = vi.fn().mockResolvedValue(new Response('{}'))
    await syncAnswer(true, a, f as unknown as typeof fetch)
    expect(f).toHaveBeenCalledTimes(1)
    const [url, init] = f.mock.calls[0]
    expect(url).toBe('/api/checks/answer')
    expect(init).toMatchObject({ method: 'POST', credentials: 'include' })
    expect(JSON.parse(init.body)).toEqual(answerPayload(a))
  })
  it('сеть упала / сервер 500 — не бросает', async () => {
    await expect(syncAnswer(true, a, vi.fn().mockRejectedValue(new TypeError('offline')) as unknown as typeof fetch)).resolves.toBeUndefined()
    await expect(syncAnswer(true, a, vi.fn().mockResolvedValue(new Response('', { status: 500 })) as unknown as typeof fetch)).resolves.toBeUndefined()
  })
})
