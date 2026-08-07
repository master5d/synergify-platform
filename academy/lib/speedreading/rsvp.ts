// lib/speedreading/rsvp.ts
// Pure RSVP engine (Скорочтение epic, slice 2). No DOM, no imports — fully unit-tested.
// tokenize → words; orpIndex/splitOrp → Spritz-style pivot; buildSchedule → timed frames.
export interface RsvpFrame { text: string; ms: number; index: number }
export interface OrpSplit { before: string; pivot: string; after: string }
export interface RsvpScheduleOpts { wpm: number; chunkSize?: number; punctuationDwell?: boolean }

export const DEFAULT_WPM = 300
export const MIN_WPM = 100
export const MAX_WPM = 900
export const WPM_STEP = 25
export const DEFAULT_CHUNK = 1
export const MAX_CHUNK = 3

export function clampWpm(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_WPM
  return Math.min(MAX_WPM, Math.max(MIN_WPM, Math.round(n)))
}

export function clampChunk(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_CHUNK
  return Math.min(MAX_CHUNK, Math.max(1, Math.round(n)))
}

export function tokenize(text: string): string[] {
  return text.split(/\s+/).map(t => t.trim()).filter(t => t.length > 0)
}

export function orpIndex(word: string): number {
  const len = word.length
  if (len <= 1) return 0
  let idx: number
  if (len <= 5) idx = 1
  else if (len <= 9) idx = 2
  else if (len <= 13) idx = 3
  else idx = 4
  return Math.min(idx, len - 1)
}

export function splitOrp(word: string): OrpSplit {
  if (word.length === 0) return { before: '', pivot: '', after: '' }
  const i = orpIndex(word)
  return { before: word.slice(0, i), pivot: word[i], after: word.slice(i + 1) }
}

const MID_PUNCT = /[,;:]$/
const END_PUNCT = /[.!?…]$/

export function buildSchedule(tokens: string[], opts: RsvpScheduleOpts): RsvpFrame[] {
  const wpm = clampWpm(opts.wpm)
  const chunk = clampChunk(opts.chunkSize ?? DEFAULT_CHUNK)
  const dwell = opts.punctuationDwell !== false
  const base = 60000 / wpm
  const frames: RsvpFrame[] = []
  for (let i = 0; i < tokens.length; i += chunk) {
    const group = tokens.slice(i, i + chunk)
    const text = group.join(' ')
    let ms = base * group.length
    if (dwell) {
      const last = group[group.length - 1]
      if (END_PUNCT.test(last)) ms *= 2.0
      else if (MID_PUNCT.test(last)) ms *= 1.5
    }
    frames.push({ text, ms: Math.round(ms), index: frames.length })
  }
  return frames
}
