import { describe, it, expect } from 'vitest'
import {
  MIRROR_PROGRESS_KEY, parseLessonProgress, nextLessonState, loadLessonProgress, saveLessonProgress,
} from './mirror-progress'

describe('mirror-progress', () => {
  it('разбирает валидное и чинит мусор', () => {
    expect(parseLessonProgress('{"a":"viewed","b":"completed"}')).toEqual({ a: 'viewed', b: 'completed' })
    expect(parseLessonProgress('{"a":"weird","b":1}')).toEqual({})
    expect(parseLessonProgress('[1,2]')).toEqual({})
    expect(parseLessonProgress('{oops')).toEqual({})
    expect(parseLessonProgress(null)).toEqual({})
  })
  it('viewed не понижает completed, completed — всегда', () => {
    expect(nextLessonState({ a: 'completed' }, 'a', 'viewed')).toEqual({ a: 'completed' })
    expect(nextLessonState({}, 'a', 'viewed')).toEqual({ a: 'viewed' })
    expect(nextLessonState({ a: 'viewed' }, 'a', 'completed')).toEqual({ a: 'completed' })
  })
  it('хранилище бросает — не падаем', () => {
    const throwing = { getItem: () => { throw new Error('denied') }, setItem: () => { throw new Error('denied') } }
    expect(loadLessonProgress(throwing)).toEqual({})
    expect(() => saveLessonProgress(throwing, { a: 'viewed' })).not.toThrow()
    expect(loadLessonProgress(null)).toEqual({})
  })
  it('пишет и читает под своим ключом', () => {
    const store = new Map<string, string>()
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => { store.set(k, v) } }
    saveLessonProgress(s, { 'x/y': 'completed' })
    expect([...store.keys()]).toEqual([MIRROR_PROGRESS_KEY])
    expect(loadLessonProgress(s)).toEqual({ 'x/y': 'completed' })
  })
})
