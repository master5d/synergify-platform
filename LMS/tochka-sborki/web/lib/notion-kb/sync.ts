import { createHash } from 'node:crypto'
import { NotionError } from './client'
import { notionUrl } from './md'
import { KEY } from './keys'
import { STRINGS } from './strings'
import { decodeManifest, encodeManifest, EMPTY_MANIFEST, MANIFEST_TITLE, type Manifest } from './manifest'
import type { Concept, Locale, LinkResolver, NotionApi, SitePage } from './types'

export function contentHash(title: string, md: string): string {
  return createHash('sha256').update(`${title}\n${md}`).digest('hex').slice(0, 16)
}

export function stampLine(locale: Locale, sha: string, date: string): string {
  return `*${STRINGS[locale].stamp}: ${date} · ${sha.slice(0, 7)}*`
}

export type SyncOptions = { sha: string; date: string; only?: string; log(line: string): void }
export type SyncReport = { created: number; adopted: number; updated: number; retitled: number; trashed: number; unchanged: number; anchorMisses: string[] }

function sameTitle(a: string, b: string): boolean {
  return a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim()
}

function localeOf(key: string): Locale {
  return key === KEY.root || key.startsWith('ru/') ? 'ru' : 'en'
}

function cloneManifest(manifest: Manifest): Manifest {
  return { v: 1, pages: { ...manifest.pages }, anchors: { ...manifest.anchors } }
}

