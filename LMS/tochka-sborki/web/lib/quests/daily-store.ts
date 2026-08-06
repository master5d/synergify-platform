// web/lib/quests/daily-store.ts

export interface DailyStore {
  date: string
  completedIds: string[]
}

const STORAGE_KEY = 'daily_quests'

export function localDate(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function rolloverIfStale(store: DailyStore, today: string): DailyStore {
  return store.date === today ? store : { date: today, completedIds: [] }
}

export function markDone(store: DailyStore, id: string): DailyStore {
  if (store.completedIds.includes(id)) return store
  return { ...store, completedIds: [...store.completedIds, id] }
}

export function isDone(store: DailyStore, id: string): boolean {
  return store.completedIds.includes(id)
}

// ---- storage shell (browser only) ----

export function readDaily(today: string): DailyStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: today, completedIds: [] }
    const parsed = JSON.parse(raw) as Partial<DailyStore>
    const store: DailyStore = {
      date: typeof parsed.date === 'string' ? parsed.date : today,
      completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds : [],
    }
    return rolloverIfStale(store, today)
  } catch {
    return { date: today, completedIds: [] }
  }
}

export function writeDaily(store: DailyStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}
