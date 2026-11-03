import { unified } from 'unified'
import remarkGfm from 'remark-gfm'
import remarkMdx from 'remark-mdx'
import remarkParse from 'remark-parse'
import { gfmToMarkdown } from 'mdast-util-gfm'
import { defaultHandlers, toMarkdown } from 'mdast-util-to-markdown'
import type { Root } from 'mdast'

const markdownParser = unified().use(remarkParse).use(remarkGfm)
const mdxParser = unified().use(remarkParse).use(remarkMdx).use(remarkGfm)

export function parseMdx(src: string): Root {
  return mdxParser.parse(src)
}

export function parseMarkdown(src: string): Root {
  return markdownParser.parse(src)
}

// Notion превращает в ссылку http://AGENTS.md имя файла, чьё расширение — ещё и домен верхнего уровня (проба Task 11,
// 2026-11-02: обычное, экранированное `\.` и `&#46;` написание линкуются, inline-код — нет). Такие имена идут inline-кодом.
// Расширения — только пересечение «файл ∩ TLD»; настоящие адреса сайтов (claude.ai) остаются ссылками.
const FILE_AS_TLD = /[\w~./-]*[\w-]\.(?:md|sh|py|rs|pl|cc|so|zip|mov)(?![\w])/g

export function toNotionMarkdown(tree: Root): string {
  return toMarkdown(tree, {
    bullet: '-',
    rule: '-',
    emphasis: '*',
    strong: '*',
    fences: true,
    listItemIndent: 'one',
    extensions: [gfmToMarkdown()],
    // Notion читает забор без языка как javascript (проба Task 11, 2026-11-02); `text` он хранит как простой текст.
    handlers: {
      text: (node, parent, state, info) => {
        const value: string = node.value
        // Внутри явной ссылки Notion сам адрес не подставляет: подпись остаётся как есть.
        const matches = parent?.type === 'link' || parent?.type === 'linkReference' ? [] : [...value.matchAll(FILE_AS_TLD)]
        if (matches.length === 0) return defaultHandlers.text(node, parent, state, info)
        // Соседи фрагмента — обратная кавычка кода или край узла: иначе safe() экранирует краевые пробелы как &#x20;.
        const plain = (from: number, to: number, before: string, after: string) =>
          from < to ? defaultHandlers.text({ ...node, value: value.slice(from, to) }, parent, state, { ...info, before, after }) : ''
        let out = ''
        let last = 0
        for (const match of matches) {
          const index = match.index ?? 0
          out += plain(last, index, last === 0 ? info.before : '`', '`')
          out += '`' + match[0] + '`'
          last = index + match[0].length
        }
        return out + plain(last, value.length, '`', info.after)
      },
      code: (node, parent, state, info) => defaultHandlers.code({ ...node, lang: node.lang ?? 'text' }, parent, state, info)
    }
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
