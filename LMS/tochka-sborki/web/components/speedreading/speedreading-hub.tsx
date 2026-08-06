'use client'

import { useState, useEffect } from 'react'
import type { Locale } from '@/lib/dictionaries'
import { readRsvp } from '@/lib/speedreading/rsvp-store'
import { readSchulte } from '@/lib/speedreading/schulte-store'
import { readWpmTest } from '@/lib/speedreading/wpm-test-store'
import { readWallet, writeWallet } from '@/lib/cs/wallet'
import {
  MILESTONES, earnedMilestoneKeys, grantMilestoneCredits, summarizeProgress, type ProgressSummary,
} from '@/lib/speedreading/progress'

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
    trainers: 'Тренажёры', progress: 'Твой прогресс',
    empty: 'Пройди любой тренажёр — здесь появится прогресс.',
    rsvp: 'Ритм', schulte: 'Периферийка', wpm: 'Скорость',
    sessions: 'сессий', last: 'последняя', tests: 'тестов', best: 'лучшее',
    wpmU: 'сл/мин', sec: 'с', sizes: 'размеры', effective: 'эффективная', vsFirst: 'к первому',
    shards: 'осколков за тренировки',
  },
  en: {
    trainers: 'Trainers', progress: 'Your progress',
    empty: 'Try any trainer — your progress will show up here.',
    rsvp: 'Rhythm', schulte: 'Side vision', wpm: 'Speed',
    sessions: 'sessions', last: 'last', tests: 'tests', best: 'best',
    wpmU: 'wpm', sec: 's', sizes: 'sizes', effective: 'effective', vsFirst: 'vs first',
    shards: 'shards from training',
  },
}

const card: React.CSSProperties = {
  border: '1px solid var(--border-color)', borderRadius: 10, padding: '1rem',
  background: 'var(--bg-surface)', color: 'var(--text-primary)', textDecoration: 'none', display: 'block',
}

export function SpeedreadingHub({ locale }: { locale: Locale }) {
  const t = T[locale]
  const prefix = locale === 'en' ? '/en' : ''
  const [summary, setSummary] = useState<ProgressSummary | null>(null)
  const [shards, setShards] = useState(0)

  useEffect(() => {
    const rsvp = readRsvp(), schulte = readSchulte(), wpm = readWpmTest()
    const wallet = readWallet()
    const next = grantMilestoneCredits(wallet, rsvp, schulte, wpm)
    if (next.balance !== wallet.balance) writeWallet(next)
    setSummary(summarizeProgress(rsvp, schulte, wpm))
    const earned = new Set(earnedMilestoneKeys(rsvp, schulte, wpm))
    setShards(MILESTONES.filter(m => earned.has(m.key)).reduce((n, m) => n + m.cs, 0))
  }, [])

  const s = summary
  const has = s !== null && (s.rsvpSessions > 0 || s.schulteBestMs !== null || s.wpmCount > 0)

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={{ fontSize: '1.1rem', margin: '0 0 .9rem', color: 'var(--text-primary)' }}>{t.trainers}</h2>
      <div style={{ display: 'grid', gap: '.6rem', marginBottom: '2rem' }}>
        {TRAINERS[locale].map(tr => (
          <a key={tr.slug} href={`${prefix}/speedreading/${tr.slug}`} style={card}>
            <span style={{ fontWeight: 600 }}>{tr.name}</span>
            <span style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginTop: '.2rem' }}>{tr.desc}</span>
          </a>
        ))}
      </div>

      <h2 style={{ fontSize: '1.1rem', margin: '0 0 .9rem', color: 'var(--text-primary)' }}>{t.progress}</h2>
      {!has ? (
        <p style={{ fontSize: '.9rem', color: 'var(--text-secondary)' }}>{t.empty}</p>
      ) : (
        <div style={{ display: 'grid', gap: '.5rem', fontSize: '.9rem', color: 'var(--text-secondary)' }}>
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
          {shards > 0 && (
            <div style={{ fontSize: '.82rem', color: 'var(--text-accent)', marginTop: '.3rem' }}>+{shards} {t.shards}</div>
          )}
        </div>
      )}
    </section>
  )
}
