import { describe, it, expect } from 'vitest'
import {
  plainLabel, PLAIN_OVERRIDES, SKILL_GATING_NOTE, RPG_MODE_KEY,
  readStoredRpgMode, storeRpgMode, effectiveRpgMode, type OverrideKey,
} from './rpg-mode'

const KEYS: OverrideKey[] = ['navQuestLog', 'enterQuestLog', 'sheetName', 'currency']

describe('rpg-mode', () => {
  it('plain mode returns the override', () => {
    expect(plainLabel('plain', 'ru', 'navQuestLog', '⬡ Квест-лог')).toBe('Мои уроки')
    expect(plainLabel('plain', 'en', 'currency', 'shards')).toBe('points')
  })

  it('rpg mode returns the fallback unchanged', () => {
    expect(plainLabel('rpg', 'ru', 'navQuestLog', '⬡ Квест-лог')).toBe('⬡ Квест-лог')
    expect(plainLabel('rpg', 'en', 'currency', 'shards')).toBe('shards')
  })

  it('every override key exists for both locales', () => {
    for (const key of KEYS) {
      expect(PLAIN_OVERRIDES.ru[key]).toBeTruthy()
      expect(PLAIN_OVERRIDES.en[key]).toBeTruthy()
    }
  })

  it('skill-gating note exists for both locales', () => {
    expect(SKILL_GATING_NOTE.ru).toBeTruthy()
    expect(SKILL_GATING_NOTE.en).toBeTruthy()
  })
})

/**
 * Хранилищная половина — то, на чём стоит хук `useRpgMode`. Логики немного, но
 * каждый её отказ выглядит одинаково: страница просто рендерится в игровом
 * режиме, и человек, выбравший обычный язык, снова видит «квест-лог».
 *
 * Тесты подменяют localStorage напрямую: браузерного окружения в сюите нет,
 * и хук без него не поднять — а вызываемые им функции проверить можно.
 */
function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => { data[k] = String(v) },
    removeItem: (k: string) => { delete data[k] },
    clear: () => { for (const k of Object.keys(data)) delete data[k] },
    key: (i: number) => Object.keys(data)[i] ?? null,
    get length() { return Object.keys(data).length },
  } as Storage
}

function withStorage(storage: Storage | undefined, run: () => void) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage, configurable: true, writable: true,
  })
  try {
    run()
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete (globalThis as { localStorage?: Storage }).localStorage
  }
}

describe('rpg-mode: чтение предпочтения', () => {
  it('сохранённый выбор возвращается как есть', () => {
    withStorage(fakeStorage({ [RPG_MODE_KEY]: 'plain' }), () => {
      expect(readStoredRpgMode()).toBe('plain')
      expect(effectiveRpgMode()).toBe('plain')
    })
  })

  it('пустое хранилище — игровой режим по умолчанию', () => {
    withStorage(fakeStorage(), () => {
      expect(readStoredRpgMode()).toBeNull()
      expect(effectiveRpgMode()).toBe('rpg')
    })
  })

  it('мусор в ключе не становится режимом', () => {
    withStorage(fakeStorage({ [RPG_MODE_KEY]: 'ПЛЕЙН' }), () => {
      expect(readStoredRpgMode()).toBeNull()
      expect(effectiveRpgMode()).toBe('rpg')
    })
  })

  it('на сервере (localStorage нет) не падает, а отдаёт игровой режим', () => {
    withStorage(undefined, () => {
      expect(effectiveRpgMode()).toBe('rpg')
    })
  })

  it('запрет на хранилище (приватный режим) тоже не роняет страницу', () => {
    const hostile = {
      getItem() { throw new DOMException('denied') },
      setItem() { throw new DOMException('denied') },
    } as unknown as Storage
    withStorage(hostile, () => {
      expect(effectiveRpgMode()).toBe('rpg')
      expect(() => storeRpgMode('plain')).not.toThrow()
    })
  })

  it('записанный режим читается обратно', () => {
    withStorage(fakeStorage(), () => {
      storeRpgMode('plain')
      expect(effectiveRpgMode()).toBe('plain')
      storeRpgMode('rpg')
      expect(effectiveRpgMode()).toBe('rpg')
    })
  })
})
