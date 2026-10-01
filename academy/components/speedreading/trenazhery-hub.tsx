'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '../../lib/dictionaries'
import { readRsvp } from '../../lib/speedreading/rsvp-store'
import { readSchulte } from '../../lib/speedreading/schulte-store'
import { readWpmTest } from '../../lib/speedreading/wpm-test-store'
import { summarizeProgress, type ProgressSummary } from '../../lib/speedreading/progress'
import { isEideticsLive } from '../../lib/eidetics/course'
import { EIDETICS_UI } from '../../lib/eidetics/ui'

// Перенесён из LMS (SpeedreadingHub). Мост к кошельку Cognitive Shards отрезан:
// в академии кошелька нет, прогресс живёт только в localStorage.

const TRAINERS = {
  ru: [
    { slug: 'rsvp', name: 'RSVP-читалка', desc: 'Слова вспышками с регулируемой скоростью' },
    { slug: 'schulte', name: 'Таблицы Шульте', desc: 'Числа по порядку, боковым зрением' },
    { slug: 'test', name: 'Тест скорости', desc: 'Замер с поправкой на понимание' },
  ],
  en: [
    { slug: 'rsvp', name: 'RSVP reader', desc: 'Words flashed at an adjustable pace' },
    { slug: 'schulte', name: 'Schulte tables', desc: 'Numbers in order, with side vision' },
    { slug: 'test', name: 'Reading-speed test', desc: 'Measured, adjusted for comprehension' },
  ],
}

const T = {
  ru: {
    trainers: 'тренажёры', memory: 'память', progress: 'твой прогресс',
    empty: 'Пройди любой тренажёр — здесь появится прогресс.',
    rsvp: 'Ритм', schulte: 'Периферийка', wpm: 'Скорость',
    sessions: 'сессий', last: 'последняя', best: 'лучшее',
    wpmU: 'сл/мин', sec: 'с', sizes: 'размеры', effective: 'эффективная', vsFirst: 'к первому',
  },
  en: {
    trainers: 'trainers', memory: 'memory', progress: 'your progress',
    empty: 'Try any trainer — your progress will show up here.',
    rsvp: 'Rhythm', schulte: 'Side vision', wpm: 'Speed',
    sessions: 'sessions', last: 'last', best: 'best',
    wpmU: 'wpm', sec: 's', sizes: 'sizes', effective: 'effective', vsFirst: 'vs first',
  },
}

const label: React.CSSProperties = {
  fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)', textTransform: 'lowercase',
  letterSpacing: '0.12em', fontSize: 'var(--text-xs)', margin: '0 0 1.25rem',
}

const card: React.CSSProperties = {
  border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem',
  background: 'var(--bg-surface)', display: 'block', textDecoration: 'none',
}
const cardDesc: React.CSSProperties = {
  display: 'block', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem', lineHeight: 1.5,
}

export function TrenazheryHub({ locale }: { locale: Locale }) {
  const t = T[locale]
  const eid = EIDETICS_UI[locale].hubCard
  const prefix = locale === 'en' ? '/en' : ''
  const [summary, setSummary] = useState<ProgressSummary | null>(null)

  useEffect(() => {
    setSummary(summarizeProgress(readRsvp(), readSchulte(), readWpmTest()))
  }, [])

  const s = summary
  const has = s !== null && (s.rsvpSessions > 0 || s.schulteBestMs !== null || s.wpmCount > 0)

  return (
    <section style={{ marginTop: '3.5rem' }}>
      <h2 style={label}>{t.trainers}</h2>
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '3rem' }}>
        {TRAINERS[locale].map(tr => (
          <a
            key={tr.slug}
            href={`${prefix}/trenazhery/${tr.slug}/`}
            style={{ border: '1px solid var(--accent-line)', borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem', background: 'var(--bg-surface)', display: 'block', textDecoration: 'none' }}
          >
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tr.name}</span>
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginTop: '0.25rem', lineHeight: 1.5 }}>{tr.desc}</span>
          </a>
        ))}
      </div>

      {/* Модуль «Эйдетика»: пока status 'soon' — карточка без ссылки (не объявлен до вычитки владельцем). */}
      <h2 style={label}>{t.memory}</h2>
      <div style={{ marginBottom: '3rem' }}>
        {isEideticsLive() ? (
          <a href={`${prefix}/trenazhery/eidetika/`} style={card}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{eid.name}</span>
            <span style={cardDesc}>{eid.desc}</span>
          </a>
        ) : (
          <div style={{ ...card, borderColor: 'var(--border-soft)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{eid.name}</span>
            <span style={{ marginLeft: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'lowercase', letterSpacing: '0.08em', color: 'var(--accent-ink)' }}>
              {EIDETICS_UI[locale].badge}
            </span>
            <span style={cardDesc}>{eid.desc}</span>
          </div>
        )}
      </div>

      <h2 style={label}>{t.progress}</h2>
      {!has ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>{t.empty}</p>
      ) : (
        <div style={{ display: 'grid', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {s!.rsvpSessions > 0 && (
            <div><b style={{ color: 'var(--text-primary)' }}>{t.rsvp}</b>: {s!.rsvpSessions} {t.sessions}{s!.rsvpLastWpm !== null ? ` · ${t.last} ${s!.rsvpLastWpm} ${t.wpmU}` : ''}</div>
          )}
          {s!.schulteBestMs !== null && (
            <div><b style={{ color: 'var(--text-primary)' }}>{t.schulte}</b>: {t.best} {(s!.schulteBestMs / 1000).toFixed(1)} {t.sec} · {t.sizes} {s!.schulteSizes.join(', ')}</div>
          )}
          {s!.wpmCount > 0 && (
            <div>
              <b style={{ color: 'var(--text-primary)' }}>{t.wpm}</b>: {t.effective} {s!.wpmLatestEff} {t.wpmU}
              {s!.wpmDelta !== null && s!.wpmCount > 1 ? ` · ${s!.wpmDelta >= 0 ? '+' : ''}${s!.wpmDelta} ${t.vsFirst}` : ''}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
