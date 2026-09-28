// web/lib/dungeon/build-dungeon.ts
import type { DungeonInput, DungeonView, StageTier } from './types'
import type { Locale } from '@/lib/intake/types'
import type { TaskRoute } from '@/lib/intake/task-route'
import { getAppliedChallenge, fillNicheSlots } from '@/lib/cs/applied-challenge'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { dungeonModuleFor } from './dungeon-module'
import { fillOutcome } from '@/lib/intake/task-route'

const TIERS: StageTier[] = ['task', 'process', 'outcome']
const STAGE_CS = 15
const BOSS_CS = 50

export function buildDungeon(input: DungeonInput): DungeonView {
  const { locale, niche: rawNiche, outcome } = input
  // rawNiche = the learner's literal F2 value, used for {niche} slot-fill display.
  // niche = the resolved, flavor-bank-validated key, used for the dungeon's flavor, module, and ids.
  const niche = rawNiche && FLAVOR_BANK[rawNiche] ? rawNiche : 'other'
  // Русло сквозной задачи заменяет грубое NICHE_MODULE: подземелье — там, где собирается результат русла.
  const route = input.route ?? null
  const module = dungeonModuleFor(niche, route)
  const flavor = FLAVOR_BANK[niche]
  const locked = !input.isModuleCompleted(module)

  const stages = TIERS.map((tier, i) => ({
    id: `dungeon:${niche}:s${i + 1}`,
    tier,
    body: route
      ? routeStageBody(route, i, locale)
      : getAppliedChallenge({ niche: rawNiche, outcome }, module, tier, locale) ?? '',
    cs: STAGE_CS,
  }))

  const boss = {
    id: `dungeon:${niche}:boss`,
    name: flavor.bossName[locale],
    body: route
      ? fillOutcome(route.result[locale], input.taskText ?? outcome, locale)
      : fillNicheSlots(flavor.bossChallenge[locale], rawNiche, outcome, locale),
    cs: BOSS_CS,
  }

  return { niche, module, locked, dungeonName: flavor.dungeonName[locale], intro: flavor.intro[locale], stages, boss }
}

/** Этапы подземелья с руслом — три последних шага русла (task → process → outcome): «шаг — что сделать». */
function routeStageBody(route: TaskRoute, i: number, locale: Locale): string {
  const steps = route.steps.slice(-TIERS.length)
  const s = steps[Math.min(i, steps.length - 1)]
  return `${s.title[locale]} — ${s.action[locale]}`
}
