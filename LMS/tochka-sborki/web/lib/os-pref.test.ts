import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectOs, readStoredOs, effectiveOs, storeOs } from './os-pref'

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

function setNavigator(platform: string) {
  vi.stubGlobal('navigator', { platform, userAgent: platform })
}

describe('os-pref', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeStorage())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detects mac from platform', () => {
    setNavigator('MacIntel')
    expect(detectOs()).toBe('mac')
  })

  it('detects windows from platform', () => {
    setNavigator('Win32')
    expect(detectOs()).toBe('windows')
  })

  it('falls back to windows for unknown platforms', () => {
    setNavigator('Linux x86_64')
    expect(detectOs()).toBe('windows')
  })

  it('readStoredOs returns null when nothing valid is stored', () => {
    expect(readStoredOs()).toBeNull()
    localStorage.setItem('os', 'beos')
    expect(readStoredOs()).toBeNull()
  })

  it('effectiveOs prefers the stored choice over detection', () => {
    setNavigator('MacIntel') // would detect mac
    storeOs('windows')
    expect(effectiveOs()).toBe('windows')
  })

  it('effectiveOs falls back to detection when nothing is stored', () => {
    setNavigator('MacIntel')
    expect(effectiveOs()).toBe('mac')
  })
})
