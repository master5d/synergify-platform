'use client'

import { useState } from 'react'
import type { ShowcaseVM, CatFilter } from '@/lib/course/showcase'
import { filterByCategory } from '@/lib/course/showcase'
import type { Locale } from '@/lib/intake/types'

export function ShowcaseFilter({ data, locale }: { data: ShowcaseVM; locale: Locale }) {
  const [active, setActive] = useState<CatFilter>('all')
  const intakeHref = locale === 'en' ? '/en/quest-intake/' : '/quest-intake/'
  const deepDive = locale === 'en' ? '→ deep-dive' : '→ разбор'
  const allLabel = locale === 'en' ? 'All' : 'Все'
  const groupLabel = locale === 'en' ? 'Filter by category' : 'Фильтр по категории'

  const card: React.CSSProperties = {
    display: 'block', padding: '1.2rem', borderRadius: 12,
    border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
    color: 'inherit', textDecoration: 'none',
  }
  const grid: React.CSSProperties = {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem',
  }
  const subHeading: React.CSSProperties = { fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 800, marginBottom: '1.6rem' }
  const tab = (selected: boolean): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em',
    padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
    border: '1px solid var(--border-color)',
    background: selected ? 'var(--text-accent)' : 'transparent',
    color: selected ? 'var(--text-on-accent)' : 'var(--text-secondary)',
  })

  const realCases = filterByCategory(data.real.cases, active)
  const dreamCases = filterByCategory(data.dream.cases, active)

  return (
    <>
      <div role="group" aria-label={groupLabel} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.6rem' }}>
        <button type="button" aria-pressed={active === 'all'} onClick={() => setActive('all')} style={tab(active === 'all')}>{allLabel}</button>
        {data.categories.map(c => (
          <button key={c.key} type="button" aria-pressed={active === c.key} onClick={() => setActive(c.key)} style={tab(active === c.key)}>{c.label}</button>
        ))}
      </div>

      {realCases.length > 0 && (
        <>
          <h2 style={subHeading}>{data.real.heading}</h2>
          <div style={{ ...grid, marginBottom: '2.5rem' }}>
            {realCases.map(c => {
              const inner = (
                <>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">{c.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.7rem' }}>{c.blurb}</p>
                  <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.7rem' }}>{c.result}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)', border: '1px solid var(--border-color)', borderRadius: 999, padding: '2px 10px' }}>{c.tag}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>— {c.author}</span>
                  </div>
                  {c.href && <div style={{ marginTop: '0.7rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-accent)' }}>{deepDive}</div>}
                </>
              )
              return c.href
                ? <a key={c.id} href={c.href} style={card}>{inner}</a>
                : <div key={c.id} style={card}>{inner}</div>
            })}
          </div>
        </>
      )}

      {dreamCases.length > 0 && (
        <>
          <h2 style={subHeading}>{data.dream.heading}</h2>
          <div style={grid}>
            {dreamCases.map(c => {
              const inner = (
                <>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">{c.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.7rem' }}>{c.blurb}</p>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)', border: '1px solid var(--border-color)', borderRadius: 999, padding: '2px 10px' }}>{c.tag}</span>
                </>
              )
              return c.href
                ? <a key={c.id} href={c.href} style={card}>{inner}</a>
                : <div key={c.id} style={card}>{inner}</div>
            })}
          </div>
        </>
      )}

      {/* Чужие проекты. Вне фильтра по категориям сознательно: категории описывают
          замыслы учеников, а это соседний ландшафт — его не фильтруют, в него смотрят. */}
      {data.others.cases.length > 0 && (
        <>
          <h2 style={{ ...subHeading, marginTop: '2.5rem', marginBottom: '0.6rem' }}>{data.others.heading}</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '52ch', marginBottom: '1.6rem' }}>{data.others.note}</p>
          <div style={grid}>
            {data.others.cases.map(c => (
              <a key={c.id} href={c.href} style={card} target="_blank" rel="noopener noreferrer">
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">{c.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.7rem' }}>{c.blurb}</p>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{c.source}</span>
              </a>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href={intakeHref} style={{ display: 'inline-block', background: 'var(--text-accent)', color: 'var(--text-on-accent)', fontWeight: 700, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>{data.cta}</a>
      </div>
    </>
  )
}
