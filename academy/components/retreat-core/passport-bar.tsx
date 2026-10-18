import type { Locale } from '../../lib/dictionaries'
import type { RetreatPassport } from '../../lib/retreat-core/passport'

const COPY = {
  ru: { label: 'Данные ретрита', nights: 'ночей', guests: 'гостей', empty: 'ещё не заполнены' },
  en: { label: 'Retreat data', nights: 'nights', guests: 'guests', empty: 'not filled in yet' },
}

/** Плашка паспорта ретрита сверху каждого инструмента ведущего и ссылки в соседние инструменты с теми же данными. */
export function PassportBar({ locale, passport, links }: {
  locale: Locale
  passport: RetreatPassport
  links: { href: string; label: string }[]
}) {
  const c = COPY[locale]
  const parts = [
    passport.title,
    passport.start,
    passport.nights !== undefined ? `${passport.nights} ${c.nights}` : undefined,
    passport.guests !== undefined ? `${passport.guests} ${c.guests}` : undefined,
    passport.currency,
  ].filter(Boolean)
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center', justifyContent: 'space-between',
      border: '1px solid var(--border-soft)', borderRadius: 'var(--radius)', padding: '0.6rem 0.9rem', margin: '0 0 1.25rem',
      fontSize: 'var(--text-sm)', background: 'var(--bg-surface)',
    }}>
      <span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)', letterSpacing: '0.08em' }}>{c.label}</span>
        {' · '}{parts.length ? parts.join(' · ') : c.empty}</span>
      <span style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {links.map((l) => <a key={l.href} href={l.href} style={{ color: 'var(--accent-ink)' }}>{l.label} →</a>)}
      </span>
    </div>
  )
}
