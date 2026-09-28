// Пересказ конспекта (спека docs/superpowers/specs/2026-09-28-lesson-views.md, раздел «Пересказ»).
// Модель (гейтвей SOVERN, пул prose-pool) переписывает дословные тезисы раздела в связные короткие пункты.
// Здесь — только чистые функции: ключ раздела, промпт, разбор ответа и ГВАРД. Сеть — в scripts/gen-lesson-views.ts.
//
// Файл исполняется и нативным type stripping Node (скрипт ставит resolve-хук на расширение .ts),
// поэтому — без enum/namespace/parameter properties.
import { createHash } from 'node:crypto'
import { checkManifest, type ManifestRule } from '../authoring/manifest'
import { lintDehustle } from '../authoring/dehustle'
import { normalizeEol, plain, type OutlineNode } from './extract'

export const PARAPHRASE_GENERATOR = 'paraphrase-v1'
/** Алиас пула гейтвея, НЕ имя провайдерской модели (HARD RULE лаборатории). */
export const PARAPHRASE_POOL = 'prose-pool'

export interface ParaphraseSection {
  /** Хэш входа пересказа: заголовок + дословные тезисы раздела. Не совпал с текущим outline — пересказ не показывается. */
  sourceHash: string
  points: string[]
}

export interface ParaphraseBlock {
  source: 'paraphrase'
  generator: string
  pool: string
  sections: ParaphraseSection[]
}

/** Хэш раздела outline — ровно то, что ушло модели (заголовок и собственные тезисы, без детей). */
export function sectionHash(node: Pick<OutlineNode, 'heading' | 'points'>): string {
  const h = createHash('sha256')
  h.update(JSON.stringify({ heading: node.heading, points: node.points.map(p => p.text) }))
  return `sha256:${h.digest('hex')}`
}

/** Разделы с тезисами в порядке обхода (раздел, затем его подразделы). */
export function sectionsWithPoints(nodes: OutlineNode[]): OutlineNode[] {
  const out: OutlineNode[] = []
  for (const n of nodes) {
    if (n.points.length) out.push(n)
    out.push(...sectionsWithPoints(n.children))
  }
  return out
}

// ── Промпт ─────────────────────────────────────────────────────────────────────

export interface PromptSection { id: number; heading: string; theses: string[] }

export function buildPrompt(locale: 'ru' | 'en', title: string, sections: PromptSection[]): { system: string; user: string } {
  const lang = locale === 'ru' ? 'Russian' : 'English'
  const system = [
    `You rewrite lesson summaries for a calm, honest self-study course. Write in ${lang} only.`,
    'For every section you get its heading and verbatim key sentences from the lesson.',
    'Rewrite them as 1–4 short, connected bullet points in plain words, so the section reads as a coherent retelling.',
    'A section with one short sentence gets one point: reword it lightly, do not split or pad it.',
    'Hard rules:',
    '- Use ONLY what the given sentences say. Do not add facts, examples, advice or conclusions, and do not drop the key idea.',
    '- Keep the lesson\'s voice: address the reader the same way the sentences do'
      + (locale === 'ru' ? ' (informal «ты», never «вы»).' : ' (plain second person "you").'),
    '- No digits or numbers except those written in the given sentences (keep such names intact, e.g. a version number). No links, no markdown, no backticks.',
    '- Do not name any tool, product, company, command, file or person unless that exact name appears in the given sentences.',
    '- Each point is one sentence, at most 25 words. No hype, no urgency, no promises.',
    'Answer with JSON only: {"sections":[{"id":<id>,"points":["…","…"]}]} — one entry per input section, same ids.',
  ].join('\n')
  const user = JSON.stringify({ lesson: title, sections }, null, 1)
  return { system, user }
}

/** Разбор ответа модели: JSON внутри текста (забор ``` или рассуждение перед ним допускаются). */
export function parseReply(text: string): Map<number, string[]> | null {
  if (typeof text !== 'string' || !text.trim()) return null
  const t = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  let data: unknown
  try { data = JSON.parse(t.slice(start, end + 1)) } catch { return null }
  const secs = (data as { sections?: unknown })?.sections
  if (!Array.isArray(secs)) return null
  const out = new Map<number, string[]>()
  for (const s of secs as { id?: unknown; points?: unknown }[]) {
    if (typeof s?.id !== 'number' || !Array.isArray(s.points)) continue
    out.set(s.id, s.points.filter((p): p is string => typeof p === 'string').map(p => p.replace(/\s+/g, ' ').trim()))
  }
  return out
}

// ── Гвард ──────────────────────────────────────────────────────────────────────

export const MAX_POINT_CHARS = 240
export const MIN_POINT_WORDS = 3
export const MAX_POINT_WORDS = 40
export const MAX_POINTS = 5

