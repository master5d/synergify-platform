'use client'
import { useEffect, useRef, useState } from 'react'
import type { Answers, Locale } from '@/lib/intake/types'
import {
  ROLE_ANSWER_KEY, TASK_ROUTE_ANSWER_KEY, TASK_TEXT_ANSWER_KEY,
  decodeTaskRouteAnswer, encodeTaskRouteAnswer, findRoute, normalizeTaskText, resolveClarify, routesForRole,
  type RouteSource,
} from '@/lib/intake/task-route'
import {
  TASK_ROUTES, TASK_ROUTE_CLARIFY, buildTaskRouteContent, requestTaskRoute,
} from '@/lib/intake/task-route-content'
import { TaskRouteView } from './task-route-view'

// Шаг «Русло задачи» (module V, после V_OUTCOME, только при V_TASK_MODE = task).
// Текст задачи → воркер → llm-service сопоставляет с ЗАКРЫТЫМ каталогом русел роли:
//   matched     → русло выбрано (source llm);
//   unsure      → три уточняющих вопроса с готовыми вариантами → resolveClarify (детерминированно);
//   unavailable → ручной выбор из списка (деградация без LLM / при ошибке).
// «Выбрать самому» доступно всегда. Ответ — string[] [ключ, источник, снимок текста] тем же setAnswer,
// что у остальных шагов; тот же текст при возврате на шаг модель не переспрашивает.

type Phase =
  | { kind: 'idle' }
  | { kind: 'matching' }
  | { kind: 'clarify'; candidates: string[] }
  | { kind: 'manual'; lead: 'manual' | 'unavailable' | 'tie'; leaders: string[] }

