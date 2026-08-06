// lib/speedreading/wpm.ts
// Pure reading-metric engine (Скорочтение epic, slice 4). Reuses the slice-2 tokenizer for word count.
// effectiveWpm = raw WPM × comprehension fraction — the honest "effective reading speed".
import { tokenize } from './rsvp'

export function wordCount(text: string): number {
  return tokenize(text).length
}

export function computeWpm(words: number, ms: number): number {
  if (ms <= 0) return 0
  return Math.round(words / (ms / 60000))
}

export function comprehensionFraction(correct: number, total: number): number {
  if (total <= 0) return 0
  return correct / total
}

export function effectiveWpm(wpm: number, fraction: number): number {
  return Math.round(wpm * fraction)
}
