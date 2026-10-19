import type { Locale } from '../../lib/dictionaries'
import { defaultForm } from '../../lib/retreat-booklet/form'
import { RetreatBooklet } from './retreat-booklet'
import { BK_UI } from './ui'
import { BOOKLET_STYLE } from './styles'

export function BookletPage({ locale }: { locale: Locale }) {
  const t = BK_UI[locale]
  return <main style={{ background: 'var(--bg-primary)', color: 'var(--text-body)', minHeight: '100vh' }}>
    <style>{BOOKLET_STYLE}</style><section style={{ maxWidth: '68rem', margin: '0 auto', padding: '6rem 2rem 5rem' }}>
      <p className="bk-noprint" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)', letterSpacing: '.25em', fontSize: 'var(--text-xs)' }}>{t.eyebrow}</p>
      <h1 className="bk-noprint" style={{ fontFamily: 'var(--font-display)', fontWeight: 300,
        fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>{t.h1}</h1>
      <p className="bk-noprint" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{t.lead}</p>
      <RetreatBooklet locale={locale} /><p className="bk-noprint" style={{ marginTop: '3rem' }}>
        <a href={locale === 'en' ? '/en/' : '/'} style={{ color: 'var(--accent-ink)' }}>{t.back}</a></p>
    </section></main>
}
