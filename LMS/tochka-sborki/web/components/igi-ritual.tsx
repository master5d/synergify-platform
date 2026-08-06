import type { Locale } from '@/lib/dictionaries'
import { resolveIgi } from '@/lib/igi'

export function IgiRitual({ locale }: { locale: Locale }) {
  const igi = resolveIgi(locale)
  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h2 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{igi.title}</h2>
      <p style={{ margin: '0 0 1rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{igi.intro}</p>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.88rem', lineHeight: 1.55, color: 'var(--text-primary)', borderLeft: '3px solid var(--text-accent)', paddingLeft: '.8rem' }}>{igi.generative}</p>
      <div role="list" style={{ display: 'grid', gap: '.7rem', marginBottom: '1.25rem' }}>
        {igi.cards.map((c) => (
          <div role="listitem" key={c.id} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '.8rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}><span aria-hidden="true">⬡ </span>{c.name}</div>
            <div style={{ fontSize: '.9rem', color: 'var(--text-primary)' }}>{c.prompt}</div>
          </div>
        ))}
      </div>
      <ol style={{ margin: 0, paddingLeft: '1.1rem', display: 'grid', gap: '.5rem' }}>
        {igi.steps.map((s) => (
          <li key={s.id} style={{ fontSize: '.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.title}.</span> {s.body}
          </li>
        ))}
      </ol>
    </section>
  )
}
