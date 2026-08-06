import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { resolveLite, readStoredPref, storePref, effectiveLite, detectSaveData, LITE_KEY } from './lite-pref'

function makeStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => (m.has(k) ? m.get(k)! : null),
    setItem: (k, v) => void m.set(k, String(v)),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: (i) => Array.from(m.keys())[i] ?? null,
    get length() { return m.size },
  } as Storage
}

describe('resolveLite', () => {
  it("'on' is always lite", () => { expect(resolveLite('on', false)).toBe(true); expect(resolveLite('on', true)).toBe(true) })
  it("'off' is never lite", () => { expect(resolveLite('off', true)).toBe(false); expect(resolveLite('off', false)).toBe(false) })
  it("'auto' follows saveData", () => { expect(resolveLite('auto', true)).toBe(true); expect(resolveLite('auto', false)).toBe(false) })
})

describe('readStoredPref / storePref', () => {
  beforeEach(() => vi.stubGlobal('localStorage', makeStorage()))
  afterEach(() => vi.unstubAllGlobals())
  it('returns null when unset', () => expect(readStoredPref()).toBeNull())
  it('returns null for a junk value', () => { localStorage.setItem(LITE_KEY, 'nope'); expect(readStoredPref()).toBeNull() })
  it('round-trips valid values', () => {
    storePref('on'); expect(readStoredPref()).toBe('on')
    storePref('auto'); expect(readStoredPref()).toBe('auto')
    storePref('off'); expect(readStoredPref()).toBe('off')
  })
})

describe('detectSaveData', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('false when no navigator', () => { vi.stubGlobal('navigator', undefined); expect(detectSaveData()).toBe(false) })
  it('false when no connection API', () => { vi.stubGlobal('navigator', {}); expect(detectSaveData()).toBe(false) })
  it('true on saveData', () => { vi.stubGlobal('navigator', { connection: { saveData: true } }); expect(detectSaveData()).toBe(true) })
  it('true on 2g effectiveType', () => { vi.stubGlobal('navigator', { connection: { effectiveType: '2g' } }); expect(detectSaveData()).toBe(true) })
  it('true on slow-2g effectiveType', () => { vi.stubGlobal('navigator', { connection: { effectiveType: 'slow-2g' } }); expect(detectSaveData()).toBe(true) })
  it('false on 4g', () => { vi.stubGlobal('navigator', { connection: { effectiveType: '4g' } }); expect(detectSaveData()).toBe(false) })
})

describe('effectiveLite', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', makeStorage()); vi.stubGlobal('navigator', {}) })
  afterEach(() => vi.unstubAllGlobals())
  it('defaults to auto → saveData (false when no connection)', () => expect(effectiveLite()).toBe(false))
  it("explicit 'on' overrides a fast connection", () => { storePref('on'); expect(effectiveLite()).toBe(true) })
  it("explicit 'off' overrides saveData", () => {
    vi.stubGlobal('navigator', { connection: { saveData: true } })
    storePref('off'); expect(effectiveLite()).toBe(false)
  })
})