const NUM_RE = /\d+(?:[.,]\d+)*/g
const URL_RE = /\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+/gi
const CODE_SPAN = /`([^`\n]+)`/g
/** Латинская лексема (кириллица её обрывает: «Claude-агент» → «Claude»). */
const LATIN_TOKEN = /[A-Za-z0-9][A-Za-z0-9._/+#-]*[A-Za-z0-9+#]|[A-Za-z]/g

function words(s: string): number {
  return s.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length
}

/** Похоже на имя инструмента/команды/файла: не обычное слово языка пункта. */
function nameLike(token: string, locale: 'ru' | 'en', sentenceStart: boolean): boolean {
  if (!/[A-Za-z]/.test(token)) return false
  if (locale === 'ru') return true // латиница в русском пункте — всегда имя/термин
  if (/[._/+#]/.test(token) || /\d/.test(token)) return true // CLAUDE.md, gpt-4o, /init, C#
  if (/^[A-Z]{2,}$/.test(token)) return true // MCP, API
  if (/^[a-z]+[A-Z]/.test(token) || /[a-z][A-Z]/.test(token)) return true // camelCase, LiteLLM
  if (/^--?[a-z]/.test(token)) return true // --flag
  return /^[A-Z][a-z]/.test(token) && !sentenceStart && token !== 'I'
}

/** Находки гварда по одному пункту пересказа. Пусто — годен. */
export function checkParaphrasePoint(text: string, source: string, locale: 'ru' | 'en', rules: ManifestRule[]): string[] {
  const raw = normalizeEol(source)
  const lower = raw.toLowerCase()
  const full = plain(raw)
  const t = typeof text === 'string' ? text.trim() : ''
  if (!t) return ['пустой пункт']
  const out: string[] = []

  if (t.length > MAX_POINT_CHARS) out.push(`длина ${t.length} > ${MAX_POINT_CHARS} знаков`)
  const w = words(t)
  if (w < MIN_POINT_WORDS || w > MAX_POINT_WORDS) out.push(`слов ${w} вне ${MIN_POINT_WORDS}–${MAX_POINT_WORDS}`)

  if (locale === 'en' && /[Ѐ-ӿ]/.test(t)) out.push('кириллица в EN-пункте')
  if (locale === 'ru' && !/[Ѐ-ӿ]/.test(t)) out.push('в RU-пункте нет кириллицы')

  if (/\*\*|^#|\]\(|^[-*]\s/.test(t)) out.push('markdown-разметка')

  for (const m of t.matchAll(CODE_SPAN)) if (!raw.includes(m[1])) out.push(`инлайн-код \`${m[1]}\` не из источника`)
  const prose = t.replace(CODE_SPAN, ' ')

  const nums = new Set(full.match(NUM_RE) ?? [])
  for (const n of prose.match(NUM_RE) ?? []) if (!nums.has(n)) out.push(`число ${n} не из источника`)

  const urls = new Set((raw.match(URL_RE) ?? []).map(u => u.toLowerCase()))
  for (const u of prose.match(URL_RE) ?? []) if (!urls.has(u.toLowerCase())) out.push(`ссылка ${u} не из источника`)

  // Имена инструментов/команд/файлов: каждое обязано стоять в исходном MDX (регистр не важен).
  let start = true
  for (const m of prose.replace(URL_RE, ' ').matchAll(new RegExp(`${LATIN_TOKEN.source}|[.!?:;—–]`, 'g'))) {
    const tok = m[0]
    if (/^[.!?:;—–]$/.test(tok)) { start = true; continue }
    const bare = tok.replace(/['’]s$/, '')
    if (nameLike(bare, locale, start) && !lower.includes(bare.toLowerCase())) out.push(`имя «${bare}» не из источника`)
    start = false
  }

  // Голос курса: RU-уроки на «ты». «Вы» допустимо, только если та же форма есть в уроке (цитата, пример).
  if (locale === 'ru') {
    for (const m of t.matchAll(/(?<![\p{L}])(вы|вас|вам|вами|ваш\p{L}*)(?![\p{L}])/giu)) {
      const w = m[1].toLowerCase()
      if (!new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, 'iu').test(raw)) { out.push(`обращение на «вы» («${m[1]}»)`); break }
    }
  }

  for (const f of checkManifest(t, rules)) out.push(`манифест: ${f.label} («${f.match}»)`)
  for (const d of lintDehustle(t)) out.push(`de-hustle: «${d}»`)
  return [...new Set(out)]
}

/** Гвард раздела: число пунктов, общая длина против дословных тезисов, каждый пункт. Пусто — годен. */
export function checkParaphraseSection(
  points: string[], node: Pick<OutlineNode, 'points'>, source: string, locale: 'ru' | 'en', rules: ManifestRule[],
): string[] {
  const out: string[] = []
  if (points.length < 1 || points.length > MAX_POINTS) out.push(`пунктов ${points.length} вне 1–${MAX_POINTS}`)
  const verbatim = node.points.reduce((s, p) => s + p.text.length, 0)
  const total = points.reduce((s, p) => s + p.length, 0)
  const limit = Math.round(verbatim * 1.5) + 200
  if (total > limit) out.push(`пересказ ${total} знаков длиннее предела ${limit}`)
  for (const p of points) out.push(...checkParaphrasePoint(p, source, locale, rules))
  return [...new Set(out)]
}

/** Outline для показа: разделы с годным пересказом получают его пункты (origin 'llm'), остальные — дословные.
 *  null — если ни один раздел не пересказан (тогда переключатель «дословно» не нужен). */
export function paraphrasedOutline(
  outline: OutlineNode[], block: ParaphraseBlock | undefined, source: string, locale: 'ru' | 'en', rules: ManifestRule[],
): OutlineNode[] | null {
  if (!block || block.source !== 'paraphrase' || block.pool !== PARAPHRASE_POOL) return null
  const byHash = new Map(block.sections.map(s => [s.sourceHash, s.points]))
  let used = 0
  const map = (nodes: OutlineNode[]): OutlineNode[] => nodes.map(n => {
    const pts = n.points.length ? byHash.get(sectionHash(n)) : undefined
    const ok = pts && checkParaphraseSection(pts, n, source, locale, rules).length === 0
    if (ok) used++
    return {
      heading: n.heading,
      points: ok ? pts!.map(text => ({ text, origin: 'llm' as const })) : n.points,
      children: map(n.children),
    }
  })
  const out = map(outline)
  return used ? out : null
}
