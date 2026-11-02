import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getAllModules, getPageContent, getUnitContent } from '../content'
import { PACK_SLUG } from '../pack'
import { checkContent } from './check'
import { createNotionClient, NotionError } from './client'
import { decodeManifest, encodeManifest, MANIFEST_TITLE } from './manifest'
import type { Manifest } from './manifest'
import { callout, inlineMd, notionUrl, pageTag, parseMarkdown, TABLE_OF_CONTENTS, toggle, toNotionMarkdown } from './md'
import { KEY } from './keys'
import { buildSite, fakeResolver } from './site'
import { syncSite } from './sync'
import type { ExtraPage, Locale, NotionApi, SiteInput } from './types'

type Io = { out(line: string): void; err(line: string): void }
type Deps = { api?: NotionApi; input?: SiteInput; sha?: string; date?: string }
type Args = { command: string; out?: string; only?: string }

const USAGE = 'usage: node scripts/notion-kb.ts check [--out <dir>] | sync [--only <модуль>] | status | smoke --out <dir>'
const FLAGS = new Map<string, readonly string[]>([
  ['check', ['--out']],
  ['sync', ['--only']],
  ['status', []],
  ['smoke', ['--out']],
])
const SMOKE_TITLE = 'notion-kb · smoke'
const SMOKE_CHILD_1 = 'smoke child 1'
const SMOKE_CHILD_2 = 'smoke child 2'
const SMOKE_MANIFEST = 'manifest probe'
const CHILD_GUARD_BROKEN = 'smoke: Notion принял запись без тега живого ребёнка — защита ручных подстраниц не работает'
const defaultIo: Io = { out: (line) => console.log(line), err: (line) => console.error(line) }

function textOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

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
  const pageMdx = (locale: Locale, name: ExtraPage) => {
    const page = getPageContent(name, locale)
    return { title: page.meta.title, content: page.content.replace(/\r\n/g, '\n') }
  }
  return { domain: course.domain, description: course.description, config: kb, modules, unitMdx, pageMdx, concepts }
}

