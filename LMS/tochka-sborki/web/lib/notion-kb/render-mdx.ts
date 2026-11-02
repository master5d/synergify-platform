import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'
import type { Concept, LinkResolver, Locale } from './types'
import type { SelfCheckItem } from '../content'
import { callout, inlineMd, parseMarkdown, parseMdx, toNotionMarkdown, toggle } from './md'
import { linkFirstMentions } from './concepts'
import { KEY } from './keys'
import { PHASE_META, phaseMarker } from '../../components/phase-chrome'
import { STRINGS } from './strings'

export type RenderCtx = { locale: Locale; unitKey: string | null; checks: SelfCheckItem[]; siteUrl: string; links: LinkResolver; domain: string; concepts: Concept[] }
export type ComponentRule = 'phase' | 'self-check' | 'os-block' | 'omit' | 'site-link'

export const COMPONENT_RULES: Record<string, ComponentRule> = {
  Phase: 'phase', SelfCheck: 'self-check', OsBlock: 'os-block', OsToggle: 'omit',
  NoAiCheck: 'site-link', InterestExample: 'site-link', FadedExample: 'site-link', RolePlay: 'site-link',
  PromptAnatomy: 'site-link', WillWont: 'site-link', Walkthrough: 'site-link', StackMatrix: 'site-link', ModuleSurvey: 'site-link',
  figure: 'site-link',
}

export class RenderError extends Error {
  line: number | null
  constructor(message: string, line: number | null = null) {
    super(`${message} (строка ${line ?? '?'})`)
    this.name = 'RenderError'
    this.line = line
  }
}

export function withUtm(url: string): string {
  const separator = url.includes('?') ? (url.endsWith('?') || url.endsWith('&') ? '' : '&') : '?'
  return `${url}${separator}utm_source=notion-kb`
}

export function resolveHref(href: string, ctx: Pick<RenderCtx, 'links' | 'domain'>): string {
  if (!href.startsWith('/')) return href
  const hash = href.indexOf('#')
  const path = hash >= 0 ? href.slice(0, hash) : href
  const suffix = hash >= 0 ? href.slice(hash) : ''
  const match = path.match(/^\/(en\/)?lessons\/([^/]+)(?:\/([^/]+))?\/$/)
  const page = path.match(/^\/(en\/)?(cheatsheet|exercises|roadmap)\/$/)
  const locale: Locale = match?.[1] || page?.[1] ? 'en' : 'ru'
  const key = match ? (match[3] ? KEY.unit(locale, match[2], match[3]) : KEY.module(locale, match[2])) : page ? KEY.page(locale, page[2]) : null
  const notion = key ? ctx.links.page(key) : null
  if (notion) return notion
  return withUtm(`${ctx.domain}${path}`) + suffix
}

type Node = { type: string; value?: string; name?: string; attributes?: Array<{ type: string; name: string; value?: unknown }>; children?: Node[]; depth?: number; url?: string; position?: { start: { line: number } } }
const lineOf = (node: Node) => node.position?.start.line ?? null
const attr = (node: Node, name: string): string | null => {
  const found = node.attributes?.find((item) => item.name === name)
  return typeof found?.value === 'string' ? found.value : null
}
const mdRoot = (src: string): Node[] => parseMarkdown(src).children as unknown as Node[]

function siteNode(ctx: RenderCtx): Node { return { type: 'html', value: callout('🧭', `${STRINGS[ctx.locale].interactive}: [${STRINGS[ctx.locale].open}](${ctx.siteUrl})`) } }

function replaceEarly(nodes: Node[], ctx: RenderCtx): Node[] {
  const result: Node[] = []
  for (const node of nodes) {
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const rule = node.name ? COMPONENT_RULES[node.name] : undefined
      if (rule === 'omit') continue
      if (rule === 'site-link') {
        if (node.type === 'mdxJsxTextElement') result.push({ type: 'link', url: ctx.siteUrl, children: [{ type: 'text', value: STRINGS[ctx.locale].open }] })
        else result.push(siteNode(ctx))
        continue
      }
    }
    if (node.children) node.children = replaceEarly(node.children, ctx)
    result.push(node)
  }
  return result
}

function processNodes(nodes: Node[], ctx: RenderCtx): Node[] {
  const result: Node[] = []
  for (const node of nodes) {
    if (node.type === 'mdxjsEsm' || node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') throw new RenderError('Неподдерживаемое выражение', lineOf(node))
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const name = node.name ?? ''
      const rule = COMPONENT_RULES[name]
      if (!rule) throw new RenderError(`Неизвестный компонент ${name}`, lineOf(node))
      if (rule === 'omit' || rule === 'site-link') throw new RenderError(`Компонент ${name} должен был замениться до привязки понятий`, lineOf(node))
      if (node.type === 'mdxJsxTextElement') throw new RenderError(`Компонент ${name} внутри текста не поддержан`, lineOf(node))
      const children = processNodes(node.children ?? [], ctx)
      if (rule === 'phase') {
        const type = attr(node, 'type') as keyof typeof PHASE_META
        const meta = PHASE_META[type]
        if (!meta) throw new RenderError(`Неизвестный type ${type}`, lineOf(node))
        result.push(...mdRoot(`## ${meta.icon} ${meta.label[ctx.locale]}`))
        const marker = phaseMarker(type, ctx.locale)
        if (marker) result.push(...mdRoot(`*${marker}*`))
        result.push(...children)
      } else if (rule === 'self-check') {
        const id = attr(node, 'id')
        const check = ctx.checks.find((item) => item.id === id)
        if (!check) throw new RenderError(`Неизвестный SelfCheck ${id}`, lineOf(node))
        const answer = check.options[check.answer]
        result.push(...mdRoot(toggle(`${inlineMd(`🧩 ${STRINGS[ctx.locale].selfCheck}: ${check.question}`)}`, `${check.options.map((option, i) => `${i + 1}. ${option}`).join('\n')}\n\n${toggle(STRINGS[ctx.locale].answer, `**${answer}** — ${check.explain}`)}`)))
      } else if (rule === 'os-block') {
        const os = attr(node, 'os')
        const title = os === 'mac' ? '🍎 Mac' : os === 'windows' ? '🪟 Windows' : null
        if (!title) throw new RenderError(`Неизвестный os ${os}`, lineOf(node))
        const content = toNotionMarkdown({ type: 'root', children } as never).trim()
        result.push({ type: 'html', value: toggle(title, content) })
      }
      continue
    }
    if (node.children) node.children = processNodes(node.children, ctx)
    result.push(node)
  }
  return result
}

export function renderMdx(src: string, ctx: RenderCtx): string {
  const tree = parseMdx(src)
  visit(tree, 'heading', (node) => { node.depth = Math.min((node.depth ?? 1) + 1, 4) as typeof node.depth })
  visit(tree, 'link', (node) => { node.url = resolveHref(node.url, ctx) })
  tree.children = replaceEarly(tree.children as unknown as Node[], ctx) as never
  linkFirstMentions(tree, { concepts: ctx.concepts, locale: ctx.locale, unitKey: ctx.unitKey, href: (id) => ctx.links.page(KEY.concept(ctx.locale, id)) })
  tree.children = processNodes(tree.children as unknown as Node[], ctx) as never
  return toNotionMarkdown(tree)
}
