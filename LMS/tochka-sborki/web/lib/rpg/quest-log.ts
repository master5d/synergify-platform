// web/lib/rpg/quest-log.ts
import type { CharacterClass, WorldSkin } from '@/lib/intake/types'
import { MODULE_SLUGS } from './modules'
import { QUEST_LINES } from './quest-lines'
import { dungeonModuleFor } from '@/lib/dungeon/dungeon-module'
import { profileTaskRoute, routeStepsByModule } from '@/lib/intake/task-route'
import { getTransformation } from './transformations'
import type { SkinPack, QuestLogVM, ZoneVM, QuestStatus } from './types'

type GetState = (slug: string) => 'completed' | 'viewed' | 'none'
type ModuleInfo = Record<string, { title: string; duration: string }>
type Profile = {
  char_class: CharacterClass; world_skin: WorldSkin; niche: string | null
  char_level: number; legendary_title: string
  /** Ответы анкеты (JSON-строка или объект) — для русла сквозной задачи. */
  answers?: unknown
}

export function buildQuestLog(
  profile: Profile, modules: ModuleInfo, completedSlugs: string[],
  getState: GetState, pack: SkinPack | null, locale: 'ru' | 'en',
): QuestLogVM {
  const order = QUEST_LINES[profile.char_class] ?? [...MODULE_SLUGS]
  // Зона подземелья (isNiche) — модуль подземелья: русло → модуль результата русла, без русла — по прогрессу
  // в спайне квест-линии (ниша на выбор не влияет). У зон с шагами русла — их подписи.
  const route = profileTaskRoute(profile)
  const stepsByModule = route ? routeStepsByModule(route) : {}
  const nicheSlug = dungeonModuleFor(route, order, (slug) => getState(slug) === 'completed')

  const statuses: QuestStatus[] = order.map(slug => getState(slug) === 'completed' ? 'completed' : 'todo')
  const currentIdx = statuses.findIndex(s => s !== 'completed')
  if (currentIdx >= 0) statuses[currentIdx] = 'current'

  const base = locale === 'en' ? '/en' : ''
  const zones: ZoneVM[] = order.map((slug, i) => ({
    slug,
    order: i,
    zoneName: pack?.zoneNames?.[slug]?.[locale] || modules[slug]?.title || slug,
    questTitle: pack?.questTitles?.[slug]?.[locale] || modules[slug]?.title || slug,
    moduleTitle: modules[slug]?.title || slug,
    durationLabel: modules[slug]?.duration || '',
    status: statuses[i],
    isNiche: slug === nicheSlug,
    routeSteps: stepsByModule[slug]?.map(({ index, step }) => ({ index, title: step.title[locale] })),
    href: `${base}/lessons/${slug}/`,
    transform: getTransformation(slug, locale) ?? undefined,
  }))

  return {
    zones,
    summary: {
      completedCount: order.filter(s => getState(s) === 'completed').length,
      total: MODULE_SLUGS.length,
      legendaryTitle: profile.legendary_title,
      charClass: profile.char_class,
      skin: profile.world_skin,
      level: profile.char_level,
    },
  }
}
