'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Locale } from '@/lib/dictionaries'
import {
  tokenize, buildSchedule, splitOrp,
  MIN_WPM, MAX_WPM, WPM_STEP, MAX_CHUNK,
} from '@/lib/speedreading/rsvp'
import { resolveRsvpSample } from '@/lib/speedreading/rsvp-sample'
import { useRsvp } from '@/lib/speedreading/use-rsvp'

const T = {
  ru: { speed: 'Скорость', chunk: 'Слов за раз', play: 'Играть', pause: 'Пауза', reset: 'Сброс', yourText: 'Ваш текст', wpm: 'сл/мин' },
  en: { speed: 'Speed', chunk: 'Words at once', play: 'Play', pause: 'Pause', reset: 'Reset', yourText: 'Your text', wpm: 'wpm' },
}

const btn: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 6, padding: '.4rem .9rem',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '.9rem',
}
const label: React.CSSProperties = { display: 'block', fontSize: '.8rem', color: 'var(--text-secondary)', marginTop: '.9rem' }

export function RsvpReader({ locale }: { locale: Locale }) {
  const t = T[locale]
  const { state, ready, setWpm, setChunk, logSession } = useRsvp()
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seeded = useRef(false)

  // seed the textarea with the sample once (after persisted state is ready)
  useEffect(() => {
    if (ready && !seeded.current) { seeded.current = true; setText(resolveRsvpSample(locale)) }
  }, [ready, locale])

  const tokens = useMemo(() => tokenize(text), [text])
  const schedule = useMemo(
    () => buildSchedule(tokens, { wpm: state.wpm, chunkSize: state.chunkSize }),
    [tokens, state.wpm, state.chunkSize],
  )

  useEffect(() => {
    if (!playing) return
    if (index >= schedule.length) {
      setPlaying(false)
      if (index === schedule.length && tokens.length > 0) logSession(state.wpm, tokens.length)
      return
    }
    timer.current = setTimeout(() => setIndex(i => i + 1), schedule[index].ms)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [playing, index, schedule, tokens.length, state.wpm, logSession])

  const start = () => { if (index >= schedule.length) setIndex(0); setPlaying(true) }
  const pause = () => setPlaying(false)
  const reset = () => { setPlaying(false); setIndex(0) }

  const frame = schedule[Math.min(index, schedule.length - 1)]
  const orp = frame ? splitOrp(frame.text) : { before: '', pivot: '', after: '' }

  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)' }}>
      {/* word display — ORP pivot fixed on the center axis (monospace, 1ch) */}
      <div style={{ position: 'relative', height: '3rem', marginBottom: '.35rem', fontFamily: 'var(--font-mono)', fontSize: '2rem', lineHeight: '3rem' }} aria-live="polite">
        <span style={{ position: 'absolute', top: 0, right: 'calc(50% + 0.5ch)', color: 'var(--text-primary)', whiteSpace: 'pre' }}>{orp.before}</span>
        <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', color: 'var(--text-accent)', fontWeight: 700 }}>{orp.pivot}</span>
        <span style={{ position: 'absolute', top: 0, left: 'calc(50% + 0.5ch)', color: 'var(--text-primary)', whiteSpace: 'pre' }}>{orp.after}</span>
      </div>
      {/* center focal tick */}
      <div style={{ height: 8, borderLeft: '2px solid var(--text-accent)', width: 0, margin: '0 auto .75rem' }} aria-hidden="true" />

      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
        <button style={btn} onClick={playing ? pause : start}>{playing ? t.pause : t.play}</button>
        <button style={btn} onClick={reset}>{t.reset}</button>
      </div>
      <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--text-secondary)', marginTop: '.5rem' }}>
        {Math.min(index, schedule.length)} / {schedule.length}
      </div>

      <label style={label}>
        {t.speed}: {state.wpm} {t.wpm}
        <input type="range" min={MIN_WPM} max={MAX_WPM} step={WPM_STEP} value={state.wpm}
          onChange={e => setWpm(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
      </label>

      <label style={label}>
        {t.chunk}: {state.chunkSize}
        <input type="range" min={1} max={MAX_CHUNK} step={1} value={state.chunkSize}
          onChange={e => setChunk(Number(e.target.value))} style={{ display: 'block', width: '100%' }} />
      </label>

      <label style={label}>
        {t.yourText}
        <textarea value={text} onChange={e => { setText(e.target.value); reset() }} rows={4}
          style={{ display: 'block', width: '100%', marginTop: '.3rem', fontFamily: 'inherit', fontSize: '.85rem',
            border: '1px solid var(--border-color)', borderRadius: 6, padding: '.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
      </label>
    </section>
  )
}
