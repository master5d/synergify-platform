import { describe, it, expect } from 'vitest'
import { backfillCompletions, pendingCompletions } from './progress-backfill'

const OUTLINE = { '01-a': ['u1', 'u2'], '02-b': ['u1'] }

function fakeFetch(listStatus: number, rows: unknown) {
  const calls: { url: string; body?: unknown }[] = []
  const fn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined })
    if (url === '/api/progress/list') {
      return { ok: listStatus === 200, status: listStatus, json: async () => rows } as Response
    }
    return { ok: true, status: 200, json: async () => ({}) } as Response
  }) as unknown as typeof fetch
  return { fn, calls }
}

describe('pendingCompletions', () => {
  it('пусто, когда локально ничего не пройдено', () => {
    expect(pendingCompletions({}, new Set(), OUTLINE)).toEqual([])
  })
  it('пусто, когда сервер уже знает всё пройденное', () => {
    const local = { '01-a': { u1: true } }
    expect(pendingCompletions(local, new Set(['01-a/u1']), OUTLINE)).toEqual([])
  })
  it('только недостающее, в порядке курса', () => {
    const local = { '02-b': { u1: true }, '01-a': { u2: true, u1: true } }
    expect(pendingCompletions(local, new Set(['01-a/u1']), OUTLINE))
      .toEqual([{ moduleSlug: '01-a', unitSlug: 'u2' }, { moduleSlug: '02-b', unitSlug: 'u1' }])
  })
  it('юниты другого курса на том же origin не досылаются', () => {
    const local = { '01-living-practice': { u1: true }, '01-a': { u1: true } }
    expect(pendingCompletions(local, new Set(), OUTLINE)).toEqual([{ moduleSlug: '01-a', unitSlug: 'u1' }])
  })
})

describe('backfillCompletions', () => {
  it('после первого 200 от list досылает ровно недостающее завершение с course и outline', async () => {
    const { fn, calls } = fakeFetch(200, [
      { lesson_slug: '01-a/u1', completed_at: 1 },
      { lesson_slug: '01-a/u2', completed_at: null },
    ])
    const local = JSON.stringify({ '01-a': { u1: true, u2: true } })
    const n = await backfillCompletions({ course: 'retreat', outline: OUTLINE, readLocal: () => local, fetchFn: fn })
    expect(n).toBe(1)
    const posts = calls.filter((c) => c.url === '/api/progress/complete')
    expect(posts).toEqual([{ url: '/api/progress/complete', body: { lesson_slug: '01-a/u2', course: 'retreat', outline: OUTLINE } }])
  })
  it('без сессии (401) ничего не шлёт и отвечает null', async () => {
    const { fn, calls } = fakeFetch(401, [])
    const n = await backfillCompletions({ course: 'retreat', outline: OUTLINE, readLocal: () => JSON.stringify({ '01-a': { u1: true } }), fetchFn: fn })
    expect(n).toBeNull()
    expect(calls.map((c) => c.url)).toEqual(['/api/progress/list'])
  })
  it('сеть упала — null и без исключения', async () => {
    const fn = (async () => { throw new Error('offline') }) as unknown as typeof fetch
    await expect(backfillCompletions({ course: 'retreat', outline: OUTLINE, readLocal: () => null, fetchFn: fn })).resolves.toBeNull()
  })
  it('ответ list не массив — null, без исключения', async () => {
    const { fn } = fakeFetch(200, { not: 'an array' })
    await expect(backfillCompletions({ course: 'retreat', outline: OUTLINE, readLocal: () => null, fetchFn: fn })).resolves.toBeNull()
  })
  it('мусор в localStorage — 0, досылать нечего', async () => {
    const { fn } = fakeFetch(200, [])
    await expect(backfillCompletions({ course: 'retreat', outline: OUTLINE, readLocal: () => '{oops', fetchFn: fn })).resolves.toBe(0)
  })
})
