import type { Locale } from '../lib/registry'
import { getCare } from '../lib/care'
import { CareForm } from './care-form'

interface Props { locale: Locale }

// Текст/ссылки на бумаге — бронза (золото на светлом = 1.7:1, DESIGN.md)
const INK = 'var(--accent-ink)'

/** Служба заботы школы — та же грамматика, что у «Правил дома»: воздух, mono-микролейбл, бронза. */
export function CarePage({ locale }: Props) {
  const t = getCare(locale)
  const home = locale === 'en' ? '/en/' : '/'

  return (
    <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 720px) {
          .care-wrap { padding: 3.5rem 1.25rem 4rem !important; }
          .care-wrap h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }
        }
      `}</style>

      <section className="care-wrap" style={{ maxWidth: '46rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: INK, textTransform: 'lowercase', letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>
          {t.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em', margin: '1rem 0 1.75rem', color: 'var(--text-primary)' }}>
          {t.heading}
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', marginBottom: '1rem' }}>{t.lead}</p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: '1.25rem', margin: '0 0 2.5rem' }}>
          {t.promises.map((p) => <li key={p}>{p}</li>)}
        </ul>

        <CareForm locale={locale} t={t.form} />

        <section aria-labelledby="care-related" style={{ marginTop: '3rem', paddingTop: '1.25rem', borderTop: '1px solid var(--accent-line)' }}>
          <h2 id="care-related" style={{ fontFamily: 'var(--font-mono)', color: INK, textTransform: 'lowercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '0 0 1rem' }}>
            {t.relatedLabel}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: 1.9, color: 'var(--text-muted)' }}>
            {t.related.map((r) => (
              <li key={r.href}><a className="a-link" href={r.href}>{r.label}</a> — {r.note}</li>
            ))}
          </ul>
        </section>

        <p style={{ marginTop: '3rem' }}>
          <a href={home} style={{ color: INK, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: '0.08em', textDecoration: 'none' }}>
            {t.backLabel}
          </a>
        </p>
      </section>
    </main>
  )
}
