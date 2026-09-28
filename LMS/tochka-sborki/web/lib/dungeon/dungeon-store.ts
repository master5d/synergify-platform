// web/lib/dungeon/dungeon-store.ts

export interface DungeonStore { clearedIds: string[] }

const STORAGE_KEY = 'niche_dungeon'

export function markCleared(store: DungeonStore, id: string): DungeonStore {
  if (store.clearedIds.includes(id)) return store
  return { clearedIds: [...store.clearedIds, id] }
}

/** Ид этапа/босса: пройденность привязана к модулю подземелья (с 2026-09-28), а не к нише. */
export function dungeonStageId(module: string, suffix: string): string {
  return `dungeon:${module}:${suffix}`
}

// Безопасный переход со старых отметок. До 2026-09-28 ид были в пространстве ниши (`dungeon:<ниша>:s1|boss`),
// а модуль подземелья выводился из ниши. Снимок той привязки — ТОЛЬКО для чтения старых отметок (маршрутизацию
// он не делает): старая отметка засчитывается, лишь если ниша тогда вела в тот же модуль, что и текущее
// подземелье. Отметки других модулей (и отметки русла, сделанные в день волны 18 под нишевым ключом, если модуль
// русла не совпал) не переносятся. Хранилище не переписывается — миграции нет.
const LEGACY_NICHE_DUNGEON_MODULE: Readonly<Record<string, string>> = {
  coach: '04-prompt-engineering',
  massage: '04-prompt-engineering',
  astrology: '04-prompt-engineering',
  service: '04-prompt-engineering',
  other: '04-prompt-engineering',
  content: '06-audio-pipeline',
  ecommerce: '07-tools',
  tech: '08-agent-engineering',
}

/** Старые нишевые ключи, которые засчитываются за данный модульный ид. */
export function legacyAliases(id: string): string[] {
  const m = /^dungeon:([^:]+):([^:]+)$/.exec(id)
  if (!m) return []
  const [, module, suffix] = m
  return Object.entries(LEGACY_NICHE_DUNGEON_MODULE)
    .filter(([, legacyModule]) => legacyModule === module)
    .map(([niche]) => `dungeon:${niche}:${suffix}`)
}

export function isCleared(store: DungeonStore, id: string): boolean {
  if (store.clearedIds.includes(id)) return true
  return legacyAliases(id).some((legacy) => store.clearedIds.includes(legacy))
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
