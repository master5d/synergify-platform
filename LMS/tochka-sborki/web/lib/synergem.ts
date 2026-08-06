// web/lib/synergem.ts
// Phase C of the синергема networking feature (epic fb_7fdd9f891109): cluster opted-in learners
// by their ACTIVE opt-in EFFORT-INTENT («синдицированная экономика на интересах»,
// "Социальный Дизайн Будущего") — the type of shared effort they want to gather a синергема
// around. `niche` (business vertical, passive from intake) is now a secondary per-card tag, not
// the cluster key. Vocabulary lives in lib/effort.ts. Pure clustering only; synthetic mentors /
// acceleration / ИГИ / DAO governance are split into follow-on tickets.

export interface AlumniEntry {
  effort: string | null   // the cluster key (effort-intent)
  niche: string | null    // secondary per-card tag
  contact: string | null
  blurb: string | null
}
export interface SynergemCluster { key: string; entries: AlumniEntry[]; count: number }

/** Group entries into synergem clusters by effort (null → 'other'), sorted by size then key,
 * with 'other' always last. */
export function clusterAlumni(entries: AlumniEntry[]): SynergemCluster[] {
  const byKey = new Map<string, AlumniEntry[]>()
  for (const e of entries) {
    const k = e.effort ?? 'other'
    ;(byKey.get(k) ?? byKey.set(k, []).get(k)!).push(e)
  }
  return [...byKey.entries()]
    .map(([key, es]) => ({ key, entries: es, count: es.length }))
    .sort((a, b) => {
      if (a.key === 'other') return 1
      if (b.key === 'other') return -1
      return b.count - a.count || a.key.localeCompare(b.key)
    })
}
