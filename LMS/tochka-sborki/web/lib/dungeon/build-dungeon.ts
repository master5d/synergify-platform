// web/lib/dungeon/build-dungeon.ts
import type { DungeonInput, DungeonView, StageTier } from './types'
import { NICHE_MODULE } from '@/lib/course/niche-map'
import { getAppliedChallenge, fillNicheSlots } from '@/lib/cs/applied-challenge'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'

const TIERS: StageTier[] = ['task', 'process', 'outcome']
const FALLBACK_MODULE = '04-prompt-engineering'
const STAGE_CS = 15
const BOSS_CS = 50

export function buildDungeon(input: DungeonInput): DungeonView {
  const { locale, niche: rawNiche, outcome } = input
  // rawNiche = the learner's literal F2 value, used for {niche} slot-fill display.
  // niche = the resolved, flavor-bank-validated key, used for the dungeon's flavor, module, and ids.
  const niche = rawNiche && FLAVOR_BANK[rawNiche] ? rawNiche : 'other'
  const module = NICHE_MODULE[niche] ?? FALLBACK_MODULE
  const flavor = FLAVOR_BANK[niche]
  const locked = !input.isModuleCompleted(module)

  const stages = TIERS.map((tier, i) => ({
    id: `dungeon:${niche}:s${i + 1}`,
    tier,
    body: getAppliedChallenge({ niche: rawNiche, outcome }, module, tier, locale) ?? '',
    cs: STAGE_CS,
  }))

  const boss = {
    id: `dungeon:${niche}:boss`,
    name: flavor.bossName[locale],
    body: fillNicheSlots(flavor.bossChallenge[locale], rawNiche, outcome, locale),
    cs: BOSS_CS,
  }

  return { niche, module, locked, dungeonName: flavor.dungeonName[locale], intro: flavor.intro[locale], stages, boss }
}
