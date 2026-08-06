'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { usePacing } from '@/lib/pacing/use-pacing'
import { todayCount, currentStreak, recentDowngrade, daysBetween } from '@/lib/pacing/derive'
import { localDate } from '@/lib/quests/daily-store'
import { selectNudge } from '@/lib/wellbeing/select-nudge'
import { WB } from '@/lib/wellbeing/content'
import type { Locale } from '@/lib/intake/types'

interface Props {
  locale: Locale
  accent: string
  g11: string | null
  outcome: string | null
  unitsByModule: Record<string, { slug: string; title: string }[]>
  moduleTitles: Record<string, string>
  isUnitDone: (moduleSlug: string, unitSlug: string) => boolean
  resumeHref: string
}

export function WellbeingPanel({ locale, accent, g11, outcome, unitsByModule, moduleTitles, isUnitDone, resumeHref }: Props) {
  const router = useRouter()
  const { state, ready, touch, recordCalibration, dismissNudge } = usePacing()
  const seenRef = useRef<string | null>(null)

  useEffect(() => {
    if (ready && seenRef.current === null) {
      seenRef.current = state.lastSeen || ''
      touch()
    }
  }, [ready, state.lastSeen, touch])

  const today = localDate()

  const ctx = useMemo(() => {
    let total = 0, done = 0
    let freshModule: { slug: string; title: string } | null = null
    for (const [slug, units] of Object.entries(unitsByModule)) {
      total += units.length
      const doneInMod = units.filter(u => isUnitDone(slug, u.slug)).length
      done += doneInMod
      if (doneInMod === units.length && units.length > 0 && !state.calibration[slug] && !freshModule) {
        freshModule = { slug, title: moduleTitles[slug] ?? slug }
      }
    }
    const seenBefore = seenRef.current
    return {
      daysSinceActive: seenBefore ? daysBetween(seenBefore, today) : 0,
      todayCount: todayCount(state, today),
      currentStreak: currentStreak(state, today),
      recentDowngrade: recentDowngrade(state),
      hasIncomplete: done < total,
      freshModule,
      g11, outcome,
      questsLeft: Math.max(0, total - done),
    }
  }, [state, unitsByModule, moduleTitles, isUnitDone, g11, outcome, today])

  if (!ready) return null
  const nudge = selectNudge(state, ctx, today)
  if (!nudge) return null

  const card: React.CSSProperties = {
    border: `1px solid ${accent}`, borderRadius: 12, padding: '1rem 1.1rem',
    background: 'var(--bg-surface)', marginBottom: '1rem',
  }
  const titleStyle: React.CSSProperties = { fontFamily: 'var(--font-mono)', color: accent, fontWeight: 700 }
  const btn: React.CSSProperties = {
    padding: '0.4rem 0.8rem', borderRadius: 8, border: `1px solid ${accent}`,
    background: 'transparent', color: accent, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
  }
  const row: React.CSSProperties = { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.6rem' }

  if (nudge.kind === 'reengage') {
    return (
      <section style={card}>
        <div style={titleStyle}>{WB.reengage.title[locale]}</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0.4rem 0 0', lineHeight: 1.45 }}>
          {WB.reengage.body(g11, outcome, ctx.questsLeft, locale)}
        </p>
        <div style={row}>
          <button style={{ ...btn, background: accent, color: '#000' }} onClick={() => router.push(resumeHref)}>
            {WB.reengage.cta[locale]}
          </button>
          <button style={btn} onClick={() => dismissNudge('reengage')} aria-label="dismiss">×</button>
        </div>
      </section>
    )
  }

  if (nudge.kind === 'checkin') {
    return (
      <section style={card}>
        <div style={titleStyle}>{WB.checkin.title[locale]}</div>
        <div style={row}>
          <button style={btn} onClick={() => dismissNudge('checkin')}>{WB.checkin.ok[locale]}</button>
          <button style={btn} onClick={() => dismissNudge('checkin')}>{WB.checkin.overwhelmed[locale]}</button>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0', lineHeight: 1.4 }}>
          {WB.checkin.relief[locale]}
        </p>
      </section>
    )
  }

  if (nudge.kind === 'rest') {
    return (
      <section style={card}>
        <div style={titleStyle}>{WB.rest.title[locale]}</div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0.4rem 0 0', lineHeight: 1.45 }}>
          {WB.rest.body[locale]}
        </p>
        <div style={row}>
          <button style={btn} onClick={() => dismissNudge('rest')}>{WB.rest.ack[locale]}</button>
        </div>
      </section>
    )
  }

  return (
    <section style={card}>
      <div style={titleStyle}>{WB.calibrate.title(nudge.moduleTitle ?? '', locale)}</div>
      <div style={row}>
        <button style={btn} onClick={() => recordCalibration(nudge.moduleSlug!, 'easier')}>{WB.calibrate.easier[locale]}</button>
        <button style={btn} onClick={() => recordCalibration(nudge.moduleSlug!, 'right')}>{WB.calibrate.right[locale]}</button>
        <button style={btn} onClick={() => recordCalibration(nudge.moduleSlug!, 'harder')}>{WB.calibrate.harder[locale]}</button>
      </div>
    </section>
  )
}
