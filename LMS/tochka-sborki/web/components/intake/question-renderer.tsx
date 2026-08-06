'use client'
import type { Question, AnswerValue, Locale } from '@/lib/intake/types'

interface Props {
  question: Question
  locale: Locale
  value: AnswerValue | undefined
  onChange: (v: AnswerValue) => void
  otherValue?: string
  onOtherChange?: (v: string) => void
}

export function QuestionRenderer({ question: q, locale, value, onChange, otherValue, onOtherChange }: Props) {
  const t = (x: { ru: string; en: string }) => x[locale]
  const otherPlaceholder = locale === 'en' ? 'Type your answer…' : 'Впишите свой вариант…'

  if (q.format === 'text')
    return (
      <textarea
        className="intake-field"
        value={(value as string) ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={q.placeholder?.[locale] ?? otherPlaceholder}
        rows={4}
      />
    )

  if (q.format === 'number')
    return (
      <input
        className="intake-field"
        type="number"
        inputMode="numeric"
        value={(value as number) ?? ''}
        onChange={e => onChange(Number(e.target.value))}
        placeholder="0"
      />
    )

  if (q.format === 'likert')
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`intake-likert${value === n ? ' is-on' : ''}`}
            onClick={() => onChange(n)}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
    )

  // single | multi
  const selected = q.format === 'multi' ? ((value as string[]) ?? []) : value
  const otherSelected =
    q.format === 'multi'
      ? (selected as string[]).includes('other')
      : selected === 'other'

  return (
    <div>
      {q.options!.map(o => {
        const on = q.format === 'multi' ? (selected as string[]).includes(o.value) : selected === o.value
        return (
          <button
            key={o.value}
            type="button"
            className={`intake-option${on ? ' is-on' : ''}`}
            aria-pressed={on}
            onClick={() =>
              q.format === 'multi'
                ? onChange(
                    on
                      ? (selected as string[]).filter(v => v !== o.value)
                      : [...(selected as string[]), o.value],
                  )
                : onChange(o.value)
            }
          >
            {t(o.label)}
          </button>
        )
      })}
      {otherSelected && onOtherChange && (
        <textarea
          className="intake-field"
          style={{ marginTop: 10 }}
          value={otherValue ?? ''}
          onChange={e => onOtherChange(e.target.value)}
          placeholder={otherPlaceholder}
          rows={2}
          autoFocus
        />
      )}
    </div>
  )
}
