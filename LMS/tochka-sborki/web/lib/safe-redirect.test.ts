import { describe, expect, it } from 'vitest'
import { sanitizeInternalPath } from './safe-redirect'

describe('sanitizeInternalPath', () => {
  it.each([
    '/lessons/01-introduction/',
    '/en/lessons/01-introduction/?x=1',
    '/praktika/lessons/01-introduction/',
    '/en/roadmap/',
    '/x?y=1&z=2',
  ])('внутренний путь %s проходит', (p) => {
    expect(sanitizeInternalPath(p)).toBe(p)
  })

  it.each([
    null,
    undefined,
    '',
    '//evil.com',
    '///evil.com',
    'https://evil.com',
    'http://evil.com/x',
    'javascript:alert(1)',
    '/\\evil.com',
    '/\\\\evil.com',
    'evil.com/x',
    '/x\ty',
    '/../etc/passwd',
    '/lessons/../../x',
    '/redirect?to=https://evil.com',
  ])('внешний/битый путь %s отбрасывается', (p) => {
    expect(sanitizeInternalPath(p as string | null)).toBeNull()
  })
})
