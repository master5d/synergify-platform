// lib/speedreading/rsvp-sample.ts
// One original, neutral passage so the reader has text on first load. De-hustle clean (tested).
import type { Bi } from '@/lib/course'
import type { Locale } from '@/lib/dictionaries'

export const RSVP_SAMPLE: Bi = {
  ru: 'Чтение — это навык внимания. Глаз движется по строке рывками, останавливаясь на словах, а между остановками мозг достраивает смысл. Когда внимание собрано, строка идёт ровно и мысль не рвётся. Когда оно рассеяно, взгляд возвращается назад, и то же предложение читается дважды. Тренировка не заставляет читать быстрее силой — она убирает лишние движения и возвраты, чтобы внимание держалось на смысле дольше. Начни спокойно и дай глазу привыкнуть к ровному темпу.',
  en: 'Reading is a skill of attention. The eye moves along a line in small jumps, resting on words, and between those stops the mind fills in the meaning. When attention is gathered, the line runs smoothly and the thought holds together. When it scatters, the gaze slips backward and the same sentence is read twice. Training does not force faster reading — it removes the extra motions and the backtracking, so attention stays on the meaning longer. Begin calmly and let the eye settle into an even pace.',
}

export function resolveRsvpSample(locale: Locale): string {
  return RSVP_SAMPLE[locale]
}
