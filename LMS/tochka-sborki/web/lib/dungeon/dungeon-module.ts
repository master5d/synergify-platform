// web/lib/dungeon/dungeon-module.ts
// Модуль «нишевого подземелья». Было: грубое NICHE_MODULE (ниша → один модуль). Стало (развилка онбординга,
// спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md): если у ученика есть русло сквозной
// задачи — модуль последнего шага русла (там собирается рабочий результат, он и есть «босс»); иначе прежний
// NICHE_MODULE («хочу научиться», старые профили, курс без каталога русел).
import { NICHE_MODULE } from '@/lib/course/niche-map'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { routeFinalModule, type TaskRoute } from '@/lib/intake/task-route'

export const FALLBACK_DUNGEON_MODULE = '04-prompt-engineering'

export function dungeonModuleFor(niche: string | null | undefined, route: TaskRoute | null | undefined): string {
  if (route) return routeFinalModule(route)
  const resolved = niche && FLAVOR_BANK[niche] ? niche : 'other'
  return NICHE_MODULE[resolved] ?? FALLBACK_DUNGEON_MODULE
}
