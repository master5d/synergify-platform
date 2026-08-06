// lib/speedreading/schulte.ts
// Pure Schulte-table engine (Скорочтение epic, slice 3). No DOM, no imports.
// Deterministic mulberry32 full Fisher–Yates shuffle (same PRNG formula as lib/quests/seed.ts's pick,
// but a full shuffle) → generateGrid produces a reproducible grid of 1..size² for a numeric seed.
export const MIN_SIZE = 3
export const MAX_SIZE = 7
export const DEFAULT_SIZE = 5

export function clampSize(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_SIZE
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)))
}

export function shuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

export function generateGrid(seed: number, size: number): number[] {
  const n = clampSize(size)
  const cells = Array.from({ length: n * n }, (_, i) => i + 1)
  return shuffle(cells, seed)
}
