'use client'
import { useId, useState } from 'react'
import { NO_AI_WHY, canShowPoints, type NoAiCheckData, type NoAiLocale } from '@/lib/no-ai-check'

// «Проверь себя без ИИ» в конце практики с агентом (BACKLOG «Педагогика 5»). Ученик отвечает своими словами,
// потом открывает опорные пункты и сравнивает сам. Ответ не хранится и не отправляется.

const T = {
  ru: {
    kicker: 'Проверь себя без ИИ',
    placeholder: 'Своими словами, без подсказок',
    show: 'Сравнить с опорными пунктами',
    need: 'Пункты откроются, когда напишешь ответ.',
    points: 'Что должно быть в ответе',
  },
  en: {
    kicker: 'Check yourself without AI',
    placeholder: 'In your own words, no hints',
    show: 'Compare with the key points',
    need: 'The points open once you write an answer.',
    points: 'What the answer should include',
  },
} as const

export function NoAiCheck({ check, locale, initial }: {
  check: NoAiCheckData
  locale: NoAiLocale
  /** Для тестов рендера: стартовые ответы и открытые пункты без кликов. */
  initial?: { answers?: string[]; shown?: boolean[] }
}) {
  const t = T[locale]
  const uid = useId()
  const [answers, setAnswers] = useState<string[]>(initial?.answers ?? check.questions.map(() => ''))
  const [shown, setShown] = useState<boolean[]>(initial?.shown ?? check.questions.map(() => false))

  const note: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0.4rem 0 0' }

  return (
    <section
      aria-label={t.kicker}
      style={{ margin: '1.5rem 0', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
        {t.kicker}
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 0.75rem' }}>{NO_AI_WHY[locale]}</p>
      {check.questions.map((q, i) => {
        const ok = canShowPoints(answers[i] ?? '')
        const open = ok && !!shown[i]
        return (
          <div key={i} style={{ padding: '0.6rem 0', borderTop: '1px solid var(--border-color)' }}>
            <label htmlFor={`${uid}-q${i}`} style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.4rem' }}>
              {q.question[locale]}
            </label>
            <textarea
              id={`${uid}-q${i}`}
              value={answers[i] ?? ''}
              placeholder={t.placeholder}
              rows={3}
              onChange={e => {
                const next = [...answers]
                next[i] = e.target.value
                setAnswers(next)
              }}
              style={{
                width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '0.92rem', lineHeight: 1.5,
                padding: '0.5rem 0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-interactive, var(--border-color))',
                background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
              }}
            />
            <div aria-live="polite">
              {open ? (
                <>
                  <p style={{ ...note, fontWeight: 600 }}>{t.points}:</p>
                  <ul style={{ paddingLeft: '1.25rem', margin: '0.2rem 0 0', lineHeight: 1.55, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {q.points.map((p, j) => <li key={j}>{p[locale]}</li>)}
                  </ul>
                </>
              ) : !ok ? <p style={note}>{t.need}</p> : null}
            </div>
            {!open && (
              <button
                type="button"
                disabled={!ok}
                onClick={() => {
                  const next = [...shown]
                  next[i] = true
                  setShown(next)
                  // @ts-expect-error analytics global is optional
                  if (typeof window !== 'undefined') window.plausible?.('no_ai_check_compared', { props: { check: check.id } })
                }}
                style={{
                  marginTop: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius)', border: '1px solid var(--text-accent)', background: 'var(--text-accent)',
                  color: 'var(--text-on-accent)', cursor: ok ? 'pointer' : 'not-allowed', opacity: ok ? 1 : 0.5,
                }}
              >
                {t.show}
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
