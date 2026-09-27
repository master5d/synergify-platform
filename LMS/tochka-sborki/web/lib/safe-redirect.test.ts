import { describe, expect, it } from 'vitest'
import { isSafeRedirect } from './safe-redirect'

describe('isSafeRedirect', () => {
  it('accepts a same-origin absolute path', () => {
    expect(isSafeRedirect('/lessons/01-introduction/')).toBe(true)
    expect(isSafeRedirect('/en/lessons/01-introduction/?x=1')).toBe(true)
  })

  it('rejects protocol-relative //', () => {
    expect(isSafeRedirect('//evil.com')).toBe(false)
  })

  it('rejects an absolute URL with a scheme', () => {
    expect(isSafeRedirect('https://evil.com')).toBe(false)
    expect(isSafeRedirect('http://x')).toBe(false)
  })

  it('rejects backslashes and path traversal', () => {
    expect(isSafeRedirect('/\\evil.com')).toBe(false)
    expect(isSafeRedirect('/../etc/passwd')).toBe(false)
  })

  it('rejects empty/missing input', () => {
    expect(isSafeRedirect(null)).toBe(false)
    expect(isSafeRedirect(undefined)).toBe(false)
    expect(isSafeRedirect('')).toBe(false)
  })
})
