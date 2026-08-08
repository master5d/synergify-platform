import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { assetPath, BASE_PATH } from './base-path'

// Путевой префикс (Ф4 S2) — шов из четырёх мест: next.config, клиентский помощник,
// PWA-манифест и сервис-воркер. Три из них basePath НЕ переписывает автоматически,
// поэтому каждый проверяется отдельно: иначе курс в подпути будет тянуть ассеты
// и кешировать шелл чужого корня.
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

describe('assetPath', () => {
  it('добавляет префикс и терпит путь без ведущего слеша', () => {
    expect(assetPath('/author.jpg')).toBe(`${BASE_PATH}/author.jpg`)
    expect(assetPath('author.jpg')).toBe(`${BASE_PATH}/author.jpg`)
  })

  it('без COURSE_BASE_PATH ведёт себя как раньше (корень домена)', () => {
    if (BASE_PATH === '') expect(assetPath('/x.png')).toBe('/x.png')
  })
})

describe('префикс проведён во все четыре места', () => {
  it('next.config читает COURSE_BASE_PATH и отдаёт его клиенту', () => {
    const cfg = read('next.config.ts')
    expect(cfg).toMatch(/COURSE_BASE_PATH/)
    expect(cfg, 'basePath не выставляется').toMatch(/basePath: BASE_PATH/)
    expect(cfg, 'клиентский префикс не инлайнится').toMatch(/NEXT_PUBLIC_COURSE_BASE_PATH/)
  })

  it('PWA-манифест уводит установку в подпуть курса, а не в корень', () => {
    const m = read('app/manifest.ts')
    expect(m).toMatch(/start_url: `\$\{BASE_PATH\}\//)
    expect(m).toMatch(/scope: `\$\{BASE_PATH\}\//)
  })

  it('сервис-воркер несёт плейсхолдер, а postbuild его проставляет', () => {
    expect(read('public/sw.js'), 'sw.js без плейсхолдера').toContain('__COURSE_BASE_PATH__')
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    expect(pkg.scripts.postbuild, 'postbuild не проставляет префикс в sw.js').toContain('stamp-sw')
  })

  it('регистрация сервис-воркера уходит в свой scope', () => {
    const reg = read('components/pwa/pwa-register.tsx')
    expect(reg).toMatch(/assetPath\('\/sw\.js'\)/)
    expect(reg).toMatch(/scope: `\$\{BASE_PATH\}\//)
  })

  it('вызовы API остаются в корне домена — platform-API один на все курсы', () => {
    const guard = read('components/auth-guard.tsx')
    expect(guard, 'API-вызов получил префикс курса — воркер его не отдаёт').toMatch(/fetch\('\/api\//)
  })
})
