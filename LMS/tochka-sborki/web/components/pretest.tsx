'use client'
import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react'
import type { PretestItem } from '@/lib/pedagogy/pretest'
import { parseGuesses, readJson, writeJson } from '@/lib/pedagogy/local'

// Pretest в активации (intake LMS#20, Педагогика 2). Догадка до объяснения; правильного ответа
// здесь нет вовсе — компонент получает вопрос без answer/explain. Ответ ученик видит в концепте,
// у той же самопроверки («Проверь себя»), а над ней — напоминание о своей догадке для сравнения.
export const T = {
  ru: {
    label: 'Угадай до объяснения',
    note: 'Ошибаться можно: это часть обучения. Догадка помогает потом лучше запомнить ответ, а сам ответ будет дальше, после объяснения.',
    fix: 'Зафиксировать догадку',
    fixed: (o: string) => `Догадка записана: «${o}». Сверишь её после объяснения — в блоке «Проверь себя».`,
    echo: (o: string) => `Этот вопрос был в начале урока — до объяснения ты выбрал «${o}». Ответь теперь и сравни: что изменилось?`,
  },
  en: {
    label: 'Guess before the explanation',
    note: 'Getting it wrong is fine: it is part of learning. Guessing first helps the answer stick later, and the answer itself comes after the explanation.',
    fix: 'Lock in my guess',
    fixed: (o: string) => `Guess saved: “${o}”. You will check it after the explanation — in the “Check yourself” block.`,
    echo: (o: string) => `This question opened the lesson — before the explanation you picked “${o}”. Answer it now and compare: what changed?`,
  },
}

interface Ctx { items: PretestItem[]; guesses: Record<string, number>; guess: (id: string, i: number) => void }
const PretestContext = createContext<Ctx>({ items: [], guesses: {}, guess: () => {} })

/** Держит догадки на весь урок: мастер размонтирует фазы, а догадка нужна в концепте. */
export function PretestProvider({ items, storageKey, initial, children }: { items: PretestItem[]; storageKey: string; initial?: Record<string, number>; children: ReactNode }) {
  const [guesses, setGuesses] = useState<Record<string, number>>(initial ?? {})
  useEffect(() => { if (!initial) setGuesses(parseGuesses(readJson(storageKey))) }, [storageKey, initial])
  const guess = (id: string, i: number) => setGuesses(g => {
    const next = { ...g, [id]: i }
    writeJson(storageKey, next)
    return next
  })
  return <PretestContext.Provider value={{ items, guesses, guess }}>{children}</PretestContext.Provider>
}

const box = { margin: '2rem 0', padding: '1.25rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' } as const
const kicker = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' } as const

function PretestQuestion({ item, locale }: { item: PretestItem; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const name = useId()
  const { guesses, guess } = useContext(PretestContext)
  const saved = guesses[item.id]
  const [picked, setPicked] = useState<number | null>(null)
  if (saved !== undefined && item.options[saved] !== undefined) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <p style={{ margin: '0 0 0.4rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{item.question}</p>
        <p aria-live="polite" style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{t.fixed(item.options[saved])}</p>
      </div>
    )
  }
  return (
    <fieldset style={{ border: 'none', margin: '1rem 0 0', padding: 0 }}>
      <legend style={{ padding: 0, marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{item.question}</legend>
      {item.options.map((o, i) => (
        <label key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', padding: '0.3rem 0', cursor: 'pointer', color: 'var(--text-primary)' }}>
          <input type="radio" name={name} value={i} checked={picked === i} onChange={() => setPicked(i)} />
          <span>{o}</span>
        </label>
      ))}
      <button type="button" disabled={picked === null} onClick={() => picked !== null && guess(item.id, picked)}
        style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', cursor: picked === null ? 'not-allowed' : 'pointer', border: '1px solid var(--text-accent)', background: 'transparent', color: 'var(--text-accent)', opacity: picked === null ? 0.5 : 1 }}>
        {t.fix}
      </button>
    </fieldset>
  )
}

/** Блок в конце фазы activation: вопросы pretest без ответа. */
export function Pretest({ locale }: { locale: 'ru' | 'en' }) {
  const { items } = useContext(PretestContext)
  if (items.length === 0) return null
  const t = T[locale]
  return (
    <section style={box} aria-label={t.label}>
      <span style={kicker}>{t.label}</span>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{t.note}</p>
      {items.map(item => <PretestQuestion key={item.id} item={item} locale={locale} />)}
    </section>
  )
}

/** Над самопроверкой в концепте: «до объяснения ты выбрал …». Без догадки — ничего. */
export function PretestEcho({ id, locale }: { id: string; locale: 'ru' | 'en' }) {
  const { items, guesses } = useContext(PretestContext)
  const item = items.find(x => x.id === id)
  const g = guesses[id]
  if (!item || g === undefined || item.options[g] === undefined) return null
  return <p style={{ margin: '2rem 0 -1.25rem', color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{T[locale].echo(item.options[g])}</p>
}
