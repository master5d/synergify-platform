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
export function resolveCaptionTrack(
  sourceKind: 'embed' | 'file',
  vtt: string | null,
  locale: 'ru' | 'en',
): CaptionTrack | null {
  if (sourceKind !== 'file' || !vtt) return null
  return { src: vtt, srclang: locale, label: TRACK_LABEL[locale] }
}

// Active-locale transcript text, or null when absent.
export function resolveTranscript(transcript: Bi | null, locale: 'ru' | 'en'): string | null {
  if (!transcript) return null
  return transcript[locale]
}
