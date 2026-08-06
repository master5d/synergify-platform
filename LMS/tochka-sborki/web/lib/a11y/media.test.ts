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
