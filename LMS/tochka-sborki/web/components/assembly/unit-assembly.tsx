'use client'

// Место картины на странице юнита (спека §3 с поправкой плана): первый юнит модуля — полная картина,
// остальные — миниатюра, по клику полная картина в <dialog> (Esc и возврат фокуса — нативные).
import { useRef, useState } from 'react'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { assemblyCaption } from '@/lib/assembly/state'
import { AssemblyFigure } from './assembly-figure'

const COPY = {
  ru: { title: 'Машина, которую ты собираешь', open: 'Открыть всю машину', close: 'Закрыть' },
  en: { title: 'The machine you are building', open: 'Open the whole machine', close: 'Close' },
} as const

interface Props { moduleSlug: string; unitSlug: string; unitIndex: number; locale: 'ru' | 'en' }

export function UnitAssembly({ moduleSlug, unitSlug, unitIndex, locale }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  if (!COURSE.features.assemblyMap) return null

  const current = { module: moduleSlug, unit: unitSlug }
  const caption = assemblyCaption(ASSEMBLY_MAP, current, locale)
  const t = COPY[locale]

  if (unitIndex === 0) {
    return (
      <section className="am-unit am-unit--full" aria-label={t.title}>
        <AssemblyFigure locale={locale} current={current} interactive />
        <p className="am-caption">{caption}</p>
      </section>
    )
  }

  return (
    <div className="am-unit am-unit--mini">
      <button
        type="button"
        className="am-mini"
        aria-haspopup="dialog"
        aria-label={`${caption}. ${t.open}`}
        onClick={() => { setOpen(true); dialog.current?.showModal() }}
      >
        <AssemblyFigure locale={locale} current={current} />
        <span className="am-mini-text">
          <span className="am-caption">{caption}</span>
          <span className="am-open">{t.open}</span>
        </span>
      </button>
      <dialog ref={dialog} className="am-dialog" aria-label={t.title} onClose={() => setOpen(false)}>
        <button type="button" className="am-close" onClick={() => dialog.current?.close()}>{t.close}</button>
        {open && <AssemblyFigure locale={locale} current={current} interactive />}
      </dialog>
    </div>
  )
}
