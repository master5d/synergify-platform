import { describe, it, expect, afterEach, vi } from 'vitest'
import { isIos, isInStandaloneMode } from './pwa'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('isIos', () => {
  it('is true for an iPhone user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari', maxTouchPoints: 5 })
    expect(isIos()).toBe(true)
  })

  it('is false for a desktop user agent', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', maxTouchPoints: 0 })
    expect(isIos()).toBe(false)
  })

  it('is false when navigator is undefined (SSR)', () => {
    vi.stubGlobal('navigator', undefined)
    expect(isIos()).toBe(false)
  })
})

describe('isInStandaloneMode', () => {
  it('is true when display-mode standalone matches', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })
    vi.stubGlobal('navigator', { standalone: false })
    expect(isInStandaloneMode()).toBe(true)
  })

  it('is true on iOS when navigator.standalone is set', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })
    vi.stubGlobal('navigator', { standalone: true })
    expect(isInStandaloneMode()).toBe(true)
  })

  it('is false in a normal browser tab', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) })
    vi.stubGlobal('navigator', { standalone: false })
    expect(isInStandaloneMode()).toBe(false)
  })

  it('is false when window is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    expect(isInStandaloneMode()).toBe(false)
  })
})
