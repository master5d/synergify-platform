import type { Locale } from '@/lib/dictionaries'
import { resolveAcceleration } from '@/lib/synergem-acceleration'

export function SynergemAcceleration({ locale }: { locale: Locale }) {
  const a = resolveAcceleration(locale)
  const title = locale === 'en' ? 'Growth ladder' : 'Лестница роста'
  const readyLabel = locale === 'en' ? 'Ready when' : 'Готовы, когда'
  const moveLabel = locale === 'en' ? 'Move' : 'Шаг'
  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)', marginBottom: '2.5rem' }}>
      <h2 style={{ margin: '0 0 .5rem', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.9rem', lineHeight: 1.55, color: 'var(--text-secondary)' }}>{a.intro}</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '1rem' }}>
        {a.stages.map((s, i) => (
          <li key={s.key} style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '.8rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-accent)' }}>
              <span aria-hidden="true">⬡ </span>{i + 1}. {s.name}
            </div>
            <div style={{ fontSize: '.9rem', color: 'var(--text-primary)', marginTop: '.15rem' }}>{s.milestone}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-secondary)', marginTop: '.35rem' }}>
              <span style={{ fontWeight: 600 }}>{readyLabel}:</span> {s.readiness}
            </div>
            <div style={{ fontSize: '.88rem', color: 'var(--text-primary)', marginTop: '.35rem', borderLeft: '3px solid var(--text-accent)', paddingLeft: '.7rem' }}>
              <span style={{ fontWeight: 600 }}>{moveLabel}:</span> {s.move}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
