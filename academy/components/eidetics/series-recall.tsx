'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { RYAD_UI } from '../../lib/eidetics/ui'
import {
  DIGIT_LENGTHS, WORD_LENGTHS, parseAnswer, pickSeries, scoreRecall, type RecallScore, type SeriesKind,
} from '../../lib/eidetics/recall'
import {
  freshRecall, pendingDelayed, readRecall, recordDelayed, recordImmediate, writeRecall,
  type RecallSession, type RecallState,
} from '../../lib/eidetics/recall-store'
import { localDate } from '../../lib/speedreading/local-date'

type Phase = 'idle' | 'study' | 'recall' | 'done'

const btn: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 6, padding: '.4rem .9rem',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '.9rem',
}
const box: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)',
}
const area: React.CSSProperties = {
  width: '100%', minHeight: '6rem', border: '1px solid var(--border-color)', borderRadius: 6, padding: '.6rem',
  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box',
}
const label: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)', textTransform: 'lowercase',
  letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '2.5rem 0 1rem',
}

function ScoreLine({ s, kind, t }: { s: RecallScore; kind: SeriesKind; t: (typeof RYAD_UI)[Locale] }) {
  return (
    <p style={{ margin: '.75rem 0 0', color: 'var(--text-primary)' }}>
      <b>{t.result}: {kind === 'digits' ? s.inOrder : s.anyOrder} {t.of} {s.total}</b>
      {kind === 'words' ? <span style={{ color: 'var(--text-secondary)' }}> · {t.inOrder}: {s.inOrder}</span> : null}
    </p>
  )
}

export function SeriesRecall({ locale }: { locale: Locale }) {
  const t = RYAD_UI[locale]
  const [state, setState] = useState<RecallState>(freshRecall)
  const [now, setNow] = useState(0)
  const [kind, setKind] = useState<SeriesKind>('words')
  const [length, setLength] = useState<number>(WORD_LENGTHS[0])
  const [phase, setPhase] = useState<Phase>('idle')
  const [series, setSeries] = useState<string[]>([])
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState<RecallScore | null>(null)
  const [delayedId, setDelayedId] = useState<string | null>(null)
  const [delayedAnswer, setDelayedAnswer] = useState('')
  const [delayedScore, setDelayedScore] = useState<{ s: RecallScore; kind: SeriesKind } | null>(null)

  useEffect(() => { setState(readRecall()); setNow(Date.now()) }, [])

  const save = (next: RecallState) => { setState(next); writeRecall(next) }
  const lengths: readonly number[] = kind === 'words' ? WORD_LENGTHS : DIGIT_LENGTHS

  const start = () => {
    setSeries(pickSeries(kind, length, Date.now() >>> 0, locale))
    setAnswer(''); setScore(null); setPhase('study')
  }
  const check = () => {
    const s = scoreRecall(series, parseAnswer(kind, answer))
    const at = Date.now()
    save(recordImmediate(state, {
      id: String(at), date: localDate(), studiedAt: at, kind, locale, items: series, immediate: s,
    }))
    setScore(s); setPhase('done'); setNow(at)
  }
  const checkDelayed = (session: RecallSession) => {
    const s = scoreRecall(session.items, parseAnswer(session.kind, delayedAnswer))
    save(recordDelayed(state, session.id, s, Date.now()))
    setDelayedScore({ s, kind: session.kind }); setDelayedId(null); setDelayedAnswer('')
  }

  const pending = pendingDelayed(state, now)
  const first = state.sessions.length === 0

  return (
    <div>
      <section style={box}>
        {phase === 'idle' || phase === 'done' ? (
          <>
            {first && phase === 'idle' ? <p style={{ margin: '0 0 1rem', color: 'var(--text-secondary)' }}>{t.firstHint}</p> : null}
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {(['words', 'digits'] as const).map(k => (
                <label key={k} style={{ fontSize: '.9rem', color: 'var(--text-secondary)' }}>
                  <input type="radio" name="ryad-kind" checked={kind === k}
                    onChange={() => { setKind(k); setLength((k === 'words' ? WORD_LENGTHS : DIGIT_LENGTHS)[0]) }} />{' '}
                  {k === 'words' ? t.words : t.digits}
                </label>
              ))}
              <label style={{ fontSize: '.9rem', color: 'var(--text-secondary)' }}>
                {t.length}:{' '}
                <select value={length} onChange={e => setLength(Number(e.target.value))}
                  style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: '.2rem .4rem', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {lengths.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <button style={btn} onClick={start}>{phase === 'done' ? t.again : t.start}</button>
            </div>
            {phase === 'done' && score ? <ScoreLine s={score} kind={kind} t={t} /> : null}
          </>
        ) : null}

        {phase === 'study' ? (
          <>
            <ol style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1rem', listStyle: 'none', padding: 0, margin: '0 0 1rem', fontSize: '1.15rem', color: 'var(--text-primary)', fontFamily: kind === 'digits' ? 'var(--font-mono)' : 'inherit' }}>
              {series.map((w, i) => <li key={i}>{w}</li>)}
            </ol>
            <button style={btn} onClick={() => setPhase('recall')}>{t.ready}</button>
          </>
        ) : null}

        {phase === 'recall' ? (
          <>
            <p style={{ margin: '0 0 .5rem', color: 'var(--text-secondary)' }}>{t.recallPrompt}</p>
            <textarea aria-label={t.recallPrompt} style={area} value={answer} onChange={e => setAnswer(e.target.value)} autoFocus />
            <button style={{ ...btn, marginTop: '.75rem' }} onClick={check}>{t.check}</button>
          </>
        ) : null}
      </section>

      <h2 style={label}>{t.delayedLabel}</h2>
      <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{t.delayedHint}</p>
      {delayedScore ? <ScoreLine s={delayedScore.s} kind={delayedScore.kind} t={t} /> : null}
      {pending.due.length === 0 && pending.waiting.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{t.delayedNone}</p>
      ) : null}
      <div style={{ display: 'grid', gap: '.75rem' }}>
        {pending.due.map(s => (
          <div key={s.id} style={box}>
            <p style={{ margin: 0, color: 'var(--text-primary)' }}>
              {t.delayedDue} {s.date} · {s.kind === 'words' ? t.words : t.digits} · {s.items.length}
            </p>
            {delayedId === s.id ? (
              <>
                <textarea aria-label={t.recallPrompt} style={{ ...area, marginTop: '.75rem' }} value={delayedAnswer} onChange={e => setDelayedAnswer(e.target.value)} autoFocus />
                <button style={{ ...btn, marginTop: '.75rem' }} onClick={() => checkDelayed(s)}>{t.check}</button>
              </>
            ) : (
              <button style={{ ...btn, marginTop: '.75rem' }} onClick={() => { setDelayedId(s.id); setDelayedAnswer(''); setDelayedScore(null) }}>{t.check}</button>
            )}
          </div>
        ))}
      </div>
      {pending.waiting.length > 0 ? (
        <p style={{ margin: '1rem 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          {t.delayedWaiting}: {pending.waiting.length}
        </p>
      ) : null}
    </div>
  )
}
