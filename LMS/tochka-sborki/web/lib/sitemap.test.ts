import { describe, it, expect } from 'vitest'
import { buildSitemap } from './sitemap'

const BASE = 'https://ai.synergify.com'

describe('buildSitemap', () => {
  it('pairs each path with ru / en / x-default hreflang alternates', () => {
    const [entry] = buildSitemap(['/roadmap/'], BASE)
    expect(entry.url).toBe(`${BASE}/roadmap/`)
    expect(entry.alternates?.languages?.ru).toBe(`${BASE}/roadmap/`)
    expect(entry.alternates?.languages?.en).toBe(`${BASE}/en/roadmap/`)
    expect(entry.alternates?.languages?.['x-default']).toBe(`${BASE}/roadmap/`)
  })

  it('handles the root path without doubling slashes', () => {
    const [entry] = buildSitemap(['/'], BASE)
    expect(entry.url).toBe(`${BASE}/`)
    expect(entry.alternates?.languages?.en).toBe(`${BASE}/en/`)
  })

  it('returns an empty sitemap for no paths', () => {
    expect(buildSitemap([], BASE)).toEqual([])
  })

  it('preserves nested unit paths', () => {
    const [entry] = buildSitemap(['/lessons/01-intro/u1-hello/'], BASE)
    expect(entry.url).toBe(`${BASE}/lessons/01-intro/u1-hello/`)
    expect(entry.alternates?.languages?.en).toBe(`${BASE}/en/lessons/01-intro/u1-hello/`)
  })
})
