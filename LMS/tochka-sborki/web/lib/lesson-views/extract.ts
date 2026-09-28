// Представления урока из одного источника (intake LMS#8, спека docs/superpowers/specs/2026-09-28-lesson-views.md).
// Источник правды — MDX юнита. Здесь — детерминированное извлечение outline (конспект и карта — одни данные)
// и хэш источника для гварда устаревания.
//
// ВАЖНО: файл исполняется и нативным type stripping Node (scripts/gen-lesson-views.ts), поэтому —
// только `import type` из локальных модулей, без enum/namespace/parameter properties.
import { createHash } from 'node:crypto'
import type { SelfCheckItem } from '../content'

export const GENERATOR = 'extract-v1'
export const SCHEMA = 1

/** extract — дословный фрагмент источника; manual/llm — перефраз, проверяется числовым гвардом. */
export type PointOrigin = 'extract' | 'manual' | 'llm'

export interface ViewPoint { text: string; origin: PointOrigin }

export interface OutlineNode {
  /** Пусто — текст до первого заголовка. */
  heading: string
  points: ViewPoint[]
  children: OutlineNode[]
}

export interface LessonViewsArtifact {
  schema: number
  generator: string
  module: string
  unit: string
  locale: 'ru' | 'en'
  title: string
  sourceHash: string
  outline: OutlineNode[]
  /** id самопроверок юнита из _meta.json (карточки строятся из них). */
  cards: string[]
  /** Слот озвучки — следующий шаг (см. спеку), пока всегда null. */
  audio: null
}

const FRONTMATTER_RE = /^---\n[\s\S]*?\n---\n?/
const FENCE_RE = /```[\s\S]*?```/g

export function normalizeEol(s: string): string {
  return s.replace(/\r\n?/g, '\n')
}

/** Хэш источника: MDX юнита (LF) + самопроверки этого юнита. Меняется при правке урока или его вопросов. */
export function sourceHash(mdx: string, checks: SelfCheckItem[]): string {
  const h = createHash('sha256')
  h.update(normalizeEol(mdx))
  h.update('\n\u0000checks\u0000\n')
  h.update(JSON.stringify(checks))
  return `sha256:${h.digest('hex')}`
}

