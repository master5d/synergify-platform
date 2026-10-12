// Состояние сквозной картины из прогресса ученика (спека 2026-10-12-assembly-map, §2).
import { isUnitCompleted, type UnitProgressMap } from '@/lib/unit-progress'
import { NODE_TARGET, type AssemblyMap, type AssemblyState, type PartState } from './types'

type Locale = 'ru' | 'en'

const COPY = {
  ru: { building: 'Ты собираешь', title: 'Машина, которую ты собираешь', assembled: 'Собрано узлов', of: 'из', now: 'Сейчас', current: 'сейчас' },
  en: { building: "You're building", title: 'The machine you are building', assembled: 'Nodes assembled', of: 'of', now: 'Now', current: 'now' },
} as const

export function assemblyState(
  map: AssemblyMap,
  progress: UnitProgressMap,
  current: { module: string; unit: string } | null = null,
): AssemblyState {
  const nodeOf = new Map(map.nodes.map((n) => [n.module, n.id]))
  const parts: Record<string, PartState> = Object.fromEntries(map.parts.map((p) => [p.id, 'ghost' as PartState]))
  const phases: Record<string, { done: number; total: number }> = {}
  for (const [key, target] of Object.entries(map.units)) {
    const [mod, unit] = key.split('/')
    const node = nodeOf.get(mod)
    if (!node) continue
    const finished = isUnitCompleted(progress, mod, unit)
    if (target === NODE_TARGET) {
      const ph = (phases[node] ??= { done: 0, total: 0 })
      ph.total += 1
      if (finished) ph.done += 1
    } else if (target in parts && finished) {
      parts[target] = 'built'
    }
  }
  const nodes: AssemblyState['nodes'] = {}
  for (const n of map.nodes) {
    const own = map.parts.filter((p) => p.node === n.id)
    const builtParts = own.filter((p) => parts[p.id] === 'built').length
    const ph = phases[n.id] ?? { done: 0, total: 0 }
    const shell: PartState = ph.total > 0 ? (ph.done === ph.total ? 'built' : 'ghost') : (builtParts > 0 ? 'built' : 'ghost')
    nodes[n.id] = { built: builtParts + ph.done, total: own.length + ph.total, shell }
  }
  let cur: AssemblyState['current'] = null
  if (current) {
    const target = map.units[`${current.module}/${current.unit}`]
    const node = nodeOf.get(current.module)
    if (target !== undefined && node) cur = { node, part: target === NODE_TARGET ? null : target }
  }
  return { parts, nodes, current: cur }
}

export function assemblyLabels(map: AssemblyMap, locale: Locale): Record<string, string> {
  return Object.fromEntries([...map.nodes, ...map.parts].map((x) => [x.id, x.label[locale]]))
}

function currentLabel(map: AssemblyMap, cur: AssemblyState['current'], locale: Locale): string {
  if (!cur) return ''
  const labels = assemblyLabels(map, locale)
  return cur.part ? `${labels[cur.node]} → ${labels[cur.part]}` : labels[cur.node]
}

export function assemblyCaption(map: AssemblyMap, current: { module: string; unit: string }, locale: Locale): string {
  const cur = assemblyState(map, {}, current).current
  return cur ? `${COPY[locale].building}: ${currentLabel(map, cur, locale)}` : ''
}

export function assemblySummary(map: AssemblyMap, st: AssemblyState, locale: Locale): { title: string; desc: string; items: string[] } {
  const c = COPY[locale]
  const labels = assemblyLabels(map, locale)
  const assembled = map.nodes.filter((n) => st.nodes[n.id].total > 0 && st.nodes[n.id].built === st.nodes[n.id].total).length
  const now = currentLabel(map, st.current, locale)
  const desc = `${c.assembled}: ${assembled} ${c.of} ${map.nodes.length}.` + (now ? ` ${c.now} — ${now}.` : '')
  const items = map.nodes.map((n) =>
    `${labels[n.id]}: ${st.nodes[n.id].built}/${st.nodes[n.id].total}` + (st.current?.node === n.id ? ` — ${c.current}` : ''))
  return { title: c.title, desc, items }
}

export function moduleHref(module: string, locale: Locale): string {
  return `${locale === 'en' ? '/en' : ''}/lessons/${module}/`
}
