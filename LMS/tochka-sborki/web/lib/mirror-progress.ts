// Прогресс страниц курса в зеркале — только браузер (spec п. 2). Ключ свой, не пересекается с RPG-ключами.
export const MIRROR_PROGRESS_KEY = 'mirror_lesson_progress'

export type LessonStateMap = Record<string, 'viewed' | 'completed'>

export function parseLessonProgress(raw: string | null): LessonStateMap {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: LessonStateMap = {}
    for (const [slug, state] of Object.entries(parsed as Record<string, unknown>)) {
      if (state === 'viewed' || state === 'completed') out[slug] = state
    }
    return out
  } catch {
    return {}
  }
}

export function nextLessonState(map: LessonStateMap, slug: string, to: 'viewed' | 'completed'): LessonStateMap {
  if (to === 'viewed' && map[slug]) return map
  return { ...map, [slug]: to }
}

export function loadLessonProgress(storage: Pick<Storage, 'getItem'> | null): LessonStateMap {
  try {
    return parseLessonProgress(storage?.getItem(MIRROR_PROGRESS_KEY) ?? null)
  } catch {
    return {}
  }
}

export function saveLessonProgress(storage: Pick<Storage, 'setItem'> | null, map: LessonStateMap): void {
  try {
    storage?.setItem(MIRROR_PROGRESS_KEY, JSON.stringify(map))
  } catch {
    // приватный режим / квота — прогресс просто не сохранится
  }
}

/** Объединение двух карт; для одного slug побеждает completed. Входы не меняются. */
export function mergeLessonProgress(a: LessonStateMap, b: LessonStateMap): LessonStateMap {
  const out: LessonStateMap = { ...a }
  for (const [slug, state] of Object.entries(b)) {
    if (out[slug] !== 'completed') out[slug] = state
  }
  return out
}
