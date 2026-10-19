'use client'

// Редакторы полей буклета: строка, текст, список строк, повторяемые карточки (люди, пункты, отзывы, вопросы).
import type { ReactNode } from 'react'
import type { PhotoMeta } from '../../lib/retreat-booklet/photos'
import type { BookletUi } from './ui'
import { field, label, smallButton } from './styles'

export function TextField({ text, value, max, onChange, type = 'text' }: {
  text: string; value: string; max: number; onChange: (v: string) => void; type?: string
}) {
  return <label style={label}>{text}<input style={field} type={type} value={value} maxLength={max} onChange={(e) => onChange(e.target.value)} /></label>
}

export function TextArea({ text, value, max, onChange, rows = 4 }: {
  text: string; value: string; max: number; onChange: (v: string) => void; rows?: number
}) {
  return <label style={label}>{text}<textarea style={{ ...field, resize: 'vertical' }} rows={rows} value={value} maxLength={max}
    onChange={(e) => onChange(e.target.value)} /></label>
}

const move = <T,>(items: T[], i: number, by: -1 | 1): T[] => {
  const j = i + by
  if (j < 0 || j >= items.length) return items
  const next = [...items]; [next[i], next[j]] = [next[j], next[i]]
  return next
}

/** Кнопки «выше / ниже / убрать» у элемента повторяемого списка. */
function ItemControls({ t, index, count, onMove, onRemove }: {
  t: BookletUi; index: number; count: number; onMove: (by: -1 | 1) => void; onRemove: () => void
}) {
  return (
    <span className="bk-row">
      <button type="button" style={smallButton} aria-label={t.upLabel} disabled={index === 0} onClick={() => onMove(-1)}>{t.up}</button>
      <button type="button" style={smallButton} aria-label={t.downLabel} disabled={index === count - 1} onClick={() => onMove(1)}>{t.down}</button>
      <button type="button" style={smallButton} onClick={onRemove}>{t.remove}</button>
    </span>
  )
}

export function ListEditor({ t, text, items, max, maxItems, onChange }: {
  t: BookletUi; text: string; items: string[]; max: number; maxItems: number; onChange: (v: string[]) => void
}) {
  return (
    <div className="bk-stack">
      <span style={label}>{text}</span>
      {items.map((item, i) => (
        <div key={i} className="bk-row">
          <input style={{ ...field, flex: 1, minWidth: '10rem' }} aria-label={`${text} ${i + 1}`} value={item} maxLength={max}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <ItemControls t={t} index={i} count={items.length} onMove={(by) => onChange(move(items, i, by))}
            onRemove={() => onChange(items.filter((_, j) => j !== i))} />
        </div>
      ))}
      {items.length < maxItems && <button type="button" style={{ ...smallButton, justifySelf: 'start' }} onClick={() => onChange([...items, ''])}>{t.add}</button>}
    </div>
  )
}

/** Повторяемые карточки одного вида: поля карточки рисует `render`, порядок и удаление — общие. */
export function CardsEditor<T>({ t, word, items, maxItems, blank, onChange, render }: {
  t: BookletUi; word: string; items: T[]; maxItems: number; blank: () => T; onChange: (v: T[]) => void
  render: (item: T, set: (patch: Partial<T>) => void, i: number) => ReactNode
}) {
  return (
    <div className="bk-stack">
      {items.map((item, i) => (
        <div key={i} className="bk-item">
          <div className="bk-row" style={{ justifyContent: 'space-between' }}>
            <span className="bk-tag">{word} {i + 1}</span>
            <ItemControls t={t} index={i} count={items.length} onMove={(by) => onChange(move(items, i, by))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))} />
          </div>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      {items.length < maxItems && <button type="button" style={{ ...smallButton, justifySelf: 'start' }} onClick={() => onChange([...items, blank()])}>{t.add}</button>}
    </div>
  )
}

/** Выбор фото из фото этого браузера. */
export function PhotoSelect({ t, text, value, photos, onChange }: {
  t: BookletUi; text: string; value: string | undefined; photos: PhotoMeta[]; onChange: (id: string | undefined) => void
}) {
  return (
    <label style={label}>{text}
      <select style={field} value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)}>
        <option value="">{t.fields.noPhoto}</option>
        {photos.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </label>
  )
}
