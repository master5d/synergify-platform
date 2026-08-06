'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/nav'
import { useProgress } from '@/components/progress-provider'
import { buildQuestLog } from '@/lib/rpg/quest-log'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { WorldMap } from '@/components/rpg/world-map'
import { TransformationArc } from '@/components/rpg/transformation-arc'
import { CharacterSheet } from '@/components/character-sheet'
import { CharterCard } from '@/components/intake/charter-card'
import { LearningPlanCard } from '@/components/intake/learning-plan-card'
import { CompanionSetup } from '@/components/intake/companion-setup'
import { OfficeHoursCard } from '@/components/office-hours-card'
import { useNicheDungeonCleared } from '@/lib/dungeon/use-dungeon'
import wandererPack from '@/lib/rpg/skins/wanderer.json'
import type { SkinPack } from '@/lib/rpg/types'
import type { Locale } from '@/lib/intake/types'

interface Props {
  modules: Record<string, { title: string; duration: string }>
  unitsByModule: Record<string, { slug: string; title: string }[]>
  locale: Locale
}

export function ProfileClient({ modules, locale }: Props) {
  const router = useRouter()
  const { getState, loaded } = useProgress()
  const [profile, setProfile] = useState<any>(null)
  const [pack, setPack] = useState<SkinPack | null>(null)
  const nicheDungeonCleared = useNicheDungeonCleared(profile?.niche ?? null)

  useEffect(() => {
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(async p => {
        if (!p || p.status !== 'completed') { router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'); return }
        setProfile(p)
        try { const mod = await import(`@/lib/rpg/skins/${p.world_skin}.json`); setPack(mod.default as SkinPack) }
        catch { setPack(wandererPack as SkinPack) }
      })
      .catch(() => router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'))
  }, [router, locale])

  if (!profile || !loaded) return (<><Nav locale={locale} /><main style={{ maxWidth: 660, margin: '0 auto', padding: '4rem 1.5rem' }}><p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>…</p></main></>)

  const accent = SKINS_META[profile.world_skin as keyof typeof SKINS_META]?.accent ?? 'var(--text-accent)'
  const glyph = SKINS_META[profile.world_skin as keyof typeof SKINS_META]?.glyph ?? '⬡'
  const completed = Object.keys(modules).filter(s => getState(s) === 'completed')
  const vm = buildQuestLog(profile, modules, completed, getState as any, pack, locale)
  const currentSlug = vm.zones.find(z => z.status === 'current')?.slug ?? null

  return (
    <>
      <Nav locale={locale} />
      <CharacterSheet locale={locale} profile={profile} />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ margin: '1.5rem 0' }}>
          <TransformationArc currentSlug={currentSlug} locale={locale} accent={accent} />
          <div style={{ marginTop: '1rem' }}>
            <WorldMap zones={vm.zones} accent={accent} glyph={glyph} locale={locale} nicheDungeonCleared={nicheDungeonCleared} />
          </div>
        </div>
      </main>
      <LearningPlanCard profile={profile} zones={vm.zones} locale={locale} />
      <CharterCard profile={profile} locale={locale} />
      <CompanionSetup profile={profile} locale={locale} />
      <OfficeHoursCard locale={locale} />
    </>
  )
}
