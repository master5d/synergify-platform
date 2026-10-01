import { describe, it, expect } from 'vitest'
import { getAllModules, getNavigationItems } from '../content'
import { OPTIONAL_MODULE_SLUGS } from '../rpg/modules'

// Значок «advanced» (components/advanced-badge.tsx) — из поля `advanced: true` в _meta.json.
// Продвинутым может быть только модуль вне спайна: иначе обязательный путь выглядел бы «не для всех».
const advanced = (locale: string) => getAllModules(locale).filter(m => m.advanced === true).map(m => m.slug).sort()

describe('advanced modules', () => {
  it('ru and en mark the same modules as advanced', () => {
    expect(advanced('en')).toEqual(advanced('ru'))
  })

  it('only optional (off-spine) modules can be advanced', () => {
    const optional = new Set<string>(OPTIONAL_MODULE_SLUGS)
    expect(advanced('ru').filter(s => !optional.has(s))).toEqual([])
  })

  it('«Обучение моделей» is advanced when the pack has it; the sidebar sees the flag', () => {
    const slugs = getAllModules('ru').map(m => m.slug)
    if (!slugs.includes('10-model-training')) return   // другой pack
    expect(advanced('ru')).toContain('10-model-training')
    expect(getNavigationItems('ru').find(i => i.slug === '10-model-training')?.advanced).toBe(true)
    expect(getNavigationItems('ru').find(i => i.slug === '00-kickstart')?.advanced).toBe(false)
  })
})
