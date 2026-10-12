import { describe, it, expect } from 'vitest'
import {
  IS_MIRROR, MAIN_SITE, isServerOnlyRoute, mainSiteUrl, isPlatformApiUrl,
  mirrorCanonicalScript, mirrorLocale, MIRROR_COPY,
} from './mirror'
import { COURSE } from './course'

// Основной сайт — домен АКТИВНОГО pack'а (у living-practice — academy.synergify.com/praktika), не литерал:
// CI гоняет эти тесты под каждым pack'ом (build-packs).
const MAIN = COURSE.domain.replace(/\/$/, '')

describe('lib/mirror', () => {
  it('без COURSE_MIRROR зеркало выключено', () => {
    expect(IS_MIRROR).toBe(false)
  })
  it('основной сайт — из COURSE.domain, без слэша в конце', () => {
    expect(MAIN_SITE).toBe(MAIN)
    expect(MAIN_SITE.endsWith('/')).toBe(false)
  })
  it.each([
    ['/login/', true], ['/en/login/', true], ['/auth/verify/', true], ['/dashboard/', true],
    ['/en/dashboard/', true], ['/character/', true], ['/dungeon/', true], ['/quest-intake/', true],
    ['/certificate/', true], ['/certificate/verify/', true], ['/feedback/', true], ['/support/', true],
    ['/care/', true], ['/alumni/', true], ['/admin/leads/', true],
    ['/', false], ['/en/', false], ['/lessons/01-introduction/u1-activation/', false],
    ['/cheatsheet/', false], ['/ama/', false], ['/try/', false], ['/roadmap/', false], ['/careers/', false],
  ])('isServerOnlyRoute(%s) = %s', (path, expected) => {
    expect(isServerOnlyRoute(path)).toBe(expected)
  })
  it('mainSiteUrl ведёт на тот же путь основного сайта', () => {
    expect(mainSiteUrl('/en/dashboard/')).toBe(`${MAIN}/en/dashboard/`)
    expect(mainSiteUrl('login/')).toBe(`${MAIN}/login/`)
  })
  it.each([
    ['/api/auth/me', true],
    ['/ts-gitbook/api/progress/list', true],
    ['https://ai.synergify.com/api/academy/me', true],
    ['https://ai.synergify.com/lessons/x/', true],
    ['/lessons/01-introduction/u1-activation/', false],
    ['/ts-gitbook/_next/static/chunk.js', false],
    ['https://cdnjs.cloudflare.com/x.js', false],
  ])('isPlatformApiUrl(%s) = %s', (url, expected) => {
    expect(isPlatformApiUrl(url, 'https://master5d.github.io')).toBe(expected)
  })
  it('canonical-скрипт снимает basePath и ставит основной домен', () => {
    const js = mirrorCanonicalScript('/ts-gitbook', 'https://ai.synergify.com')
    const head = { children: [] as { rel: string; href: string }[] }
    const doc = {
      createElement: () => ({ rel: '', href: '' }),
      head: { appendChild: (el: { rel: string; href: string }) => head.children.push(el) },
    }
    new Function('location', 'document', js)({ pathname: '/ts-gitbook/en/lessons/x/' }, doc)
    expect(head.children).toEqual([{ rel: 'canonical', href: 'https://ai.synergify.com/en/lessons/x/' }])
  })
  it('язык по пути', () => {
    expect(mirrorLocale('/en/lessons/x/')).toBe('en')
    expect(mirrorLocale('/en')).toBe('en')
    expect(mirrorLocale('/lessons/x/')).toBe('ru')
  })
  it('у каждого текста есть RU и EN', () => {
    for (const [key, copy] of Object.entries(MIRROR_COPY)) {
      expect(copy.ru, key).toBeTruthy()
      expect(copy.en, key).toBeTruthy()
    }
  })
})
