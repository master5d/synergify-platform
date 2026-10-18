import type { Locale } from '../../lib/dictionaries'
import { RetreatVenue } from './retreat-venue'
import { VY_UI } from './ui'
export function VenuePage({ locale }: { locale: Locale }) {
  const t = VY_UI[locale]
  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        .vy-content { max-width: 62rem; margin: 0 auto; padding: 6rem 2rem 5rem; }
        .vy-fields { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.9rem; }
        .vy-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.25rem 0; }
        .vy-results { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 0.75rem; }
        .vy-results article { display: flex; flex-direction: column; gap: 0.35rem; }
        .vy-hint { color: var(--text-secondary); font-size: var(--text-sm); line-height: 1.6; margin: 0 0 0.9rem; }
        .vy-month-table { overflow-x: auto; }
        .vy-month-table table { width: 100%; border-collapse: collapse; font-size: var(--text-xs); }
        .vy-month-table th, .vy-month-table td { border-bottom: 1px solid var(--border-soft); padding: 0.45rem; text-align: left; vertical-align: top; }
        .vy-month-table tr.closed { color: var(--text-secondary); }
        .vy-content input:disabled { opacity: 0.45; }
        .vy-calc { color: var(--accent-ink); white-space: nowrap; font-size: var(--text-xs); }
        .vy-month-cards { display: none; }
        .vy-disclaimer { color: var(--text-secondary); font-size: var(--text-xs); margin-top: 2rem; }
        @media (max-width: 45rem) {
          .vy-content { padding: 3rem 1rem 4rem; }
          .vy-month-table { display: none; }
          .vy-month-cards { display: grid; gap: 1rem; }
        }
        @media print {
          .vy-content > :not(.vy-print-months):not(.vy-print-results):not(.vy-disclaimer) { display: none !important; }
          .vy-month-cards, .vy-actions, .vy-noprint, .pg-noprint { display: none !important; }
          .vy-print-months, .vy-print-results, .vy-disclaimer { display: block !important; }
          .vy-month-table { display: block !important; }
        }
      `}</style>
      <p
        className="pg-noprint"
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent-ink)',
          textTransform: 'lowercase',
          letterSpacing: '.25em',
          fontSize: 'var(--text-xs)',
        }}
      >
        {t.eyebrow}
      </p>
      <h1
        className="pg-noprint"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem,5vw,3.4rem)', color: 'var(--text-primary)' }}
      >
        {t.h1}
      </h1>
      <p className="pg-noprint" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {t.lead}
      </p>
      <RetreatVenue locale={locale} />
      <p className="pg-noprint">
        <a href={locale === 'en' ? '/en/' : '/'} style={{ color: 'var(--accent-ink)' }}>
          {t.backLabel}
        </a>
      </p>
    </main>
  )
}