// Вызов разбирается строго: флаг чужой команды, `--only=…`, лишнее слово, флаг без значения или его повтор —
// ошибка вызова (usage и 2), а не «флага нет»: иначе опечатка молча превратила бы `sync --only` в синхронизацию всего курса.
function parseArgs(argv: string[]): Args | null {
  const [command, ...rest] = argv
  const allowed = FLAGS.get(command)
  if (!allowed) return null
  const args: Args = { command }
  for (let i = 0; i < rest.length; i += 2) {
    const flag = rest[i]
    const value = rest[i + 1]
    if (!allowed.includes(flag) || !value || value.startsWith('--')) return null
    const key = flag === '--out' ? 'out' : 'only'
    if (args[key] !== undefined) return null
    args[key] = value
  }
  if (command === 'smoke' && !args.out) return null
  return args
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

// Формы — те, что шлёт генератор: помощники md.ts и сериализатор toNotionMarkdown. Task 11 сверяет их с прочитанным.
function smokeMarkdown(pageUrl: string, child1: string, child2: string): string {
  return [
    toggle('Обычная раскрывашка', `Текст снаружи вложенной.\n\n${toggle('Вложенная раскрывашка', 'Текст внутри вложенной.')}`),
    callout('🧪', 'Smoke callout.\n\nВторой абзац callout.'),
    pageTag(notionUrl(child2), SMOKE_CHILD_2),
    pageTag(notionUrl(child1), SMOKE_CHILD_1),
    toNotionMarkdown(parseMarkdown('| a | b |\n|---|---|\n| x \\| y | z |')),
    toNotionMarkdown(parseMarkdown('````\nвнутри ``` кода\n````')),
    `Абзац ${'x'.repeat(2500)}`,
    toNotionMarkdown(parseMarkdown(`\`\`\`\n${'y'.repeat(2500)}\n\`\`\``)),
    '\\<b>',
    '[текстовая ссылка](https://example.com#anchor)',
    `[сама страница](${pageUrl}#anchor)`,
    TABLE_OF_CONTENTS,
    '#### Четвёртый уровень',
    inlineMd('Цена ~$20, сноска [1], адрес https://example.com, Q&A'),
    toggle('Абзац последним — без пустой строки', 'Текст абзаца.'),
    toggle('Абзац последним — с пустой строкой', 'Текст абзаца.\n'),
  ].join('\n\n')
}

export { smokeMarkdown }

async function siteInput(deps: Deps): Promise<SiteInput> {
  return deps.input ?? loadSiteInput(join(process.cwd(), 'packs', PACK_SLUG))
}

function runCheck(input: SiteInput, outDir: string | undefined, io: Io): number {
  const errors = checkContent(input)
  if (errors.length) {
    for (const error of errors) io.err(error)
    return 1
  }
  const pages = buildSite(input)
  if (outDir) {
    mkdirSync(outDir, { recursive: true })
    const links = fakeResolver(pages)
    for (const page of pages) writeFileSync(join(outDir, `${page.key.replaceAll('/', '__')}.md`), page.markdown(links), 'utf8')
  }
  io.out(`check: ошибок 0, страниц ${pages.length}`)
  return 0
}

async function runStatus(input: SiteInput, api: NotionApi, io: Io): Promise<number> {
  const serviceId = input.config.servicePageId
  if (!serviceId) {
    for (const page of await api.searchPages()) io.out(`${page.title} · ${page.id}`)
    return 0
  }
  const manifestChild = (await api.listChildren(serviceId)).find((child) => child.type === 'child_page' && child.text === MANIFEST_TITLE)
  if (!manifestChild) {
    io.err('ОШИБКА: манифест не найден')
    return 1
  }
  const stored = await api.getMarkdown(manifestChild.id)
  if (stored.truncated) {
    io.err('ОШИБКА: манифест обрезан')
    return 1
  }
  const manifest = decodeManifest(stored.markdown)
  const root = manifest.pages[KEY.root]
  if (!root) {
    io.err('ОШИБКА: корень не найден')
    return 1
  }
  const page = await api.getPage(root.id)
  const lines = (await api.getMarkdown(root.id)).markdown.split('\n').map((line) => line.trim()).filter(Boolean)
  io.out(`корень: ${page.publicUrl ?? 'не опубликован'}`)
  io.out(`штамп: ${lines.at(-1) ?? ''}`)
  io.out(`страниц в манифесте: ${Object.keys(manifest.pages).length}`)
  return 0
}

// Отказ защиты — ответ 400 validation_error: так план моделирует запись без тега живого ребёнка (FakeNotion).
// Лимит блоков отказом защиты не бывает ни в какой форме: у клиента он 403 restricted_resource с признаком blockLimit.
function isChildGuardRefusal(error: unknown): error is NotionError {
  return error instanceof NotionError && !error.blockLimit && error.status === 400 && error.code === 'validation_error'
}

// Проба 1: запись без тега живого ребёнка Notion обязан отклонить отказом защиты, а ребёнок — остаться живым.
// На этом отказе держится защита ручных подстраниц владельца: syncSite не ищет чужих детей перед записью.
// Иной ответ (409, 429, лимит блоков, 5xx) пробу не подтверждает: smoke останавливается и называет, что пришло.
async function probeChildGuard(api: NotionApi, smokeId: string, child1: string, child2: string, io: Io): Promise<boolean> {
  let refused: NotionError | null = null
  try {
    await api.replaceMarkdown(smokeId, `${pageTag(notionUrl(child1), SMOKE_CHILD_1)}\n\nprobe`)
  } catch (error) {
    if (!isChildGuardRefusal(error)) {
      const answer = error instanceof NotionError ? `Notion ответил ${error.status} ${error.code}` : 'сбой до ответа Notion'
      io.err(`ОШИБКА: smoke: проба 1 не состоялась — ${answer}, а отказ защиты — 400 validation_error`)
      throw error
    }
    refused = error
  }
  if (!refused) {
    io.err(`ОШИБКА: ${CHILD_GUARD_BROKEN}`)
    return false
  }
  if ((await api.getPage(child2)).inTrash) {
    io.err(`ОШИБКА: ${CHILD_GUARD_BROKEN} (ответ ${refused.status}, но «${SMOKE_CHILD_2}» в корзине)`)
    return false
  }
  io.out(`smoke: запись без тега живого ребёнка отклонена (${refused.status} ${refused.code}: ${refused.message}), ребёнок жив`)
  return true
}

function syntheticManifest(entries: number): Manifest {
  const pages: Manifest['pages'] = {}
  for (let i = 0; i < entries; i += 1) {
    pages[`ru/u/m${i}/u${i}`] = { id: i.toString(16).padStart(32, '0'), p: 'ru/book', th: i.toString(16).padStart(16, '0'), ch: i.toString(16).padStart(16, '0') }
  }
  return { v: 1, pages, anchors: {} }
}

// Проба 2: манифест на 600 страниц (≈ 70 КБ) в отдельном ребёнке читается обратно целиком.
async function probeManifest(api: NotionApi, smokeId: string, io: Io): Promise<boolean> {
  const probeId = (await api.createPage(smokeId, SMOKE_MANIFEST)).id
  const manifest = syntheticManifest(600)
  const encoded = encodeManifest(manifest)
  const size = `${(Buffer.byteLength(encoded, 'utf8') / 1024).toFixed(1)} КБ`
  io.out(`smoke: синтетический манифест — ${size}`)
  await api.replaceMarkdown(probeId, encoded)
  const got = await api.getMarkdown(probeId)
  let whole = false
  let why = got.truncated ? 'ответ обрезан' : ''
  if (!got.truncated) {
    try {
      whole = JSON.stringify(decodeManifest(got.markdown)) === JSON.stringify(manifest)
      if (!whole) why = 'прочитанное не равно отправленному'
    } catch (error) {
      why = textOf(error)
    }
  }
  if (!whole) {
    io.err(`ОШИБКА: smoke: манифест ${size} прочитан не целиком (${why})`)
    return false
  }
  io.out(`smoke: манифест ${size} прочитан целиком`)
  return true
}

async function runSmoke(api: NotionApi, serviceId: string, outDir: string, io: Io): Promise<number> {
  // Каталог — до первой записи в Notion: `--out` в путь, занятый файлом, падает, не создав ни одной страницы.
  mkdirSync(outDir, { recursive: true })
  let smokeId: string | undefined
  let code = 1
  try {
    smokeId = (await api.createPage(serviceId, SMOKE_TITLE)).id
    const child1 = (await api.createPage(smokeId, SMOKE_CHILD_1)).id
    const child2 = (await api.createPage(smokeId, SMOKE_CHILD_2)).id
    const sent = smokeMarkdown(notionUrl(smokeId), child1, child2)
    writeFileSync(join(outDir, 'smoke.sent.md'), sent, 'utf8')
    await api.replaceMarkdown(smokeId, sent)
    const read = await api.getMarkdown(smokeId)
    writeFileSync(join(outDir, 'smoke.read.md'), read.markdown, 'utf8')
    const guard = await probeChildGuard(api, smokeId, child1, child2, io)
    const manifest = await probeManifest(api, smokeId, io)
    if (guard && manifest) {
      io.out('smoke: пробы пройдены')
      code = 0
    }
  } finally {
    if (smokeId) {
      try {
        await api.trashPage(smokeId)
      } catch (error) {
        io.err(`ОШИБКА: smoke: страница не ушла в корзину: ${textOf(error)}`)
        code = 1
      }
    }
  }
  return code
}

export async function main(argv: string[], env: Record<string, string | undefined>, io: Io = defaultIo, deps: Deps = {}): Promise<number> {
  const token = env.NOTION_KB_TOKEN?.trim()
  const mask = (line: string) => (token ? line.split(token).join('***') : line)
  // Каждая строка вывода идёт через маску токена, включая ошибки проб smoke и текст пойманных исключений.
  const safe: Io = { out: (line) => io.out(mask(line)), err: (line) => io.err(mask(line)) }
  const args = parseArgs(argv)
  if (!args) {
    safe.err(USAGE)
    return 2
  }
  try {
    const input = await siteInput(deps)
    if (args.command === 'check') return runCheck(input, args.out, safe)
    if (!token) {
      safe.err('ОШИБКА: NOTION_KB_TOKEN не задан')
      return 1
    }
    const api = deps.api ?? createNotionClient({ token })
    if (args.command === 'status') return await runStatus(input, api, safe)
    const serviceId = input.config.servicePageId
    if (!serviceId) {
      safe.err(`ОШИБКА: servicePageId не задан в packs/${PACK_SLUG}/notion-kb.config.ts`)
      return 1
    }
    if (args.command === 'smoke') return await runSmoke(api, serviceId, args.out ?? '', safe)
    const only = args.only
    if (only && !input.modules.ru.some((module) => module.slug === only)) {
      safe.err(`ОШИБКА: --only: модуль «${only}» не найден (есть: ${input.modules.ru.map((module) => module.slug).join(', ')})`)
      return 2
    }
    const checked = checkContent({ ...input, only })
    if (checked.length) {
      for (const error of checked) safe.err(error)
      return 1
    }
    const sha = stampedSha(deps, env)
    const date = stampedDate(deps, sha)
    const pages = buildSite({ ...input, only })
    const report = await syncSite(api, pages, input.concepts, serviceId, { sha, date, only, log: (line) => safe.out(line) })
    for (const miss of report.anchorMisses) safe.err(`ВНИМАНИЕ: якорь не найден: ${miss}`)
    safe.out(`создано ${report.created} · принято ${report.adopted} · обновлено ${report.updated} · переименовано ${report.retitled} · в корзину ${report.trashed} · без изменений ${report.unchanged}`)
    return 0
  } catch (error) {
    safe.err(`ОШИБКА: ${textOf(error)}`)
    return 1
  }
}
