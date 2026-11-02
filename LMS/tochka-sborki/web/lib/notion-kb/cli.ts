import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getAllModules, getPageContent, getUnitContent } from '../content'
import { PACK_SLUG } from '../pack'
import { checkContent } from './check'
import { createNotionClient, NotionError } from './client'
import { decodeManifest, encodeManifest, MANIFEST_TITLE } from './manifest'
import { inlineMd, notionUrl, pageTag, toggle } from './md'
import { KEY } from './keys'
import { buildSite } from './site'
import { syncSite } from './sync'
import type { ExtraPage, Locale, NotionApi, SiteInput } from './types'

type Io = { out(line: string): void; err(line: string): void }
type Deps = { api?: NotionApi; input?: SiteInput; sha?: string; date?: string }
const defaultIo: Io = { out: (line) => console.log(line), err: (line) => console.error(line) }
const textOf = (error: unknown) => error instanceof Error ? error.message : String(error)

export async function loadSiteInput(packDir: string): Promise<SiteInput> {
  const pack = basename(packDir)
  const configPath = join(packDir, 'notion-kb.config.ts')
  if (!existsSync(configPath)) throw new Error(`pack ${pack} без notion-kb.config.ts`)
  const course = (await import(pathToFileURL(join(packDir, 'course.config.ts')).href)).COURSE as { domain: string; description: { ru: string; en: string } }
  const kb = (await import(pathToFileURL(configPath).href)).NOTION_KB
  const concepts = (await import(pathToFileURL(join(packDir, 'concepts.ts')).href)).CONCEPTS
  const locales = ['ru', 'en'] as const
  const modules = Object.fromEntries(locales.map((locale) => [locale, getAllModules(locale)])) as Record<Locale, ReturnType<typeof getAllModules>>
  const unitMdx = (locale: Locale, module: string, unit: string) => getUnitContent(module, unit, locale).content.replace(/\r\n/g, '\n')
  const pageMdx = (locale: Locale, name: ExtraPage) => { const page = getPageContent(name, locale); return { title: page.meta.title, content: page.content.replace(/\r\n/g, '\n') } }
  return { domain: course.domain, description: course.description, config: kb, modules, unitMdx, pageMdx, concepts }
}

function argValue(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag)
  return index >= 0 ? argv[index + 1] : undefined
}

function stampedSha(deps: Deps, env: Record<string, string | undefined>): string {
  if (deps.sha) return deps.sha
  if (env.GITHUB_SHA) return env.GITHUB_SHA
  return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', timeout: 10000 }).trim()
}

function stampedDate(deps: Deps, sha: string): string {
  if (deps.date) return deps.date
  return execFileSync('git', ['show', '-s', '--format=%cs', sha], { encoding: 'utf8', timeout: 10000 }).trim()
}

function smokeMarkdown(pageUrl: string, child1: string, child2: string): string {
  return [
    toggle('Обычная раскрывашка', `Вложенная: ${toggle('Вложенная', 'Текст')}`),
    '<callout icon="🧪">Smoke callout</callout>',
    pageTag(notionUrl(child2), 'child 2'), pageTag(notionUrl(child1), 'child 1'),
    '| a | b |\n|---|---|\n| x \\| y | z |',
    '```\nвнутри ``` кода\n```',
    'Абзац ' + 'x'.repeat(2500), '```\n' + 'y'.repeat(2500) + '\n```',
    '\\<b>', '[текстовая ссылка](https://example.com#anchor)', `[сама страница](${pageUrl}#anchor)`,
    '<table-of-contents />', '#### Четвёртый уровень',
    inlineMd('Цена ~$20, сноска [1], адрес https://example.com, Q&A'),
    toggle('Абзац последним — без пустой строки', 'Текст абзаца.'),
    toggle('Абзац последним — с пустой строкой', 'Текст абзаца.\n'),
  ].join('\n\n')
}

export { smokeMarkdown }

async function siteInput(deps: Deps): Promise<SiteInput> {
  return deps.input ?? loadSiteInput(join(process.cwd(), 'packs', PACK_SLUG))
}

async function runCheck(input: SiteInput, outDir: string | undefined, io: Io): Promise<number> {
  const errors = checkContent(input)
  if (!errors.length && outDir) {
    mkdirSync(outDir, { recursive: true })
    for (const page of buildSite(input)) {
      const pages = buildSite(input)
      const links = { page: (key: string) => pages.some((item) => item.key === key) ? `https://www.notion.so/${key}` : null, anchor: () => null }
      writeFileSync(join(outDir, `${page.key.replaceAll('/', '__')}.md`), page.markdown(links), 'utf8')
    }
  }
  if (errors.length) { for (const error of errors) io.err(error); return 1 }
  io.out(`check: ошибок 0, страниц ${buildSite(input).length}`)
  return 0
}

