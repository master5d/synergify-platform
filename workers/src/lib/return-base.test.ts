import { describe, it, expect } from 'vitest'
import { resolveReturnBase, safeBasePath } from './return-base'

describe('resolveReturnBase (ссылка из письма ведёт на сайт курса из LMS/registry.json)', () => {
  it('accepts the exact site of a registered course and names that course', () => {
    const r = resolveReturnBase('https://academy.synergify.com/praktika')
    expect(r.base).toBe('https://academy.synergify.com/praktika')
    expect(r.course.slug).toBe('living-practice')
    expect(resolveReturnBase('https://academy.synergify.com/praktika/').base).toBe('https://academy.synergify.com/praktika')
  })

  it('defaults to Точка Сборки for anything else (no open redirect through the email)', () => {
    for (const raw of [undefined, '', 'https://evil.example', 'https://academy.synergify.com/praktika/../x', 'javascript:alert(1)', 42]) {
      const r = resolveReturnBase(raw)
      expect(r.base).toBe('https://ai.synergify.com')
      expect(r.course.slug).toBe('tochka-sborki')
    }
  })
})

describe('safeBasePath', () => {
  it('allows only a single /slug segment', () => {
    expect(safeBasePath('/praktika')).toBe('/praktika')
    expect(safeBasePath(null)).toBe('')
    expect(safeBasePath('')).toBe('')
    for (const bad of ['//evil.com', '/a/b', '/../x', 'praktika', '/PRAKTIKA', '/a b', 'https://x']) {
      expect(safeBasePath(bad), bad).toBe('')
    }
  })
})
