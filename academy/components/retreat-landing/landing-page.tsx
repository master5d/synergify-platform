import type { Locale } from '../../lib/dictionaries'
import { BOOKLET_STYLE, GOLD } from '../retreat-booklet/styles'
import { LANDING_UI } from './ui'
import { RetreatLanding } from './retreat-landing'

export function LandingPage({ locale }: { locale: Locale }) {
  const t = LANDING_UI[locale]
  const home = locale === 'en' ? '/en/' : '/'
  return <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}><style>{BOOKLET_STYLE}</style>
    <section className="bk-wrap" style={{ maxWidth: '76rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
      <p className="bk-noprint" style={{ fontFamily: 'var(--font-mono)', color: GOLD, textTransform: 'lowercase',
        letterSpacing: '0.25em', fontSize: 'var(--text-xs)', margin: 0 }}>{t.eyebrow}</p>
      <h1 className="bk-noprint" style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
        fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', margin: '1rem 0 0.75rem', color: 'var(--text-primary)' }}>{t.h1}</h1>
      <p className="bk-noprint" style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: '0 0 2rem', maxWidth: '46rem' }}>{t.lead}</p>
      <RetreatLanding locale={locale} />
      <p className="bk-noprint" style={{ marginTop: '3rem' }}><a href={home} style={{ color: GOLD, fontSize: 'var(--text-sm)' }}>{t.back}</a></p>
    </section>
  </main>
}
