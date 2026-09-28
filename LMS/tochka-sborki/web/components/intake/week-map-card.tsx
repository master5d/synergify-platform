'use client'
import { useState, type CSSProperties } from 'react'
import type { AnswerValue, Locale } from '@/lib/intake/types'
import {
  WEEK_BUCKETS, WEEK_MAP_MAX_TASKS, WEEK_MAP_MAX_TASK_CHARS,
  addTask, buildWeekRoute, decodeWeekMap, encodeWeekMap, removeTask, setTaskBucket,
  type WeekTask,
} from '@/lib/intake/week-map'
import { buildWeekMapContent } from '@/lib/intake/week-map-content'
import { pagePath } from '@/lib/base-path'

// Шаг «Карта недели» (module V, следующим после вердикта по одной задаче V_AUTO_VERDICT).
// Ученик выписывает 3–7 повторяющихся дел, раскладывает по корзинам — и видит личный маршрут:
// дело → корзина → модуль курса. Персистится тем же путём, что остальные ответы анкеты —
// onChange(string[]) = тот же setAnswer, что у <QuestionRenderer>.
// Ссылки на модули открываются в новой вкладке: анкета сохраняет ответы только при переходе
// между шагами, и уход со страницы посреди шага потерял бы введённое.
export function WeekMapCard({ locale, value, onChange, moduleTitles }: {
  locale: Locale
  value: AnswerValue | undefined
  onChange: (v: string[]) => void
  /** слаг модуля → название в текущей локали (с сервера, из _meta.json); нет — показываем слаг. */
  moduleTitles?: Record<string, string>
}) {
  const c = buildWeekMapContent(locale)
  const [tasks, setTasks] = useState<WeekTask[]>(() => decodeWeekMap(value))
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  function commit(next: WeekTask[]) {
    setTasks(next)
    onChange(encodeWeekMap(next))
  }

  function add() {
    const r = addTask(tasks, draft)
    if (r.rejected) {
      setNotice(r.rejected === 'limit' ? c.limitReached : r.rejected === 'duplicate' ? c.rejectedDuplicate : c.rejectedEmpty)
      return
    }
    commit(r.tasks)
    setDraft('')
    setNotice(null)
  }

  const route = buildWeekRoute(tasks, c.moduleByKind)
  const atLimit = tasks.length >= WEEK_MAP_MAX_TASKS
  const prefix = locale === 'en' ? '/en' : ''
  const statusText =
    route.status === 'empty' ? c.empty
      : route.status === 'too_few' ? c.tooFew
        : route.status === 'unsorted' ? c.unsortedHint
          : null

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem 1.4rem', background: 'var(--bg-surface)' }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem',
      }}>
        {c.eyebrow}
      </div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '1.1rem' }}>{c.lead}</p>

      <form
        onSubmit={e => { e.preventDefault(); add() }}
        style={{ display: 'flex', gap: 8, alignItems: 'stretch', marginBottom: '0.5rem' }}
      >
        <label htmlFor="week-map-task" style={visuallyHidden}>{c.inputLabel}</label>
        <input
          id="week-map-task"
          className="intake-field"
          value={draft}
          maxLength={WEEK_MAP_MAX_TASK_CHARS}
          disabled={atLimit}
          placeholder={c.placeholder}
          onChange={e => setDraft(e.target.value)}
        />
        <button type="submit" className="intake-nav-btn" disabled={atLimit}>{c.addButton}</button>
      </form>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {c.countHint(tasks.length)}
      </div>
      <p aria-live="polite" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: notice || atLimit ? '1rem' : 0 }}>
        {notice ?? (atLimit ? c.limitReached : '')}
      </p>

      {tasks.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem' }}>
          {tasks.map((t, i) => (
            <li key={t.text} style={{ borderTop: '1px solid var(--border-color)', padding: '0.8rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: '0.55rem' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.4 }}>{t.text}</span>
                <button
                  type="button"
                  onClick={() => { commit(removeTask(tasks, i)); setNotice(null) }}
                  aria-label={`${c.removeLabel}: ${t.text}`}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {c.removeLabel}
                </button>
              </div>
              <div role="group" aria-label={t.text} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {WEEK_BUCKETS.map(b => (
                  <button
                    key={b}
                    type="button"
                    className={`intake-likert${t.bucket === b ? ' is-on' : ''}`}
                    aria-pressed={t.bucket === b}
                    title={c.buckets[b].hint}
                    onClick={() => commit(setTaskBucket(tasks, i, b))}
                    style={{ fontSize: 14, minHeight: 44, padding: '0 10px' }}
                  >
                    {c.buckets[b].label}
                  </button>
                ))}
              </div>
              {t.bucket && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginTop: '0.45rem' }}>
                  {c.buckets[t.bucket].hint}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {statusText && (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{statusText}</p>
      )}

      {route.status === 'ready' && (
        <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.9rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>{c.routeHeading}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.9rem' }}>{c.routeLead}</p>
          {WEEK_BUCKETS.filter(b => route.counts[b] > 0).map(b => (
            <div key={b} style={{ marginBottom: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem',
              }}>
                {c.buckets[b].label} · {route.counts[b]}
              </div>
              <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {route.items.filter(it => it.bucket === b).map(it => (
                  <li key={it.text} style={{ marginBottom: '0.45rem', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{it.text}</span>
                    <br />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.buckets[b].moduleLead} </span>
                    <a
                      href={pagePath(`${prefix}/lessons/${it.moduleSlug}/`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-accent)' }}
                    >
                      {moduleTitles?.[it.moduleSlug] ?? it.moduleSlug}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}

const visuallyHidden: CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
}
