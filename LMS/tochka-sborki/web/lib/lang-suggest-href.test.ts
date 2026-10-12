import { afterEach, describe, expect, it, vi } from 'vitest'

// switchedHref обязан нести префикс курса: usePathname его не содержит (зеркало: /ts-gitbook).
describe('lang-suggest-banner: switchedHref', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

  it('с префиксом курса', async () => {
    vi.stubEnv('NEXT_PUBLIC_COURSE_BASE_PATH', '/ts-gitbook')
    vi.resetModules()
    const { switchedHref } = await import('../components/lang-suggest-banner')
    expect(switchedHref('/lessons/a/', 'ru', 'en')).toBe('/ts-gitbook/en/lessons/a/')
    expect(switchedHref('/en/', 'en', 'ru')).toBe('/ts-gitbook/')
  })

  it('без префикса — как раньше (основная сборка)', async () => {
    vi.stubEnv('NEXT_PUBLIC_COURSE_BASE_PATH', '')
    vi.resetModules()
    const { switchedHref } = await import('../components/lang-suggest-banner')
    expect(switchedHref('/lessons/a/', 'ru', 'en')).toBe('/en/lessons/a/')
  })
})
