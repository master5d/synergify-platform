import type { Locale } from '@/lib/intake/types'
import { getOfficeHours } from '@/lib/course/office-hours'

export function OfficeHoursCard({ locale }: { locale: Locale }) {
  const oh = getOfficeHours(locale)
  const linkBtn: React.CSSProperties = {
    display: 'inline-block', background: 'var(--bg-surface)', color: 'var(--text-primary)',
    border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 16px',
    fontSize: 14, textDecoration: 'none', fontFamily: 'inherit',
  }
  return (
    <section style={{ maxWidth: 640, margin: '2rem auto 3rem', padding: '0 1.5rem' }}>
      <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '.6rem' }}>{oh.eyebrow}</h2>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{oh.heading}</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{oh.intro}</p>
        {oh.ama.available && (
          <p style={{ margin: '0 0 1rem' }}>
            {oh.ama.registerUrl.startsWith('/')
              ? <a href={oh.ama.registerUrl} style={linkBtn}>{oh.ama.ctaLabel}</a>
              : <a href={oh.ama.registerUrl} target="_blank" rel="noopener noreferrer" style={linkBtn}>{oh.ama.ctaLabel} ↗</a>}
            <span style={{ display: 'block', marginTop: '.5rem', fontSize: '.8rem', color: 'var(--text-secondary)' }}>{oh.ama.cadenceNote}</span>
          </p>
        )}
        <p style={{ margin: '0 0 .75rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{oh.oneToOne.blurb}</p>
        <p style={{ margin: '0 0 1rem' }}>
          <a href={oh.oneToOne.url} target="_blank" rel="noopener noreferrer" style={linkBtn}>{oh.oneToOne.ctaLabel} ↗</a>
        </p>
        <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-secondary)', opacity: .85 }}>{oh.honestNote}</p>
      </div>
    </section>
  )
}
