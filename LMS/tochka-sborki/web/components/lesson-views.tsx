'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import type { OutlineNode } from '@/lib/lesson-views/extract'
import type { LessonViewsData } from '@/lib/lesson-views/load'
import { recordAnswer } from '@/lib/spaced-review'
import { COURSE } from '@/lib/course'
import {
  THINK_LOCKED, THINK_MIN, canOpen, filledThoughts, parseThink, readJson, thinkEdit, thinkKey, thinkSkip, thinkSubmit, writeJson,
  type ThinkState,
} from '@/lib/pedagogy/local'

// Представления урока из одного источника (intake LMS#8, спека 2026-09-28-lesson-views).
// «Текст» — сам урок (children), он не размонтируется: шаг мастера и ответы самопроверок живут дальше.
export const T = {
  ru: {
    label: 'Как читать урок',
    text: 'Текст', summary: 'Конспект', cards: 'Карточки', map: 'Карта',
    summaryNote: 'Ключевые фразы урока дословно. Полный текст — во вкладке «Текст».',
    paraNote: 'Пересказ ключевых фраз урока: его написала модель, а проверка убедилась, что в нём нет чисел, ссылок и названий, которых нет в уроке. Полный текст — во вкладке «Текст».',
    showVerbatim: 'Показать дословно', showParaphrase: 'Показать пересказ',
    card: (i: number, n: number) => `Карточка ${i} из ${n}`,
    show: 'Показать ответ', hide: 'Скрыть ответ', prev: 'Назад', next: 'Дальше',
    recallHint: 'Сначала вспомни ответ сам — потом открой.',
    recalled: 'Вспомнил', notRecalled: 'Не вспомнил', graded: 'Отмечено: вопрос вернётся в блоке «Вспомни», когда подойдёт срок.',
    mapNote: 'Разделы урока и их ключевые фразы. Узлы сворачиваются.',
    thinkTitle: 'Сначала своими словами',
    thinkLead: (n: number) => `Запиши ${n}–3 мысли по уроку: что запомнил, что здесь главное. Потом откроются «Конспект» и «Карта» — и ты сравнишь.`,
    thinkSlot: (i: number) => `Мысль ${i}`,
    thinkPlaceholder: ['Что я запомнил…', 'Что здесь главное…', 'Что пока непонятно (можно не писать)…'],
    thinkOpen: 'Открыть и сравнить',
    thinkNeed: (n: number, k: number) => `Ещё ${n - k} из ${n}: пара слов — уже мысль.`,
    thinkWhy: 'Почему стоит сначала самому: когда вспоминаешь и объясняешь своими словами, урок укладывается прочнее, чем при чтении готового конспекта. Минута своих слов окупается.',
    thinkSkip: 'Пропустить',
    mine: 'Мои мысли до конспекта',
    mineNote: 'Сравни: что совпало с ключевыми фразами, что ты упустил, что добавил от себя.',
  },
  en: {
    label: 'How to read this lesson',
    text: 'Text', summary: 'Summary', cards: 'Cards', map: 'Map',
    summaryNote: 'Key sentences of the lesson, verbatim. The full lesson is under “Text”.',
    paraNote: 'A retelling of the lesson’s key sentences: a model wrote it, and a check made sure it adds no numbers, links or names that are not in the lesson. The full lesson is under “Text”.',
    showVerbatim: 'Show verbatim', showParaphrase: 'Show the retelling',
    card: (i: number, n: number) => `Card ${i} of ${n}`,
    show: 'Show answer', hide: 'Hide answer', prev: 'Back', next: 'Next',
    recallHint: 'Recall the answer yourself first, then reveal it.',
    recalled: 'I remembered', notRecalled: 'I did not', graded: 'Noted: the question comes back in “Recall” when it is due.',
    mapNote: 'Lesson sections and their key sentences. Nodes collapse.',
    thinkTitle: 'Your own words first',
    thinkLead: (n: number) => `Write ${n}–3 thoughts about the lesson: what you remember, what matters most. Then “Summary” and “Map” open — and you compare.`,
    thinkSlot: (i: number) => `Thought ${i}`,
    thinkPlaceholder: ['What I remember…', 'What matters most here…', 'What is still unclear (optional)…'],
    thinkOpen: 'Open and compare',
    thinkNeed: (n: number, k: number) => `${n - k} more of ${n}: a few words already count.`,
    thinkWhy: 'Why yourself first: recalling and explaining in your own words makes the lesson stick better than reading a ready-made summary. A minute of your own words pays off.',
    thinkSkip: 'Skip',
    mine: 'My thoughts before the summary',
    mineNote: 'Compare: what matches the key sentences, what you missed, what you added yourself.',
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

const toggle = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer' } as const

/** Конспект: пересказ (если есть и прошёл гвард) или дословно — что сначала, решает pack (`summaryDefault`);
 *  переключатель — как у примера из интереса. */
export function Summary({ data, locale }: { data: LessonViewsData; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const [verbatim, setVerbatim] = useState(data.summaryDefault === 'verbatim')
  const para = data.paraphrased !== null && !verbatim
  const outline = para ? data.paraphrased! : data.outline
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <p style={{ ...note, flex: '1 1 20rem' }}>{para ? t.paraNote : t.summaryNote}</p>
        {data.paraphrased && (
          <button type="button" style={toggle} aria-pressed={verbatim} onClick={() => setVerbatim(v => !v)}>
            {verbatim ? t.showParaphrase : t.showVerbatim}
          </button>
        )}
      </div>
      <div aria-live="polite">{outline.map((n, i) => section(n, 0, i))}</div>
    </section>
  )
}

/** Карточки — режим вспоминания: вопрос, ответ скрыт до «Показать»; после — самооценка, которая кладёт
 *  вопрос в коробки интервального повтора (один раз на карточку за просмотр). */
export function Cards({ data, locale }: { data: LessonViewsData; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const [graded, setGraded] = useState<Record<string, boolean>>({})
  const answerId = useId()
  const card = data.cards[i]
  const go = (d: number) => { setI(x => Math.min(data.cards.length - 1, Math.max(0, x + d))); setOpen(false) }
  const grade = (remembered: boolean) => {
    if (graded[card.id]) return
    setGraded(g => ({ ...g, [card.id]: true }))
    recordAnswer(COURSE.progressKey, {
      module: card.module,
      item: { id: card.id, unit: card.unit, question: card.question, options: card.options, answer: card.correctIndex, explain: card.explain },
      correct: remembered, locale, now: Date.now(),
    })
  }
  return (
    <section style={box} aria-roledescription="carousel">
      <p style={{ ...note, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)' }} aria-live="polite">
        {t.card(i + 1, data.cards.length)}
      </p>
      <p style={{ margin: '0 0 1rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>{card.question}</p>
      {!open && <p style={note}>{t.recallHint}</p>}
      <button type="button" style={btn} aria-expanded={open} aria-controls={answerId} onClick={() => setOpen(o => !o)}>
        {open ? t.hide : t.show}
      </button>
      <div id={answerId} hidden={!open} style={{ marginTop: '1rem', lineHeight: 1.55 }}>
        <p style={{ margin: '0 0 0.5rem', color: 'var(--text-accent)', fontWeight: 600 }}>{card.answer}</p>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{card.explain}</p>
        {graded[card.id]
          ? <p style={{ ...note, margin: '0.75rem 0 0' }} aria-live="polite">{t.graded}</p>
          : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button type="button" style={btn} onClick={() => grade(true)}>{t.recalled}</button>
              <button type="button" style={btn} onClick={() => grade(false)}>{t.notRecalled}</button>
            </div>
          )}
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

/** «Сначала сам» (LMS#20, Педагогика 3; ICAP, self-explanation): 2–3 своих мысли — потом конспект.
 *  «Пропустить» есть всегда, но с пояснением, зачем сначала своими словами. */
export function ThinkFirstGate({ state, onChange, locale }: { state: ThinkState; onChange: (s: ThinkState) => void; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const base = useId()
  const k = filledThoughts(state.thoughts).length
  const ready = canOpen(state)
  return (
    <section style={box} aria-labelledby={`${base}-h`}>
      <h2 id={`${base}-h`} style={{ fontSize: '1.05rem', margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>{t.thinkTitle}</h2>
      <p style={note}>{t.thinkLead(THINK_MIN)}</p>
      {state.thoughts.map((v, i) => (
        <label key={i} style={{ display: 'block', margin: '0 0 0.6rem' }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{t.thinkSlot(i + 1)}</span>
          <textarea rows={2} value={v} placeholder={t.thinkPlaceholder[i] ?? ''} onChange={e => onChange(thinkEdit(state, i, e.target.value))}
            style={{ width: '100%', boxSizing: 'border-box', font: 'inherit', padding: '0.5rem 0.7rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', resize: 'vertical' }} />
        </label>
      ))}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', alignItems: 'center', marginTop: '0.5rem' }}>
        <button type="button" disabled={!ready} onClick={() => onChange(thinkSubmit(state))}
          style={{ ...btn, borderColor: 'var(--text-accent)', color: 'var(--text-accent)', opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'not-allowed' }}>
          {t.thinkOpen}
        </button>
        {!ready && <span aria-live="polite" style={{ ...note, margin: 0 }}>{t.thinkNeed(THINK_MIN, k)}</span>}
      </div>
      <p style={{ ...note, margin: '1.25rem 0 0.4rem' }}>{t.thinkWhy}</p>
      <button type="button" style={toggle} onClick={() => onChange(thinkSkip(state))}>{t.thinkSkip}</button>
    </section>
  )
}

function MyThoughts({ thoughts, locale }: { thoughts: string[]; locale: 'ru' | 'en' }) {
  const t = T[locale]
  return (
    <aside style={{ ...box, flex: '1 1 14rem', borderStyle: 'dashed' }} aria-label={t.mine}>
      <p style={{ ...note, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-accent)', margin: '0 0 0.5rem' }}>{t.mine}</p>
      <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {filledThoughts(thoughts).map((x, i) => <li key={i}>{x}</li>)}
      </ul>
      <p style={{ ...note, margin: 0 }}>{t.mineNote}</p>
    </aside>
  )
}

/** Содержимое вкладки с учётом «сначала сам»: закрыто — поле мыслей; открыто — вид и (если писал) свои мысли рядом. */
export function GatedView({ view, data, locale, think, onThink }: {
  view: Exclude<ViewKey, 'text'>; data: LessonViewsData; locale: 'ru' | 'en'; think: ThinkState; onThink: (s: ThinkState) => void
}) {
  const gated = data.thinkFirst === true && (view === 'summary' || view === 'map')
  if (gated && think.status === 'locked') return <ThinkFirstGate state={think} onChange={onThink} locale={locale} />
  const body = view === 'summary' ? <Summary data={data} locale={locale} />
    : view === 'cards' ? <Cards data={data} locale={locale} />
    : <MapView data={data} locale={locale} />
  if (!gated || think.status !== 'written') return body
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 1rem', alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 24rem', minWidth: 0 }}>{body}</div>
      <MyThoughts thoughts={think.thoughts} locale={locale} />
    </div>
  )
}

export function LessonViews({ data, locale, children }: { data: LessonViewsData | null; locale: 'ru' | 'en'; children: ReactNode }) {
  const [view, setView] = useState<ViewKey>('text')
  const [think, setThinkState] = useState<ThinkState>(THINK_LOCKED)
  const base = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const storage = data?.thinkFirst && data.unitKey ? thinkKey(COURSE.progressKey, data.unitKey) : null
  useEffect(() => { if (storage) setThinkState(parseThink(readJson(storage)) ?? THINK_LOCKED) }, [storage])
  const setThink = (s: ThinkState) => { setThinkState(s); if (storage) writeJson(storage, s) }
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
          <GatedView view={view} data={data} locale={locale} think={think} onThink={setThink} />
        </div>
      )}
    </>
  )
}