export function TaskRouteCard({ locale, answers, onChange, moduleTitles }: {
  locale: Locale
  answers: Answers
  onChange: (v: string[]) => void
  moduleTitles?: Record<string, string>
}) {
  const c = buildTaskRouteContent(locale)
  const role = answers[ROLE_ANSWER_KEY]
  const text = normalizeTaskText(answers[TASK_TEXT_ANSWER_KEY])
  const outcome = typeof answers[TASK_TEXT_ANSWER_KEY] === 'string' ? (answers[TASK_TEXT_ANSWER_KEY] as string) : null
  const stored = decodeTaskRouteAnswer(answers[TASK_ROUTE_ANSWER_KEY], TASK_ROUTES)
  // Выбор сделан по этому же тексту (или вручную) — показываем его, модель не зовём.
  const current = stored && (stored.source === 'manual' || stored.text === (text ?? '')) ? findRoute(stored.key, TASK_ROUTES) : null

  const roleCatalog = routesForRole(role, TASK_ROUTES)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [showAll, setShowAll] = useState(false)
  const [editing, setEditing] = useState(false)
  const asked = useRef(false)

  function commit(key: string, source: RouteSource) {
    onChange(encodeTaskRouteAnswer({ key, source, text: text ?? '' }))
    setEditing(false)
    setPhase({ kind: 'idle' })
  }

  async function match() {
    if (!text) { setPhase({ kind: 'manual', lead: 'manual', leaders: [] }); return }
    setPhase({ kind: 'matching' })
    const r = await requestTaskRoute(text, role)
    if (r.status === 'matched') commit(r.route, 'llm')
    else if (r.status === 'unsure') { setPicks({}); setPhase({ kind: 'clarify', candidates: r.candidates }) }
    else setPhase({ kind: 'manual', lead: 'unavailable', leaders: [] })
  }

  // Первый заход с текстом и без выбора — подбираем сразу, без лишнего клика.
  useEffect(() => {
    if (asked.current || current || !text) return
    asked.current = true
    void match()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyClarify(candidates: string[]) {
    const r = resolveClarify(picks, candidates, roleCatalog, TASK_ROUTE_CLARIFY)
    if (r.route) commit(r.route, 'clarify')
    else setPhase({ kind: 'manual', lead: 'tie', leaders: r.leaders })
  }

  const box = { border: '1px solid var(--border-color)', borderRadius: 12, padding: '1.25rem 1.4rem', background: 'var(--bg-surface)' }
  const eyebrow = (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem',
    }}>{c.eyebrow}</div>
  )
  const muted = { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }

  if (current && !editing && phase.kind === 'idle') {
    return (
      <div style={box}>
        {eyebrow}
        {text && <p style={{ ...muted, marginBottom: '0.9rem' }}>{c.yourTask} «{text}»</p>}
        <p style={{ ...muted, marginBottom: '0.5rem' }}>{c.matchedLead}</p>
        <TaskRouteView route={current} locale={locale} outcome={outcome} moduleTitles={moduleTitles} newTab />
        <button type="button" className="intake-nav-btn" style={{ marginTop: '1rem' }}
          onClick={() => { setEditing(true); setShowAll(false); setPhase({ kind: 'manual', lead: 'manual', leaders: [] }) }}>
          {c.changeButton}
        </button>
      </div>
    )
  }

  return (
    <div style={box}>
      {eyebrow}
      <p style={{ ...muted, marginBottom: '1rem' }}>{c.lead}</p>
      <p style={{ ...muted, marginBottom: '1rem' }}>{text ? `${c.yourTask} «${text}»` : c.noText}</p>

      {phase.kind === 'idle' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="intake-nav-btn primary" disabled={!text} onClick={() => void match()}>{c.matchButton}</button>
          <button type="button" className="intake-nav-btn" onClick={() => setPhase({ kind: 'manual', lead: 'manual', leaders: [] })}>{c.manualButton}</button>
        </div>
      )}

      {phase.kind === 'matching' && <p aria-live="polite" style={muted}>{c.matching}</p>}

      {phase.kind === 'clarify' && (
        <div>
          <p style={{ ...muted, marginBottom: '0.9rem' }}>{c.unsureLead}</p>
          {TASK_ROUTE_CLARIFY.map(q => (
            <fieldset key={q.id} style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
              <legend style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>{q.prompt[locale]}</legend>
              {q.options.map(o => {
                const on = picks[q.id] === o.value
                return (
                  <button key={o.value} type="button" className={`intake-option${on ? ' is-on' : ''}`} aria-pressed={on}
                    onClick={() => setPicks(p => ({ ...p, [q.id]: o.value }))}>
                    {o.label[locale]}
                  </button>
                )
              })}
            </fieldset>
          ))}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="intake-nav-btn primary" disabled={Object.keys(picks).length === 0}
              onClick={() => applyClarify(phase.candidates)}>{c.clarifyButton}</button>
            <button type="button" className="intake-nav-btn" onClick={() => setPhase({ kind: 'manual', lead: 'manual', leaders: phase.candidates })}>{c.manualButton}</button>
          </div>
        </div>
      )}

      {phase.kind === 'manual' && (
        <div>
          <p style={{ ...muted, marginBottom: '0.8rem' }}>
            {phase.lead === 'unavailable' ? c.unavailableLead : phase.lead === 'tie' ? c.clarifyTie : c.manualLead}
          </p>
          {(showAll ? TASK_ROUTES : roleCatalog).map(r => {
            const leader = phase.leaders.includes(r.key)
            return (
              <button key={r.key} type="button" className={`intake-option${leader ? ' is-on' : ''}`} onClick={() => commit(r.key, 'manual')}>
                <span style={{ display: 'block' }}>{r.title[locale]}{leader ? ` · ${c.leaderHint}` : ''}</span>
                <span style={{ display: 'block', fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>{r.summary[locale]}</span>
              </button>
            )
          })}
          {!showAll && roleCatalog.length < TASK_ROUTES.length && (
            <button type="button" className="intake-nav-btn" onClick={() => setShowAll(true)}>{c.showAll}</button>
          )}
        </div>
      )}
    </div>
  )
}
