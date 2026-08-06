// web/components/quests/daily-panel.tsx
'use client'

import Link from 'next/link'
import type { Locale, WorldSkin } from '@/lib/intake/types'
import { useDailyQuests } from '@/lib/quests/use-daily-quests'
import { HelpTip } from '@/components/help/help-tip'

const HEADING: Record<Locale, string> = { ru: 'Сегодня', en: 'Today' }
const OPEN: Record<Locale, string> = { ru: 'Открыть', en: 'Open' }
const MARK_DONE: Record<Locale, string> = { ru: 'Готово', en: 'Mark done' }
const DONE: Record<Locale, string> = { ru: 'выполнено', en: 'done' }
const ALL_DONE: Record<Locale, string> = { ru: 'Все задания на сегодня выполнены 🎉', en: "Today's quests are all done 🎉" }

function questsLabel(n: number, locale: Locale): string {
  if (locale === 'en') return `${n} ${n === 1 ? 'quest' : 'quests'}`
  const mod10 = n % 10, mod100 = n % 100
  const word = mod10 === 1 && mod100 !== 11 ? 'задание'
    : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20) ? 'задания' : 'заданий'
  return `${n} ${word}`
}

interface Props {
  locale: Locale
  skin: WorldSkin
  accent: string
  cogTier: number
  niche: string | null
  outcome: string | null
  unitsByModule: Record<string, { slug: string; title: string }[]>
  isUnitDone: (moduleSlug: string, unitSlug: string) => boolean
  completedModules: string[]
  helpId?: string
}

export function DailyPanel({ locale, skin, accent, cogTier, niche, outcome, unitsByModule, isUnitDone, completedModules, helpId }: Props) {
  const { set, isDone, complete, allDone, ready } = useDailyQuests({
    locale, skin, cogTier, niche, outcome, unitsByModule, isUnitDone, completedModules,
  })

  if (!ready || set.quests.length === 0) return null

  const totalCs = set.quests.reduce((n, q) => n + q.cs, 0)

  return (
    <section style={{ border: `1px solid ${accent}`, borderRadius: 12, padding: '1.1rem 1.25rem', marginBottom: '1.5rem', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.9rem' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: accent }}><span aria-hidden="true">☀</span> {HEADING[locale]} {helpId && <HelpTip id={helpId} locale={locale} />}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {questsLabel(set.quests.length, locale)}{totalCs > 0 ? ` · +${totalCs} 💎` : ''}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '0.6rem' }}>
        {set.quests.map(q => {
          const done = isDone(q)
          return (
            <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', opacity: done ? 0.6 : 1 }}>
              <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: accent, marginTop: '0.15rem' }}>
                {q.kind === 'advance' ? '▶' : q.kind === 'complete' ? '★' : '◇'}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  {q.title}{q.cs > 0 ? ` · +${q.cs} 💎` : ''}
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.15rem' }}>{q.body}</div>
                <div style={{ marginTop: '0.45rem' }}>
                  {q.kind === 'advance' && q.href && (
                    <Link href={q.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: accent }}>
                      {done ? `✓ ${DONE[locale]}` : `${OPEN[locale]} ↗`}
                    </Link>
                  )}
                  {q.cs > 0 && (
                    done
                      ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: accent }}>✓ {DONE[locale]}</span>
                      : <button type="button" onClick={() => complete(q)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: '0.35rem 0.7rem', borderRadius: 6, border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer' }}>{MARK_DONE[locale]}</button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {allDone && (
        <div style={{ marginTop: '0.9rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: accent }}>
          {ALL_DONE[locale]}
        </div>
      )}
    </section>
  )
}
