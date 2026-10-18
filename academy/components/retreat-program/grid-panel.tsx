'use client'

import type { Locale } from '../../lib/dictionaries'
import { FORM_PATH, formHashFromPassport } from '../../lib/retreat-guest-form/form'
import { localePath } from '../../lib/retreat-timeline/form'
import {
  blockTitle, checkGrid, dayLoad, freeMinutes, fromMinutes, STEP, EARLIEST, DAY_END,
  toMinutes, type Block, type BlockKind,
} from '../../lib/retreat-program/grid'
import { cardIssueText, gridIssueText, KIND, LOAD } from '../../lib/retreat-program/labels'
import { checkCard, type PracticeCard } from '../../lib/retreat-program/practices'
import { usedCards, type ProgramForm } from '../../lib/retreat-program/form'
import { button, card, field } from './styles'
import { PG_UI } from './ui'

const kinds: BlockKind[] = ['practice', 'meal', 'free', 'transfer', 'other']
// Начало блока — до 23:30: вечерняя практика после конца сетки CSV (22:00) тоже ставится, о ней скажет проверка дня
const LAST_START = toMinutes('23:30')
const times = Array.from({ length: (LAST_START - toMinutes(EARLIEST)) / STEP + 1 }, (_, i) =>
  fromMinutes(toMinutes(EARLIEST) + i * STEP))

interface Props {
  locale: Locale
  form: ProgramForm
  cards: PracticeCard[]
  onUpdate: (index: number, patch: Partial<Block>) => void
  onRemove: (index: number) => void
  onAdd: (day: number) => void
}

export function GridPanel({ locale, form, cards, onUpdate, onRemove, onAdd }: Props) {
  const t = PG_UI[locale]
  const last = (form.passport.nights ?? 0) + 1
  const issues = checkGrid(form.passport, form.blocks, cards)
  const nameOf = (id: string) => cards.find((c) => c.id === id)?.name ?? id
  const cardIssues = usedCards(form.blocks, cards).flatMap((practice) => checkCard(practice).map((issue) => ({ issue, practice })))
  const outside = form.blocks.map((block, index) => ({ block, index }))
    .filter(({ block }) => block.day < 1 || block.day > last)

  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 300 }}>{t.grid}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>{t.gridLead}</p>
      <div className="pg-days">
        {Array.from({ length: last }, (_, dayIndex) => {
          const day = dayIndex + 1
          const dayBlocks = form.blocks.map((block, index) => ({ block, index }))
            .filter(({ block }) => block.day === day)
          const load = dayLoad(day, form.blocks, cards)
          const free = freeMinutes(day, form.blocks, cards) / 60
          return (
            <section key={day} style={card}>
              <h3 style={{ marginTop: 0 }}>{t.day(day, last)}</h3>
              {dayBlocks.map(({ block, index }) => (
                <div key={index} className="pg-block-row">
                  <select aria-label={`${t.kind} · ${t.day(day, last)}, ${block.start}`} style={field} value={block.kind}
                    onChange={(event) => onUpdate(index, { kind: event.target.value as BlockKind })}>
                    {kinds.map((kind) => <option key={kind} value={kind}>{KIND[locale][kind]}</option>)}
                  </select>
                  <select aria-label={`${t.time} · ${t.day(day, last)}, ${block.start}`} style={field} value={block.start}
                    onChange={(event) => onUpdate(index, { start: event.target.value })}>
                    {times.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  <input aria-label={`${t.minutes} · ${t.day(day, last)}, ${block.start}`} style={field} type="number" min={0} max={600}
                    value={block.minutes || ''} placeholder={t.minutesHint}
                    onChange={(event) => onUpdate(index, {
                      minutes: event.target.value.trim() === '' ? 0 : Number(event.target.value),
                    })} />
                  <button aria-label={`${t.remove} · ${t.day(day, last)}, ${block.start}`} style={button} onClick={() => onRemove(index)}>{t.remove}</button>
                  {block.kind === 'practice' ? (
                    <select aria-label={`${t.practice} · ${t.day(day, last)}, ${block.start}`} style={field} value={block.practiceId ?? ''}
                      onChange={(event) => onUpdate(index, { practiceId: event.target.value || undefined })}>
                      <option value="">{t.choosePractice}</option>
                      {cards.map((cardItem) => <option key={cardItem.id} value={cardItem.id}>{cardItem.name}</option>)}
                    </select>
                  ) : (
                    <input aria-label={`${t.blockTitle} · ${t.day(day, last)}, ${block.start}`} style={field} value={block.title ?? ''} placeholder={t.blockTitle}
                      onChange={(event) => onUpdate(index, { title: event.target.value })} />
                  )}
                </div>
              ))}
              <button style={button} onClick={() => onAdd(day)}>{t.addBlock}</button>
              <p className="pg-meta">{t.dayLoad}: {load ? LOAD[locale][load] : t.noLoad}; {t.freeTime}: {t.hours(
                free.toFixed(1).replace('.', locale === 'ru' ? ',' : '.'))}</p>
            </section>
          )
        })}
      </div>
      {outside.length > 0 && (
        <section style={{ ...card, marginTop: '1rem' }}>
          <h3>{t.outsideDays}</h3>
          <ul>{outside.map(({ block, index }) => (
            <li key={`${index}-${block.day}-${block.start}`}>{block.day} · {block.start} · {blockTitle(block, cards, locale)}{' '}
              <button aria-label={`${t.remove} · ${t.day(block.day, last)}, ${block.start}`} style={button} onClick={() => onRemove(index)}>{t.remove}</button></li>
          ))}</ul>
        </section>
      )}
      {(issues.length > 0 || cardIssues.length > 0) && (
        <section style={{ ...card, marginTop: '1rem' }}>
          <h3>{t.issues}</h3>
          <ul>{issues.map((issue, index) => {
            const name = issue.card ? nameOf(issue.card) : ''
            return <li key={`${issue.id}-${index}`}>{gridIssueText(issue, name, locale)}
              {issue.id === 'touch-check-form' && <>{' '}<a href={localePath(FORM_PATH, locale) + formHashFromPassport(form.passport)}>{t.openForm}</a></>}</li>
          })}</ul>
          {cardIssues.map(({ issue, practice }, index) => (
            <p key={`${practice.id}-${issue.id}-${index}`}>{cardIssueText(issue, practice.name, locale)}</p>
          ))}
        </section>
      )}
    </>
  )
}
