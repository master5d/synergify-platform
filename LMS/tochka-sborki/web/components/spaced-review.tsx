'use client'
import { useEffect, useId, useRef, useState } from 'react'
import { isCorrect, optionNote } from '@/lib/self-check'
import {
  DAY_MS, pickDue, readStore, recordAnswer,
  type DueCard, type Locale, type ReviewEvent,
} from '@/lib/spaced-review'
import { parseProgress, STORAGE_KEY as UNIT_PROGRESS_KEY } from '@/lib/unit-progress'
import { useProgress } from '@/components/progress-provider'
import { COURSE } from '@/lib/course'

// Блок «Вспомни» в начале юнита (BACKLOG «Педагогика 1», пилот интервального повтора).
// 2–3 самопроверки из ПРОЙДЕННЫХ юнитов, у которых подошёл срок по коробкам Лейтнера (lib/spaced-review.ts).
// Нечего повторять — блока нет вовсе. На сервере не рендерится: всё знание — в localStorage ученика.

export const T = {
  ru: {
    label: 'Вспомни',
    intro: 'Вопросы из пройденных уроков. Вспомнить через паузу — надёжнее, чем перечитать.',
    check: 'Проверить', right: 'Верно', wrong: 'Не совсем',
    next: (days: number) => `Этот вопрос вернётся через ${days} ${ruDays(days)}.`,
  },
  en: {
    label: 'Recall',
    intro: 'Questions from lessons you have finished. Recalling after a pause sticks better than re-reading.',
    check: 'Check', right: 'Correct', wrong: 'Not quite',
    next: (days: number) => `This question comes back in ${days} ${days === 1 ? 'day' : 'days'}.`,
  },
}

export function ruDays(n: number): string {
  const d10 = n % 10, d100 = n % 100
  if (d10 === 1 && d100 !== 11) return 'день'
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return 'дня'
  return 'дней'
}

function sendPlausible(name: 'spaced_review_shown' | 'spaced_review_answered', props: Record<string, string | number | boolean>) {
  // @ts-expect-error analytics global is optional
  if (typeof window !== 'undefined') window.plausible?.(name, { props })
}

const box = { margin: '0 0 2rem', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' } as const
const kicker = { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' } as const

/** Один вопрос повтора: как «Проверь себя», но ответ двигает карточку по коробкам. */
export function ReviewItem({ card, locale, onAnswered }: { card: DueCard; locale: Locale; onAnswered?: (e: ReviewEvent) => void }) {
  const t = T[locale]
  const s = card.snapshot
  const name = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const [nextDays, setNextDays] = useState<number | null>(null)
  const done = useRef(false)
  const correct = isCorrect(s, picked)

  const submit = () => {
    if (picked === null) return
    setShown(true)
    if (done.current) return
    done.current = true
    const now = Date.now()
    const rec = recordAnswer(COURSE.progressKey, {
      module: card.record.module,
      item: { id: card.record.id, unit: card.record.unit, ...s },
      correct, locale, now,
    })
    if (rec) setNextDays(Math.round((rec.due - now) / DAY_MS))
    onAnswered?.({ module: card.record.module, unit: card.record.unit, correct, box: rec?.box ?? 0 })
  }

  return (
    <fieldset style={{ border: 'none', margin: '1rem 0 0', padding: 0 }}>
      <legend style={{ padding: 0, marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{s.question}</legend>
      {s.options.map((o, i) => {
        const note = optionNote(i, s, picked, shown, locale)
        return (
          <label key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', padding: '0.3rem 0', cursor: 'pointer', color: shown && i === s.answer ? 'var(--text-accent)' : 'var(--text-primary)' }}>
            <input type="radio" name={name} value={i} checked={picked === i} disabled={shown} onChange={() => setPicked(i)} />
            <span>{o}{note && <em style={{ fontStyle: 'normal', color: 'var(--text-secondary)' }}> {note}</em>}</span>
          </label>
        )
      })}
      {!shown && (
        <button type="button" onClick={submit} disabled={picked === null} style={{ marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.45rem 0.9rem', borderRadius: 'var(--radius)', cursor: picked === null ? 'not-allowed' : 'pointer', border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)', opacity: picked === null ? 0.5 : 1 }}>
          {t.check}
        </button>
      )}
      <div aria-live="polite" style={{ marginTop: '0.5rem' }}>
        {shown && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{correct ? t.right : t.wrong}.</strong> {s.explain}
            {nextDays !== null && <> {t.next(nextDays)}</>}
          </p>
        )}
      </div>
    </fieldset>
  )
}

/** Презентационная часть: список уже выбран. Пусто — ничего. */
export function ReviewList({ cards, locale, onAnswered }: { cards: DueCard[]; locale: Locale; onAnswered?: (e: ReviewEvent) => void }) {
  if (cards.length === 0) return null
  const t = T[locale]
  return (
    <section aria-label={t.label} style={box}>
      <span style={kicker}>{t.label}</span>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{t.intro}</p>
      {cards.map(c => <ReviewItem key={c.key} card={c} locale={locale} onAnswered={onAnswered} />)}
    </section>
  )
}

function locallyCompleted(): (module: string, unit: string) => boolean {
  let map: ReturnType<typeof parseProgress> = {}
  try { map = parseProgress(localStorage.getItem(UNIT_PROGRESS_KEY)) } catch {}
  return (m, u) => map[m]?.[u] === true
}

/** Блок «Вспомни» в начале юнита. Список выбирается один раз за заход и дальше не прыгает. */
export function SpacedReview({ moduleSlug, unitSlug, locale }: { moduleSlug: string; unitSlug: string; locale: Locale }) {
  const [cards, setCards] = useState<DueCard[]>([])
  const { getState, loaded } = useProgress()
  const answered = useRef(false)
  const shownSent = useRef(false)

  useEffect(() => {
    if (answered.current) return    // ученик уже отвечает — список не пересобираем
    const local = locallyCompleted()
    const due = pickDue(readStore(COURSE.progressKey), {
      now: Date.now(),
      locale,
      current: { module: moduleSlug, unit: unitSlug },
      // Пройден локально (мастер/проза) или по платформенному прогрессу вошедшего ученика.
      isCompleted: (m, u) => local(m, u) || getState(`${m}/${u}`) === 'completed',
    })
    setCards(due)
    if (due.length > 0 && !shownSent.current) {
      shownSent.current = true
      sendPlausible('spaced_review_shown', { module: moduleSlug, unit: unitSlug, count: due.length })
    }
    // getState меняется, когда догрузился серверный прогресс — тогда пересчёт уместен.
  }, [moduleSlug, unitSlug, locale, loaded, getState])

  return (
    <ReviewList
      cards={cards}
      locale={locale}
      onAnswered={e => { answered.current = true; sendPlausible('spaced_review_answered', e) }}
    />
  )
}
