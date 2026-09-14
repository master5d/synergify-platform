// Гвард constructive alignment (intake LMS#8/#9, Биггс 1996): у каждой цели модуля — хотя бы
// один вопрос «проверь себя», у каждого вопроса — цель; метки <SelfCheck id/> в MDX совпадают
// с checks в _meta.json; RU и EN — одна и та же связка. Чистая функция: тест читает файлы сам.
import type { ModuleMeta } from '../content'

type Locale = 'ru' | 'en'
export type AlignmentMeta = Pick<ModuleMeta, 'units' | 'objectives' | 'checks'>
export interface AlignmentInput {
  slug: string
  ru: AlignmentMeta
  en: AlignmentMeta
  /** marks[locale][unitSlug] — id меток <SelfCheck/> в MDX урока, в порядке появления. */
  marks: Record<Locale, Record<string, string[]>>
  /** Сколько вхождений `<SelfCheck` не в строгом виде `<SelfCheck id="…"/>`. */
  malformed: Record<Locale, number>
}

const PLACEHOLDER = /^\s*(?:TODO|TBD|…|\.\.\.)?\s*$|\bTODO\b|\bTBD\b/

const MARK_RE = /<SelfCheck\s+id="([^"]+)"\s*\/>/g
const ANY_MARK_RE = /<SelfCheck\b/g

// Метки внутри кода и MDX-комментариев не считаются: пример в ```-блоке или закомментированная
// метка не рендерится как вопрос.
const FENCE_RE = /```[\s\S]*?```/g
const MDX_COMMENT_RE = /\{\/\*[\s\S]*?\*\/\}/g

export function selfCheckMarks(source: string): { ids: string[]; malformed: number } {
  const mdx = source.replace(FENCE_RE, '').replace(MDX_COMMENT_RE, '')
  const ids = [...mdx.matchAll(MARK_RE)].map(m => m[1])
  const all = (mdx.match(ANY_MARK_RE) ?? []).length
  return { ids, malformed: all - ids.length }
}

function localeErrors(slug: string, l: Locale, meta: AlignmentMeta, marks: Record<string, string[]>, malformed: number): string[] {
  const at = `${slug} [${l}]`
  const out: string[] = []
  const objectives = meta.objectives ?? []
  const checks = meta.checks ?? []
  const unitSlugs = new Set(meta.units.map(u => u.slug))

  if (objectives.length < 3 || objectives.length > 5) out.push(`${at}: целей ${objectives.length}, нужно 3–5`)
  const oIds = new Set<string>()
  for (const o of objectives) {
    if (oIds.has(o.id)) out.push(`${at}: повтор id цели ${o.id}`)
    oIds.add(o.id)
    if (PLACEHOLDER.test(o.text ?? '')) out.push(`${at}: цель ${o.id} — пусто или заглушка`)
  }

  const cIds = new Set<string>()
  for (const c of checks) {
    if (cIds.has(c.id)) out.push(`${at}: повтор id вопроса ${c.id}`)
    cIds.add(c.id)
    if (!oIds.has(c.objective)) out.push(`${at}: вопрос ${c.id} ссылается на цель ${c.objective}, которой нет`)
    if (!unitSlugs.has(c.unit)) out.push(`${at}: вопрос ${c.id} ссылается на урок ${c.unit}, которого нет`)
    const opts = c.options ?? []
    if (opts.length < 2 || opts.length > 5) out.push(`${at}: вопрос ${c.id} — вариантов ${opts.length}, нужно 2–5`)
    if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer >= opts.length) out.push(`${at}: вопрос ${c.id} — answer ${c.answer} вне вариантов`)
    for (const [field, v] of [['question', c.question], ['explain', c.explain], ...opts.map((o, i) => [`options[${i}]`, o])] as [string, string][]) {
      if (PLACEHOLDER.test(v ?? '')) out.push(`${at}: вопрос ${c.id} — ${field} пусто или заглушка`)
    }
  }

  for (const o of objectives) {
    if (!checks.some(c => c.objective === o.id)) out.push(`${at}: у цели ${o.id} нет ни одного вопроса`)
  }

  if (malformed > 0) out.push(`${at}: ${malformed} метк(и) <SelfCheck> неверный вид — только <SelfCheck id="…"/>`)
  const seen = new Map<string, string[]>()
  for (const [unit, ids] of Object.entries(marks)) for (const id of ids) seen.set(id, [...(seen.get(id) ?? []), unit])
  for (const c of checks) {
    const where = seen.get(c.id) ?? []
    if (where.length === 0) out.push(`${at}: вопрос ${c.id} не размечен в MDX урока ${c.unit}`)
    else if (where.length > 1) out.push(`${at}: вопрос ${c.id} размечен ${where.length} раза (${where.join(', ')})`)
    else if (where[0] !== c.unit) out.push(`${at}: вопрос ${c.id} размечен в ${where[0]} — не в своём уроке ${c.unit}`)
  }
  for (const id of seen.keys()) if (!cIds.has(id)) out.push(`${at}: метка <SelfCheck id="${id}"/> — неизвестный вопрос`)
  return out
}

export function validateModuleAlignment(i: AlignmentInput): string[] {
  const out = [
    ...localeErrors(i.slug, 'ru', i.ru, i.marks.ru, i.malformed.ru),
    ...localeErrors(i.slug, 'en', i.en, i.marks.en, i.malformed.en),
  ]
  const ids = (m: AlignmentMeta, k: 'objectives' | 'checks') => (m[k] ?? []).map(x => x.id).sort().join(',')
  if (ids(i.ru, 'objectives') !== ids(i.en, 'objectives')) out.push(`${i.slug}: RU и EN — разные наборы целей`)
  if (ids(i.ru, 'checks') !== ids(i.en, 'checks')) out.push(`${i.slug}: RU и EN — разные наборы вопросов`)
  for (const c of i.ru.checks ?? []) {
    const e = (i.en.checks ?? []).find(x => x.id === c.id)
    if (e && (e.unit !== c.unit || e.objective !== c.objective || e.answer !== c.answer)) {
      out.push(`${i.slug}: вопрос ${c.id} — RU и EN расходятся (unit/objective/answer)`)
    }
  }
  return out
}
