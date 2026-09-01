import { describe, it, expect } from 'vitest'
import { resolveCaptionTrack, resolveTranscript } from './media'

describe('resolveCaptionTrack', () => {
  it('returns null for embed sources regardless of vtt (platform-native captions)', () => {
    expect(resolveCaptionTrack('embed', '/captions/x-ru.vtt', 'ru')).toBeNull()
    expect(resolveCaptionTrack('embed', null, 'en')).toBeNull()
  })
  it('returns null for file sources when no vtt is supplied', () => {
    expect(resolveCaptionTrack('file', null, 'ru')).toBeNull()
  })
  it('returns a track for file + vtt with the active-locale srclang and src', () => {
    expect(resolveCaptionTrack('file', '/captions/x-ru.vtt', 'ru')).toEqual({
      src: '/captions/x-ru.vtt', srclang: 'ru', label: 'Русские субтитры',
    })
    expect(resolveCaptionTrack('file', '/captions/x-en.vtt', 'en')).toEqual({
      src: '/captions/x-en.vtt', srclang: 'en', label: 'Captions',
    })
  })
  // Дефект (аудит video-fab 2026-08-09): одна строка на оба языка отдавалась с srclang
  // активной локали — англоязычный зритель получал русский VTT под видом английского.
  it('picks the active-locale file from a bilingual vtt map', () => {
    const vtt = { ru: '/captions/x-ru.vtt', en: '/captions/x-en.vtt' }
    expect(resolveCaptionTrack('file', vtt, 'en')).toEqual({ src: '/captions/x-en.vtt', srclang: 'en', label: 'Captions' })
    expect(resolveCaptionTrack('file', vtt, 'ru')).toEqual({ src: '/captions/x-ru.vtt', srclang: 'ru', label: 'Русские субтитры' })
  })
  it('a bilingual map missing the active locale yields null, not a mislabeled track', () => {
    expect(resolveCaptionTrack('file', { ru: '/captions/x-ru.vtt', en: '' }, 'en')).toBeNull()
  })
})

describe('resolveTranscript', () => {
  it('returns null when transcript is absent', () => {
    expect(resolveTranscript(null, 'ru')).toBeNull()
  })
  it('returns the active-locale text when present', () => {
    const t = { ru: 'Расшифровка ролика.', en: 'Video transcript.' }
    expect(resolveTranscript(t, 'ru')).toBe('Расшифровка ролика.')
    expect(resolveTranscript(t, 'en')).toBe('Video transcript.')
  })
})
