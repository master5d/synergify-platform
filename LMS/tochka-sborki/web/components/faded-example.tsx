'use client'
import { useId, useState } from 'react'
import {
  STAGES, blankIndexes, canReveal,
  type FadedExampleData, type FadedLocale, type FadedStage, type FadedStep,
} from '@/lib/faded-example'

// Faded worked example в практике юнита (BACKLOG «Педагогика 4»): полный разбор → та же задача с пропусками →
// самостоятельно. Эталон пропуска не рендерится, пока ученик не написал ответ в каждый пропуск и не нажал
// «Сравнить с эталоном»: сначала сам, потом сравнение. Свободный текст не оцениваем — сравнивает ученик.
// «Сразу к самостоятельной» — для тех, кому тема знакома (expertise reversal): без штрафа и без отметок.

const T = {
  ru: {
    kicker: 'Разбор примера',
    intro: 'Три шага: полный разбор, тот же тип задачи с пропусками, потом — сам. Если тема знакома, переходи сразу к самостоятельной: ничего не теряешь.',
    stages: { worked: 'Полный разбор', faded: 'С пропусками', solo: 'Сам' },
    why: 'Почему',
    yours: 'Твой ответ',
    reference: 'Эталон',
    blankHint: 'Напиши, что здесь должно стоять',
    compare: 'Сравнить с эталоном',
    compareNeed: 'Эталон откроется, когда заполнишь все пропуски.',
    compareHow: 'Сравни сам: совпал ли смысл, а не слова.',
    toFaded: 'Дальше: с пропусками',
    toSolo: 'Дальше: сам',
    skip: 'Сразу к самостоятельной',
    back: 'Назад к разбору',
  },
  en: {
    kicker: 'Worked example',
    intro: 'Three steps: a full walkthrough, the same kind of task with gaps, then on your own. If the topic is familiar, jump straight to the solo step: you lose nothing.',
    stages: { worked: 'Full walkthrough', faded: 'With gaps', solo: 'On your own' },
    why: 'Why',
    yours: 'Your answer',
    reference: 'Reference',
    blankHint: 'Write what belongs here',
    compare: 'Compare with the reference',
    compareNeed: 'The reference opens once every gap is filled.',
    compareHow: 'Compare it yourself: does the meaning match, not the wording.',
    toFaded: 'Next: with gaps',
    toSolo: 'Next: on your own',
    skip: 'Skip to the solo step',
    back: 'Back to the walkthrough',
  },
} as const

export interface FadedInitial {
  stage?: FadedStage
  answers?: string[]
  revealed?: boolean
}

