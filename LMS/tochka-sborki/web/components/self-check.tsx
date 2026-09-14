'use client'
import { useId, useState } from 'react'
import type { SelfCheckItem } from '@/lib/content'
import { isCorrect, makeTracker } from '@/lib/self-check'

const T = {
  ru: { label: 'Проверь себя', check: 'Проверить', right: 'Верно', wrong: 'Не совсем' },
  en: { label: 'Check yourself', check: 'Check', right: 'Correct', wrong: 'Not quite' },
}

const track = makeTracker(props => {
  // @ts-expect-error analytics global is optional
  if (typeof window !== 'undefined') window.plausible?.('self_check_answered', { props })
})

/** Вопрос «проверь себя» (intake LMS#8). Данные приходят с сервера из _meta.json модуля. */
export function SelfCheck({ item, locale }: { item: SelfCheckItem; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const name = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const correct = isCorrect(item, picked)

  const submit = () => {
    if (picked === null) return
    setShown(true)
    track(item, correct)
  }

  return (
    <section style={{ margin: '2rem 0', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ padding: 0, marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>{t.label}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{item.question}</span>
        </legend>
        {item.options.map((o, i) => (
          <label key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', padding: '0.3rem 0', cursor: 'pointer', color: shown && i === item.answer ? 'var(--text-accent)' : 'var(--text-primary)' }}>
            <input type="radio" name={name} value={i} checked={picked === i} onChange={() => { setPicked(i); setShown(false) }} />
            <span>{o}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={submit} disabled={picked === null} style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: 'var(--radius)', cursor: picked === null ? 'not-allowed' : 'pointer', border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)', opacity: picked === null ? 0.5 : 1 }}>
        {t.check}
      </button>
      <div aria-live="polite" style={{ marginTop: '0.75rem' }}>
        {shown && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{correct ? t.right : t.wrong}.</strong> {item.explain}
          </p>
        )}
      </div>
    </section>
  )
}
