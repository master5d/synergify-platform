// web/app/dungeon/dungeon-client.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/nav'
import { useProgress } from '@/components/progress-provider'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { NICHE_MODULE } from '@/lib/course/niche-map'
import { FLAVOR_BANK } from '@/lib/course/dungeon-flavor'
import { useDungeon } from '@/lib/dungeon/use-dungeon'
import { DungeonView } from '@/components/dungeon/dungeon-view'
import { parseOutcome } from '@/lib/intake/parse-outcome'
import type { Locale, WorldSkin } from '@/lib/intake/types'

export function DungeonClient({ moduleTitles, locale }: { moduleTitles: Record<string, string>; locale: Locale }) {
  const router = useRouter()
  const { getState, loaded } = useProgress()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    fetch('/api/intake/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(p => {
        if (!p || p.status !== 'completed') { router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'); return }
        setProfile(p)
      })
      .catch(() => router.replace(locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'))
  }, [router, locale])

  if (!profile || !loaded) {
    return (<><Nav locale={locale} /><main style={{ maxWidth: 660, margin: '0 auto', padding: '4rem 1.5rem' }}><p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>…</p></main></>)
  }

  const skin = profile.world_skin as WorldSkin
  const accent = SKINS_META[skin]?.accent ?? 'var(--text-accent)'
  const niche: string | null = profile.niche ?? null
  const outcome = parseOutcome(profile)

  const resolvedNiche = niche && FLAVOR_BANK[niche] ? niche : 'other'
  const nicheModule = NICHE_MODULE[resolvedNiche] ?? '04-prompt-engineering'
  const moduleTitle = moduleTitles[nicheModule] ?? nicheModule

  return <DungeonInner skin={skin} accent={accent} niche={niche} outcome={outcome} moduleTitle={moduleTitle} locale={locale} isModuleCompleted={(slug) => getState(slug) === 'completed'} />
}

function DungeonInner(props: { skin: WorldSkin; accent: string; niche: string | null; outcome: string | null; moduleTitle: string; locale: Locale; isModuleCompleted: (slug: string) => boolean }) {
  const { skin, accent, niche, outcome, moduleTitle, locale, isModuleCompleted } = props
  const { view, isCleared, clear, ready } = useDungeon({ locale, skin, niche, outcome, isModuleCompleted })
  return (
    <>
      <Nav locale={locale} />
      <main style={{ maxWidth: 660, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {ready
          ? <DungeonView view={view} locale={locale} accent={accent} moduleTitle={moduleTitle} isCleared={isCleared} onClear={clear} />
          : <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>…</p>}
      </main>
    </>
  )
}
