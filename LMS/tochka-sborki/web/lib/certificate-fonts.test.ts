import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import {
  CERT_FONTS, CERT_FONTS_DIR, bytesToDataUri, fontFaceCss, loadCertificateFontCss,
} from './certificate-fonts'
import { CertificateSVG } from '@/components/certificate-svg'

// Сертификат не ходит в Google за шрифтами (зеркало и заблокированная сеть рисовали его системными):
// шрифты лежат на своём сайте и встраиваются в SVG данными — скачанный файл самодостаточен.
const PUBLIC = join(process.cwd(), 'public')

describe('шрифты сертификата — свои файлы', () => {
  it('каждый файл на месте, у каждого семейства рядом лицензия OFL', () => {
    for (const f of CERT_FONTS) expect(existsSync(join(PUBLIC, CERT_FONTS_DIR, f.file)), f.file).toBe(true)
    for (const lic of ['OFL-unbounded.txt', 'OFL-playfair-display.txt', 'OFL-geist.txt']) {
      expect(readFileSync(join(PUBLIC, CERT_FONTS_DIR, lic), 'utf8')).toMatch(/SIL Open Font License, Version 1\.1/)
    }
  })

  it('семейства совпадают с теми, что зовут классы SVG', () => {
    expect([...new Set(CERT_FONTS.map((f) => f.family))].sort()).toEqual(['Geist Mono', 'Playfair Display', 'Unbounded'])
  })
})

describe('@font-face с данными', () => {
  it('bytesToDataUri кодирует байты в base64 без потерь', () => {
    const bytes = new Uint8Array(70000).map((_, i) => (i * 31) % 256)
    const uri = bytesToDataUri(bytes)
    expect(uri.startsWith('data:font/woff2;base64,')).toBe(true)
    expect(Buffer.from(uri.split(',')[1], 'base64').equals(Buffer.from(bytes))).toBe(true)
  })

  it('fontFaceCss несёт семейство, начертание, вес и источник', () => {
    const css = fontFaceCss({ family: 'Playfair Display', weight: '400 900', style: 'italic', file: 'x.woff2' }, 'data:font/woff2;base64,AA==')
    expect(css).toBe("@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 900;font-display:swap;src:url(data:font/woff2;base64,AA==) format('woff2');}")
  })
})

describe('loadCertificateFontCss', () => {
  const ok = (url: string) => Promise.resolve(new Response(new Uint8Array([1, 2, 3, url.length % 256]), { status: 200 }))

  it('грузит все шрифты только со своего сайта и встраивает их данными', async () => {
    const urls: string[] = []
    const css = await loadCertificateFontCss((u) => { urls.push(String(u)); return ok(String(u)) })
    expect(urls).toHaveLength(CERT_FONTS.length)
    for (const u of urls) expect(u).toMatch(/^(?:\/[^/]+)?\/fonts\/certificate\/[^/]+\.woff2$/)
    expect(css.match(/@font-face/g)).toHaveLength(CERT_FONTS.length)
    expect(css).not.toMatch(/https?:/)
  })

  it('упавший файл пропускается, остальные встраиваются; всё упало — пустая строка', async () => {
    const bad = CERT_FONTS[1].file
    const css = await loadCertificateFontCss((u) =>
      String(u).endsWith(bad) ? Promise.resolve(new Response('', { status: 404 })) : ok(String(u)))
    expect(css.match(/@font-face/g)).toHaveLength(CERT_FONTS.length - 1)
    expect(await loadCertificateFontCss(() => Promise.reject(new Error('offline')))).toBe('')
  })
})

describe('CertificateSVG', () => {
  const render = (fontCss?: string) =>
    renderToStaticMarkup(createElement(CertificateSVG, { name: 'Ада', date: '2026-10-12', locale: 'ru', fontCss }))

  it('не зовёт Google Fonts', () => {
    expect(render()).not.toMatch(/fonts\.googleapis|fonts\.gstatic/)
  })

  it('встраивает переданные @font-face в свой <style>', () => {
    const face = "@font-face{font-family:'Unbounded';src:url(data:font/woff2;base64,AA==)}"
    expect(render(face)).toContain(face)
  })
})
