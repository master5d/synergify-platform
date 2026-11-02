import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Root } from 'mdast'

const markdownParser = unified().use(remarkParse).use(remarkGfm)
const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm)

export function parseMdx(src: string): Root {
  return mdxParser.parse(src)
}

export function parseMarkdown(src: string): Root {
  return markdownParser.parse(src)
}

export function toNotionMarkdown(tree: Root): string {
  return toMarkdown(tree, {
    bullet: '-',
    rule: '-',
    emphasis: '*',
    strong: '*',
    fences: true,
    listItemIndent: 'one',
    extensions: [gfmToMarkdown()]
  }).replace(/\n$/, '')
}

export function inlineMd(text: string): string {
  return toNotionMarkdown(parseMarkdown(text))
}

export function toggle(titleMd: string, childrenMd: string): string {
  return `<toggle>\n${titleMd}\n\n${childrenMd}\n</toggle>`
}

export function callout(icon: string, bodyMd: string): string {
  return `<callout icon="${icon}">\n${bodyMd}\n</callout>`
}

export function pageTag(url: string, title: string): string {
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<page url="${url}">${escapedTitle}</page>`
}

export const TABLE_OF_CONTENTS = '<table-of-contents />'

export function notionUrl(id: string): string {
  return `https://www.notion.so/${id.replaceAll('-', '')}`
}

export function anchorUrl(pageUrl: string, blockId: string): string {
  return `${pageUrl}#${blockId.replaceAll('-', '')}`
}
