import { describe, expect, it } from 'vitest'
import {
  LANDING_LIMITS,
  blobToDataUri,
  ctaUrlOk,
  htmlBytes,
  videoEmbedUrl,
} from './landing-media'

describe('landing-media', () => {
  it('ctaUrlOk принимает https-форму, t.me, wa.me и корректный mailto', () => {
    expect(ctaUrlOk('https://forms.example.org/x')).toBe(true)
    expect(ctaUrlOk('https://t.me/name')).toBe(true)
    expect(ctaUrlOk('https://wa.me/15551234567')).toBe(true)
    expect(ctaUrlOk('mailto:a@b.co')).toBe(true)
  })

  it('ctaUrlOk отвергает недопустимые протоколы, неполные адреса, пробелы и превышение длины', () => {
    expect(ctaUrlOk('http://x.org')).toBe(false)
    expect(ctaUrlOk('javascript:alert(1)')).toBe(false)
    expect(ctaUrlOk('data:text/html,x')).toBe(false)
    expect(ctaUrlOk('//x.org')).toBe(false)
    expect(ctaUrlOk('mailto:nobody')).toBe(false)
    expect(ctaUrlOk('')).toBe(false)
    expect(ctaUrlOk('https://x .org')).toBe(false)
    const longUrl = 'https://' + 'a'.repeat(489) + '.org'
    expect(longUrl.length).toBe(LANDING_LIMITS.urlLength + 1)
    expect(ctaUrlOk(longUrl)).toBe(false)
  })

  it('ctaUrlOk обрезает пробелы по краям адреса', () => {
    expect(ctaUrlOk('  https://x.org  ')).toBe(true)
  })

  it('videoEmbedUrl преобразует каждую форму ссылки YouTube в embed-адрес', () => {
    const expected = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://youtube.com/shorts/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://m.youtube.com/shorts/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(expected)
    expect(videoEmbedUrl('https://m.youtube.com/embed/dQw4w9WgXcQ')).toBe(expected)
  })

  it('videoEmbedUrl разбирает YouTube watch?v= с параметрами до и после v', () => {
    const expected = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    expect(videoEmbedUrl('https://www.youtube.com/watch?t=10&v=dQw4w9WgXcQ&list=x')).toBe(expected)
  })

  it('videoEmbedUrl преобразует обе формы Vimeo в player-адрес с dnt=1', () => {
    const expected = 'https://player.vimeo.com/video/76979871?dnt=1'
    expect(videoEmbedUrl('https://vimeo.com/76979871')).toBe(expected)
    expect(videoEmbedUrl('https://player.vimeo.com/video/76979871')).toBe(expected)
  })

  it('videoEmbedUrl возвращает null для неподдерживаемых хостов, http и неверных ID', () => {
    expect(videoEmbedUrl('https://example.org/video')).toBeNull()
    expect(videoEmbedUrl('http://youtu.be/dQw4w9WgXcQ')).toBeNull()
    expect(videoEmbedUrl('https://youtu.be/short')).toBeNull()
    expect(videoEmbedUrl('https://vimeo.com/abc')).toBeNull()
  })

  it('blobToDataUri кодирует текстовый блоб привет в точную data URI строку', async () => {
    const blob = new Blob(['привет'], { type: 'text/plain' })
    const result = await blobToDataUri(blob)
    expect(result).toBe('data:text/plain;base64,0L/RgNC40LLQtdGC')
  })

  it('blobToDataUri обрабатывает блоб 300 000 байт и декодируется обратно в те же байты', async () => {
    const count = 300_000
    const sampleBytes = new Uint8Array(count)
    for (let i = 0; i < count; i++) {
      sampleBytes[i] = i % 256
    }
    const blob = new Blob([sampleBytes], { type: 'application/octet-stream' })
    const uri = await blobToDataUri(blob)
    expect(uri.startsWith('data:application/octet-stream;base64,')).toBe(true)
    const base64 = uri.slice('data:application/octet-stream;base64,'.length)
    const decodedBinary = atob(base64)
    expect(decodedBinary.length).toBe(count)
    const decodedBytes = new Uint8Array(decodedBinary.length)
    for (let i = 0; i < decodedBinary.length; i++) {
      decodedBytes[i] = decodedBinary.charCodeAt(i)
    }
    expect(decodedBytes).toEqual(sampleBytes)
  })

  it('blobToDataUri использует application/octet-stream при пустом type блоба', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])])
    const uri = await blobToDataUri(blob)
    expect(uri.startsWith('data:application/octet-stream;base64,')).toBe(true)
  })

  it('htmlBytes возвращает корректную длину строки ё в байтах UTF-8', () => {
    expect(htmlBytes('ё')).toBe(2)
  })
})
