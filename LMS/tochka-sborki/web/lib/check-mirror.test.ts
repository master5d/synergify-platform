import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { checkMirror, SERVER_ROUTES } from '../scripts/check-mirror.mjs'
import { MIRROR_SERVER_ROUTES } from './mirror'

const GOOD_HEAD = '<meta name="robots" content="noindex, nofollow"/>'
const page = (body: string, head = GOOD_HEAD) => `<html><head>${head}</head><body><div data-mirror-banner></div>${body}</body></html>`

function fixture(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'mirror-'))
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true })
    writeFileSync(join(dir, rel), content)
  }
  return dir
}

describe('checkMirror', () => {
  it('список серверных маршрутов в скрипте равен MIRROR_SERVER_ROUTES', () => {
    expect([...SERVER_ROUTES].sort()).toEqual([...MIRROR_SERVER_ROUTES].sort())
  })
  it('чистая сборка — нарушений нет', () => {
    const dir = fixture({
      'index.html': page('<a href="/ts-gitbook/roadmap/">x</a><script src="/ts-gitbook/_next/a.js"></script>'),
      'login/index.html': page('<main data-mirror-stub></main>'),
    })
    expect(checkMirror(dir, '/ts-gitbook')).toEqual([])
  })
  it('iframe-встройка walkthroughs/ — без плашки, но noindex обязателен', () => {
    const ok = fixture({ 'walkthroughs/a.html': `<html><head>${GOOD_HEAD}</head><body>w</body></html>` })
    expect(checkMirror(ok, '/ts-gitbook')).toEqual([])
    const bad = fixture({ 'walkthroughs/a.html': '<html><head></head><body>w</body></html>' })
    expect(checkMirror(bad, '/ts-gitbook').join('\n')).toMatch(/walkthroughs\/a\.html: нет noindex/)
  })
  it('ловит ссылку без префикса, нет noindex, нет плашки, telegram, sitemap, серверную страницу без заглушки', () => {
    const dir = fixture({
      'index.html': page('<a href="/roadmap/">x</a><script src="https://telegram.org/js/telegram-web-app.js"></script>', ''),
      'cheatsheet/index.html': '<html><head>' + GOOD_HEAD + '</head><body>no banner</body></html>',
      'dashboard/index.html': page('<main>secret</main>'),
      'sitemap.xml': '<urlset/>',
    })
    const issues = checkMirror(dir, '/ts-gitbook').join('\n')
    expect(issues).toMatch(/index\.html: ссылка без префикса: \/roadmap\//)
    expect(issues).toMatch(/index\.html: нет noindex/)
    expect(issues).toMatch(/cheatsheet\/index\.html: нет плашки зеркала/)
    expect(issues).toMatch(/index\.html: telegram\.org/)
    expect(issues).toMatch(/sitemap\.xml/)
    expect(issues).toMatch(/dashboard\/index\.html: серверная страница без заглушки/)
  })
})
