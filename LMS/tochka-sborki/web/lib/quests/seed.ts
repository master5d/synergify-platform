// web/lib/quests/seed.ts

// FNV-1a 32-bit hash of `${key}|${date}` → uint32 seed.
export function dailySeed(key: string, date: string): number {
  let h = 2166136261 >>> 0
  const s = `${key}|${date}`
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

// Deterministic subset of `n` items via a mulberry32 PRNG seeded by `seed` (partial Fisher–Yates).
export function pick<T>(items: T[], seed: number, n: number): T[] {
  if (items.length <= n) return [...items]
  const arr = [...items]
  let s = seed >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (arr.length - i))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr.slice(0, n)
}
