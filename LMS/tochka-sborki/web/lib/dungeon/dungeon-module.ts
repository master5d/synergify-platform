// web/lib/dungeon/dungeon-module.ts
// Модуль подземелья. Ниша на выбор модуля НЕ влияет (решение владельца 2026-09-28: привязка «ниша → один
// модуль» снята) — ниша остаётся только флейвором (dungeon-flavor.ts, {niche}).
//  1. Есть русло сквозной задачи — модуль последнего шага русла (там собирается рабочий результат, он и есть
//     «босс»; спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md).
//  2. Русла нет («хочу научиться», старые профили, курс без каталога русел) — детерминированно по прогрессу:
//     самый дальний закрытый модуль спайна курса (подземелье открыто — это практикум по только что пройденному);
//     ничего не закрыто или прогресс неизвестен — первый модуль спайна (подземелье заперто до его закрытия).
//     «Первый НЕзакрытый» не берём: подземелье заперто, пока его модуль не закрыт, и уезжало бы вперёд ровно
//     в момент открытия — вечный замок.
import { routeFinalModule, type TaskRoute } from '@/lib/intake/task-route'
import { MODULE_SLUGS, OPTIONAL_MODULE_SLUGS } from '@/lib/rpg/modules'

/**
 * Спайн курса из списка модулей активного pack'а (слаги каталогов контента, любые порядок и состав).
 * Точка Сборки — канон MODULE_SLUGS (опциональные модули вне спайна); pack со своими модулями — его
 * модули по номеру; пустой список — MODULE_SLUGS.
 */
export function courseSpine(courseModules: readonly string[]): string[] {
  const core = MODULE_SLUGS.filter((s) => courseModules.includes(s))
  if (core.length) return core
  const optional = new Set<string>(OPTIONAL_MODULE_SLUGS)
  const own = courseModules.filter((s) => !optional.has(s)).sort()
  return own.length ? own : [...MODULE_SLUGS]
}

export function dungeonModuleFor(
  route: TaskRoute | null | undefined,
  courseModules: readonly string[],
  isModuleCompleted?: (moduleSlug: string) => boolean,
): string {
  if (route) return routeFinalModule(route)
  const spine = courseSpine(courseModules)
  let module = spine[0]
  if (isModuleCompleted) for (const slug of spine) if (isModuleCompleted(slug)) module = slug
  return module
}
