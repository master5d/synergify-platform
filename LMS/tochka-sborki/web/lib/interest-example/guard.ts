// lib/interest-example/guard.ts
// Гвард пересказанного примера: годен ли ответ модели к показу ученику. Чистая функция,
// общая для воркера (перед кэшем) и клиента (перед показом). Относительные импорты — её тянет воркер.
// Пустой список находок = годен. Любая находка = показываем общий пример.
import { checkManifest, type ManifestRule } from '../authoring/manifest'
import { lintDehustle } from '../authoring/dehustle'

export const MIN_LENGTH_RATIO = 0.6
export const MAX_LENGTH_RATIO = 1.6

const CODE_SPAN = /`([^`\n]+)`/g
const NUMBER = /\d+(?:[.,]\d+)*/g
const URL_RE = /\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+/gi

export function paragraphsOf(text: string): string[] {
  return text.split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean)
}

function codeSpans(text: string): string[] {
  return [...text.matchAll(CODE_SPAN)].map(m => m[1]).sort()
}

function withoutCode(text: string): string {
  return text.replace(CODE_SPAN, ' ')
}

export function checkInterestExample(source: string, candidate: string, rules: ManifestRule[]): string[] {
  const out: string[] = []
  const src = source.trim()
  const cand = typeof candidate === 'string' ? candidate.trim() : ''
  if (!cand) return ['пустой пример']

  const ratio = cand.length / Math.max(1, src.length)
  if (ratio < MIN_LENGTH_RATIO || ratio > MAX_LENGTH_RATIO) out.push(`длина ×${ratio.toFixed(2)} вне ${MIN_LENGTH_RATIO}–${MAX_LENGTH_RATIO}`)

  const ps = paragraphsOf(src).length
  const pc = paragraphsOf(cand).length
  if (ps !== pc) out.push(`абзацев ${pc}, в исходнике ${ps}`)

  // Команды и код переносятся дословно: тот же набор инлайн-кодов, ни больше ни меньше.
  if (codeSpans(src).join('\u0000') !== codeSpans(cand).join('\u0000')) out.push('инлайн-код изменён')

  // Цифры не выдумываются: каждое число вне кода обязано стоять в исходнике.
  const srcNums = new Set(withoutCode(src).match(NUMBER) ?? [])
  const newNums = (withoutCode(cand).match(NUMBER) ?? []).filter(n => !srcNums.has(n))
  if (newNums.length) out.push(`новые числа: ${[...new Set(newNums)].join(', ')}`)

  const srcUrls = new Set((src.match(URL_RE) ?? []).map(u => u.toLowerCase()))
  const newUrls = (cand.match(URL_RE) ?? []).filter(u => !srcUrls.has(u.toLowerCase()))
  if (newUrls.length) out.push(`новые ссылки: ${newUrls.join(', ')}`)

  for (const f of checkManifest(cand, rules)) out.push(`манифест: ${f.label} («${f.match}»)`)
  for (const t of lintDehustle(cand)) out.push(`de-hustle: «${t}»`)
  return out
}
