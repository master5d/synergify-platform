'use client'
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { OutlineNode } from '@/lib/lesson-views/extract'
import type { LessonViewsData } from '@/lib/lesson-views/load'

// Представления урока из одного источника (intake LMS#8, спека 2026-09-28-lesson-views).
// «Текст» — сам урок (children), он не размонтируется: шаг мастера и ответы самопроверок живут дальше.
export const T = {
  ru: {
    label: 'Как читать урок',
    text: 'Текст', summary: 'Конспект', cards: 'Карточки', map: 'Карта',
    summaryNote: 'Ключевые фразы урока дословно. Полный текст — во вкладке «Текст».',
    card: (i: number, n: number) => `Карточка ${i} из ${n}`,
    show: 'Показать ответ', hide: 'Скрыть ответ', prev: 'Назад', next: 'Дальше',
    mapNote: 'Разделы урока и их ключевые фразы. Узлы сворачиваются.',
  },
  en: {
    label: 'How to read this lesson',
    text: 'Text', summary: 'Summary', cards: 'Cards', map: 'Map',
    summaryNote: 'Key sentences of the lesson, verbatim. The full lesson is under “Text”.',
    card: (i: number, n: number) => `Card ${i} of ${n}`,
    show: 'Show answer', hide: 'Hide answer', prev: 'Back', next: 'Next',
    mapNote: 'Lesson sections and their key sentences. Nodes collapse.',
  },
}

export type ViewKey = 'text' | 'summary' | 'cards' | 'map'

/** Какие вкладки показать: карточки — только если у юнита есть вопросы. */
export function availableViews(data: LessonViewsData): ViewKey[] {
  return data.cards.length > 0 ? ['text', 'summary', 'cards', 'map'] : ['text', 'summary', 'map']
}

const box = { margin: '1rem 0 2rem', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' } as const
const note = { margin: '0 0 1rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' } as const
const btn = { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' } as const

function Summary({ outline, locale }: { outline: OutlineNode[]; locale: 'ru' | 'en' }) {
  const section = (n: OutlineNode, depth: number, key: number): ReactNode => (
    <div key={key} style={{ marginTop: depth === 0 ? '1.25rem' : '0.75rem', paddingLeft: depth ? '1rem' : 0 }}>
      {n.heading && (depth === 0
        ? <h2 style={{ fontSize: '1.15rem', margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>{n.heading}</h2>
        : <h3 style={{ fontSize: '1rem', margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>{n.heading}</h3>)}
      {n.points.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {n.points.map((p, i) => <li key={i}>{p.text}</li>)}
        </ul>
      )}
      {n.children.map((c, i) => section(c, depth + 1, i))}
    </div>
  )
  return (
    <section style={box}>
      <p style={note}>{T[locale].summaryNote}</p>
      {outline.map((n, i) => section(n, 0, i))}
    </section>
  )
}

function Cards({ data, locale }: { data: LessonViewsData; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const answerId = useId()
  const card = data.cards[i]
  const go = (d: number) => { setI(x => Math.min(data.cards.length - 1, Math.max(0, x + d))); setOpen(false) }
  return (
    <section style={box} aria-roledescription="carousel">
      <p style={{ ...note, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }} aria-live="polite">
        {t.card(i + 1, data.cards.length)}
      </p>
      <p style={{ margin: '0 0 1rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>{card.question}</p>
      <button type="button" style={btn} aria-expanded={open} aria-controls={answerId} onClick={() => setOpen(o => !o)}>
        {open ? t.hide : t.show}
      </button>
      <div id={answerId} hidden={!open} style={{ marginTop: '1rem', lineHeight: 1.55 }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-accent)', fontWeight: 600 }}>{card.answer}</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{card.explain}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
        <button type="button" style={{ ...btn, opacity: i === 0 ? 0.5 : 1 }} disabled={i === 0} onClick={() => go(-1)}>{t.prev}</button>
        <button type="button" style={{ ...btn, opacity: i === data.cards.length - 1 ? 0.5 : 1 }} disabled={i === data.cards.length - 1} onClick={() => go(1)}>{t.next}</button>
      </div>
    </section>
  )
}

function MapView({ data, locale }: { data: LessonViewsData; locale: 'ru' | 'en' }) {
  const node = (n: OutlineNode, key: number): ReactNode => (
    <li key={key} style={{ margin: '0.35rem 0' }}>
      <details open>
        <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--text-primary)' }}>{n.heading || data.title}</summary>
        <ul style={{ listStyle: 'none', margin: '0.25rem 0 0 0.6rem', paddingLeft: '0.9rem', borderLeft: '1px solid var(--border-color)' }}>
          {n.points.map((p, i) => <li key={`p${i}`} style={{ margin: '0.3rem 0', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.text}</li>)}
          {n.children.map((c, i) => node(c, i))}
        </ul>
      </details>
    </li>
  )
  return (
    <section style={box}>
      <p style={note}>{T[locale].mapNote}</p>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 700, color: 'var(--text-accent)' }}>{data.title}</p>
      <ul style={{ listStyle: 'none', margin: 0, paddingLeft: '0.9rem', borderLeft: '2px solid var(--text-accent)' }}>
        {data.outline.map((n, i) => node(n, i))}
      </ul>
    </section>
  )
}

export function LessonViews({ data, locale, children }: { data: LessonViewsData | null; locale: 'ru' | 'en'; children: ReactNode }) {
  const [view, setView] = useState<ViewKey>('text')
  const base = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  if (!data) return <>{children}</>
  const t = T[locale]
  const views = availableViews(data)

  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const j = (i + d + views.length) % views.length
    setView(views[j])
    tabs.current[j]?.focus()
  }

  return (
    <>
      <div role="tablist" aria-label={t.label} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        {views.map((v, i) => {
          const on = v === view
          return (
            <button
              key={v}
              ref={el => { tabs.current[i] = el }}
              type="button"
              role="tab"
              id={`${base}-tab-${v}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${v}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setView(v)}
              onKeyDown={e => onKey(e, i)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.5rem 0.9rem', border: 'none', borderBottom: `2px solid ${on ? 'var(--text-accent)' : 'transparent'}`, background: 'transparent', color: on ? 'var(--text-accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: on ? 700 : 400 }}
            >
              {t[v]}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${base}-panel-text`} aria-labelledby={`${base}-tab-text`} hidden={view !== 'text'}>{children}</div>
      {view !== 'text' && (
        <div role="tabpanel" id={`${base}-panel-${view}`} aria-labelledby={`${base}-tab-${view}`}>
          {view === 'summary' && <Summary outline={data.outline} locale={locale} />}
          {view === 'cards' && <Cards data={data} locale={locale} />}
          {view === 'map' && <MapView data={data} locale={locale} />}
        </div>
      )}
    </>
  )
}
