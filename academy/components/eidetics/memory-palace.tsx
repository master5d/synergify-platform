'use client'

import { useEffect, useState } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { DVOREC_UI } from '../../lib/eidetics/ui'
import { normalizeItem, pickSeries } from '../../lib/eidetics/recall'
import {
  MAX_LOCI, freshPalace, isRouteReady, readPalace, recordRun, setLoci, writePalace, type PalaceState,
} from '../../lib/eidetics/palace-store'
import { localDate } from '../../lib/speedreading/local-date'

type Phase = 'route' | 'study' | 'recall' | 'done'

const btn: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 6, padding: '.4rem .9rem',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '.9rem',
}
const box: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)',
}
const input: React.CSSProperties = {
  width: '100%', border: '1px solid var(--border-color)', borderRadius: 6, padding: '.4rem .6rem',
  background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box',
}
const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '2rem 1fr', gap: '.5rem', alignItems: 'center' }
const num: React.CSSProperties = { fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)', fontSize: 'var(--text-sm)' }

export function MemoryPalace({ locale }: { locale: Locale }) {
  const t = DVOREC_UI[locale]
  const [state, setState] = useState<PalaceState>(freshPalace)
  const [draft, setDraft] = useState<string[]>(['', '', '', '', ''])
  const [phase, setPhase] = useState<Phase>('route')
  const [words, setWords] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [correct, setCorrect] = useState(0)

  useEffect(() => {
    const s = readPalace()
    setState(s)
    if (s.loci.length > 0) setDraft(s.loci)
  }, [])

  const save = (next: PalaceState) => { setState(next); writePalace(next) }
  const saveRoute = () => {
    const next = setLoci(state, draft)
    save(next)
    setDraft(next.loci.length > 0 ? next.loci : ['', '', '', '', ''])
  }
  const start = () => {
    setWords(pickSeries('words', state.loci.length, Date.now() >>> 0, locale))
    setAnswers(state.loci.map(() => '')); setPhase('study')
  }
  const check = () => {
    const c = words.filter((w, i) => normalizeItem(answers[i] ?? '') === normalizeItem(w)).length
    setCorrect(c)
    save(recordRun(state, { date: localDate(), loci: words.length, correct: c }))
    setPhase('done')
  }

  const ready = isRouteReady(state)

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <section style={box}>
        <p style={{ ...num, textTransform: 'lowercase', letterSpacing: '0.12em', margin: '0 0 1rem' }}>{t.routeLabel}</p>
        <div style={{ display: 'grid', gap: '.5rem' }}>
          {draft.map((l, i) => (
            <label key={i} style={row}>
              <span style={num}>{String(i + 1).padStart(2, '0')}</span>
              <input style={input} value={l} placeholder={`${t.routePlaceholder} ${i + 1}`}
                onChange={e => setDraft(d => d.map((x, j) => (j === i ? e.target.value : x)))} />
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {draft.length < MAX_LOCI ? <button style={btn} onClick={() => setDraft(d => [...d, ''])}>{t.addLocus}</button> : null}
          <button style={btn} onClick={saveRoute}>{t.saveRoute}</button>
        </div>
        {!ready ? <p style={{ margin: '.75rem 0 0', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{t.needMore}</p> : null}
      </section>

      {ready ? (
        <section style={box}>
          {phase === 'route' || phase === 'done' ? (
            <>
              {phase === 'done' ? (
                <p style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}><b>{t.result}: {correct} {t.of} {words.length}</b></p>
              ) : null}
              <button style={btn} onClick={start}>{phase === 'done' ? t.again : t.start}</button>
            </>
          ) : null}

          {phase === 'study' ? (
            <>
              <div style={{ display: 'grid', gap: '.5rem', marginBottom: '1rem' }}>
                {state.loci.map((l, i) => (
                  <div key={i} style={row}>
                    <span style={num}>{String(i + 1).padStart(2, '0')}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{l} → <b style={{ color: 'var(--text-primary)' }}>{words[i]}</b></span>
                  </div>
                ))}
              </div>
              <button style={btn} onClick={() => setPhase('recall')}>{t.ready}</button>
            </>
          ) : null}

          {phase === 'recall' ? (
            <>
              <p style={{ margin: '0 0 .75rem', color: 'var(--text-secondary)' }}>{t.recallPrompt}</p>
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {state.loci.map((l, i) => (
                  <label key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(6rem, 1fr) 2fr', gap: '.5rem', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{l}</span>
                    <input style={input} value={answers[i] ?? ''} aria-label={l}
                      onChange={e => setAnswers(a => a.map((x, j) => (j === i ? e.target.value : x)))} />
                  </label>
                ))}
              </div>
              <button style={{ ...btn, marginTop: '1rem' }} onClick={check}>{t.check}</button>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
