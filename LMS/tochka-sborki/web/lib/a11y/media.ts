// lib/a11y/media.ts
// Pure resolvers for video accessibility: caption tracks (self-hosted <video> only)
// and transcripts (universal). No DOM, no React. Returns null → "dark" (render nothing).

export interface Bi { ru: string; en: string }

export interface CaptionTrack {
  src: string // VTT path in /public, e.g. '/captions/showcase-ru.vtt'
  srclang: 'ru' | 'en'
  label: string // track-menu label
}

const TRACK_LABEL: Bi = { ru: 'Русские субтитры', en: 'Captions' }

// Captions attach only to a self-hosted <video> (file source). Embeds carry
// platform-native captions and cannot accept a cross-origin VTT track → null.
// `vtt` — путь одного файла (legacy) или { ru, en } по локали: одна строка на оба языка
// уходила с srclang активной локали, и англоязычный зритель получал русский VTT под видом
// английского (дефект найден при поставке витрины video-fab, 2026-08-09; закрыт 2026-09-01).
export function resolveCaptionTrack(
  sourceKind: 'embed' | 'file',
  vtt: string | Bi | null,
  locale: 'ru' | 'en',
): CaptionTrack | null {
  if (sourceKind !== 'file' || !vtt) return null
  const src = typeof vtt === 'string' ? vtt : vtt[locale]
  if (!src) return null
  return { src, srclang: locale, label: TRACK_LABEL[locale] }
}

// Active-locale transcript text, or null when absent.
export function resolveTranscript(transcript: Bi | null, locale: 'ru' | 'en'): string | null {
  if (!transcript) return null
  return transcript[locale]
}