/** Текст без markdown-разметки и JSX: для отображения и для дословной сверки с источником. */
export function plain(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]+/g, '')
    .replace(/^\s*(#{1,6}|>|[-+]|\d+\.)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function body(mdx: string): string {
  const src = normalizeEol(mdx).replace(FRONTMATTER_RE, '').replace(FENCE_RE, '')
  return /<Phase type="concept">([\s\S]*?)<\/Phase>/.exec(src)?.[1] ?? src
}

function wordCount(s: string): number {
  return s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length
}

/** Абзац — прозаический: не JSX, не таблица, не цитата, не список, не заголовок. */
function isProse(block: string): boolean {
  const t = block.trim()
  return t.length > 0 && !/^(<|\||>|[-*+]\s|\d+\.\s|#)/.test(t)
}

/** Сокращения, после которых точка не конец предложения. */
const ABBR_END_RE = /(?:^|[\s(])(?:цит|см|ср|др|стр|рис|т\.е|т\.д|al|e\.g|i\.e|vs|[\p{Lu}])\.$/u

function sentences(block: string): string[] {
  const out: string[] = []
  for (const piece of plain(block).split(/(?<=[.!?…])\s+/u)) {
    const prev = out[out.length - 1]
    if (prev && ABBR_END_RE.test(prev)) out[out.length - 1] = `${prev} ${piece}`
    else out.push(piece)
  }
  return out.map(x => x.trim()).filter(Boolean)
}

/** Выделения `**…**` абзаца. Режем по `**`, а не регэкспом: одиночный `*курсив*` внутри выделения
 *  иначе сдвигает пары, и «тезисом» становится текст МЕЖДУ выделениями. */
function boldSpans(block: string): string[] {
  const parts = block.split('**')
  if (parts.length < 3) return []
  const out: string[] = []
  for (let i = 1; i < parts.length - 1; i += 2) {
    if (!parts[i].includes('\n')) out.push(plain(parts[i]).replace(/[:：]\s*$/, '').trim())
  }
  return out
}

/** Законченная фраза: кончается на . ! ? … (метки «Было: `код`» и обрывки тезисом не считаются). */
function isSentence(s: string): boolean {
  return /[.!?…]["»”)]?$/u.test(s)
}

const MAX_THESIS = 260

interface Section { heading: string; level: number; lines: string[] }

/** Тезисы раздела: предложения, где есть выделение `**…**` из ≥ 3 слов (абзац-перечень коротких меток
 *  вроде «Кто / Что / Зачем» тезисов не даёт). Длинное предложение заменяется самим выделением.
 *  Если выделений нет — первое законченное предложение первого прозаического абзаца. */
function theses(lines: string[]): ViewPoint[] {
  const blocks = lines.join('\n').split(/\n\s*\n/).filter(isProse)
  const out: string[] = []
  for (const block of blocks) {
    const spans = boldSpans(block)
    if (spans.length >= 3 && spans.every(s => wordCount(s) <= 3)) continue
    const sents = sentences(block)
    for (const span of spans) {
      if (wordCount(span) < 3) continue
      const sent = sents.find(s => s.includes(span))
      const t = sent && sent.length <= MAX_THESIS ? sent : span
      if (!out.includes(t)) out.push(t)
    }
  }
  if (out.length === 0) {
    for (const block of blocks) {
      const s = sentences(block).find(isSentence)
      if (s) { out.push(s); break }
    }
  }
  return out.map(t => ({ text: t, origin: 'extract' as const }))
}

/** Outline концепт-фазы: `##` — раздел, `###`/`####` — подраздел текущего раздела. */
export function extractOutline(mdx: string): OutlineNode[] {
  const sections: Section[] = [{ heading: '', level: 2, lines: [] }]
  for (const line of body(mdx).split('\n')) {
    const h = /^(#{2,4})\s+(.+?)\s*$/.exec(line)
    if (h) sections.push({ heading: plain(h[2]), level: h[1].length, lines: [] })
    else sections[sections.length - 1].lines.push(line)
  }
  const roots: OutlineNode[] = []
  for (const s of sections) {
    const node: OutlineNode = { heading: s.heading, points: theses(s.lines), children: [] }
    if (!s.heading && node.points.length === 0) continue
    const parent = roots[roots.length - 1]
    if (s.level > 2 && parent && parent.heading) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

export function unitChecks(checks: SelfCheckItem[] | undefined, unit: string): SelfCheckItem[] {
  return (checks ?? []).filter(c => c.unit === unit)
}

export function buildArtifact(input: {
  module: string
  unit: string
  locale: 'ru' | 'en'
  title: string
  mdx: string
  checks: SelfCheckItem[] | undefined
}): LessonViewsArtifact {
  const own = unitChecks(input.checks, input.unit)
  return {
    schema: SCHEMA,
    generator: GENERATOR,
    module: input.module,
    unit: input.unit,
    locale: input.locale,
    title: input.title,
    sourceHash: sourceHash(input.mdx, own),
    outline: extractOutline(input.mdx),
    cards: own.map(c => c.id),
    audio: null,
  }
}

/** Все пункты outline (заголовки и тезисы) плоским списком — для гвардов. */
export function flattenOutline(nodes: OutlineNode[]): { heading: string; point?: ViewPoint }[] {
  const out: { heading: string; point?: ViewPoint }[] = []
  for (const n of nodes) {
    out.push({ heading: n.heading })
    for (const p of n.points) out.push({ heading: n.heading, point: p })
    out.push(...flattenOutline(n.children))
  }
  return out
}

export function hasManualPoints(a: Pick<LessonViewsArtifact, 'outline'>): boolean {
  return flattenOutline(a.outline).some(x => x.point && x.point.origin !== 'extract')
}

const NUM_RE = /\d+(?:[.,]\d+)?/g
const URL_RE = /https?:\/\/[^\s)]+/g

/** Находки гварда по одному пункту. Пусто — годен. */
export function checkPoint(point: ViewPoint, source: string): string[] {
  const src = plain(body(source))
  const full = plain(normalizeEol(source))
  const text = point.text.trim()
  if (!text) return ['пустой пункт']
  if (point.origin === 'extract') {
    return src.includes(plain(text)) ? [] : [`не дословно из источника: «${text}»`]
  }
  const found: string[] = []
  const nums = new Set(full.match(NUM_RE) ?? [])
  for (const n of text.match(NUM_RE) ?? []) if (!nums.has(n)) found.push(`число ${n} не из источника`)
  const urls = new Set(full.match(URL_RE) ?? [])
  for (const u of text.match(URL_RE) ?? []) if (!urls.has(u)) found.push(`ссылка ${u} не из источника`)
  return found
}
