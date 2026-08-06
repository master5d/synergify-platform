// web/lib/dungeon/dungeon-store.ts

export interface DungeonStore { clearedIds: string[] }

const STORAGE_KEY = 'niche_dungeon'

export function markCleared(store: DungeonStore, id: string): DungeonStore {
  if (store.clearedIds.includes(id)) return store
  return { clearedIds: [...store.clearedIds, id] }
}

export function isCleared(store: DungeonStore, id: string): boolean {
  return store.clearedIds.includes(id)
}

// ---- storage shell (browser only) ----

export function readDungeon(): DungeonStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { clearedIds: [] }
    const parsed = JSON.parse(raw) as Partial<DungeonStore>
    return { clearedIds: Array.isArray(parsed.clearedIds) ? parsed.clearedIds : [] }
  } catch {
    return { clearedIds: [] }
  }
}

export function writeDungeon(store: DungeonStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}
