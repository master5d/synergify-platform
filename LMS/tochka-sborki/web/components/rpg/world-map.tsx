'use client'
import { nodePositions, snakePath } from '@/lib/rpg/map-layout'
import { buildLocator } from '@/lib/rpg/locator'
import type { ZoneVM } from '@/lib/rpg/types'

const VB = 100
const COLS = 3

export function WorldMap({ zones, accent, glyph, locale, nicheDungeonCleared = false }: { zones: ZoneVM[]; accent: string; glyph: string; locale: 'ru' | 'en'; nicheDungeonCleared?: boolean }) {
  const pts = nodePositions(zones.length, VB, VB, COLS)
  const path = snakePath(pts)
  const loc = buildLocator(zones, locale)
  const current = zones.find(z => z.status === 'current')
  const mapLabel = locale === 'en'
    ? (loc.finished ? 'Learning map — course complete' : `Learning map — you are here: ${loc.zoneName}`)
    : (loc.finished ? 'Карта обучения — курс пройден' : `Карта обучения — Вы тут: ${loc.zoneName}`)
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <style>{`
        @keyframes wm-pulse { 0%,100%{opacity:1} 50%{opacity:.55} }
        .wm-cur { animation: wm-pulse 1.8s infinite; }
        @media (prefers-reduced-motion: reduce){ .wm-cur{ animation:none } }
      `}</style>
      <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: '100%', height: 'auto' }} role="img" aria-label={mapLabel}>
        <path d={path} fill="none" stroke="var(--border-color)" strokeWidth={1.2} strokeDasharray="2 2" />
        {zones.map((z, i) => {
          const p = pts[i]
          const done = z.status === 'completed', cur = z.status === 'current'
          const fill = (done || cur) ? accent : 'var(--bg-surface)'
          const opacity = z.status === 'todo' ? 0.5 : 1
          return (
            <g key={z.slug} className={cur ? 'wm-cur' : undefined} opacity={opacity}
               style={{ cursor: 'pointer' }} onClick={() => {
                 document.getElementById(`quest-${z.slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
               }}>
              <circle cx={p.x} cy={p.y} r={6} fill={fill}
                      stroke={accent} strokeWidth={cur ? 1.5 : done ? 1 : 0.6} />
              <text x={p.x} y={p.y + 2.2} textAnchor="middle" fontSize={5}>{glyph}</text>
              {z.isNiche && nicheDungeonCleared && (
                <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize={5} aria-hidden="true">👑</text>
              )}
              {cur && (
                <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={5.5} fill={accent} aria-hidden="true">✦</text>
              )}
              {z.transform && (
                <title>{`${z.zoneName}: ${locale === 'en' ? 'from' : 'из'} ${z.transform.from} ${locale === 'en' ? 'to' : 'в'} ${z.transform.to}`}</title>
              )}
            </g>
          )
        })}
      </svg>
      <p style={{ marginTop: '0.5rem', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
        {loc.caption}
      </p>
      {current?.transform && (
        <p style={{ marginTop: '0.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          {locale === 'en'
            ? `Now: from ${current.transform.from} → to ${current.transform.to}`
            : `Сейчас: из ${current.transform.from} → в ${current.transform.to}`}
        </p>
      )}
    </div>
  )
}
