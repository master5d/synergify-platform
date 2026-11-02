import { visit, SKIP } from 'unist-util-visit'
import type { Root } from 'mdast'
import type { Concept, Locale } from './types'
import { parseMdx } from './md'

export const BOUNDARY_BEFORE = '(?<![A-Za-zА-Яа-яЁё])'
export const BOUNDARY_AFTER = '(?![A-Za-zА-Яа-яЁё])'

const sourceUnit = /^\d{2}-[a-z0-9-]+\/u\d+-[a-z0-9-]+$/
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const skipped = new Set(['code', 'link', 'linkReference', 'heading', 'html'])

export function validateConcepts(concepts: Concept[]): string[] {
  const errors: string[] = []
  const ids = new Set<string>()
  const terms = new Map<Locale, Set<string>>([
    ['ru', new Set<string>()],
    ['en', new Set<string>()],
  ])

  for (const concept of concepts) {
    if (!idPattern.test(concept.id)) errors.push(`id «${concept.id}»: не kebab-case`)
    if (ids.has(concept.id)) errors.push(`id «${concept.id}»: повтор`)
    ids.add(concept.id)

    for (const locale of ['ru', 'en'] as const) {
      if (!concept.term[locale]) errors.push(`term.${locale}: пусто у «${concept.id}»`)
      const termKey = concept.term[locale].toLocaleLowerCase()
      if (terms.get(locale)!.has(termKey)) errors.push(`term.${locale} «${concept.term[locale]}»: повтор`)
      terms.get(locale)!.add(termKey)
      if (!concept.short[locale]) errors.push(`short.${locale}: пусто у «${concept.id}»`)
      if (concept.short[locale].length > 300) errors.push(`short.${locale} у «${concept.id}»: больше 300 знаков`)
      const form = concept.forms[locale]
      if (!form.source.startsWith(BOUNDARY_BEFORE) || !form.source.endsWith(BOUNDARY_AFTER)) {
        errors.push(`forms.${locale} у «${concept.id}»: нет границ слова`)
      }
      if (form.global || form.sticky) errors.push(`forms.${locale} у «${concept.id}»: запрещённый флаг g/y`)
    }

    if (!sourceUnit.test(concept.source.unit)) errors.push(`source.unit «${concept.source.unit}»: неверный формат`)
  }

  for (const concept of concepts) {
    for (const related of concept.related) {
      if (!ids.has(related)) errors.push(`related «${related}» у «${concept.id}»: неизвестный id`)
      if (related === concept.id) errors.push(`related «${concept.id}» у «${concept.id}»: ссылка на себя`)
    }
  }
  return errors
}

type TextNode = { type: 'text'; value: string }
type InlineCodeNode = { type: 'inlineCode'; value: string }
type LinkNode = { type: 'link'; title?: string | null; url: string; children: Array<TextNode | InlineCodeNode> }
type ParentNode = { children: Array<TextNode | InlineCodeNode | LinkNode> }

type Match = { start: number; end: number; concept: Concept; order: number }

function regexMatches(form: RegExp, text: string, concept: Concept, order: number): Match[] {
  const flags = form.flags.includes('g') ? form.flags : `${form.flags}g`
  const matcher = new RegExp(form.source, flags)
  return [...text.matchAll(matcher)].flatMap((match) => {
    const start = match.index ?? 0
    return [{ start, end: start + match[0].length, concept, order }]
  })
}

function selectMatches(matches: Match[], linked: Set<string>): Match[] {
  const selected: Match[] = []
  for (const match of matches.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start) || a.order - b.order)) {
    if (linked.has(match.concept.id) || selected.some((item) => match.start < item.end && item.start < match.end)) continue
    selected.push(match)
    linked.add(match.concept.id)
  }
  return selected.sort((a, b) => a.start - b.start)
}

function linkedTextNode(node: TextNode, matches: Match[], href: (id: string) => string | null): Array<TextNode | LinkNode> {
  const result: Array<TextNode | LinkNode> = []
  let cursor = 0
  for (const match of matches) {
    if (match.start > cursor) result.push({ type: 'text', value: node.value.slice(cursor, match.start) })
    const url = href(match.concept.id)
    if (url) result.push({ type: 'link', title: null, url, children: [{ type: 'text', value: node.value.slice(match.start, match.end) }] })
    else result.push({ type: 'text', value: node.value.slice(match.start, match.end) })
    cursor = match.end
  }
  if (cursor < node.value.length) result.push({ type: 'text', value: node.value.slice(cursor) })
  return result
}

export function linkFirstMentions(tree: Root, opts: { concepts: Concept[]; locale: Locale; unitKey: string | null; href(conceptId: string): string | null }): void {
  const linked = new Set<string>()
  const candidates = opts.concepts.filter((concept) => concept.source.unit !== opts.unitKey)
  visit(tree, (node, index, parent) => {
    if (skipped.has(node.type)) return SKIP
    if (!parent || index == null || !('children' in parent)) return
    if (node.type === 'inlineCode') {
      const concept = candidates.find((item) => !linked.has(item.id) && new RegExp(`^(?:${item.forms[opts.locale].source})$`, item.forms[opts.locale].flags.replace(/[gy]/g, '')).test(node.value))
      if (!concept || !opts.href(concept.id)) return
      const replacement: LinkNode = { type: 'link', title: null, url: opts.href(concept.id)!, children: [node as InlineCodeNode] }
      const children = (parent as ParentNode).children
      children.splice(index, 1, replacement)
      linked.add(concept.id)
      return [SKIP, index + 1]
    }
    if (node.type !== 'text') return
    const textNode = node as TextNode
    const matches = selectMatches(candidates.flatMap((concept, order) => regexMatches(concept.forms[opts.locale], textNode.value, concept, order)), linked)
    if (!matches.length) return
    const children = (parent as ParentNode).children
    children.splice(index, 1, ...linkedTextNode(textNode, matches, opts.href))
    return [SKIP, index + matches.length + 1]
  })
}

function nodeText(node: { type: string; value?: string; children?: Array<{ type: string; value?: string; children?: Array<{ type: string; value?: string }> }> }): string {
  if (node.type === 'code') return ''
  if (typeof node.value === 'string') return node.value
  return (node.children ?? []).map(nodeText).join('')
}

export function plainText(src: string): string {
  const tree = parseMdx(src)
  const blocks: string[] = []
  visit(tree, (node) => {
    if (node.type === 'paragraph' || node.type === 'heading' || node.type === 'tableCell') {
      blocks.push(nodeText(node as never))
      return SKIP
    }
    if (node.type === 'code') return SKIP
  })
  return blocks.join(' ').replace(/\s+/g, ' ').trim()
}

export function findOccurrences(concepts: Concept[], locale: Locale, units: { key: string; text: string }[]): Map<string, string[]> {
  const result = new Map<string, string[]>()
  for (const concept of concepts) {
    const keys = units.filter((unit) => regexMatches(concept.forms[locale], unit.text, concept, 0).length > 0).map((unit) => unit.key)
    result.set(concept.id, keys)
  }
  return result
}
