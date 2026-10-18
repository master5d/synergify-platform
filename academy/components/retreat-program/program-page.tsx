import type { Locale } from '../../lib/dictionaries'
import { RetreatProgram } from './retreat-program'
import { PG_UI } from './ui'

export function ProgramPage({ locale }: { locale: Locale }) {
  const t = PG_UI[locale]
  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`@media print {
        .pg-noprint, .pg-screen { display:none!important }
        body[data-pg-print="grid"] .pg-print-grid,
        body[data-pg-print="cards"] .pg-print-cards { display:block!important }
        .pg-print-grid table, .pg-print-cards table { width:100%; border-collapse:collapse }
        .pg-print-grid th, .pg-print-grid td, .pg-print-cards th, .pg-print-cards td {
          border:1px solid #999; padding:4px; text-align:left; vertical-align:top
        }
      }
      .pg-print-grid, .pg-print-cards { display:none }
      .pg-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(10.5rem,1fr)); gap:.9rem }
      .pg-days { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(19rem,100%),1fr)); gap:1rem }
      .pg-block-row { display:grid; grid-template-columns:4.5rem 5.5rem 4rem auto; gap:.35rem; align-items:center; margin-bottom:.4rem }
      .pg-block-row > :last-child { grid-column:1 / -1 }
      .pg-actions { display:flex; gap:.5rem; flex-wrap:wrap; margin:1.25rem 0 }
      .pg-card-summary { display:flex; gap:.6rem; align-items:center; flex-wrap:wrap }
      .pg-card-fields { display:grid; gap:.65rem; margin-top:1rem }
      .pg-meta { color:var(--text-secondary); font-size:var(--text-xs) }
      @media (max-width:30rem) {
        .pg-wrap { padding-left:1rem!important; padding-right:1rem!important }
        .pg-block-row { grid-template-columns:1fr 1fr }
      }`}</style>
      <section className="pg-wrap" style={{ maxWidth: '62rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p className="pg-noprint" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)',
          textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>{t.eyebrow}</p>
        <h1 className="pg-noprint" style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
          fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>{t.h1}</h1>
        <p className="pg-noprint" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 2rem' }}>{t.lead}</p>
        <RetreatProgram locale={locale} />
        <p className="pg-noprint" style={{ marginTop: '3rem' }}><a href={locale === 'en' ? '/en/' : '/'} style={{ color: 'var(--accent-ink)' }}>{t.backLabel}</a></p>
      </section>
    </main>
  )
}
