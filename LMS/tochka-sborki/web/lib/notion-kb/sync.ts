import { createHash } from 'node:crypto'
import { NotionError } from './client'
import { notionUrl } from './md'
import { KEY } from './keys'
import { STRINGS } from './strings'
import { decodeManifest, encodeManifest, EMPTY_MANIFEST, MANIFEST_TITLE } from './manifest'
import type { Manifest } from './manifest'
import type { Concept, Locale, LinkResolver, NotionApi, SitePage } from './types'

export function contentHash(title: string, md: string): string {
  return createHash('sha256').update(`${title}\n${md}`).digest('hex').slice(0, 16)
}

export function stampLine(locale: Locale, sha: string, date: string): string {
  return `*${STRINGS[locale].stamp}: ${date} · ${sha.slice(0, 7)}*`
}

export type SyncOptions = { sha: string; date: string; only?: string; log(line: string): void; sleep?: (ms: number) => Promise<void> }
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

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export async function syncSite(api: NotionApi, pages: SitePage[], concepts: Concept[], servicePageId: string, opts: SyncOptions): Promise<SyncReport> {
  const report: SyncReport = { created: 0, adopted: 0, updated: 0, retitled: 0, trashed: 0, unchanged: 0, anchorMisses: [] }
  let manifestId: string
  let manifest = cloneManifest(EMPTY_MANIFEST)
  let dirty = false
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
  }
  const saveManifest = async () => {
    if (!dirty) return
    await api.replaceMarkdown(manifestId, encodeManifest(manifest))
    opts.log(`replace ${MANIFEST_TITLE}`)
    dirty = false
  }
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))
  const pending = new Set(Object.keys(manifest.pages).filter((key) => manifest.pages[key].ch === null))

  const childrenCache = new Map<string, Awaited<ReturnType<NotionApi['listChildren']>>>()
  const children = async (parent: string, fresh = false) => {
    if (!fresh && childrenCache.has(parent)) return childrenCache.get(parent)!
    const result = await api.listChildren(parent)
    if (!fresh) childrenCache.set(parent, result)
    return result
  }
  const known = (id: string) => Object.values(manifest.pages).some((entry) => entry.id === id)
  const orphan = (list: Awaited<ReturnType<NotionApi['listChildren']>>, title: string) => list.find((child) => child.type === 'child_page' && child.text === title && !known(child.id))
  const findOrCreate = async (page: SitePage, parentId: string): Promise<{ id: string; adopted: boolean }> => {
    const cached = orphan(await children(parentId), page.title)
    if (cached) {
      opts.log(`adopt ${page.key}`)
      return { id: cached.id, adopted: true }
    }
    try {
      const created = await api.createPage(parentId, page.title)
      opts.log(`create ${page.key}`)
      return { id: created.id, adopted: false }
    } catch (error) {
      if (!(error instanceof NotionError) || error.code !== 'uncertain') throw error
      for (const delay of [0, 2000, 4000, 8000]) {
        if (delay) await sleep(delay)
        const after = orphan(await children(parentId, true), page.title)
        if (after) {
          opts.log(`adopt ${page.key}`)
          return { id: after.id, adopted: true }
        }
      }
      try { await saveManifest() } catch { /* исходная ошибка важнее */ }
      throw new Error(`создание ${page.key} не подтверждено: страница могла быть создана, следующий прогон примет её`)
    }
  }

  try {
    for (const page of pages) {
      if (manifest.pages[page.key]) {
        if (pending.has(page.key)) {
          opts.log(`adopt ${page.key}`)
          report.adopted += 1
        }
        continue
      }
      const parentId = page.parentKey ? manifest.pages[page.parentKey]?.id : servicePageId
      if (!parentId) throw new Error(`родитель страницы ${page.key} не найден`)
      const result = await findOrCreate(page, parentId)
      manifest.pages[page.key] = { id: result.id, p: page.parentKey, th: contentHash(page.title, ''), ch: null }
      dirty = true
      if (result.adopted) report.adopted += 1
      else report.created += 1
    }
  } catch (error) {
    try { await saveManifest() } catch { /* исходная ошибка важнее */ }
    throw error
  }
  await saveManifest()

  if (!opts.only) {
    const current = new Set(pages.map((page) => page.key))
    const removed = Object.keys(manifest.pages).filter((key) => !current.has(key))
    const removedSet = new Set(removed)
    for (const key of removed) {
      const entry = manifest.pages[key]
      const manual = (await api.listChildren(entry.id)).find((child) => child.type === 'child_page' && !known(child.id))
      if (manual) throw new Error(`ручная подстраница «${manual.text}» под убираемой страницей ${key} — перенеси или удали её вручную; прогон остановлен до записи в корзину`)
    }
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
      dirty = true
      await saveManifest()
    }
  }

  const resolver = (): LinkResolver => ({
    page: (key) => manifest.pages[key] ? notionUrl(manifest.pages[key].id) : null,
    anchor: (locale, conceptId) => manifest.anchors[`${locale}/${conceptId}`] ?? null,
  })
  const written = new Set<string>()
  const writePage = async (page: SitePage) => {
    const entry = manifest.pages[page.key]
    const body = page.markdown(resolver())
    const stamped = `${body}\n\n${stampLine(localeOf(page.key), opts.sha, opts.date)}`
    const hash = page.key === KEY.root ? contentHash(page.title, stamped) : contentHash(page.title, body)
    let wrote = false
    try {
      if (entry.th !== contentHash(page.title, '')) {
        await api.updateTitle(entry.id, page.title)
        opts.log(`title ${page.key}`)
        entry.th = contentHash(page.title, '')
        report.retitled += 1
        dirty = true
        wrote = true
      }
      if (entry.ch !== hash) {
        await api.replaceMarkdown(entry.id, stamped)
        opts.log(`replace ${page.key}`)
        entry.ch = hash
        report.updated += 1
        dirty = true
        wrote = true
        written.add(page.key)
      }
    } catch (error) {
      throw new Error(`запись ${page.key} не удалась: ${messageOf(error)}`)
    }
    if (!wrote) report.unchanged += 1
  }

  for (const page of pages.filter((item) => item.stage === 'content' && item.key !== KEY.root)) await writePage(page)

  for (const concept of concepts) for (const locale of ['ru', 'en'] as const) {
    const unitKey = KEY.unit(locale, ...concept.source.unit.split('/') as [string, string])
    const anchorKey = `${locale}/${concept.id}`
    if (!manifest.pages[unitKey] || (!written.has(unitKey) && manifest.anchors[anchorKey])) continue
    const blocks = await api.listChildren(manifest.pages[unitKey].id)
    const heading = blocks.find((block) => block.type.startsWith('heading_') && sameTitle(block.text, concept.source.heading[locale]))
    if (heading) {
      if (manifest.anchors[anchorKey] !== heading.id) {
        manifest.anchors[anchorKey] = heading.id
        dirty = true
      }
    } else {
      if (anchorKey in manifest.anchors) {
        delete manifest.anchors[anchorKey]
        dirty = true
      }
      report.anchorMisses.push(anchorKey)
    }
  }
  for (const page of pages.filter((item) => item.stage === 'concept')) await writePage(page)

  const root = pages.find((page) => page.key === KEY.root)
  if (root) await writePage(root)

  await saveManifest()
  const rootId = manifest.pages[KEY.root]?.id
  if (rootId && !(await verifyRootStamp(api, rootId, opts.sha.slice(0, 7)))) throw new Error(`штамп корня не совпал с ${opts.sha.slice(0, 7)}`)
  return report
}

export async function verifyRootStamp(api: NotionApi, rootId: string, sha7: string): Promise<boolean> {
  const markdown = (await api.getMarkdown(rootId)).markdown
  const lines = markdown.split('\n').map((line) => line.trim()).filter(Boolean)
  return lines.length > 0 && lines[lines.length - 1].includes(sha7)
}
