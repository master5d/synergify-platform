import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { detectSystem, readStoredPref, storePref, resolveTheme, effectiveTheme, THEME_KEY } from './theme-pref'

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

function setMatchMedia(dark: boolean) {
  // detectSystem reads window.matchMedia, so re-stub window too (not just the global).
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: dark, media: q }))
  vi.stubGlobal('window', { matchMedia: (globalThis as { matchMedia: unknown }).matchMedia })
}

describe('theme-pref', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeStorage())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detectSystem returns dark when prefers-color-scheme: dark matches', () => {
    setMatchMedia(true)
    expect(detectSystem()).toBe('dark')
  })

  it('detectSystem returns light when it does not match', () => {
    setMatchMedia(false)
    expect(detectSystem()).toBe('light')
  })

  it('detectSystem falls back to dark with no matchMedia', () => {
    vi.stubGlobal('window', {})
    expect(detectSystem()).toBe('dark')
  })

  it('readStoredPref returns null for missing or garbage values', () => {
    expect(readStoredPref()).toBeNull()
    localStorage.setItem(THEME_KEY, 'sepia')
    expect(readStoredPref()).toBeNull()
  })

  it('readStoredPref round-trips a valid value', () => {
    storePref('light')
    expect(readStoredPref()).toBe('light')
  })

  it('readStoredPref round-trips the system value', () => {
    storePref('system')
    expect(readStoredPref()).toBe('system')
  })

  it('resolveTheme returns the system arg when pref is system', () => {
    expect(resolveTheme('system', 'light')).toBe('light')
    expect(resolveTheme('system', 'dark')).toBe('dark')
  })

  it('resolveTheme returns the explicit pref otherwise', () => {
    expect(resolveTheme('light', 'dark')).toBe('light')
    expect(resolveTheme('dark', 'light')).toBe('dark')
  })

  it('effectiveTheme follows system when nothing is stored', () => {
    setMatchMedia(false) // system = light
    expect(effectiveTheme()).toBe('light')
  })

  it('effectiveTheme honors an explicit stored pref over system', () => {
    setMatchMedia(false) // system = light
    storePref('dark')
    expect(effectiveTheme()).toBe('dark')
  })
})
