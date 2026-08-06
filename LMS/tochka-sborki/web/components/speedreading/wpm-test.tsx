'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { pickPassage, resolvePassage } from '@/lib/speedreading/passages'
import { wordCount, computeWpm, comprehensionFraction, effectiveWpm } from '@/lib/speedreading/wpm'
import { useWpmTest } from '@/lib/speedreading/use-wpm-test'

const T = {
  ru: {
    intro: 'Прочитай текст в своём темпе, затем ответь на вопросы. Результат — слов в минуту с поправкой на понимание.',
    start: 'Начать', reading: 'Читай в своём темпе, потом нажми «Готово».', done: 'Готово',
    quiz: 'Вопросы на понимание', seeResult: 'Показать результат', answerAll: 'Ответь на все вопросы',
    effective: 'Эффективная скорость', wpm: 'сл/мин', raw: 'Скорость', comprehension: 'Понимание',
    vsFirst: 'к первому тесту', again: 'Ещё раз',
  },
  en: {
    intro: 'Read the text at your own pace, then answer the questions. The score is words per minute adjusted for comprehension.',
    start: 'Start', reading: 'Read at your own pace, then press "Done".', done: 'Done',
    quiz: 'Comprehension questions', seeResult: 'See result', answerAll: 'Answer all questions',
    effective: 'Effective speed', wpm: 'wpm', raw: 'Speed', comprehension: 'Comprehension',
    vsFirst: 'vs your first test', again: 'Again',
  },
}

const btn: React.CSSProperties = {
  border: 'none', borderRadius: 8, padding: '.6rem 1.4rem', background: 'var(--text-accent)',
  color: 'var(--bg-primary)', fontWeight: 600, cursor: 'pointer',
}
const card: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)',
}

type Step = 'intro' | 'reading' | 'quiz' | 'result'
interface Result { wpm: number; frac: number; eff: number; correct: number; total: number; prevEff: number | null }

export function WpmTest({ locale }: { locale: Locale }) {
  const t = T[locale]
  const { state, ready, recordTest } = useWpmTest()
  const [step, setStep] = useState<Step>('intro')
  const [runIndex, setRunIndex] = useState(0)
  const [picks, setPicks] = useState<(number | null)[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const startAt = useRef(0)
  const msRef = useRef(0)
  const seededRun = useRef(false)
  const recorded = useRef(false)

  // seed the run index once from prior-test count, then advance monotonically per run (survives the 50-cap)
  useEffect(() => { if (ready && !seededRun.current) { seededRun.current = true; setRunIndex(state.results.length) } }, [ready, state.results.length])

  const passage = useMemo(() => resolvePassage(pickPassage(runIndex), locale), [runIndex, locale])
  const words = useMemo(() => wordCount(passage.text), [passage])

  const startReading = () => {
    recorded.current = false
    setPicks(passage.questions.map(() => null))
    setResult(null)
    startAt.current = Date.now()
    setStep('reading')
  }
  const finishReading = () => { msRef.current = Date.now() - startAt.current; setStep('quiz') }
  const pick = (qi: number, ci: number) => {
    setPicks(prev => (prev[qi] !== null ? prev : prev.map((p, i) => (i === qi ? ci : p))))
  }
  const allAnswered = picks.length > 0 && picks.every(p => p !== null)

  const seeResult = () => {
    if (recorded.current) return
    recorded.current = true
    const correct = passage.questions.reduce((n, q, i) => n + (picks[i] === q.answer ? 1 : 0), 0)
    const total = passage.questions.length
    const wpm = computeWpm(words, msRef.current)
    const frac = comprehensionFraction(correct, total)
    const eff = effectiveWpm(wpm, frac)
    const prevEff = state.results.length > 0 ? state.results[0].effectiveWpm : null
    recordTest({ passageId: passage.id, ms: msRef.current, words, wpm, correct, total, effectiveWpm: eff })
    setResult({ wpm, frac, eff, correct, total, prevEff })
    setStep('result')
  }
  const again = () => { setRunIndex(i => i + 1); setStep('intro'); setResult(null); setPicks([]) }

  if (step === 'intro') {
    return (
      <section style={card}>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 1.25rem' }}>{t.intro}</p>
        <button style={btn} onClick={startReading} disabled={!ready}>{t.start}</button>
      </section>
    )
  }

  if (step === 'reading') {
    return (
      <section style={card}>
        <p style={{ fontSize: '.8rem', color: 'var(--text-accent)', margin: '0 0 .75rem' }}>{t.reading}</p>
        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1.05rem', margin: '0 0 1.5rem' }}>{passage.text}</p>
        <button style={btn} onClick={finishReading}>{t.done}</button>
      </section>
    )
  }

  if (step === 'quiz') {
    return (
      <section style={card}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem', color: 'var(--text-primary)' }}>{t.quiz}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {passage.questions.map((q, qi) => {
            const answered = picks[qi] !== null
            return (
              <div key={qi}>
                <p style={{ color: 'var(--text-primary)', margin: '0 0 .6rem' }}>{q.prompt}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                  {q.choices.map((choice, ci) => {
                    const isCorrect = ci === q.answer
                    const isPicked = ci === picks[qi]
                    const mark = answered && isCorrect ? ' ✓' : answered && isPicked ? ' ✗' : ''
                    const borderColor = answered && isCorrect ? 'var(--text-accent)' : answered && isPicked ? 'var(--crit, #c0392b)' : 'var(--border-color)'
                    return (
                      <button key={ci} type="button" disabled={answered} aria-pressed={isPicked} onClick={() => pick(qi, ci)}
                        style={{
                          background: 'transparent', color: 'var(--text-primary)', border: `1px solid ${borderColor}`,
                          borderRadius: 8, padding: '.5rem .9rem', textAlign: 'left',
                          cursor: answered ? 'default' : 'pointer',
                          opacity: answered && !isCorrect && !isPicked ? 0.6 : 1,
                        }}>
                        {choice}{mark}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: '1.25rem' }}>
          {allAnswered
            ? <button style={btn} onClick={seeResult}>{t.seeResult}</button>
            : <span style={{ fontSize: '.85rem', color: 'var(--text-secondary)' }}>{t.answerAll}</span>}
        </div>
      </section>
    )
  }

  // step === 'result'
  const r = result!
  const delta = r.prevEff !== null ? r.eff - r.prevEff : null
  return (
    <section style={{ ...card, textAlign: 'center' }}>
      <div style={{ fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '.4rem' }}>{t.effective}</div>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-accent)', lineHeight: 1 }}>{r.eff}</div>
      <div style={{ fontSize: '.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{t.wpm}</div>
      <div style={{ fontSize: '.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {t.raw}: {r.wpm} {t.wpm} · {t.comprehension}: {Math.round(r.frac * 100)}% ({r.correct}/{r.total})
      </div>
      {delta !== null && (
        <div style={{ fontSize: '.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          {delta >= 0 ? '+' : ''}{delta} {t.wpm} {t.vsFirst}
        </div>
      )}
      <button style={btn} onClick={again}>{t.again}</button>
    </section>
  )
}
