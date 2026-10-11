import { describe, it, expect, vi } from 'vitest'
import { outlineFromNav, completePayload, reportUnitCompleted, reportUnitViewed } from './progress-sync'

describe('outlineFromNav', () => {
  it('keeps only modules with units, in order', () => {
    expect(outlineFromNav([
      { slug: '01-a', type: 'module', units: [{ slug: 'u1' }, { slug: 'u2' }] },
      { slug: 'cheatsheet', type: 'lesson' },
      { slug: '02-b', type: 'module', units: [] },
      { slug: '03-c', type: 'module', units: [{ slug: 'x' }] },
    ])).toEqual({ '01-a': ['u1', 'u2'], '03-c': ['x'] })
  })
})

describe('completePayload', () => {
  it('unit slug is module/unit, course and outline travel along', () => {
    expect(completePayload({ course: 'demo', moduleSlug: 'm', unitSlug: 'u', outline: { m: ['u'] } }))
      .toEqual({ lesson_slug: 'm/u', course: 'demo', outline: { m: ['u'] } })
  })
})

describe('reportUnitCompleted', () => {
  it('POSTs to the platform progress endpoint with the session cookie', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response('{}'))
    await reportUnitCompleted({ course: 'demo', moduleSlug: 'm', unitSlug: 'u' }, fetchFn)
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/progress/complete')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(JSON.parse(init.body)).toEqual({ lesson_slug: 'm/u', course: 'demo' })
  })

  it('never throws on network failure', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(reportUnitCompleted({ course: 'demo', moduleSlug: 'm', unitSlug: 'u' }, fetchFn)).resolves.toBeUndefined()
  })
})

describe('reportUnitViewed', () => {
  it('POSTs the unit view with the session cookie and course', async () => {
    const fetchFn = vi.fn().mockResolvedValue(new Response('{}'))
    await reportUnitViewed({ course: 'demo', moduleSlug: 'm', unitSlug: 'u' }, fetchFn)
    const [url, init] = fetchFn.mock.calls[0]
    expect(url).toBe('/api/progress/view')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(JSON.parse(init.body)).toEqual({ lesson_slug: 'm/u', course: 'demo' })
  })

  it('never throws on network failure', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(reportUnitViewed({ course: 'demo', moduleSlug: 'm', unitSlug: 'u' }, fetchFn)).resolves.toBeUndefined()
  })
})
