import { describe, it, expect } from 'vitest'
import manifest from './manifest'

describe('PWA manifest', () => {
  const m = manifest()

  it('declares a standalone installable app rooted at /', () => {
    expect(m.name).toContain('Точка Сборки')
    expect(m.short_name).toBeTruthy()
    expect(m.display).toBe('standalone')
    expect(m.start_url).toBe('/')
  })

  it('provides 192 and 512 icons plus a maskable one', () => {
    const sizes = (m.icons ?? []).map(i => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
    expect((m.icons ?? []).some(i => (i.purpose ?? '').includes('maskable'))).toBe(true)
  })

  it('sets brand theme/background colors', () => {
    expect(m.theme_color).toBe('#0a0a0f')
    expect(m.background_color).toBe('#0a0a0f')
  })
})
