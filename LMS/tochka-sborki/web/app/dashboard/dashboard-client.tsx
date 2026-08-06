'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/nav'
import { useProgress } from '@/components/progress-provider'
import { buildQuestLog } from '@/lib/rpg/quest-log'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { CharacterStrip } from '@/components/rpg/character-strip'
import { QuestFeed } from '@/components/rpg/quest-feed'
import wandererPack from '@/lib/rpg/skins/wanderer.json'
import type { SkinPack } from '@/lib/rpg/types'
import type { Locale, WorldSkin } from '@/lib/intake/types'
import { ShardBalance } from '@/components/cs/shard-balance'
import { Vault } from '@/components/cs/vault'
import { DailyPanel } from '@/components/quests/daily-panel'
import { useUnitProgress } from '@/lib/unit-progress'
import { DungeonCard } from '@/components/dungeon/dungeon-card'
import { NICHE_MODULE } from '@/lib/course/niche-map'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { parseOutcome } from '@/lib/intake/parse-outcome'
import { HelpTip } from '@/components/help/help-tip'
import { IntroCard } from '@/components/help/intro-card'
import { WellbeingPanel } from '@/components/wellbeing/wellbeing-panel'
import { parseAspiration } from '@/lib/intake/parse-aspiration'

interface Props {
  modules: Record<string, { title: string; duration: string }>
  unitsByModule: Record<string, { slug: string; title: string }[]>
  locale: Locale
}

export function DashboardClient({ modules, unitsByModule, locale }: Props) {
  const router = useRouter()
  const { getState, loaded } = useProgress()
  const { isCompleted } = useUnitProgress()
  const [profile, setProfile] = useState<any>(null)
  const [pack, setPack] = useState<SkinPack | null>(null)

  useEffect(() => {
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(async p => {
        if (!p || p.status !== 'completed') { router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'); return }
        setProfile(p)
        try {
          const mod = await import(`@/lib/rpg/skins/${p.world_skin}.json`)
          setPack(mod.default as SkinPack)
        } catch { setPack(wandererPack as SkinPack) }
      })
      .catch(() => router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'))
  }, [router, locale])

  if (!profile || !loaded) return (<><Nav locale={locale} /><main style={{ maxWidth: 660, margin: '0 auto', padding: '4rem 1.5rem' }}><p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>…</p></main></>)

  const accent = SKINS_META[profile.world_skin as keyof typeof SKINS_META]?.accent ?? 'var(--text-accent)'
  const completed = Object.keys(modules).filter(s => getState(s) === 'completed')
  const dungeonNiche = profile.niche && FLAVOR_BANK[profile.niche] ? profile.niche : 'other'
  const dungeonModule = NICHE_MODULE[dungeonNiche] ?? '04-prompt-engineering'
  const outcome = parseOutcome(profile)
  const aspiration = parseAspiration(profile)
  const moduleTitles = Object.fromEntries(Object.entries(modules).map(([slug, m]) => [slug, m.title]))
  const wbPrefix = locale === 'en' ? '/en' : ''
  const firstIncomplete = (() => {
    for (const [slug, units] of Object.entries(unitsByModule)) {
      for (const u of units) if (!isCompleted(slug, u.slug)) return `${wbPrefix}/lessons/${slug}/${u.slug}/`
    }
    return `${wbPrefix}/dashboard/`
  })()
  const vm = buildQuestLog(profile, modules, completed, getState as any, pack, locale)

  return (
    <>
      <Nav locale={locale} />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <IntroCard page="dashboard" locale={locale} accent={accent} />
        <WellbeingPanel
          locale={locale}
          accent={accent}
          g11={aspiration}
          outcome={outcome}
          unitsByModule={unitsByModule}
          moduleTitles={moduleTitles}
          isUnitDone={isCompleted}
          resumeHref={firstIncomplete}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <ShardBalance accent={accent} />
          <HelpTip id="shards" locale={locale} align="right" />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
          <div style={{ flex: 1 }}><CharacterStrip summary={vm.summary} accent={accent} locale={locale} /></div>
          <HelpTip id="character" locale={locale} align="right" />
        </div>
        <DailyPanel
          locale={locale}
          skin={profile.world_skin as WorldSkin}
          accent={accent}
          cogTier={typeof profile.cog_tier === 'number' ? profile.cog_tier : 2}
          niche={profile.niche ?? null}
          outcome={outcome}
          unitsByModule={unitsByModule}
          isUnitDone={isCompleted}
          completedModules={completed}
          helpId="daily"
        />
        <QuestFeed zones={vm.zones} accent={accent} locale={locale} />
        <DungeonCard
          locale={locale}
          accent={accent}
          skin={profile.world_skin as WorldSkin}
          niche={profile.niche ?? null}
          outcome={outcome}
          moduleTitle={modules[dungeonModule]?.title ?? dungeonModule}
          isModuleCompleted={(slug) => getState(slug) === 'completed'}
          helpId="dungeon-card"
        />
        <Vault activeSkin={profile.world_skin as WorldSkin} locale={locale} helpId="vault" />
      </main>
    </>
  )
}
