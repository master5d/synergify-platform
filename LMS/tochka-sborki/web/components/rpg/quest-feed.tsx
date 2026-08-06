'use client'
import Link from 'next/link'
import type { ZoneVM } from '@/lib/rpg/types'
import type { Locale } from '@/lib/intake/types'

export function QuestFeed({ zones, accent, locale }: { zones: ZoneVM[]; accent: string; locale: Locale }) {
  const cont = locale === 'en' ? 'Continue →' : 'Продолжить →'
  const nicheLabel = locale === 'en' ? 'niche' : 'ниша'
  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden', marginTop: '1.25rem' }}>
      {zones.map(z => {
        const done = z.status === 'completed', cur = z.status === 'current'
        return (
          <div key={z.slug} id={`quest-${z.slug}`} style={{
            padding: cur ? '1rem 1.3rem' : '.85rem 1.3rem', borderBottom: '1px solid var(--border-color)',
            background: cur ? `${accent}10` : 'transparent', display: 'flex', gap: '.85rem', alignItems: 'center' }}>
            <span aria-hidden style={{ width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '.7rem',
              background: done ? `${accent}30` : cur ? accent : 'transparent',
              color: done ? accent : cur ? '#000' : 'var(--text-secondary)',
              border: z.status === 'todo' ? '1px solid var(--border-color)' : 'none' }}>
              {done ? '✓' : cur ? '▸' : z.order + 1}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link href={z.href} style={{ color: z.status === 'todo' ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 600, fontSize: '.95rem', textDecoration: 'none' }}>
                {z.questTitle}{z.isNiche && <span style={{ marginLeft: '.5rem', fontFamily: 'var(--font-mono)', fontSize: '.55rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#000', background: accent, borderRadius: 3, padding: '1px 6px' }}>{nicheLabel}</span>}
              </Link>
              <div style={{ fontSize: '.72rem', color: 'var(--text-secondary)', marginTop: '.15rem' }}>{z.moduleTitle}{z.durationLabel ? ` · ${z.durationLabel}` : ''}</div>
              {cur && <Link href={z.href} style={{ display: 'inline-block', marginTop: '.6rem', background: accent, color: '#000', fontWeight: 900, fontFamily: 'var(--font-mono)', fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', padding: '.45rem 1rem', borderRadius: 6, textDecoration: 'none' }}>{cont}</Link>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
