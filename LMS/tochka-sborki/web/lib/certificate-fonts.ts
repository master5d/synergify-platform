// Шрифты сертификата (components/certificate-svg.tsx). Раньше SVG звал Google Fonts через @import:
// в зеркале и при заблокированной сети сертификат рисовался системными шрифтами, а скачанный файл
// без сети не показывал своих шрифтов вовсе. Теперь файлы лежат на своём сайте (public/fonts/certificate,
// OFL, происхождение — README.md там же), страница сертификата грузит их и встраивает в SVG данными
// (@font-face с data:-URI) — скачанный SVG самодостаточен. Грузит только страница сертификата.
import { assetPath } from './base-path'

export interface CertFont {
  family: string
  /** Вес или диапазон вариативного файла («400 900»). */
  weight: string
  style: 'normal' | 'italic'
  file: string
}

export const CERT_FONTS_DIR = '/fonts/certificate/'

export const CERT_FONTS: readonly CertFont[] = [
  { family: 'Unbounded', weight: '900', style: 'normal', file: 'Unbounded-900.woff2' },
  { family: 'Playfair Display', weight: '400 900', style: 'normal', file: 'PlayfairDisplay-wght.woff2' },
  { family: 'Playfair Display', weight: '400 900', style: 'italic', file: 'PlayfairDisplay-Italic-wght.woff2' },
  { family: 'Geist Mono', weight: '400', style: 'normal', file: 'GeistMono-Regular.woff2' },
  { family: 'Geist Mono', weight: '700', style: 'normal', file: 'GeistMono-Bold.woff2' },
]

const FETCH_TIMEOUT_MS = 10_000

export function bytesToDataUri(bytes: Uint8Array, mime = 'font/woff2'): string {
  let bin = ''
  // Кусками: String.fromCharCode(...весь_файл) переполняет стек на сотне килобайт.
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return `data:${mime};base64,${btoa(bin)}`
}

export function fontFaceCss(font: CertFont, dataUri: string): string {
  return `@font-face{font-family:'${font.family}';font-style:${font.style};font-weight:${font.weight};` +
    `font-display:swap;src:url(${dataUri}) format('woff2');}`
}

/**
 * CSS со всеми шрифтами сертификата, встроенными данными. Файл, который не загрузился (сеть, 404,
 * таймаут), пропускается — его текст рисуется запасным шрифтом из классов SVG; не загрузилось
 * ничего — пустая строка. Запросы только к своему сайту, с учётом префикса курса.
 */
export async function loadCertificateFontCss(fetchImpl: typeof fetch = fetch): Promise<string> {
  const parts = await Promise.all(CERT_FONTS.map(async (font) => {
    try {
      const res = await fetchImpl(assetPath(`${CERT_FONTS_DIR}${font.file}`), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
      if (!res.ok) return ''
      return fontFaceCss(font, bytesToDataUri(new Uint8Array(await res.arrayBuffer())))
    } catch {
      return ''
    }
  }))
  return parts.join('')
}