export function FadedExample({ example, locale, initial }: {
  example: FadedExampleData
  locale: FadedLocale
  /** Для тестов рендера: стартовое состояние без кликов. */
  initial?: FadedInitial
}) {
  const t = T[locale]
  const uid = useId()
  const [stage, setStage] = useState<FadedStage>(initial?.stage ?? 'worked')
  const [answers, setAnswers] = useState<string[]>(initial?.answers ?? example.faded.steps.map(() => ''))
  const [revealed, setRevealed] = useState(initial?.revealed ?? false)
  const blanks = blankIndexes(example)
  const ready = canReveal(answers, blanks)
  const shown = revealed && ready

  const go = (next: FadedStage, skipped = false) => {
    setStage(next)
    // @ts-expect-error analytics global is optional
    if (typeof window !== 'undefined') window.plausible?.('faded_example_stage', { props: { example: example.id, stage: next, skipped: skipped ? 'yes' : 'no' } })
  }

  const primary: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
    padding: '0.6rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
    border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)',
  }
  const ghost: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700,
    padding: '0.6rem 1rem', borderRadius: 'var(--radius)', cursor: 'pointer',
    border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-accent)',
  }
  const label: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem',
  }
  const body: React.CSSProperties = { color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }
  const note: React.CSSProperties = { color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, margin: '0.3rem 0 0' }
  const stepBox: React.CSSProperties = { padding: '0.6rem 0', borderTop: '1px solid var(--border-color)' }

  const Given = ({ s }: { s: FadedStep }) => (
    <>
      <p style={body}>{s.text[locale]}</p>
      <p style={note}><strong>{t.why}:</strong> {s.why[locale]}</p>
    </>
  )

  return (
    <section
      aria-label={`${t.kicker}: ${example.title[locale]}`}
      style={{
        margin: '1.5rem 0', padding: '1.25rem 1.5rem',
        border: '1px solid var(--border-color)', borderLeft: '3px solid var(--text-accent)',
        borderRadius: 'var(--radius)', background: 'var(--bg-surface)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
        {t.kicker} · {example.title[locale]}
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, margin: '0 0 0.75rem' }}>{t.intro}</p>

      <ol aria-label={t.kicker} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
        {STAGES.map((st, i) => (
          <li key={st}>
            <button
              type="button"
              aria-current={stage === st ? 'step' : undefined}
              onClick={() => go(st)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', padding: '0.3rem 0.6rem', cursor: 'pointer',
                borderRadius: 'var(--radius)', border: '1px solid var(--border-color)',
                background: stage === st ? 'var(--text-accent)' : 'transparent',
                color: stage === st ? 'var(--text-on-accent)' : 'var(--text-secondary)',
              }}
            >
              {i + 1}. {t.stages[st]}
            </button>
          </li>
        ))}
      </ol>

      {stage === 'worked' && (
        <div>
          <p style={{ ...body, fontWeight: 600, marginBottom: '0.6rem' }}>{example.worked.task[locale]}</p>
          {example.worked.steps.map((s, i) => (
            <div key={i} style={stepBox}>
              <div style={label}>{s.label[locale]}</div>
              <Given s={s} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
            <button type="button" onClick={() => go('faded')} style={primary}>{t.toFaded}</button>
            <button type="button" onClick={() => go('solo', true)} style={ghost}>{t.skip}</button>
          </div>
        </div>
      )}

      {stage === 'faded' && (
        <div>
          <p style={{ ...body, fontWeight: 600, marginBottom: '0.6rem' }}>{example.faded.task[locale]}</p>
          {example.faded.steps.map((s, i) => (
            <div key={i} style={stepBox}>
              {s.blank ? (
                <>
                  <label htmlFor={`${uid}-b${i}`} style={{ ...label, display: 'block' }}>{s.label[locale]}</label>
                  <textarea
                    id={`${uid}-b${i}`}
                    value={answers[i] ?? ''}
                    placeholder={t.blankHint}
                    rows={2}
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
                  {shown && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <p style={note}><strong>{t.reference}:</strong> {s.text[locale]}</p>
                      <p style={note}><strong>{t.why}:</strong> {s.why[locale]}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={label}>{s.label[locale]}</div>
                  <Given s={s} />
                </>
              )}
            </div>
          ))}
          <div aria-live="polite" style={{ marginTop: '0.6rem' }}>
            {shown ? <p style={note}>{t.compareHow}</p> : !ready ? <p style={note}>{t.compareNeed}</p> : null}
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
            {!shown && (
              <button type="button" onClick={() => setRevealed(true)} disabled={!ready} style={{ ...primary, opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'not-allowed' }}>
                {t.compare}
              </button>
            )}
            {shown
              ? <button type="button" onClick={() => go('solo')} style={primary}>{t.toSolo}</button>
              : <button type="button" onClick={() => go('solo', true)} style={ghost}>{t.skip}</button>}
          </div>
        </div>
      )}

      {stage === 'solo' && (
        <div>
          <p style={{ ...body, fontWeight: 600 }}>{example.solo.task[locale]}</p>
          <div style={{ marginTop: '0.9rem' }}>
            <button type="button" onClick={() => go('worked')} style={ghost}>{t.back}</button>
          </div>
        </div>
      )}
    </section>
  )
}
