'use client'

// Сквозная картина курса (спека 2026-10-12-assembly-map): машина из pack'а, состояние — из прогресса ученика.
// При сборке рендерится с пустым прогрессом (всё контуром, текущая деталь подсвечена), в браузере дособирается.
import { useId } from 'react'
import { useRouter } from 'next/navigation'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { MACHINE } from '@/lib/course/assembly-machine'
import { assemblyLabels, assemblyState, assemblySummary, moduleHref } from '@/lib/assembly/state'
import type { ElementAttrs } from '@/lib/assembly/types'
import { useUnitProgress } from '@/lib/unit-progress'

interface Props {
  locale: 'ru' | 'en'
  current?: { module: string; unit: string } | null
  /** Узлы — ссылки на свой модуль (полная картина); без него — неподвижная иллюстрация (миниатюра). */
  interactive?: boolean
}

export function AssemblyFigure({ locale, current = null, interactive = false }: Props) {
  const { progress } = useUnitProgress()
  const router = useRouter()
  const uid = useId()
  if (!COURSE.features.assemblyMap || !MACHINE) return null

  const st = assemblyState(ASSEMBLY_MAP, progress, current)
  const sum = assemblySummary(ASSEMBLY_MAP, st, locale)
  const labels = assemblyLabels(ASSEMBLY_MAP, locale)
  const moduleOf = new Map(ASSEMBLY_MAP.nodes.map((n) => [n.id, n.module]))

  const part = (id: string): ElementAttrs => ({
    'data-am-part': id,
    'data-am-state': st.parts[id] ?? 'ghost',
    'data-am-current': st.current?.part === id ? 'true' : undefined,
  })
  const node = (id: string): ElementAttrs => {
    const base: ElementAttrs = {
      'data-am-node': id,
      'data-am-state': st.nodes[id]?.shell ?? 'ghost',
      'data-am-current': st.current?.node === id && st.current.part === null ? 'true' : undefined,
    }
    if (!interactive) return base
    const go = () => router.push(moduleHref(moduleOf.get(id) ?? '', locale))
    return {
      ...base,
      role: 'link',
      tabIndex: 0,
      'aria-label': labels[id],
      onClick: go,
      onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } },
    }
  }
  const title = (id: string) => labels[id] ?? id
  const Art = MACHINE.Art

  return (
    <figure className="am-figure-wrap">
      <svg
        data-am-figure=""
        className="am-figure"
        viewBox={MACHINE.viewBox}
        role={interactive ? 'group' : 'img'}
        aria-labelledby={`${uid}-t`}
        aria-describedby={`${uid}-d`}
      >
        <title id={`${uid}-t`}>{sum.title}</title>
        <desc id={`${uid}-d`}>{sum.desc}</desc>
        <Art part={part} node={node} title={title} />
      </svg>
      <ul className="am-sr">
        {sum.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </figure>
  )
}
