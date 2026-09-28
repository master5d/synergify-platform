// web/app/dungeon/dungeon-client.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Nav } from '@/components/nav'
import { useProgress } from '@/components/progress-provider'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { dungeonModuleFor } from '@/lib/dungeon/dungeon-module'
import { profileTaskRoute, profileTaskText, type TaskRoute } from '@/lib/intake/task-route'
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

  const route = profileTaskRoute(profile)
  const taskText = profileTaskText(profile)
  // Модуль подземелья: русло → модуль результата; без русла — по прогрессу (useProgress уже загружен).
  const courseModules = Object.keys(moduleTitles)
  const isModuleCompleted = (slug: string) => getState(slug) === 'completed'
  const dungeonModule = dungeonModuleFor(route, courseModules, isModuleCompleted)
  const moduleTitle = moduleTitles[dungeonModule] ?? dungeonModule

  return <DungeonInner skin={skin} accent={accent} niche={niche} outcome={outcome} moduleTitle={moduleTitle} locale={locale} isModuleCompleted={isModuleCompleted} route={route} taskText={taskText} courseModules={courseModules} />
}

function DungeonInner(props: { skin: WorldSkin; accent: string; niche: string | null; outcome: string | null; moduleTitle: string; locale: Locale; isModuleCompleted: (slug: string) => boolean; route: TaskRoute | null; taskText: string | null; courseModules: readonly string[] }) {
  const { skin, accent, niche, outcome, moduleTitle, locale, isModuleCompleted, route, taskText, courseModules } = props
  const { view, isCleared, clear, ready } = useDungeon({ locale, skin, niche, outcome, isModuleCompleted, route, taskText, courseModules })
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
