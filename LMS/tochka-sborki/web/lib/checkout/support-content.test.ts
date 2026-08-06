import { describe, it, expect } from 'vitest'
import { buildSupportContent } from './support-content'

describe('buildSupportContent', () => {
  it('differs by locale and carries the preset cents', () => {
    const ru = buildSupportContent('ru')
    const en = buildSupportContent('en')
    expect(ru.title).not.toBe(en.title)
    expect(ru.presets.map(p => p.cents)).toEqual([300, 700, 1500])
    expect(en.presets.map(p => p.cents)).toEqual([300, 700, 1500])
    expect(ru.submitLabel.length).toBeGreaterThan(0)
    expect(en.thanksTitle.length).toBeGreaterThan(0)
  })
})
