'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { generateGrid, MIN_SIZE, MAX_SIZE } from '@/lib/speedreading/schulte'
import { useSchulte } from '@/lib/speedreading/use-schulte'

const T = {
  ru: { find: 'Найди', start: 'Старт', newTable: 'Новая таблица', reset: 'Сброс', errors: 'Ошибки', best: 'Лучшее', done: 'Готово', size: 'Размер', sec: 'с' },
  en: { find: 'Find', start: 'Start', newTable: 'New table', reset: 'Reset', errors: 'Errors', best: 'Best', done: 'Done', size: 'Size', sec: 's' },
}

const btn: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 6, padding: '.4rem .9rem',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '.9rem',
}

export function SchulteTable({ locale }: { locale: Locale }) {
  const t = T[locale]
  const { state, ready, setSize, recordResult } = useSchulte()
  const [seed, setSeed] = useState(1)
  const [running, setRunning] = useState(false)
  const [target, setTarget] = useState(1)
  const [errors, setErrors] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const startAt = useRef(0)
  const tick = useRef<ReturnType<typeof setInterval> | null>(null)

  const size = state.size
  const grid = useMemo(() => generateGrid(seed, size), [seed, size])
  const total = size * size
  const best = state.best[size]

  const stopTick = () => { if (tick.current) { clearInterval(tick.current); tick.current = null } }
  useEffect(() => stopTick, [])

  const start = () => {
    setRunning(true); setTarget(1); setErrors(0); setElapsed(0)
    startAt.current = Date.now()
    stopTick()
    tick.current = setInterval(() => setElapsed(Date.now() - startAt.current), 100)
  }
  const reset = () => { setRunning(false); setTarget(1); setErrors(0); setElapsed(0); stopTick() }
  const newTable = () => { reset(); setSeed(s => s + 1) }

  const click = (v: number) => {
    if (!running) return
    if (v === target) {
      if (target >= total) {
        stopTick()
        const ms = Date.now() - startAt.current
        setElapsed(ms)
        setRunning(false)
        recordResult(size, ms, errors)
        setTarget(target + 1)
      } else {
        setTarget(target + 1)
      }
    } else {
      setErrors(e => e + 1)
    }
  }

  const finished = ready && !running && target > total
  const seconds = (elapsed / 1000).toFixed(1)

  return (
    <section style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: '1.25rem', background: 'var(--bg-surface)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '.75rem', fontSize: '.9rem', color: 'var(--text-secondary)' }}>
        <span>
          {running
            ? <b style={{ color: 'var(--text-primary)' }}>{t.find}: {target}</b>
            : finished
              ? <b style={{ color: 'var(--text-primary)' }}>{t.done} — {seconds} {t.sec}</b>
              : <button style={btn} onClick={start}>{t.start}</button>}
        </span>
        <span>{seconds} {t.sec}{best !== undefined ? ` · ${t.best} ${(best / 1000).toFixed(1)} ${t.sec}` : ''} · {t.errors}: {errors}</span>
      </div>

      {/* grid with center fixation dot */}
      <div style={{ position: 'relative', margin: '0 auto', width: 'fit-content' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, gap: 4 }}>
          {grid.map((v) => {
            const done = v < target
            return (
              <button key={v} onClick={() => click(v)} disabled={!running || done}
                style={{
                  width: '3rem', height: '3rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem',
                  border: '1px solid var(--border-color)', borderRadius: 6, cursor: running && !done ? 'pointer' : 'default',
                  background: done ? 'var(--bg-primary)' : 'var(--bg-surface)',
                  color: done ? 'var(--text-secondary)' : 'var(--text-primary)', opacity: done ? 0.4 : 1,
                }}>
                {v}
              </button>
            )
          })}
        </div>
        <span aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 8, height: 8, borderRadius: '50%', background: 'var(--text-accent)', pointerEvents: 'none' }} />
      </div>

      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button style={btn} onClick={newTable}>{t.newTable}</button>
        <button style={btn} onClick={reset}>{t.reset}</button>
        <label style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>
          {t.size}:{' '}
          <select value={size} onChange={e => { setSize(Number(e.target.value)); reset() }}
            style={{ border: '1px solid var(--border-color)', borderRadius: 6, padding: '.2rem .4rem', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
            {Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, i) => MIN_SIZE + i).map(n => (
              <option key={n} value={n}>{n}×{n}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