async function runStatus(input: SiteInput, api: NotionApi, io: Io): Promise<number> {
  if (!input.config.servicePageId) { for (const page of await api.searchPages()) io.out(`${page.title} · ${page.id}`); return 0 }
  const children = await api.listChildren(input.config.servicePageId)
  const manifestChild = children.find((child) => child.type === 'child_page' && child.text === MANIFEST_TITLE)
  if (!manifestChild) { io.err('ОШИБКА: манифест не найден'); return 1 }
  const manifestResult = await api.getMarkdown(manifestChild.id)
  if (manifestResult.truncated) { io.err('ОШИБКА: манифест обрезан'); return 1 }
  const manifest = decodeManifest(manifestResult.markdown)
  const root = manifest.pages[KEY.root]
  if (!root) { io.err('ОШИБКА: корень не найден'); return 1 }
  const page = await api.getPage(root.id)
  const markdown = await api.getMarkdown(root.id)
  const lines = markdown.markdown.split('\n').map((line) => line.trim()).filter(Boolean)
  io.out(`корень: ${page.publicUrl ?? 'не опубликован'}`)
  io.out(`штамп: ${lines.at(-1) ?? ''}`)
  io.out(`страниц в манифесте: ${Object.keys(manifest.pages).length}`)
  return 0
}

async function runSmoke(input: SiteInput, api: NotionApi, outDir: string, io: Io): Promise<number> {
  let smokeId: string | undefined
  try {
    if (!input.config.servicePageId) throw new Error('servicePageId не задан')
    smokeId = (await api.createPage(input.config.servicePageId, 'notion-kb · smoke')).id
    const child1 = (await api.createPage(smokeId, 'smoke child 1')).id
    const child2 = (await api.createPage(smokeId, 'smoke child 2')).id
    const pageUrl = notionUrl(smokeId)
    const sent = smokeMarkdown(pageUrl, child1, child2)
    await api.replaceMarkdown(smokeId, sent)
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'smoke.sent.md'), sent, 'utf8')
    const read = await api.getMarkdown(smokeId)
    writeFileSync(join(outDir, 'smoke.read.md'), read.markdown, 'utf8')
    try {
      await api.replaceMarkdown(smokeId, `${pageTag(notionUrl(child1), 'child 1')}\n\nprobe`)
      if (!(await api.getPage(child2)).inTrash) throw new Error('Notion принял запись без тега живого ребёнка — защита ручных подстраниц не работает')
    } catch (error) {
      if (!(error instanceof NotionError) || error.status < 400 || error.status > 499) throw error
    }
    const probe = { v: 1 as const, pages: Object.fromEntries(Array.from({ length: 600 }, (_, i) => [`ru/u/m${i}/u${i}`, { id: i.toString(16).padStart(32, '0'), p: 'ru/book', th: i.toString(16).padStart(16, '0'), ch: i.toString(16).padStart(16, '0') }])), anchors: {} }
    const encoded = encodeManifest(probe)
    await api.replaceMarkdown(child1, encoded)
    const got = await api.getMarkdown(child1)
    if (got.truncated || JSON.stringify(decodeManifest(got.markdown)) !== JSON.stringify(probe)) throw new Error(`smoke: манифест ${(encoded.length / 1024).toFixed(1)} КБ прочитан не целиком`)
    io.out('smoke: пробы пройдены')
    return 0
  } catch (error) {
    io.err(`ОШИБКА: ${textOf(error)}`)
    return 1
  } finally {
    if (smokeId) { try { await api.trashPage(smokeId) } catch (error) { io.err(`ОШИБКА: ${textOf(error)}`) } }
  }
}

export async function main(argv: string[], env: Record<string, string | undefined>, io: Io = defaultIo, deps: Deps = {}): Promise<number> {
  const command = argv[0]
  if (!['check', 'sync', 'status', 'smoke'].includes(command)) { io.err('usage: node scripts/notion-kb.ts <check|sync|status|smoke>'); return 2 }
  try {
    const input = await siteInput(deps)
    if (command === 'check') return runCheck(input, argValue(argv, '--out'), io)
    const token = env.NOTION_KB_TOKEN?.trim()
    if (!token) { io.err('ОШИБКА: NOTION_KB_TOKEN не задан'); return 1 }
    const api = deps.api ?? createNotionClient({ token })
    if (command === 'status') return runStatus(input, api, io)
    if (!input.config.servicePageId) { io.err(`ОШИБКА: servicePageId не задан в packs/${PACK_SLUG}/notion-kb.config.ts`); return 1 }
    const only = argValue(argv, '--only')
    if (only && !input.modules.ru.some((module) => module.slug === only)) { io.err(`ОШИБКА: --only: модуль «${only}» не найден (есть: ${input.modules.ru.map((module) => module.slug).join(', ')})`); return 2 }
    if (command === 'smoke') { const out = argValue(argv, '--out'); if (!out) throw new Error('smoke требует --out <dir>'); return runSmoke(input, api, out, io) }
    const checked = checkContent({ ...input, only })
    if (checked.length) { checked.forEach((error) => io.err(error)); return 1 }
    const sha = stampedSha(deps, env)
    const date = stampedDate(deps, sha)
    const pages = buildSite({ ...input, only })
    const report = await syncSite(api, pages, input.concepts, input.config.servicePageId, { sha, date, only, log: (line) => io.out(line) })
    report.anchorMisses.forEach((miss) => io.err(`ВНИМАНИЕ: якорь не найден: ${miss}`))
    io.out(`создано ${report.created} · принято ${report.adopted} · обновлено ${report.updated} · переименовано ${report.retitled} · в корзину ${report.trashed} · без изменений ${report.unchanged}`)
    return 0
  } catch (error) {
    const token = env.NOTION_KB_TOKEN?.trim()
    const raw = textOf(error)
    io.err(`ОШИБКА: ${token ? raw.split(token).join('***') : raw}`)
    return 1
  }
}