export async function syncSite(api: NotionApi, pages: SitePage[], concepts: Concept[], servicePageId: string, opts: SyncOptions): Promise<SyncReport> {
  const report: SyncReport = { created: 0, adopted: 0, updated: 0, retitled: 0, trashed: 0, unchanged: 0, anchorMisses: [] }
  let manifestId: string
  let manifest = cloneManifest(EMPTY_MANIFEST)
  let manifestChanged = false
  const serviceChildren = await api.listChildren(servicePageId)
  const manifestChild = serviceChildren.find((child) => child.type === 'child_page' && child.text === MANIFEST_TITLE)
  if (manifestChild) {
    manifestId = manifestChild.id
    const result = await api.getMarkdown(manifestId)
    if (result.truncated) throw new Error('манифест обрезан')
    manifest = decodeManifest(result.markdown)
  } else {
    const created = await api.createPage(servicePageId, MANIFEST_TITLE)
    manifestId = created.id
    opts.log(`create ${MANIFEST_TITLE}`)
    manifestChanged = true
  }

  const pageByKey = new Map(pages.map((page) => [page.key, page]))
  const childrenCache = new Map<string, Awaited<ReturnType<NotionApi['listChildren']>>>()
  const children = async (parent: string, fresh = false) => {
    if (!fresh && childrenCache.has(parent)) return childrenCache.get(parent)!
    const result = await api.listChildren(parent)
    if (!fresh) childrenCache.set(parent, result)
    return result
  }
  const findOrCreate = async (page: SitePage, parentId: string): Promise<{ id: string; adopted: boolean }> => {
    const candidates = (await children(parentId)).filter((child) => child.type === 'child_page' && child.text === page.title && !Object.values(manifest.pages).some((entry) => entry.id === child.id))
    if (candidates[0]) return { id: candidates[0].id, adopted: true }
    try {
      const created = await api.createPage(parentId, page.title)
      opts.log(`create ${page.title}`)
      return { id: created.id, adopted: false }
    } catch (error) {
      if (!(error instanceof NotionError) || error.code !== 'uncertain') throw error
      const after = (await children(parentId, true)).find((child) => child.type === 'child_page' && child.text === page.title && !Object.values(manifest.pages).some((entry) => entry.id === child.id))
      if (after) {
        opts.log(`adopt ${page.key}`)
        return { id: after.id, adopted: true }
      }
      try {
        const created = await api.createPage(parentId, page.title)
        opts.log(`create ${page.title}`)
        return { id: created.id, adopted: false }
      } catch (second) {
        if (second instanceof NotionError && second.code === 'uncertain') throw new Error(`создание ${page.key} не подтверждено: ${second.message}`)
        throw second
      }
    }
  }

  for (const page of pages) {
    if (manifest.pages[page.key]) continue
    const parentId = page.parentKey ? manifest.pages[page.parentKey]?.id : servicePageId
    if (!parentId) throw new Error(`родитель страницы ${page.key} не найден`)
    const result = await findOrCreate(page, parentId)
    manifest.pages[page.key] = { id: result.id, p: page.parentKey, th: contentHash(page.title, ''), ch: null }
    manifestChanged = true
    if (result.adopted) report.adopted += 1
    else report.created += 1
  }

  if (!opts.only) {
    const current = new Set(pages.map((page) => page.key))
    const removed = Object.keys(manifest.pages).filter((key) => !current.has(key))
    const removedSet = new Set(removed)
    for (const key of removed) {
      const entry = manifest.pages[key]
      if (entry.p && removedSet.has(entry.p)) continue
      await api.trashPage(entry.id)
      opts.log(`trash ${key}`)
      report.trashed += 1
    }
    if (removed.length) {
      for (const key of removed) delete manifest.pages[key]
      for (const anchor of Object.keys(manifest.anchors)) {
        const [locale, concept] = anchor.split('/')
        if (removedSet.has(KEY.concept(locale as Locale, concept))) delete manifest.anchors[anchor]
      }
      manifestChanged = true
    }
  }

  const resolver = (): LinkResolver => ({
    page: (key) => manifest.pages[key] ? notionUrl(manifest.pages[key].id) : null,
    anchor: (locale, conceptId) => manifest.anchors[`${locale}/${conceptId}`] ?? null,
  })
  const written = new Set<string>()
  const writePage = async (page: SitePage, includeStamp = true) => {
    const entry = manifest.pages[page.key]
    if (!entry) return
    const titleChanged = entry.th !== contentHash(page.title, '')
    if (titleChanged) {
      try { await api.updateTitle(entry.id, page.title) } catch (error) { throw new Error(`запись ${page.key} не удалась: ${error instanceof Error ? error.message : String(error)}`) }
      opts.log(`title ${page.key}`)
      entry.th = contentHash(page.title, '')
      report.retitled += 1
      manifestChanged = true
    }
    const locale = localeOf(page.key)
    const body = page.markdown(resolver())
    const markdown = includeStamp ? `${body}\n\n${stampLine(locale, opts.sha, opts.date)}` : body
    const currentMarkdown = (await api.getMarkdown(entry.id)).markdown
    const currentBody = currentMarkdown.replace(/\n\n\*[^\n]+\*\s*$/, '')
    if (contentHash(page.title, currentBody) === contentHash(page.title, body)) {
      report.unchanged += 1
      return
    }
    const hash = contentHash(page.title, markdown)
    if (entry.ch === hash) { report.unchanged += 1; return }
    try { await api.replaceMarkdown(entry.id, markdown) } catch (error) { throw new Error(`запись ${page.key} не удалась: ${error instanceof Error ? error.message : String(error)}`) }
    opts.log(`replace ${page.key}`)
    entry.ch = hash
    report.updated += 1
    manifestChanged = true
    written.add(page.key)
  }

  for (const page of pages.filter((item) => item.stage === 'content' && item.key !== KEY.root)) await writePage(page)

  for (const concept of concepts) for (const locale of ['ru', 'en'] as const) {
    const unitKey = KEY.unit(locale, ...concept.source.unit.split('/') as [string, string])
    if (!manifest.pages[unitKey] || (!written.has(unitKey) && manifest.anchors[`${locale}/${concept.id}`])) continue
    const blocks = await api.listChildren(manifest.pages[unitKey].id)
    const heading = blocks.find((block) => block.type.startsWith('heading_') && sameTitle(block.text, concept.source.heading[locale]))
    if (heading) manifest.anchors[`${locale}/${concept.id}`] = heading.id
    else {
      delete manifest.anchors[`${locale}/${concept.id}`]
      report.anchorMisses.push(`${locale}/${concept.id}`)
    }
    manifestChanged = true
  }
  for (const page of pages.filter((item) => item.stage === 'concept')) await writePage(page)

  const root = pages.find((page) => page.key === KEY.root)
  if (root) {
    const entry = manifest.pages[root.key]
    const markdown = `${root.markdown(resolver())}\n\n${stampLine('ru', opts.sha, opts.date)}`
    const hash = contentHash(root.title, markdown)
    if (entry.ch !== hash) {
      try { await api.replaceMarkdown(entry.id, markdown) } catch (error) { throw new Error(`запись ${root.key} не удалась: ${error instanceof Error ? error.message : String(error)}`) }
      opts.log(`replace ${root.key}`)
      entry.ch = hash
      report.updated += 1
      manifestChanged = true
    } else report.unchanged += 1
  }

  if (manifestChanged) {
    const md = encodeManifest(manifest)
    await api.replaceMarkdown(manifestId, md)
    opts.log(`replace ${MANIFEST_TITLE}`)
  }
  const rootId = manifest.pages[KEY.root]?.id
  if (rootId && !(await verifyRootStamp(api, rootId, opts.sha.slice(0, 7)))) throw new Error(`штамп корня не совпал с ${opts.sha.slice(0, 7)}`)
  return report
}

export async function verifyRootStamp(api: NotionApi, rootId: string, sha7: string): Promise<boolean> {
  const markdown = (await api.getMarkdown(rootId)).markdown
  const lines = markdown.split('\n').map((line) => line.trim()).filter(Boolean)
  return lines.length > 0 && lines[lines.length - 1].includes(sha7)
}
