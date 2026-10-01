// Завершение юнита → платформенный прогресс (intake LMS#3).
//
// Юнит-прогресс живёт в localStorage (lib/unit-progress.ts), и воркер его не видел:
// «модуль завершён» на сервере было не из чего вывести. Теперь завершение юнита
// дублируется в /api/progress/complete как `модуль/юнит` вместе со структурой курса —
// воркер сам (по своим строкам прогресса) решает, закрыт ли модуль/курс, и, если
// владелец включил события, кладёт это в Listmonk. Структуру присылает клиент,
// потому что контент pack'а воркеру недоступен.
//
// Best-effort: нет сессии / сеть упала — ученик этого не замечает, локальный прогресс
// уже записан.

/** Модуль → слаги его юнитов, в порядке курса. */
export type CourseOutline = Record<string, string[]>

/** Структура курса из навигации: только модули с юнитами. */
export function outlineFromNav(items: { slug: string; type: string; units?: { slug: string }[] }[]): CourseOutline {
  const out: CourseOutline = {}
  for (const item of items) {
    if (item.type === 'module' && item.units?.length) out[item.slug] = item.units.map(u => u.slug)
  }
  return out
}

export interface UnitCompletion {
  course: string
  moduleSlug: string
  unitSlug: string
  outline?: CourseOutline
}

export function completePayload({ course, moduleSlug, unitSlug, outline }: UnitCompletion) {
  return { lesson_slug: `${moduleSlug}/${unitSlug}`, course, ...(outline ? { outline } : {}) }
}

export async function reportUnitCompleted(c: UnitCompletion, fetchFn: typeof fetch = fetch): Promise<void> {
  try {
    await fetchFn('/api/progress/complete', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completePayload(c)),
    })
  } catch {}
}
